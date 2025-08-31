'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { Navigation } from '@/components/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, Trash2, Check, X, ChevronDown, ChevronRight } from 'lucide-react';
import { consolidateIngredients, type CartItem, type ConsolidatedIngredient } from '@/lib/ingredient-consolidation';

interface ShoppingCartItem {
  _id: string;
  ingredient: string;
  quantity: number;
  unit: string;
  completed: boolean;
  recipeTitle?: string;
  recipeId?: string;
  addedAt: Date;
}

export default function ShoppingCartPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<ShoppingCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Consolidate ingredients using useMemo for performance
  const consolidatedIngredients = useMemo(() => {
    return consolidateIngredients(items as CartItem[]);
  }, [items]);

  // Computed values
  const completedItems = items.filter(item => item.completed);
  const pendingItems = items.filter(item => !item.completed);
  const pendingConsolidated = consolidatedIngredients.filter(group => 
    group.items.some(item => !item.completed)
  );
  const completedConsolidated = consolidatedIngredients.filter(group => 
    group.items.some(item => item.completed)
  );

  const toggleGroupExpansion = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchShoppingCart();
    }
  }, [session?.user?.id]);

  // API call helpers
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

  const updateItemCompletion = async (itemId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/shopping-cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        setItems(items.map(item => 
          item._id === itemId ? { ...item, completed } : item
        ));
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const toggleItemCompleted = async (itemId: string) => {
    const item = items.find(item => item._id === itemId);
    if (item) {
      await updateItemCompletion(itemId, !item.completed);
    }
  };

  const setGroupCompleted = async (groupItems: CartItem[], completed: boolean) => {
    try {
      const itemsToUpdate = groupItems.filter(item => item.completed !== completed);
      
      const updatePromises = itemsToUpdate.map(item => 
        fetch(`/api/shopping-cart/${item._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completed }),
        })
      );

      const responses = await Promise.all(updatePromises);
      
      if (responses.every(response => response.ok)) {
        setItems(items.map(item => {
          const groupItem = groupItems.find(gItem => gItem._id === item._id);
          return groupItem ? { ...item, completed } : item;
        }));
      }
    } catch (error) {
      console.error('Error updating group items:', error);
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

  // Helper functions for cleaner code
  const getGroupCompletionState = (group: ConsolidatedIngredient) => ({
    allCompleted: group.items.every(item => item.completed),
    someCompleted: group.items.some(item => item.completed),
  });

  const getRelevantItems = (group: ConsolidatedIngredient, isCompleted: boolean) => 
    group.items.filter(item => item.completed === isCompleted);

  const handleGroupRemoval = (group: ConsolidatedIngredient) => {
    group.items.forEach(item => removeItem(item._id));
  };

  const renderIngredientDisplay = (group: ConsolidatedIngredient) => {
    // For consolidated items with valid quantities
    if (group.canConsolidate && group.totalQuantity > 0) {
      return `${group.totalQuantity} ${group.primaryUnit} ${group.baseIngredient}`;
    }
    
    // For single items, always show quantity regardless of canConsolidate
    if (group.items.length === 1) {
      const item = group.items[0];
      return `${item.quantity} ${item.unit} ${item.ingredient}`;
    }
    
    // For multiple items that can't be consolidated, just show the base ingredient
    // Individual quantities will be shown in the expanded view
    return group.baseIngredient;
  };

  // Component to render a consolidated ingredient group
  const ConsolidatedIngredientGroup = ({ group, isCompleted = false }: { group: ConsolidatedIngredient, isCompleted?: boolean }) => {
    const groupKey = group.baseIngredient;
    const isExpanded = expandedGroups.has(groupKey);
    const relevantItems = getRelevantItems(group, isCompleted);
    const { allCompleted, someCompleted } = getGroupCompletionState(group);
    
    if (relevantItems.length === 0) return null;

    const showGroupCheckbox = group.items.length > 1;
    const isIndeterminate = someCompleted && !allCompleted;

    return (
      <div className="border rounded-lg overflow-hidden">
        {/* Main ingredient row */}
        <div className={`flex items-center gap-3 p-3 hover:bg-gray-50 ${isCompleted ? 'bg-green-50' : ''}`}>
          {showGroupCheckbox ? (
            <Checkbox
              checked={allCompleted}
              onCheckedChange={(checked) => setGroupCompleted(group.items, !!checked)}
              className={isIndeterminate ? 'indeterminate' : ''}
            />
          ) : (
            <Checkbox
              checked={relevantItems[0]?.completed || false}
              onCheckedChange={() => toggleItemCompleted(relevantItems[0]._id)}
            />
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-medium ${isCompleted ? 'line-through opacity-75' : ''}`}>
                {renderIngredientDisplay(group)}
              </span>
              {group.alternativeDisplay && (
                <Badge variant="outline" className="text-xs">
                  {group.alternativeDisplay}
                </Badge>
              )}
              {/* Recipe tags */}
              {relevantItems.map((item, index) => (
                item.recipeTitle && (
                  <Badge key={`${item.recipeId}-${index}`} variant="secondary" className="text-xs">
                    {item.recipeTitle}
                  </Badge>
                )
              ))}
            </div>
          </div>

          {group.items.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleGroupExpansion(groupKey)}
              className="p-1"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleGroupRemoval(group)}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Expanded view showing individual items */}
        {isExpanded && group.items.length > 1 && (
          <div className="border-t bg-gray-50">
            {relevantItems.map((item) => (
              <div key={item._id} className="flex items-center gap-3 p-3 pl-12">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleItemCompleted(item._id)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${item.completed ? 'line-through opacity-75' : ''}`}>
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
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
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
          {/* Pending Items - Consolidated */}
          {pendingConsolidated.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Shopping List ({pendingItems.length} items, {pendingConsolidated.length} groups)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingConsolidated.map((group, index) => (
                    <ConsolidatedIngredientGroup key={index} group={group} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Items - Consolidated */}
          {completedConsolidated.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  Completed ({completedItems.length} items, {completedConsolidated.length} groups)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedConsolidated.map((group, index) => (
                    <ConsolidatedIngredientGroup key={index} group={group} isCompleted={true} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      </div>
    </>
  );
}
