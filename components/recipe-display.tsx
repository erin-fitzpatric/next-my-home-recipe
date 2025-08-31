'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Grid, List, Plus, Clock, Users, MoreVertical, Edit, Trash2, Copy, ShoppingCart, Search, Filter, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

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
    name: string;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface RecipeDisplayProps {
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
}

export function RecipeDisplay({ viewMode, onViewModeChange }: RecipeDisplayProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [recipesInCart, setRecipesInCart] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session?.user?.id) {
      fetchRecipes();
      fetchCartItems();
    }
  }, [session?.user?.id]);

  // Refresh cart when window regains focus (in case cart was updated elsewhere)
  useEffect(() => {
    const handleFocus = () => {
      if (session?.user?.id) {
        fetchCartItems();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [session?.user?.id]);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/recipes');
      if (response.ok) {
        const data = await response.json();
        setRecipes(data);
      } else {
        console.error('Failed to fetch recipes:', response.status, response.statusText);
        setRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      const response = await fetch('/api/shopping-cart');
      if (response.ok) {
        const cartItems = await response.json();
        // Extract unique recipe IDs from cart items
        const recipeIds = new Set<string>(
          cartItems
            .filter((item: any) => item.recipeId)
            .map((item: any) => item.recipeId as string)
        );
        setRecipesInCart(recipeIds);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const filteredRecipes = recipes.filter(recipe => {
    // Search by title, description, or tags
    const searchMatch = searchTerm === '' || 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by selected tags
    const tagMatch = selectedTags.length === 0 || 
      selectedTags.every(tag => recipe.tags.includes(tag));
    
    // Filter by difficulty
    const difficultyMatch = selectedDifficulty === '' || 
      recipe.difficulty === selectedDifficulty;
    
    return searchMatch && tagMatch && difficultyMatch;
  });

  // Get all unique tags from all recipes
  const allTags = Array.from(new Set(recipes.flatMap(recipe => recipe.tags))).sort();

  const handleRecipeAction = async (action: string, recipeId: string) => {
    switch (action) {
      case 'edit':
        router.push(`/recipe/${recipeId}/edit`);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
          try {
            const response = await fetch(`/api/recipes/${recipeId}`, {
              method: 'DELETE',
            });
            if (response.ok) {
              // Refresh the recipes list
              fetchRecipes();
            } else {
              alert('Failed to delete recipe');
            }
          } catch (error) {
            alert('Failed to delete recipe');
          }
        }
        break;
      case 'duplicate':
        try {
          // Get the recipe data
          const recipe = recipes.find(r => r._id === recipeId);
          if (!recipe) {
            alert('Recipe not found');
            return;
          }
          
          // Create a copy with modified title
          const duplicatedRecipe = {
            ...recipe,
            title: `${recipe.title} (Copy)`,
            _id: undefined, // Remove ID so it creates a new recipe
          };
          
          const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(duplicatedRecipe),
          });
          
          if (response.ok) {
            const newRecipe = await response.json();
            // Refresh the recipes list
            fetchRecipes();
            // Navigate to edit the new recipe
            router.push(`/recipe/${newRecipe._id}/edit`);
          } else {
            alert('Failed to duplicate recipe');
          }
        } catch (error) {
          console.error('Error duplicating recipe:', error);
          alert('Failed to duplicate recipe');
        }
        break;
      case 'addToCart':
        try {
          const recipe = recipes.find(r => r._id === recipeId);
          if (!recipe) {
            toast.error('Recipe not found');
            return;
          }

          const isInCart = recipesInCart.has(recipeId);
          
          if (isInCart) {
            // Remove from cart
            const response = await fetch('/api/shopping-cart/remove-recipe', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                recipeId: recipe._id,
              }),
            });
            
            if (response.ok) {
              setRecipesInCart(prev => {
                const newSet = new Set(prev);
                newSet.delete(recipeId);
                return newSet;
              });
              toast.success(`Removed "${recipe.title}" ingredients from your shopping cart!`);
            } else {
              toast.error('Failed to remove from shopping cart. Please try again.');
            }
          } else {
            // Add to cart
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
              setRecipesInCart(prev => new Set(prev).add(recipeId));
              toast.success(`Added ${recipe.ingredients.length} ingredients from "${recipe.title}" to your shopping cart!`);
            } else {
              toast.error('Failed to add to shopping cart. Please try again.');
            }
          }
        } catch (error) {
          console.error('Error adding to cart:', error);
          toast.error('Failed to add to shopping cart');
        }
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and view toggle */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(selectedTags.length > 0 || selectedDifficulty) && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTags.length + (selectedDifficulty ? 1 : 0)}
                </Badge>
              )}
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('cards')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('table')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button onClick={() => router.push('/add-recipe')} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Add Recipe
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Difficulty</Label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedDifficulty === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty('')}
                  >
                    All
                  </Button>
                  <Button
                    variant={selectedDifficulty === 'easy' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty('easy')}
                  >
                    Easy
                  </Button>
                  <Button
                    variant={selectedDifficulty === 'medium' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty('medium')}
                  >
                    Medium
                  </Button>
                  <Button
                    variant={selectedDifficulty === 'hard' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty('hard')}
                  >
                    Hard
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Button
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {(selectedTags.length > 0 || selectedDifficulty) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTags([]);
                    setSelectedDifficulty('');
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Recipe display */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            {recipes.length === 0 ? (
              <>
                <div className="text-lg font-medium mb-2">No recipes yet!</div>
                <p>Start building your recipe collection by adding your first recipe.</p>
              </>
            ) : (
              <>
                <div className="text-lg font-medium mb-2">No recipes found</div>
                <p>Try adjusting your search term.</p>
              </>
            )}
          </div>
          {recipes.length === 0 && (
            <Button onClick={() => router.push('/add-recipe')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Recipe
            </Button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        <RecipeCards recipes={filteredRecipes} onAction={handleRecipeAction} recipesInCart={recipesInCart} />
      ) : (
        <RecipeTable recipes={filteredRecipes} onAction={handleRecipeAction} recipesInCart={recipesInCart} />
      )}
    </div>
  );
}

function RecipeCards({ recipes, onAction, recipesInCart }: { recipes: Recipe[]; onAction: (action: string, id: string) => void; recipesInCart: Set<string> }) {
  const router = useRouter();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <Card 
          key={recipe._id} 
          className="relative group hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
          onClick={() => router.push(`/recipe/${recipe._id}`)}
        >
          {/* Always Visible Cart Icon */}
          <Button
            size="sm"
            variant={recipesInCart.has(recipe._id) ? "default" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              onAction('addToCart', recipe._id);
            }}
            className={`absolute bottom-2 right-2 h-8 w-8 p-0 transition-all duration-200 z-10 ${
              recipesInCart.has(recipe._id) 
                ? 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-md' 
                : 'bg-white/95 hover:bg-white border-gray-300 hover:border-gray-400 shadow-sm'
            }`}
            title={recipesInCart.has(recipe._id) ? "Remove from shopping cart" : "Add to shopping cart"}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>

          {/* Recipe Image */}
          {recipe.imageUrl && (
            <div className="relative h-48 w-full">
              <Image
                src={recipe.imageUrl}
                alt={recipe.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {recipe.title}
                  </CardTitle>
                  <Badge 
                    variant={
                      recipe.difficulty === 'easy' ? 'secondary' : 
                      recipe.difficulty === 'medium' ? 'outline' : 
                      'destructive'
                    }
                    className="text-xs"
                  >
                    {recipe.difficulty}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2 mt-1">
                  {recipe.description}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onAction('edit', recipe._id);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onAction('duplicate', recipe._id);
                  }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction('delete', recipe._id);
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {recipe.prepTime + recipe.cookTime} min
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {recipe.servings} servings
              </div>
            </div>
            
            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {recipe.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {recipe.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{recipe.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecipeTable({ recipes, onAction, recipesInCart }: { recipes: Recipe[]; onAction: (action: string, id: string) => void; recipesInCart: Set<string> }) {
  const router = useRouter();
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recipe</TableHead>
            <TableHead>Cook Time</TableHead>
            <TableHead>Servings</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-[60px] text-center">Cart</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipes.map((recipe) => (
            <TableRow 
              key={recipe._id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/recipe/${recipe._id}`)}
            >
              <TableCell>
                <div>
                  <div className="font-medium">{recipe.title}</div>
                  <div className="text-sm text-gray-600 line-clamp-1">
                    {recipe.description}
                  </div>
                </div>
              </TableCell>
              <TableCell>{recipe.prepTime + recipe.cookTime} min</TableCell>
              <TableCell>{recipe.servings}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {recipe.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {recipe.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{recipe.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Button
                  size="sm"
                  variant={recipesInCart.has(recipe._id) ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction('addToCart', recipe._id);
                  }}
                  className={`h-8 w-8 p-0 transition-all duration-200 ${
                    recipesInCart.has(recipe._id) 
                      ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                      : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                  }`}
                  title={recipesInCart.has(recipe._id) ? "Remove from shopping cart" : "Add to shopping cart"}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onAction('edit', recipe._id);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onAction('duplicate', recipe._id);
                    }}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction('delete', recipe._id);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
