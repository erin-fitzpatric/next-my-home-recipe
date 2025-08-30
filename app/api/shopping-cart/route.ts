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
    const items = await ShoppingCart.find({
      userId: session.user.id
    }).sort({ createdAt: -1 });

    return NextResponse.json(items);
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

    // Create shopping cart items from recipe ingredients
    const items = ingredients.map((ingredient: { displayText: string; quantity: number; unit: string }) => ({
      userId: session.user.id,
      recipeId,
      recipeTitle,
      ingredient: ingredient.displayText,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      completed: false,
    }));

    const createdItems = await ShoppingCart.insertMany(items);
    return NextResponse.json(createdItems);
  } catch (error) {
    console.error('Error adding to shopping cart:', error);
    return NextResponse.json(
      { error: 'Failed to add to shopping cart' },
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
    await ShoppingCart.deleteMany({ userId: session.user.id });

    return NextResponse.json({ message: 'Shopping cart cleared' });
  } catch (error) {
    console.error('Error clearing shopping cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear shopping cart' },
      { status: 500 }
    );
  }
}
