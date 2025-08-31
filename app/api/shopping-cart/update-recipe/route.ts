import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { ShoppingCart, type IShoppingCartItem } from '@/models/ShoppingCart';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipeId, recipeTitle, newIngredients } = await request.json();
    
    if (!recipeId || !newIngredients || !Array.isArray(newIngredients)) {
      return NextResponse.json(
        { error: 'Recipe ID and ingredients are required' },
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

    // Find existing items for this recipe
    const existingItems = cart.items.filter((item: IShoppingCartItem) => item.recipeId === recipeId);
    
    if (existingItems.length === 0) {
      return NextResponse.json(
        { error: 'Recipe not found in cart' },
        { status: 404 }
      );
    }

    // Smart merge: compare old vs new ingredients
    const updatedItems: IShoppingCartItem[] = [];
    const addedItems: Partial<IShoppingCartItem>[] = [];

    // Create a map of existing items by ingredient name for easy lookup
    const existingItemsMap = new Map();
    existingItems.forEach((item: IShoppingCartItem) => {
      existingItemsMap.set(item.ingredient.toLowerCase(), item);
    });

    // Process new ingredients
    for (const newIngredient of newIngredients) {
      const ingredientKey = newIngredient.displayText.toLowerCase();
      const existingItem = existingItemsMap.get(ingredientKey);

      if (existingItem) {
        // Update existing ingredient, preserve completion status
        updatedItems.push({
          _id: existingItem._id,
          recipeId: recipeId,
          recipeTitle: recipeTitle,
          ingredient: newIngredient.displayText,
          quantity: newIngredient.quantity,
          unit: newIngredient.unit,
          completed: existingItem.completed, // Preserve completion status
          addedAt: existingItem.addedAt,
        });
        existingItemsMap.delete(ingredientKey); // Mark as processed
      } else {
        // Add new ingredient
        const newItem = {
          recipeId: recipeId,
          recipeTitle: recipeTitle,
          ingredient: newIngredient.displayText,
          quantity: newIngredient.quantity,
          unit: newIngredient.unit,
          completed: false,
          addedAt: new Date(),
        };
        addedItems.push(newItem);
      }
    }

    // Remove old items for this recipe
    cart.items = cart.items.filter((item: IShoppingCartItem) => item.recipeId !== recipeId);

    // Add updated and new items
    cart.items.push(...updatedItems, ...addedItems);

    await cart.save();

    // Calculate what changed for user feedback
    const preservedCount = updatedItems.filter((item: IShoppingCartItem) => 
      existingItems.some((existing: IShoppingCartItem) => 
        existing.ingredient.toLowerCase() === item.ingredient.toLowerCase() && 
        existing.completed
      )
    ).length;

    const removedCount = existingItems.length - updatedItems.length;

    return NextResponse.json({
      message: 'Cart updated successfully',
      updated: updatedItems.length,
      added: addedItems.length,
      removed: removedCount,
      preservedCompleted: preservedCount,
      totalItems: cart.items.length
    });

  } catch (error) {
    console.error('Error updating cart items:', error);
    return NextResponse.json(
      { error: 'Failed to update cart items' },
      { status: 500 }
    );
  }
}
