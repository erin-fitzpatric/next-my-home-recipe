import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { ShoppingCart } from '@/models/ShoppingCart';

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Find the user's cart and remove all completed items
    const cart = await ShoppingCart.findOneAndUpdate(
      { userId: session.user.id },
      { 
        $pull: { 
          items: { completed: true } 
        } 
      },
      { new: true }
    );

    if (!cart) {
      return NextResponse.json({ message: 'No cart found' });
    }

    return NextResponse.json({ message: 'Completed items cleared' });
  } catch (error) {
    console.error('Error clearing completed items:', error);
    return NextResponse.json(
      { error: 'Failed to clear completed items' },
      { status: 500 }
    );
  }
}
