'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, Trash2, Check, X } from 'lucide-react';

interface ShoppingCartItem {
  _id: string;
  ingredient: string;
  quantity: number;
  unit: string;
  completed: boolean;
  recipeTitle?: string;
}

export default function ShoppingCartPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ShoppingCartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchShoppingCart();
    }
  }, [session?.user?.id]);

  const fetchShoppingCart = async () => {
    try {
      const response = await fetch('/api/shopping-cart');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching shopping cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemCompleted = async (itemId: string) => {
    try {
      const response = await fetch(`/api/shopping-cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          completed: !items.find(item => item._id === itemId)?.completed 
        }),
      });

      if (response.ok) {
        setItems(items.map(item => 
          item._id === itemId 
            ? { ...item, completed: !item.completed }
            : item
        ));
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/shopping-cart/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(items.filter(item => item._id !== itemId));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCompleted = async () => {
    try {
      const response = await fetch('/api/shopping-cart/clear-completed', {
        method: 'DELETE',
      });

      if (response.ok) {
        setItems(items.filter(item => !item.completed));
      }
    } catch (error) {
      console.error('Error clearing completed items:', error);
    }
  };

  const clearAll = async () => {
    if (confirm('Are you sure you want to clear your entire shopping cart?')) {
      try {
        const response = await fetch('/api/shopping-cart', {
          method: 'DELETE',
        });

        if (response.ok) {
          setItems([]);
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  const completedItems = items.filter(item => item.completed);
  const pendingItems = items.filter(item => !item.completed);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Shopping Cart</h1>
            <p className="text-gray-600">
              {items.length === 0 
                ? 'Your shopping cart is empty' 
                : `${pendingItems.length} items remaining, ${completedItems.length} completed`
              }
            </p>
          </div>
        </div>

        {items.length > 0 && (
          <div className="flex gap-2">
            {completedItems.length > 0 && (
              <Button variant="outline" onClick={clearCompleted}>
                <Check className="h-4 w-4 mr-2" />
                Clear Completed
              </Button>
            )}
            <Button variant="outline" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No items in your cart</h3>
            <p className="text-gray-600 mb-4">
              Add ingredients to your shopping cart from your recipes.
            </p>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Browse Recipes
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending Items */}
          {pendingItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shopping List ({pendingItems.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingItems.map((item) => (
                    <div 
                      key={item._id} 
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleItemCompleted(item._id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {item.quantity} {item.unit} {item.ingredient}
                          </span>
                          {item.recipeTitle && (
                            <Badge variant="secondary" className="text-xs">
                              {item.recipeTitle}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  Completed ({completedItems.length} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedItems.map((item) => (
                    <div 
                      key={item._id} 
                      className="flex items-center gap-3 p-3 border rounded-lg bg-green-50"
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleItemCompleted(item._id)}
                      />
                      <div className="flex-1 opacity-75">
                        <div className="flex items-center gap-2">
                          <span className="font-medium line-through">
                            {item.quantity} {item.unit} {item.ingredient}
                          </span>
                          {item.recipeTitle && (
                            <Badge variant="secondary" className="text-xs">
                              {item.recipeTitle}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
