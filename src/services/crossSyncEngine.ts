import { NutriAnamnesisData, NutritionalPlan, Meal, MealOption } from '../types/nutrition';
import { WorkoutPlan } from './workoutGenerator';

export interface CrossSyncResult {
  energyCostKcal: number;
  volumeLoadKg: number;
  durationMinutes: number;
  addedCarbsGrams: number;
  addedProteinGrams: number;
  message: string;
  postWorkoutMealAdjustment: MealOption | null;
}

/**
 * Motor de Sincronização Cruzada (Cross-Sync Engine)
 * Calcula o custo energético exato do treino baseado no Volume Load (Séries x Repetições x Carga)
 * e ajusta dinamicamente a prescrição nutricional do dia para otimizar a recuperação.
 */
export function calculateCrossSync(
  completedSets: Record<string, boolean>,
  actualLoads: Record<string, string>,
  workoutDurationSeconds: number,
  userWeight: number
): CrossSyncResult {
  let totalVolumeLoad = 0;
  let totalSetsCompleted = 0;

  // 1. Calcular Volume Load (Tonnage)
  Object.keys(completedSets).forEach(setKey => {
    if (completedSets[setKey]) {
      totalSetsCompleted++;
      
      // Tentar extrair a carga real usada nesta série
      // O formato da chave de carga é similar ao da série, mas sem o índice final, ou com o índice
      // Vamos tentar buscar a carga específica da série ou a carga geral do exercício
      const loadKeySpecific = setKey; // w1-d0-exId-0
      const loadKeyGeneral = setKey.substring(0, setKey.lastIndexOf('-')); // w1-d0-exId

      const loadStr = actualLoads[loadKeySpecific] || actualLoads[loadKeyGeneral] || '0';
      const loadKg = parseFloat(loadStr.replace(',', '.').replace(/[^0-9.]/g, '')) || 0;

      // Assumimos uma média de 10 repetições por série para o cálculo base se não tivermos o número exato
      // Em uma versão futura, podemos extrair as repetições exatas do plano
      const estimatedReps = 10; 
      
      totalVolumeLoad += (loadKg * estimatedReps);
    }
  });

  // 2. Calcular Custo Energético (Energy Cost)
  const durationMinutes = Math.floor(workoutDurationSeconds / 60);
  
  // Fórmula Híbrida SpeltaFit:
  // Gasto Basal do Treino (Tempo x Fator de Intensidade) + Gasto Específico do Volume Load
  // Fator de intensidade: ~0.08 kcal por kg corporal por minuto de musculação intensa
  const timeBasedBurn = durationMinutes * (userWeight * 0.08);
  
  // Gasto do Volume Load: ~0.03 kcal por kg levantado (Trabalho mecânico)
  const volumeBasedBurn = totalVolumeLoad * 0.03;

  const totalEnergyCost = Math.round(timeBasedBurn + volumeBasedBurn);

  // 3. Calcular Ajuste de Macronutrientes (Cross-Sync)
  // Se o gasto for significativo (> 150 kcal), geramos um ajuste pós-treino
  let addedCarbsGrams = 0;
  let addedProteinGrams = 0;
  let postWorkoutMealAdjustment: MealOption | null = null;
  let message = "Treino leve ou moderado. Mantenha a dieta padrão.";

  if (totalEnergyCost > 150) {
    // 70% da energia extra vai para Carboidratos (Ressíntese de Glicogênio)
    // 30% da energia extra vai para Proteínas (Reparo Tecidual)
    addedCarbsGrams = Math.round((totalEnergyCost * 0.7) / 4);
    addedProteinGrams = Math.round((totalEnergyCost * 0.3) / 4);

    message = `🔥 Treino Intenso Detectado! Volume Load: ${totalVolumeLoad}kg. Gasto extra: ${totalEnergyCost} kcal. Adicionamos ${addedCarbsGrams}g de Carboidratos e ${addedProteinGrams}g de Proteínas na sua próxima refeição para otimizar a recuperação.`;

    postWorkoutMealAdjustment = {
      description: '⚡ Ajuste Dinâmico Pós-Treino (Cross-Sync)',
      items: [
        `Proteína Extra: +${addedProteinGrams}g (Ex: ${Math.round((addedProteinGrams/25)*100)}g de Frango ou ${Math.round((addedProteinGrams/24)*30)}g de Whey)`,
        `Carboidrato Extra: +${addedCarbsGrams}g (Ex: ${Math.round((addedCarbsGrams/28)*100)}g de Arroz ou ${Math.round((addedCarbsGrams/20)*100)}g de Batata Doce)`,
        `Motivo: Compensação do gasto energético de ${totalEnergyCost} kcal gerado pelo Volume Load de ${totalVolumeLoad}kg no treino de hoje.`
      ]
    };
  }

  return {
    energyCostKcal: totalEnergyCost,
    volumeLoadKg: totalVolumeLoad,
    durationMinutes,
    addedCarbsGrams,
    addedProteinGrams,
    message,
    postWorkoutMealAdjustment
  };
}

/**
 * Motor de Auto-Regulação (Readiness Engine)
 * Avalia o estado de prontidão do aluno antes do treino e ajusta o volume/intensidade.
 */
export function evaluateReadiness(sleepQuality: number, muscleSoreness: number, stressLevel: number): { score: number, zone: 'Red' | 'Yellow' | 'Green', recommendation: string, volumeAdjustment: number, intensityAdjustment: number } {
  // Escala de 1 a 5 para cada (1 = Pior, 5 = Melhor)
  // Soreness: 1 = Muita dor, 5 = Nenhuma dor
  const score = sleepQuality + muscleSoreness + stressLevel;

  if (score < 8) {
    return {
      score,
      zone: 'Red',
      recommendation: '⚠️ Prontidão Baixa: Seu corpo precisa de recuperação. O motor reduziu o volume e a carga do treino de hoje para evitar lesões.',
      volumeAdjustment: -1, // Reduzir 1 série de cada exercício
      intensityAdjustment: 0.85 // Reduzir carga em 15%
    };
  } else if (score <= 11) {
    return {
      score,
      zone: 'Yellow',
      recommendation: '✅ Prontidão Normal: Siga o treino conforme planejado.',
      volumeAdjustment: 0,
      intensityAdjustment: 1.0
    };
  } else {
    return {
      score,
      zone: 'Green',
      recommendation: '🚀 Prontidão Alta: Você está na sua melhor forma hoje! O motor sugere um leve aumento de carga ou repetições.',
      volumeAdjustment: 0,
      intensityAdjustment: 1.05 // Aumentar carga em 5%
    };
  }
}
