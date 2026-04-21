import React, { useState, useEffect } from 'react';
import { AnamnesisData, ExistingDay, ExistingExercise } from '../services/workoutGenerator';
import { Activity, User, Target, Calendar, AlertTriangle, HeartPulse, Dumbbell, Moon, Brain, FileText, Plus, Trash2, ChevronRight, ChevronLeft, ChevronDown, Sparkles, Apple, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  onSubmit: (data: AnamnesisData) => void;
  isLoading: boolean;
  initialData?: AnamnesisData | null;
}

const STEPS = [
  { id: 'biometrics', title: 'Biometria', icon: User },
  { id: 'goals', title: 'Objetivos e Estilo de Vida', icon: Target },
  { id: 'fit', title: 'Treino (SpeltaFit)', icon: Dumbbell },
  { id: 'nutri', title: 'Nutrição (SpeltaNutri)', icon: Apple },
  { id: 'fisio', title: 'Clínica (SpeltaFisio)', icon: HeartPulse },
];

export function Profile360Form({ onSubmit, isLoading, initialData }: Props) {
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState<AnamnesisData>(initialData || {
    name: '', age: undefined, gender: '', weight: undefined, height: undefined, bodyFat: undefined, targetWeight: undefined,
    goal: 'Hipertrofia', secondaryGoal: '', tertiaryGoal: '', specificGoals: [], activityLevel: 'Moderadamente Ativo', sleepQuality: 'Boa', stressLevel: 'Moderado',
    experience: 'Iniciante', daysPerWeek: 3, duration: 60, cardioPreference: 'Leve (Caminhada)', equipment: 'Academia Completa', limitations: '',
    dietaryPreference: 'Onívoro (Come de tudo)', allergiesIntolerances: ['Nenhuma'], foodAversions: ['Nenhuma'], mealsPerDay: '4 refeições', waterIntake: '1 a 2 Litros', emotionalEating: ['Não tenho problemas emocionais com a comida'], bowelMovement: '1x ao dia, normal',
    medications: 'Nenhum', medicalConditions: ['Nenhuma'], painPoints: [], postureIssues: 'Nenhum',
    structuredExistingPlan: [], remodelPlan: false
  });

  const updateField = (field: keyof AnamnesisData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field: keyof AnamnesisData, value: string, noneValue: string) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      if (value === noneValue) {
        return { ...prev, [field]: [value] };
      }
      let newArray = currentArray.filter(item => item !== noneValue);
      if (newArray.includes(value)) {
        newArray = newArray.filter(item => item !== value);
      } else {
        newArray.push(value);
      }
      if (newArray.length === 0) newArray = [noneValue];
      return { ...prev, [field]: newArray };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
    else onSubmit(formData);
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand rounded-full z-0 transition-all duration-300"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        ></div>
        {STEPS.map((step, index) => {
          const isActive = index === currentStep;
          const isPassed = index < currentStep;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group cursor-pointer" onClick={() => index < currentStep && setCurrentStep(index)}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isActive ? 'bg-brand text-white scale-110 shadow-lg' : 
                isPassed ? 'bg-brand text-white border-2 border-brand' : 'bg-surface border-2 border-border text-text-muted hover:border-brand/50'
              }`}>
                <step.icon className="w-5 h-5" />
              </div>
              <span className={`absolute -bottom-6 text-[10px] sm:text-xs font-bold whitespace-nowrap hidden sm:block ${
                isActive ? 'text-brand' : isPassed ? 'text-text-main' : 'text-text-muted'
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
    <div className="w-full max-w-4xl mx-auto px-4 py-8 relative">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-text-main">Avaliação 360º</h2>
        <p className="text-text-muted mt-2">Diga-nos quem você é. Nós construímos o resto.</p>
      </div>

      <div className="bg-surface border border-border rounded-3xl p-6 md:p-10 shadow-xl">
        {renderStepIndicator()}

        <form onSubmit={e => { e.preventDefault(); handleNext(); }} className="space-y-8 mt-12 sm:mt-8 relative min-h-[400px]">
          
          {/* STEP 0: Biometrics */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-bold text-text-main border-b border-border pb-2">Seu Chassi (Medidas Básicas)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Nome Completo</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Idade</label>
                  <input type="number" name="age" value={formData.age || ''} onChange={handleChange} required
                    className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Sexo Biológico</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required
                    className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none">
                    <option value="">Selecione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Peso (kg)</label>
                  <input type="number" name="weight" value={formData.weight || ''} onChange={handleChange} required
                    className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Altura (cm)</label>
                  <input type="number" name="height" value={formData.height || ''} onChange={handleChange} required
                    className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-1">Percentual de Gordura (%) - Sugerido</label>
                  <input type="number" name="bodyFat" value={formData.bodyFat || ''} onChange={handleChange} placeholder="Opcional"
                    className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Goals and Lifestyle */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-bold text-text-main border-b border-border pb-2">Missão e Estilo de Vida</h3>
              
              <div>
                <label className="block text-sm font-bold text-text-main mb-3">Qual a missão principal?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Emagrecimento', 'Hipertrofia', 'Força', 'Condicionamento', 'Saúde e Bem-estar'].map(goal => (
                    <button key={goal} type="button" onClick={() => updateField('goal', goal)}
                      className={`p-3 rounded-xl border text-left text-sm font-bold transition-all ${
                        formData.goal === goal ? 'bg-brand/10 border-brand text-brand' : 'bg-bg-main border-border text-text-muted hover:border-brand/50'
                      }`}>
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-3">Nível de Atividade Diária (Trabalho/Rotina)</label>
                <select name="activityLevel" value={formData.activityLevel} onChange={handleChange} className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none">
                  <option value="Sedentário">Sedentário (Trabalho em mesa, sem exercícios extra)</option>
                  <option value="Levemente Ativo">Levemente Ativo (Exercício leve 1-3 dias/sem)</option>
                  <option value="Moderadamente Ativo">Moderadamente Ativo (Exercício moderado 3-5 dias/sem)</option>
                  <option value="Muito Ativo">Muito Ativo (Atleta ou trabalho braçal pesado)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-text-main mb-3">Qualidade do Sono</label>
                  <select name="sleepQuality" value={formData.sleepQuality} onChange={handleChange} className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none">
                    <option value="Excelente">Excelente (7-9h, acordo revigorado)</option>
                    <option value="Boa">Boa</option>
                    <option value="Regular">Regular (Acordo algumas vezes)</option>
                    <option value="Ruim">Ruim (Cansado)</option>
                    <option value="Insônia">Insônia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-3">Nível de Estresse Mensal</label>
                  <select name="stressLevel" value={formData.stressLevel} onChange={handleChange} className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none">
                    <option value="Baixo">Baixo (Tranquilo)</option>
                    <option value="Moderado">Moderado</option>
                    <option value="Alto">Alto</option>
                    <option value="Muito Alto">Muito Alto (Esgotado)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Workout Specifics */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-bold text-text-main border-b border-border pb-2">SpeltaFit (Configuração de Treino)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-text-main mb-3">Experiência na Musculação</label>
                  <select name="experience" value={formData.experience} onChange={handleChange} className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none">
                    <option value="Iniciante">Iniciante (0 a 6 meses)</option>
                    <option value="Intermediário">Intermediário (6 a 18 meses)</option>
                    <option value="Avançado">Avançado (+ de 18 meses consistentes)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-3">Dias disponíveis por semana</label>
                  <input type="number" name="daysPerWeek" value={formData.daysPerWeek || ''} onChange={handleChange} min="1" max="7" required
                    className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-3">Minutos por sessão</label>
                  <input type="number" name="duration" value={formData.duration || ''} onChange={handleChange} min="30" max="120" required
                    className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-text-main mb-3">Onde vai treinar?</label>
                  <select name="equipment" value={formData.equipment} onChange={handleChange} className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none">
                    <option value="Academia Completa">Academia Completa</option>
                    <option value="Academia de Prédio">Academia de Condomínio</option>
                    <option value="Cárdio/Calistenia/Híbrido">Estúdio Híbrido</option>
                    <option value="Casa (Equipamento Limitado)">Casa (Pesos Livres)</option>
                    <option value="Casa (Apenas Peso Corporal)">Peso do Corpo</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Nutrition Specifics */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-bold text-text-main border-b border-border pb-2">SpeltaNutri (Combustível)</h3>
              
              <div>
                <label className="block text-sm font-bold text-text-main mb-3">Preferência Alimentar</label>
                <select name="dietaryPreference" value={formData.dietaryPreference} onChange={handleChange} className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none">
                  <option value="Onívoro (Come de tudo)">Onívoro (Come de tudo)</option>
                  <option value="Vegetariano Estrito">Vegetariano Estrito</option>
                  <option value="Ovolactovegetariano">Ovolactovegetariano</option>
                  <option value="Low Carb">Low Carb (Baixo Carbo)</option>
                  <option value="Cetogênica">Cetogênica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-3">Quantas refeições prefere fazer no dia?</label>
                <select name="mealsPerDay" value={formData.mealsPerDay} onChange={handleChange} className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none">
                  <option value="2 a 3 grandes refeições">2 a 3 refeições (Jejum/Praticidade)</option>
                  <option value="4 refeições">4 refeições (Café, Almoço, Tarde, Jantar)</option>
                  <option value="5 a 6 refeições">5 a 6 refeições (Volume alto)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-3">Alergias (Múltipla escolha)</label>
                <div className="flex flex-wrap gap-2">
                  {['Nenhuma', 'Lactose', 'Glúten', 'Amendoim', 'Frutos do Mar'].map(item => (
                    <button key={item} type="button" onClick={() => toggleArrayField('allergiesIntolerances', item, 'Nenhuma')}
                      className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${
                        formData.allergiesIntolerances?.includes(item) ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-bg-main border-border text-text-muted'
                      }`}>{item}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Fisio Specifics */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-bold text-text-main border-b border-border pb-2">SpeltaFisio (Segurança e Ortopedia)</h3>
              <p className="text-sm text-text-muted mb-4">Sua biomecânica é crucial. Marque locais de dor aguda ou lesões antigas. Nosso sistema fará o "Override" (veto) de exercícios nocivos.</p>
              
              <div>
                <label className="block text-sm font-bold text-text-main mb-3">Onde você tem dores chatas ou crônicas?</label>
                <div className="flex flex-wrap gap-2">
                  {['Nenhuma Dor', 'Lombar', 'Joelho Patelar / Condromalácia', 'Joelho (LCA/Menisco)', 'Ombro / Manguito', 'Cervical / Pescoço', 'Quadril', 'Cotovelo'].map(item => (
                    <button key={item} type="button" onClick={() => toggleArrayField('painPoints', item, 'Nenhuma Dor')}
                      className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${
                        formData.painPoints?.includes(item) ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-bg-main border-border text-text-muted'
                      }`}>{item}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-main mb-3">Faz uso de Alguma Medicação Contínua?</label>
                <input type="text" name="medications" value={formData.medications} onChange={handleChange} placeholder="Ex: Losartana, Levotiroxina, Nenhum"
                  className="w-full p-3 bg-bg-main border border-border rounded-xl focus:border-brand outline-none" />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-8 flex justify-between gap-4 mt-auto">
            {currentStep > 0 ? (
              <button type="button" onClick={() => setCurrentStep(p => p - 1)}
                className="px-6 py-4 rounded-xl border border-border text-text-main hover:bg-bg-main transition-colors flex items-center gap-2 font-bold">
                <ChevronLeft className="w-5 h-5" /> Voltar
              </button>
            ) : <div></div>}
            
            <button type="submit" disabled={isLoading}
              className="flex-1 bg-brand hover:bg-brand-hover text-white font-black text-lg py-4 px-6 rounded-xl transition-transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Calculando Protocolos...
                </>
              ) : currentStep === STEPS.length - 1 ? (
                <>
                  <Sparkles className="w-5 h-5" /> Gerar Avaliação 360 e Protocolos
                </>
              ) : (
                <>
                  Continuar <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
