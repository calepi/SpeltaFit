import React, { useRef, useState, useEffect } from 'react';
import { WorkoutPlan, AnamnesisData } from '../services/workoutGenerator';
import { motion } from 'motion/react';
import { Target, TrendingUp, Info, FileText, Calendar, AlertTriangle, User } from 'lucide-react';
import { WorkoutSheetExport } from './WorkoutSheetExport';
import { WorkoutTracker } from './WorkoutTracker';
import Markdown from 'react-markdown';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Props {
  plan: WorkoutPlan;
  user: AnamnesisData;
  onReset: () => void;
  onUpdatePlan: (newPlan: WorkoutPlan) => void;
  readOnly?: boolean;
  studentUid?: string;
  hideResetButton?: boolean;
}

export function WorkoutPlanView({ plan, user, onReset, onUpdatePlan, readOnly = false, studentUid, hideResetButton = false }: Props) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tracker' | 'dashboard'>('tracker');
  const [trackerState, setTrackerState] = useState<{ selectedWeek: number, actualLoads: Record<string, string> }>({ selectedWeek: 1, actualLoads: {} });
  const [totalCompletedWorkouts, setTotalCompletedWorkouts] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      const targetUid = studentUid || auth.currentUser?.uid;
      if (targetUid) {
        const progressRef = doc(db, `users/${targetUid}/data/progress`);
        const snap = await getDoc(progressRef);
        if (snap.exists()) {
          const data = snap.data();
          const checkins = data.checkins ? Object.keys(data.checkins).length : 0;
          setTotalCompletedWorkouts(checkins);
        }
      }
    };
    fetchProgress();
  }, [studentUid]);

  const handleExport = () => {
    if (!exportRef.current) return;
    
    setIsExporting(true);
    
    // Usamos setTimeout para permitir que a UI atualize (mostrando "Gerando PDF...") 
    // antes que a thread principal seja bloqueada pela renderização do html2canvas.
    setTimeout(async () => {
      try {
        if (exportRef.current) {
          exportRef.current.style.opacity = '1';
        }

        const { default: html2pdf } = await import('html2pdf.js');

        const opt = {
          margin:       8,
          filename:     `SpeltaFit_Treino_${user.name.replace(/\s+/g, '_')}.pdf`,
          image:        { type: 'jpeg' as const, quality: 0.95 },
          html2canvas:  { scale: 1.5, useCORS: true, logging: false },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
        };

        await html2pdf().set(opt).from(exportRef.current).save();
        
      } catch (err) {
        console.error('Failed to export PDF', err);
        alert('Erro ao gerar o PDF. Verifique se seu dispositivo possui memória RAM disponível ou tente abrir no computador.');
      } finally {
        if (exportRef.current) {
          exportRef.current.style.opacity = '0';
        }
        setIsExporting(false);
      }
    }, 200);
  };

  const getReassessmentInfo = () => {
    // If we have a creation date inside the plan Object (added by Firestore)
    const createdAtStr = (plan as any).createdAt || user.trainingStartDate;
    if (!createdAtStr) return null;

    const startDate = new Date(createdAtStr);
    const durationDays = plan.durationWeeks ? plan.durationWeeks * 7 : 30; // Default 30 days if not present
    
    // Calculate expected workouts based on the routine length
    const expectedWeeklyWorkouts = plan.weeklyRoutine.length || 3;
    const expectedWorkoutsSinceStart = Math.floor(((new Date().getTime() - startDate.getTime()) / (1000 * 3600 * 24)) * (expectedWeeklyWorkouts / 7));
    
    // Calculo de dias adiados: (Esperados - Completados) * Fator
    const missedWorkouts = Math.max(0, expectedWorkoutsSinceStart - totalCompletedWorkouts);
    const postponedDays = Math.ceil(missedWorkouts * (7 / expectedWeeklyWorkouts));

    const baseEndDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const endDate = new Date(baseEndDate.getTime() + postponedDays * 24 * 60 * 60 * 1000);
    const today = new Date();
    
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return { status: 'expired', msg: `Reavaliação Pendente! O sistema analisará seu ecossistema em breve para a próxima fase. ${postponedDays > 0 ? `(Adiada em ${postponedDays} dias por inconstância)` : ''}` };
    } else if (diffDays <= 7) {
      return { status: 'warning', msg: `Atenção: Faltam apenas ${diffDays} dias para o processamento da sua reavaliação. ${postponedDays > 0 ? `(Adiada em ${postponedDays} dias)` : ''}` };
    } else {
      return { status: 'ok', msg: `Faltam ${diffDays} dias para a reavaliação sistêmica. ${postponedDays > 0 ? `(Adiada em ${postponedDays} dias por ${missedWorkouts} faltas)` : ''}` };
    }
  };

  const reassessmentInfo = getReassessmentInfo();

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto space-y-8 print:hidden"
      >
        {reassessmentInfo && (
          <div className={`p-4 rounded-xl border font-bold flex items-center justify-between shadow-sm animate-in slide-in-from-top ${
            reassessmentInfo.status === 'expired' ? 'bg-red-500/10 border-red-500/20 text-red-600' :
            reassessmentInfo.status === 'warning' ? 'bg-orange-500/10 border-orange-500/20 text-orange-600' :
            'bg-brand/10 border-brand/20 text-brand'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <span className={`p-2 rounded-lg ${
                reassessmentInfo.status === 'expired' ? 'bg-red-500/20' :
                reassessmentInfo.status === 'warning' ? 'bg-orange-500/20' :
                'bg-brand/20'
              }`}>
                {reassessmentInfo.status === 'expired' ? <AlertTriangle className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
              </span>
              <span>{reassessmentInfo.msg}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand border border-brand/20 text-sm font-bold mb-3">
              <Calendar className="w-4 h-4" />
              {plan.phaseName} ({plan.durationWeeks} Semanas)
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-text-main flex items-center gap-3 tracking-tight">
              Seu Plano de Treino
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 text-sm font-black text-text-inverse bg-brand hover:bg-brand-hover rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5" />
              {isExporting ? 'Gerando PDF...' : 'Baixar Fichas (PDF)'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-surface rounded-2xl border border-border w-fit">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'tracker' ? 'bg-bg-main text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Monitor de Treino
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'overview' ? 'bg-bg-main text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Estratégia e Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'dashboard' ? 'bg-bg-main text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Dashboard do Aluno
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="bg-surface rounded-3xl p-8 border border-border shadow-xl">
            <h3 className="text-xl font-bold text-brand mb-4 flex items-center gap-3">
              <Target className="w-6 h-6" /> Estratégia
            </h3>
            <div className="text-text-muted leading-relaxed prose prose-invert max-w-none">
              <Markdown>{plan.strategySummary}</Markdown>
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-8 border border-border shadow-xl">
            <h3 className="text-xl font-bold text-brand mb-4 flex items-center gap-3">
              <TrendingUp className="w-6 h-6" /> Progressão (Overload)
            </h3>
            <div className="text-text-muted leading-relaxed prose prose-invert max-w-none">
              <Markdown>{plan.progressiveOverloadPlan}</Markdown>
            </div>
          </div>

          <div className="bg-surface rounded-3xl p-8 border border-border shadow-xl md:col-span-2">
            <h3 className="text-xl font-bold text-brand mb-4 flex items-center gap-3">
              <Info className="w-6 h-6" /> Diretrizes de Monitoramento
            </h3>
            <div className="text-text-muted leading-relaxed prose prose-invert max-w-none">
              <Markdown>{plan.monitoringGuidelines}</Markdown>
            </div>
          </div>
        </motion.div>
      ) : activeTab === 'dashboard' ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Dashboard Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface rounded-3xl p-6 border border-border shadow-xl flex items-center gap-4">
              <div className="p-4 bg-brand/10 rounded-2xl text-brand">
                <User className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-text-muted font-bold uppercase tracking-wider">Aluno(a)</p>
                <p className="text-2xl font-black text-text-main">{user.name}</p>
              </div>
            </div>
            <div className="bg-surface rounded-3xl p-6 border border-border shadow-xl flex items-center gap-4">
              <div className="p-4 bg-brand/10 rounded-2xl text-brand">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-text-muted font-bold uppercase tracking-wider">Objetivo</p>
                <p className="text-2xl font-black text-text-main">{user.goal}</p>
              </div>
            </div>
            <div className="bg-surface rounded-3xl p-6 border border-border shadow-xl flex items-center gap-4">
              <div className="p-4 bg-brand/10 rounded-2xl text-brand">
                <Calendar className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm text-text-muted font-bold uppercase tracking-wider">Frequência</p>
                <p className="text-2xl font-black text-text-main">{user.daysPerWeek}x / sem</p>
              </div>
            </div>
          </div>

          {/* Anamnesis Details */}
          <div className="bg-surface rounded-3xl p-8 border border-border shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-text-main flex items-center gap-3">
                📋 Dados da Anamnese
              </h3>
              {!readOnly && (
                <button 
                  onClick={() => setShowResetModal(true)}
                  className="text-sm font-bold text-red-500 hover:text-red-600 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors"
                >
                  Novo Planejamento
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-text-muted font-medium">Idade</p>
                <p className="text-lg font-bold text-text-main">{user.age} anos</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-text-muted font-medium">Gênero</p>
                <p className="text-lg font-bold text-text-main">{user.gender}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-text-muted font-medium">Peso / Altura</p>
                <p className="text-lg font-bold text-text-main">{user.weight} kg / {user.height} cm</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-text-muted font-medium">Nível de Experiência</p>
                <p className="text-lg font-bold text-text-main">{user.experience}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-text-muted font-medium">Local de Treino</p>
                <p className="text-lg font-bold text-text-main">{user.equipment}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-text-muted font-medium">Sono e Estresse</p>
                <p className="text-lg font-bold text-text-main">{user.sleepQuality} / {user.stressLevel}</p>
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-sm text-text-muted font-medium">Limitações ou Lesões</p>
                <p className="text-lg font-bold text-text-main">{user.limitations || 'Nenhuma limitação relatada.'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <WorkoutTracker 
          plan={plan} 
          user={user} 
          onUpdatePlan={onUpdatePlan} 
          readOnly={readOnly} 
          studentUid={studentUid} 
          onStateChange={setTrackerState}
        />
      )}
      </motion.div>

      {/* Export Component (Visible only when Printing) */}
      <div className="hidden print:block print:w-full print:absolute print:top-0 print:left-0 bg-white text-black z-50">
        <WorkoutSheetExport 
          ref={exportRef} 
          plan={plan} 
          user={user} 
          selectedWeek={trackerState.selectedWeek} 
          actualLoads={trackerState.actualLoads} 
        />
      </div>
    </>
  );
}
