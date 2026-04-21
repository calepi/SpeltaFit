import { AnamnesisData } from './workoutGenerator';

export interface FisioPlan {
  phaseName: string;
  strategySummary: string;
  restrictedMovements: string[];
  preHabRoutine: {
    name: string;
    description: string;
    duration: string;
  }[];
  postHabRoutine: {
    name: string;
    description: string;
    duration: string;
  }[];
  precautions: string[];
}

export function generateFisioPlan(data: AnamnesisData): FisioPlan | null {
  const painPoints = data.painPoints || [];
  const conditions = data.medicalConditions || [];
  const allIssues = [...painPoints, ...conditions].map(i => i.toLowerCase());

  if (allIssues.length === 0 && (!data.postureIssues || data.postureIssues.includes('Nenhum'))) {
    return null; // No fisio plan needed
  }

  const plan: FisioPlan = {
    phaseName: 'Fase de Adaptação e Prevenção (SpeltaFisio)',
    strategySummary: 'Foco em estabilidade articular, controle motor e redução de sobrecarga nas regiões acometidas.',
    restrictedMovements: [],
    preHabRoutine: [],
    postHabRoutine: [],
    precautions: []
  };

  if (allIssues.some(i => i.includes('joelho') || i.includes('patelar') || i.includes('lca'))) {
    plan.restrictedMovements.push(
      'Agachamento Livre muito profundo (caso cause dor)',
      'Cadeira Extensora pesada (isometria preferencial)',
      'Saltos de alto impacto (Pliometria agressiva)'
    );
    plan.preHabRoutine.push({
      name: 'Ativação de Glúteo Médio (Ostra)',
      description: 'Deitado de lado com elástico nos joelhos, abrir e fechar a perna mantendo os calcanhares unidos. Foco em estabilizar o quadril para proteger o joelho.',
      duration: '2 séries de 15 reps cada lado'
    });
    plan.preHabRoutine.push({
      name: 'Isometria de Quadríceps na Parede',
      description: 'Agachamento isométrico encostado na parede mantendo joelhos a 90 graus.',
      duration: '2 séries de 45 segundos'
    });
    plan.precautions.push('Atenção ao valgo dinâmico (joelho caindo para dentro) durante exercícios de perna.');
  }

  if (allIssues.some(i => i.includes('lombar') || i.includes('hérnia') || i.includes('coluna'))) {
    plan.restrictedMovements.push(
      'Agachamento livre com barra nas costas (Compressão axial alta)',
      'Levantamento Terra pesado',
      'Remada Curvada livre (vetor de cisalhamento alto)'
    );
    plan.preHabRoutine.push({
      name: 'Prancha Frontal (McGill)',
      description: 'Manter a coluna neutra e contrair forte o abdômen e glúteos.',
      duration: '3 séries de 30 segundos'
    });
    plan.preHabRoutine.push({
      name: 'Perdigueiro (Bird-Dog)',
      description: 'Em 4 apoios, estender braço e perna opostos mantendo a lombar imóvel.',
      duration: '2 séries de 10 reps com pausa de 3s'
    });
    plan.precautions.push('Sempre utilize exercícios com as costas apoiadas (ex: remada no banco, leg press 45) para evitar sobrecarga lombar.');
  }

  if (allIssues.some(i => i.includes('ombro') || i.includes('manguito') || i.includes('bursite'))) {
    plan.restrictedMovements.push(
      'Desenvolvimento com barra por trás da cabeça',
      'Puxada por trás da nuca',
      'Elevação Lateral com polegar apontado para baixo (Mecanismo de impacto)'
    );
    plan.preHabRoutine.push({
      name: 'Rotação Externa de Ombro com Elástico',
      description: 'Cotovelo colado no corpo a 90 graus, rotacionar o braço para fora.',
      duration: '3 séries de 15 reps'
    });
    plan.postHabRoutine.push({
      name: 'Alongamento de Peitoral na Porta',
      description: 'Apoiar o antebraço no batente da porta e girar o tronco para o lado oposto para abrir o peitoral e aliviar a tensão nos ombros.',
      duration: '2 séries de 30 segundos'
    });
    plan.precautions.push('Prefira pegadas neutras (palmas das mãos viradas uma para a outra) em exercícios de empurrar e puxar.');
  }

  // Base strategy update based on combinations
  if (plan.restrictedMovements.length > 0) {
    plan.strategySummary = `O protocolo foi ajustado. As restrições foram aplicadas ao motor do SpeltaFit para evitar o agravamento das dores e promover recuperação tecidual. Não faça exercícios que acusem dor em "agulhada" ou "choque".`;
  }

  return plan;
}
