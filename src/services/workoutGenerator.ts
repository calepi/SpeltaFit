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
      group: string;
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

function getAdvancedTechnique(experience: string, allGoals: string, isCompound: boolean, isLastExercise: boolean) {
  const exp = experience.toLowerCase();
  const isHypertrophy = allGoals.includes('hipertrofia') || allGoals.includes('estética') || allGoals.includes('definição');
  
  if (exp.includes('iniciante') || exp.includes('sedentário')) {
    // Keep it simple for beginners, maybe "Duas Cargas" as it's safe
    if (Math.random() > 0.8 && !isCompound) {
      return {
        method: 'Duas Cargas (Drop 50%)',
        notes: 'Técnica Avançada: Na última série, após a falha, reduza a carga pela metade e faça o máximo de repetições possíveis sem descanso.'
      };
    }
    return { method: 'Série Normal', notes: 'Série Normal: Execute as repetições indicadas com uma carga que seja desafiadora, mas que permita manter a postura correta. Descanse o tempo prescrito entre as séries.' };
  }

  if (exp.includes('intermediário')) {
    if (Math.random() > 0.7) {
      const techniques = [
        { method: 'Pirâmide Crescente', notes: 'Técnica Avançada: Aumente a carga e diminua as repetições a cada série (ex: 12, 10, 8, 6).' },
        { method: 'Ponto Zero', notes: 'Técnica Avançada: Faça uma pausa de 3 a 5 segundos no ponto de maior alongamento do músculo (fase excêntrica) em cada repetição.' }
      ];
      return techniques[Math.floor(Math.random() * techniques.length)];
    }
    return { method: 'Série Normal', notes: 'Série Normal: Execute as repetições indicadas com uma carga que seja desafiadora, mas que permita manter a postura correta. Descanse o tempo prescrito entre as séries.' };
  }

  // Avançado / Atleta
  if (Math.random() > 0.5) {
    const techniques = [];
    if (isLastExercise && isHypertrophy) {
      techniques.push({ method: 'FST-7', notes: 'Técnica FST-7: Na última série do exercício, faça 7 mini-séries de 8-12 repetições com apenas 30 segundos de descanso entre elas. Alongue o músculo durante o descanso.' });
      techniques.push({ method: 'GVT (Adaptação)', notes: 'Técnica GVT: Reduza a carga em 40% e tente realizar 10 séries de 10 repetições com apenas 60 segundos de descanso. Foco total no volume e pump muscular.' });
    }
    if (!isCompound) {
      techniques.push({ method: 'Drop-set', notes: 'Técnica Drop-set: Na última série, após a falha, reduza a carga em 20% e vá até a falha novamente. Repita mais 1 ou 2 vezes sem descanso.' });
      techniques.push({ method: 'SST', notes: 'Técnica SST: Faça 1 série até a falha (8-10 reps). Descanse 45s, falha. Descanse 30s, falha. Descanse 15s, falha. Descanse 5s, falha. Reduza a carga em 20% e repita.' });
      techniques.push({ method: 'Bi-Set (Mental)', notes: 'Técnica Bi-Set: Imediatamente após terminar este exercício, faça o máximo de repetições de um exercício com peso corporal para o mesmo grupo muscular (ex: flexões para peito, agachamento livre para pernas).' });
    } else {
      techniques.push({ method: 'Rest-Pause', notes: 'Técnica Rest-Pause: Vá até a falha. Descanse 10 a 15 segundos. Faça mais repetições até a falha. Repita 2 a 3 vezes na última série.' });
      techniques.push({ method: 'Cluster Set', notes: 'Técnica Cluster Set: Use uma carga pesada (85% 1RM). Faça mini-séries de 3-4 repetições com 15-20 segundos de descanso entre elas, até totalizar as repetições alvo da série.' });
      techniques.push({ method: 'Heavy Duty', notes: 'Técnica Heavy Duty: Faça apenas UMA série de trabalho, mas vá até a falha absoluta e além (usando repetições parciais ou isometria no final). A carga deve ser extremamente pesada.' });
    }
    
    if (techniques.length > 0) {
      return techniques[Math.floor(Math.random() * techniques.length)];
    }
  }

  return { method: 'Série Normal', notes: 'Série Normal: Execute as repetições indicadas com uma carga que seja desafiadora, mas que permita manter a postura correta. Descanse o tempo prescrito entre as séries.' };
}

function filterExercises(group: keyof typeof EXERCISE_DB, equipment: string, count: number, blacklist: string[] = []) {
  let available = EXERCISE_DB[group].filter(ex => {
    if (blacklist.includes(ex.id)) return false;
    if (equipment === 'Academia Completa') return true;
    if (equipment === 'Apenas Halteres') return ex.equipment === 'Apenas Halteres' || ex.equipment === 'Nenhum';
    return ex.equipment === 'Nenhum';
  });

  // Fallback if not enough exercises found for the equipment
  if (available.length < count) {
    available = EXERCISE_DB[group].filter(ex => !blacklist.includes(ex.id));
    if (available.length < count) {
      available = EXERCISE_DB[group]; // Ultimate fallback
    }
  }

  // Shuffle and pick 'count' exercises
  return available.sort(() => 0.5 - Math.random()).slice(0, count);
}

function getTrainingParameters(hormonalStatus: string, allGoals: string) {
  const isHormonized = hormonalStatus.toLowerCase().includes('hormonizado') || hormonalStatus.toLowerCase().includes('sim');
  const isWeightLoss = allGoals.includes('emagrecimento') || allGoals.includes('perder') || allGoals.includes('definição');

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

export async function generateWorkoutPlanRuleBased(data: AnamnesisData, blacklist: string[] = []): Promise<WorkoutPlan> {
  const allGoals = [data.goal, data.secondaryGoal, data.tertiaryGoal || ''].join(' ').toLowerCase();
  const params = getTrainingParameters(data.hormonalStatus, allGoals);
  const isWeightLoss = allGoals.includes('emagrecimento') || allGoals.includes('definição');
  const isStrength = allGoals.includes('força');
  const isHypertrophy = allGoals.includes('hipertrofia');
  const isEndurance = allGoals.includes('resistência') || allGoals.includes('condicionamento');
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
      const selected = filterExercises(group.name, data.equipment, group.count, blacklist);
      selected.forEach((ex, index) => {
        const isLastExercise = index === selected.length - 1;
        // Ajustar parâmetros por exercício baseado no objetivo
        let exReps = params.reps;
        let exSets = params.sets;
        let exRest = params.rest;
        let exRir = params.rir;
        let exMethod = params.method;
        let exNotes = `Músculos: ${(ex as any).musclesWorked?.join(', ') || ''}. ${(ex as any).description || ''}`;

        if (isStrength && ex.mechanics === 'Composto') {
          exReps = '4-6';
          exRest = '180 segundos';
          exRir = 'RIR 1';
        } else if (isEndurance || allGoals.includes('condicionamento')) {
          exReps = '15-20';
          exRest = '45 segundos';
        }

        // Aplicar técnicas avançadas do E-book
        const advancedTech = getAdvancedTechnique(data.experience, allGoals, ex.mechanics === 'Composto', isLastExercise);
        if (advancedTech.method !== 'Série Normal') {
          exMethod = advancedTech.method;
          exNotes += `\n\n${advancedTech.notes}`;
        }

        exercises.push({
          id: ex.id + '_' + Math.random().toString(36).substr(2, 5),
          name: ex.name,
          group: ex.group,
          method: exMethod,
          sets: exSets,
          reps: exReps,
          rir: exRir,
          suggestedLoad: params.load,
          setup: `Semana 1 (Calibração): Comece com uma carga leve (aprox. 30-40% do que acha que aguenta). Faça 1 série de teste. Se estiver muito fácil, suba o peso até que as últimas repetições da série fiquem difíceis, mantendo a postura.`,
          rest: exRest,
          notes: exNotes,
          executionDetails: (ex as any).execution || `1. Posicione-se corretamente.\n2. Execute o movimento de forma controlada.\n3. Retorne à posição inicial resistindo ao peso.`,
          videoUrl: (ex as any).videoUrl
        });
      });
    });

    let cardio = undefined;
    if (isWeightLoss || allGoals.includes('condicionamento') || data.cardioPreference !== 'Não gosto de cardio') {
      const isHIIT = isWeightLoss;
      cardio = {
        type: data.cardioPreference !== 'Não gosto de cardio' ? data.cardioPreference : 'Esteira/Caminhada Rápida',
        method: isHIIT ? 'HIIT (Treino Intervalado de Alta Intensidade)' : 'LISS (Cardio de Baixa Intensidade)',
        duration: isHIIT ? '20-30 min' : '15-45 min',
        intensity: isHIIT ? 'Alta/Moderada' : 'Leve',
        setup: `Semana 1 (Calibração): Comece em um ritmo confortável (ex: Esteira a 5km/h ou Bike no nível 2). Aumente gradativamente até atingir a intensidade alvo.`,
        notes: isHIIT 
          ? 'Técnica HIIT: Alterne entre períodos curtos de esforço máximo (ex: 1 min correndo rápido) e períodos de recuperação ativa (ex: 1 a 2 min caminhando). Isso acelera o metabolismo e a queima de gordura.'
          : 'Técnica LISS: Mantenha um ritmo constante e confortável onde você consiga manter uma conversa sem perder o fôlego (ex: caminhada rápida, bicicleta leve). Ideal para recuperação e queima de gordura sem sobrecarregar as articulações.'
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
  monthlyFeedback: string,
  exerciseFeedback: Record<string, any> = {}
): Promise<AdjustmentResponse> {
  // 1. Analisar o feedback dos exercícios para criar uma blacklist
  const blacklist: string[] = [];
  let painCount = 0;
  let badExecutionCount = 0;

  Object.entries(exerciseFeedback).forEach(([key, feedback]) => {
    // key is like w1-d0-exId
    const parts = key.split('-');
    const exId = parts.slice(2).join('-'); // Reconstruct exercise ID
    
    if (feedback.pain) {
      blacklist.push(exId);
      painCount++;
    } else if (feedback.execution === 'Ruim') {
      blacklist.push(exId);
      badExecutionCount++;
    }
  });

  // 2. Analisar checkins para ajustar volume (simulado via userData temporário)
  let highEffortCount = 0;
  Object.values(checkins).forEach(checkin => {
    if (checkin.effort === 'Máximo (10)' || checkin.effort === 'Muito Difícil (8-9)') {
      highEffortCount++;
    }
  });

  // Se o aluno relatou muito esforço máximo, podemos reduzir os dias ou mudar a experiência para gerar um treino mais leve
  const adjustedUserData = { ...userData };
  let volumeMessage = "O volume de treino foi mantido para continuar a progressão.";
  
  if (highEffortCount > 5 || monthlyFeedback.includes('Exausto') || monthlyFeedback.includes('Não recuperei')) {
    volumeMessage = "Notamos um alto nível de fadiga nos seus check-ins diários. O volume/intensidade foi levemente ajustado para permitir melhor recuperação.";
    // Reduzir dias se for muito alto, ou mudar experiência para gerar menos técnicas avançadas
    if (adjustedUserData.experience.includes('Avançado')) {
      adjustedUserData.experience = 'Intermediário'; // Reduz técnicas avançadas
    }
  } else if (highEffortCount === 0 && (monthlyFeedback.includes('Muito fácil') || monthlyFeedback.includes('Sobrou energia'))) {
    volumeMessage = "Como você relatou boa recuperação e energia, aumentamos a intensidade/técnicas do treino.";
    if (adjustedUserData.experience.includes('Iniciante')) {
      adjustedUserData.experience = 'Intermediário';
    } else if (adjustedUserData.experience.includes('Intermediário')) {
      adjustedUserData.experience = 'Avançado';
    }
  }

  // 3. Gerar o novo plano com a blacklist e dados ajustados
  const newPlan = await generateWorkoutPlanRuleBased(adjustedUserData, [...new Set(blacklist)]);
  
  // Extrair o número do mesociclo atual
  const currentMesoMatch = originalPlan.phaseName.match(/Mesociclo (\d+)/);
  const nextMeso = currentMesoMatch ? parseInt(currentMesoMatch[1]) + 1 : 2;
  newPlan.phaseName = `Mesociclo ${nextMeso} - Evolução Contínua`;
  
  let analysis = `Análise concluída com sucesso! \n\n`;
  analysis += `${volumeMessage}\n`;
  
  if (painCount > 0) {
    analysis += `\nIdentificamos ${painCount} exercício(s) que causaram dor articular e eles foram substituídos por variações mais seguras. `;
  }
  if (badExecutionCount > 0) {
    analysis += `\nSubstituímos ${badExecutionCount} exercício(s) onde você relatou dificuldade de execução para melhorar sua biomecânica. `;
  }

  return {
    analysis: analysis.trim(),
    updatedPlan: newPlan
  };
}
