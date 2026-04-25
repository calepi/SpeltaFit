import { NutriAnamnesisData, NutritionalPlan, Meal, MealOption } from '../types/nutrition';
import { FOOD_DB, FoodItem } from '../data/foodDatabase';
import { AnamnesisData } from './workoutGenerator';

export async function generateNutritionalPlan(data: NutriAnamnesisData, workoutData?: AnamnesisData | null): Promise<NutritionalPlan> {
  // 1. Calculate BMR
  let bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age;
  bmr += data.gender === 'Masculino' ? 5 : -161;

  // 2. Determine Activity Multiplier
  let activityMultiplier = 1.2;
  if (data.activityLevel.includes('Levemente')) activityMultiplier = 1.375;
  else if (data.activityLevel.includes('Moderadamente')) activityMultiplier = 1.55;
  else if (data.activityLevel.includes('Muito Ativo')) activityMultiplier = 1.725;
  else if (data.activityLevel.includes('Extremamente')) activityMultiplier = 1.9;

  // 3. Calculate TDEE
  const tdee = Math.round(bmr * activityMultiplier);

  // 4. Determine Target Calories based on Goal
  let targetCalories = tdee;
  let strategySummary = '';
  
  if (data.goal.includes('Emagrecimento Acelerado')) {
    targetCalories = tdee - 700;
    strategySummary = 'Déficit calórico agressivo para perda de peso rápida. Foco em alta densidade nutricional e saciedade.';
  } else if (data.goal.includes('Emagrecimento Sustentável')) {
    targetCalories = tdee - 400;
    strategySummary = 'Déficit calórico moderado para perda de peso consistente e manutenção de massa magra.';
  } else if (data.goal.includes('Hipertrofia') || data.goal.includes('Ganho de Massa')) {
    targetCalories = tdee + 300;
    strategySummary = 'Superávit calórico leve para otimizar o ganho de massa muscular minimizando o ganho de gordura.';
  } else if (data.goal.includes('Recomposição Corporal')) {
    targetCalories = tdee - 100;
    strategySummary = 'Manutenção/Leve déficit calórico com alta proteína para promover perda de gordura e ganho muscular simultâneos.';
  } else if (data.goal.includes('Ganho de Peso')) {
    targetCalories = tdee + 500;
    strategySummary = 'Superávit calórico focado em alimentos densos em calorias e nutrientes para ganho de peso saudável.';
  } else {
    strategySummary = 'Dieta normocalórica focada em manutenção, saúde e performance.';
  }

  // Adjust for medical conditions
  const isLiquidDiet = data.medicalConditions.some(c => c.toLowerCase().includes('traqueostomia') || c.toLowerCase().includes('bariátrica') || c.toLowerCase().includes('mastigação'));
  const isPostSurgery = data.medicalConditions.some(c => c.toLowerCase().includes('cirurgi') || c.toLowerCase().includes('reabilitação'));
  
  if (isPostSurgery) {
    strategySummary += ' Atenção especial à recuperação cirúrgica: aumento de proteínas e nutrientes anti-inflamatórios para cicatrização.';
  }
  if (isLiquidDiet) {
    strategySummary += ' Dieta adaptada para consistência pastosa/líquida devido à condição clínica.';
  }

  // Deep Integration with Workout Data
  if (workoutData) {
    if (data.secondaryGoal || data.tertiaryGoal) {
      strategySummary += ` Além do objetivo principal, o plano considera suas missões extras (${[data.secondaryGoal, data.tertiaryGoal].filter(Boolean).join(', ')}).`;
    }

    if (workoutData.experience === 'Avançado') {
      strategySummary += ' Ajuste para atleta avançado: maior aporte de carboidratos peri-treino para sustentar volume de treino intenso.';
      if (data.goal.includes('Hipertrofia')) targetCalories += 200; // Extra calories for advanced hypertrophy
    }

    if (workoutData.duration && workoutData.duration >= 60) {
      strategySummary += ' Treinos longos detectados: recomendação de refeição pré-treino reforçada em carboidratos complexos.';
    }

    if (workoutData.stressLevel === 'Alto' || workoutData.sleepQuality === 'Ruim') {
      strategySummary += ' Marcadores de fadiga altos (estresse/sono ruim): superávit calórico leve ou manutenção para evitar overtraining e auxiliar na recuperação do sistema nervoso central.';
      // If they are on a deficit, make it less aggressive to help recovery
      if (data.goal.includes('Emagrecimento Acelerado')) targetCalories += 200; 
      if (data.goal.includes('Emagrecimento Sustentável')) targetCalories += 100;
    }
  }

  if (data.gender === 'Feminino' && targetCalories < 1200) targetCalories = 1200;
  if (data.gender === 'Masculino' && targetCalories < 1500) targetCalories = 1500;

  // 5. Calculate Macros
  let proteinPerKg = 2.0;
  if (isPostSurgery) proteinPerKg = 2.2; // Higher protein for healing
  if (data.goal.includes('Emagrecimento') || data.goal.includes('Recomposição')) proteinPerKg = 2.2;
  else if (data.goal.includes('Hipertrofia')) proteinPerKg = 1.8;
  
  // Advanced athletes need slightly more protein if cutting, or can use less if bulking (more carbs)
  if (workoutData && workoutData.experience === 'Avançado' && data.goal.includes('Emagrecimento')) {
    proteinPerKg = 2.4;
  }
  
  const proteinGrams = Math.round(data.weight * proteinPerKg);
  const proteinCalories = proteinGrams * 4;

  let fatPerKg = 0.9;
  if (data.dietaryPreference.includes('Cetogênica') || data.dietaryPreference.includes('Low Carb')) {
    fatPerKg = 1.5;
  }
  const fatGrams = Math.round(data.weight * fatPerKg);
  const fatCalories = fatGrams * 9;

  let remainingCalories = targetCalories - proteinCalories - fatCalories;
  
  if (data.dietaryPreference.includes('Cetogênica')) {
    remainingCalories = 30 * 4;
    const newFatCalories = targetCalories - proteinCalories - remainingCalories;
    targetCalories = proteinCalories + newFatCalories + remainingCalories;
  } else if (data.dietaryPreference.includes('Low Carb')) {
    remainingCalories = 100 * 4;
  }

  let carbGrams = Math.round(remainingCalories / 4);
  if (carbGrams < 0) carbGrams = 0;

  // 6. Water Intake Goal
  const waterGoalLiters = (data.weight * 35) / 1000;
  const waterIntakeGoal = `${waterGoalLiters.toFixed(1)} a ${(waterGoalLiters + 0.5).toFixed(1)} Litros por dia`;

  // 7. Emotional Guidelines
  let emotionalGuidelines = 'Mantenha uma relação saudável com a comida. Coma com atenção plena (Mindful Eating).';
  if (data.emotionalEating.includes('ansiedade') || data.emotionalEating.includes('estresse')) {
    emotionalGuidelines = 'Estratégia para Ansiedade: Identifique o gatilho antes de comer. Beba um copo de água, espere 10 minutos. Se a vontade persistir, opte por alimentos crocantes (cenoura, maçã) ou um chá calmante (camomila, mulungu) antes de atacar doces.';
  } else if (data.emotionalEating.includes('compulsão')) {
    emotionalGuidelines = 'Atenção à Compulsão: Não faça restrições severas, elas geram mais compulsão. Permita-se comer o que gosta em quantidades controladas. Se sentir perda de controle, procure ajuda profissional (psicólogo/nutricionista).';
  } else if (data.emotionalEating.includes('recompensa')) {
    emotionalGuidelines = 'Recompensa Não Alimentar: Você não é um cachorro para se recompensar com comida. Crie uma lista de recompensas não ligadas à alimentação (comprar algo, assistir um filme, um banho relaxante) para celebrar suas vitórias.';
  }

  // 8. Generate Meals using Database
  const mealsCount = parseInt(data.mealsPerDay.charAt(0)) || 4;
  const meals: Meal[] = [];
  
  const mealNames = ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia'];
  const times = ['07:00', '10:00', '13:00', '16:00', '19:30', '22:00'];

  // Distribution of macros per meal based on count
  const macroDistribution = getMacroDistribution(mealsCount);

  for (let i = 0; i < mealsCount; i++) {
    let nameIndex = i;
    if (mealsCount === 3) nameIndex = i * 2;
    if (mealsCount === 4 && i === 3) nameIndex = 4;

    const mealName = mealNames[nameIndex] || `Refeição ${i + 1}`;
    const mealType = getMealType(mealName);
    
    const mealProteinTarget = proteinGrams * macroDistribution[i];
    const mealCarbTarget = carbGrams * macroDistribution[i];
    const mealFatTarget = fatGrams * macroDistribution[i];

    meals.push({
      name: mealName,
      time: times[nameIndex] || 'Horário a definir',
      options: generateMealOptions(mealType, mealProteinTarget, mealCarbTarget, mealFatTarget, isLiquidDiet, data.dietaryPreference)
    });
  }

  // 9. Supplements
  const supplements = [];
  if (data.goal.includes('Hipertrofia') || data.goal.includes('Performance')) {
    supplements.push({
      name: 'Creatina Monohidratada',
      dosage: '3g a 5g',
      timing: 'Todos os dias, em qualquer horário (preferencialmente com carboidrato)',
      purpose: 'Aumento de força e volume muscular.'
    });
  }

  if (data.goal.includes('Ganho de Peso') || (data.goal.includes('Hipertrofia') && targetCalories >= 2300)) {
    supplements.push({
      name: 'Hipercalórico Caseiro',
      dosage: '1 porção líquida ao dia',
      timing: 'Pós-treino ou no Lanche da Tarde / Manhã',
      purpose: 'Atingir e bater a alta demanda calórica com mais facilidade, sem causar empanzinamento.\n\n' +
      'Bata tudo no liquidificador. Aqui estão 3 opções fáceis:\n\n' +
      'Opção 1 (Vitamina Clássica):\n• 400ml de Leite (integral ou vegetal)\n• 2 Bananas médias\n• 3 col. sopa de Aveia em flocos\n• 2 col. sopa de Pasta de Amendoim\n• 1 dose de Whey Protein ou Proteína de Soja\n\n' +
      'Opção 2 (Choco-Calórico):\n• 400ml de Leite\n• 1 Banana\n• 2 col. sopa de Leite em Pó (opcional, p/ mais caloria)\n• 1 col. sopa de Cacau em pó 50%\n• 2 col. sopa de Mel ou Melado\n• 2 col. sopa de Aveia\n\n' +
      'Opção 3 (Abacate Power):\n• 300ml de Leite\n• 3 col. sopa de Abacate\n• 3 col. sopa de Farinha de Aveia\n• 1 col. sopa de Mel\n• 1 dose de Whey Protein (sabor Baunilha ou Morango combina bem)'
    });
  }
  
  // Deep Integration Supplements
  if (workoutData) {
    if (workoutData.duration && workoutData.duration >= 60 && (data.goal.includes('Hipertrofia') || data.goal.includes('Performance'))) {
      supplements.push({
        name: 'Carboidrato Intra-treino (Palatinose ou Maltodextrina)',
        dosage: '20g a 30g',
        timing: 'Durante o treino',
        purpose: 'Manutenção da glicemia e performance em treinos longos.'
      });
    }
    
    if (workoutData.stressLevel === 'Alto') {
      supplements.push({
        name: 'Ashwagandha (KSM-66)',
        dosage: '300mg a 500mg',
        timing: 'Após o café da manhã ou almoço',
        purpose: 'Modulação do cortisol e redução do estresse crônico (detectado na anamnese de treino).'
      });
    }
  }

  if (isPostSurgery) {
    supplements.push({
      name: 'Ômega 3 (EPA/DHA)',
      dosage: '1000mg a 2000mg',
      timing: 'Junto com as principais refeições',
      purpose: 'Ação anti-inflamatória e auxílio na recuperação.'
    });
    supplements.push({
      name: 'Vitamina C + Zinco',
      dosage: '500mg Vit C / 15mg Zinco',
      timing: 'Pela manhã',
      purpose: 'Fortalecimento do sistema imune e cicatrização.'
    });
  }
  if (data.sleepQuality.includes('Ruim') || data.sleepQuality.includes('Insônia')) {
    supplements.push({
      name: 'Melatonina + Magnésio Inositol',
      dosage: 'Melatonina 0.21mg a 3mg / Magnésio 200mg',
      timing: '30 a 60 minutos antes de dormir',
      purpose: 'Melhorar a indução e qualidade do sono.'
    });
  }
  if (data.currentSupplements.includes('Whey Protein')) {
    supplements.push({
      name: 'Whey Protein',
      dosage: 'Conforme necessidade na dieta',
      timing: 'Pós-treino ou em lanches intermediários',
      purpose: 'Bater a meta de proteínas diária com praticidade.'
    });
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    tdee,
    targetCalories,
    macros: {
      protein: proteinGrams,
      carbs: carbGrams,
      fats: fatGrams
    },
    waterIntakeGoal,
    strategySummary,
    emotionalGuidelines,
    meals,
    supplements
  };
}

// --- Helper Functions for Engine ---

function getMacroDistribution(mealsCount: number): number[] {
  if (mealsCount === 3) return [0.3, 0.4, 0.3];
  if (mealsCount === 4) return [0.25, 0.35, 0.15, 0.25];
  if (mealsCount === 5) return [0.2, 0.1, 0.35, 0.1, 0.25];
  if (mealsCount === 6) return [0.2, 0.1, 0.3, 0.1, 0.2, 0.1];
  return Array(mealsCount).fill(1 / mealsCount);
}

function getMealType(name: string): 'breakfast' | 'lunch' | 'snack' {
  if (name.includes('Café')) return 'breakfast';
  if (name.includes('Almoço') || name.includes('Jantar')) return 'lunch';
  return 'snack';
}

function calculatePortion(foodId: string, targetMacro: number, macroType: 'protein' | 'carbs' | 'fats'): string {
  const food = FOOD_DB.find(f => f.id === foodId);
  if (!food) return '';

  const macroPer100g = food[macroType];
  if (macroPer100g === 0) return `Porção a gosto de ${food.name}`;

  let amount = (targetMacro / macroPer100g) * 100;

  // Cap eggs to max 4 units (approx 200g)
  if (foodId === 'ovo_cozido' || foodId === 'ovo_mexido') {
    if (amount > 200) {
      return `4 unidades de ${food.name} + complementar com outra proteína (ex: Whey ou Queijo)`;
    }
    const units = Math.max(1, Math.round(amount / 50));
    return `${units} unidade(s) de ${food.name}`;
  }

  // Cap bread to max 4 slices (approx 100g)
  if (foodId === 'pao_integral') {
    if (amount > 100) amount = 100;
    const units = Math.max(1, Math.round(amount / 25));
    return `${units} fatia(s) de ${food.name}`;
  }

  // Cap whey to max 2 scoops (60g)
  if (foodId === 'whey_protein') {
    if (amount > 60) amount = 60;
    const scoops = Math.max(1, Math.round(amount / 30));
    return `${scoops} scoop(s) de ${food.name}`;
  }

  // Round to nearest 10g
  amount = Math.round(amount / 10) * 10;
  if (amount < 10) amount = 10;

  return `${amount}g de ${food.name}`;
}

function generateMealOptions(type: 'breakfast' | 'lunch' | 'snack', pTarget: number, cTarget: number, fTarget: number, isLiquid: boolean, dietPref: string): MealOption[] {
  const options: MealOption[] = [];
  const isLowCarb = dietPref.includes('Low Carb') || dietPref.includes('Cetogênica');
  const isVegan = dietPref.includes('Vegana');

  if (isLiquid) {
    // Liquid/Pasty Diet Options
    options.push({
      description: 'Opção 1: Vitamina Proteica Completa',
      items: [
        `Proteína: ${calculatePortion(isVegan ? 'proteina_soja' : 'whey_protein', pTarget, 'protein')}`,
        `Carboidrato: ${calculatePortion('aveia_flocos', cTarget, 'carbs')}`,
        `Gordura: ${calculatePortion('pasta_amendoim', fTarget, 'fats')}`,
        `Preparo: Bata tudo no liquidificador com água ou leite vegetal. Consistência líquida/pastosa ideal para deglutição.`
      ]
    });
    options.push({
      description: 'Opção 2: Sopa Creme Nutritiva',
      items: [
        `Proteína: ${calculatePortion(isVegan ? 'tofu' : 'frango_desfiado', pTarget, 'protein')}`,
        `Carboidrato: ${calculatePortion('batata_doce', cTarget, 'carbs')}`,
        `Gordura: ${calculatePortion('azeite_oliva', fTarget, 'fats')}`,
        `Preparo: Cozinhe bem os ingredientes e bata no liquidificador até virar um creme liso sem pedaços.`
      ]
    });
    return options;
  }

  if (type === 'breakfast') {
    if (!isVegan) {
      options.push({
        description: 'Opção 1: Ovos com Carboidrato',
        items: [
          `Proteína: ${calculatePortion('ovo_mexido', pTarget, 'protein')}`,
          isLowCarb ? `Carboidrato: Porção pequena de frutas vermelhas` : `Carboidrato: ${calculatePortion('pao_integral', cTarget, 'carbs')} ou ${calculatePortion('tapioca', cTarget, 'carbs')}`,
          `Gordura: Preparar com 1 fio de azeite`,
          `Preparo: Faça os ovos mexidos ou cozidos.`,
          `Substituição: Troque os ovos por ${calculatePortion('queijo_minas', pTarget, 'protein')}.`
        ]
      });
    }
    options.push({
      description: 'Opção 2: Mingau Proteico',
      items: [
        `Proteína: ${calculatePortion(isVegan ? 'proteina_soja' : 'whey_protein', pTarget, 'protein')}`,
        isLowCarb ? `Carboidrato: 1 colher de chia e linhaça` : `Carboidrato: ${calculatePortion('aveia_flocos', cTarget, 'carbs')} + 1/2 banana`,
        `Gordura: ${calculatePortion('pasta_amendoim', fTarget, 'fats')}`,
        `Preparo: Cozinhe a aveia com água. Misture a proteína e a pasta de amendoim após desligar o fogo.`,
        `Substituição: Troque a aveia por creme de arroz.`
      ]
    });
    if (!isVegan) {
      options.push({
        description: 'Opção 3: Iogurte Completo',
        items: [
          `Proteína: ${calculatePortion('iogurte_natural', pTarget, 'protein')} (se precisar, adicione whey)`,
          isLowCarb ? `Carboidrato: Morangos picados` : `Carboidrato: ${calculatePortion('mamao_papaia', cTarget, 'carbs')}`,
          `Gordura: ${calculatePortion('castanha_para', fTarget, 'fats')}`,
          `Preparo: Misture tudo em um bowl.`,
          `Substituição: Troque o iogurte por queijo cottage.`
        ]
      });
    }
  } else if (type === 'lunch') {
    options.push({
      description: 'Opção 1: Prato Tradicional',
      items: [
        `Proteína: ${calculatePortion(isVegan ? 'tofu' : 'frango_grelhado', pTarget, 'protein')}`,
        isLowCarb ? `Carboidrato: Apenas vegetais de baixo amido` : `Carboidrato: ${calculatePortion('arroz_integral', cTarget * 0.7, 'carbs')} + ${calculatePortion('feijao_carioca', cTarget * 0.3, 'carbs')}`,
        `Gordura: ${calculatePortion('azeite_oliva', fTarget, 'fats')}`,
        `Vegetais: Salada verde à vontade e ${calculatePortion('brocolis', 10, 'carbs')}`,
        `Preparo: Grelhe a proteína. Tempere a salada com azeite.`,
        `Substituição: Troque o frango por ${calculatePortion(isVegan ? 'tempeh' : 'patinho_moido', pTarget, 'protein')}.`
      ]
    });
    options.push({
      description: 'Opção 2: Refeição Prática',
      items: [
        `Proteína: ${calculatePortion(isVegan ? 'proteina_soja' : 'tilapia_grelhada', pTarget, 'protein')}`,
        isLowCarb ? `Carboidrato: Purê de couve-flor` : `Carboidrato: ${calculatePortion('batata_doce', cTarget, 'carbs')}`,
        `Gordura: ${calculatePortion('azeite_oliva', fTarget, 'fats')}`,
        `Vegetais: ${calculatePortion('cenoura', 10, 'carbs')} e folhas verdes`,
        `Preparo: Asse a batata e a tilápia no forno com ervas.`,
        `Substituição: Troque a batata doce por mandioca.`
      ]
    });
    options.push({
      description: 'Opção 3: Macarrão Fit',
      items: [
        `Proteína: ${calculatePortion(isVegan ? 'tempeh' : 'patinho_moido', pTarget, 'protein')}`,
        isLowCarb ? `Carboidrato: Macarrão de abobrinha` : `Carboidrato: ${calculatePortion('macarrao_integral', cTarget, 'carbs')}`,
        `Gordura: Fio de azeite no molho`,
        `Vegetais: Molho de tomate natural caseiro`,
        `Preparo: Faça um molho à bolonhesa magro e misture com a massa.`,
        `Substituição: Troque o patinho por atum em lata.`
      ]
    });
  } else {
    // Snack
    options.push({
      description: 'Opção 1: Shake Rápido',
      items: [
        `Proteína: ${calculatePortion(isVegan ? 'proteina_soja' : 'whey_protein', pTarget, 'protein')}`,
        isLowCarb ? `Carboidrato: Leite de amêndoas` : `Carboidrato: ${calculatePortion('banana_prata', cTarget, 'carbs')}`,
        `Gordura: ${calculatePortion('pasta_amendoim', fTarget, 'fats')}`,
        `Preparo: Bata no liquidificador com gelo.`
      ]
    });
    if (!isVegan) {
      options.push({
        description: 'Opção 2: Sanduíche Natural',
        items: [
          `Proteína: ${calculatePortion('frango_desfiado', pTarget, 'protein')}`,
          isLowCarb ? `Carboidrato: Wrap de folha de couve` : `Carboidrato: ${calculatePortion('pao_integral', cTarget, 'carbs')}`,
          `Gordura: Adicione creme de ricota light`,
          `Vegetais: Alface e tomate`,
          `Preparo: Monte o sanduíche frio ou tostado.`
        ]
      });
    }
    options.push({
      description: 'Opção 3: Mix de Frutas e Castanhas',
      items: [
        `Proteína: ${calculatePortion(isVegan ? 'tofu' : 'queijo_cottage', pTarget, 'protein')}`,
        isLowCarb ? `Carboidrato: Morangos` : `Carboidrato: ${calculatePortion('maca', cTarget, 'carbs')}`,
        `Gordura: ${calculatePortion('castanha_para', fTarget, 'fats')}`,
        `Preparo: Consuma in natura.`
      ]
    });
  }

  return options;
}
