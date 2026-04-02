import React from 'react';
import { DietPlan, Meal, Food, generateShoppingList, ShoppingItem, getFoodSubstitutes } from '../services/nutritionGenerator';
import { Apple, Clock, Flame, Zap, Droplets, Pill, Info, Printer, RefreshCw, ChevronRight, CheckCircle2, ShoppingCart, X, Search, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FoodItem } from '../data/foodDatabase';

interface DietPlanViewProps {
  plan: DietPlan;
  onReset: () => void;
}

export function DietPlanView({ plan, onReset }: DietPlanViewProps) {
  const [isPrintMode, setIsPrintMode] = React.useState(false);
  const [showShoppingList, setShowShoppingList] = React.useState(false);
  const [selectedFood, setSelectedFood] = React.useState<{ name: string, substitutes: FoodItem[] } | null>(null);

  const shoppingList = React.useMemo(() => generateShoppingList(plan), [plan]);

  const handlePrint = () => {
    console.log("Triggering print...");
    try {
      // In some iframe environments, window.print() might be restricted.
      // We try to focus and print, but also provide a fallback.
      window.focus();
      const printResult = window.print();
      
      // If we are in an iframe and print didn't open a dialog (some browsers return undefined or false)
      if (window.self !== window.top) {
        console.log("App is in an iframe, print might be blocked by browser security.");
      }
    } catch (e) {
      console.error("Print failed:", e);
      alert("O navegador bloqueou a impressão direta no iframe. Clique no botão 'Modo Impressão' e use Ctrl+P ou abra o app em uma nova aba.");
    }
  };

  const handleOpenNewTab = () => {
    window.open(window.location.origin, '_blank');
  };

  if (isPrintMode) {
    return (
      <div className="bg-white min-h-screen p-4 md:p-8 text-black font-sans">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b-4 border-brand pb-4 gap-4">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight">Plano Nutricional</h1>
              <p className="text-gray-600 font-bold">Focado em: {plan.goal}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button 
                onClick={handleOpenNewTab}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-bold hover:bg-blue-200 transition-colors flex items-center gap-2"
                title="Abrir em nova aba para melhor impressão"
              >
                <RefreshCw className="w-4 h-4" />
                Nova Aba
              </button>
              <button 
                onClick={() => setIsPrintMode(false)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Voltar
              </button>
              <button 
                onClick={handlePrint}
                className="px-4 py-2 bg-brand text-white rounded-xl font-bold hover:opacity-90 transition-colors"
              >
                Imprimir (Ctrl+P)
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-blue-800 text-sm font-medium print:hidden">
            <p className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Dica: Se o diálogo de impressão não abrir, use o atalho <strong>Ctrl + P</strong> (Windows) ou <strong>Cmd + P</strong> (Mac).
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-4 border-2 border-gray-100 rounded-2xl">
              <div className="text-xs font-black text-gray-400 uppercase">Calorias</div>
              <div className="text-xl font-black">{plan.calories} kcal</div>
            </div>
            <div className="p-4 border-2 border-gray-100 rounded-2xl">
              <div className="text-xs font-black text-gray-400 uppercase">Proteína</div>
              <div className="text-xl font-black">{plan.macros.protein}g</div>
            </div>
            <div className="p-4 border-2 border-gray-100 rounded-2xl">
              <div className="text-xs font-black text-gray-400 uppercase">Carbos</div>
              <div className="text-xl font-black">{plan.macros.carbs}g</div>
            </div>
            <div className="p-4 border-2 border-gray-100 rounded-2xl">
              <div className="text-xs font-black text-gray-400 uppercase">Gorduras</div>
              <div className="text-xl font-black">{plan.macros.fats}g</div>
            </div>
          </div>

          <div className="space-y-6">
            {plan.meals.map((meal, idx) => (
              <div key={idx} className="border border-gray-300 rounded-xl overflow-hidden break-inside-avoid mb-6">
                <div className="bg-gray-100 px-4 py-3 flex items-center justify-between border-b border-gray-300">
                  <h4 className="font-bold text-lg text-gray-800">{idx + 1}. {meal.name} <span className="text-gray-500 text-sm ml-2 font-normal">{meal.time}</span></h4>
                  <span className="font-bold text-sm text-gray-600">{meal.foods.reduce((acc, f) => acc + f.calories, 0)} kcal</span>
                </div>
                <div className="p-4">
                  <table className="w-full text-sm">
                    <tbody>
                      {meal.foods.map((food, fIdx) => (
                        <tr key={fIdx} className="border-b border-gray-100 last:border-0">
                          <td className="py-2 font-semibold text-gray-800 w-1/2">{food.item}</td>
                          <td className="py-2 text-gray-600 w-1/4">{food.quantity}</td>
                          <td className="py-2 text-right text-gray-500 w-1/4">{food.calories} kcal</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {meal.weeklyVariations && meal.weeklyVariations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="text-xs font-bold text-gray-500 uppercase mb-2">Variações Semanais</div>
                      <div className="grid grid-cols-2 gap-4">
                        {meal.weeklyVariations.map((v, vIdx) => (
                          <div key={vIdx} className="text-xs">
                            <span className="font-bold text-gray-700">{v.day}:</span>
                            <div className="text-gray-600 mt-1">
                              {v.foods.map(f => `${f.item} (${f.quantity})`).join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8">
            <div className="space-y-4">
              <h3 className="font-black text-xl border-b-2 border-gray-100 pb-2">Recomendações</h3>
              <p className="text-gray-600 text-sm whitespace-pre-line">{plan.recommendations}</p>
            </div>
          </div>

          <div className="text-center pt-12 print:hidden">
            <button 
              onClick={handlePrint}
              className="px-12 py-4 bg-brand text-white font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
            >
              Confirmar e Imprimir Agora
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <div className="flex items-center gap-2 md:hidden">
                <button 
                  onClick={() => setIsPrintMode(true)}
                  className="p-2 rounded-xl bg-brand/10 text-brand print:hidden"
                  title="Modo Impressão"
                >
                  <Printer className="w-5 h-5" />
                </button>
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Seu Cardápio <br />
              <span className="text-brand">Personalizado</span>
            </h1>
            <p className="text-text-muted max-w-md text-lg">
              Focado em <span className="text-text-main font-bold">{plan.goal}</span>. 
              Siga as orientações para maximizar seus resultados.
            </p>
            <div className="flex items-center gap-4 print:hidden">
              <button 
                onClick={() => setShowShoppingList(true)}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-green-500/10 text-green-600 font-black hover:bg-green-500/20 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                Lista de Compras
              </button>
              <button 
                onClick={handlePrint}
                className="hidden md:flex items-center gap-2 px-6 py-2 rounded-xl bg-brand/10 text-brand font-black hover:bg-brand/20 transition-all"
              >
                <Printer className="w-4 h-4" />
                Imprimir PDF
              </button>
              <button 
                onClick={() => setIsPrintMode(true)}
                className="hidden md:flex items-center gap-2 px-6 py-2 rounded-xl bg-surface border border-border text-text-muted font-bold hover:text-text-main transition-all"
              >
                Modo Impressão
              </button>
            </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plan.meals.map((meal, idx) => (
          <MealCard key={idx} meal={meal} index={idx} setSelectedFood={setSelectedFood} />
        ))}
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 gap-8">
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
          onClick={() => setShowShoppingList(true)}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-green-500 text-white font-black hover:scale-105 transition-all shadow-xl shadow-green-500/20 active:scale-95"
        >
          <ShoppingCart className="w-5 h-5" />
          Ver Lista de Compras
        </button>
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

      {/* Shopping List Modal */}
      <AnimatePresence>
        {showShoppingList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface border border-border rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-bg-main/50">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Lista de Compras Mensal</h3>
                    <p className="text-xs text-text-muted font-bold">Estimativa de consumo para 30 dias</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowShoppingList(false)}
                  className="p-2 rounded-full hover:bg-bg-main transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-grow space-y-6">
                {Object.entries(
                  shoppingList.reduce((acc, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                  }, {} as Record<string, ShoppingItem[]>)
                ).map(([category, items]) => (
                  <div key={category} className="space-y-3">
                    <h4 className="text-xs font-black text-brand uppercase tracking-widest border-b border-brand/20 pb-1">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(items as ShoppingItem[]).map((item, idx) => (
                        <div key={idx} className="flex flex-col p-3 rounded-xl bg-bg-main border border-border/50">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">{item.item}</span>
                            <span className="text-xs font-black text-brand">{item.monthlyTotal}</span>
                          </div>
                          <span className="text-xs font-bold text-text-muted">{item.packagesToBuy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-border bg-bg-main/50 flex justify-end">
                <button 
                  onClick={() => setShowShoppingList(false)}
                  className="px-8 py-3 rounded-xl bg-brand text-text-inverse font-black shadow-lg shadow-brand/20"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Substitutes Modal */}
      <AnimatePresence>
        {selectedFood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface border border-border rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-bg-main/50">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-brand/10 text-brand">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Substituições</h3>
                    <p className="text-xs text-text-muted font-bold">Opções equivalentes para {selectedFood.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedFood(null)}
                  className="p-2 rounded-full hover:bg-bg-main transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {selectedFood.substitutes.length > 0 ? (
                  selectedFood.substitutes.map((sub, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-bg-main border border-border hover:border-brand/50 transition-all group">
                      <div>
                        <div className="font-bold text-text-main group-hover:text-brand transition-colors">{sub.name}</div>
                        <div className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                          P: {sub.protein}g | C: {sub.carbs}g | G: {sub.fats}g
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand transition-all" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-text-muted font-bold">
                    Nenhuma substituição direta encontrada para este item.
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-border bg-bg-main/50 text-center">
                <p className="text-[10px] text-text-muted font-bold leading-tight">
                  * As quantidades devem ser ajustadas para manter as mesmas calorias. 
                  Consulte seu nutricionista para ajustes precisos.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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
  setSelectedFood: (food: { name: string, substitutes: FoodItem[] } | null) => void;
  key?: React.Key;
}

function MealCard({ meal, index, setSelectedFood }: MealCardProps) {
  const handleFoodClick = (foodName: string) => {
    const substitutes = getFoodSubstitutes(foodName);
    setSelectedFood({ name: foodName, substitutes });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="p-5 border-b border-border bg-bg-main/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-black text-sm">
            {index + 1}
          </div>
          <div>
            <h4 className="font-bold text-lg tracking-tight text-text-main">{meal.name}</h4>
            <div className="flex items-center gap-1 text-xs text-text-muted font-medium">
              <Clock className="w-3 h-3" />
              {meal.time}
            </div>
          </div>
        </div>
        <div className="px-2 py-1 rounded-lg bg-bg-main border border-border text-text-muted text-xs font-bold">
          {meal.foods.reduce((acc, f) => acc + f.calories, 0)} kcal
        </div>
      </div>

      <div className="p-5 flex-grow space-y-2">
        {meal.foods.map((food, fIdx) => (
          <button 
            key={fIdx} 
            onClick={() => handleFoodClick(food.item)}
            className="w-full flex items-center justify-between group text-left hover:bg-bg-main p-3 -mx-3 rounded-xl transition-colors border border-transparent hover:border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-brand/40 group-hover:bg-brand transition-colors shrink-0" />
              <div>
                <div className="font-bold text-text-main text-sm group-hover:text-brand transition-colors flex items-center gap-2">
                  {food.item}
                  <Search className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
                <div className="text-xs text-text-muted font-medium">{food.quantity}</div>
              </div>
            </div>
            <div className="text-right shrink-0 ml-2">
              <div className="text-xs font-bold text-text-main">{food.calories} kcal</div>
              <div className="text-[10px] text-text-muted">P:{food.protein} C:{food.carbs} G:{food.fats}</div>
            </div>
          </button>
        ))}

        {/* Weekly Variations Section */}
        {meal.weeklyVariations && meal.weeklyVariations.length > 0 && (
          <div className="mt-5 pt-5 border-t border-border border-dashed space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-text-muted uppercase tracking-wider">
              <RefreshCw className="w-3 h-3" />
              Variações Semanais
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {meal.weeklyVariations.map((variation, vIdx) => (
                <div key={vIdx} className="p-3 rounded-xl bg-bg-main border border-border/50">
                  <div className="text-xs font-bold text-text-main mb-1.5">{variation.day}</div>
                  <div className="space-y-1">
                    {variation.foods.map((vFood, vfIdx) => (
                      <div key={vfIdx} className="text-[10px] text-text-muted flex justify-between leading-tight">
                        <span className="truncate pr-2">• {vFood.item}</span>
                        <span className="font-medium whitespace-nowrap shrink-0">{vFood.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-bg-main/50 border-t border-border flex items-center justify-center gap-6">
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
