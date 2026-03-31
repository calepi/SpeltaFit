import React, { useState } from 'react';
import { NutritionalAnamnesis } from '../services/nutritionGenerator';
import { Apple, Utensils, AlertCircle, DollarSign, Clock, Pill, Droplets, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NutritionalAnamnesisFormProps {
  onSubmit: (data: NutritionalAnamnesis) => void;
  isLoading: boolean;
  userGoal?: string;
}

const dietTypes = [
  { id: 'equilibrada', label: 'Equilibrada', description: 'Foco em saúde e performance geral.', compatibleGoals: ['Emagrecimento', 'Hipertrofia', 'Força', 'Resistência', 'Saúde e Bem-estar', 'Reabilitação'] },
  { id: 'low-carb', label: 'Low Carb', description: 'Redução de carboidratos para queima de gordura.', compatibleGoals: ['Emagrecimento', 'Resistência', 'Saúde e Bem-estar'] },
  { id: 'cetogenica', label: 'Cetogênica', description: 'Alta gordura e quase zero carboidratos.', compatibleGoals: ['Emagrecimento'] },
  { id: 'vegetariana', label: 'Vegetariana', description: 'Sem carne, mas inclui ovos e laticínios.', compatibleGoals: ['Emagrecimento', 'Hipertrofia', 'Força', 'Resistência', 'Saúde e Bem-estar', 'Reabilitação'] },
  { id: 'vegana', label: 'Vegana', description: 'Sem nenhum produto de origem animal.', compatibleGoals: ['Emagrecimento', 'Hipertrofia', 'Força', 'Resistência', 'Saúde e Bem-estar', 'Reabilitação'] },
  { id: 'paleo', label: 'Paleo', description: 'Foco em alimentos naturais e não processados.', compatibleGoals: ['Emagrecimento', 'Hipertrofia', 'Força', 'Resistência', 'Saúde e Bem-estar', 'Reabilitação'] },
  { id: 'hipercalorica', label: 'Hipercalórica', description: 'Foco em ganho de massa muscular.', compatibleGoals: ['Hipertrofia', 'Força'] },
];

const supplementsOptions = [
  { name: 'Whey Protein', compatibleGoals: ['Emagrecimento', 'Hipertrofia', 'Força', 'Resistência', 'Saúde e Bem-estar', 'Reabilitação'] },
  { name: 'Creatina', compatibleGoals: ['Hipertrofia', 'Força', 'Resistência'] },
  { name: 'Termogênico', compatibleGoals: ['Emagrecimento'] },
  { name: 'BCAA', compatibleGoals: ['Hipertrofia', 'Força', 'Resistência'] },
  { name: 'Multivitamínico', compatibleGoals: ['Emagrecimento', 'Hipertrofia', 'Força', 'Resistência', 'Saúde e Bem-estar', 'Reabilitação'] },
  { name: 'Ômega 3', compatibleGoals: ['Emagrecimento', 'Hipertrofia', 'Força', 'Resistência', 'Saúde e Bem-estar', 'Reabilitação'] },
  { name: 'Pré-treino', compatibleGoals: ['Hipertrofia', 'Força', 'Resistência'] },
  { name: 'Glutamina', compatibleGoals: ['Hipertrofia', 'Resistência', 'Reabilitação', 'Saúde e Bem-estar'] },
  { name: 'Hipercalórico', compatibleGoals: ['Hipertrofia', 'Força'] },
  { name: 'Colágeno', compatibleGoals: ['Reabilitação', 'Saúde e Bem-estar'] }
];

export function NutritionalAnamnesisForm({ onSubmit, isLoading, userGoal }: NutritionalAnamnesisFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<NutritionalAnamnesis>>({
    dietType: 'equilibrada',
    supplements: [],
    waterIntake: 2,
    budget: 'padrão',
    cookingTime: 'padrão'
  });

  const filteredDietTypes = userGoal 
    ? dietTypes.filter(dt => dt.compatibleGoals.includes(userGoal))
    : dietTypes;

  const filteredSupplements = userGoal
    ? supplementsOptions.filter(so => so.compatibleGoals.includes(userGoal))
    : supplementsOptions;

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.dietType) {
      onSubmit({
        ...formData,
        updatedAt: new Date().toISOString()
      } as NutritionalAnamnesis);
    }
  };

  const toggleSupplement = (supp: string) => {
    const current = formData.supplements || [];
    if (current.includes(supp)) {
      setFormData({ ...formData, supplements: current.filter(s => s !== supp) });
    } else {
      setFormData({ ...formData, supplements: [...current, supp] });
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-surface border border-border rounded-3xl p-8 shadow-2xl overflow-hidden relative">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-border">
          <motion.div 
            className="h-full bg-brand"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-brand/10 text-brand">
            <Apple className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Anamnese Nutricional</h2>
            <p className="text-text-muted text-sm">Vamos personalizar sua alimentação para seus objetivos.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-lg font-bold">
                    <Apple className="w-5 h-5 text-brand" />
                    Qual estilo de dieta você prefere?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredDietTypes.map(diet => (
                      <button
                        key={diet.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, dietType: diet.id })}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          formData.dietType === diet.id 
                            ? 'bg-brand/10 border-brand' 
                            : 'bg-bg-main border-border hover:border-brand/30'
                        }`}
                      >
                        <div className={`font-bold ${formData.dietType === diet.id ? 'text-brand' : ''}`}>
                          {diet.label}
                        </div>
                        <div className="text-xs text-text-muted mt-1">{diet.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-lg font-bold">
                    <AlertCircle className="w-5 h-5 text-brand" />
                    Alergias ou Intolerâncias?
                  </label>
                  <textarea
                    value={formData.allergies || ''}
                    onChange={e => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="Ex: Lactose, Glúten, Amendoim..."
                    className="w-full bg-bg-main border-2 border-border rounded-2xl p-4 focus:border-brand outline-none transition-colors min-h-[100px]"
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-lg font-bold">
                    <Utensils className="w-5 h-5 text-brand" />
                    Alimentos que você NÃO gosta?
                  </label>
                  <textarea
                    value={formData.dislikes || ''}
                    onChange={e => setFormData({ ...formData, dislikes: e.target.value })}
                    placeholder="Ex: Coentro, Berinjela, Fígado..."
                    className="w-full bg-bg-main border-2 border-border rounded-2xl p-4 focus:border-brand outline-none transition-colors min-h-[100px]"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-lg font-bold">
                      <DollarSign className="w-5 h-5 text-brand" />
                      Orçamento para dieta?
                    </label>
                    <select
                      value={formData.budget}
                      onChange={e => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full bg-bg-main border-2 border-border rounded-2xl p-4 focus:border-brand outline-none"
                    >
                      <option value="econômico">Econômico (Foco em custo-benefício)</option>
                      <option value="padrão">Padrão (Equilibrado)</option>
                      <option value="premium">Premium (Ingredientes variados)</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-lg font-bold">
                      <Clock className="w-5 h-5 text-brand" />
                      Tempo para cozinhar?
                    </label>
                    <select
                      value={formData.cookingTime}
                      onChange={e => setFormData({ ...formData, cookingTime: e.target.value })}
                      className="w-full bg-bg-main border-2 border-border rounded-2xl p-4 focus:border-brand outline-none"
                    >
                      <option value="pouco">Pouco tempo (Refeições rápidas)</option>
                      <option value="padrão">Padrão (30-60 min/dia)</option>
                      <option value="bastante">Bastante tempo (Gosto de cozinhar)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-lg font-bold">
                    <Droplets className="w-5 h-5 text-brand" />
                    Ingestão de água atual (litros/dia)?
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="0.5"
                    value={formData.waterIntake}
                    onChange={e => setFormData({ ...formData, waterIntake: parseFloat(e.target.value) })}
                    className="w-full accent-brand"
                  />
                  <div className="text-center font-black text-2xl text-brand">{formData.waterIntake}L</div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-lg font-bold">
                    <Pill className="w-5 h-5 text-brand" />
                    Quais suplementos você usa ou deseja usar?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filteredSupplements.map(supp => (
                      <button
                        key={supp.name}
                        type="button"
                        onClick={() => toggleSupplement(supp.name)}
                        className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                          formData.supplements?.includes(supp.name)
                            ? 'bg-brand border-brand text-text-inverse'
                            : 'bg-bg-main border-border hover:border-brand/30'
                        }`}
                      >
                        {supp.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted italic flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {userGoal === 'Emagrecimento' 
                      ? 'Recomendamos Termogênico e Whey para melhores resultados.'
                      : userGoal === 'Hipertrofia' || userGoal === 'Força'
                      ? 'Recomendamos Creatina e Whey para melhores resultados.'
                      : 'Recomendamos suplementação básica para suporte nutricional.'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-8 border-t border-border">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-surface border border-border font-bold hover:bg-bg-main transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Anterior
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-brand text-text-inverse font-black hover:scale-105 transition-all shadow-lg shadow-brand/20"
              >
                Próximo
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-brand text-text-inverse font-black hover:scale-105 transition-all shadow-lg shadow-brand/20 disabled:opacity-50 disabled:scale-100"
              >
                {isLoading ? 'Gerando Dieta...' : 'Gerar Cardápio Profissional'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
