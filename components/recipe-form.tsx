'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, Clock, Users, ChefHat, X, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { recipeSchema, type RecipeFormData, type Recipe, PRESET_TAGS, UNITS } from '@/lib/recipe-constants';

interface RecipeFormProps {
  mode: 'add' | 'edit';
  initialData?: Recipe;
  onSubmit: (data: RecipeFormData) => Promise<void>;
}

export function RecipeForm({ mode, initialData, onSubmit }: RecipeFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customTag, setCustomTag] = useState('');

  // Determine default values based on mode
  const getDefaultValues = (): Partial<RecipeFormData> => {
    if (mode === 'add') {
      return {
        title: '',
        description: '',
        prepTime: 15,
        cookTime: 30,
        servings: 4,
        difficulty: 'medium',
        ingredients: [{ quantity: 1, unit: 'cup', displayText: '', notes: '' }],
        instructions: [{ step: '' }],
        tags: [],
        isPublic: false,
        imageUrl: '',
      };
    } else {
      // Edit mode - transform initial data
      return {
        title: initialData?.title || '',
        description: initialData?.description || '',
        prepTime: initialData?.prepTime || 15,
        cookTime: initialData?.cookTime || 30,
        servings: initialData?.servings || 4,
        difficulty: initialData?.difficulty || 'medium',
        ingredients: initialData?.ingredients || [{ quantity: 1, unit: 'cup', displayText: '', notes: '' }],
        instructions: initialData?.instructions?.map(step => ({ step })) || [{ step: '' }],
        tags: initialData?.tags || [],
        isPublic: initialData?.isPublic || false,
        imageUrl: initialData?.imageUrl || '',
      };
    }
  };

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RecipeFormData>({
    resolver: zodResolver(recipeSchema),
    defaultValues: getDefaultValues(),
  });

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient, move: moveIngredient, insert: insertIngredient } = useFieldArray({
    control,
    name: 'ingredients',
  });

  const { fields: instructionFields, append: appendInstruction, remove: removeInstruction, move: moveInstruction, insert: insertInstruction } = useFieldArray({
    control,
    name: 'instructions',
  });

  const watchedTags = watch('tags');

  const handleFormSubmit = async (data: RecipeFormData) => {
    if (!session?.user?.id) {
      alert('You must be logged in to save a recipe');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tag: string) => {
    const currentTags = watchedTags || [];
    if (currentTags.includes(tag)) {
      setValue('tags', currentTags.filter(t => t !== tag));
    } else {
      setValue('tags', [...currentTags, tag]);
    }
  };

  const addCustomTag = () => {
    if (customTag.trim() && !watchedTags?.includes(customTag.trim())) {
      setValue('tags', [...(watchedTags || []), customTag.trim().toLowerCase()]);
      setCustomTag('');
    }
  };

  const removeTag = (tag: string) => {
    setValue('tags', (watchedTags || []).filter(t => t !== tag));
  };

  // Dynamic content based on mode
  const title = mode === 'add' ? 'Add New Recipe' : 'Edit Recipe';
  const description = mode === 'add' ? 'Create a new recipe to add to your collection' : 'Update your recipe details';
  const submitText = mode === 'add' ? 'Create Recipe' : 'Update Recipe';
  const submittingText = mode === 'add' ? 'Creating Recipe...' : 'Updating Recipe...';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="lg:col-span-2">
                  <Label htmlFor="title">Recipe Title *</Label>
                  <Input
                    id="title"
                    {...register('title')}
                    placeholder="e.g., Classic Spaghetti Carbonara"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Brief description of your recipe..."
                    rows={3}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="imageUrl">Recipe Image (URL)</Label>
                  <Input
                    id="imageUrl"
                    {...register('imageUrl')}
                    type="url"
                    placeholder="https://example.com/recipe-image.jpg"
                    className={errors.imageUrl ? 'border-red-500' : ''}
                  />
                  {errors.imageUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Add a URL to an image of your recipe (optional)
                  </p>
                </div>

                <div>
                  <Label htmlFor="prepTime">Prep Time (minutes) *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="prepTime"
                      type="number"
                      {...register('prepTime', { valueAsNumber: true })}
                      className={`pl-10 ${errors.prepTime ? 'border-red-500' : ''}`}
                      min="0"
                    />
                  </div>
                  {errors.prepTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.prepTime.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cookTime">Cook Time (minutes) *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="cookTime"
                      type="number"
                      {...register('cookTime', { valueAsNumber: true })}
                      className={`pl-10 ${errors.cookTime ? 'border-red-500' : ''}`}
                      min="0"
                    />
                  </div>
                  {errors.cookTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.cookTime.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="servings">Servings *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="servings"
                      type="number"
                      {...register('servings', { valueAsNumber: true })}
                      className={`pl-10 ${errors.servings ? 'border-red-500' : ''}`}
                      min="1"
                      max="20"
                    />
                  </div>
                  {errors.servings && (
                    <p className="text-red-500 text-sm mt-1">{errors.servings.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty Level *</Label>
                  <Select 
                    onValueChange={(value: 'easy' | 'medium' | 'hard') => setValue('difficulty', value)}
                    defaultValue={mode === 'edit' ? initialData?.difficulty : undefined}
                  >
                    <SelectTrigger className={errors.difficulty ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.difficulty && (
                    <p className="text-red-500 text-sm mt-1">{errors.difficulty.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ingredients */}
          <Card>
            <CardHeader>
              <CardTitle>Ingredients *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ingredientFields.map((field, index) => (
                  <div key={field.id}>
                    {/* Add ingredient button at the top or between items */}
                    <div className="flex justify-center mb-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertIngredient(index, { quantity: 1, unit: 'cup', displayText: '', notes: '' })}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Ingredient row */}
                    <div className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.1"
                          {...register(`ingredients.${index}.quantity`, { valueAsNumber: true })}
                          placeholder="1"
                          className={errors.ingredients?.[index]?.quantity ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="col-span-2">
                        <Select
                          onValueChange={(value) => setValue(`ingredients.${index}.unit`, value)}
                          defaultValue={field.unit}
                        >
                          <SelectTrigger className={errors.ingredients?.[index]?.unit ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            {UNITS.map(unit => (
                              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-6">
                        <Input
                          {...register(`ingredients.${index}.displayText`)}
                          placeholder="e.g., yellow onion, diced"
                          className={errors.ingredients?.[index]?.displayText ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="col-span-1 flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveIngredient(index, index - 1)}
                          disabled={index === 0}
                          className="h-6 p-0"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveIngredient(index, index + 1)}
                          disabled={index === ingredientFields.length - 1}
                          className="h-6 p-0"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                          disabled={ingredientFields.length === 1}
                          className="h-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add ingredient button at the end */}
                <div className="flex justify-center mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendIngredient({ quantity: 1, unit: 'cup', displayText: '', notes: '' })}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {errors.ingredients && (
                  <p className="text-red-500 text-sm">{errors.ingredients.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {instructionFields.map((field, index) => (
                  <div key={field.id}>
                    {/* Add instruction button at the top or between items */}
                    <div className="flex justify-center mb-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertInstruction(index, { step: '' })}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {/* Instruction row */}
                    <div className="flex gap-2 items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <Textarea
                          {...register(`instructions.${index}.step`)}
                          placeholder={`Step ${index + 1}: Describe this step in detail...`}
                          rows={2}
                          className={errors.instructions?.[index]?.step ? 'border-red-500' : ''}
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveInstruction(index, index - 1)}
                          disabled={index === 0}
                          className="h-6 w-8 p-0"
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => moveInstruction(index, index + 1)}
                          disabled={index === instructionFields.length - 1}
                          className="h-6 w-8 p-0"
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeInstruction(index)}
                          disabled={instructionFields.length === 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add instruction button at the end */}
                <div className="flex justify-center mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendInstruction({ step: '' })}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                {errors.instructions && (
                  <p className="text-red-500 text-sm">{errors.instructions.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {PRESET_TAGS.map(tag => (
                    <Button
                      key={tag}
                      type="button"
                      variant={watchedTags?.includes(tag) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Add custom tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  />
                  <Button type="button" onClick={addCustomTag} disabled={!customTag.trim()}>
                    Add Tag
                  </Button>
                </div>

                {watchedTags && watchedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {watchedTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Optional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Optional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  {...register('isPublic')}
                />
                <Label htmlFor="isPublic">Make this recipe public</Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? submittingText : submitText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
