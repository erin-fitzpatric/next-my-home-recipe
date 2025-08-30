import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { ShoppingCart } from '@/models/ShoppingCart';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    await dbConnect();
    
    // Find the user's cart and update the specific item
    const cart = await ShoppingCart.findOneAndUpdate(
      { 
        userId: session.user.id,
        'items._id': id 
      },
      { 
        $set: {
          'items.$.completed': body.completed,
          'items.$.quantity': body.quantity || undefined,
          'items.$.unit': body.unit || undefined,
        }
      },
      { new: true }
    );

    if (!cart) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Find and return the updated item
    const updatedItem = cart.items.find((item: any) => item._id.toString() === id);
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating shopping cart item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();
    
    // Find the user's cart and remove the specific item
    const cart = await ShoppingCart.findOneAndUpdate(
      { userId: session.user.id },
      { 
        $pull: { 
          items: { _id: id } 
        } 
      },
      { new: true }
    );

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing shopping cart item:', error);
    return NextResponse.json(
      { error: 'Failed to remove item' },
      { status: 500 }
    );
  }
}
