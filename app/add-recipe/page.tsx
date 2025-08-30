'use client';

import { useRouter } from 'next/navigation';
import { RecipeForm } from '@/components/recipe-form';
import { RecipeFormData } from '@/lib/recipe-constants';

export default function AddRecipePage() {
  const router = useRouter();

  const handleSubmit = async (data: RecipeFormData) => {
    // Transform instructions from objects to strings for API
    const transformedData = {
      ...data,
      instructions: data.instructions.map(instruction => instruction.step)
    };

    const response = await fetch('/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (response.ok) {
      router.push('/dashboard');
    } else {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create recipe');
    }
  };

  return (
    <RecipeForm 
      mode="add" 
      onSubmit={handleSubmit} 
    />
  );
}
