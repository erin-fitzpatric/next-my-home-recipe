import { z } from 'zod';

// Recipe form validation schema
export const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  prepTime: z.number().min(0, 'Prep time must be positive'),
  cookTime: z.number().min(0, 'Cook time must be positive'),
  servings: z.number().min(1, 'Must serve at least 1 person').max(20, 'Maximum 20 servings'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  ingredients: z.array(z.object({
    quantity: z.number().min(0.1, 'Quantity must be positive'),
    unit: z.string().min(1, 'Unit is required'),
    displayText: z.string().min(1, 'Ingredient description is required'),
    notes: z.string().optional(),
  })).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.object({
    step: z.string().min(1, 'Instruction cannot be empty')
  })).min(1, 'At least one instruction is required'),
  tags: z.array(z.string()),
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export type RecipeFormData = z.infer<typeof recipeSchema>;

// Predefined tags
export const PRESET_TAGS = [
  'american', 'appetizer', 'asian', 'beef', 'breakfast', 'chicken',
  'comfort-food', 'dairy-free', 'dessert', 'dinner', 'easy',
  'gluten-free', 'healthy', 'italian', 'lunch', 'mexican',
  'pasta', 'quick', 'salad', 'seafood', 'snack', 'vegan', 'vegetarian'
];

// Common units
export const UNITS = [
  'bottle', 'can', 'clove', 'cup', 'dash', 'gram', 'kg', 'lb', 'oz',
  'package', 'piece', 'pinch', 'slice', 'tablespoon', 'teaspoon',
  'to taste', 'whole'
];

// Recipe interface for editing
export interface Recipe {
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
}
