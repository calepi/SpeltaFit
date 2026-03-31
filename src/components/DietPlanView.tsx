import React from 'react';
import { DietPlan, Meal } from '../services/nutritionGenerator';
import { Apple, Clock, Flame, Zap, Droplets, Pill, Info, Printer, RefreshCw, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface DietPlanViewProps {
  plan: DietPlan;
  onReset: () => void;
}

export function DietPlanView({ plan, onReset }: DietPlanViewProps) {
  const handlePrint = () => {
    try {
      // Ensure we are in a context where print is available
      if (typeof window !== 'undefined') {
        window.print();
      }
    } catch (e) {
      console.error("Print error:", e);
      // Fallback for some iframe environments
      const printButton = document.querySelector('button');
      if (printButton) {
        window.print();
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[3rem] bg-surface border border-border p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 text-brand text-xs font-black uppercase tracking-widest">
                Plano Nutricional Profissional
              </div>
              <button 
                onClick={handlePrint}
                className="md:hidden p-2 rounded-xl bg-brand/10 text-brand print:hidden"
              >
                <Printer className="w-5 h-5" />
              </button>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Seu Cardápio <br />
              <span className="text-brand">Personalizado</span>
            </h1>
            <p className="text-text-muted max-w-md text-lg">
              Focado em <span className="text-text-main font-bold">{plan.goal}</span>. 
              Siga as orientações para maximizar seus resultados.
            </p>
            <button 
              onClick={handlePrint}
              className="hidden md:flex items-center gap-2 px-6 py-2 rounded-xl bg-brand/10 text-brand font-black hover:bg-brand/20 transition-all print:hidden"
            >
              <Printer className="w-4 h-4" />
              Imprimir PDF
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
            <StatCard icon={<Flame className="w-5 h-5" />} label="Calorias" value={`${plan.calories} kcal`} color="brand" />
            <StatCard icon={<Zap className="w-5 h-5" />} label="Proteína" value={`${plan.macros.protein}g`} color="blue" />
            <StatCard icon={<Apple className="w-5 h-5" />} label="Carbos" value={`${plan.macros.carbs}g`} color="green" />
            <StatCard icon={<Droplets className="w-5 h-5" />} label="Gorduras" value={`${plan.macros.fats}g`} color="gold" />
          </div>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {plan.meals.map((meal, idx) => (
          <MealCard key={idx} meal={meal} index={idx} />
        ))}
      </div>

      {/* Supplementation & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Suplementação</h3>
          </div>
          <div className="prose prose-invert max-w-none text-text-muted leading-relaxed whitespace-pre-line">
            {plan.supplementation}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-brand/10 text-brand">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Recomendações</h3>
          </div>
          <div className="prose prose-invert max-w-none text-text-muted leading-relaxed whitespace-pre-line">
            {plan.recommendations}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-surface border border-border font-black hover:bg-bg-main transition-all"
        >
          <Printer className="w-5 h-5" />
          Imprimir PDF
        </button>
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand text-text-inverse font-black hover:scale-105 transition-all shadow-xl shadow-brand/20 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className="w-5 h-5" />
          Novo Planejamento
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  const colors: Record<string, string> = {
    brand: 'bg-brand/10 text-brand',
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    gold: 'bg-gold/10 text-gold'
  };

  return (
    <div className="bg-bg-main border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1 min-w-[100px]">
      <div className={`p-2 rounded-xl ${colors[color] || colors.brand}`}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</span>
      <span className="text-sm font-black text-text-main">{value}</span>
    </div>
  );
}

interface MealCardProps {
  meal: Meal;
  index: number;
  key?: React.Key;
}

function MealCard({ meal, index }: MealCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col"
    >
      <div className="p-6 border-b border-border bg-bg-main/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand text-text-inverse flex items-center justify-center font-black text-lg">
            {index + 1}
          </div>
          <div>
            <h4 className="font-black text-lg tracking-tight">{meal.name}</h4>
            <div className="flex items-center gap-1 text-xs text-text-muted font-bold">
              <Clock className="w-3 h-3" />
              {meal.time}
            </div>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest">
          {meal.foods.reduce((acc, f) => acc + f.calories, 0)} kcal
        </div>
      </div>

      <div className="p-6 flex-grow space-y-4">
        {meal.foods.map((food, fIdx) => (
          <div key={fIdx} className="flex items-start justify-between group">
            <div className="flex gap-3">
              <div className="mt-1">
                <CheckCircle2 className="w-4 h-4 text-brand/40 group-hover:text-brand transition-colors" />
              </div>
              <div>
                <div className="font-bold text-text-main group-hover:text-brand transition-colors">{food.item}</div>
                <div className="text-xs text-text-muted font-medium">{food.quantity}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-text-main">{food.calories} kcal</div>
              <div className="text-[10px] text-text-muted font-bold">P: {food.protein}g | C: {food.carbs}g</div>
            </div>
          </div>
        ))}

        {/* Variations Section */}
        {meal.variations && meal.variations.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border border-dashed space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-brand uppercase tracking-widest">
              <RefreshCw className="w-3 h-3" />
              Opções de Variação
            </div>
            {meal.variations.map((variation, vIdx) => (
              <div key={vIdx} className="p-4 rounded-2xl bg-bg-main border border-border/50 hover:border-brand/30 transition-all">
                <div className="text-sm font-black text-text-main mb-2">{variation.description}</div>
                <div className="space-y-1">
                  {variation.foods.map((vFood, vfIdx) => (
                    <div key={vfIdx} className="text-xs text-text-muted flex justify-between">
                      <span>• {vFood.item} ({vFood.quantity})</span>
                      <span className="font-bold">{vFood.calories} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-bg-main/30 border-t border-border flex items-center justify-center gap-4">
        <MacroBadge label="P" value={meal.foods.reduce((acc, f) => acc + f.protein, 0)} color="blue" />
        <MacroBadge label="C" value={meal.foods.reduce((acc, f) => acc + f.carbs, 0)} color="green" />
        <MacroBadge label="G" value={meal.foods.reduce((acc, f) => acc + f.fats, 0)} color="gold" />
      </div>
    </motion.div>
  );
}

function MacroBadge({ label, value, color }: { label: string, value: number, color: string }) {
  const colors: Record<string, string> = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    gold: 'text-gold'
  };
  return (
    <div className="flex items-center gap-1 text-[10px] font-black">
      <span className={colors[color]}>{label}:</span>
      <span className="text-text-main">{value}g</span>
    </div>
  );
}
