'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UNITS } from '@/lib/recipe-constants';

interface AddItemModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (ingredient: string, quantity: number, unit: string) => Promise<void>;
  trigger?: React.ReactNode;
}

export function AddItemModal({ isOpen, onOpenChange, onAddItem, trigger }: AddItemModalProps) {
  const [newItem, setNewItem] = useState({
    ingredient: '',
    quantity: '',
    unit: 'cup'
  });

  const handleSubmit = async () => {
    if (!newItem.ingredient.trim() || !newItem.quantity.trim()) {
      alert('Please fill in both ingredient name and quantity');
      return;
    }

    const quantity = parseFloat(newItem.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      await onAddItem(newItem.ingredient.trim(), quantity, newItem.unit);
      
      // Reset the form and close modal
      setNewItem({
        ingredient: '',
        quantity: '',
        unit: 'cup'
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding individual item:', error);
      alert('Failed to add item to shopping cart');
    }
  };

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleModalClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      // Reset form when modal closes
      setNewItem({
        ingredient: '',
        quantity: '',
        unit: 'cup'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Individual Item</DialogTitle>
        </DialogHeader>
        <div className="space-y-4" onKeyDown={handleModalKeyDown}>
          <div>
            <Label htmlFor="ingredient" className="mb-2 block">Ingredient</Label>
            <Input
              id="ingredient"
              placeholder="e.g., Tomatoes, Bread, Milk"
              value={newItem.ingredient}
              onChange={(e) => setNewItem(prev => ({ ...prev, ingredient: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="quantity" className="mb-2 block">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                placeholder="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="unit" className="mb-2 block">Unit</Label>
              <Select value={newItem.unit} onValueChange={(value) => setNewItem(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => handleModalClose(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
