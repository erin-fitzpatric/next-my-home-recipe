import mongoose, { Document, Schema } from 'mongoose';

export interface IRecipeIngredient {
  quantity: number;
  unit: string;
  displayText: string; // "1 yellow onion", "2 cups flour"
  notes?: string; // "diced", "finely chopped"
}

export interface IRecipe extends Document {
  _id: string;
  title: string;
  description?: string;
  instructions: string[];
  ingredients: IRecipeIngredient[];
  cookTime: number; // in minutes
  prepTime: number; // in minutes
  servings: number;
  tags: string[];
  userId: string; // NextAuth user ID is a string
  imageUrl?: string;
  isPublic: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
}

const RecipeIngredientSchema = new Schema<IRecipeIngredient>({
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  displayText: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
});

const RecipeSchema = new Schema<IRecipe>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  instructions: [{
    type: String,
    required: true,
  }],
  ingredients: [RecipeIngredientSchema],
  cookTime: {
    type: Number,
    required: true,
    min: 0,
  },
  prepTime: {
    type: Number,
    required: true,
    min: 0,
  },
  servings: {
    type: Number,
    required: true,
    min: 1,
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
  userId: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
}, {
  timestamps: true,
});

// Create indexes for searching
RecipeSchema.index({ title: 'text', description: 'text', tags: 'text' });
RecipeSchema.index({ userId: 1 });
RecipeSchema.index({ tags: 1 });

export const Recipe = mongoose.models.Recipe || mongoose.model<IRecipe>('Recipe', RecipeSchema);
