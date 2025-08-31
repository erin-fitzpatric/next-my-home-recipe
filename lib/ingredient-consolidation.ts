interface CartItem {
  _id: string;
  ingredient: string;
  quantity: number;
  unit: string;
  recipeId: string;
  recipeTitle: string;
  completed: boolean;
  notes?: string;
}

interface ConsolidatedIngredient {
  baseIngredient: string;
  totalQuantity: number;
  primaryUnit: string;
  items: CartItem[];
  alternativeDisplay?: string;
  canConsolidate: boolean;
}

// Unit conversion ratios (all to smallest unit)
const VOLUME_CONVERSIONS = {
  'teaspoon': 1,
  'tablespoon': 3,
  'fl oz': 6,
  'cup': 48,
  'pint': 96,
  'quart': 192,
  'gallon': 768,
  'milliliter': 0.2,
  'liter': 202.9
};

const WEIGHT_CONVERSIONS = {
  'milligram': 1,
  'gram': 1000,
  'oz': 28349.5,
  'lb': 453592,
  'kg': 1000000,
  'ton': 1000000000
};

function normalizeIngredientName(ingredient: string): string {
  return ingredient
    .toLowerCase()
    .replace(/\b(fresh|dried|ground|chopped|diced|minced|sliced|whole|large|small|medium)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getConversionFamily(unit: string): 'volume' | 'weight' | 'seasoning' | 'none' {
  const lowerUnit = unit.toLowerCase();
  if (lowerUnit in VOLUME_CONVERSIONS) return 'volume';
  if (lowerUnit in WEIGHT_CONVERSIONS) return 'weight';
  if (['to taste', 'pinch', 'dash'].includes(lowerUnit)) return 'seasoning';
  return 'none';
}

function convertToBaseUnit(quantity: number, unit: string, family: 'volume' | 'weight'): number {
  const conversions = family === 'volume' ? VOLUME_CONVERSIONS : WEIGHT_CONVERSIONS;
  const ratio = conversions[unit.toLowerCase() as keyof typeof conversions];
  return ratio ? quantity * ratio : quantity;
}

function findBestDisplayUnit(totalBaseQuantity: number, family: 'volume' | 'weight'): {unit: string, quantity: number} {
  const conversions = family === 'volume' ? VOLUME_CONVERSIONS : WEIGHT_CONVERSIONS;
  const units = Object.keys(conversions).sort((a, b) => 
    conversions[b as keyof typeof conversions] - conversions[a as keyof typeof conversions]
  );
  
  for (const unit of units) {
    const convertedQty = totalBaseQuantity / conversions[unit as keyof typeof conversions];
    if (convertedQty >= 1) {
      return { unit, quantity: Math.round(convertedQty * 100) / 100 };
    }
  }
  
  return { unit: units[units.length - 1], quantity: Math.round(totalBaseQuantity * 100) / 100 };
}

export function consolidateIngredients(cartItems: CartItem[]): ConsolidatedIngredient[] {
  const groups = groupIngredientsByName(cartItems);
  const consolidated: ConsolidatedIngredient[] = [];
  
  groups.forEach((items, baseIngredient) => {
    if (items.length === 1) {
      consolidated.push(createSingleItemGroup(items[0]));
    } else {
      consolidated.push(createMultiItemGroup(items, baseIngredient));
    }
  });
  
  return consolidated.sort((a, b) => a.baseIngredient.localeCompare(b.baseIngredient));
}

function groupIngredientsByName(cartItems: CartItem[]): Map<string, CartItem[]> {
  const groups = new Map<string, CartItem[]>();
  
  cartItems.forEach(item => {
    const normalized = normalizeIngredientName(item.ingredient);
    if (!groups.has(normalized)) {
      groups.set(normalized, []);
    }
    groups.get(normalized)!.push(item);
  });
  
  return groups;
}

function createSingleItemGroup(item: CartItem): ConsolidatedIngredient {
  return {
    baseIngredient: item.ingredient,
    totalQuantity: item.quantity,
    primaryUnit: item.unit,
    items: [item],
    canConsolidate: false
  };
}

function createMultiItemGroup(items: CartItem[], baseIngredient: string): ConsolidatedIngredient {
  const firstConversionFamily = getConversionFamily(items[0].unit);
  const canConsolidate = firstConversionFamily !== 'none' && 
    items.every(item => getConversionFamily(item.unit) === firstConversionFamily);
  
  if (canConsolidate) {
    return createConsolidatedGroup(items, firstConversionFamily);
  } else {
    return createGroupedButNotConsolidatedGroup(items);
  }
}

function createConsolidatedGroup(items: CartItem[], family: 'volume' | 'weight' | 'seasoning'): ConsolidatedIngredient {
  if (family === 'seasoning') {
    return {
      baseIngredient: items[0].ingredient,
      totalQuantity: 1,
      primaryUnit: 'to taste',
      items: items,
      alternativeDisplay: `From ${items.length} recipes`,
      canConsolidate: true
    };
  }
  
  // Convert all to base unit and sum
  let totalBaseQuantity = 0;
  items.forEach(item => {
    totalBaseQuantity += convertToBaseUnit(item.quantity, item.unit, family);
  });
  
  // Find best display unit
  const { unit: bestUnit, quantity: bestQuantity } = findBestDisplayUnit(totalBaseQuantity, family);
  
  return {
    baseIngredient: items[0].ingredient,
    totalQuantity: bestQuantity,
    primaryUnit: bestUnit,
    items: items,
    alternativeDisplay: `${items.length} recipes combined`,
    canConsolidate: true
  };
}

function createGroupedButNotConsolidatedGroup(items: CartItem[]): ConsolidatedIngredient {
  return {
    baseIngredient: `${items[0].ingredient} (multiple units)`,
    totalQuantity: 0, // Not applicable
    primaryUnit: '',
    items: items,
    alternativeDisplay: `${items.length} different measurements`,
    canConsolidate: false
  };
}

export type { CartItem, ConsolidatedIngredient };
