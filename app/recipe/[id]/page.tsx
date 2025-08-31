'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Users, ChefHat, Edit, Trash2, ShoppingCart } from 'lucide-react';

interface Recipe {
  _id: string;
  title: string;
  description: string;
  cookTime: number;
  prepTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  ingredients: Array<{
    quantity: number;
    unit: string;
    displayText: string;
    notes?: string;
  }>;
  instructions: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const recipeId = params.id as string;

  useEffect(() => {
    // Don't fetch if we're in the process of deleting
    if (recipeId && session?.user?.id && !isDeleting) {
      fetchRecipe();
    }
  }, [recipeId, session?.user?.id, isDeleting]);

  // Redirect to dashboard if recipe not found (but not when deleting)
  useEffect(() => {
    if (!loading && !isDeleting && (error || !recipe)) {
      router.replace('/dashboard');
    }
  }, [loading, error, recipe, router, isDeleting]);

  const fetchRecipe = async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      if (response.ok) {
        const data = await response.json();
        setRecipe(data);
      } else if (response.status === 404) {
        // Recipe not found - redirect to dashboard
        router.push('/dashboard');
        return;
      } else {
        setError('Recipe not found');
      }
    } catch (err) {
      setError('Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = () => {
    router.push(`/recipe/${recipeId}/edit`);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      setIsDeleting(true); // Prevent any further fetches
      try {
        const response = await fetch(`/api/recipes/${recipeId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          // Immediately redirect to dashboard
          router.replace('/dashboard');
        } else {
          alert('Failed to delete recipe');
          setIsDeleting(false); // Reset flag if deletion failed
        }
      } catch (error) {
        alert('Failed to delete recipe');
        setIsDeleting(false); // Reset flag if deletion failed
      }
    }
  };

  const handleAddToCart = async () => {
    if (!recipe) return;
    
    try {
      const response = await fetch('/api/shopping-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipe._id,
          recipeTitle: recipe.title,
          ingredients: recipe.ingredients,
        }),
      });
      
      if (response.ok) {
        alert(`Added ingredients from "${recipe.title}" to shopping cart!`);
      } else {
        alert('Failed to add to shopping cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to shopping cart');
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
              {recipe.description && (
                <p className="text-gray-600 text-lg">{recipe.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEdit} variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleAddToCart} variant="outline">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button onClick={handleDelete} variant="outline" className="text-red-600 hover:text-red-700">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Recipe Meta Information */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Prep: {recipe.prepTime}m | Cook: {recipe.cookTime}m
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Serves {recipe.servings}</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <ChefHat className="h-4 w-4 text-gray-500" />
              <Badge className={getDifficultyColor(recipe.difficulty)}>
                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </Badge>
            </div>
          </div>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-800">
                      <span className="font-medium">
                        {ingredient.quantity} {ingredient.unit}
                      </span>{' '}
                      {ingredient.displayText}
                      {ingredient.notes && (
                        <span className="text-gray-500 text-sm block ml-4">
                          {ingredient.notes}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-gray-800 leading-relaxed">{instruction}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Recipe Image */}
        {recipe.imageUrl && (
          <Card className="mt-8">
            <CardContent className="p-0">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Recipe Meta */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Created: {new Date(recipe.createdAt).toLocaleDateString()} |
            Last updated: {new Date(recipe.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
