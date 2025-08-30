import mongoose, { Document, Schema } from 'mongoose';

export interface IShoppingCartItem {
  _id: string;
  recipeId?: string;
  recipeTitle?: string;
  ingredient: string;
  quantity: number;
  unit: string;
  completed: boolean;
  addedAt: Date;
}

export interface IShoppingCart extends Document {
  _id: string;
  userId: string;
  items: IShoppingCartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ShoppingCartItemSchema = new Schema<IShoppingCartItem>({
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
  addedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true }); // Ensure each item has its own _id

const ShoppingCartSchema = new Schema<IShoppingCart>({
  userId: {
    type: String,
    required: true,
    unique: true, // One cart per user
  },
  items: [ShoppingCartItemSchema],
}, {
  timestamps: true,
});

// Create indexes
ShoppingCartSchema.index({ userId: 1 });

export const ShoppingCart = mongoose.models.ShoppingCart || mongoose.model<IShoppingCart>('ShoppingCart', ShoppingCartSchema);
