import React, { useState, useEffect } from 'react';
import { DietPlanView } from './DietPlanView';
import { RecipeView } from './RecipeView';
import { NutritionProgressView } from './NutritionProgressView';
import { NutritionalAnamnesis, DietPlan, generateDietPlan } from '../services/nutritionGenerator';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Apple, ChevronLeft, LayoutDashboard, TrendingUp, AlertCircle, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NutritionalToolProps {
  physicalAnamnesis: any;
  onBack: () => void;
}

type ViewState = 'dashboard' | 'plan' | 'history' | 'progress' | 'recipes';

export function NutritionalTool({ physicalAnamnesis, onBack }: NutritionalToolProps) {
  const [view, setView] = useState<ViewState>('dashboard');
  const [nutritionalAnamnesis, setNutritionalAnamnesis] = useState<NutritionalAnamnesis | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showResetModal, setShowResetModal] = useState(false);

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

        if (anamnesisSnap.exists()) setNutritionalAnamnesis(anamnesisSnap.data() as NutritionalAnamnesis);
        if (planSnap.exists()) {
          setDietPlan(planSnap.data() as DietPlan);
        }
      } catch (err) {
        console.error("Error loading nutrition data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleReset = async () => {
    if (!auth.currentUser) return;
    
    setShowResetModal(false);
    setIsLoading(true);
    try {
      const anamnesisRef = doc(db, `users/${auth.currentUser.uid}/data/nutritionalAnamnesis`);
      const planRef = doc(db, `users/${auth.currentUser.uid}/data/dietPlan`);
      const trackingRef = doc(db, `users/${auth.currentUser.uid}/data/nutritionTracking`);

      await Promise.all([
        deleteDoc(anamnesisRef).catch(() => {}),
        deleteDoc(planRef).catch(() => {}),
        deleteDoc(trackingRef).catch(() => {})
      ]);
      
      setDietPlan(null);
      setNutritionalAnamnesis(null);
      onBack(); // Redirect to main anamnesis
    } catch (err) {
      console.error("Error resetting plan:", err);
      setError("Erro ao resetar plano. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <NavButton active={view === 'plan'} onClick={() => dietPlan ? setView('plan') : alert('Gere seu treino e dieta primeiro na página principal.')} icon={<Apple className="w-4 h-4" />} label="Dieta" />
          <NavButton active={view === 'recipes'} onClick={() => setView('recipes')} icon={<BookOpen className="w-4 h-4" />} label="Receitas" />
          <NavButton active={view === 'progress'} onClick={() => setView('progress')} icon={<TrendingUp className="w-4 h-4" />} label="Evolução" />
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
                  <p className="text-text-muted mb-8 text-lg">
                    {dietPlan 
                      ? "Seu cardápio está pronto! Clique para visualizar suas refeições e recomendações."
                      : "Ainda não geramos seu plano nutricional. Para gerar seu treino e dieta integrados, você precisa criar um novo planejamento."}
                  </p>
                </div>
                <button 
                  onClick={() => dietPlan ? setView('plan') : onBack()}
                  className="w-full py-4 rounded-2xl bg-brand text-text-inverse font-black hover:scale-[1.02] transition-all shadow-xl shadow-brand/20"
                >
                  {dietPlan ? "Ver Cardápio" : "Voltar para Treinos"}
                </button>
              </div>

              <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 w-fit mb-6">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-4">Acompanhamento</h2>
                  <p className="text-text-muted mb-8 text-lg">
                    Monitore seu peso, adesão à dieta e níveis de energia para ajustes precisos.
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-3xl p-8 max-w-md w-full border border-border shadow-2xl">
              <div className="flex items-center gap-4 mb-6 text-brand">
                <div className="p-3 bg-brand/10 rounded-xl">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black">Novo Planejamento</h3>
              </div>
              <p className="text-text-main mb-8 font-medium">
                Para gerar um novo planejamento nutricional, você precisa preencher a anamnese completa novamente. Deseja continuar?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 px-4 bg-bg-main text-text-main rounded-xl font-bold hover:bg-surface border border-border transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 bg-brand text-text-inverse rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Sim, Continuar
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
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${
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
