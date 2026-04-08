import { NutriAnamnesisData, NutritionalPlan } from '../types/nutrition';

export async function generateNutritionalPlan(data: NutriAnamnesisData): Promise<NutritionalPlan> {
  // 1. Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor Equation
  let bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age;
  bmr += data.gender === 'Masculino' ? 5 : -161;

  // 2. Determine Activity Multiplier
  let activityMultiplier = 1.2; // Sedentário
  if (data.activityLevel.includes('Levemente')) activityMultiplier = 1.375;
  else if (data.activityLevel.includes('Moderadamente')) activityMultiplier = 1.55;
  else if (data.activityLevel.includes('Muito Ativo')) activityMultiplier = 1.725;
  else if (data.activityLevel.includes('Extremamente')) activityMultiplier = 1.9;

  // 3. Calculate TDEE (Total Daily Energy Expenditure)
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
  } else if (data.goal.includes('Hipertrofia')) {
    targetCalories = tdee + 300;
    strategySummary = 'Superávit calórico leve para otimizar o ganho de massa muscular minimizando o ganho de gordura.';
  } else if (data.goal.includes('Recomposição Corporal')) {
    targetCalories = tdee - 100; // Leve déficit
    strategySummary = 'Manutenção/Leve déficit calórico com alta proteína para promover perda de gordura e ganho muscular simultâneos.';
  } else if (data.goal.includes('Ganho de Peso')) {
    targetCalories = tdee + 500;
    strategySummary = 'Superávit calórico focado em alimentos densos em calorias e nutrientes para ganho de peso saudável.';
  } else {
    strategySummary = 'Dieta normocalórica focada em manutenção, saúde e performance.';
  }

  // Ensure minimum calories for safety
  if (data.gender === 'Feminino' && targetCalories < 1200) targetCalories = 1200;
  if (data.gender === 'Masculino' && targetCalories < 1500) targetCalories = 1500;

  // 5. Calculate Macros
  // Protein: 2.0g/kg for most, 2.2g/kg for cutting/recomp, 1.8g/kg for bulking
  let proteinPerKg = 2.0;
  if (data.goal.includes('Emagrecimento') || data.goal.includes('Recomposição')) proteinPerKg = 2.2;
  else if (data.goal.includes('Hipertrofia')) proteinPerKg = 1.8;
  
  const proteinGrams = Math.round(data.weight * proteinPerKg);
  const proteinCalories = proteinGrams * 4;

  // Fat: 0.8g - 1.0g/kg
  let fatPerKg = 0.9;
  if (data.dietaryPreference.includes('Cetogênica') || data.dietaryPreference.includes('Low Carb')) {
    fatPerKg = 1.5; // Higher fat for low carb
  }
  const fatGrams = Math.round(data.weight * fatPerKg);
  const fatCalories = fatGrams * 9;

  // Carbs: The rest
  let remainingCalories = targetCalories - proteinCalories - fatCalories;
  
  // Adjust if low carb/keto
  if (data.dietaryPreference.includes('Cetogênica')) {
    remainingCalories = 30 * 4; // Max 30g carbs
    // Recalculate fats to fill the gap
    const newFatCalories = targetCalories - proteinCalories - remainingCalories;
    targetCalories = proteinCalories + newFatCalories + remainingCalories; // Adjust total if needed
  } else if (data.dietaryPreference.includes('Low Carb')) {
    remainingCalories = 100 * 4; // Max 100g carbs
  }

  let carbGrams = Math.round(remainingCalories / 4);
  if (carbGrams < 0) carbGrams = 0; // Prevent negative carbs

  // 6. Water Intake Goal
  const waterGoalLiters = (data.weight * 35) / 1000; // 35ml per kg
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

  // 8. Generate Meals (Detailed Menu)
  const mealsCount = parseInt(data.mealsPerDay.charAt(0)) || 4;
  const meals = [];
  
  const mealNames = ['Café da Manhã', 'Lanche da Manhã', 'Almoço', 'Lanche da Tarde', 'Jantar', 'Ceia'];
  const times = ['07:00', '10:00', '13:00', '16:00', '19:30', '22:00'];

  const mealProtein = Math.round(proteinGrams / mealsCount);
  const mealCarbs = Math.round(carbGrams / mealsCount);
  const mealFats = Math.round(fatGrams / mealsCount);

  // Helper to generate options based on meal type and macros
  const generateOptions = (mealName: string, isLowCarb: boolean) => {
    const options = [];
    
    if (mealName.includes('Café') || mealName.includes('Lanche da Manhã')) {
      options.push({
        description: 'Opção 1: Ovos Mexidos com Pão e Fruta',
        items: [
          `Proteína: ${Math.round(mealProtein / 6)} ovos inteiros mexidos`,
          isLowCarb ? `Carboidrato: 1 porção pequena de mamão` : `Carboidrato: ${Math.round(mealCarbs / 25)} fatias de pão integral + 1 fruta`,
          `Gordura: Preparar com 1 fio de azeite`,
          `Preparo: Bata os ovos com uma pitada de sal. Aqueça a frigideira com azeite e mexa até o ponto desejado.`,
          `Substituição: Troque os ovos por ${mealProtein}g de frango desfiado ou atum.`
        ]
      });
      options.push({
        description: 'Opção 2: Mingau de Aveia Proteico (Doce)',
        items: [
          `Proteína: 1 scoop (${mealProtein}g) de Whey Protein`,
          isLowCarb ? `Carboidrato: 2 colheres de sopa de aveia` : `Carboidrato: ${Math.round(mealCarbs / 15)} colheres de sopa de aveia + 1 banana amassada`,
          `Gordura: 1 colher de sopa de pasta de amendoim`,
          `Preparo: Cozinhe a aveia com água ou leite desnatado. Desligue o fogo, misture o whey e a pasta de amendoim.`,
          `Substituição: Troque o whey por iogurte natural proteico.`
        ]
      });
      options.push({
        description: 'Opção 3: Crepioca Recheada',
        items: [
          `Proteína: ${mealProtein}g de Frango desfiado ou Queijo branco magro`,
          isLowCarb ? `Carboidrato: Massa feita apenas com ovos (Omelete)` : `Carboidrato: Massa com 2 colheres de goma de tapioca + 1 ovo`,
          `Gordura: Ovos e queijo já fornecem a gordura`,
          `Preparo: Misture a tapioca com o ovo, faça a massa na frigideira e recheie com a proteína.`,
          `Substituição: Troque o frango por carne moída magra.`
        ]
      });
    } else if (mealName.includes('Almoço') || mealName.includes('Jantar')) {
      options.push({
        description: 'Opção 1: Prato Tradicional Brasileiro',
        items: [
          `Proteína: ${mealProtein * 3}g de Peito de Frango grelhado ou Patinho moído`,
          isLowCarb ? `Carboidrato: Apenas legumes (brócolis, couve-flor, abobrinha)` : `Carboidrato: ${Math.round(mealCarbs * 3)}g de Arroz integral + ${Math.round(mealCarbs)}g de Feijão`,
          `Gordura: ${Math.round(mealFats)}ml de Azeite de oliva extra virgem (fio por cima da salada)`,
          `Vegetais: Salada de folhas verdes à vontade (alface, rúcula, espinafre)`,
          `Preparo: Grelhe a carne com temperos naturais (alho, cebola, páprica). Evite óleo em excesso.`,
          `Substituição: Troque o frango por peixe magro (tilápia) ou carne suína magra (lombo).`
        ]
      });
      options.push({
        description: 'Opção 2: Macarrão Proteico Rápido',
        items: [
          `Proteína: ${mealProtein * 3}g de Carne moída magra (Patinho)`,
          isLowCarb ? `Carboidrato: Macarrão de abobrinha ou pupunha` : `Carboidrato: ${Math.round(mealCarbs * 3)}g de Macarrão integral (peso cozido)`,
          `Gordura: Molho de tomate natural (sem óleo adicionado)`,
          `Vegetais: Adicione cenoura ralada e espinafre no molho`,
          `Preparo: Refogue a carne com cebola e alho, adicione o molho de tomate natural e deixe apurar. Misture com a massa.`,
          `Substituição: Troque a carne moída por atum ralado ao natural ou frango desfiado.`
        ]
      });
      options.push({
        description: 'Opção 3: Escondidinho Fit',
        items: [
          `Proteína: ${mealProtein * 3}g de Frango desfiado`,
          isLowCarb ? `Carboidrato: Purê de couve-flor ou abóbora cabotiá` : `Carboidrato: ${Math.round(mealCarbs * 4)}g de Purê de batata doce ou aipim`,
          `Gordura: Fio de azeite para refogar`,
          `Vegetais: Salada de tomate com pepino para acompanhar`,
          `Preparo: Faça o purê cozinhando os vegetais. Monte em camadas (purê, frango, purê) e leve ao forno para gratinar.`,
          `Substituição: Troque o purê de batata doce por purê de mandioquinha.`
        ]
      });
    } else {
      // Lanches da tarde / Ceia
      options.push({
        description: 'Opção 1: Iogurte com Frutas e Castanhas',
        items: [
          `Proteína: 1 pote de Iogurte Natural Desnatado + ${Math.round(mealProtein / 2)}g de Whey (opcional)`,
          isLowCarb ? `Carboidrato: 5 morangos picados` : `Carboidrato: 1 maçã picada ou 1/2 mamão papaia`,
          `Gordura: ${Math.round(mealFats)}g de mix de castanhas ou nozes`,
          `Preparo: Misture tudo em um bowl. Pode adicionar canela em pó a gosto.`,
          `Substituição: Troque o iogurte por queijo cottage ou ricota amassada.`
        ]
      });
      options.push({
        description: 'Opção 2: Sanduíche Natural',
        items: [
          `Proteína: ${mealProtein * 2}g de Frango desfiado com requeijão light`,
          isLowCarb ? `Carboidrato: Enrolado em folha de couve (Wrap de couve)` : `Carboidrato: 2 fatias de pão de forma integral`,
          `Gordura: O requeijão light já fornece a gordura necessária`,
          `Vegetais: Alface, tomate e cenoura ralada dentro do sanduíche`,
          `Preparo: Misture o frango com o requeijão e monte o sanduíche com os vegetais.`,
          `Substituição: Troque o frango por ovos cozidos amassados (patê de ovo).`
        ]
      });
      options.push({
        description: 'Opção 3: Vitamina Proteica (Shake Rápido)',
        items: [
          `Proteína: 1 scoop (${mealProtein}g) de Whey Protein ou Albumina`,
          isLowCarb ? `Carboidrato: Leite de amêndoas sem açúcar` : `Carboidrato: 200ml de Leite desnatado + 1 fruta (banana ou maçã)`,
          `Gordura: 1 colher de sopa de chia ou linhaça`,
          `Preparo: Bata tudo no liquidificador com gelo.`,
          `Substituição: Pode usar leite de soja zero açúcar no lugar do leite desnatado.`
        ]
      });
    }
    return options;
  };

  const isLowCarb = data.dietaryPreference.includes('Low Carb') || data.dietaryPreference.includes('Cetogênica');

  for (let i = 0; i < mealsCount; i++) {
    let nameIndex = i;
    if (mealsCount === 3) nameIndex = i * 2; // 0, 2, 4 (Café, Almoço, Jantar)
    if (mealsCount === 4 && i === 3) nameIndex = 4; // 0, 1, 2, 4 (Café, Lanche, Almoço, Jantar)

    const mealName = mealNames[nameIndex] || `Refeição ${i + 1}`;
    
    meals.push({
      name: mealName,
      time: times[nameIndex] || 'Horário a definir',
      options: generateOptions(mealName, isLowCarb)
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
      dosage: '1 scoop (aprox. 30g)',
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
