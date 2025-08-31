import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { ShoppingCart } from '@/models/ShoppingCart';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ingredient, quantity, unit } = body;

    // Validate input
    if (!ingredient || !quantity || !unit) {
      return NextResponse.json(
        { error: 'Ingredient, quantity, and unit are required' },
        { status: 400 }
      );
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be a positive number' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find or create the user's shopping cart
    let cart = await ShoppingCart.findOne({ userId: session.user.id });
    
    if (!cart) {
      cart = new ShoppingCart({
        userId: session.user.id,
        items: []
      });
    }

    // Create new item for individual ingredient (manual addition)
    const newItem = {
      ingredient: ingredient.trim(),
      quantity: quantity,
      unit: unit,
      completed: false,
      addedAt: new Date(),
      // Tag this as a manual addition
      recipeTitle: 'Manual Addition',
      // No recipeId for individual items
    };

    // Add new item to the cart
    cart.items.push(newItem);
    
    // Save the cart
    await cart.save();

    return NextResponse.json({ 
      message: 'Item added to cart successfully',
      item: newItem
    });
  } catch (error) {
    console.error('Error adding individual item to shopping cart:', error);
    return NextResponse.json(
      { error: 'Failed to add item to shopping cart' },
      { status: 500 }
    );
  }
}
