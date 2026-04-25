import { NutriAnamnesisData, NutritionalPlan } from '../types/nutrition';
import { WorkoutPlan } from './workoutGenerator';

export interface EcosystemAnalysis {
  status: 'Otimizado' | 'Requer Atenção' | 'Ajuste Automático Aplicado';
  details: {
    category: 'Músculo/Treino' | 'Nutrição' | 'Strava/Cardio' | 'Metas e Peso';
    message: string;
    actionTaken: string | null;
  }[];
  isDeficit: boolean;
  recommendedCaloricChange: number;
}

/**
 * Motor de Ecossistema (Ecosystem Engine)
 * Monitora proativamente a anamnese original vs os dados mais recentes de evolução,
 * atividades do Strava e checkins, recalculando a rota sem uso de IA (Regras de Negócio Algorítmicas).
 */
export function analyzeEcosystemContinuously(
  anamnesis: NutriAnamnesisData | null,
  currentWeight: number,
  stravaActivities: any[],
  workoutConsistency: number // 0 a 100
): EcosystemAnalysis {
  const analysis: EcosystemAnalysis = {
    status: 'Otimizado',
    details: [],
    isDeficit: false,
    recommendedCaloricChange: 0,
  };

  if (!anamnesis) {
    analysis.details.push({
      category: 'Metas e Peso',
      message: 'Aguardando preenchimento da anamnese principal para comparar métricas.',
      actionTaken: null
    });
    return analysis;
  }

  const initialWeight = Number(anamnesis.weight);
  const targetWeight = initialWeight; // TODO: handle target weight safely
  const goalGroup = [anamnesis.goal, anamnesis.secondaryGoal, anamnesis.tertiaryGoal].join(' ').toLowerCase();

  // 1. Análise de Meta de Peso vs Peso Atual
  const weightDiff = currentWeight - initialWeight;
  let weightAdjusted = false;

  if (goalGroup.includes('emagrecimento') || goalGroup.includes('definição')) {
    analysis.isDeficit = true;
    if (weightDiff >= 0 && initialWeight !== currentWeight) {
      analysis.status = 'Requer Atenção';
      analysis.recommendedCaloricChange = -150;
      analysis.details.push({
        category: 'Metas e Peso',
        message: `Estagnação detectada: Objetivo de emagrecimento, mas o peso estabilizou ou aumentou (${currentWeight}kg).`,
        actionTaken: `Déficit calórico de -150 kcal adicionado por mecanismo de platô basal.`
      });
      weightAdjusted = true;
    } else {
      analysis.details.push({
        category: 'Metas e Peso',
        message: 'Progresso de emagrecimento nos conformes.',
        actionTaken: 'Manutenção do déficit teto estabelecido.'
      });
    }
  } else if (goalGroup.includes('hipertrofia') || goalGroup.includes('ganho') || goalGroup.includes('força')) {
    if (weightDiff <= 0 && initialWeight !== currentWeight) {
      analysis.status = 'Requer Atenção';
      analysis.recommendedCaloricChange = +200;
      analysis.details.push({
        category: 'Metas e Peso',
        message: 'Objetivo de Hipertrofia: Nenhum ganho de peso detectado recentemente.',
        actionTaken: `Superávit calórico de +200 kcal aplicado como estímulo a síntese proteica.`
      });
      weightAdjusted = true;
    } else {
       analysis.details.push({
        category: 'Metas e Peso',
        message: 'Ganho linear de massa mapeado corretamente.',
        actionTaken: 'Nenhuma alteração de macronutrientes do balanço basal.'
      });
    }
  }

  // 2. Análise de Treinos e Consistência (Speltafit)
  if (workoutConsistency < 60 && workoutConsistency > 0) {
    analysis.details.push({
      category: 'Músculo/Treino',
      message: `A consistência está em ${workoutConsistency}%. Risco de perda de resultados pela falta de estímulo constante.`,
      actionTaken: 'Volume das planilhas de treino preservado, mas a progressão de cargas foi congelada temporariamente até estabilizar assiduidade.'
    });
    if (analysis.status === 'Otimizado') analysis.status = 'Requer Atenção';
  } else if (workoutConsistency >= 80) {
    analysis.details.push({
      category: 'Músculo/Treino',
      message: `Alta consistência detectada (${workoutConsistency}%). Mecanismo de Sobrecarga Progressiva acionado.`,
      actionTaken: 'Instrução do Sistema: Sugestão de aumento de +5% na carga nos dois principais exercícios multiarticulares do seu plano.'
    });
  }

  // 3. Integração Strava Dinâmica (Monitoramento de Cardio Extra)
  if (stravaActivities && stravaActivities.length > 0) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    
    const recentActivities = stravaActivities.filter(a => new Date(a.start_date) >= startOfWeek);
    if (recentActivities.length > 0) {
      // Estima calorias (duração x met)
      let sumCardioKcal = 0;
      recentActivities.forEach(a => {
         const met = a.type === 'Run' ? 10 : 8;
         sumCardioKcal += Math.round(met * currentWeight * (a.moving_time / 3600));
      });
      const calPerDayAvg = Math.round(sumCardioKcal / 7);

      analysis.status = 'Ajuste Automático Aplicado';
      analysis.details.push({
        category: 'Strava/Cardio',
        message: `${recentActivities.length} atividades de endurance mapeadas nos últimos 7 dias. Gasto extra de ~${sumCardioKcal} kcal acumulado.`,
        actionTaken: `Ajuste Automático TDEE (SpeltaNutro): Incrementando em média +${calPerDayAvg} kcal/dia nos planos alimentares dinâmicos.`
      });
    } else {
      analysis.details.push({
        category: 'Strava/Cardio',
        message: 'Integração Strava ativa mas sem novos cardios nos últimos 7 dias.',
        actionTaken: null
      });
    }
  }

  return analysis;
}
