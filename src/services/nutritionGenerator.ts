import { FOOD_DB, FoodItem } from '../data/foodDatabase';

export interface NutritionalAnamnesis {
  mealCount?: number;
  dietType: string;
  allergies?: string;
  dislikes?: string;
  budget?: string;
  cookingTime?: string;
  supplements?: string[];
  waterIntake?: number;
  updatedAt: string;
}

export interface Food {
  item: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  name: string;
  time: string;
  foods: Food[];
  weeklyVariations?: {
    day: string;
    foods: Food[];
  }[];
}

export interface DietPlan {
  goal: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: Meal[];
  supplementation: string;
  recommendations: string;
  createdAt: string;
}

// --- MOTOR DE REGRAS NUTRICIONAL ROBUSTO ---

export async function generateDietPlan(
  anamnesis: any, // Dados físicos do SpeltaFit
  nutritionalAnamnesis: NutritionalAnamnesis
): Promise<DietPlan> {
  const weight = Number(anamnesis.weight) || 70;
  const height = Number(anamnesis.height) || 170;
  const age = Number(anamnesis.age) || 30;
  const gender = anamnesis.gender || 'Masculino';
  const goal = (anamnesis.goal || 'Saúde').toLowerCase();
  const activityLevel = Number(anamnesis.daysPerWeek) || 3;
  const userLevel = (anamnesis.experience || 'Iniciante').toLowerCase();

  // 1. Calcular TMB (Mifflin-St Jeor)
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  if (gender === 'Masculino') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // 2. Calcular Gasto Energético Total (GET)
  let factor = 1.2; // Sedentário
  if (activityLevel >= 5) factor = 1.725; // Muito ativo
  else if (activityLevel >= 3) factor = 1.55; // Moderadamente ativo
  else if (activityLevel >= 1) factor = 1.375; // Levemente ativo
  
  let tdee = bmr * factor;

  // 3. Ajustar Calorias conforme Objetivo e Nível
  let targetCalories = tdee;
  let calorieAdjustment = 0;

  if (goal.includes('emagrecimento') || goal.includes('perder') || goal.includes('definição')) {
    calorieAdjustment = userLevel === 'avançado' ? -700 : -500;
  } else if (goal.includes('hipertrofia') || goal.includes('ganhar') || goal.includes('massa')) {
    calorieAdjustment = userLevel === 'avançado' ? 500 : 300;
  }
  
  targetCalories += calorieAdjustment;

  // 4. Calcular Macros (g/kg) baseados no Nível e Objetivo
  let protGPerKg = 2.0;
  let fatGPerKg = 0.8;
  
  if (goal.includes('emagrecimento')) {
    protGPerKg = userLevel === 'avançado' ? 2.5 : 2.2; 
    fatGPerKg = 0.7;
  } else if (goal.includes('hipertrofia')) {
    protGPerKg = userLevel === 'avançado' ? 2.2 : 2.0;
    fatGPerKg = 1.0;
  }

  const proteinTotal = weight * protGPerKg;
  const fatsTotal = weight * fatGPerKg;
  const proteinCal = proteinTotal * 4;
  const fatsCal = fatsTotal * 9;
  const carbsCal = Math.max(targetCalories - proteinCal - fatsCal, 500); // Mínimo de carbos para energia
  const carbsTotal = carbsCal / 4;

  // 5. Distribuir em Refeições
  const mealCount = nutritionalAnamnesis.mealCount || 4;
  const meals: Meal[] = [];
  
  const mealNames = [
    { name: 'Café da Manhã', time: '08:00', type: 'breakfast' },
    { name: 'Almoço', time: '12:30', type: 'main' },
    { name: 'Lanche da Tarde', time: '16:00', type: 'snack' },
    { name: 'Jantar', time: '20:00', type: 'main' },
    { name: 'Ceia', time: '22:30', type: 'snack' },
    { name: 'Pré-Treino', time: '1 hora antes', type: 'pre-workout' }
  ];

  const isVegetarian = nutritionalAnamnesis.dietType?.toLowerCase().includes('vegetariana');
  const dislikes = nutritionalAnamnesis.dislikes?.toLowerCase() || '';

  const getFoodOptions = (category: string) => {
    let options = FOOD_DB.filter(f => f.category === category);
    if (isVegetarian && category === 'proteina') {
      options = options.filter(f => ['ovo_cozido', 'ovo_mexido', 'tofu', 'tempeh', 'queijo_cottage', 'queijo_minas', 'iogurte_natural', 'iogurte_grego_zero', 'whey_protein', 'albumina'].includes(f.id));
    } else if (isVegetarian && category === 'carboidrato') {
      // Priorizar grãos para vegetarianos (mais proteína)
      options = options.sort((a, b) => b.protein - a.protein);
    }
    
    options = options.filter(f => !dislikes.includes(f.name.toLowerCase()));
    return options.length > 0 ? options : [FOOD_DB[0]];
  };

  const getRandom = (options: FoodItem[]) => options[Math.floor(Math.random() * options.length)];

  for (let i = 0; i < mealCount; i++) {
    const mealInfo = mealNames[i] || { name: `Refeição ${i + 1}`, time: '--:--', type: 'snack' };
    
    // Distribuição de macros por refeição (ex: almoço/jantar são maiores)
    let mealFactor = 1 / mealCount;
    if (mealInfo.type === 'main') mealFactor = 1.3 / mealCount;
    if (mealInfo.type === 'snack') mealFactor = 0.7 / mealCount;

    const mealProt = proteinTotal * mealFactor;
    const mealCarb = carbsTotal * mealFactor;
    const mealFat = fatsTotal * mealFactor;

    const foods: Food[] = [];
    
    if (mealInfo.type === 'main') {
      const p = getRandom(getFoodOptions('proteina'));
      const c = getRandom(getFoodOptions('carboidrato'));
      const v = getRandom(getFoodOptions('vegetal'));

      foods.push({
        item: p.name,
        quantity: `${Math.round((mealProt / p.protein) * 100)}g`,
        calories: Math.round((mealProt / p.protein) * p.calories),
        protein: Math.round(mealProt),
        carbs: Math.round((mealProt / p.protein) * p.carbs),
        fats: Math.round((mealProt / p.protein) * p.fats)
      });

      foods.push({
        item: c.name,
        quantity: `${Math.round((mealCarb / c.carbs) * 100)}g`,
        calories: Math.round((mealCarb / c.carbs) * c.calories),
        protein: Math.round((mealCarb / c.carbs) * c.protein),
        carbs: Math.round(mealCarb),
        fats: Math.round((mealCarb / c.carbs) * c.fats)
      });

      foods.push({
        item: v.name,
        quantity: 'À vontade (mínimo 100g)',
        calories: v.calories,
        protein: v.protein,
        carbs: v.carbs,
        fats: v.fats
      });
    } else if (mealInfo.type === 'breakfast' || mealInfo.type === 'snack') {
      const p = getRandom(getFoodOptions('proteina'));
      const f = getRandom(getFoodOptions('fruta'));
      const g = getRandom(getFoodOptions('gordura'));
      
      foods.push({
        item: p.name,
        quantity: `${Math.round((mealProt / p.protein) * 100)}g`,
        calories: Math.round((mealProt / p.protein) * p.calories),
        protein: Math.round(mealProt),
        carbs: Math.round((mealProt / p.protein) * p.carbs),
        fats: Math.round((mealProt / p.protein) * p.fats)
      });

      foods.push({
        item: f.name,
        quantity: `${Math.round((mealCarb / f.carbs) * 100)}g`,
        calories: Math.round((mealCarb / f.carbs) * f.calories),
        protein: Math.round((mealCarb / f.carbs) * f.protein),
        carbs: Math.round(mealCarb),
        fats: Math.round((mealCarb / f.carbs) * f.fats)
      });

      if (mealFat > 5) {
        foods.push({
          item: g.name,
          quantity: `${Math.round((mealFat / g.fats) * 100)}g`,
          calories: Math.round((mealFat / g.fats) * g.calories),
          protein: Math.round((mealFat / g.fats) * g.protein),
          carbs: Math.round((mealFat / g.fats) * g.carbs),
          fats: Math.round(mealFat)
        });
      }
    } else if (mealInfo.type === 'pre-workout') {
      const c = getRandom(getFoodOptions('carboidrato'));
      const p = getRandom(getFoodOptions('proteina'));

      foods.push({
        item: c.name,
        quantity: `${Math.round((mealCarb / c.carbs) * 100)}g`,
        calories: Math.round((mealCarb / c.carbs) * c.calories),
        protein: Math.round((mealCarb / c.carbs) * c.protein),
        carbs: Math.round(mealCarb),
        fats: Math.round((mealCarb / c.carbs) * c.fats)
      });

      foods.push({
        item: p.name,
        quantity: `${Math.round((mealProt / p.protein) * 100)}g`,
        calories: Math.round((mealProt / p.protein) * p.calories),
        protein: Math.round(mealProt),
        carbs: Math.round((mealProt / p.protein) * p.carbs),
        fats: Math.round((mealProt / p.protein) * p.fats)
      });
    }

    // Gerar variações semanais reais baseadas no banco
    const weeklyVariations = [
      { day: 'Segunda/Terça', foods: [...foods] },
      { 
        day: 'Quarta/Quinta', 
        foods: foods.map(f => {
          const cat = FOOD_DB.find(db => db.name === f.item)?.category || 'proteina';
          const alt = getRandom(getFoodOptions(cat));
          return {
            ...f,
            item: alt.name,
            quantity: f.quantity.includes('g') ? `${Math.round((f.calories / alt.calories) * 100)}g` : f.quantity
          };
        })
      },
      { 
        day: 'Sexta/Sábado', 
        foods: foods.map(f => {
          const cat = FOOD_DB.find(db => db.name === f.item)?.category || 'proteina';
          const alt = getRandom(getFoodOptions(cat));
          return {
            ...f,
            item: alt.name,
            quantity: f.quantity.includes('g') ? `${Math.round((f.calories / alt.calories) * 100)}g` : f.quantity
          };
        })
      }
    ];

    meals.push({
      name: mealInfo.name,
      time: mealInfo.time,
      foods,
      weeklyVariations
    });
  }

  // 6. Suplementação Estratégica
  let suppList = ["Multivitamínico: 1 cápsula ao acordar."];
  
  if (goal.includes('hipertrofia') || goal.includes('massa')) {
    suppList.push("Creatina Monohidratada: 5g todos os dias (inclusive dias sem treino).");
    suppList.push("Whey Protein: 30g-40g para completar a meta de proteína diária.");
    if (userLevel === 'avançado') suppList.push("Beta-Alanina: 5g fracionadas ao longo do dia.");
  } else if (goal.includes('emagrecimento') || goal.includes('definição')) {
    suppList.push("Cafeína: 200mg-400mg antes do treino (se não tiver sensibilidade).");
    suppList.push("Ômega 3: 2g-3g por dia com as principais refeições.");
    suppList.push("Whey Protein: Útil para manter saciedade e massa magra.");
  }

  if (userLevel === 'avançado') {
    suppList.push("Glutamina: 5g-10g antes de dormir para recuperação imunológica.");
  }

  const supplementation = suppList.join('\n');

  const recommendations = `
    - Hidratação: Beba pelo menos ${Math.round(weight * 40 / 1000)} litros de água por dia.
    - Consistência: Tente seguir os horários das refeições em pelo menos 80% do tempo.
    - Qualidade: Priorize alimentos "de verdade" (descasque mais, embale menos).
    - Sal: Use com moderação, prefira temperos naturais (alho, cebola, ervas).
    - Sono: Durma de 7 a 9 horas por noite. A regeneração ocorre no descanso.
    - Nível ${userLevel.toUpperCase()}: Foco total na precisão das pesagens dos alimentos.
  `.trim();

  return {
    goal: anamnesis.goal || 'Saúde e Performance',
    calories: Math.round(targetCalories),
    macros: {
      protein: Math.round(proteinTotal),
      carbs: Math.round(carbsTotal),
      fats: Math.round(fatsTotal)
    },
    meals,
    supplementation,
    recommendations,
    createdAt: new Date().toISOString()
  };
}

export interface ShoppingItem {
  item: string;
  quantity: string;
  category: string;
}

export function generateShoppingList(plan: DietPlan): ShoppingItem[] {
  const itemsMap: Record<string, { total: number, unit: string, category: string }> = {};

  // Helper to parse quantity like "150g" or "2 unidades"
  const parseQuantity = (q: string) => {
    const match = q.match(/(\d+)\s*(g|unidades|ml|fatias|colheres)/i);
    if (match) {
      return { value: parseInt(match[1]), unit: match[2].toLowerCase() };
    }
    return { value: 0, unit: 'unidades' };
  };

  // Process all meals and their variations
  const processFoods = (foods: Food[]) => {
    foods.forEach(f => {
      const { value, unit } = parseQuantity(f.quantity);
      const foodData = FOOD_DB.find(db => db.name === f.item);
      const category = foodData?.category || 'outros';
      
      if (!itemsMap[f.item]) {
        itemsMap[f.item] = { total: 0, unit, category };
      }
      
      // We estimate weekly needs (roughly 7 days)
      // If it's in a variation, it might be used 2-3 times a week
      // For simplicity, we sum up the daily base and add a multiplier
      itemsMap[f.item].total += value;
    });
  };

  plan.meals.forEach(meal => {
    processFoods(meal.foods);
    // Variations are also processed to ensure variety in the list
    meal.weeklyVariations?.forEach(v => {
      v.foods.forEach(f => {
        const { value, unit } = parseQuantity(f.quantity);
        const foodData = FOOD_DB.find(db => db.name === f.item);
        const category = foodData?.category || 'outros';
        if (!itemsMap[f.item]) {
          itemsMap[f.item] = { total: 0, unit, category };
        }
        // Add a fraction for variations
        itemsMap[f.item].total += value * 0.5; 
      });
    });
  });

  return Object.entries(itemsMap).map(([item, data]) => ({
    item,
    quantity: `${Math.ceil(data.total * 7 / 100) * 100}${data.unit}`, // Weekly estimate rounded
    category: data.category
  })).sort((a, b) => a.category.localeCompare(b.category));
}

export function getFoodSubstitutes(foodName: string): FoodItem[] {
  const food = FOOD_DB.find(f => f.name === foodName);
  if (!food) return [];
  
  // Return foods from the same category with similar macro profiles
  return FOOD_DB.filter(f => 
    f.category === food.category && 
    f.name !== food.name &&
    Math.abs(f.protein - food.protein) < 10 &&
    Math.abs(f.carbs - food.carbs) < 15
  ).slice(0, 5);
}
