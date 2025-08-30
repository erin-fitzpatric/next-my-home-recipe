import mongoose, { Document, Schema } from 'mongoose';

export interface IIngredient extends Document {
  _id: string;
  name: string;
  category: string;
  defaultUnit: string;
  availableUnits: string[];
  conversionToGrams?: number; // For measurable ingredients
  estimatedGrams?: number; // For countable ingredients (e.g., 1 medium onion = 175g)
  aliases: string[]; // Alternative names
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema = new Schema<IIngredient>({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'produce',
      'meat',
      'dairy',
      'pantry',
      'spices',
      'condiments',
      'grains',
      'proteins',
      'other'
    ],
  },
  defaultUnit: {
    type: String,
    required: true,
  },
  availableUnits: [{
    type: String,
    required: true,
  }],
  conversionToGrams: {
    type: Number,
    // For ingredients like flour: 1 cup = 120g
  },
  estimatedGrams: {
    type: Number,
    // For ingredients like "1 medium onion" = 175g
  },
  aliases: [{
    type: String,
    lowercase: true,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Create index for searching
IngredientSchema.index({ name: 'text', aliases: 'text' });

export const Ingredient = mongoose.models.Ingredient || mongoose.model<IIngredient>('Ingredient', IngredientSchema);
