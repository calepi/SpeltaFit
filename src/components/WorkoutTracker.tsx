import React, { useState, useEffect } from 'react';
import { WorkoutPlan, AnamnesisData, formatProgressionText } from '../services/workoutGenerator';
import { adjustWorkoutPlanRuleBased } from '../services/workoutGenerator';
import { CheckCircle2, Circle, Dumbbell, Timer, Flame, Zap, Activity, Trophy, Brain, X, Loader2, ClipboardList, Lock, CalendarDays, Info, ChevronDown, ChevronUp, MessageSquare, Sparkles, TrendingUp, Target, Quote, Edit3, Save, Plus, Trash2, ArrowUp, ArrowDown, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { EXERCISE_DB } from '../data/exerciseDatabase';

interface Props {
  plan: WorkoutPlan;
  user: AnamnesisData;
  onUpdatePlan: (newPlan: WorkoutPlan) => void;
  readOnly?: boolean;
  studentUid?: string;
  onStateChange?: (state: { selectedWeek: number, actualLoads: Record<string, string> }) => void;
}

interface FeedbackField {
  value: string;
  comment: string;
}

export function WorkoutTracker({ plan, user, onUpdatePlan, readOnly = false, studentUid, onStateChange }: Props) {
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

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlan, setEditedPlan] = useState<WorkoutPlan | null>(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState<{ dayIdx: number, group?: string } | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState('');

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

  // UI State
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [expandedFeedback, setExpandedFeedback] = useState<Record<string, boolean>>({});
  const [showGlossary, setShowGlossary] = useState(false);
  const [isSimulatingReevaluation, setIsSimulatingReevaluation] = useState(false);

  const toggleDetails = (exId: string) => {
    setExpandedDetails(prev => ({ ...prev, [exId]: !prev[exId] }));
  };

  const toggleFeedback = (exId: string) => {
    setExpandedFeedback(prev => ({ ...prev, [exId]: !prev[exId] }));
  };

  useEffect(() => {
    if (onStateChange) {
      onStateChange({ selectedWeek, actualLoads });
    }
  }, [selectedWeek, actualLoads, onStateChange]);

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
    if (Object.keys(completedSets || {}).length > 0 || Object.keys(actualLoads || {}).length > 0 || Object.keys(exerciseFeedback || {}).length > 0 || Object.keys(checkins || {}).length > 0) {
      saveProgress();
    }
  }, [completedSets, actualLoads, exerciseFeedback, checkins, readOnly]);

  // Derived State
  const totalWeeks = plan.durationWeeks || 4;
  const routineLength = plan.weeklyRoutine?.length || 0;
  const totalDays = totalWeeks * routineLength;
  
  const getAbsoluteIndex = (w: number, d: number) => (w - 1) * routineLength + d;
  const currentAbsoluteIndex = getAbsoluteIndex(selectedWeek, selectedDay);
  const checkedInCount = Object.keys(checkins || {}).length;
  
  const getSetKey = (exId: string, setIdx: number) => `w${selectedWeek}-d${selectedDay}-${exId}-${setIdx}`;
  const getLoadKey = (exId: string) => `w${selectedWeek}-d${selectedDay}-${exId}`;
  const getSetLoadKey = (exId: string, setIdx: number) => `w${selectedWeek}-d${selectedDay}-${exId}-${setIdx}`;
  const getCheckinKey = (w: number, d: number) => `w${w}-d${d}`;

  const isUnlocked = true;
  const isCheckedIn = !!(checkins && checkins[getCheckinKey(selectedWeek, selectedDay)]);
  const isPlanComplete = checkedInCount >= totalDays || isSimulatingReevaluation;

  const toggleEditMode = () => {
    if (isEditing) {
      // Save changes
      if (editedPlan) {
        onUpdatePlan(editedPlan);
      }
      setIsEditing(false);
    } else {
      // Enter edit mode
      setEditedPlan(JSON.parse(JSON.stringify(plan)));
      setIsEditing(true);
    }
  };

  const updateEditedExercise = (dayIdx: number, exIdx: number, field: string, value: any) => {
    if (!editedPlan) return;
    const newPlan = { ...editedPlan, weeklyRoutine: [...editedPlan.weeklyRoutine] };
    newPlan.weeklyRoutine[dayIdx] = { ...newPlan.weeklyRoutine[dayIdx] };
    if (newPlan.weeklyRoutine[dayIdx].exercises) {
      newPlan.weeklyRoutine[dayIdx].exercises = [...newPlan.weeklyRoutine[dayIdx].exercises!];
      newPlan.weeklyRoutine[dayIdx].exercises![exIdx] = { ...newPlan.weeklyRoutine[dayIdx].exercises![exIdx], [field]: value };
    }
    setEditedPlan(newPlan);
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    if (!editedPlan) return;
    const newPlan = { ...editedPlan, weeklyRoutine: [...editedPlan.weeklyRoutine] };
    newPlan.weeklyRoutine[dayIdx] = { ...newPlan.weeklyRoutine[dayIdx] };
    if (newPlan.weeklyRoutine[dayIdx].exercises) {
      newPlan.weeklyRoutine[dayIdx].exercises = [...newPlan.weeklyRoutine[dayIdx].exercises!];
      newPlan.weeklyRoutine[dayIdx].exercises!.splice(exIdx, 1);
    }
    setEditedPlan(newPlan);
  };

  const addExercise = (dayIdx: number, exercise: any) => {
    if (!editedPlan) return;
    const newPlan = { ...editedPlan, weeklyRoutine: [...editedPlan.weeklyRoutine] };
    newPlan.weeklyRoutine[dayIdx] = { ...newPlan.weeklyRoutine[dayIdx] };
    const newEx = {
      id: exercise.id + '_' + Math.random().toString(36).substr(2, 5),
      name: exercise.name,
      group: exercise.group,
      method: 'Série Normal',
      sets: 3,
      reps: '10-12',
      rir: 'RIR 1-2',
      suggestedLoad: 'Carga Moderada',
      rest: '60-90 segundos',
      notes: exercise.description,
      executionDetails: exercise.execution,
      videoUrl: exercise.videoUrl
    };
    if (!newPlan.weeklyRoutine[dayIdx].exercises) {
      newPlan.weeklyRoutine[dayIdx].exercises = [];
    } else {
      newPlan.weeklyRoutine[dayIdx].exercises = [...newPlan.weeklyRoutine[dayIdx].exercises!];
    }
    newPlan.weeklyRoutine[dayIdx].exercises!.push(newEx);
    setEditedPlan(newPlan);
    setShowAddExerciseModal(null);
  };

  const moveExercise = (dayIdx: number, exIdx: number, direction: 'up' | 'down') => {
    if (!editedPlan) return;
    const newPlan = { ...editedPlan, weeklyRoutine: [...editedPlan.weeklyRoutine] };
    newPlan.weeklyRoutine[dayIdx] = { ...newPlan.weeklyRoutine[dayIdx] };
    if (!newPlan.weeklyRoutine[dayIdx].exercises) return;
    
    newPlan.weeklyRoutine[dayIdx].exercises = [...newPlan.weeklyRoutine[dayIdx].exercises!];
    const exercises = newPlan.weeklyRoutine[dayIdx].exercises!;
    
    const targetIdx = direction === 'up' ? exIdx - 1 : exIdx + 1;
    if (targetIdx < 0 || targetIdx >= exercises.length) return;
    
    const temp = exercises[exIdx];
    exercises[exIdx] = exercises[targetIdx];
    exercises[targetIdx] = temp;
    
    setEditedPlan(newPlan);
  };

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

  const updateSetLoad = (exerciseId: string, setIndex: number, load: string) => {
    if (readOnly || !isUnlocked || isCheckedIn) return;
    const key = getSetLoadKey(exerciseId, setIndex);
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

    setIsAdjusting(true);
    setIsModalOpen(true); // Keep modal open to show loading state
    
    // Auto-generate feedback based on checkins and tracked data
    const compiledFeedback = `Reavaliação de Ciclo (Fim de Ciclo): Análise automática baseada no histórico de treinos, cargas e check-ins diários.`;

    try {
      const response = await adjustWorkoutPlanRuleBased(plan, user, completedSets, actualLoads, checkins, compiledFeedback, exerciseFeedback);
      setAnalysisMessage(response.analysis);
      onUpdatePlan(response.updatedPlan);
      
      // Clear tracking data for the new plan
      setCompletedSets({});
      setActualLoads({});
      setCheckins({});
      setSelectedWeek(1);
      setSelectedDay(0);
      setIsModalOpen(false);
      setIsSimulatingReevaluation(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao analisar o treino. Tente novamente.');
    } finally {
      setIsAdjusting(false);
    }
  };

  const activePlan = isEditing ? editedPlan : plan;
  const dayData = activePlan?.weeklyRoutine?.[selectedDay];

  // Calculate progress for the selected day
  const totalSetsForDay = Array.isArray(dayData?.exercises) ? dayData.exercises.reduce((acc, ex) => acc + (ex ? (Number(ex.sets) || 0) : 0), 0) : 0;
  const completedSetsForDay = Array.isArray(dayData?.exercises) ? dayData.exercises.reduce((acc, ex) => {
    if (!ex) return acc;
    let completed = 0;
    const setsCount = Number(ex.sets) || 0;
    for (let i = 0; i < setsCount; i++) {
      if (completedSets && completedSets[getSetKey(ex.id, i)]) completed++;
    }
    return acc + completed;
  }, 0) : 0;

  const dailyProgressPercentage = totalSetsForDay > 0 ? Math.round((completedSetsForDay / totalSetsForDay) * 100) : 0;
  const overallProgressPercentage = Math.round((checkedInCount / totalDays) * 100);

  // Group exercises by muscle group for display
  const groupExercises = (exercises: any[]) => {
    const groups: Record<string, any[]> = {};
    exercises.forEach(ex => {
      if (!ex) return;
      const group = ex.group || 'Outros';
      if (!groups[group]) groups[group] = [];
      groups[group].push(ex);
    });
    return groups;
  };

  const groupedExercises = dayData?.exercises ? groupExercises(dayData.exercises) : {};

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-brand/10 p-2.5 rounded-2xl">
            <LayoutGrid className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h1 className="text-xl font-black text-text-main uppercase tracking-tight flex items-center gap-3">
              Seu Treino
              {auth.currentUser?.email === 'calepi@gmail.com' && !isPlanComplete && (
                <button
                  onClick={() => setIsSimulatingReevaluation(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-purple-500/10 border border-purple-500/30 text-purple-500 hover:bg-purple-500 hover:text-white"
                  title="Simular conclusão do ciclo (Apenas admin)"
                >
                  <Sparkles className="w-3 h-3" />
                  <span className="hidden sm:inline">Simular Reavaliação</span>
                </button>
              )}
            </h1>
            <p className="text-xs text-text-muted font-medium">{activePlan?.phaseName}</p>
          </div>
        </div>
        
        {!readOnly && (
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all bg-bg-main border-2 border-border/50 text-text-muted hover:text-red-500 hover:border-red-500/30"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            )}
            <button
              onClick={toggleEditMode}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${
                isEditing 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20' 
                  : 'bg-surface border-2 border-border/50 text-text-muted hover:text-brand hover:border-brand/30'
              }`}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Editar Treino
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* AI Analysis Message - More Prominent and Premium */}
      {analysisMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand/5 border-2 border-brand/20 rounded-[2.5rem] p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setAnalysisMessage(null)}
              className="p-2 hover:bg-brand/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-brand" />
            </button>
          </div>
          <div className="flex items-start gap-5">
            <div className="bg-brand p-4 rounded-3xl shadow-lg shadow-brand/20 shrink-0">
              <Sparkles className="w-8 h-8 text-bg-main" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-black text-brand uppercase tracking-[0.2em]">Análise da IA</h3>
                <div className="h-px flex-1 bg-brand/20"></div>
              </div>
              <p className="text-text-main text-base font-medium leading-relaxed italic">
                "{analysisMessage}"
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Dashboard Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Overall Progress Card */}
        <div className="bg-surface border-2 border-border/50 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Trophy className="w-32 h-32 text-brand" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-brand/10 p-2 rounded-xl">
                <TrendingUp className="w-5 h-5 text-brand" />
              </div>
              <span className="text-2xl font-black text-brand">{overallProgressPercentage}%</span>
            </div>
            <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-1">Progresso Geral</h3>
            <p className="text-[10px] text-text-muted uppercase font-bold mb-4 tracking-tighter">
              {checkedInCount} de {totalDays} dias de check-in
            </p>
            <div className="h-3 bg-bg-main rounded-full overflow-hidden border border-border/30">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${overallProgressPercentage}%` }}
                className="h-full bg-brand shadow-[0_0_10px_rgba(var(--brand-rgb),0.5)]"
              />
            </div>
          </div>
        </div>

        {/* Daily Target Card */}
        <div className="bg-surface border-2 border-border/50 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Target className="w-32 h-32 text-brand" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-brand/10 p-2 rounded-xl">
                <Activity className="w-5 h-5 text-brand" />
              </div>
              <span className="text-2xl font-black text-brand">{dailyProgressPercentage}%</span>
            </div>
            <h3 className="text-sm font-black text-text-main uppercase tracking-widest mb-1">Meta Diária</h3>
            <p className="text-[10px] text-text-muted uppercase font-bold mb-4 tracking-tighter">
              {completedSetsForDay} de {totalSetsForDay} séries concluídas
            </p>
            <div className="h-3 bg-bg-main rounded-full overflow-hidden border border-border/30">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${dailyProgressPercentage}%` }}
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Execution Guide - Always Visible and Compact */}
      <div className="bg-surface border-2 border-border/50 rounded-[2rem] p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-brand/10 p-2 rounded-xl">
            <Info className="w-5 h-5 text-brand" />
          </div>
          <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Guia Rápido</h3>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { title: 'Série Normal', desc: 'Carga constante.' },
            { title: 'RIR', desc: 'Reps em reserva.' },
            { title: 'Falha', desc: 'Até o limite.' },
            { title: 'PSE', desc: 'Esforço 1-10.' }
          ].map((item, i) => (
            <div key={i} className="bg-bg-main p-3 rounded-2xl border border-border/30 text-center">
              <p className="text-[10px] font-black text-brand uppercase tracking-tighter mb-1 leading-none">{item.title}</p>
              <p className="text-[9px] text-text-muted leading-tight">{item.desc}</p>
            </div>
          ))}
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
              className={`snap-start shrink-0 px-4 py-1.5 rounded-full font-bold text-sm transition-all ${
                selectedWeek === weekNum 
                  ? 'bg-text-main text-bg-main shadow-sm' 
                  : 'bg-surface border border-border text-text-muted hover:text-text-main'
              }`}
            >
              Semana {weekNum}
            </button>
          );
        })}
      </div>

      {/* Day Selector */}
      <div className="flex overflow-x-auto pb-4 gap-2 snap-x scrollbar-hide">
        {Array.isArray(plan.weeklyRoutine) && plan.weeklyRoutine.map((day, idx) => {
          const isDayCheckedIn = !!(checkins && checkins[getCheckinKey(selectedWeek, idx)]);
          
          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={`snap-start shrink-0 px-4 py-3 rounded-2xl border transition-all relative min-w-[100px] text-left ${
                selectedDay === idx 
                  ? 'bg-brand border-brand text-text-inverse shadow-md' 
                  : 'bg-surface border-border text-text-muted hover:bg-surface-hover hover:text-text-main'
              }`}
            >
              {isDayCheckedIn && (
                <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="font-bold text-sm mb-0.5">{day.day}</div>
              <div className={`text-[11px] font-medium leading-tight ${selectedDay === idx ? 'text-text-inverse/80' : 'text-text-muted'}`}>
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
          {/* Daily Progress Bar */}
            {totalSetsForDay > 0 && (
              <div className="bg-surface border border-border/50 rounded-2xl p-4 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-text-main font-bold text-sm flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-brand" />
                    Progresso do Dia
                  </h3>
                  <span className="text-brand font-black text-lg">{dailyProgressPercentage}%</span>
                </div>
                <div className="h-2.5 bg-bg-main rounded-full overflow-hidden border border-border/50">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dailyProgressPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full bg-brand rounded-full"
                  />
                </div>
                <p className="text-text-muted text-[11px] mt-2 text-right font-medium">
                  {completedSetsForDay} de {totalSetsForDay} séries concluídas
                </p>
              </div>
            )}

            {Array.isArray(dayData?.exercises) && dayData.exercises.length > 0 ? (
              <div className="space-y-12">
                {Object.entries(groupedExercises).map(([group, exercises]) => (
                  <div key={group} className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                      <div className="bg-brand/10 p-2 rounded-xl">
                        <Dumbbell className="w-5 h-5 text-brand" />
                      </div>
                      <h3 className="text-lg font-black text-text-main uppercase tracking-tight">{group}</h3>
                      <div className="h-px flex-1 bg-border/50"></div>
                      {isEditing && (
                        <button
                          onClick={() => setShowAddExerciseModal({ dayIdx: selectedDay, group })}
                          className="flex items-center gap-1.5 bg-brand/10 text-brand px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand/20 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Adicionar
                        </button>
                      )}
                    </div>

                    <div className="space-y-8">
                      {exercises.map((ex) => {
                        const exIdx = dayData.exercises!.findIndex(e => e && e.id === ex.id);
                        return (
                          <div key={ex.id} className={`bg-surface rounded-[2.5rem] p-6 shadow-sm border-2 border-border/50 transition-all group ${isCheckedIn ? 'opacity-80' : ''} relative`}>
                            {isEditing && (
                              <div className="absolute -top-3 -right-3 flex gap-2 z-10">
                                <button
                                  onClick={() => moveExercise(selectedDay, exIdx, 'up')}
                                  className="p-2 bg-bg-main border-2 border-border/50 rounded-full text-text-muted hover:text-brand transition-all shadow-sm"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => moveExercise(selectedDay, exIdx, 'down')}
                                  className="p-2 bg-bg-main border-2 border-border/50 rounded-full text-text-muted hover:text-brand transition-all shadow-sm"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeExercise(selectedDay, exIdx)}
                                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}

                            {/* Exercise Header */}
                            <div className="flex flex-col gap-5 mb-8">
                              <div className="flex items-center gap-5">
                                <div className="bg-brand text-text-inverse w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-xl shadow-brand/20 shrink-0 group-hover:scale-105 transition-transform">
                                  {exIdx + 1}
                                </div>
                                <div className="flex-1">
                                  {isEditing ? (
                                    <select 
                                      value={ex.name}
                                      onChange={(e) => {
                                        const selectedEx = Object.values(EXERCISE_DB).flat().find(x => x.name === e.target.value);
                                        if (selectedEx) {
                                          updateEditedExercise(selectedDay, exIdx, 'name', selectedEx.name);
                                          updateEditedExercise(selectedDay, exIdx, 'group', selectedEx.group);
                                          updateEditedExercise(selectedDay, exIdx, 'notes', selectedEx.description);
                                          updateEditedExercise(selectedDay, exIdx, 'executionDetails', selectedEx.execution);
                                          updateEditedExercise(selectedDay, exIdx, 'videoUrl', selectedEx.videoUrl);
                                        } else {
                                          updateEditedExercise(selectedDay, exIdx, 'name', e.target.value);
                                        }
                                      }}
                                      className="w-full bg-bg-main border-2 border-border/50 rounded-xl px-4 py-2 text-lg font-black text-text-main focus:outline-none focus:border-brand uppercase tracking-tighter appearance-none"
                                    >
                                      <option value={ex.name}>{ex.name}</option>
                                      {(() => {
                                        const allExs = Object.values(EXERCISE_DB).flat();
                                        const sameGroup = allExs.filter(x => x.group === ex.group && x.name !== ex.name);
                                        const options = sameGroup.length > 0 ? sameGroup : allExs.filter(x => x.name !== ex.name);
                                        return options.map(x => (
                                          <option key={x.id} value={x.name}>{x.name}</option>
                                        ));
                                      })()}
                                    </select>
                                  ) : (
                                    <h3 className="text-2xl font-black text-text-main leading-tight uppercase tracking-tighter">{ex.name}</h3>
                                  )}
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <div className="flex items-center gap-1 bg-brand/10 text-brand text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-brand/20">
                                      <Activity className="w-3 h-3" />
                                      {ex.sets} Séries
                                    </div>
                                    <div className="flex items-center gap-1 bg-blue-500/10 text-blue-500 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-blue-500/20">
                                      <Dumbbell className="w-3 h-3" />
                                      {ex.group ? ex.group.replace(/_/g, ' ') : 'Outros'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4 flex items-center gap-3">
                                <div className="bg-brand p-2 rounded-xl">
                                  <Zap className="w-4 h-4 text-bg-main" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] font-black text-brand uppercase tracking-widest leading-none mb-1">Sugestão de Carga</p>
                                  {isEditing ? (
                                    <input 
                                      type="text" 
                                      value={ex.suggestedLoad}
                                      onChange={(e) => updateEditedExercise(selectedDay, exIdx, 'suggestedLoad', e.target.value)}
                                      className="w-full bg-transparent border-none p-0 text-sm font-bold text-text-main focus:outline-none"
                                    />
                                  ) : (
                                    <p className="text-sm font-bold text-text-main">{ex.suggestedLoad}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Exercise Info Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                              <div className="flex items-center gap-1.5 bg-bg-main border border-border/50 text-text-main px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm">
                                <Activity className="w-3.5 h-3.5 text-brand" /> 
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <select 
                                      value={ex.sets} 
                                      onChange={(e) => updateEditedExercise(selectedDay, exIdx, 'sets', parseInt(e.target.value))} 
                                      className="w-10 bg-transparent text-center appearance-none cursor-pointer focus:outline-none"
                                    >
                                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                        <option key={num} value={num}>{num}</option>
                                      ))}
                                    </select>
                                    <span>x</span>
                                    <input type="text" value={ex.reps} onChange={(e) => updateEditedExercise(selectedDay, exIdx, 'reps', e.target.value)} className="w-12 bg-transparent text-center" />
                                  </div>
                                ) : (
                                  <>{ex.sets}x{ex.reps}</>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 bg-bg-main border border-border/50 text-text-main px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm">
                                <span className="text-brand font-black">RIR</span>
                                {isEditing ? (
                                  <input type="text" value={ex.rir} onChange={(e) => updateEditedExercise(selectedDay, exIdx, 'rir', e.target.value)} className="w-16 bg-transparent text-center" />
                                ) : (
                                  <span className="text-brand font-black">{ex.rir}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 bg-bg-main border border-border/50 text-text-main px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm">
                                <Timer className="w-3.5 h-3.5 text-brand" />
                                {isEditing ? (
                                  <select 
                                    value={ex.rest} 
                                    onChange={(e) => updateEditedExercise(selectedDay, exIdx, 'rest', e.target.value)} 
                                    className="bg-transparent text-center appearance-none cursor-pointer focus:outline-none"
                                  >
                                    {['30s', '45s', '60s', '90s', '2m', '3m', '4m', '5m'].map(rest => (
                                      <option key={rest} value={rest}>{rest}</option>
                                    ))}
                                    {!['30s', '45s', '60s', '90s', '2m', '3m', '4m', '5m'].includes(ex.rest) && (
                                      <option value={ex.rest}>{ex.rest}</option>
                                    )}
                                  </select>
                                ) : (
                                  <>{ex.rest}</>
                                )}
                              </div>
                            </div>

                            {/* Instructions (Always Visible) */}
                            {(ex.setup || ex.notes || ex.executionDetails || isEditing) && (
                              <div className="grid grid-cols-1 gap-3 mb-6">
                                {(ex.setup || isEditing) && (
                                  <div className="bg-brand/5 p-3.5 rounded-2xl border border-brand/10">
                                    <div className="text-[10px] font-black text-brand uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                      <div className="w-1 h-1 bg-brand rounded-full" /> Progressão
                                    </div>
                                    {isEditing ? (
                                      <textarea 
                                        value={ex.setup}
                                        onChange={(e) => updateEditedExercise(selectedDay, exIdx, 'setup', e.target.value)}
                                        className="w-full bg-transparent border-none p-0 text-xs text-text-main leading-relaxed font-medium focus:outline-none resize-none"
                                        rows={2}
                                      />
                                    ) : (
                                      <p className="text-xs text-text-main leading-relaxed font-medium">{formatProgressionText(ex.setup, selectedWeek, plan, user, ex.name, ex.group)}</p>
                                    )}
                                  </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {(ex.notes || isEditing) && (
                                    <div className="bg-bg-main p-3.5 rounded-2xl border border-border/50">
                                      <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <div className="w-1 h-1 bg-text-muted rounded-full" /> Método / Orientação
                                      </div>
                                      {isEditing ? (
                                        <textarea 
                                          value={ex.notes}
                                          onChange={(e) => updateEditedExercise(selectedDay, exIdx, 'notes', e.target.value)}
                                          className="w-full bg-transparent border-none p-0 text-xs text-text-main leading-relaxed font-medium focus:outline-none resize-none"
                                          rows={3}
                                        />
                                      ) : (
                                        <p className="text-xs text-text-main leading-relaxed font-medium">{ex.notes}</p>
                                      )}
                                    </div>
                                  )}
                                  {(ex.executionDetails || isEditing) && (
                                    <div className="bg-bg-main p-3.5 rounded-2xl border border-border/50">
                                      <div className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                        <div className="w-1 h-1 bg-text-muted rounded-full" /> Como executar
                                      </div>
                                      {isEditing ? (
                                        <textarea 
                                          value={ex.executionDetails}
                                          onChange={(e) => updateEditedExercise(selectedDay, exIdx, 'executionDetails', e.target.value)}
                                          className="w-full bg-transparent border-none p-0 text-xs text-text-main leading-relaxed font-medium focus:outline-none resize-none"
                                          rows={3}
                                        />
                                      ) : (
                                        <p className="text-xs text-text-main leading-relaxed font-medium whitespace-pre-wrap">{ex.executionDetails}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Sets Table */}
                            {!isEditing && (
                              <div className="bg-bg-main/30 rounded-[2rem] p-5 border border-border/30 mb-8">
                                <div className="flex items-center justify-between mb-4 px-2">
                                  <h4 className="text-xs font-black text-text-muted uppercase tracking-widest">Séries de Trabalho</h4>
                                </div>
                                
                                <div className="space-y-3">
                                  {Array.from({ length: Number(ex.sets) || 0 }).map((_, setIdx) => {
                                    const isCompleted = completedSets && completedSets[getSetKey(ex.id, setIdx)];
                                    return (
                                      <div key={setIdx} className="flex items-center gap-3 bg-surface p-3 rounded-2xl border border-border/50">
                                        <button
                                          onClick={() => toggleSet(ex.id, setIdx)}
                                          disabled={isCheckedIn}
                                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all shadow-sm shrink-0 ${
                                            isCompleted 
                                              ? 'bg-brand text-white shadow-brand/30 scale-105' 
                                              : 'bg-bg-main border-2 border-border/50 text-text-muted hover:border-brand/50'
                                          } ${isCheckedIn ? 'cursor-default' : ''}`}
                                        >
                                          {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : setIdx + 1}
                                        </button>
                                        
                                        <div className="flex-1 flex items-center justify-between">
                                          <span className="text-xs font-black text-text-main uppercase tracking-widest">Série {setIdx + 1}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Carga (kg)</span>
                                            <input 
                                              type="text" 
                                              placeholder="0.0"
                                              value={(actualLoads && actualLoads[getSetLoadKey(ex.id, setIdx)]) || ''}
                                              onChange={(e) => updateSetLoad(ex.id, setIdx, e.target.value)}
                                              disabled={isCheckedIn}
                                              className="w-20 bg-bg-main border-2 border-border/50 rounded-xl px-2 py-2 text-center font-black text-base text-text-main focus:outline-none focus:border-brand placeholder:text-text-muted/30 disabled:opacity-50"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Exercise Feedback (Collapsible) */}
                            {!isEditing && (
                              <div className="bg-amber-500/5 rounded-[2rem] border-2 border-amber-500/10 overflow-hidden">
                                <button 
                                  onClick={() => toggleFeedback(ex.id)}
                                  className="w-full flex items-center justify-between p-6 hover:bg-amber-500/10 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-500/20">
                                      <MessageSquare className="w-5 h-5 text-white" />
                                    </div>
                                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest">Avaliação do Exercício</h4>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {exerciseFeedback && exerciseFeedback[getLoadKey(ex.id)]?.pse && (
                                      <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-amber-500/20">
                                        {exerciseFeedback[getLoadKey(ex.id)]?.pse} / 10 PSE
                                      </div>
                                    )}
                                    {expandedFeedback[ex.id] ? (
                                      <ChevronUp className="w-5 h-5 text-amber-900/50" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-amber-900/50" />
                                    )}
                                  </div>
                                </button>
                                
                                <AnimatePresence>
                                  {expandedFeedback[ex.id] && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="px-6 pb-6"
                                    >
                                      <div className="space-y-8 pt-4 border-t border-amber-500/10">
                                        {/* PSE Slider */}
                                        <div className="px-2">
                                          <div className="flex justify-between items-center mb-3">
                                            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest ml-1">Percepção de Esforço (PSE)</p>
                                            <span className="text-xs font-black text-amber-600">{exerciseFeedback[getLoadKey(ex.id)]?.pse || 5} / 10</span>
                                          </div>
                                          <input 
                                            type="range" 
                                            min="1" max="10" 
                                            value={exerciseFeedback[getLoadKey(ex.id)]?.pse || 5}
                                            onChange={(e) => updateExerciseFeedback(ex.id, 'pse', parseInt(e.target.value))}
                                            disabled={isCheckedIn}
                                            className="w-full h-3 bg-amber-200 rounded-full appearance-none cursor-pointer accent-amber-600 shadow-inner"
                                          />
                                          <div className="flex justify-between text-[10px] text-amber-700/60 mt-3 font-black uppercase tracking-tighter">
                                            <span>Leve</span>
                                            <span>Moderado</span>
                                            <span>Falha</span>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          {/* Qualidade */}
                                          <div className="space-y-3">
                                            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest ml-1">Qualidade da Execução</p>
                                            <div className="flex gap-2">
                                              {['Excelente', 'Boa', 'Ruim'].map((opt) => (
                                                <button
                                                  key={opt}
                                                  onClick={() => updateExerciseFeedback(ex.id, 'execution', opt)}
                                                  disabled={isCheckedIn}
                                                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                                                    exerciseFeedback[getLoadKey(ex.id)]?.execution === opt
                                                      ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                      : 'bg-white border-amber-500/10 text-amber-900/40 hover:border-amber-500/30'
                                                  }`}
                                                >
                                                  {opt}
                                                </button>
                                              ))}
                                            </div>
                                          </div>

                                          {/* Dor */}
                                          <div className="space-y-3">
                                            <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest ml-1">Dor Articular?</p>
                                            <div className="flex gap-2">
                                              {[
                                                { label: 'Sim', value: true },
                                                { label: 'Não', value: false }
                                              ].map((opt) => (
                                                <button
                                                  key={opt.label}
                                                  onClick={() => updateExerciseFeedback(ex.id, 'pain', opt.value)}
                                                  disabled={isCheckedIn}
                                                  className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                                                    (exerciseFeedback[getLoadKey(ex.id)]?.pain === opt.value)
                                                      ? 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                      : 'bg-white border-amber-500/10 text-amber-900/40 hover:border-amber-500/30'
                                                  }`}
                                                >
                                                  {opt.label}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Notas */}
                                        <div className="space-y-3">
                                          <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest ml-1">Observações do Exercício</p>
                                          <textarea 
                                            placeholder="Ex: Senti um leve desconforto na última repetição..."
                                            value={exerciseFeedback[getLoadKey(ex.id)]?.notes || ''}
                                            onChange={(e) => updateExerciseFeedback(ex.id, 'notes', e.target.value)}
                                            disabled={isCheckedIn}
                                            className="w-full bg-white border-2 border-amber-500/10 rounded-2xl px-4 py-3 text-xs text-amber-900 placeholder:text-amber-900/20 focus:outline-none focus:border-amber-500 transition-all resize-none"
                                            rows={2}
                                          />
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {isEditing && (
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => setShowAddExerciseModal({ dayIdx: selectedDay })}
                      className="flex items-center gap-3 bg-bg-main border-2 border-dashed border-border/50 hover:border-brand hover:text-brand text-text-muted px-8 py-6 rounded-[2rem] transition-all group w-full max-w-md"
                    >
                      <div className="bg-brand/10 p-3 rounded-2xl group-hover:bg-brand group-hover:text-white transition-all">
                        <Plus className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <p className="font-black uppercase tracking-widest text-sm">Adicionar Exercício</p>
                        <p className="text-[10px] font-medium opacity-60">Escolha um novo exercício para este dia.</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface border border-border/50 rounded-2xl p-8 text-center shadow-sm">
                <Dumbbell className="w-12 h-12 text-text-muted mx-auto mb-3" />
                <h3 className="text-xl font-bold text-text-main mb-1">Dia de Descanso</h3>
                <p className="text-text-muted text-sm">Aproveite para focar na recuperação muscular e alongamentos leves.</p>
                {isEditing && (
                  <button
                    onClick={() => setShowAddExerciseModal({ dayIdx: selectedDay })}
                    className="mt-4 flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-xl text-xs font-bold mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Exercício
                  </button>
                )}
              </div>
            )}

            {/* Cardio Section */}
            {dayData?.cardio && (
              <div className={`bg-surface rounded-2xl p-4 shadow-sm border border-brand/30 relative overflow-hidden ${isCheckedIn ? 'opacity-80' : ''}`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-full -z-10" />
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-brand/10 p-2 rounded-full">
                    <Flame className="w-5 h-5 text-brand" />
                  </div>
                  <h3 className="text-lg font-bold text-text-main">Cardio: {dayData.cardio.type}</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-bg-main p-3 rounded-xl border border-border/50 text-center">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Método</p>
                    <p className="font-bold text-text-main text-sm">{dayData.cardio.method}</p>
                  </div>
                  <div className="bg-bg-main p-3 rounded-xl border border-border/50 text-center">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Duração</p>
                    <p className="font-bold text-text-main text-sm">{dayData.cardio.duration}</p>
                  </div>
                  <div className="bg-bg-main p-3 rounded-xl border border-border/50 text-center">
                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Intensidade</p>
                    <p className="font-bold text-text-main text-sm">{dayData.cardio.intensity}</p>
                  </div>
                </div>
                {dayData.cardio.setup && (
                  <div className="mt-3 bg-brand/5 p-3 rounded-xl border border-brand/10">
                    <p className="text-[11px] font-bold text-brand uppercase tracking-wider mb-1">Setup Inicial</p>
                    <p className="text-sm text-text-main leading-relaxed">{formatProgressionText(dayData.cardio.setup, selectedWeek, plan, user, 'Cardio', 'Cardio')}</p>
                  </div>
                )}
                {(dayData.cardio as any).notes && (
                  <div className="mt-3 bg-bg-main p-3 rounded-xl border border-border/50 flex gap-2 items-start">
                    <Zap className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    <p className="text-text-main text-sm leading-relaxed">{(dayData.cardio as any).notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Daily Check-in Form */}
            {!isCheckedIn ? (
              <div className="bg-surface border-2 border-brand/30 rounded-[2.5rem] p-6 shadow-xl mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-brand p-3 rounded-2xl shadow-lg shadow-brand/20">
                    <CheckCircle2 className="w-7 h-7 text-bg-main" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-text-main leading-none">Check-in Diário</h3>
                    <p className="text-text-muted text-xs mt-1">Finalize seu treino com chave de ouro</p>
                  </div>
                </div>
                
                <div className="bg-bg-main border border-border/50 rounded-3xl p-5 mb-8 flex items-center gap-5">
                  <div className="bg-brand/10 p-4 rounded-2xl shrink-0">
                    <Trophy className="w-8 h-8 text-brand" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-text-main uppercase tracking-wider">Resumo do Treino</h4>
                    <p className="text-text-muted text-xs mt-1 leading-relaxed">
                      Você concluiu <strong className="text-brand">{completedSetsForDay}</strong> de <strong className="text-text-main">{totalSetsForDay}</strong> séries planejadas hoje.
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="font-black text-text-main text-xs block uppercase tracking-[0.15em] ml-1">Nível de Esforço</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Muito leve', icon: '🌱' },
                        { label: 'Adequado', icon: '🔥' },
                        { label: 'Muito intenso', icon: '⚡' },
                        { label: 'Não treinei', icon: '💤' }
                      ].map((opt) => (
                        <label key={opt.label} className={`flex flex-col items-center justify-center gap-2 cursor-pointer p-4 rounded-3xl border-2 transition-all duration-300 ${
                          dailyEffort === opt.label 
                            ? 'bg-brand/10 border-brand shadow-lg shadow-brand/10 scale-[1.02]' 
                            : 'bg-bg-main border-border/50 text-text-muted hover:border-brand/30'
                        }`}>
                          <input 
                            type="radio" 
                            name="dailyEffort" 
                            value={opt.label}
                            checked={dailyEffort === opt.label}
                            onChange={(e) => setDailyEffort(e.target.value)}
                            className="hidden"
                          />
                          <span className="text-2xl">{opt.icon}</span>
                          <span className={`text-[10px] uppercase font-black tracking-wider ${dailyEffort === opt.label ? 'text-brand' : ''}`}>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="font-black text-text-main text-xs block uppercase tracking-[0.15em] ml-1">Notas do Dia</label>
                    <textarea 
                      placeholder="Como você se sentiu? Alguma dor ou recorde pessoal?"
                      value={dailyNotes}
                      onChange={(e) => setDailyNotes(e.target.value)}
                      className="w-full bg-bg-main border-2 border-border/50 rounded-3xl px-5 py-4 text-sm text-text-main focus:outline-none focus:border-brand min-h-[120px] transition-all placeholder:text-text-muted/50"
                    />
                  </div>

                  <button
                    onClick={handleCheckin}
                    className="w-full bg-brand hover:bg-brand-hover text-text-inverse font-black text-base px-8 py-5 rounded-3xl shadow-2xl shadow-brand/30 transition-all flex items-center justify-center gap-4 active:scale-95 group"
                  >
                    <CheckCircle2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    FINALIZAR CHECK-IN
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/5 border-2 border-emerald-500/20 rounded-[2.5rem] p-8 shadow-sm mt-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6">
                  <div className="bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/30 animate-pulse">
                    CONCLUÍDO
                  </div>
                </div>
                
                <div className="flex flex-col items-center text-center mb-10">
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-emerald-500 p-6 rounded-[2.5rem] shadow-2xl shadow-emerald-500/40 mb-6 relative"
                  >
                    <CheckCircle2 className="w-12 h-12 text-white" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                      <Trophy className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  </motion.div>
                  <h3 className="text-3xl font-black text-emerald-600 uppercase tracking-tighter mb-2">Treino Finalizado!</h3>
                  <p className="text-text-muted text-sm font-medium max-w-[250px]">Ótimo trabalho hoje, você está mais perto do seu objetivo.</p>
                </div>
 
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border-2 border-emerald-500/10 text-center shadow-sm">
                    <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-2">Esforço</p>
                    <p className="text-xl font-black text-text-main">{checkins && checkins[getCheckinKey(selectedWeek, selectedDay)]?.effort}</p>
                  </div>
                  <div className="bg-white/80 backdrop-blur-md p-5 rounded-[2rem] border-2 border-emerald-500/10 text-center shadow-sm">
                    <p className="text-[10px] text-text-muted uppercase font-black tracking-widest mb-2">PSE</p>
                    <p className="text-xl font-black text-text-main">{(checkins && checkins[getCheckinKey(selectedWeek, selectedDay)]?.rpe) || 'N/A'}</p>
                  </div>
                </div>
 
                {checkins && checkins[getCheckinKey(selectedWeek, selectedDay)]?.notes && (
                  <div className="bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border-2 border-emerald-500/5 relative group-hover:border-emerald-500/20 transition-colors">
                    <Quote className="w-10 h-10 text-emerald-500/10 absolute top-3 left-3" />
                    <p className="text-text-main text-sm font-bold italic leading-relaxed text-center relative z-10 px-4">
                      "{checkins[getCheckinKey(selectedWeek, selectedDay)].notes}"
                    </p>
                  </div>
                )}
              </div>
            )}
      </motion.div>

      {/* Monthly Re-evaluation Button (Only visible when plan is complete) */}
      {isPlanComplete && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-5 bg-gradient-to-br from-brand/10 to-bg-main border border-brand/50 rounded-2xl text-center shadow-sm"
        >
          <Trophy className="w-10 h-10 text-brand mx-auto mb-2" />
          <h2 className="text-lg font-black text-text-main mb-1">Ciclo Concluído! 🎉</h2>
          <p className="text-text-muted text-xs mb-4 max-w-sm mx-auto">
            Parabéns por completar todos os dias do seu ciclo! Faça a reavaliação para a IA gerar seu próximo plano.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-brand hover:bg-brand-hover text-text-inverse font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              Gerar Novo Treino
            </button>
            {isSimulatingReevaluation && (
              <button
                onClick={() => setIsSimulatingReevaluation(false)}
                className="bg-bg-main border border-border text-text-muted hover:text-red-500 hover:border-red-500/30 font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all inline-flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar Simulação
              </button>
            )}
          </div>
        </motion.div>
      )}


      {/* Monthly Re-evaluation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-surface border-2 border-border/50 rounded-[3rem] p-8 max-w-xl w-full shadow-2xl relative my-8"
            >
              <button 
                onClick={() => !isAdjusting && setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-bg-main rounded-full text-text-muted hover:text-brand transition-all disabled:opacity-50 shadow-sm"
                disabled={isAdjusting}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center justify-center py-10">
                <div className="bg-brand/10 p-6 rounded-full mb-6 relative">
                  <div className="absolute inset-0 border-4 border-brand/30 rounded-full animate-ping"></div>
                  <Brain className="w-12 h-12 text-brand animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-text-main uppercase tracking-tight mb-4">
                  Analisando seu Histórico
                </h2>
                <p className="text-text-muted text-sm font-medium max-w-md mx-auto leading-relaxed text-center">
                  O sistema está processando suas cargas, séries concluídas e check-ins diários para gerar um plano perfeitamente adaptado à sua evolução.
                </p>
                <div className="mt-8 flex items-center justify-center gap-3 text-brand font-bold text-sm uppercase tracking-widest">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando Novo Treino...
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* Add Exercise Modal */}
        {showAddExerciseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-main/90 backdrop-blur-xl z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-surface w-full max-w-2xl rounded-[3rem] shadow-2xl border-2 border-border/50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b-2 border-border/30 flex items-center justify-between bg-surface sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-brand/10 p-3 rounded-2xl">
                    <Plus className="w-6 h-6 text-brand" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-text-main uppercase tracking-tighter leading-tight">Adicionar Exercício</h2>
                    <p className="text-xs text-text-muted font-bold uppercase tracking-widest">{showAddExerciseModal.group || 'Todos os Grupos'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAddExerciseModal(null)}
                  className="bg-bg-main p-3 rounded-2xl text-text-muted hover:text-brand transition-all border-2 border-border/50 hover:border-brand/30"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
                <div className="relative">
                  <Activity className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted/40" />
                  <input 
                    type="text" 
                    placeholder="Buscar exercício pelo nome..."
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    className="w-full bg-bg-main border-2 border-border/50 rounded-2xl pl-14 pr-6 py-4 text-sm text-text-main focus:outline-none focus:border-brand transition-all placeholder:text-text-muted/30 font-bold"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {Object.values(EXERCISE_DB)
                    .flat()
                    .filter(ex => {
                      const matchesSearch = ex.name.toLowerCase().includes(exerciseSearch.toLowerCase());
                      const matchesGroup = !showAddExerciseModal.group || ex.group === showAddExerciseModal.group;
                      return matchesSearch && matchesGroup;
                    })
                    .slice(0, 50)
                    .map(ex => (
                      <button
                        key={ex.id}
                        onClick={() => addExercise(showAddExerciseModal.dayIdx, ex)}
                        className="flex items-center justify-between p-5 rounded-2xl border-2 border-border/50 hover:border-brand hover:bg-brand/5 transition-all group text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-bg-main p-2.5 rounded-xl group-hover:bg-brand/10 transition-all">
                            <Dumbbell className="w-5 h-5 text-text-muted group-hover:text-brand" />
                          </div>
                          <div>
                            <p className="font-black text-text-main uppercase tracking-tight leading-none mb-1">{ex.name}</p>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{ex.group ? ex.group.replace(/_/g, ' ') : 'Outros'}</p>
                          </div>
                        </div>
                        <Plus className="w-5 h-5 text-text-muted group-hover:text-brand opacity-0 group-hover:opacity-100 transition-all" />
                      </button>
                    ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
