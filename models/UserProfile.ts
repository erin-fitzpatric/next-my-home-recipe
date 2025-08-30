import mongoose, { Document, Schema } from 'mongoose';

export interface IUserProfile extends Document {
  _id: string;
  userId: string; // Reference to NextAuth user._id
  preferences: {
    measurementSystem: 'metric' | 'imperial';
    defaultServingSize: number;
    dietaryRestrictions: string[];
    defaultView: 'cards' | 'table';
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>({
  userId: {
    type: String,
    required: true,
    unique: true, // One profile per user
  },
  preferences: {
    measurementSystem: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'imperial',
    },
    defaultServingSize: {
      type: Number,
      default: 4,
    },
    dietaryRestrictions: [{
      type: String,
    }],
    defaultView: {
      type: String,
      enum: ['cards', 'table'],
      default: 'cards',
    },
  },
}, {
  timestamps: true,
});

export const UserProfile = mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', UserProfileSchema);
