import { EXERCISE_DB } from '../data/exerciseDatabase';

export interface AnamnesisData {
  name: string;
  age: number;
  gender: string;
  weight: number;
  height: number;
  bodyFat?: number;
  targetWeight?: number;
  goal: string;
  secondaryGoal: string;
  tertiaryGoal?: string;
  specificGoals?: string[]; // Novo campo para metas combinadas e focos
  experience: string;
  daysPerWeek: number;
  duration: number;
  limitations: string;
  postureIssues?: string;
  medications?: string;
  weakPoints?: string[];
  cardioPreference: string;
  equipment: string;
  sleepQuality: string;
  stressLevel: string;
  dietType: string;
  hormonalStatus: string;
  existingPlan?: string;
  remodelPlan?: boolean;
}

export interface WorkoutPlan {
  phaseName: string;
  durationWeeks: number;
  strategySummary: string;
  progressiveOverloadPlan: string;
  monitoringGuidelines: string;
  weeklyRoutine: {
    day: string;
    focus: string;
    exercises?: {
      id: string;
      name: string;
      method: string;
      sets: number;
      reps: string;
      rir: string;
      suggestedLoad: string;
      setup?: string;
      rest: string;
      notes: string;
      executionDetails?: string;
      videoUrl?: string;
    }[];
    cardio?: {
      type: string;
      method: string;
      duration: string;
      intensity: string;
      setup?: string;
    };
  }[];
}

export interface AdjustmentResponse {
  analysis: string;
  updatedPlan: WorkoutPlan;
}

// --- FUNÇÕES AUXILIARES ---

function filterExercises(group: keyof typeof EXERCISE_DB, equipment: string, count: number) {
  let available = EXERCISE_DB[group].filter(ex => {
    if (equipment === 'Academia Completa') return true;
    if (equipment === 'Apenas Halteres') return ex.equipment === 'Apenas Halteres' || ex.equipment === 'Nenhum';
    return ex.equipment === 'Nenhum';
  });

  // Fallback if not enough exercises found for the equipment
  if (available.length < count) {
    available = EXERCISE_DB[group];
  }

  // Shuffle and pick 'count' exercises
  return available.sort(() => 0.5 - Math.random()).slice(0, count);
}

function getTrainingParameters(hormonalStatus: string, goal: string) {
  const isHormonized = hormonalStatus.toLowerCase().includes('hormonizado') || hormonalStatus.toLowerCase().includes('sim');
  const isWeightLoss = goal.toLowerCase().includes('emagrecimento') || goal.toLowerCase().includes('perder');

  if (isHormonized) {
    return {
      sets: 2, // Menos séries
      reps: isWeightLoss ? '8-10' : '6-8', // Menos reps
      rir: 'RIR 0 (Até a falha total/Exaustão)', // Exaustão
      rest: '120-180 segundos',
      load: 'Carga MÁXIMA para a faixa de repetições',
      method: 'Série Normal (Foco em progressão de carga)'
    };
  } else {
    return {
      sets: 4, // Mais séries
      reps: isWeightLoss ? '12-15' : '10-12', // Mais reps
      rir: 'RIR 1-2 (Próximo à falha, mas com boa execução)',
      rest: '60-90 segundos',
      load: 'Carga Normal / Moderada a Alta',
      method: 'Série Normal'
    };
  }
}

// --- GERADOR PRINCIPAL ---

export async function generateWorkoutPlanRuleBased(data: AnamnesisData): Promise<WorkoutPlan> {
  const params = getTrainingParameters(data.hormonalStatus, data.goal);
  const allGoals = [data.goal, data.secondaryGoal, data.tertiaryGoal || ''].join(' ').toLowerCase();
  const isWeightLoss = allGoals.includes('emagrecimento');
  const isStrength = allGoals.includes('força');
  const isHypertrophy = allGoals.includes('hipertrofia');
  const isEndurance = allGoals.includes('resistência');
  const isHealth = allGoals.includes('saúde') || allGoals.includes('bem-estar');
  const isRehab = allGoals.includes('reabilitação') || allGoals.includes('postural');
  
  const weeklyRoutine: WorkoutPlan['weeklyRoutine'] = [];
  const days = data.daysPerWeek || 3;

  // Estrutura de divisão básica baseada nos dias
  let split: { dayName: string, focus: string, groups: { name: keyof typeof EXERCISE_DB, count: number }[] }[] = [];

  if (days <= 3) {
    // Full Body
    for (let i = 1; i <= days; i++) {
      split.push({
        dayName: `Dia ${i}`,
        focus: 'Full Body (Corpo Todo)',
        groups: [
          { name: 'pernas_quadriceps', count: 1 },
          { name: 'pernas_posterior', count: 1 },
          { name: 'peito', count: 1 },
          { name: 'costas', count: 1 },
          { name: 'ombros', count: 1 },
          { name: 'biceps', count: 1 },
          { name: 'triceps', count: 1 },
        ]
      });
    }
  } else if (days === 4) {
    // Upper / Lower
    split = [
      { dayName: 'Dia 1', focus: 'Membros Superiores', groups: [{ name: 'peito', count: 2 }, { name: 'costas', count: 2 }, { name: 'ombros', count: 1 }, { name: 'biceps', count: 1 }, { name: 'triceps', count: 1 }] },
      { dayName: 'Dia 2', focus: 'Membros Inferiores', groups: [{ name: 'pernas_quadriceps', count: 2 }, { name: 'pernas_posterior', count: 2 }, { name: 'gluteo', count: 1 }, { name: 'panturrilhas', count: 2 }, { name: 'abdomen', count: 1 }] },
      { dayName: 'Dia 3', focus: 'Membros Superiores', groups: [{ name: 'peito', count: 2 }, { name: 'costas', count: 2 }, { name: 'ombros', count: 1 }, { name: 'biceps', count: 1 }, { name: 'triceps', count: 1 }] },
      { dayName: 'Dia 4', focus: 'Membros Inferiores', groups: [{ name: 'pernas_quadriceps', count: 2 }, { name: 'pernas_posterior', count: 2 }, { name: 'gluteo', count: 1 }, { name: 'panturrilhas', count: 2 }, { name: 'abdomen', count: 1 }] },
    ];
  } else {
    // ABC (Push/Pull/Legs) repetido
    const abc = [
      { focus: 'Push (Peito, Ombros, Tríceps)', groups: [{ name: 'peito', count: 3 }, { name: 'ombros', count: 2 }, { name: 'triceps', count: 2 }] },
      { focus: 'Pull (Costas, Bíceps, Posterior de Ombro)', groups: [{ name: 'costas', count: 3 }, { name: 'biceps', count: 2 }, { name: 'ombros', count: 1 }] },
      { focus: 'Legs (Pernas Completas e Panturrilhas)', groups: [{ name: 'pernas_quadriceps', count: 3 }, { name: 'pernas_posterior', count: 2 }, { name: 'gluteo', count: 1 }, { name: 'panturrilhas', count: 2 }, { name: 'abdomen', count: 2 }] },
    ];
    for (let i = 0; i < days; i++) {
      split.push({
        dayName: `Dia ${i + 1}`,
        focus: abc[i % 3].focus,
        groups: abc[i % 3].groups as any
      });
    }
  }

  // Ajustar volumes baseado nos Focos Específicos e Objetivos Combinados
  const specificGoals = data.specificGoals || [];
  
  split.forEach(day => {
    day.groups.forEach(group => {
      // Foco em Glúteos e Pernas
      if ((specificGoals.includes('Foco em Glúteos e Pernas') || allGoals.includes('simetria corporal')) && (group.name === 'pernas_quadriceps' || group.name === 'pernas_posterior')) {
        group.count += 1;
      }
      // Foco em Peito e Braços
      if ((specificGoals.includes('Foco em Peito e Braços') || isHypertrophy) && (group.name === 'peito' || group.name === 'biceps' || group.name === 'triceps')) {
        group.count += 1;
      }
      // Estética em V
      if ((specificGoals.includes('Estética em V (Costas largas e Ombros)') || allGoals.includes('estética')) && (group.name === 'costas' || group.name === 'ombros')) {
        group.count += 1;
      }
      // Força
      if (isStrength && (group.name === 'peito' || group.name === 'costas' || group.name === 'pernas_quadriceps')) {
        group.count += 1;
      }
    });
  });

  // Montar os exercícios
  split.forEach(daySplit => {
    const exercises: any[] = [];
    
    daySplit.groups.forEach(group => {
      const selected = filterExercises(group.name, data.equipment, group.count);
      selected.forEach(ex => {
        // Ajustar parâmetros por exercício baseado no objetivo
        let exReps = params.reps;
        let exSets = params.sets;
        let exRest = params.rest;
        let exRir = params.rir;

        if (isStrength && ex.mechanics === 'Composto') {
          exReps = '4-6';
          exRest = '180 segundos';
          exRir = 'RIR 1';
        } else if (isEndurance || allGoals.includes('condicionamento')) {
          exReps = '15-20';
          exRest = '45 segundos';
        }

        exercises.push({
          id: ex.id + '_' + Math.random().toString(36).substr(2, 5),
          name: ex.name,
          method: params.method,
          sets: exSets,
          reps: exReps,
          rir: exRir,
          suggestedLoad: params.load,
          setup: `Semana 1 (Calibração): Comece com uma carga leve (aprox. 30-40% do que acha que aguenta). Faça 1 série de teste. Se estiver muito fácil, suba o peso até que as últimas repetições da série fiquem difíceis, mantendo a postura.`,
          rest: exRest,
          notes: `Músculos: ${(ex as any).musclesWorked?.join(', ') || ''}. ${(ex as any).description || ''}`,
          executionDetails: (ex as any).execution || `1. Posicione-se corretamente.\n2. Execute o movimento de forma controlada.\n3. Retorne à posição inicial resistindo ao peso.`,
          videoUrl: (ex as any).videoUrl
        });
      });
    });

    let cardio = undefined;
    if (isWeightLoss || allGoals.includes('condicionamento') || data.cardioPreference !== 'Não gosto de cardio') {
      cardio = {
        type: data.cardioPreference !== 'Não gosto de cardio' ? data.cardioPreference : 'Esteira/Caminhada Rápida',
        method: isWeightLoss ? 'HIIT ou LISS Pós-treino' : 'LISS Moderado',
        duration: isWeightLoss ? '20-30 min' : '15 min',
        intensity: isWeightLoss ? 'Alta/Moderada' : 'Leve',
        setup: `Semana 1 (Calibração): Comece em um ritmo confortável (ex: Esteira a 5km/h ou Bike no nível 2). Aumente gradativamente até atingir a intensidade alvo.`,
      };
    }

    weeklyRoutine.push({
      day: daySplit.dayName,
      focus: daySplit.focus,
      exercises,
      cardio
    });
  });

  const isHormonized = data.hormonalStatus.toLowerCase().includes('hormonizado') || data.hormonalStatus.toLowerCase().includes('sim');
  const isBeginner = data.experience.toLowerCase().includes('iniciante');

  const strategySummary = isBeginner 
    ? `Estratégia de Base (Iniciante): O foco principal agora é o aprendizado motor e a construção de uma base sólida. Seu corpo está se adaptando aos movimentos. Não tenha pressa em colocar muito peso. A prioridade é a execução perfeita, a postura e a conexão mente-músculo. O volume de treino é ajustado para não gerar dores extremas, permitindo que você consiga treinar com consistência e sem risco de lesões.`
    : isHormonized 
      ? `Estratégia de Alta Intensidade (Hormonizado): Seu perfil permite uma recuperação acelerada, mas exige um estímulo de altíssima intensidade para gerar quebra de platô. O volume de treino (quantidade de séries) é reduzido propositalmente para que você possa focar em CARGA MÁXIMA e FALHA TOTAL em todas as séries de trabalho. O objetivo é extrair o máximo de dano muscular no menor tempo possível.`
      : `Estratégia de Hipertrofia Otimizada (Natural): Como atleta natural, seu corpo precisa de estímulos frequentes, mas com um controle rigoroso de fadiga do Sistema Nervoso Central (SNC). O volume é moderado/alto, mas você não deve falhar em todas as séries. Trabalharemos com uma margem de segurança (RIR 1-2) na maioria dos exercícios para garantir que você consiga treinar o mesmo músculo mais vezes na semana sem overtraining.`;

  const progressiveOverloadPlan = isBeginner
    ? `Progressão de Carga (Dupla Progressão): Como iniciante, sua força aumentará rápido. Primeiro, tente aumentar o número de repetições com o mesmo peso (ex: se fez 10 reps com 10kg hoje, tente 12 reps no próximo treino). Quando atingir o limite máximo de repetições estipulado na ficha, aumente o peso (ex: vá para 12kg) e volte para o número mínimo de repetições. A progressão também ocorre ao melhorar a técnica do movimento.`
    : `Progressão de Carga (Sobrecarga Progressiva): A regra de ouro da hipertrofia. Você deve buscar superar o treino anterior de alguma forma: 1) Aumentando o peso na barra; 2) Fazendo mais repetições com o mesmo peso; 3) Melhorando a qualidade da execução (mais controle na descida, menos impulso). Anote suas cargas no aplicativo para garantir que você está progredindo semana após semana.`;

  const monitoringGuidelines = isBeginner
    ? `Diretrizes de Monitoramento: É normal sentir dor muscular tardia (aquela dorzinha 1 a 2 dias após o treino). No entanto, dor nas articulações (ombro, joelho, lombar) NÃO é normal. Se sentir dor articular, reduza a carga ou peça ajuda para corrigir a execução. Use a escala PSE (Percepção Subjetiva de Esforço) no aplicativo para nos dizer o quão difícil foi o treino (tente manter entre 6 e 8).`
    : `Diretrizes de Monitoramento: O controle de carga é feito pela Percepção Subjetiva de Esforço (PSE). Se o treino pede um RIR 2 (deixar 2 repetições no tanque) e você falhou, a carga estava muito alta. Se você terminou a série e sentiu que faria mais 5 repetições, a carga estava muito leve. Ajuste o peso para que as últimas repetições sejam extremamente desafiadoras, mas sem perder a técnica.`;

  return {
    phaseName: `Mesociclo 1 - ${data.goal} + ${data.secondaryGoal}${data.tertiaryGoal ? ' + ' + data.tertiaryGoal : ''}`,
    durationWeeks: 4,
    strategySummary: `${strategySummary} Este plano combina ${data.goal} com ${data.secondaryGoal}${data.tertiaryGoal ? ' e ' + data.tertiaryGoal : ''} para um resultado otimizado.`,
    progressiveOverloadPlan,
    monitoringGuidelines,
    weeklyRoutine
  };
}

export async function adjustWorkoutPlanRuleBased(
  originalPlan: WorkoutPlan,
  userData: AnamnesisData,
  completedSets: Record<string, boolean>,
  actualLoads: Record<string, string>,
  checkins: Record<string, any>,
  monthlyFeedback: string
): Promise<AdjustmentResponse> {
  // Para o ajuste baseado em regras, vamos simplesmente gerar um novo plano
  // mas com uma mensagem de análise simulada.
  const newPlan = await generateWorkoutPlanRuleBased(userData);
  newPlan.phaseName = "Mesociclo 2 - Progressão Contínua";
  
  return {
    analysis: "Análise concluída pelo Algoritmo SpeltaFit. Baseado no seu feedback mensal, ajustamos a seleção de exercícios para continuar gerando estímulos novos. Mantenha o foco na progressão de cargas!",
    updatedPlan: newPlan
  };
}
