'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { RecipeForm } from '@/components/recipe-form';
import { Recipe, RecipeFormData } from '@/lib/recipe-constants';
import { toast } from 'sonner';

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recipeId = params.id as string;

  useEffect(() => {
    if (recipeId && session?.user?.id) {
      fetchRecipe();
    }
  }, [recipeId, session?.user?.id]);

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (response.ok) {
        const data = await response.json();
        setRecipe(data);
      } else {
        setError('Recipe not found');
      }
    } catch (err) {
      setError('Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: RecipeFormData) => {
    try {
      // Transform instructions from objects to strings for API
      const transformedData = {
        ...data,
        instructions: data.instructions.map(instruction => instruction.step)
      };

      const response = await fetch(`/api/recipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedData),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Show success toast
        toast.success('Recipe updated successfully!');
        
        // Check if shopping cart was updated
        if (result.cartUpdated) {
          // Additional check to see if recipe was actually in cart
          try {
            const cartResponse = await fetch('/api/shopping-cart');
            if (cartResponse.ok) {
              const cartItems = await cartResponse.json();
              const recipeInCart = cartItems.some((item: any) => item.recipeId === recipeId);
              
              if (recipeInCart) {
                toast.success('Shopping cart updated with new ingredients!', {
                  description: 'Completed items were preserved where possible.'
                });
              }
            }
          } catch (cartError) {
            console.error('Error checking cart status:', cartError);
          }
        }
        
        router.push(`/recipe/${recipeId}`);
      } else {
        const error = await response.json();
        toast.error('Failed to update recipe');
        throw new Error(error.message || 'Failed to update recipe');
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error('Failed to update recipe');
    }
  };

  if (!session) {
    router.push('/auth/signin');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The recipe you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <RecipeForm 
      mode="edit" 
      initialData={recipe}
      onSubmit={handleSubmit} 
    />
  );
}
