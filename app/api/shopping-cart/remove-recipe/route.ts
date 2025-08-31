import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { ShoppingCart } from '@/models/ShoppingCart';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipeId } = await request.json();
    
    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    
    const cart = await ShoppingCart.findOne({ userId: session.user.id });
    
    if (!cart) {
      return NextResponse.json(
        { error: 'Shopping cart not found' },
        { status: 404 }
      );
    }

    // Remove all items that match the recipeId
    cart.items = cart.items.filter((item: any) => item.recipeId !== recipeId);
    
    await cart.save();

    return NextResponse.json({
      message: 'Recipe ingredients removed from shopping cart',
      itemsCount: cart.items.length
    });

  } catch (error) {
    console.error('Error removing recipe from shopping cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove recipe from shopping cart' },
      { status: 500 }
    );
  }
}
