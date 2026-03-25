import React, { useState, useEffect } from 'react';
import { WorkoutPlan, AnamnesisData } from '../services/workoutGenerator';
import { adjustWorkoutPlanRuleBased } from '../services/workoutGenerator';
import { CheckCircle2, Circle, Dumbbell, Timer, Flame, Zap, Activity, Trophy, Brain, X, Loader2, ClipboardList, Lock, CalendarDays, Info, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function getEmbedUrl(url: string) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname === '/watch') {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (urlObj.pathname.startsWith('/shorts/')) {
        const videoId = urlObj.pathname.split('/')[2];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (urlObj.pathname.startsWith('/embed/')) {
        return url;
      }
    } else if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
  } catch (e) {
    // ignore invalid URLs
  }
  return url;
}

interface Props {
  plan: WorkoutPlan;
  user: AnamnesisData;
  onUpdatePlan: (newPlan: WorkoutPlan) => void;
  readOnly?: boolean;
  studentUid?: string;
}

interface FeedbackField {
  value: string;
  comment: string;
}

export function WorkoutTracker({ plan, user, onUpdatePlan, readOnly = false, studentUid }: Props) {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  
  const [completedSets, setCompletedSets] = useState<Record<string, boolean>>({});
  const [actualLoads, setActualLoads] = useState<Record<string, string>>({});
  const [exerciseFeedback, setExerciseFeedback] = useState<Record<string, { pse: number, execution: string, pain: boolean, notes: string }>>({});
  const [checkins, setCheckins] = useState<Record<string, { effort: string, notes: string, date: string }>>({});
  
  // Daily Checkin State
  const [dailyEffort, setDailyEffort] = useState('');
  const [dailyNotes, setDailyNotes] = useState('');

  // AI Adjustment State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ name: string, url: string } | null>(null);

  // Structured Feedback State (Monthly)
  const [feedbackForm, setFeedbackForm] = useState<{
    recovery: FeedbackField;
    adherence: FeedbackField;
    dietSleep: FeedbackField;
  }>({
    recovery: { value: '', comment: '' },
    adherence: { value: '', comment: '' },
    dietSleep: { value: '', comment: '' },
  });

  // Load saved progress
  useEffect(() => {
    const loadProgress = async () => {
      const targetUid = studentUid || auth.currentUser?.uid;
      if (targetUid) {
        try {
          const progressRef = doc(db, `users/${targetUid}/data/progress`);
          const snap = await getDoc(progressRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.completedSets) setCompletedSets(data.completedSets);
            if (data.actualLoads) setActualLoads(data.actualLoads);
            if (data.exerciseFeedback) setExerciseFeedback(data.exerciseFeedback);
            if (data.checkins) setCheckins(data.checkins);
          }
        } catch (err) {
          console.error("Error loading progress from Firestore:", err);
        }
      }
    };
    loadProgress();
  }, [studentUid, readOnly]);

  // Save progress
  useEffect(() => {
    if (readOnly) return;
    
    const saveProgress = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
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

          const progressRef = doc(db, `users/${user.uid}/data/progress`);
          await setDoc(progressRef, {
            completedSets: cleanObject(completedSets),
            actualLoads: cleanObject(actualLoads),
            exerciseFeedback: cleanObject(exerciseFeedback),
            checkins: cleanObject(checkins),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.error("Error saving progress to Firestore:", err);
        }
      }
    };
    
    // Only save if there's actual data to avoid overwriting with empty initial state
    if (Object.keys(completedSets).length > 0 || Object.keys(actualLoads).length > 0 || Object.keys(exerciseFeedback).length > 0 || Object.keys(checkins).length > 0) {
      saveProgress();
    }
  }, [completedSets, actualLoads, exerciseFeedback, checkins, readOnly]);

  // Derived State
  const totalWeeks = plan.durationWeeks || 4;
  const routineLength = plan.weeklyRoutine.length;
  const totalDays = totalWeeks * routineLength;
  
  const getAbsoluteIndex = (w: number, d: number) => (w - 1) * routineLength + d;
  const currentAbsoluteIndex = getAbsoluteIndex(selectedWeek, selectedDay);
  const checkedInCount = Object.keys(checkins).length;
  
  const isUnlocked = currentAbsoluteIndex <= checkedInCount;
  const isCheckedIn = currentAbsoluteIndex < checkedInCount;
  const isPlanComplete = checkedInCount >= totalDays;

  const getSetKey = (exId: string, setIdx: number) => `w${selectedWeek}-d${selectedDay}-${exId}-${setIdx}`;
  const getLoadKey = (exId: string) => `w${selectedWeek}-d${selectedDay}-${exId}`;
  const getCheckinKey = (w: number, d: number) => `w${w}-d${d}`;

  const toggleSet = (exerciseId: string, setIndex: number) => {
    if (readOnly || !isUnlocked || isCheckedIn) return;
    const key = getSetKey(exerciseId, setIndex);
    setCompletedSets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateLoad = (exerciseId: string, load: string) => {
    if (readOnly || !isUnlocked || isCheckedIn) return;
    const key = getLoadKey(exerciseId);
    setActualLoads(prev => ({ ...prev, [key]: load }));
  };

  const updateExerciseFeedback = (exerciseId: string, field: 'pse' | 'execution' | 'pain' | 'notes', value: any) => {
    if (readOnly || !isUnlocked || isCheckedIn) return;
    const key = getLoadKey(exerciseId); // Using same key structure as load for simplicity
    setExerciseFeedback(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { pse: 5, execution: 'Boa', pain: false, notes: '' }),
        [field]: value
      }
    }));
  };

  const handleCheckin = () => {
    if (readOnly) return;
    if (!dailyEffort) {
      alert('Por favor, selecione o nível de esforço do treino de hoje.');
      return;
    }
    const key = getCheckinKey(selectedWeek, selectedDay);
    setCheckins(prev => ({
      ...prev,
      [key]: { effort: dailyEffort, notes: dailyNotes, date: new Date().toISOString() }
    }));
    setDailyEffort('');
    setDailyNotes('');
    
    // Auto-advance to next day if not complete
    if (checkedInCount + 1 < totalDays) {
      const nextIndex = currentAbsoluteIndex + 1;
      const nextWeek = Math.floor(nextIndex / routineLength) + 1;
      const nextDay = nextIndex % routineLength;
      setSelectedWeek(nextWeek);
      setSelectedDay(nextDay);
    }
  };

  const handleAdjustPlan = async () => {
    if (readOnly) return;
    if (!feedbackForm.recovery.value || !feedbackForm.adherence.value || !feedbackForm.dietSleep.value) {
      alert('Por favor, selecione uma opção para todas as perguntas da reavaliação mensal.');
      return;
    }

    setIsAdjusting(true);
    
    const compiledFeedback = `
      Reavaliação Mensal (Fim de Ciclo):
      Recuperação e Dores: ${feedbackForm.recovery.value}. Comentário: ${feedbackForm.recovery.comment || 'Nenhum'}
      Aderência ao Plano: ${feedbackForm.adherence.value}. Comentário: ${feedbackForm.adherence.comment || 'Nenhum'}
      Dieta e Sono: ${feedbackForm.dietSleep.value}. Comentário: ${feedbackForm.dietSleep.comment || 'Nenhum'}
    `;

    try {
      const response = await adjustWorkoutPlanRuleBased(plan, user, completedSets, actualLoads, checkins, compiledFeedback);
      setAnalysisMessage(response.analysis);
      onUpdatePlan(response.updatedPlan);
      
      // Clear tracking data for the new plan
      setCompletedSets({});
      setActualLoads({});
      setCheckins({});
      setSelectedWeek(1);
      setSelectedDay(0);
      setFeedbackForm({
        recovery: { value: '', comment: '' },
        adherence: { value: '', comment: '' },
        dietSleep: { value: '', comment: '' },
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao analisar o treino. Tente novamente.');
    } finally {
      setIsAdjusting(false);
    }
  };

  const dayData = plan.weeklyRoutine[selectedDay];

  // Calculate progress for the selected day
  const totalSetsForDay = dayData.exercises?.reduce((acc, ex) => acc + ex.sets, 0) || 0;
  const completedSetsForDay = dayData.exercises?.reduce((acc, ex) => {
    let completed = 0;
    for (let i = 0; i < ex.sets; i++) {
      if (completedSets[getSetKey(ex.id, i)]) completed++;
    }
    return acc + completed;
  }, 0) || 0;

  const dailyProgressPercentage = totalSetsForDay > 0 ? Math.round((completedSetsForDay / totalSetsForDay) * 100) : 0;
  const overallProgressPercentage = Math.round((checkedInCount / totalDays) * 100);

  return (
    <div className="space-y-6">
      {/* AI Analysis Message */}
      {analysisMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand/10 border border-brand/30 rounded-3xl p-6 shadow-lg relative"
        >
          <button 
            onClick={() => setAnalysisMessage(null)}
            className="absolute top-4 right-4 text-brand hover:text-brand-hover"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex gap-4 items-start">
            <div className="bg-brand p-3 rounded-2xl shrink-0">
              <Brain className="w-6 h-6 text-bg-main" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-brand mb-2">Análise do Personal (IA)</h3>
              <p className="text-text-main leading-relaxed whitespace-pre-wrap">{analysisMessage}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Glossary / Instructions */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl mb-6">
        <h3 className="text-text-main font-bold flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-brand" />
          Guia de Execução (Glossário)
        </h3>
        <div className="space-y-4 text-sm text-text-muted">
          <div>
            <span className="font-bold text-text-main">Série Normal:</span> 
            <span> É a série padrão de trabalho. Você deve executar o número de repetições estipulado mantendo o mesmo peso do início ao fim. O foco deve ser no controle do movimento: uma descida (fase excêntrica) controlada de 2 a 3 segundos, e uma subida (fase concêntrica) explosiva e forte. Não use técnicas avançadas (como drop-set) a menos que esteja especificado.</span>
          </div>
          <div>
            <span className="font-bold text-text-main">RIR (Repetições na Reserva):</span> 
            <span> É a principal ferramenta de controle de intensidade. RIR significa quantas repetições você ainda conseguiria fazer com boa forma antes de travar (falhar) completamente.</span>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Exemplo RIR 2:</strong> Se a ficha pede 10 repetições com RIR 2, você deve escolher um peso com o qual você falharia na 12ª repetição. Você para na 10ª repetição sentindo que "daria para fazer só mais duas chorando".</li>
              <li><strong>Exemplo RIR 0:</strong> Significa que não há repetições na reserva. Você deve ir até a falha total, onde é fisicamente impossível fazer mais uma repetição.</li>
              <li><strong>Por que usar?</strong> Treinar até a falha em todas as séries destrói seu Sistema Nervoso Central e prejudica a recuperação. O RIR permite que você treine pesado (próximo à falha) acumulando volume sem entrar em overtraining.</li>
            </ul>
          </div>
          <div>
            <span className="font-bold text-text-main">Falha Concêntrica:</span> 
            <span> É o momento exato em que você tenta subir o peso (fase concêntrica) e o músculo simplesmente não responde mais, travando no meio do caminho, mesmo você fazendo força máxima. 
            <br/><strong>Atenção:</strong> Iniciantes devem evitar a falha em exercícios complexos (Agachamento, Supino, Terra) pelo risco de lesão ao perder a postura. Deixe a falha para exercícios em máquinas ou cabos.</span>
          </div>
          <div>
            <span className="font-bold text-text-main">PSE (Percepção Subjetiva de Esforço):</span> 
            <span> Uma nota de 1 a 10 que você dá para o quão difícil foi a série ou o treino. 1 é estar deitado no sofá, 10 é o esforço máximo da sua vida (falha total). Um treino de hipertrofia ideal geralmente orbita entre PSE 7 e 9.</span>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-text-main font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-brand" />
            Progresso do Ciclo
          </h3>
          <span className="text-brand font-black text-xl">{overallProgressPercentage}%</span>
        </div>
        <div className="h-4 bg-bg-main rounded-full overflow-hidden border border-border">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${overallProgressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-brand rounded-full"
          />
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-text-muted text-xs">
            * Atualizado ao salvar o check-in diário
          </p>
          <p className="text-text-muted text-sm text-right">
            {checkedInCount} de {totalDays} dias concluídos
          </p>
        </div>
      </div>

      {/* Week Selector */}
      <div className="flex overflow-x-auto pb-2 gap-2 snap-x scrollbar-hide">
        {Array.from({ length: totalWeeks }).map((_, i) => {
          const weekNum = i + 1;
          return (
            <button
              key={weekNum}
              onClick={() => setSelectedWeek(weekNum)}
              className={`snap-start shrink-0 px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                selectedWeek === weekNum 
                  ? 'bg-text-main text-bg-main shadow-md' 
                  : 'bg-surface border border-border text-text-muted hover:text-text-main'
              }`}
            >
              Semana {weekNum}
            </button>
          );
        })}
      </div>

      {/* Day Selector */}
      <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide">
        {plan.weeklyRoutine.map((day, idx) => {
          const absIdx = getAbsoluteIndex(selectedWeek, idx);
          const isDayCheckedIn = absIdx < checkedInCount;
          const isDayUnlocked = absIdx <= checkedInCount;
          
          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={`snap-start shrink-0 px-6 py-4 rounded-2xl border transition-all relative ${
                selectedDay === idx 
                  ? 'bg-brand border-brand text-text-inverse shadow-lg' 
                  : 'bg-surface border-border text-text-muted hover:bg-surface-hover hover:text-text-main'
              } ${!isDayUnlocked ? 'opacity-50' : ''}`}
            >
              {isDayCheckedIn && (
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
              {!isDayUnlocked && (
                <div className="absolute -top-2 -right-2 bg-surface border border-border text-text-muted rounded-full p-1 shadow-sm">
                  <Lock className="w-4 h-4" />
                </div>
              )}
              <div className="font-bold text-lg mb-1">{day.day}</div>
              <div className={`text-sm font-medium ${selectedDay === idx ? 'text-text-inverse/80' : 'text-text-muted'}`}>
                {day.focus}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Day Content */}
      <motion.div
        key={`${selectedWeek}-${selectedDay}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        {!isUnlocked ? (
          <div className="text-center p-12 bg-surface border border-border rounded-3xl shadow-xl">
            <Lock className="w-16 h-16 mx-auto mb-4 text-text-muted opacity-50" />
            <h3 className="text-2xl font-bold text-text-main mb-2">Treino Bloqueado</h3>
            <p className="text-text-muted max-w-md mx-auto">
              Você precisa fazer o check-in dos dias anteriores antes de acessar e preencher este treino.
            </p>
          </div>
        ) : (
          <>
            {/* Daily Progress Bar */}
            {totalSetsForDay > 0 && (
              <div className="bg-surface border border-border rounded-3xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-text-main font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-brand" />
                    Progresso do Dia
                  </h3>
                  <span className="text-brand font-black text-xl">{dailyProgressPercentage}%</span>
                </div>
                <div className="h-4 bg-bg-main rounded-full overflow-hidden border border-border">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dailyProgressPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-brand rounded-full"
                  />
                </div>
                <p className="text-text-muted text-sm mt-3 text-right">
                  {completedSetsForDay} de {totalSetsForDay} séries concluídas
                </p>
              </div>
            )}

            {dayData.exercises && dayData.exercises.length > 0 ? (
              <div className="space-y-4">
                {dayData.exercises.map((ex, i) => (
                  <div key={ex.id} className={`bg-surface border border-border rounded-3xl p-6 shadow-xl ${isCheckedIn ? 'opacity-80' : ''}`}>
                    {/* Exercise Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-bg-main text-brand w-8 h-8 flex items-center justify-center rounded-full font-bold shrink-0 border border-border">
                            {i + 1}
                          </span>
                          <h3 className="text-xl font-bold text-text-main">{ex.name}</h3>
                          {ex.videoUrl && (
                            <button 
                              onClick={() => setActiveVideo({ name: ex.name, url: getEmbedUrl(ex.videoUrl!) })}
                              className="flex items-center gap-1.5 bg-brand/10 text-brand px-2.5 py-1 rounded-lg text-xs font-bold border border-brand/20 hover:bg-brand/20 transition-colors"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              VER VÍDEO
                            </button>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 ml-11">
                          <span className="bg-bg-main text-text-main px-3 py-1 rounded-lg text-sm font-medium border border-border flex items-center gap-1" title="Método de execução">
                            <Info className="w-3 h-3 text-brand" />
                            {ex.method}
                          </span>
                          <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-lg text-sm font-bold border border-amber-500/20 flex items-center gap-1" title="Repetições na Reserva (não vá até a falha)">
                            <Info className="w-3 h-3" />
                            {ex.rir}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 ml-11 md:ml-0">
                        <div className="flex items-center gap-2 bg-brand/10 text-brand px-4 py-2 rounded-xl border border-brand/20">
                          <Activity className="w-5 h-5" />
                          <span className="font-bold">{ex.sets} Séries de {ex.reps}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-bg-main text-text-main px-4 py-2 rounded-xl border border-border">
                          <Timer className="w-5 h-5" />
                          <span className="font-bold">Pausa: {ex.rest}</span>
                        </div>
                      </div>
                    </div>

                    {/* Setup / Initial Load */}
                    {ex.setup && (
                      <div className="ml-11 mb-6 bg-brand/10 p-4 rounded-2xl border border-brand/20">
                        <p className="text-sm font-bold text-brand mb-1">Setup / Carga Inicial:</p>
                        <p className="text-sm text-brand/80 leading-relaxed">{ex.setup}</p>
                      </div>
                    )}

                    {/* Execution Details */}
                    {ex.executionDetails && (
                      <div className="ml-11 mb-6 bg-surface-hover p-4 rounded-2xl border border-border">
                        <p className="text-sm font-bold text-text-main mb-2">Como executar:</p>
                        <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">{ex.executionDetails}</p>
                      </div>
                    )}

                    {/* Load Tracking */}
                    <div className="ml-11 mb-6 bg-bg-main p-4 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm text-text-muted mb-1">Carga Sugerida</p>
                        <p className="font-medium text-text-main">{ex.suggestedLoad}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-text-muted mb-1">Carga Utilizada (kg/placa)</p>
                        <input 
                          type="text" 
                          placeholder="Ex: 15kg"
                          value={actualLoads[getLoadKey(ex.id)] || ''}
                          onChange={(e) => updateLoad(ex.id, e.target.value)}
                          disabled={isCheckedIn}
                          className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-brand transition-colors disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Sets Tracker */}
                    <div className="ml-11 mb-6">
                      <p className="text-sm text-text-muted mb-3">Marque as séries concluídas:</p>
                      <div className="flex flex-wrap gap-3">
                        {Array.from({ length: ex.sets }).map((_, setIdx) => {
                          const isCompleted = completedSets[getSetKey(ex.id, setIdx)];
                          return (
                            <button
                              key={setIdx}
                              onClick={() => toggleSet(ex.id, setIdx)}
                              disabled={isCheckedIn}
                              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                                isCompleted 
                                  ? 'bg-brand/20 border-brand/50 text-brand' 
                                  : 'bg-bg-main border-border text-text-muted hover:border-text-muted'
                              } ${isCheckedIn ? 'cursor-default' : ''}`}
                            >
                              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                              <span className="font-bold">Série {setIdx + 1}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes/Tips */}
                    {ex.notes && (
                      <div className="ml-11 mb-6 bg-brand/5 p-4 rounded-2xl border border-brand/20 flex gap-3 items-start">
                        <Zap className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                        <p className="text-text-main text-sm leading-relaxed">{ex.notes}</p>
                      </div>
                    )}

                    {/* Exercise Feedback (Granular Tracking) */}
                    <div className="ml-11 bg-surface-hover p-5 rounded-2xl border border-border">
                      <h4 className="text-sm font-bold text-text-main mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-brand" /> Avaliação do Exercício
                      </h4>
                      
                      <div className="space-y-4">
                        {/* PSE */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Esforço (PSE)</label>
                            <span className="text-xs font-bold text-brand">{exerciseFeedback[getLoadKey(ex.id)]?.pse || 5}/10</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" max="10" 
                            value={exerciseFeedback[getLoadKey(ex.id)]?.pse || 5}
                            onChange={(e) => updateExerciseFeedback(ex.id, 'pse', parseInt(e.target.value))}
                            disabled={isCheckedIn}
                            className="w-full accent-brand"
                          />
                          <div className="flex justify-between text-[10px] text-text-muted mt-1 font-medium">
                            <span>1 (Leve)</span>
                            <span>5 (Moderado)</span>
                            <span>10 (Máximo)</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Qualidade */}
                          <div>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Qualidade da Execução</label>
                            <select 
                              value={exerciseFeedback[getLoadKey(ex.id)]?.execution || 'Boa'}
                              onChange={(e) => updateExerciseFeedback(ex.id, 'execution', e.target.value)}
                              disabled={isCheckedIn}
                              className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-brand transition-colors disabled:opacity-50"
                            >
                              <option value="Perfeita">🟢 Perfeita (Controle total)</option>
                              <option value="Boa">🟡 Boa (Pequenas falhas)</option>
                              <option value="Ruim">🔴 Ruim (Perdeu a postura)</option>
                            </select>
                          </div>

                          {/* Dor Articular */}
                          <div>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Dor Articular?</label>
                            <div className="flex gap-2">
                              {['Não', 'Sim'].map(opt => {
                                const isPain = opt === 'Sim';
                                const currentPain = exerciseFeedback[getLoadKey(ex.id)]?.pain || false;
                                const isSelected = currentPain === isPain;
                                return (
                                  <button
                                    key={opt}
                                    onClick={() => updateExerciseFeedback(ex.id, 'pain', isPain)}
                                    disabled={isCheckedIn}
                                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                      isSelected 
                                        ? (isPain ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-green-500/10 border-green-500 text-green-500')
                                        : 'bg-bg-main border-border text-text-muted hover:border-brand/50'
                                    } disabled:opacity-50`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <input 
                            type="text" 
                            placeholder="Anotações (ex: banco no nível 3, barra escorregando...)"
                            value={exerciseFeedback[getLoadKey(ex.id)]?.notes || ''}
                            onChange={(e) => updateExerciseFeedback(ex.id, 'notes', e.target.value)}
                            disabled={isCheckedIn}
                            className="w-full bg-bg-main border border-border rounded-lg px-3 py-2 text-sm text-text-main focus:outline-none focus:border-brand transition-colors disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-3xl p-12 text-center shadow-xl">
                <Dumbbell className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-text-main mb-2">Dia de Descanso</h3>
                <p className="text-text-muted">Aproveite para focar na recuperação muscular e alongamentos leves.</p>
              </div>
            )}

            {/* Cardio Section */}
            {dayData.cardio && (
              <div className={`bg-surface border border-brand/30 rounded-3xl p-6 shadow-xl relative overflow-hidden ${isCheckedIn ? 'opacity-80' : ''}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full -z-10" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-brand/10 p-3 rounded-xl border border-brand/20">
                    <Flame className="w-6 h-6 text-brand" />
                  </div>
                  <h3 className="text-xl font-bold text-text-main">Cardio: {dayData.cardio.type}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-bg-main p-4 rounded-2xl border border-border">
                    <p className="text-sm text-text-muted mb-1">Método</p>
                    <p className="font-bold text-text-main">{dayData.cardio.method}</p>
                  </div>
                  <div className="bg-bg-main p-4 rounded-2xl border border-border">
                    <p className="text-sm text-text-muted mb-1">Duração</p>
                    <p className="font-bold text-text-main">{dayData.cardio.duration}</p>
                  </div>
                  <div className="bg-bg-main p-4 rounded-2xl border border-border">
                    <p className="text-sm text-text-muted mb-1">Intensidade</p>
                    <p className="font-bold text-text-main">{dayData.cardio.intensity}</p>
                  </div>
                </div>
                {dayData.cardio.setup && (
                  <div className="mt-4 bg-brand/10 p-4 rounded-2xl border border-brand/20">
                    <p className="text-sm font-bold text-brand mb-1">Setup Inicial:</p>
                    <p className="text-sm text-brand/80 leading-relaxed">{dayData.cardio.setup}</p>
                  </div>
                )}
              </div>
            )}

            {/* Daily Check-in Form */}
            {!isCheckedIn ? (
              <div className="bg-surface border-2 border-brand/30 rounded-3xl p-6 md:p-8 shadow-xl mt-8">
                <h3 className="text-2xl font-black text-text-main mb-2 flex items-center gap-3">
                  <CheckCircle2 className="w-7 h-7 text-brand" />
                  Check-in Diário
                </h3>
                <p className="text-text-muted mb-6">Finalizou o treino? Registre como foi para a IA acompanhar seu progresso.</p>
                
                {/* Mini Report */}
                <div className="bg-bg-main border border-border rounded-2xl p-5 mb-8 flex items-start sm:items-center gap-4 shadow-sm">
                  <div className="bg-brand/10 p-3 rounded-full shrink-0">
                    <Trophy className="w-8 h-8 text-brand" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-text-main mb-1">Seu Desempenho Hoje</h4>
                    <p className="text-text-muted">
                      Você concluiu <strong className="text-text-main">{completedSetsForDay}</strong> de <strong className="text-text-main">{totalSetsForDay}</strong> séries, atingindo <strong className="text-brand">{dailyProgressPercentage}%</strong> da meta do dia.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="font-bold text-text-main block">Como foi o esforço do treino de hoje?</label>
                    <div className="flex flex-wrap gap-3">
                      {['Muito leve', 'Adequado', 'Muito intenso', 'Não treinei'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer bg-bg-main px-4 py-2 rounded-xl border border-border hover:border-brand transition-colors">
                          <input 
                            type="radio" 
                            name="dailyEffort" 
                            value={opt}
                            checked={dailyEffort === opt}
                            onChange={(e) => setDailyEffort(e.target.value)}
                            className="text-brand focus:ring-brand"
                          />
                          <span className="text-text-main font-medium">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="font-bold text-text-main block">Comentários gerais do dia (opcional)</label>
                    <textarea 
                      placeholder="Senti dor no ombro, estava muito cansado, bati PR..."
                      value={dailyNotes}
                      onChange={(e) => setDailyNotes(e.target.value)}
                      className="w-full bg-bg-main border border-border rounded-xl px-4 py-3 text-sm text-text-main focus:outline-none focus:border-brand min-h-[100px] resize-none"
                    />
                  </div>

                  <button
                    onClick={handleCheckin}
                    className="w-full bg-brand hover:bg-brand-hover text-text-inverse font-black text-lg px-6 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    Salvar Check-in do Dia
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 shadow-md mt-8 flex items-start gap-4">
                <div className="bg-emerald-500 p-2 rounded-full shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-500 mb-1">Check-in Concluído</h3>
                  <p className="text-text-main text-sm">
                    <strong>Esforço:</strong> {checkins[getCheckinKey(selectedWeek, selectedDay)].effort}
                  </p>
                  <p className="text-text-main text-sm">
                    <strong>PSE (1-10):</strong> {checkins[getCheckinKey(selectedWeek, selectedDay)].rpe || 'N/A'}
                  </p>
                  {checkins[getCheckinKey(selectedWeek, selectedDay)].notes && (
                    <p className="text-text-muted text-sm mt-1 italic">
                      "{checkins[getCheckinKey(selectedWeek, selectedDay)].notes}"
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Monthly Re-evaluation Button (Only visible when plan is complete) */}
      {isPlanComplete && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-12 p-8 bg-gradient-to-br from-brand/20 to-bg-main border-2 border-brand rounded-3xl text-center shadow-2xl"
        >
          <Trophy className="w-16 h-16 text-brand mx-auto mb-4" />
          <h2 className="text-3xl font-black text-text-main mb-2">Ciclo Concluído! 🎉</h2>
          <p className="text-text-muted mb-8 max-w-xl mx-auto">
            Parabéns por completar todos os dias do seu ciclo de treinamento! Agora é o momento de fazer a reavaliação mensal para que a IA possa gerar seu próximo plano.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand hover:bg-brand-hover text-text-inverse font-black text-lg px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-3"
          >
            <Brain className="w-6 h-6" />
            Gerar Novo Treino (Reavaliação)
          </button>
        </motion.div>
      )}

      {/* Video Modal */}
      <AnimatePresence mode="wait">
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface border border-border rounded-[2.5rem] w-full max-w-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="p-6 md:p-8 border-b border-border flex items-center justify-between bg-surface/50">
                <div className="flex items-center gap-4">
                  <div className="bg-brand/10 p-3 rounded-2xl">
                    <Play className="w-6 h-6 text-brand fill-current" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-text-main leading-tight">
                      {activeVideo.name}
                    </h3>
                    <p className="text-sm text-text-muted font-medium">Demonstração da Execução</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveVideo(null)}
                  className="p-3 hover:bg-bg-main rounded-2xl transition-all border border-transparent hover:border-border group"
                >
                  <X className="w-6 h-6 text-text-muted group-hover:text-text-main" />
                </button>
              </div>
              
              <div className="aspect-video bg-black relative group">
                <iframe 
                  src={activeVideo.url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="p-6 md:p-8 bg-surface/50 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <p className="text-xs font-bold text-brand uppercase tracking-widest mb-1">Dica de Segurança</p>
                  <p className="text-sm text-text-muted leading-relaxed">
                    Mantenha sempre a postura correta e o controle do movimento. Se sentir dor aguda, interrompa o exercício.
                  </p>
                </div>
                <button 
                  onClick={() => setActiveVideo(null)}
                  className="sm:w-48 py-4 bg-brand text-text-inverse font-black rounded-2xl shadow-lg hover:shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  ENTENDI
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly Re-evaluation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-bg-main border border-border rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative my-8"
            >
              <button 
                onClick={() => !isAdjusting && setIsModalOpen(false)}
                className="absolute top-4 right-4 text-text-muted hover:text-text-main disabled:opacity-50"
                disabled={isAdjusting}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="bg-brand/10 p-3 rounded-xl">
                  <ClipboardList className="w-8 h-8 text-brand" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-text-main">Reavaliação Mensal</h2>
                  <p className="text-sm text-text-muted">Preencha o formulário para a IA ajustar seu próximo ciclo.</p>
                </div>
              </div>

              <div className="space-y-8 mb-8">
                {/* Question 1 */}
                <div className="space-y-3">
                  <label className="font-bold text-text-main block">1. Como está sua recuperação e dores musculares no geral?</label>
                  <div className="flex flex-wrap gap-3">
                    {['Recuperação rápida', 'Dores normais', 'Dores excessivas'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="recovery" 
                          value={opt}
                          checked={feedbackForm.recovery.value === opt}
                          onChange={(e) => setFeedbackForm(prev => ({ ...prev, recovery: { ...prev.recovery, value: e.target.value } }))}
                          className="text-brand focus:ring-brand"
                        />
                        <span className="text-text-main">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Comentário opcional..."
                    value={feedbackForm.recovery.comment}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, recovery: { ...prev.recovery, comment: e.target.value } }))}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm text-text-main focus:outline-none focus:border-brand"
                  />
                </div>

                {/* Question 2 */}
                <div className="space-y-3">
                  <label className="font-bold text-text-main block">2. Aderência ao plano (Frequência)?</label>
                  <div className="flex flex-wrap gap-3">
                    {['Segui 100%', 'Faltei alguns dias', 'Tive muita dificuldade'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="adherence" 
                          value={opt}
                          checked={feedbackForm.adherence.value === opt}
                          onChange={(e) => setFeedbackForm(prev => ({ ...prev, adherence: { ...prev.adherence, value: e.target.value } }))}
                          className="text-brand focus:ring-brand"
                        />
                        <span className="text-text-main">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Comentário opcional..."
                    value={feedbackForm.adherence.comment}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, adherence: { ...prev.adherence, comment: e.target.value } }))}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm text-text-main focus:outline-none focus:border-brand"
                  />
                </div>

                {/* Question 3 */}
                <div className="space-y-3">
                  <label className="font-bold text-text-main block">3. Dieta e Qualidade do Sono?</label>
                  <div className="flex flex-wrap gap-3">
                    {['Mantive o foco', 'Alguns deslizes', 'Perdi o controle'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="dietSleep" 
                          value={opt}
                          checked={feedbackForm.dietSleep.value === opt}
                          onChange={(e) => setFeedbackForm(prev => ({ ...prev, dietSleep: { ...prev.dietSleep, value: e.target.value } }))}
                          className="text-brand focus:ring-brand"
                        />
                        <span className="text-text-main">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Comentário opcional..."
                    value={feedbackForm.dietSleep.comment}
                    onChange={(e) => setFeedbackForm(prev => ({ ...prev, dietSleep: { ...prev.dietSleep, comment: e.target.value } }))}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-sm text-text-main focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isAdjusting}
                  className="px-6 py-3 rounded-xl font-bold text-text-muted hover:text-text-main transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdjustPlan}
                  disabled={isAdjusting}
                  className="bg-brand hover:bg-brand-hover text-text-inverse font-bold px-6 py-3 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdjusting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Gerar Novo Treino
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
