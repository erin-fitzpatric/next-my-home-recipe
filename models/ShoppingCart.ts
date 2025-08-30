import mongoose, { Document, Schema } from 'mongoose';

export interface IShoppingCartItem extends Document {
  _id: string;
  userId: string;
  recipeId?: string;
  recipeTitle?: string;
  ingredient: string;
  quantity: number;
  unit: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ShoppingCartSchema = new Schema<IShoppingCartItem>({
  userId: {
    type: String,
    required: true,
  },
  recipeId: {
    type: String,
  },
  recipeTitle: {
    type: String,
  },
  ingredient: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Create indexes
ShoppingCartSchema.index({ userId: 1 });
ShoppingCartSchema.index({ recipeId: 1 });

export const ShoppingCart = mongoose.models.ShoppingCart || mongoose.model<IShoppingCartItem>('ShoppingCart', ShoppingCartSchema);
