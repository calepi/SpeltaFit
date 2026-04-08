import React, { useRef, useState } from 'react';
import { WorkoutPlan, AnamnesisData } from '../services/workoutGenerator';
import { motion } from 'motion/react';
import { Target, TrendingUp, Info, FileText, Calendar, AlertTriangle, User } from 'lucide-react';
import { WorkoutSheetExport } from './WorkoutSheetExport';
import { WorkoutTracker } from './WorkoutTracker';
import html2pdf from 'html2pdf.js';
import Markdown from 'react-markdown';

interface Props {
  plan: WorkoutPlan;
  user: AnamnesisData;
  onReset: () => void;
  onUpdatePlan: (newPlan: WorkoutPlan) => void;
  readOnly?: boolean;
  studentUid?: string;
}

export function WorkoutPlanView({ plan, user, onReset, onUpdatePlan, readOnly = false, studentUid }: Props) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tracker' | 'dashboard'>('tracker');
  const [showResetModal, setShowResetModal] = useState(false);
  const [trackerState, setTrackerState] = useState<{ selectedWeek: number, actualLoads: Record<string, string> }>({ selectedWeek: 1, actualLoads: {} });

  const handleExport = async () => {
    if (!exportRef.current) return;
    
    try {
      setIsExporting(true);
      
      // Temporarily make the element visible for html2canvas
      exportRef.current.style.opacity = '1';
      exportRef.current.style.position = 'static';
      exportRef.current.style.zIndex = '1';

      const opt = {
        margin:       10,
        filename:     `SpeltaFit_Treino_${user.name.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' as const }
      };

      await html2pdf().set(opt).from(exportRef.current).save();

    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Erro ao gerar o PDF. Tente novamente.');
    } finally {
      // Restore hidden state
      if (exportRef.current) {
        exportRef.current.style.opacity = '0';
        exportRef.current.style.position = 'absolute';
        exportRef.current.style.zIndex = '-50';
      }
      setIsExporting(false);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto space-y-8 print:hidden"
      >
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
            {!readOnly && (
              <button 
                onClick={() => setShowResetModal(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all shadow-sm"
              >
                <AlertTriangle className="w-5 h-5" />
                Novo Planejamento
              </button>
            )}
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

      {/* Hidden Export Component */}
      <div 
        className="absolute top-0 left-0 -z-50 pointer-events-none" 
        style={{ opacity: isExporting ? 1 : 0 }}
      >
        <WorkoutSheetExport 
          ref={exportRef} 
          plan={plan} 
          user={user} 
          selectedWeek={trackerState.selectedWeek} 
          actualLoads={trackerState.actualLoads} 
        />
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-6 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-text-main">Atenção</h3>
            </div>
            <p className="text-text-muted mb-8 text-lg">
              Tem certeza que deseja criar um novo treino? Seu progresso atual será perdido.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowResetModal(false)}
                className="px-5 py-3 rounded-xl font-bold text-text-main bg-bg-main hover:bg-border transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setShowResetModal(false);
                  onReset();
                }}
                className="px-5 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20 cursor-pointer"
              >
                Sim, Refazer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
