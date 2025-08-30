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
    await ShoppingCart.deleteMany({ 
      userId: session.user.id,
      completed: true 
    });

    return NextResponse.json({ message: 'Completed items cleared' });
  } catch (error) {
    console.error('Error clearing completed items:', error);
    return NextResponse.json(
      { error: 'Failed to clear completed items' },
      { status: 500 }
    );
  }
}
