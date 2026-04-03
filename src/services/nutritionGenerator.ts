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
  prep?: string; // Como preparar (ex: "com cúrcuma e pimenta preta")
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

      const prepOptions = [
        'Grelhado na frigideira com um fio de azeite',
        'Cozido com sal e temperos naturais',
        'Assado no forno com cebola e alho',
        'Refogado simples com alho e cebola',
        'Feito na Airfryer'
      ];
      const randomPrep = prepOptions[Math.floor(Math.random() * prepOptions.length)];

      foods.push({
        item: p.name,
        quantity: `${Math.round((mealProt / p.protein) * 100)}g`,
        calories: Math.round((mealProt / p.protein) * p.calories),
        protein: Math.round(mealProt),
        carbs: Math.round((mealProt / p.protein) * p.carbs),
        fats: Math.round((mealProt / p.protein) * p.fats),
        prep: randomPrep
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
        fats: v.fats,
        prep: 'Temperar com limão e pouco sal'
      });
    } else if (mealInfo.type === 'breakfast' || mealInfo.type === 'snack') {
      const p = getRandom(getFoodOptions('proteina'));
      const f = getRandom(getFoodOptions('fruta'));
      const g = getRandom(getFoodOptions('gordura'));
      
      let prep = '';
      if (p.id === 'ovo_mexido' || p.id === 'ovo_cozido') {
        prep = 'Com pitada de cúrcuma e pimenta preta';
      }

      foods.push({
        item: p.name,
        quantity: `${Math.round((mealProt / p.protein) * 100)}g`,
        calories: Math.round((mealProt / p.protein) * p.calories),
        protein: Math.round(mealProt),
        carbs: Math.round((mealProt / p.protein) * p.carbs),
        fats: Math.round((mealProt / p.protein) * p.fats),
        prep: prep
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

  // 6. Suplementação Estratégica (Integrada nas refeições)
  const addSupplementToMeal = (mealType: string, suppId: string, quantity: string) => {
    // Find the first meal that matches the type
    let targetMeal = meals.find(m => {
      const info = mealNames.find(mn => mn.name === m.name);
      return info && info.type === mealType;
    });
    
    // Fallback if meal type not found
    if (!targetMeal) targetMeal = meals[0];

    if (targetMeal) {
      const suppData = FOOD_DB.find(f => f.id === suppId);
      if (suppData) {
        const foodItem = {
          item: suppData.name,
          quantity: quantity,
          calories: suppData.calories > 0 ? Math.round((parseInt(quantity) || 0) / 100 * suppData.calories) : 0,
          protein: suppData.protein > 0 ? Math.round((parseInt(quantity) || 0) / 100 * suppData.protein) : 0,
          carbs: suppData.carbs > 0 ? Math.round((parseInt(quantity) || 0) / 100 * suppData.carbs) : 0,
          fats: suppData.fats > 0 ? Math.round((parseInt(quantity) || 0) / 100 * suppData.fats) : 0
        };
        targetMeal.foods.push(foodItem);
        // Also add to variations so it shows up every day
        targetMeal.weeklyVariations?.forEach(v => v.foods.push(foodItem));
      }
    }
  };

  // User-selected supplements
  if (nutritionalAnamnesis.supplements && nutritionalAnamnesis.supplements.length > 0) {
    nutritionalAnamnesis.supplements.forEach(suppName => {
      const supp = FOOD_DB.find(f => f.name.toLowerCase() === suppName.toLowerCase());
      if (supp) {
        let mealType = 'snack';
        let qty = '1 unidade';
        
        if (supp.id === 'whey_protein' || supp.id === 'albumina') {
          mealType = 'snack';
          qty = '30g';
        } else if (supp.id === 'creatina' || supp.id === 'glutamina') {
          mealType = 'main';
          qty = '5g';
        } else if (supp.id === 'multivitaminico') {
          mealType = 'breakfast';
          qty = '1 unidade';
        } else if (supp.id === 'omega3') {
          mealType = 'main';
          qty = '2 unidades';
        } else if (supp.id === 'cafeina' || supp.id === 'pre-treino') {
          mealType = 'pre-workout';
          qty = '1 dose';
        }
        
        addSupplementToMeal(mealType, supp.id, qty);
      }
    });
  } else {
    // Base Supplements if none selected
    addSupplementToMeal('breakfast', 'multivitaminico', '1 unidade');
    addSupplementToMeal('main', 'creatina', '5g');

    // Goal-specific Suggestions
    if (goal.includes('hipertrofia') || goal.includes('massa')) {
      addSupplementToMeal('snack', 'whey_protein', '30g');
    } else if (goal.includes('emagrecimento') || goal.includes('definição')) {
      addSupplementToMeal('pre-workout', 'cafeina', '1 unidade');
      addSupplementToMeal('main', 'omega3', '2 unidades');
    }
  }

  const recommendations = `
    - Hidratação: Beba pelo menos ${Math.round(weight * 40 / 1000)} litros de água por dia.
    - Consistência: Tente seguir os horários das refeições em pelo menos 80% do tempo.
    - Qualidade: Priorize alimentos "de verdade" (descasque mais, embale menos).
    - Sal: Use com moderação, prefira temperos naturais (alho, cebola, ervas).
    - Sono: Durma de 7 a 9 horas por noite. A regeneração ocorre no descanso.
    - Suplementação: Os suplementos foram integrados diretamente nas suas refeições para facilitar a rotina.
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
    supplementation: "", // Removed separate supplementation
    recommendations,
    createdAt: new Date().toISOString()
  };
}

export interface ShoppingItem {
  item: string;
  monthlyTotal: string;
  packagesToBuy: string;
  category: string;
}

export function generateShoppingList(plan: DietPlan): ShoppingItem[] {
  const itemsMap: Record<string, { total: number, unit: string, category: string }> = {};

  // Helper to parse quantity like "150g" or "2 unidades"
  const parseQuantity = (q: string) => {
    if (q.toLowerCase().includes('vontade')) {
      return { value: 100, unit: 'g' }; // Base estimate for "à vontade"
    }
    const match = q.match(/(\d+)\s*(g|unidades|unidade|ml|fatias|colheres)/i);
    if (match) {
      let unit = match[2].toLowerCase();
      if (unit === 'unidade') unit = 'unidades';
      if (unit === 'fatias') unit = 'unidades'; // Treat slices as units for calculation
      return { value: parseInt(match[1]), unit };
    }
    return { value: 0, unit: 'unidades' };
  };

  // Process all meals and their variations
  const processFoods = (foods: Food[], multiplier: number = 1) => {
    foods.forEach(f => {
      const { value, unit } = parseQuantity(f.quantity);
      const foodData = FOOD_DB.find(db => db.name === f.item);
      const category = foodData?.category || 'outros';
      
      if (!itemsMap[f.item]) {
        itemsMap[f.item] = { total: 0, unit, category };
      }
      
      itemsMap[f.item].total += value * multiplier;
    });
  };

  plan.meals.forEach(meal => {
    processFoods(meal.foods, 1); // Daily base
    
    // Variations are also processed to ensure variety in the list
    meal.weeklyVariations?.forEach(v => {
      processFoods(v.foods, 0.2); // Add a fraction for variations
    });
  });

  return Object.entries(itemsMap).map(([item, data]) => {
    const monthlyTotalValue = data.total * 30; // 30 days in a month
    let monthlyTotalStr = '';
    let packagesToBuy = '';

    const itemNameLower = item.toLowerCase();

    if (data.unit === 'g') {
      const kg = monthlyTotalValue / 1000;
      monthlyTotalStr = kg >= 1 ? `${kg.toFixed(1)} kg` : `${Math.round(monthlyTotalValue)} g`;
      
      // Estimate packages
      if (itemNameLower.includes('whey') || itemNameLower.includes('albumina')) {
        const packs = Math.ceil(kg / 0.9); // 900g pack
        packagesToBuy = `${packs} pote(s) de 900g`;
      } else if (itemNameLower.includes('creatina') || itemNameLower.includes('glutamina')) {
        const packs = Math.ceil(kg / 0.3); // 300g pack
        packagesToBuy = `${packs} pote(s) de 300g`;
      } else if (itemNameLower.includes('arroz') || itemNameLower.includes('feijão') || itemNameLower.includes('feijao') || itemNameLower.includes('frango') || itemNameLower.includes('carne') || itemNameLower.includes('patinho') || itemNameLower.includes('tilápia') || itemNameLower.includes('salmão') || itemNameLower.includes('lombo')) {
        const packs = Math.ceil(kg / 1); // 1kg pack
        packagesToBuy = `${packs} pacote(s)/bandeja(s) de 1kg`;
      } else if (itemNameLower.includes('aveia') || itemNameLower.includes('tapioca') || itemNameLower.includes('macarrão') || itemNameLower.includes('macarrao') || itemNameLower.includes('café') || itemNameLower.includes('cafe')) {
        const packs = Math.ceil(kg / 0.5); // 500g pack
        packagesToBuy = `${packs} pacote(s) de 500g`;
      } else if (itemNameLower.includes('azeite')) {
        const packs = Math.ceil(monthlyTotalValue / 500); // 500ml
        packagesToBuy = `${packs} garrafa(s) de 500ml`;
      } else if (itemNameLower.includes('queijo') || itemNameLower.includes('tofu') || itemNameLower.includes('tempeh')) {
        const packs = Math.ceil(kg / 0.3); // 300g pack
        packagesToBuy = `${packs} pacote(s) de 300g`;
      } else if (data.category === 'vegetal' || data.category === 'fruta') {
        packagesToBuy = `Comprar aprox. ${monthlyTotalStr}`;
      } else {
        packagesToBuy = `Comprar aprox. ${monthlyTotalStr}`;
      }
    } else if (data.unit.includes('unidade')) {
      monthlyTotalStr = `${Math.round(monthlyTotalValue)} unidades`;
      if (itemNameLower.includes('ovo')) {
        const packs = Math.ceil(monthlyTotalValue / 30);
        packagesToBuy = `${packs} cartela(s) de 30 ovos`;
      } else if (itemNameLower.includes('pão') || itemNameLower.includes('pao')) {
        const packs = Math.ceil(monthlyTotalValue / 14); // 14 slices per loaf
        packagesToBuy = `${packs} pacote(s) de pão de forma`;
      } else if (itemNameLower.includes('multivitamínico') || itemNameLower.includes('ômega 3') || itemNameLower.includes('cafeína')) {
        const packs = Math.ceil(monthlyTotalValue / 60); // 60 capsules per bottle
        packagesToBuy = `${packs} frasco(s) de 60 cápsulas`;
      } else {
        packagesToBuy = `Comprar ${Math.round(monthlyTotalValue)} unidades`;
      }
    } else if (data.unit === 'ml') {
      const liters = monthlyTotalValue / 1000;
      monthlyTotalStr = liters >= 1 ? `${liters.toFixed(1)} L` : `${Math.round(monthlyTotalValue)} ml`;
      const packs = Math.ceil(liters / 1);
      packagesToBuy = `${packs} caixa(s)/garrafa(s) de 1L`;
    } else {
      monthlyTotalStr = `${Math.round(monthlyTotalValue)} ${data.unit}`;
      packagesToBuy = `Comprar ${monthlyTotalStr}`;
    }

    return {
      item,
      monthlyTotal: monthlyTotalStr,
      packagesToBuy,
      category: data.category
    };
  }).sort((a, b) => a.category.localeCompare(b.category));
}

export function getFoodSubstitutes(foodName: string): FoodItem[] {
  const food = FOOD_DB.find(f => f.name === foodName);
  if (!food) return [];
  
  // Return foods from the same category for easier substitution for beginners
  return FOOD_DB.filter(f => 
    f.category === food.category && 
    f.name !== food.name
  ).slice(0, 6);
}
