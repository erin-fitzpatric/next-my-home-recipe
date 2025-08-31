import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { Recipe } from '@/models/Recipe';
import { ShoppingCart } from '@/models/ShoppingCart';

export async function GET(
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
    
    const recipe = await Recipe.findOne({ 
      _id: id, 
      userId: session.user.id 
    }).lean();

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = await params;
    
    await dbConnect();
    
    const recipe = await Recipe.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { ...body, updatedAt: new Date() },
      { new: true }
    );

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Check if this recipe is in the user's shopping cart and update it
    try {
      const cart = await ShoppingCart.findOne({ userId: session.user.id });
      
      if (cart) {
        const recipeInCart = cart.items.some((item: any) => item.recipeId === id);
        
        if (recipeInCart && recipe.ingredients) {
          // Recipe is in cart, update the cart items
          const existingItems = cart.items.filter((item: any) => item.recipeId === id);
          
          // Smart merge: preserve completion status for matching ingredients
          const existingItemsMap = new Map();
          existingItems.forEach((item: any) => {
            existingItemsMap.set(item.ingredient.toLowerCase(), item);
          });

          // Remove old items for this recipe
          cart.items = cart.items.filter((item: any) => item.recipeId !== id);

          // Add updated ingredients
          const updatedIngredients = recipe.ingredients.map((ingredient: any) => {
            const existingItem = existingItemsMap.get(ingredient.displayText.toLowerCase());
            
            return {
              recipeId: id,
              recipeTitle: recipe.title,
              ingredient: ingredient.displayText,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              completed: existingItem ? existingItem.completed : false, // Preserve completion status
              addedAt: existingItem ? existingItem.addedAt : new Date(),
            };
          });

          cart.items.push(...updatedIngredients);
          await cart.save();
        }
      }
    } catch (cartError) {
      console.error('Error updating cart after recipe edit:', cartError);
      // Don't fail the recipe update if cart update fails
    }
    
    return NextResponse.json({
      ...recipe.toObject(),
      cartUpdated: true // Indicate that cart was checked/updated
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to update recipe' },
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
    
    const recipe = await Recipe.findOneAndDelete({ 
      _id: id, 
      userId: session.user.id 
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}
