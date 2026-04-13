import React, { useState, useEffect } from 'react';
import { NutritionalPlan, NutriAnamnesisData } from '../types/nutrition';
import { Apple, Droplets, Flame, Brain, Heart, Activity, CheckCircle, Clock, Zap } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CrossSyncResult } from '../services/crossSyncEngine';

interface Props {
  plan: NutritionalPlan;
  userData: NutriAnamnesisData;
  onReset: () => void;
  readOnly?: boolean;
}

export function NutritionalPlanView({ plan, userData, onReset, readOnly = false }: Props) {
  const [latestCrossSync, setLatestCrossSync] = useState<CrossSyncResult | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const progressRef = doc(db, `users/${user.uid}/data/progress`);
          const snap = await getDoc(progressRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.checkins) {
              // Encontrar o checkin mais recente que tenha crossSync
              const checkinsArray = Object.values(data.checkins) as any[];
              const sortedCheckins = checkinsArray
                .filter(c => c.crossSync)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              
              if (sortedCheckins.length > 0) {
                // Verificar se o checkin é de hoje
                const latest = sortedCheckins[0];
                const today = new Date().toDateString();
                const checkinDate = new Date(latest.date).toDateString();
                
                if (today === checkinDate) {
                  setLatestCrossSync(latest.crossSync);
                }
              }
            }
          }
        } catch (err) {
          console.error("Error fetching cross-sync data:", err);
        }
      }
    };
    fetchProgress();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20">
      
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-brand text-white p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight">Plano SpeltaNutri</h1>
              <p className="text-brand-50 mt-1">Desenvolvido para {userData.name}</p>
            </div>
            <Apple className="w-12 h-12 text-white/20" />
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Strategy */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Flame className="w-5 h-5 text-brand" />
                Estratégia Nutricional
              </h3>
              <p className="text-gray-700 leading-relaxed">{plan.strategySummary}</p>
            </div>
            
            {/* Macros */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 text-center">Metas Diárias</h3>
              <div className="flex justify-center items-end gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-brand">{plan.targetCalories}</div>
                  <div className="text-xs text-gray-500 uppercase font-bold">Kcal</div>
                </div>
                <div className="h-12 w-px bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">{plan.macros.protein}g</div>
                  <div className="text-xs text-gray-500 uppercase font-bold">Proteína</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">{plan.macros.carbs}g</div>
                  <div className="text-xs text-gray-500 uppercase font-bold">Carbo</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-gray-800">{plan.macros.fats}g</div>
                  <div className="text-xs text-gray-500 uppercase font-bold">Gordura</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Water */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Meta de Hidratação</h3>
            <p className="text-gray-600 mt-1">{plan.waterIntakeGoal}</p>
          </div>
        </div>

        {/* Emotional */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Guia Comportamental</h3>
            <p className="text-gray-600 mt-1 text-sm">{plan.emotionalGuidelines}</p>
          </div>
        </div>
      </div>

      {/* Cross-Sync Dynamic Adjustment */}
      {latestCrossSync && latestCrossSync.postWorkoutMealAdjustment && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20 shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-600 uppercase tracking-tight mb-2">
                Ajuste Dinâmico Pós-Treino (Cross-Sync)
              </h3>
              <p className="text-sm text-gray-700 font-medium mb-4 leading-relaxed">
                Detectamos um treino com Volume Load de <span className="font-bold text-amber-600">{latestCrossSync.volumeLoadKg}kg</span>, gerando um gasto extra de <span className="font-bold text-amber-600">{latestCrossSync.energyCostKcal} kcal</span>. Adicione os seguintes itens à sua próxima refeição para otimizar a recuperação:
              </p>
              <ul className="space-y-2">
                {latestCrossSync.postWorkoutMealAdjustment.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                    <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Meals */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-brand" />
          Refeições
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plan.meals.map((meal, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">{meal.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                  <Clock className="w-4 h-4" />
                  {meal.time}
                </div>
              </div>
              <div className="p-6 space-y-6">
                {meal.options.map((option, optIdx) => (
                  <div key={optIdx} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <h4 className="font-bold text-brand mb-3 pb-2 border-b border-gray-100">{option.description}</h4>
                    <ul className="space-y-3">
                      {option.items.map((item, itemIdx) => {
                        // Highlight specific keywords for better readability
                        const isPreparation = item.startsWith('Preparo:');
                        const isSubstitution = item.startsWith('Substituição:');
                        
                        return (
                          <li key={itemIdx} className="flex items-start gap-3 text-sm text-gray-700">
                            {isPreparation ? (
                              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[10px] font-bold">P</span>
                              </div>
                            ) : isSubstitution ? (
                              <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-[10px] font-bold">S</span>
                              </div>
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            )}
                            <span className={isPreparation || isSubstitution ? 'font-medium text-gray-900' : ''}>
                              {item}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplements */}
      {plan.supplements.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-brand" />
              Suplementação Recomendada
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {plan.supplements.map((supp, index) => (
                <div key={index} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                  <h4 className="font-bold text-gray-900">{supp.name}</h4>
                  <p className="text-sm text-brand font-medium mt-1">{supp.dosage}</p>
                  <p className="text-xs text-gray-500 mt-2"><span className="font-semibold">Horário:</span> {supp.timing}</p>
                  <p className="text-xs text-gray-500 mt-1"><span className="font-semibold">Objetivo:</span> {supp.purpose}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className="flex justify-center pt-8">
          <button 
            onClick={onReset}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Refazer Anamnese Nutricional
          </button>
        </div>
      )}

    </div>
  );
}
