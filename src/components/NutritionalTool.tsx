import React, { useState, useEffect } from 'react';
import { NutritionalAnamnesisForm } from './NutritionalAnamnesisForm';
import { DietPlanView } from './DietPlanView';
import { NutritionalAnamnesis, DietPlan, generateDietPlan } from '../services/nutritionGenerator';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Apple, ChevronLeft, LayoutDashboard, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NutritionalToolProps {
  physicalAnamnesis: any;
  onBack: () => void;
}

type ViewState = 'dashboard' | 'form' | 'plan' | 'history' | 'progress';

export function NutritionalTool({ physicalAnamnesis, onBack }: NutritionalToolProps) {
  const [view, setView] = useState<ViewState>('dashboard');
  const [nutritionalAnamnesis, setNutritionalAnamnesis] = useState<NutritionalAnamnesis | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          // Do not auto-redirect to 'plan' view to allow users to see the dashboard/landing first
        }
      } catch (err) {
        console.error("Error loading nutrition data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAnamnesisSubmit = async (data: NutritionalAnamnesis) => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const generatedPlan = await generateDietPlan(physicalAnamnesis, data);
      
      // Deep clean undefined values before saving to Firestore
      const cleanObject = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(cleanObject);
        } else if (obj !== null && typeof obj === 'object') {
          return Object.fromEntries(
            Object.entries(obj)
              .filter(([_, v]) => v !== undefined)
              .map(([k, v]) => [k, cleanObject(v)])
          );
        }
        return obj;
      };

      const cleanData = cleanObject(data);
      const cleanPlan = cleanObject(generatedPlan);

      setDietPlan(cleanPlan);
      setNutritionalAnamnesis(cleanData);
      setView('plan');

      // Save to Firestore
      const anamnesisRef = doc(db, `users/${auth.currentUser.uid}/data/nutritionalAnamnesis`);
      const planRef = doc(db, `users/${auth.currentUser.uid}/data/dietPlan`);

      await Promise.all([
        setDoc(anamnesisRef, cleanData),
        setDoc(planRef, cleanPlan)
      ]);
    } catch (err: any) {
      console.error("Error generating/saving diet plan:", err);
      const errorMessage = err?.message || "Erro desconhecido";
      setError(`Erro ao gerar plano nutricional: ${errorMessage}. Verifique sua conexão e tente novamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!auth.currentUser) return;
    
    setIsLoading(true);
    try {
      const anamnesisRef = doc(db, `users/${auth.currentUser.uid}/data/nutritionalAnamnesis`);
      const planRef = doc(db, `users/${auth.currentUser.uid}/data/dietPlan`);

      await Promise.all([
        deleteDoc(anamnesisRef),
        deleteDoc(planRef)
      ]);
      
      setDietPlan(null);
      setNutritionalAnamnesis(null);
      setView('form'); // Go directly to form to start over
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-text-main transition-colors font-bold"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar para Treinos
        </button>
        <div className="flex items-center gap-4">
          <NavButton active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard className="w-4 h-4" />} label="Geral" />
          <NavButton active={view === 'plan'} onClick={() => dietPlan ? setView('plan') : setView('form')} icon={<Apple className="w-4 h-4" />} label="Dieta" />
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
                  <h2 className="text-3xl font-black tracking-tight mb-4">Seu Plano Nutricional</h2>
                  <p className="text-text-muted mb-8 text-lg">
                    {dietPlan 
                      ? "Seu cardápio está pronto! Clique para visualizar suas refeições e recomendações."
                      : "Ainda não geramos seu plano nutricional. Responda algumas perguntas para começarmos."}
                  </p>
                </div>
                <button 
                  onClick={() => dietPlan ? setView('plan') : setView('form')}
                  className="w-full py-4 rounded-2xl bg-brand text-text-inverse font-black hover:scale-[1.02] transition-all shadow-xl shadow-brand/20"
                >
                  {dietPlan ? "Ver Cardápio" : "Começar Agora"}
                </button>
              </div>

              <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl">
                <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 w-fit mb-6">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black tracking-tight mb-4">Acompanhamento</h2>
                <p className="text-text-muted mb-8 text-lg">
                  Monitore seu peso, adesão à dieta e níveis de energia para ajustes precisos.
                </p>
                <div className="p-6 rounded-2xl bg-bg-main border border-border text-center">
                  <span className="text-text-muted font-bold">Funcionalidade em breve</span>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'form' && (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <NutritionalAnamnesisForm 
                onSubmit={handleAnamnesisSubmit} 
                isLoading={isLoading} 
                userGoal={physicalAnamnesis?.goal}
              />
            </motion.div>
          )}

          {view === 'plan' && dietPlan && (
            <motion.div 
              key="plan"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DietPlanView plan={dietPlan} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
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
