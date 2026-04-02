import React from 'react';
import { Utensils, Clock, Flame, Info, ChevronRight, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RECIPE_DB, Recipe } from '../data/recipeDatabase';

export function RecipeView() {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(null);

  const filteredRecipes = RECIPE_DB.filter(recipe => {
    const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         recipe.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'cafe_da_manha', name: 'Café da Manhã', icon: '🍳' },
    { id: 'almoco_jantar', name: 'Almoço & Jantar', icon: '🥗' },
    { id: 'lanche', name: 'Lanches', icon: '🍎' },
    { id: 'pre_pos_treino', name: 'Pré/Pós Treino', icon: '⚡' },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Search */}
      <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand/10 text-brand">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Receitas Rápidas SpeltaFit</h3>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar por ingrediente ou nome..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              !selectedCategory ? 'bg-brand text-text-inverse shadow-lg shadow-brand/20' : 'bg-bg-main border border-border hover:bg-surface'
            }`}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 ${
                selectedCategory === cat.id ? 'bg-brand text-text-inverse shadow-lg shadow-brand/20' : 'bg-bg-main border border-border hover:bg-surface'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map(recipe => (
          <motion.div 
            key={recipe.id}
            layoutId={recipe.id}
            onClick={() => setSelectedRecipe(recipe)}
            className="bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-xl hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <div className="aspect-video bg-bg-main relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                <p className="text-white font-black uppercase tracking-widest text-xs">Ver Receita Completa</p>
              </div>
              <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-brand text-text-inverse text-[10px] font-black uppercase tracking-widest shadow-lg">
                {recipe.calories} kcal
              </div>
              <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 group-hover:scale-110 transition-transform duration-500">
                {categories.find(c => c.id === recipe.category)?.icon}
              </div>
            </div>
            <div className="p-8 space-y-4">
              <h4 className="text-xl font-black tracking-tight leading-tight">{recipe.name}</h4>
              <p className="text-text-muted text-sm font-medium line-clamp-2">{recipe.description}</p>
              
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-text-muted">
                  <Clock className="w-4 h-4" />
                  {recipe.prepTime}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black text-brand">
                  <Flame className="w-4 h-4" />
                  {recipe.protein}g Prot
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              layoutId={selectedRecipe.id}
              className="bg-surface border border-border rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <div className="md:w-2/5 bg-bg-main p-8 space-y-8 overflow-y-auto">
                <div className="flex justify-between items-start">
                  <div className="p-4 rounded-3xl bg-brand/10 text-brand">
                    <Utensils className="w-8 h-8" />
                  </div>
                  <button onClick={() => setSelectedRecipe(null)} className="p-2 hover:bg-surface rounded-xl transition-colors md:hidden">
                    <ChevronRight className="w-6 h-6 rotate-90" />
                  </button>
                </div>

                <div className="space-y-2">
                  <h3 className="text-3xl font-black tracking-tight leading-tight">{selectedRecipe.name}</h3>
                  <p className="text-text-muted font-medium">{selectedRecipe.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <MacroCard label="Proteína" value={`${selectedRecipe.protein}g`} color="text-brand" />
                  <MacroCard label="Carbos" value={`${selectedRecipe.carbs}g`} color="text-blue-500" />
                  <MacroCard label="Gorduras" value={`${selectedRecipe.fats}g`} color="text-gold" />
                  <MacroCard label="Calorias" value={`${selectedRecipe.calories}kcal`} color="text-text-main" />
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-black uppercase tracking-widest text-text-muted">Ingredientes</h5>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand" />
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="md:w-3/5 p-8 md:p-12 overflow-y-auto bg-surface relative">
                <button 
                  onClick={() => setSelectedRecipe(null)} 
                  className="absolute top-8 right-8 p-3 hover:bg-bg-main rounded-2xl transition-colors hidden md:block"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>

                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-brand/10 text-brand">
                      <Clock className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black tracking-tight">Modo de Preparo</h4>
                  </div>

                  <div className="space-y-6">
                    {selectedRecipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-6 group">
                        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-bg-main border border-border flex items-center justify-center font-black text-brand group-hover:bg-brand group-hover:text-text-inverse transition-all">
                          {i + 1}
                        </div>
                        <p className="text-text-muted font-medium leading-relaxed pt-2">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 flex gap-4">
                    <Info className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <p className="text-xs text-blue-500 font-bold leading-relaxed">
                      Dica SpeltaFit: Esta receita foi selecionada para se encaixar perfeitamente no seu plano nutricional. 
                      Sempre que possível, use ingredientes frescos e orgânicos.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MacroCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="p-4 rounded-2xl bg-surface border border-border text-center space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">{label}</p>
      <p className={`text-sm font-black ${color}`}>{value}</p>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
