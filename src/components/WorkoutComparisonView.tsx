import React, { useState, useEffect } from 'react';
import { AnamnesisData, WorkoutPlan, ExistingExercise } from '../services/workoutGenerator';
import { EXERCISE_DB } from '../data/exerciseDatabase';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Check, X, Info, HelpCircle, RefreshCw, ChevronRight, AlertCircle, Dumbbell, Calendar } from 'lucide-react';

interface Props {
  userData: AnamnesisData;
  proposedPlan: WorkoutPlan;
  onConfirm: (finalPlan: WorkoutPlan) => void;
  onCancel: () => void;
}

interface ChangeItem {
  id: string;
  dayName: string;
  type: 'added' | 'removed' | 'modified' | 'kept';
  originalExercise?: ExistingExercise;
  suggestedExercise: any; // Exercise from proposed plan
  reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'customized';
  customExerciseId?: string;
}

export function WorkoutComparisonView({ userData, proposedPlan, onConfirm, onCancel }: Props) {
  const [changes, setChanges] = useState<ChangeItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [showExercisePicker, setShowExercisePicker] = useState<{changeId: string, group: string} | null>(null);

  useEffect(() => {
    analyzeChanges();
  }, [userData, proposedPlan]);

  const analyzeChanges = () => {
    setIsAnalyzing(true);
    const newChanges: ChangeItem[] = [];
    
    // Simple heuristic-based comparison
    // We compare the proposed exercises with the existing ones
    proposedPlan.weeklyRoutine.forEach((day, dayIdx) => {
      if (!day.exercises) return;

      day.exercises.forEach((newEx, exIdx) => {
        // Find if this exercise (or a similar one) exists in the old plan
        let originalEx: ExistingExercise | undefined;
        let reason = "";

        // Heuristic: Check if the user is a beginner and overweight
        const weight = userData.weight || 0;
        const height = (userData.height || 0) / 100;
        const bmi = height > 0 ? weight / (height * height) : 0;
        const isBeginner = userData.experience.toLowerCase().includes('iniciante') || userData.experience.toLowerCase().includes('sedentário');
        const isOverweight = bmi >= 28;

        // Try to find a match in the structured existing plan
        userData.structuredExistingPlan?.forEach(oldDay => {
          const match = oldDay.exercises.find(e => 
            e.name.toLowerCase().includes(newEx.name.toLowerCase()) || 
            newEx.name.toLowerCase().includes(e.name.toLowerCase())
          );
          if (match) originalEx = match;
        });

        if (originalEx) {
          // If it's the same exercise, we might still "modify" it (sets/reps)
          reason = "Ajustamos o volume (séries/repetições) e a intensidade para alinhar com seu objetivo de " + userData.goal + ".";
          newChanges.push({
            id: `change-${dayIdx}-${exIdx}`,
            dayName: day.day,
            type: 'modified',
            originalExercise: originalEx,
            suggestedExercise: newEx,
            reason,
            status: 'pending'
          });
        } else {
          // It's a new exercise
          if (isBeginner && isOverweight) {
            reason = "Selecionamos este exercício por ser de nível iniciante e mais seguro para suas articulações, considerando seu perfil atual.";
          } else {
            reason = "Este exercício foi adicionado para garantir o estímulo necessário para " + userData.goal + " no grupo muscular de " + newEx.group + ".";
          }
          
          newChanges.push({
            id: `change-${dayIdx}-${exIdx}`,
            dayName: day.day,
            type: 'added',
            suggestedExercise: newEx,
            reason,
            status: 'pending'
          });
        }
      });
    });

    setChanges(newChanges);
    setIsAnalyzing(false);
  };

  const handleStatusChange = (id: string, status: 'accepted' | 'rejected') => {
    setChanges(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleCustomExercise = (changeId: string, exerciseId: string) => {
    const allExercises = Object.values(EXERCISE_DB).flat();
    const exercise = allExercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    setChanges(prev => prev.map(c => c.id === changeId ? { 
      ...c, 
      status: 'customized', 
      customExerciseId: exerciseId,
      suggestedExercise: {
        ...c.suggestedExercise,
        id: exercise.id,
        name: exercise.name,
        group: exercise.group
      }
    } : c));
    setShowExercisePicker(null);
  };

  const finalizePlan = () => {
    // Construct the final plan based on user choices
    const finalPlan = JSON.parse(JSON.stringify(proposedPlan)) as WorkoutPlan;
    
    finalPlan.weeklyRoutine.forEach((day, dIdx) => {
      if (!day.exercises) return;
      
      const dayChanges = changes.filter(c => c.dayName === day.day);
      
      day.exercises = day.exercises.filter((ex, eIdx) => {
        const change = dayChanges.find(c => c.id === `change-${dIdx}-${eIdx}`);
        if (!change) return true;
        // If it's a new exercise and user rejected it, remove it
        if (change.type === 'added' && change.status === 'rejected') return false;
        return true;
      });

      day.exercises.forEach((ex, eIdx) => {
        const change = dayChanges.find(c => c.id === `change-${dIdx}-${eIdx}`);
        if (!change) return;

        if (change.status === 'rejected' && change.originalExercise) {
          // Revert to original exercise name
          ex.name = change.originalExercise.name;
          // Keep suggested sets/reps or revert? 
          // Usually if they "keep theirs", they might want their sets/reps too.
          if (change.originalExercise.sets) ex.sets = parseInt(change.originalExercise.sets) || ex.sets;
          if (change.originalExercise.reps) ex.reps = change.originalExercise.reps;
        } else if (change.status === 'customized' && change.customExerciseId) {
          const allExercises = Object.values(EXERCISE_DB).flat();
          const customEx = allExercises.find(e => e.id === change.customExerciseId);
          if (customEx) {
            ex.id = customEx.id;
            ex.name = customEx.name;
            ex.group = customEx.group;
          }
        }
      });
    });

    onConfirm(finalPlan);
  };

  if (isAnalyzing) {
    return (
      <div className="max-w-4xl mx-auto p-10 text-center space-y-6">
        <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
        <h2 className="text-2xl font-black text-text-main">Analisando seu treino atual...</h2>
        <p className="text-text-muted">Estamos comparando suas informações com as melhores práticas para seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-black text-text-main tracking-tight">Análise de Melhorias</h2>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          Comparamos seu treino atual com o plano ideal para <span className="text-brand font-bold">{userData.goal}</span>. 
          Veja o que sugerimos mudar e por quê.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border p-4 rounded-2xl text-center">
          <span className="text-xs font-bold text-text-muted uppercase block mb-1">Total de Mudanças</span>
          <span className="text-2xl font-black text-text-main">{changes.length}</span>
        </div>
        <div className="bg-surface border border-border p-4 rounded-2xl text-center">
          <span className="text-xs font-bold text-green-500 uppercase block mb-1">Aceitas</span>
          <span className="text-2xl font-black text-green-500">{changes.filter(c => c.status === 'accepted').length}</span>
        </div>
        <div className="bg-surface border border-border p-4 rounded-2xl text-center">
          <span className="text-xs font-bold text-blue-500 uppercase block mb-1">Personalizadas</span>
          <span className="text-2xl font-black text-blue-500">{changes.filter(c => c.status === 'customized').length}</span>
        </div>
        <div className="bg-surface border border-border p-4 rounded-2xl text-center">
          <span className="text-xs font-bold text-red-500 uppercase block mb-1">Mantidas Originais</span>
          <span className="text-2xl font-black text-red-500">{changes.filter(c => c.status === 'rejected').length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {changes.map((change) => (
          <motion.div 
            key={change.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-surface border rounded-3xl p-6 shadow-sm transition-all ${
              change.status === 'accepted' ? 'border-green-500/30 bg-green-500/5' : 
              change.status === 'rejected' ? 'border-red-500/30 bg-red-500/5' : 
              change.status === 'customized' ? 'border-blue-500/30 bg-blue-500/5' :
              'border-border'
            }`}
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Comparison Column */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
                  <Calendar className="w-4 h-4" /> {change.dayName}
                </div>

                <div className="flex items-center gap-4">
                  {change.originalExercise ? (
                    <div className="flex-1 p-4 bg-bg-main rounded-2xl border border-border opacity-60">
                      <span className="text-xs font-bold text-text-muted block mb-1">Seu Treino Atual</span>
                      <span className="text-lg font-bold text-text-main">{change.originalExercise.name}</span>
                    </div>
                  ) : (
                    <div className="flex-1 p-4 bg-bg-main/50 rounded-2xl border border-dashed border-border flex items-center justify-center text-text-muted italic text-sm">
                      Novo Exercício
                    </div>
                  )}

                  <div className="flex-shrink-0">
                    <ArrowRight className="w-6 h-6 text-brand" />
                  </div>

                  <div className={`flex-1 p-4 rounded-2xl border ${
                    change.status === 'accepted' ? 'bg-green-500/10 border-green-500/30' : 
                    change.status === 'customized' ? 'bg-blue-500/10 border-blue-500/30' :
                    'bg-brand/5 border-brand/20'
                  }`}>
                    <span className="text-xs font-bold text-brand block mb-1">Nossa Sugestão</span>
                    <span className="text-lg font-bold text-text-main">{change.suggestedExercise.name}</span>
                    <div className="mt-1 flex gap-2 text-xs text-text-muted">
                      <span>{change.suggestedExercise.sets} séries</span>
                      <span>•</span>
                      <span>{change.suggestedExercise.reps} reps</span>
                    </div>
                  </div>
                </div>

                <div className="bg-bg-main p-4 rounded-2xl flex gap-3 items-start">
                  <Info className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-text-muted leading-relaxed">
                    <span className="font-bold text-text-main">Por que mudar?</span> {change.reason}
                  </p>
                </div>
              </div>

              {/* Actions Column */}
              <div className="md:w-64 flex flex-col gap-2 justify-center">
                <button 
                  onClick={() => handleStatusChange(change.id, 'accepted')}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    change.status === 'accepted' 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-bg-main border border-border text-text-main hover:border-green-500 hover:text-green-500'
                  }`}
                >
                  <Check className="w-5 h-5" /> Aceitar Sugestão
                </button>
                
                <button 
                  onClick={() => handleStatusChange(change.id, 'rejected')}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    change.status === 'rejected' 
                      ? 'bg-red-500 text-white shadow-lg' 
                      : 'bg-bg-main border border-border text-text-main hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  <X className="w-5 h-5" /> {change.type === 'added' ? 'Não Adicionar' : 'Manter Meu Exercício'}
                </button>

                <button 
                  onClick={() => setShowExercisePicker({ changeId: change.id, group: change.suggestedExercise.group })}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    change.status === 'customized' 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-bg-main border border-border text-text-main hover:border-blue-500 hover:text-blue-500'
                  }`}
                >
                  <RefreshCw className="w-5 h-5" /> Escolher Outro
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4 z-50 shadow-2xl">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-3 text-text-muted">
            <AlertCircle className="w-5 h-5 text-brand" />
            <span className="text-sm">Revise todas as sugestões antes de finalizar seu novo plano.</span>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={onCancel}
              className="flex-1 md:flex-none px-8 py-4 rounded-2xl font-bold text-text-muted hover:bg-bg-main transition-colors"
            >
              Voltar
            </button>
            <button 
              onClick={finalizePlan}
              className="flex-1 md:flex-none px-12 py-4 bg-brand text-text-inverse rounded-2xl font-black text-lg shadow-lg hover:bg-brand-hover transition-all transform active:scale-[0.98]"
            >
              Finalizar Meu Plano
            </button>
          </div>
        </div>
      </div>

      {/* Exercise Picker Modal */}
      <AnimatePresence>
        {showExercisePicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-bg-main">
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-6 h-6 text-brand" />
                  <h3 className="text-xl font-bold text-text-main">Escolha uma Alternativa</h3>
                </div>
                <button onClick={() => setShowExercisePicker(null)} className="p-2 hover:bg-surface rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <p className="text-sm text-text-muted mb-4 px-2">
                  Exibindo exercícios recomendados para o grupo <span className="text-brand font-bold uppercase">{showExercisePicker.group}</span>.
                </p>
                {EXERCISE_DB[showExercisePicker.group as keyof typeof EXERCISE_DB]
                  ?.map(exercise => (
                    <button
                      key={exercise.id}
                      onClick={() => handleCustomExercise(showExercisePicker.changeId, exercise.id)}
                      className="w-full p-4 rounded-2xl border border-border hover:border-brand hover:bg-brand/5 text-left transition-all flex items-center justify-between group"
                    >
                      <div>
                        <span className="font-bold text-text-main group-hover:text-brand">{exercise.name}</span>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-bg-main rounded-full text-text-muted border border-border">
                            {exercise.equipment}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-brand" />
                    </button>
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
