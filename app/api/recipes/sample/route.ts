import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import { Recipe } from '@/models/Recipe';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Create a sample recipe for testing
    const sampleRecipe = {
      title: "Classic Spaghetti Carbonara",
      description: "A traditional Italian pasta dish with eggs, cheese, and pancetta.",
      instructions: [
        "Bring a large pot of salted water to boil",
        "Cook spaghetti according to package directions until al dente",
        "While pasta cooks, heat a large skillet over medium heat",
        "Add pancetta and cook until crispy, about 5 minutes",
        "In a bowl, whisk together eggs, Parmesan cheese, and black pepper",
        "Drain pasta, reserving 1 cup pasta water",
        "Add hot pasta to skillet with pancetta",
        "Remove from heat and quickly stir in egg mixture",
        "Add pasta water as needed to create a creamy sauce",
        "Serve immediately with extra Parmesan"
      ],
      ingredients: [
        {
          ingredientId: "507f1f77bcf86cd799439011", // Placeholder ID
          quantity: 1,
          unit: "lb",
          displayText: "1 lb spaghetti pasta",
          notes: ""
        },
        {
          ingredientId: "507f1f77bcf86cd799439012", // Placeholder ID
          quantity: 4,
          unit: "oz",
          displayText: "4 oz pancetta",
          notes: "diced"
        },
        {
          ingredientId: "507f1f77bcf86cd799439013", // Placeholder ID
          quantity: 3,
          unit: "large",
          displayText: "3 large eggs",
          notes: ""
        },
        {
          ingredientId: "507f1f77bcf86cd799439014", // Placeholder ID
          quantity: 1,
          unit: "cup",
          displayText: "1 cup grated Parmesan cheese",
          notes: "plus extra for serving"
        }
      ],
      cookTime: 15,
      prepTime: 10,
      servings: 4,
      tags: ["pasta", "italian", "dinner", "quick"],
      userId: session.user.id,
      difficulty: "easy" as const
    };
    
    const recipe = new Recipe(sampleRecipe);
    await recipe.save();
    
    return NextResponse.json({ 
      message: 'Sample recipe created successfully',
      recipe 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating sample recipe:', error);
    return NextResponse.json(
      { error: 'Failed to create sample recipe' },
      { status: 500 }
    );
  }
}
