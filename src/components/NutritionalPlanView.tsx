import React from 'react';
import { NutritionalPlan, NutriAnamnesisData } from '../types/nutrition';
import { Apple, Droplets, Flame, Brain, Heart, Activity, CheckCircle, Clock } from 'lucide-react';

interface Props {
  plan: NutritionalPlan;
  userData: NutriAnamnesisData;
  onReset: () => void;
}

export function NutritionalPlanView({ plan, userData, onReset }: Props) {
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
              <div className="p-6">
                {meal.options.map((option, optIdx) => (
                  <div key={optIdx}>
                    <ul className="space-y-2">
                      {option.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-brand mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
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
      <div className="flex justify-center pt-8">
        <button 
          onClick={onReset}
          className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
        >
          Refazer Anamnese Nutricional
        </button>
      </div>

    </div>
  );
}
