import React, { useState, useEffect } from 'react';
import { AnamnesisData, ExistingDay, ExistingExercise } from '../services/workoutGenerator';
import { Activity, User, Target, Calendar, AlertTriangle, HeartPulse, Dumbbell, Moon, Brain, Utensils, FileText, Plus, Trash2, ChevronRight, ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onSubmit: (data: AnamnesisData) => void;
  isLoading: boolean;
  initialData?: AnamnesisData | null;
}

const GOALS_MAP: Record<string, string[]> = {
  'Emagrecimento': ['Definição Muscular', 'Condicionamento Físico', 'Saúde e Bem-estar', 'Melhora Postural', 'Resistência Muscular', 'Mobilidade'],
  'Hipertrofia': ['Força Máxima', 'Simetria Corporal', 'Condicionamento Físico', 'Aumento de Peso Saudável', 'Potência', 'Estética'],
  'Força': ['Hipertrofia', 'Potência', 'Prevenção de Lesões', 'Melhora de Performance Esportiva', 'Explosão', 'Resistência de Força'],
  'Resistência': ['Condicionamento Físico', 'Emagrecimento', 'Saúde Cardiovascular', 'Preparação para Prova', 'Capacidade Pulmonar', 'Fôlego'],
  'Saúde e Bem-estar': ['Mobilidade e Flexibilidade', 'Prevenção de Lesões', 'Condicionamento Físico', 'Longevidade', 'Alívio de Stress', 'Qualidade de Sono'],
  'Reabilitação': ['Mobilidade e Flexibilidade', 'Fortalecimento Específico', 'Melhora Postural', 'Alívio de Dores', 'Equilíbrio', 'Propriocepção']
};

export function AnamnesisForm({ onSubmit, isLoading, initialData }: Props) {
  const [formData, setFormData] = useState<AnamnesisData>(initialData || {
    name: '',
    age: undefined,
    gender: '',
    weight: undefined,
    height: undefined,
    bodyFat: undefined,
    targetWeight: undefined,
    goal: '',
    secondaryGoal: '',
    tertiaryGoal: '',
    specificGoals: [],
    experience: '',
    daysPerWeek: undefined,
    duration: undefined,
    limitations: '',
    postureIssues: '',
    medications: '',
    cardioPreference: '',
    equipment: '',
    sleepQuality: '',
    stressLevel: '',
    dietType: '',
    hormonalStatus: '',
    existingPlan: '',
    structuredExistingPlan: [],
    remodelPlan: false
  });

  const [showStructuredInput, setShowStructuredInput] = useState(initialData?.structuredExistingPlan && initialData.structuredExistingPlan.length > 0 ? true : false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.structuredExistingPlan && initialData.structuredExistingPlan.length > 0) {
        setShowStructuredInput(true);
      }
    }
  }, [initialData]);

  const addExistingDay = () => {
    setFormData(prev => ({
      ...prev,
      structuredExistingPlan: [
        ...(prev.structuredExistingPlan || []),
        { dayName: `Treino ${(prev.structuredExistingPlan?.length || 0) + 1}`, exercises: [] }
      ]
    }));
  };

  const removeExistingDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      structuredExistingPlan: prev.structuredExistingPlan?.filter((_, i) => i !== index)
    }));
  };

  const addExerciseToDay = (dayIndex: number) => {
    setFormData(prev => {
      const newPlan = [...(prev.structuredExistingPlan || [])];
      newPlan[dayIndex].exercises.push({ name: '', sets: '', reps: '' });
      return { ...prev, structuredExistingPlan: newPlan };
    });
  };

  const updateExercise = (dayIndex: number, exerciseIndex: number, field: keyof ExistingExercise, value: string) => {
    setFormData(prev => {
      const newPlan = [...(prev.structuredExistingPlan || [])];
      newPlan[dayIndex].exercises[exerciseIndex] = {
        ...newPlan[dayIndex].exercises[exerciseIndex],
        [field]: value
      };
      return { ...prev, structuredExistingPlan: newPlan };
    });
  };

  const removeExerciseFromDay = (dayIndex: number, exerciseIndex: number) => {
    setFormData(prev => {
      const newPlan = [...(prev.structuredExistingPlan || [])];
      newPlan[dayIndex].exercises = newPlan[dayIndex].exercises.filter((_, i) => i !== exerciseIndex);
      return { ...prev, structuredExistingPlan: newPlan };
    });
  };

  const updateDayName = (dayIndex: number, name: string) => {
    setFormData(prev => {
      const newPlan = [...(prev.structuredExistingPlan || [])];
      newPlan[dayIndex].dayName = name;
      return { ...prev, structuredExistingPlan: newPlan };
    });
  };

  const parseQuickPaste = () => {
    if (!formData.existingPlan) return;
    
    // Simple parser for common formats like "Supino 3x10"
    const lines = formData.existingPlan.split('\n').filter(l => l.trim());
    const newExercises: ExistingExercise[] = lines.map(line => {
      const parts = line.split(/[xX,;-]/);
      const name = parts[0]?.trim() || line;
      const sets = parts[1]?.trim() || '';
      const reps = parts[2]?.trim() || '';
      return { name, sets, reps };
    });

    setFormData(prev => ({
      ...prev,
      structuredExistingPlan: [
        ...(prev.structuredExistingPlan || []),
        { dayName: 'Importado', exercises: newExercises }
      ],
      existingPlan: '' // Clear after parsing
    }));
    setShowStructuredInput(true);
  };

  const SPECIFIC_GOALS_OPTIONS = [
    'Foco em Glúteos e Pernas',
    'Foco em Peito e Braços',
    'Estética em V (Costas largas e Ombros)',
    'Melhorar Postura',
    'Ganho de Força (Agachamento/Supino/Terra)',
    'Condicionamento Cardiovascular',
    'Preparação para Esporte Específico'
  ];

  const handleSpecificGoalToggle = (goal: string) => {
    setFormData(prev => {
      const current = prev.specificGoals || [];
      if (current.includes(goal)) {
        return { ...prev, specificGoals: current.filter(g => g !== goal) };
      } else {
        return { ...prev, specificGoals: [...current, goal] };
      }
    });
  };

  const getSecondaryOptions = () => {
    const primaryRelated = GOALS_MAP[formData.goal] || [];
    const otherMain = Object.keys(GOALS_MAP).filter(g => g !== formData.goal);
    const all = Array.from(new Set([...primaryRelated, ...otherMain]));
    return all.filter(g => g !== formData.tertiaryGoal);
  };

  const getTertiaryOptions = () => {
    const options = new Set<string>();
    
    // 1. Contexto do Objetivo Primário
    if (GOALS_MAP[formData.goal]) {
      GOALS_MAP[formData.goal].forEach(g => options.add(g));
    }
    
    // 2. Contexto do Objetivo Secundário
    if (GOALS_MAP[formData.secondaryGoal]) {
      // Se o secundário for um objetivo principal, trazemos os sub-objetivos dele
      GOALS_MAP[formData.secondaryGoal].forEach(g => options.add(g));
    } else {
      // Se o secundário for um sub-objetivo, encontramos a qual grupo principal ele pertence
      Object.entries(GOALS_MAP).forEach(([mainGoal, subGoals]) => {
        if (subGoals.includes(formData.secondaryGoal)) {
          options.add(mainGoal);
          subGoals.forEach(g => options.add(g));
        }
      });
    }

    // Removemos o que já foi selecionado
    options.delete(formData.goal);
    options.delete(formData.secondaryGoal);

    return Array.from(options);
  };

  // Validação em tempo real para garantir que os objetivos sejam válidos e não se repitam
  useEffect(() => {
    if (!formData.goal) return;
    
    setFormData(prev => {
      let newSecondary = prev.secondaryGoal;
      let newTertiary = prev.tertiaryGoal;
      let changed = false;

      // 1. Validar Secundário
      const primaryRelated = GOALS_MAP[prev.goal] || [];
      const otherMain = Object.keys(GOALS_MAP).filter(g => g !== prev.goal);
      const secondaryOpts = Array.from(new Set([...primaryRelated, ...otherMain])).filter(g => g !== prev.tertiaryGoal);

      if (newSecondary && !secondaryOpts.includes(newSecondary)) {
        newSecondary = '';
        changed = true;
      }

      // 2. Validar Terciário baseado no Primário e no (potencialmente novo) Secundário
      const tertiarySet = new Set<string>();
      if (GOALS_MAP[prev.goal]) GOALS_MAP[prev.goal].forEach(g => tertiarySet.add(g));
      
      if (newSecondary && GOALS_MAP[newSecondary]) {
        GOALS_MAP[newSecondary].forEach(g => tertiarySet.add(g));
      } else if (newSecondary) {
        Object.entries(GOALS_MAP).forEach(([mainGoal, subGoals]) => {
          if (subGoals.includes(newSecondary)) {
            tertiarySet.add(mainGoal);
            subGoals.forEach(g => tertiarySet.add(g));
          }
        });
      }
      tertiarySet.delete(prev.goal);
      if (newSecondary) tertiarySet.delete(newSecondary);
      const tertiaryOpts = Array.from(tertiarySet);

      if (newTertiary && !tertiaryOpts.includes(newTertiary)) {
        newTertiary = ''; // Reseta para 'Nenhum' se for inválido no novo contexto
        changed = true;
      }

      if (changed) {
        return { ...prev, secondaryGoal: newSecondary, tertiaryGoal: newTertiary };
      }
      return prev;
    });
  }, [formData.goal, formData.secondaryGoal, formData.tertiaryGoal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: (name === 'age' || name === 'weight' || name === 'height' || name === 'daysPerWeek' || name === 'duration' || name === 'bodyFat' || name === 'targetWeight')
        ? (value === '' ? undefined : Number(value))
        : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto bg-surface border border-border rounded-3xl p-6 md:p-10 shadow-2xl"
    >
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-text-main mb-3 tracking-tight">Anamnese Profissional</h2>
        <p className="text-text-muted text-lg">Precisamos entender seu corpo e sua rotina para criar o <strong className="text-brand">treino perfeito</strong>.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dados Pessoais */}
        <div className="space-y-5 bg-bg-main p-6 rounded-2xl border border-border">
          <h3 className="text-xl font-bold text-brand flex items-center gap-2">
            <User className="w-6 h-6" /> 1. Seu Perfil
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-muted mb-1">Nome Completo</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Seu nome"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Idade</label>
              <input type="number" name="age" value={formData.age || ''} onChange={handleChange} required min="14" max="100"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Gênero</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors">
                <option value="">Selecione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Não-binário">Não-binário</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Peso (kg)</label>
              <input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} required min="30" max="300" step="0.1"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Altura (cm)</label>
              <input type="number" name="height" value={formData.height || ''} onChange={handleChange} required min="100" max="250"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">BF % (Opcional)</label>
              <input type="number" name="bodyFat" value={formData.bodyFat || ''} onChange={handleChange} min="3" max="60" placeholder="Ex: 15"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Peso Alvo (kg)</label>
              <input type="number" name="targetWeight" value={formData.targetWeight || ''} onChange={handleChange} min="30" max="300" placeholder="Ex: 75"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
            </div>
          </div>
        </div>

        {/* Objetivos e Experiência */}
        <div className="space-y-5 bg-bg-main p-6 rounded-2xl border border-border">
          <h3 className="text-xl font-bold text-brand flex items-center gap-2">
            <Target className="w-6 h-6" /> 2. Metas e Nível
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Objetivo Principal</label>
              <select name="goal" value={formData.goal} onChange={handleChange} required
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors">
                <option value="">Selecione...</option>
                {Object.keys(GOALS_MAP).map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Objetivo Secundário</label>
              <select name="secondaryGoal" value={formData.secondaryGoal} onChange={handleChange} required disabled={!formData.goal}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors disabled:opacity-50">
                <option value="">Selecione...</option>
                {getSecondaryOptions().map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Objetivo Terciário</label>
              <select name="tertiaryGoal" value={formData.tertiaryGoal} onChange={handleChange} disabled={!formData.secondaryGoal}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors disabled:opacity-50">
                <option value="">Nenhum / Selecione...</option>
                {getTertiaryOptions().map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Nível de Experiência</label>
              <select name="experience" value={formData.experience} onChange={handleChange} required
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors">
                <option value="">Selecione...</option>
                <option value="Sedentário">Sedentário (Nunca treinou)</option>
                <option value="Iniciante">Iniciante (0-6 meses)</option>
                <option value="Intermediário">Intermediário (6 meses - 2 anos)</option>
                <option value="Avançado">Avançado (2 - 5 anos)</option>
                <option value="Atleta">Atleta (+5 anos)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Status Hormonal</label>
              <select name="hormonalStatus" value={formData.hormonalStatus} onChange={handleChange} required
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors">
                <option value="">Selecione...</option>
                <option value="Natural">Natural</option>
                <option value="Hormonizado">Hormonizado</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-text-muted mb-3">Foco do Treino / Pontos Fracos (Opcional)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {SPECIFIC_GOALS_OPTIONS.map(goal => (
                <label 
                  key={goal} 
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    (formData.specificGoals || []).includes(goal) 
                      ? 'bg-brand/10 border-brand text-brand font-medium' 
                      : 'bg-surface border-border text-text-muted hover:border-brand/50'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="hidden"
                    checked={(formData.specificGoals || []).includes(goal)}
                    onChange={() => handleSpecificGoalToggle(goal)}
                  />
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                    (formData.specificGoals || []).includes(goal) ? 'bg-brand border-brand' : 'border-border bg-bg-main'
                  }`}>
                    {(formData.specificGoals || []).includes(goal) && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                  </div>
                  <span className="text-sm">{goal}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Estrutura do Treino */}
        <div className="space-y-5 bg-bg-main p-6 rounded-2xl border border-border">
          <h3 className="text-xl font-bold text-brand flex items-center gap-2">
            <Dumbbell className="w-6 h-6" /> 3. Estrutura do Treino
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Dias por Semana</label>
              <input type="number" name="daysPerWeek" value={formData.daysPerWeek || ''} onChange={handleChange} required min="1" max="7"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Duração (minutos)</label>
              <select name="duration" value={formData.duration || ''} onChange={handleChange} required
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors">
                <option value="">Selecione...</option>
                <option value="20">20 min (Express/HIIT)</option>
                <option value="30">30 min (Intenso/Rápido)</option>
                <option value="45">45 min</option>
                <option value="60">60 min (Padrão)</option>
                <option value="90">90 min</option>
                <option value="120">120 min (Avançado)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Local / Equipamentos</label>
              <select name="equipment" value={formData.equipment} onChange={handleChange} required
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors">
                <option value="">Selecione...</option>
                <option value="Academia Completa">Academia Completa</option>
                <option value="Academia de Prédio (Básica)">Academia de Prédio (Básica)</option>
                <option value="Estúdio Funcional / Crossfit">Estúdio Funcional / Crossfit</option>
                <option value="Em Casa (Halteres e Elásticos)">Em Casa (Halteres e Elásticos)</option>
                <option value="Em Casa (Apenas Peso Corporal)">Em Casa (Apenas Peso Corporal)</option>
                <option value="Parque / Calistenia">Parque / Calistenia</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estilo de Vida e Recuperação */}
        <div className="space-y-5 bg-bg-main p-6 rounded-2xl border border-border">
          <h3 className="text-xl font-bold text-brand flex items-center gap-2">
            <HeartPulse className="w-6 h-6" /> 4. Estilo de Vida e Recuperação
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1 flex items-center gap-2">
                <Moon className="w-4 h-4" /> Qualidade do Sono
              </label>
              <select name="sleepQuality" value={formData.sleepQuality} onChange={handleChange} required
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors">
                <option value="">Selecione...</option>
                <option value="Excelente (8h+)">Excelente (8h+)</option>
                <option value="Boa (7-8h)">Boa (7-8h)</option>
                <option value="Razoável (5-6h)">Razoável (5-6h)</option>
                <option value="Ruim (<5h ou insônia)">Ruim (&lt;5h ou insônia)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1 flex items-center gap-2">
                <Brain className="w-4 h-4" /> Nível de Estresse
              </label>
              <select name="stressLevel" value={formData.stressLevel} onChange={handleChange} required
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors">
                <option value="">Selecione...</option>
                <option value="Baixo">Baixo (Tranquilo)</option>
                <option value="Moderado">Moderado (Rotina normal)</option>
                <option value="Alto">Alto (Pressão constante)</option>
                <option value="Muito Alto">Muito Alto (Esgotamento/Burnout)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1 flex items-center gap-2">
                <Utensils className="w-4 h-4" /> Alimentação
              </label>
              <select name="dietType" value={formData.dietType} onChange={handleChange} required
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors">
                <option value="">Selecione...</option>
                <option value="Equilibrada (Sem restrições)">Equilibrada (Sem restrições)</option>
                <option value="Déficit Calórico (Foco em perda)">Déficit Calórico (Foco em perda)</option>
                <option value="Superávit Calórico (Foco em ganho)">Superávit Calórico (Foco em ganho)</option>
                <option value="Low Carb / Cetogênica">Low Carb / Cetogênica</option>
                <option value="Vegana / Vegetariana">Vegana / Vegetariana</option>
                <option value="Desregulada">Desregulada (Preciso melhorar)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Lesões ou Limitações Físicas?
            </label>
            <textarea name="limitations" value={formData.limitations} onChange={handleChange} placeholder="Ex: Dor no joelho direito, hérnia de disco, hipertensão..." rows={2}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors resize-none" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Desvios Posturais (Opcional)</label>
              <input type="text" name="postureIssues" value={formData.postureIssues || ''} onChange={handleChange} placeholder="Ex: Escoliose, Hipercifose..."
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Medicamentos em Uso (Opcional)</label>
              <input type="text" name="medications" value={formData.medications || ''} onChange={handleChange} placeholder="Ex: Losartana, Roacutan..."
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-muted mb-1">Preferência de Cardio</label>
            <select name="cardioPreference" value={formData.cardioPreference} onChange={handleChange} required
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors">
              <option value="">Selecione...</option>
              <option value="Esteira">Esteira</option>
              <option value="Bicicleta">Bicicleta</option>
              <option value="Elíptico">Elíptico</option>
              <option value="Escada">Escada</option>
              <option value="Remo">Remo</option>
              <option value="Pular Corda">Pular Corda</option>
              <option value="Ao ar livre (Corrida/Caminhada)">Ao ar livre (Corrida/Caminhada)</option>
              <option value="Natação">Natação</option>
              <option value="Sem preferência">Sem preferência (Deixe o personal escolher)</option>
              <option value="Odeio cardio (Fazer o mínimo possível)">Odeio cardio (Fazer o mínimo possível)</option>
            </select>
          </div>
        </div>

        {/* SpeltaNutri - Análise Nutricional Integrada */}
        <div className="space-y-5 bg-bg-main p-6 rounded-2xl border border-border">
          <h3 className="text-xl font-bold text-brand flex items-center gap-2">
            <Utensils className="w-6 h-6" /> 5. SpeltaNutri (Integração Nutricional)
          </h3>
          <p className="text-sm text-text-muted">
            Para gerar seu cardápio e planejamento alimentar junto com o treino, preencha as informações abaixo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">Refeições por dia</label>
              <select name="mealCount" value={formData.mealCount || ''} onChange={handleChange} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" required>
                <option value="">Selecione...</option>
                <option value="3">3 Refeições (Café, Almoço, Jantar)</option>
                <option value="4">4 Refeições (Com lanche da tarde)</option>
                <option value="5">5 Refeições (Lanches manhã e tarde)</option>
                <option value="6">6 Refeições (Com ceia)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">Alergias ou Intolerâncias</label>
              <input type="text" name="allergies" value={formData.allergies || ''} onChange={handleChange} placeholder="Ex: Lactose, Glúten, Amendoim (Deixe em branco se não tiver)" className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-main mb-2">Alimentos que não gosta</label>
              <input type="text" name="dislikes" value={formData.dislikes || ''} onChange={handleChange} placeholder="Ex: Brócolis, Peixe, Ovo" className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-main mb-2">Orçamento para Dieta</label>
              <select name="budget" value={formData.budget || ''} onChange={handleChange} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" required>
                <option value="">Selecione...</option>
                <option value="Baixo">Baixo (Foco em alimentos básicos e acessíveis)</option>
                <option value="Médio">Médio (Equilíbrio entre custo e variedade)</option>
                <option value="Alto">Alto (Sem restrições de custo)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-text-main mb-2">Tempo para cozinhar</label>
              <select name="cookingTime" value={formData.cookingTime || ''} onChange={handleChange} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" required>
                <option value="">Selecione...</option>
                <option value="Muito pouco">Muito pouco (Preciso de refeições rápidas/prontas)</option>
                <option value="Moderado">Moderado (Posso cozinhar algumas refeições)</option>
                <option value="Alto">Alto (Gosto de cozinhar e preparar marmitas)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">Suplementação Atual</label>
              <input type="text" name="supplements" value={formData.supplements || ''} onChange={handleChange} placeholder="Ex: Whey, Creatina, Ômega 3 (Deixe em branco se não usar)" className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-text-main mb-2">Consumo de Água Atual (Litros/dia)</label>
              <input type="number" name="waterIntake" value={formData.waterIntake || ''} onChange={handleChange} placeholder="Ex: 2" step="0.1" min="0" className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
            </div>
          </div>
        </div>

        {/* Treino Existente (Opcional) */}
        <div className="space-y-5 bg-bg-main p-6 rounded-2xl border border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-brand flex items-center gap-2">
              <FileText className="w-6 h-6" /> 6. Treino Atual (Opcional)
            </h3>
            <button 
              type="button"
              onClick={() => setShowStructuredInput(!showStructuredInput)}
              className="text-sm font-bold text-brand hover:underline flex items-center gap-1"
            >
              {showStructuredInput ? 'Ocultar Detalhes' : 'Adicionar Detalhes do Treino'}
              {showStructuredInput ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
          
          <p className="text-sm text-text-muted">
            Se você já treina, informe seu treino atual. Isso nos ajuda a manter o que funciona e ajustar o que precisa ser melhorado.
          </p>
          
          {!showStructuredInput ? (
            <div className="space-y-4">
              <div className="relative">
                <textarea 
                  name="existingPlan" 
                  value={formData.existingPlan} 
                  onChange={handleChange} 
                  placeholder="Cole seu treino atual aqui para importação rápida (ex: Supino 3x10, Agachamento 4x12...)" 
                  rows={3}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors resize-none" 
                />
                {formData.existingPlan && (
                  <button
                    type="button"
                    onClick={parseQuickPaste}
                    className="absolute bottom-3 right-3 bg-brand text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg"
                  >
                    <Sparkles className="w-3 h-3" /> Converter para Lista
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowStructuredInput(true)}
                className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-muted hover:border-brand hover:text-brand transition-all flex items-center justify-center gap-2 font-bold"
              >
                <Plus className="w-5 h-5" /> Criar Lista de Exercícios Manualmente
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {formData.structuredExistingPlan?.map((day, dIdx) => (
                  <motion.div 
                    key={dIdx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-surface border border-border rounded-2xl p-4 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <input 
                        type="text" 
                        value={day.dayName} 
                        onChange={(e) => updateDayName(dIdx, e.target.value)}
                        className="bg-transparent border-b border-border focus:border-brand text-lg font-bold text-text-main outline-none px-1 py-1 w-full"
                        placeholder="Nome do Treino (Ex: Treino A)"
                      />
                      <button 
                        type="button" 
                        onClick={() => removeExistingDay(dIdx)}
                        className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {day.exercises.map((ex, eIdx) => (
                        <div key={eIdx} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6">
                            <input 
                              type="text" 
                              value={ex.name} 
                              onChange={(e) => updateExercise(dIdx, eIdx, 'name', e.target.value)}
                              placeholder="Nome do Exercício"
                              className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:border-brand outline-none"
                            />
                          </div>
                          <div className="col-span-2">
                            <input 
                              type="text" 
                              value={ex.sets} 
                              onChange={(e) => updateExercise(dIdx, eIdx, 'sets', e.target.value)}
                              placeholder="Séries"
                              className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:border-brand outline-none text-center"
                            />
                          </div>
                          <div className="col-span-3">
                            <input 
                              type="text" 
                              value={ex.reps} 
                              onChange={(e) => updateExercise(dIdx, eIdx, 'reps', e.target.value)}
                              placeholder="Reps"
                              className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:border-brand outline-none text-center"
                            />
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <button 
                              type="button" 
                              onClick={() => removeExerciseFromDay(dIdx, eIdx)}
                              className="text-text-muted hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button 
                        type="button"
                        onClick={() => addExerciseToDay(dIdx)}
                        className="text-xs font-bold text-brand hover:underline flex items-center gap-1 mt-2"
                      >
                        <Plus className="w-3 h-3" /> Adicionar Exercício
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              <button 
                type="button"
                onClick={addExistingDay}
                className="w-full py-3 border-2 border-dashed border-border rounded-xl text-text-muted hover:border-brand hover:text-brand transition-all flex items-center justify-center gap-2 font-bold"
              >
                <Plus className="w-5 h-5" /> Adicionar Novo Dia de Treino
              </button>
            </div>
          )}

          {(formData.structuredExistingPlan?.length || 0) > 0 && (
            <div className="flex items-start gap-3 p-4 bg-brand/5 border border-brand/20 rounded-xl">
              <div className="flex items-center h-5 mt-1">
                <input
                  id="remodelPlan"
                  name="remodelPlan"
                  type="checkbox"
                  checked={formData.remodelPlan}
                  onChange={handleChange}
                  className="w-5 h-5 text-brand bg-surface border-border rounded focus:ring-brand focus:ring-2"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="remodelPlan" className="text-sm font-bold text-text-main cursor-pointer">
                  Analisar e Sugerir Melhorias Baseado no Meu Perfil
                </label>
                <p className="text-xs text-text-muted mt-1">
                  Se marcado, nosso sistema vai avaliar seu treino atual e propor mudanças justificadas. Você poderá revisar cada alteração antes de finalizar.
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-8 bg-brand hover:bg-brand-hover text-text-inverse font-black text-xl py-5 rounded-2xl transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-4 border-text-inverse border-t-transparent rounded-full animate-spin"></div>
              Analisando seu perfil e montando o treino...
            </>
          ) : (
            <>
              <Activity className="w-7 h-7" />
              Gerar Meu Treino Personalizado
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
