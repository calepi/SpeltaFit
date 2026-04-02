import { EXERCISE_DB } from '../data/exerciseDatabase';

export interface ExistingExercise {
  name: string;
  sets?: string;
  reps?: string;
}

export interface ExistingDay {
  dayName: string;
  exercises: ExistingExercise[];
}

export interface AnamnesisData {
  name: string;
  age: number | undefined;
  gender: string;
  weight: number | undefined;
  height: number | undefined;
  bodyFat?: number;
  targetWeight?: number;
  goal: string;
  secondaryGoal: string;
  tertiaryGoal?: string;
  specificGoals?: string[];
  experience: string;
  daysPerWeek: number | undefined;
  duration: number | undefined;
  limitations: string;
  postureIssues?: string;
  medications?: string;
  cardioPreference: string;
  equipment: string;
  sleepQuality: string;
  stressLevel: string;
  dietType: string;
  hormonalStatus: string;
  existingPlan?: string; // Keep for legacy/quick paste
  structuredExistingPlan?: ExistingDay[]; // New structured format
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

function filterExercises(
  group: keyof typeof EXERCISE_DB, 
  equipment: string, 
  count: number, 
  blacklist: string[] = [],
  experience: string = 'iniciante',
  isOverweight: boolean = false
) {
  let available = EXERCISE_DB[group].filter(ex => {
    if (blacklist.includes(ex.id)) return false;
    if (equipment === 'Academia Completa') {
      // no equipment filter needed
    } else if (equipment === 'Apenas Halteres') {
      if (ex.equipment !== 'Apenas Halteres' && ex.equipment !== 'Nenhum') return false;
    } else {
      if (ex.equipment !== 'Nenhum') return false;
    }

    // Level filtering
    const exp = experience.toLowerCase();
    if (exp.includes('iniciante')) {
      if (isOverweight && ex.level !== 'iniciante') return false;
      if (!isOverweight && ex.level === 'avançado') return false;
    } else if (exp.includes('intermediário')) {
      // Intermediário can do iniciante and intermediário, maybe avançado if needed, but let's allow all
    }

    return true;
  });

  // Fallback if not enough exercises found for the equipment and level
  if (available.length < count) {
    available = EXERCISE_DB[group].filter(ex => {
      if (blacklist.includes(ex.id)) return false;
      if (equipment === 'Academia Completa') return true;
      if (equipment === 'Apenas Halteres') return ex.equipment === 'Apenas Halteres' || ex.equipment === 'Nenhum';
      return ex.equipment === 'Nenhum';
    });
    
    if (available.length < count) {
      available = EXERCISE_DB[group].filter(ex => !blacklist.includes(ex.id));
      if (available.length < count) {
        available = EXERCISE_DB[group]; // Ultimate fallback
      }
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
  
  // Determinar a duração do ciclo (em semanas) com base na experiência e objetivos
  let durationWeeks = 4;
  const expLower = data.experience.toLowerCase();
  if (expLower.includes('iniciante')) {
    durationWeeks = 4; // Iniciantes precisam de reavaliação mais frequente (Mensal)
  } else if (expLower.includes('intermediário')) {
    durationWeeks = 8; // Intermediários podem sustentar ciclos um pouco mais longos (Bimestral)
  } else if (expLower.includes('avançado')) {
    durationWeeks = 12; // Avançados se beneficiam de periodizações mais longas (Trimestral)
  }
  
  // Calcular IMC para verificar se é iniciante acima do peso
  let weightNum = data.weight;
  let heightNum = data.height;
  if (heightNum && heightNum > 10) heightNum = heightNum / 100; // converter cm para metros
  
  let bmi = 22; // default
  if (weightNum && heightNum && heightNum > 0) {
    bmi = weightNum / (heightNum * heightNum);
  }
  const isOverweight = bmi >= 28;

  // Ajustes finos na duração baseados no objetivo
  if (isWeightLoss && durationWeeks > 8) {
    durationWeeks = 8; // Emagrecimento precisa de ajustes mais rápidos na dieta/treino
  }

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
      const selected = filterExercises(group.name, data.equipment, group.count, blacklist, data.experience, isOverweight);
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
          setup: `Estratégia de Progressão: Inicie o bloco (Semana 1) descobrindo sua carga base. Nas semanas seguintes, tente progredir: adicione 1-2kg de cada lado OU tente fazer 1-2 repetições a mais com a mesma carga, sempre respeitando o RIR.`,
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
        setup: `Estratégia de Progressão: Inicie o bloco com um ritmo confortável. Nas semanas seguintes, tente aumentar levemente a velocidade ou a inclinação/resistência para continuar desafiando o corpo.`,
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
    durationWeeks: durationWeeks,
    strategySummary: `${strategySummary} Este plano combina ${data.goal} com ${data.secondaryGoal}${data.tertiaryGoal ? ' e ' + data.tertiaryGoal : ''} para um resultado otimizado.`,
    progressiveOverloadPlan,
    monitoringGuidelines,
    weeklyRoutine
  };
}

export function formatProgressionText(
  text: string | undefined, 
  week: number, 
  plan: WorkoutPlan,
  user: AnamnesisData,
  exerciseName?: string, 
  exerciseGroup?: string
): string {
  if (!text) return '';
  if (week === 1) return text;

  const durationWeeks = plan.durationWeeks || 4;
  const expLower = user.experience.toLowerCase();
  const isBeginner = expLower.includes('iniciante');
  const isAdvanced = expLower.includes('avançado');
  
  const isHormonized = user.hormonalStatus && user.hormonalStatus.toLowerCase().includes('hormonizado');
  const isWeightLoss = user.goal.toLowerCase().includes('emagrecimento') || user.goal.toLowerCase().includes('definição');
  const isStrength = user.goal.toLowerCase().includes('força');

  const isCompound = exerciseName && (
    exerciseName.toLowerCase().includes('supino') ||
    exerciseName.toLowerCase().includes('agachamento') ||
    exerciseName.toLowerCase().includes('terra') ||
    exerciseName.toLowerCase().includes('desenvolvimento') ||
    exerciseName.toLowerCase().includes('leg press') ||
    exerciseName.toLowerCase().includes('remada') ||
    exerciseName.toLowerCase().includes('puxada')
  );

  const isIsolation = !isCompound;

  // Determinar a fase do bloco com base na semana atual e duração total
  const progressRatio = week / durationWeeks;
  let phase = 'progressao'; // default
  if (progressRatio <= 0.25) phase = 'calibracao';
  else if (progressRatio >= 0.85) phase = 'pico';
  else if (progressRatio >= 0.6) phase = 'sobrecarga';

  let dynamicText = '';
  
  // Lógica de progressão de carga baseada no perfil
  let loadIncrease = '1-2kg';
  if (isHormonized && isCompound) {
    loadIncrease = '2-5kg'; // Hormonizados recuperam e progridem força mais rápido em compostos
  } else if (isBeginner) {
    loadIncrease = '1kg'; // Iniciantes focam mais na técnica
  } else if (isAdvanced && isIsolation) {
    loadIncrease = '0.5-1kg'; // Avançados em isolados progridem carga muito lentamente (micro-loads)
  }

  if (phase === 'calibracao') {
    dynamicText = `Semana ${week} (Base): Mantenha o foco na execução perfeita. Se a carga da semana anterior esteve leve, suba sutilmente.`;
  } else if (phase === 'progressao') {
    if (isBeginner) {
      dynamicText = `Semana ${week} (Evolução): Tente fazer 1 a 2 repetições a mais com a mesma carga do treino anterior. Foque no aprendizado motor.`;
    } else if (isAdvanced) {
      dynamicText = `Semana ${week} (Progressão): Aumente a carga (micro-load de ${loadIncrease}) ou extraia mais repetições mantendo o RIR alvo.`;
    } else {
      dynamicText = `Semana ${week} (Progressão): Tente aumentar a carga em ${loadIncrease} de cada lado ou fazer 1-2 repetições a mais que na semana anterior.`;
    }
    
    if (isCompound && !isBeginner) {
      if (isStrength) {
        dynamicText = `Semana ${week} (Força): Foco total em aumentar o peso (${loadIncrease} de cada lado). Se necessário, descanse mais entre as séries.`;
      } else {
        dynamicText = `Semana ${week} (Progressão de Carga): Foco em aumentar o peso (ex: ${loadIncrease} de cada lado) mantendo o mesmo número de repetições.`;
      }
    } else if (isIsolation && !isBeginner) {
      dynamicText = `Semana ${week} (Progressão de Repetições): Como é um exercício isolado, tente fazer 1 a 2 repetições a mais com a mesma carga. Só suba o peso se atingir o teto de repetições.`;
    }
  } else if (phase === 'sobrecarga') {
    if (isHormonized) {
      dynamicText = `Semana ${week} (Sobrecarga): Fase de intensificação. O esforço deve ser máximo, chegando à falha total na última série. Tente superar as marcas anteriores.`;
    } else {
      dynamicText = `Semana ${week} (Sobrecarga): Fase de intensificação. O esforço deve ser alto, chegando muito próximo à falha (RIR 0-1). Tente superar as marcas anteriores.`;
    }
  } else if (phase === 'pico') {
    if (isWeightLoss) {
      dynamicText = `Semana ${week} (Pico de Gasto): Dê o seu máximo nesta reta final do ciclo. Mantenha as cargas altas para preservar massa magra, mesmo com o cansaço da dieta.`;
    } else {
      dynamicText = `Semana ${week} (Pico de Performance): Dê o seu máximo nesta reta final do ciclo. Tente bater seus recordes mantendo a boa execução.`;
    }
  }

  if (exerciseGroup === 'Cardio' || (!exerciseGroup && text.toLowerCase().includes('ritmo'))) {
    if (phase === 'calibracao') dynamicText = `Semana ${week} (Base): Mantenha o ritmo da semana anterior, focando na consistência.`;
    else if (phase === 'progressao') {
      if (isWeightLoss) dynamicText = `Semana ${week} (Progressão): Tente aumentar a velocidade ou adicionar 5-10 minutos ao tempo total para maior gasto calórico.`;
      else dynamicText = `Semana ${week} (Progressão): Tente aumentar levemente a velocidade ou a inclinação/resistência em relação à semana anterior.`;
    }
    else if (phase === 'sobrecarga') dynamicText = `Semana ${week} (Sobrecarga): Busque um ritmo um pouco mais intenso ou adicione 5 minutos ao tempo total.`;
    else dynamicText = `Semana ${week} (Pico): Dê o seu máximo no cardio esta semana, mantendo a frequência cardíaca no alvo.`;
  }

  // Handle AI generated text
  if (text.includes('Semana 1 (Calibração)')) {
    return text.replace(/Semana 1 \(Calibração\).*?(?=(\n|$))/g, dynamicText);
  }

  // Handle rule-based generator text
  if (text.includes('Inicie o bloco (Semana 1)')) {
    return text.replace(/Inicie o bloco \(Semana 1\).*?(?=(\n|$))/g, dynamicText);
  }

  return text;
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
  const painExercises: string[] = [];
  const badExecutionExercises: string[] = [];

  Object.entries(exerciseFeedback).forEach(([key, feedback]) => {
    // key is like w1-d0-exId
    const parts = key.split('-');
    const exId = parts.slice(2).join('-'); // Reconstruct exercise ID
    
    if (feedback.pain) {
      blacklist.push(exId);
      if (!painExercises.includes(exId)) painExercises.push(exId);
    } else if (feedback.execution === 'Ruim') {
      blacklist.push(exId);
      if (!badExecutionExercises.includes(exId)) badExecutionExercises.push(exId);
    }
  });

  // 2. Analisar checkins para ajustar volume
  let highEffortCount = 0;
  let totalCheckins = 0;
  Object.values(checkins).forEach(checkin => {
    totalCheckins++;
    if (checkin.effort === 'Máximo (10)' || checkin.effort === 'Muito Difícil (8-9)') {
      highEffortCount++;
    }
  });

  const adjustedUserData = { ...userData };
  let volumeMessage = "O volume de treino foi mantido para continuar a progressão constante.";
  
  if (highEffortCount > (totalCheckins * 0.4) || monthlyFeedback.includes('Exausto') || monthlyFeedback.includes('Não recuperei')) {
    volumeMessage = "⚠️ Fadiga Elevada Detectada: Notamos um alto nível de esforço nos seus check-ins diários. O volume e a intensidade foram levemente ajustados para baixo neste novo ciclo para permitir uma supercompensação e melhor recuperação do seu Sistema Nervoso Central.";
    if (adjustedUserData.experience.includes('Avançado')) {
      adjustedUserData.experience = 'Intermediário'; // Reduz técnicas avançadas
    }
  } else if (highEffortCount === 0 && (monthlyFeedback.includes('Muito fácil') || monthlyFeedback.includes('Sobrou energia'))) {
    volumeMessage = "🔥 Energia em Alta: Como você relatou ótima recuperação e energia sobrando, aumentamos a densidade do treino e adicionamos estímulos mais intensos.";
    if (adjustedUserData.experience.includes('Iniciante')) {
      adjustedUserData.experience = 'Intermediário';
    } else if (adjustedUserData.experience.includes('Intermediário')) {
      adjustedUserData.experience = 'Avançado';
    }
  }

  // 3. Analisar progressão de carga
  const exerciseLoadsByWeek: Record<string, Record<number, number>> = {};

  Object.entries(actualLoads).forEach(([key, loadStr]) => {
    const parts = key.split('-');
    if (parts.length >= 3) {
      const week = parseInt(parts[0].replace('w', ''));
      const exId = parts.slice(2).join('-');
      
      const match = loadStr.match(/(\d+[\.,]?\d*)/);
      if (match) {
        const load = parseFloat(match[1].replace(',', '.'));
        if (!isNaN(load)) {
          if (!exerciseLoadsByWeek[exId]) exerciseLoadsByWeek[exId] = {};
          exerciseLoadsByWeek[exId][week] = load;
        }
      }
    }
  });

  let progressedCount = 0;
  let stagnantCount = 0;

  Object.values(exerciseLoadsByWeek).forEach(weeks => {
    const weekNumbers = Object.keys(weeks).map(Number).sort((a, b) => a - b);
    if (weekNumbers.length >= 2) {
      const firstLoad = weeks[weekNumbers[0]];
      const lastLoad = weeks[weekNumbers[weekNumbers.length - 1]];
      if (lastLoad > firstLoad) {
        progressedCount++;
      } else {
        stagnantCount++;
      }
    }
  });

  let progressionMessage = "";
  if (progressedCount > stagnantCount) {
    progressionMessage = `📈 Sobrecarga Progressiva: Excelente trabalho! Você progrediu carga em ${progressedCount} exercícios ao longo do mês. O novo treino vai capitalizar em cima dessa fase de ganho de força.`;
  } else if (stagnantCount > 0) {
    progressionMessage = `🔄 Quebra de Platô: Notamos que a carga estagnou na maioria dos exercícios. O novo treino trará estímulos diferentes (novas faixas de repetição e variações) para quebrar esse platô neuromuscular.`;
  } else {
    progressionMessage = `📊 Manutenção: Suas cargas se mantiveram estáveis. Vamos focar em melhorar a qualidade do movimento neste novo ciclo.`;
  }

  // 4. Gerar o novo plano com a blacklist e dados ajustados
  const newPlan = await generateWorkoutPlanRuleBased(adjustedUserData, [...new Set(blacklist)]);
  
  // Ajustar duração do novo plano com base na estagnação
  if (stagnantCount > progressedCount && newPlan.durationWeeks > 4) {
    newPlan.durationWeeks = 4;
    progressionMessage += ` Como houve estagnação, o próximo ciclo será mais curto (${newPlan.durationWeeks} semanas) para gerar um choque metabólico rápido.`;
  } else if (progressedCount > stagnantCount && newPlan.durationWeeks < 12) {
    if (adjustedUserData.experience.includes('Intermediário') || adjustedUserData.experience.includes('Avançado')) {
       newPlan.durationWeeks = 8;
       progressionMessage += ` Como você está progredindo bem, o próximo ciclo terá ${newPlan.durationWeeks} semanas para aproveitarmos essa fase anabólica.`;
    }
  }

  // Extrair o número do mesociclo atual
  const currentMesoMatch = originalPlan.phaseName.match(/Mesociclo (\d+)/);
  const nextMeso = currentMesoMatch ? parseInt(currentMesoMatch[1]) + 1 : 2;
  newPlan.phaseName = `Mesociclo ${nextMeso} - Evolução Contínua`;
  
  // Construir Análise Final em Markdown
  let analysis = `### 🧠 Análise do Motor Especialista SpeltaFit\n\n`;
  analysis += `Baseado no seu histórico de treino, cargas e check-ins diários, aqui está o diagnóstico do seu último ciclo:\n\n`;
  
  analysis += `${volumeMessage}\n\n`;
  analysis += `${progressionMessage}\n\n`;
  
  if (painExercises.length > 0) {
    analysis += `🛡️ Prevenção de Lesões: Identificamos que você sentiu dor articular em ${painExercises.length} exercício(s). Eles foram colocados na "lista negra" e substituídos por variações mais seguras para a sua biomecânica.\n\n`;
  }
  if (badExecutionExercises.length > 0) {
    analysis += `🎯 Foco na Biomecânica: Substituímos ${badExecutionExercises.length} exercício(s) onde você relatou dificuldade de execução. O foco agora é em exercícios onde você consiga ter uma melhor conexão mente-músculo.\n\n`;
  }

  analysis += `> *Seu novo treino já está montado e pronto para começar. Bom treino!*`;

  return {
    analysis: analysis.trim(),
    updatedPlan: newPlan
  };
}
