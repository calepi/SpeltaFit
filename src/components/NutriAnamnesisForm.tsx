import React, { useState } from 'react';
import { NutriAnamnesisData } from '../types/nutrition';
import { AnamnesisData } from '../services/workoutGenerator';
import { ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Apple, Heart, Activity, Brain, Coffee, RefreshCw } from 'lucide-react';

interface Props {
  onSubmit: (data: NutriAnamnesisData) => void;
  isLoading: boolean;
  initialData?: Partial<NutriAnamnesisData> | null;
  workoutData?: AnamnesisData | null;
}

const STEPS = [
  { id: 'personal', title: 'Perfil e Medidas', icon: Activity },
  { id: 'goals', title: 'Objetivos e Rotina', icon: CheckCircle },
  { id: 'diet', title: 'Hábitos e Restrições', icon: Apple },
  { id: 'emotional', title: 'Emocional e Comportamento', icon: Brain },
  { id: 'clinical', title: 'Clínico e Suplementação', icon: Heart },
];

// --- EXTENSIVE OPTIONS ---
const GOALS = [
  'Emagrecimento Acelerado',
  'Emagrecimento Sustentável',
  'Hipertrofia (Ganho de Massa Muscular)',
  'Recomposição Corporal (Perder gordura e ganhar massa)',
  'Performance Esportiva (Melhorar rendimento)',
  'Saúde e Qualidade de Vida',
  'Controle de Doenças (Diabetes, Hipertensão, etc)',
  'Ganho de Peso Saudável'
];

const ACTIVITY_LEVELS = [
  'Sedentário (Trabalho em mesa, sem exercícios)',
  'Levemente Ativo (Exercício leve 1-3 dias/semana)',
  'Moderadamente Ativo (Exercício moderado 3-5 dias/semana)',
  'Muito Ativo (Exercício intenso 6-7 dias/semana)',
  'Extremamente Ativo (Atleta, treino 2x ao dia ou trabalho braçal pesado)'
];

const DIETARY_PREFERENCES = [
  'Onívoro (Come de tudo)',
  'Vegetariano Estrito (Sem carnes, ovos ou laticínios)',
  'Ovolactovegetariano (Sem carnes, mas come ovos e laticínios)',
  'Pescatariano (Come peixes, mas não outras carnes)',
  'Low Carb (Baixo carboidrato)',
  'Cetogênica (Muito baixo carboidrato, alta gordura)',
  'Jejum Intermitente',
  'Flexitariano (Maioria vegetal, carne ocasionalmente)'
];

const ALLERGIES_INTOLERANCES = [
  'Nenhuma',
  'Intolerância à Lactose',
  'Alergia à Proteína do Leite (APLV)',
  'Doença Celíaca (Alergia ao Glúten)',
  'Sensibilidade ao Glúten Não Celíaca',
  'Alergia a Amendoim',
  'Alergia a Castanhas/Nozes',
  'Alergia a Frutos do Mar/Crustáceos',
  'Alergia a Ovos',
  'Alergia a Soja',
  'Sensibilidade a FODMAPs'
];

const FOOD_AVERSIONS = [
  'Nenhuma',
  'Vegetais verde-escuros (Brócolis, Espinafre, Couve)',
  'Legumes em geral (Cenoura, Abobrinha, Chuchu)',
  'Frutas cítricas',
  'Peixes e Frutos do mar',
  'Carnes vermelhas',
  'Frango',
  'Ovos',
  'Laticínios',
  'Feijão/Leguminosas',
  'Cebola/Alho',
  'Coentro',
  'Pimentão'
];

const EMOTIONAL_EATING = [
  'Não tenho problemas emocionais com a comida',
  'Como por ansiedade ou estresse',
  'Como por tédio ou falta do que fazer',
  'Uso a comida como recompensa ("Eu mereço")',
  'Como para lidar com tristeza ou frustração',
  'Tenho episódios de compulsão alimentar (perda de controle)',
  'Sinto culpa após comer alimentos "proibidos"',
  'Desconto a TPM em doces e carboidratos',
  'Não consigo parar de comer quando começo (falta de saciedade)',
  'Como muito rápido sem prestar atenção'
];

const SLEEP_QUALITY = [
  'Excelente (Durmo 7-9h, acordo revigorado)',
  'Boa (Durmo bem na maioria das noites)',
  'Regular (Acordo algumas vezes, sono leve)',
  'Ruim (Dificuldade para pegar no sono ou acordo cansado)',
  'Insônia (Dificuldade crônica de dormir)',
  'Trabalho em turnos (Sono invertido/irregular)'
];

const BOWEL_MOVEMENT = [
  'Excelente (1 a 2 vezes ao dia, sem esforço)',
  'Bom (1 vez ao dia)',
  'Regular (A cada 2 dias)',
  'Constipação/Prisão de ventre (A cada 3 dias ou mais)',
  'Diarreia frequente ou fezes amolecidas',
  'Síndrome do Intestino Irritável (Alterna constipação e diarreia)',
  'Gases e estufamento frequentes'
];

const MEDICAL_CONDITIONS = [
  'Nenhuma',
  'Hipertensão (Pressão Alta)',
  'Diabetes Tipo 1',
  'Diabetes Tipo 2',
  'Resistência à Insulina / Pré-diabetes',
  'Hipotireoidismo',
  'Hipertireoidismo',
  'SOP (Síndrome do Ovário Policístico)',
  'Colesterol Alto (Dislipidemia)',
  'Esteatose Hepática (Gordura no fígado)',
  'Gastrite / Refluxo / Úlcera',
  'Anemia',
  'Doença Autoimune'
];

const CURRENT_SUPPLEMENTS = [
  'Nenhum',
  'Whey Protein',
  'Creatina',
  'Ômega 3',
  'Multivitamínico',
  'Vitamina D',
  'Vitamina C',
  'Pré-treino',
  'Termogênico',
  'BCAA / EAA',
  'Glutamina',
  'Melatonina',
  'Magnésio',
  'Probióticos'
];

export function NutriAnamnesisForm({ onSubmit, isLoading, initialData, workoutData }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSynced, setHasSynced] = useState(false);
  const [formData, setFormData] = useState<NutriAnamnesisData>({
    name: initialData?.name || '',
    age: initialData?.age || 30,
    gender: initialData?.gender || 'Masculino',
    weight: initialData?.weight || 70,
    height: initialData?.height || 170,
    bodyFatPercentage: initialData?.bodyFatPercentage || undefined,
    goal: initialData?.goal || GOALS[0],
    activityLevel: initialData?.activityLevel || ACTIVITY_LEVELS[1],
    trainingFrequency: initialData?.trainingFrequency || '3x na semana',
    dietaryPreference: initialData?.dietaryPreference || DIETARY_PREFERENCES[0],
    allergiesIntolerances: initialData?.allergiesIntolerances || [],
    foodAversions: initialData?.foodAversions || [],
    mealsPerDay: initialData?.mealsPerDay || '4 refeições',
    waterIntake: initialData?.waterIntake || '1 a 2 Litros',
    emotionalEating: initialData?.emotionalEating || [],
    stressLevel: initialData?.stressLevel || 'Moderado',
    sleepQuality: initialData?.sleepQuality || SLEEP_QUALITY[1],
    energyLevels: initialData?.energyLevels || 'Boa na maior parte do dia',
    bowelMovement: initialData?.bowelMovement || BOWEL_MOVEMENT[1],
    medicalConditions: initialData?.medicalConditions || [],
    currentSupplements: initialData?.currentSupplements || [],
    medications: initialData?.medications || '',
  });

  const handleSync = () => {
    if (!workoutData) return;
    
    let mappedGoal = formData.goal;
    if (workoutData.goal === 'Emagrecimento') mappedGoal = 'Emagrecimento Sustentável';
    if (workoutData.goal === 'Hipertrofia') mappedGoal = 'Hipertrofia (Ganho de Massa Muscular)';
    if (workoutData.goal === 'Condicionamento') mappedGoal = 'Saúde e Qualidade de Vida';

    let mappedActivity = formData.activityLevel;
    const days = workoutData.daysPerWeek || 3;
    if (days <= 2) mappedActivity = ACTIVITY_LEVELS[1]; // Levemente
    else if (days <= 4) mappedActivity = ACTIVITY_LEVELS[2]; // Moderadamente
    else if (days <= 6) mappedActivity = ACTIVITY_LEVELS[3]; // Muito Ativo
    else mappedActivity = ACTIVITY_LEVELS[4]; // Extremamente

    let mappedSleep = formData.sleepQuality;
    if (workoutData.sleepQuality) {
      if (workoutData.sleepQuality === 'Excelente') mappedSleep = SLEEP_QUALITY[0];
      else if (workoutData.sleepQuality === 'Boa') mappedSleep = SLEEP_QUALITY[1];
      else if (workoutData.sleepQuality === 'Regular') mappedSleep = SLEEP_QUALITY[2];
      else if (workoutData.sleepQuality === 'Ruim') mappedSleep = SLEEP_QUALITY[3];
      else if (workoutData.sleepQuality === 'Insônia') mappedSleep = SLEEP_QUALITY[4];
    }

    let mappedStress = formData.stressLevel;
    if (workoutData.stressLevel) {
      if (workoutData.stressLevel === 'Baixo') mappedStress = 'Baixo';
      else if (workoutData.stressLevel === 'Moderado') mappedStress = 'Moderado';
      else if (workoutData.stressLevel === 'Alto') mappedStress = 'Alto';
      else if (workoutData.stressLevel === 'Muito Alto') mappedStress = 'Muito Alto';
    }

    setFormData(prev => ({
      ...prev,
      age: workoutData.age || prev.age,
      weight: workoutData.weight || prev.weight,
      height: workoutData.height || prev.height,
      gender: (workoutData.gender === 'Masculino' || workoutData.gender === 'Feminino') ? workoutData.gender : prev.gender,
      goal: mappedGoal,
      activityLevel: mappedActivity,
      trainingFrequency: `${days}x na semana`,
      sleepQuality: mappedSleep,
      stressLevel: mappedStress,
      medications: workoutData.medications || prev.medications,
    }));
    setHasSynced(true);
  };

  const updateField = (field: keyof NutriAnamnesisData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: keyof NutriAnamnesisData, value: string) => {
    setFormData(prev => {
      const currentArray = prev[field] as string[];
      if (value === 'Nenhuma' || value === 'Nenhum' || value === 'Não tenho problemas emocionais com a comida') {
        return { ...prev, [field]: [value] };
      }
      
      let newArray = currentArray.filter(item => 
        item !== 'Nenhuma' && item !== 'Nenhum' && item !== 'Não tenho problemas emocionais com a comida'
      );
      
      if (newArray.includes(value)) {
        newArray = newArray.filter(item => item !== value);
      } else {
        newArray.push(value);
      }
      
      if (newArray.length === 0) {
        if (field === 'allergiesIntolerances' || field === 'foodAversions' || field === 'medicalConditions') newArray = ['Nenhuma'];
        if (field === 'currentSupplements') newArray = ['Nenhum'];
        if (field === 'emotionalEating') newArray = ['Não tenho problemas emocionais com a comida'];
      }
      
      return { ...prev, [field]: newArray };
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
    else onSubmit(formData);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand rounded-full z-0 transition-all duration-300"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        ></div>
        
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                isActive ? 'bg-brand border-brand text-white' : 
                isCompleted ? 'bg-brand border-brand text-white' : 
                'bg-white border-gray-300 text-gray-400'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`absolute -bottom-6 text-xs whitespace-nowrap hidden sm:block ${
                isActive ? 'text-brand font-bold' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-brand text-white p-6 md:p-8 text-center">
        <h2 className="text-3xl font-black uppercase tracking-tight">SpeltaNutri</h2>
        <p className="text-brand-50 mt-2">Anamnese Nutricional Completa</p>
      </div>

      <div className="p-6 md:p-8">
        {renderStepIndicator()}

        <div className="mt-8 sm:mt-12 min-h-[400px]">
          {/* STEP 1: Personal */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Perfil e Medidas</h3>
              
              {workoutData && !hasSynced && !initialData && (
                <div className="bg-brand/10 border border-brand/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand/20 text-brand rounded-lg">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">Sincronizar com SpeltaFit</h4>
                      <p className="text-sm text-gray-600">Identificamos que você já tem um perfil de treino. Deseja importar seus dados básicos?</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleSync}
                    className="whitespace-nowrap px-4 py-2 bg-brand text-white font-bold rounded-lg hover:bg-brand/90 transition-colors"
                  >
                    Importar Dados
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => updateField('name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                    placeholder="Seu nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Gênero</label>
                  <select 
                    value={formData.gender} 
                    onChange={e => updateField('gender', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Idade (anos)</label>
                  <input 
                    type="number" 
                    value={formData.age} 
                    onChange={e => updateField('age', Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Peso (kg)</label>
                  <input 
                    type="number" 
                    value={formData.weight} 
                    onChange={e => updateField('weight', Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Altura (cm)</label>
                  <input 
                    type="number" 
                    value={formData.height} 
                    onChange={e => updateField('height', Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Percentual de Gordura (%) <span className="text-gray-400 font-normal">- Opcional</span></label>
                  <input 
                    type="number" 
                    value={formData.bodyFatPercentage || ''} 
                    onChange={e => updateField('bodyFatPercentage', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                    placeholder="Ex: 15"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Goals */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Objetivos e Rotina</h3>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Qual seu objetivo principal?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOALS.map(goal => (
                    <button
                      key={goal}
                      onClick={() => updateField('goal', goal)}
                      className={`p-3 rounded-xl border text-left text-sm transition-all ${
                        formData.goal === goal 
                          ? 'bg-brand/10 border-brand text-brand font-bold' 
                          : 'bg-white border-gray-200 text-gray-700 hover:border-brand/50'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Nível de Atividade Física Diária (Trabalho/Rotina)</label>
                <div className="space-y-2">
                  {ACTIVITY_LEVELS.map(level => (
                    <button
                      key={level}
                      onClick={() => updateField('activityLevel', level)}
                      className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
                        formData.activityLevel === level 
                          ? 'bg-brand/10 border-brand text-brand font-bold' 
                          : 'bg-white border-gray-200 text-gray-700 hover:border-brand/50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Diet */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Hábitos e Restrições</h3>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Preferência Alimentar</label>
                <select 
                  value={formData.dietaryPreference} 
                  onChange={e => updateField('dietaryPreference', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                >
                  {DIETARY_PREFERENCES.map(pref => <option key={pref} value={pref}>{pref}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Alergias e Intolerâncias (Múltipla escolha)</label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGIES_INTOLERANCES.map(item => (
                    <button
                      key={item}
                      onClick={() => toggleArrayField('allergiesIntolerances', item)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${
                        formData.allergiesIntolerances.includes(item)
                          ? 'bg-red-50 border-red-500 text-red-700 font-bold'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Aversões Alimentares (O que você NÃO come de jeito nenhum)</label>
                <div className="flex flex-wrap gap-2">
                  {FOOD_AVERSIONS.map(item => (
                    <button
                      key={item}
                      onClick={() => toggleArrayField('foodAversions', item)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${
                        formData.foodAversions.includes(item)
                          ? 'bg-orange-50 border-orange-500 text-orange-700 font-bold'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Refeições por dia</label>
                  <select 
                    value={formData.mealsPerDay} 
                    onChange={e => updateField('mealsPerDay', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                  >
                    <option value="2 refeições">2 refeições</option>
                    <option value="3 refeições">3 refeições</option>
                    <option value="4 refeições">4 refeições</option>
                    <option value="5 refeições">5 refeições</option>
                    <option value="6 ou mais">6 ou mais</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Consumo de Água</label>
                  <select 
                    value={formData.waterIntake} 
                    onChange={e => updateField('waterIntake', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                  >
                    <option value="Menos de 1 Litro">Menos de 1 Litro</option>
                    <option value="1 a 2 Litros">1 a 2 Litros</option>
                    <option value="2 a 3 Litros">2 a 3 Litros</option>
                    <option value="Mais de 3 Litros">Mais de 3 Litros</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Emotional */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Emocional e Comportamento</h3>
              <p className="text-sm text-gray-500">A nutrição vai muito além do prato. Entender sua relação com a comida é fundamental para o sucesso.</p>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Como você se sente em relação à comida? (Múltipla escolha)</label>
                <div className="space-y-2">
                  {EMOTIONAL_EATING.map(item => (
                    <button
                      key={item}
                      onClick={() => toggleArrayField('emotionalEating', item)}
                      className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
                        formData.emotionalEating.includes(item)
                          ? 'bg-purple-50 border-purple-500 text-purple-700 font-bold'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nível de Estresse Atual</label>
                  <select 
                    value={formData.stressLevel} 
                    onChange={e => updateField('stressLevel', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                  >
                    <option value="Baixo">Baixo (Tranquilo)</option>
                    <option value="Moderado">Moderado (Normal do dia a dia)</option>
                    <option value="Alto">Alto (Frequente)</option>
                    <option value="Muito Alto">Muito Alto (Constante/Burnout)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Níveis de Energia</label>
                  <select 
                    value={formData.energyLevels} 
                    onChange={e => updateField('energyLevels', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                  >
                    <option value="Excelente o dia todo">Excelente o dia todo</option>
                    <option value="Boa na maior parte do dia">Boa na maior parte do dia</option>
                    <option value="Quedas bruscas à tarde">Quedas bruscas à tarde</option>
                    <option value="Cansaço constante">Cansaço constante</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Clinical */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Clínico e Suplementação</h3>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Qualidade do Sono</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SLEEP_QUALITY.map(item => (
                    <button
                      key={item}
                      onClick={() => updateField('sleepQuality', item)}
                      className={`p-3 rounded-xl border text-left text-sm transition-all ${
                        formData.sleepQuality === item
                          ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Funcionamento Intestinal</label>
                <select 
                  value={formData.bowelMovement} 
                  onChange={e => updateField('bowelMovement', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                >
                  {BOWEL_MOVEMENT.map(item => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Condições Médicas (Múltipla escolha)</label>
                <div className="flex flex-wrap gap-2">
                  {MEDICAL_CONDITIONS.map(item => (
                    <button
                      key={item}
                      onClick={() => toggleArrayField('medicalConditions', item)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${
                        formData.medicalConditions.includes(item)
                          ? 'bg-red-50 border-red-500 text-red-700 font-bold'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Suplementos Atuais (Múltipla escolha)</label>
                <div className="flex flex-wrap gap-2">
                  {CURRENT_SUPPLEMENTS.map(item => (
                    <button
                      key={item}
                      onClick={() => toggleArrayField('currentSupplements', item)}
                      className={`px-4 py-2 rounded-full border text-sm transition-all ${
                        formData.currentSupplements.includes(item)
                          ? 'bg-green-50 border-green-500 text-green-700 font-bold'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Uso de Medicamentos Contínuos? Quais?</label>
                <textarea 
                  value={formData.medications} 
                  onChange={e => updateField('medications', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all"
                  placeholder="Ex: Losartana, Anticoncepcional, etc. (Deixe em branco se nenhum)"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              currentStep === 0 
                ? 'opacity-0 pointer-events-none' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Voltar
          </button>
          
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-brand text-white hover:bg-brand-hover transition-all shadow-lg shadow-brand/30"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Gerando Plano...
              </>
            ) : currentStep === STEPS.length - 1 ? (
              <>
                Gerar Plano Nutricional
                <CheckCircle className="w-5 h-5" />
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
