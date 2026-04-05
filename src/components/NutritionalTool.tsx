import React, { useState, useEffect } from 'react';
import { DietPlanView } from './DietPlanView';
import { RecipeView } from './RecipeView';
import { NutritionProgressView } from './NutritionProgressView';
import { NutritionalAnamnesis, DietPlan, generateDietPlan } from '../services/nutritionGenerator';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Apple, ChevronLeft, LayoutDashboard, TrendingUp, AlertCircle, BookOpen, RefreshCw, Utensils, Clock, Wallet, CheckCircle2, Sparkles, Droplets } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NutritionalToolProps {
  physicalAnamnesis: any;
  onBack: () => void;
  onReset: () => void;
}

type ViewState = 'dashboard' | 'plan' | 'history' | 'progress' | 'recipes' | 'form';

export function NutritionalTool({ physicalAnamnesis, onBack, onReset }: NutritionalToolProps) {
  const [view, setView] = useState<ViewState>('dashboard');
  const [nutritionalAnamnesis, setNutritionalAnamnesis] = useState<NutritionalAnamnesis | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // Form State for Nutritional Anamnesis
  const [formData, setFormData] = useState<NutritionalAnamnesis>({
    mealCount: 4,
    dietType: 'Onívora',
    allergies: '',
    dislikes: '',
    budget: 'Moderado',
    cookingTime: 'Moderado',
    supplements: [],
    waterIntake: 2,
    updatedAt: new Date().toISOString()
  });

  useEffect(() => {
    const loadData = async () => {
      if (!auth.currentUser) return;
      setIsLoading(true);
      try {
        const anamnesisRef = doc(db, `users/${auth.currentUser.uid}/data/nutritionalAnamnesis`);
        const planRef = doc(db, `users/${auth.currentUser.uid}/data/dietPlan`);
        
        const [anamnesisSnap, planSnap] = await Promise.all([
          getDoc(anamnesisRef),
          getDoc(planRef)
        ]);

        if (anamnesisSnap.exists()) {
          const data = anamnesisSnap.data() as NutritionalAnamnesis;
          setNutritionalAnamnesis(data);
          setFormData(data);
        }
        if (planSnap.exists()) {
          setDietPlan(planSnap.data() as DietPlan);
        } else if (anamnesisSnap.exists()) {
          // If we have anamnesis but no plan, maybe we should show the form or generate
          setView('form');
        }
      } catch (err) {
        console.error("Error loading nutrition data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const generatedPlan = await generateDietPlan(physicalAnamnesis, formData);
      
      const anamnesisRef = doc(db, `users/${auth.currentUser.uid}/data/nutritionalAnamnesis`);
      const planRef = doc(db, `users/${auth.currentUser.uid}/data/dietPlan`);
      
      await Promise.all([
        setDoc(anamnesisRef, { ...formData, updatedAt: new Date().toISOString() }),
        setDoc(planRef, { ...generatedPlan, createdAt: new Date().toISOString() })
      ]);
      
      setNutritionalAnamnesis(formData);
      setDietPlan(generatedPlan);
      setView('plan');
    } catch (err) {
      console.error("Error generating diet plan:", err);
      setError("Erro ao gerar plano nutricional. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullReset = async () => {
    setShowResetModal(false);
    onReset(); // This resets the entire app state in App.tsx
  };

  if (isLoading && !dietPlan && view !== 'form') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
          <p className="text-text-muted font-bold animate-pulse">Carregando SpeltaNutri...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors font-bold shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Voltar<span className="hidden md:inline"> para Treinos</span></span>
        </button>
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard className="w-4 h-4" />} label="Visão Geral" />
          <NavButton active={view === 'plan'} onClick={() => dietPlan ? setView('plan') : setView('form')} icon={<Apple className="w-4 h-4" />} label="Dieta" />
          <NavButton active={view === 'recipes'} onClick={() => setView('recipes')} icon={<BookOpen className="w-4 h-4" />} label="Receitas" />
          <NavButton active={view === 'progress'} onClick={() => setView('progress')} icon={<TrendingUp className="w-4 h-4" />} label="Evolução" />
          <button 
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Novo Planejamento</span>
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="p-4 rounded-2xl bg-brand/10 text-brand w-fit mb-6">
                    <Apple className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-4">SpeltaNutri</h2>
                  <p className="text-text-muted mb-8 text-lg leading-relaxed">
                    {dietPlan 
                      ? "Seu cardápio está pronto e integrado ao seu treino! Clique para visualizar suas refeições e recomendações estratégicas."
                      : "Ainda não geramos seu plano nutricional personalizado. Vamos configurar suas preferências para criar a dieta perfeita para seu objetivo."}
                  </p>
                </div>
                <button 
                  onClick={() => dietPlan ? setView('plan') : setView('form')}
                  className="w-full py-4 rounded-2xl bg-brand text-text-inverse font-black hover:scale-[1.02] transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3"
                >
                  {dietPlan ? "Ver Cardápio" : "Configurar Dieta"}
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 w-fit mb-6">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-4">Acompanhamento</h2>
                  <p className="text-text-muted mb-8 text-lg leading-relaxed">
                    Monitore seu peso, adesão à dieta e níveis de energia. O acompanhamento é a chave para ajustes precisos e resultados duradouros.
                  </p>
                </div>
                <button 
                  onClick={() => setView('progress')}
                  className="w-full py-4 rounded-2xl bg-blue-500 text-white font-black hover:scale-[1.02] transition-all shadow-xl shadow-blue-500/20"
                >
                  Acessar Diário
                </button>
              </div>
            </motion.div>
          )}

          {view === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-brand/10 text-brand">
                    <Apple className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight">Anamnese Nutricional</h2>
                    <p className="text-text-muted font-bold">Personalize seu plano alimentar</p>
                  </div>
                </div>

                <form onSubmit={handleGeneratePlan} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
                        <Utensils className="w-4 h-4 text-brand" /> Número de Refeições
                      </label>
                      <select 
                        value={formData.mealCount}
                        onChange={(e) => setFormData({...formData, mealCount: parseInt(e.target.value)})}
                        className="w-full p-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold transition-all"
                      >
                        {[3, 4, 5, 6].map(n => (
                          <option key={n} value={n}>{n} Refeições por dia</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand" /> Tipo de Dieta
                      </label>
                      <select 
                        value={formData.dietType}
                        onChange={(e) => setFormData({...formData, dietType: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold transition-all"
                      >
                        <option value="Onívora">Onívora (Tudo)</option>
                        <option value="Vegetariana">Vegetariana</option>
                        <option value="Vegana">Vegana</option>
                        <option value="Low Carb">Low Carb</option>
                        <option value="Cetogênica">Cetogênica</option>
                        <option value="Hiperproteica">Dieta da Proteína (Hiperproteica)</option>
                        <option value="Jejum Intermitente">Jejum Intermitente</option>
                        <option value="Paleolítica">Paleolítica</option>
                        <option value="Flexível">Flexível (IIFYM)</option>
                        <option value="Mediterrânea">Mediterrânea</option>
                        <option value="Carnívora">Carnívora</option>
                        <option value="DASH">DASH</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand" /> Tempo para Cozinhar
                      </label>
                      <select 
                        value={formData.cookingTime}
                        onChange={(e) => setFormData({...formData, cookingTime: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold transition-all"
                      >
                        <option value="Pouco">Pouco (Pratos rápidos)</option>
                        <option value="Moderado">Moderado (Até 30 min)</option>
                        <option value="Muito">Muito (Gosto de cozinhar)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-brand" /> Orçamento Mensal
                      </label>
                      <select 
                        value={formData.budget}
                        onChange={(e) => setFormData({...formData, budget: e.target.value})}
                        className="w-full p-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold transition-all"
                      >
                        <option value="Econômico">Econômico (Básico)</option>
                        <option value="Moderado">Moderado (Padrão)</option>
                        <option value="Premium">Premium (Suplementos + Variedade)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-black text-text-main uppercase tracking-wider flex items-center gap-2">
                        <Droplets className="w-4 h-4 text-blue-500" /> Meta de Água (Litros)
                      </label>
                      <input 
                        type="number"
                        step="0.5"
                        min="1"
                        max="10"
                        value={formData.waterIntake}
                        onChange={(e) => setFormData({...formData, waterIntake: parseFloat(e.target.value)})}
                        className="w-full p-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-black text-text-main uppercase tracking-wider block">Suplementação Atual</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Whey Protein', 'Creatina', 'Multivitamínico', 'Ômega 3', 'BCAA', 'Glutamina', 'Cafeína', 'Pré-Treino'].map(supp => (
                        <button
                          key={supp}
                          type="button"
                          onClick={() => {
                            const current = formData.supplements || [];
                            const next = current.includes(supp) 
                              ? current.filter(s => s !== supp)
                              : [...current, supp];
                            setFormData({...formData, supplements: next});
                          }}
                          className={`p-3 rounded-xl text-xs font-bold border transition-all ${
                            formData.supplements?.includes(supp)
                              ? 'bg-brand/10 border-brand text-brand shadow-sm'
                              : 'bg-bg-main border-border text-text-muted hover:border-brand/50'
                          }`}
                        >
                          {supp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-text-main uppercase tracking-wider">O que você NÃO gosta de comer?</label>
                    <textarea 
                      value={formData.dislikes}
                      onChange={(e) => setFormData({...formData, dislikes: e.target.value})}
                      placeholder="Ex: Coentro, Berinjela, Fígado..."
                      className="w-full p-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold transition-all min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black text-text-main uppercase tracking-wider">Alergias ou Intolerâncias?</label>
                    <textarea 
                      value={formData.allergies}
                      onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                      placeholder="Ex: Lactose, Glúten, Amendoim..."
                      className="w-full p-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold transition-all min-h-[80px]"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-5 rounded-2xl bg-brand text-text-inverse font-black text-xl shadow-xl shadow-brand/20 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                        Gerando seu Cardápio...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-6 h-6" />
                        Gerar Planejamento Nutricional
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {view === 'plan' && dietPlan && (
            <motion.div 
              key="plan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DietPlanView plan={dietPlan} onReset={() => setShowResetModal(true)} />
            </motion.div>
          )}

          {view === 'progress' && (
            <motion.div 
              key="progress"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <NutritionProgressView physicalAnamnesis={physicalAnamnesis} />
            </motion.div>
          )}

          {view === 'recipes' && (
            <motion.div 
              key="recipes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <RecipeView dietPlan={dietPlan} />
            </motion.div>
          )}
        </AnimatePresence>

        {showResetModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-4">
            <div className="bg-surface rounded-[2.5rem] p-8 max-w-md w-full border border-border shadow-2xl">
              <div className="flex items-center gap-4 mb-6 text-red-500">
                <div className="p-3 bg-red-500/10 rounded-xl">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black">Novo Planejamento</h3>
              </div>
              <p className="text-text-main mb-8 font-medium text-lg leading-relaxed">
                Você deseja criar um **novo planejamento completo** (Treino + Dieta)? 
                Isso irá resetar sua anamnese e progresso atual para começarmos do zero.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-4 px-4 bg-bg-main text-text-main rounded-2xl font-bold hover:bg-surface border border-border transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleFullReset}
                  className="flex-1 py-4 px-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 cursor-pointer"
                >
                  Sim, Resetar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all shrink-0 ${
        active 
          ? 'bg-brand text-text-inverse shadow-lg shadow-brand/20' 
          : 'bg-surface border border-border text-text-muted hover:text-text-main'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
