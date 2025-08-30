import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { ShoppingCart } from '@/models/ShoppingCart';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Find the user's shopping cart
    let cart = await ShoppingCart.findOne({ userId: session.user.id });
    
    // If no cart exists, return empty array
    if (!cart) {
      return NextResponse.json([]);
    }

    // Return the items array from the cart
    return NextResponse.json(cart.items || []);
  } catch (error) {
    console.error('Error fetching shopping cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shopping cart' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipeId, recipeTitle, ingredients } = body;

    await dbConnect();

    // Find or create the user's shopping cart
    let cart = await ShoppingCart.findOne({ userId: session.user.id });
    
    if (!cart) {
      cart = new ShoppingCart({
        userId: session.user.id,
        items: []
      });
    }

    // Create new items from recipe ingredients
    const newItems = ingredients.map((ingredient: { displayText: string; quantity: number; unit: string }) => ({
      recipeId,
      recipeTitle,
      ingredient: ingredient.displayText,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      completed: false,
      addedAt: new Date(),
    }));

    // Add new items to the cart
    cart.items.push(...newItems);
    
    // Save the cart
    await cart.save();

    return NextResponse.json({ 
      message: `Added ${newItems.length} items to cart`,
      itemsAdded: newItems.length 
    });
  } catch (error) {
    console.error('Error adding to shopping cart:', error);
    return NextResponse.json(
      { error: 'Failed to add items to shopping cart' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Find and clear the user's cart
    const cart = await ShoppingCart.findOne({ userId: session.user.id });
    
    if (!cart) {
      return NextResponse.json({ message: 'Cart already empty' });
    }

    cart.items = [];
    await cart.save();

    return NextResponse.json({ message: 'Shopping cart cleared' });
  } catch (error) {
    console.error('Error clearing shopping cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear shopping cart' },
      { status: 500 }
    );
  }
}
