import React, { useEffect, useState } from 'react';
import { Bell, Clock, Droplets, Utensils, Zap, Save, CheckCircle2, Volume2, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DietPlan, NutritionalAnamnesis } from '../services/nutritionGenerator';

interface Reminder {
  id: string;
  type: 'water' | 'meal' | 'workout' | 'custom';
  time: string;
  enabled: boolean;
  label: string;
}

interface Props {
  userId: string;
}

const DEFAULT_REMINDERS: Reminder[] = [
  { id: '1', type: 'water', time: '09:00', enabled: true, label: 'Hidratação Matinal' },
  { id: '2', type: 'water', time: '11:00', enabled: true, label: 'Hidratação Pré-Almoço' },
  { id: '3', type: 'meal', time: '12:30', enabled: true, label: 'Almoço Planejado' },
  { id: '4', type: 'water', time: '15:00', enabled: true, label: 'Hidratação Tarde' },
  { id: '5', type: 'workout', time: '18:00', enabled: true, label: 'Hora de Treinar!' },
  { id: '6', type: 'meal', time: '20:00', enabled: true, label: 'Jantar Leve' },
];

export function ReminderSettings({ userId }: Props) {
  const [reminders, setReminders] = useState<Reminder[]>(DEFAULT_REMINDERS);
  const [showSaved, setShowSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const loadReminders = async () => {
      try {
        const docRef = doc(db, `users/${userId}/data/reminders`);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setReminders(snap.data().reminders || DEFAULT_REMINDERS);
        }
      } catch (err) {
        console.error("Error loading reminders:", err);
      } finally {
        setLoading(false);
      }
    };
    loadReminders();
  }, [userId]);

  const toggleReminder = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const updateTime = (id: string, time: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, time } : r));
  };

  const updateLabel = (id: string, label: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, label } : r));
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const addReminder = () => {
    const newReminder: Reminder = {
      id: 'custom-' + Date.now(),
      type: 'custom',
      time: '12:00',
      enabled: true,
      label: 'Novo Alarme'
    };
    setReminders(prev => [...prev, newReminder]);
  };

  const handleSyncPlans = async () => {
    setIsSyncing(true);
    try {
      const newReminders: Reminder[] = [];
      let reminderIdCounter = 1;

      // Fetch Diet Plan
      const dietDoc = await getDoc(doc(db, `users/${userId}/data/dietPlan`));
      if (dietDoc.exists()) {
        const dietPlan = dietDoc.data() as DietPlan;
        if (dietPlan.meals && dietPlan.meals.length > 0) {
          dietPlan.meals.forEach(meal => {
            newReminders.push({
              id: `sync-meal-${reminderIdCounter++}`,
              type: 'meal',
              time: meal.time || '12:00',
              enabled: true,
              label: meal.name
            });
          });
        }
      }

      // Fetch Anamnesis for Water
      const anamnesisDoc = await getDoc(doc(db, `users/${userId}/data/nutritionalAnamnesis`));
      if (anamnesisDoc.exists()) {
        const anamnesis = anamnesisDoc.data() as NutritionalAnamnesis;
        const waterIntake = anamnesis.waterIntake || 2500; // Default 2.5L
        
        // Create water reminders based on total intake
        // E.g., 1 glass (250ml) every X hours
        const glasses = Math.ceil(waterIntake / 250);
        const maxWaterAlarms = 8; // Don't overwhelm the user
        const numAlarms = Math.min(glasses, maxWaterAlarms);
        const mlPerAlarm = Math.round(waterIntake / numAlarms);
        
        const startHour = 8; // 8 AM
        const endHour = 20; // 8 PM
        const interval = (endHour - startHour) / (numAlarms > 1 ? numAlarms - 1 : 1);

        for (let i = 0; i < numAlarms; i++) {
          const hour = Math.floor(startHour + (i * interval));
          const minute = Math.round(((startHour + (i * interval)) % 1) * 60);
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          
          newReminders.push({
            id: `sync-water-${reminderIdCounter++}`,
            type: 'water',
            time: timeStr,
            enabled: true,
            label: `Beber Água (${mlPerAlarm}ml)`
          });
        }
      }

      // Fetch Workout Plan
      const workoutDoc = await getDoc(doc(db, `users/${userId}/data/workoutPlan`));
      if (workoutDoc.exists()) {
        // Just add one general workout reminder if they have a plan
        newReminders.push({
          id: `sync-workout-${reminderIdCounter++}`,
          type: 'workout',
          time: '18:00',
          enabled: true,
          label: 'Hora do Treino!'
        });
      }

      if (newReminders.length > 0) {
        // Sort by time
        newReminders.sort((a, b) => a.time.localeCompare(b.time));
        setReminders(newReminders);
      } else {
        alert("Nenhum plano encontrado para sincronizar. Configure seus planos primeiro.");
      }

    } catch (err) {
      console.error("Error syncing plans:", err);
      alert("Erro ao sincronizar com os planos.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, `users/${userId}/data/reminders`);
      await setDoc(docRef, { reminders, updatedAt: new Date().toISOString() }, { merge: true });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (err) {
      console.error("Error saving reminders:", err);
    }
  };

  const handleTestTrigger = async () => {
    const testReminder = {
      id: 'test-' + Date.now(),
      type: 'workout' as const,
      time: 'TEST',
      enabled: true,
      label: 'Teste de Alarme SpeltaFit'
    };
    try {
      const docRef = doc(db, `users/${userId}/data/reminders`);
      await setDoc(docRef, { testTrigger: testReminder, testTriggerTime: Date.now() }, { merge: true });
    } catch (err) {
      console.error("Error triggering test:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand/10 text-brand">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Lembretes Inteligentes</h3>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand text-text-inverse font-black shadow-lg shadow-brand/20 hover:scale-105 transition-all active:scale-95 w-full md:w-auto justify-center"
          >
            <Save className="w-5 h-5" />
            Salvar Configurações
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleSyncPlans}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-600 font-bold hover:bg-blue-500/20 transition-all text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sincronizar com Planos
          </button>
          <button 
            onClick={addReminder}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-600 font-bold hover:bg-green-500/20 transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Adicionar Alarme
          </button>
          <button 
            onClick={handleTestTrigger}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border text-text-main font-bold hover:bg-bg-main transition-all text-sm"
          >
            <Volume2 className="w-4 h-4" />
            Testar Som e Alerta
          </button>
        </div>

        <p className="text-text-muted font-medium max-w-2xl">
          Configure seus lembretes personalizados ou sincronize automaticamente com seus planos de treino e dieta.
          As notificações aparecerão no seu navegador e no aplicativo.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map(reminder => (
            <div 
              key={reminder.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col gap-4 ${
                reminder.enabled ? 'bg-bg-main border-border shadow-sm' : 'bg-bg-main/30 border-border/50 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    reminder.type === 'water' ? 'bg-blue-500/10 text-blue-500' :
                    reminder.type === 'meal' ? 'bg-green-500/10 text-green-500' :
                    reminder.type === 'workout' ? 'bg-brand/10 text-brand' :
                    'bg-purple-500/10 text-purple-500'
                  }`}>
                    {reminder.type === 'water' ? <Droplets className="w-5 h-5" /> :
                     reminder.type === 'meal' ? <Utensils className="w-5 h-5" /> :
                     reminder.type === 'workout' ? <Zap className="w-5 h-5" /> :
                     <Bell className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input 
                      type="text"
                      value={reminder.label}
                      onChange={(e) => updateLabel(reminder.id, e.target.value)}
                      className="font-black text-sm tracking-tight bg-transparent border-none outline-none w-full truncate focus:ring-2 focus:ring-brand/50 rounded px-1 -ml-1"
                      placeholder="Nome do alarme"
                    />
                    <input 
                      type="time" 
                      value={reminder.time}
                      onChange={(e) => updateTime(reminder.id, e.target.value)}
                      className="bg-transparent border-none outline-none text-xs font-bold text-text-muted cursor-pointer hover:text-brand transition-colors mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button 
                    onClick={() => toggleReminder(reminder.id)}
                    className={`w-12 h-6 rounded-full p-1 transition-all relative shrink-0 ${
                      reminder.enabled ? 'bg-brand' : 'bg-border'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                      reminder.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    title="Excluir alarme"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {reminders.length === 0 && (
            <div className="col-span-full p-8 text-center text-text-muted border-2 border-dashed border-border rounded-3xl">
              Nenhum alarme configurado. Adicione um novo ou sincronize com seus planos.
            </div>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gold/10 text-gold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Por que usar lembretes?</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BenefitCard 
            title="Hidratação" 
            content="Beber água regularmente acelera o metabolismo e melhora a performance nos treinos." 
          />
          <BenefitCard 
            title="Nutrição" 
            content="Comer nos horários certos evita picos de fome e mantém seus níveis de energia estáveis." 
          />
          <BenefitCard 
            title="Consistência" 
            content="O hábito é construído através da repetição. Os lembretes ajudam você a não esquecer o compromisso." 
          />
        </div>
      </div>

      <AnimatePresence>
        {showSaved && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-2xl bg-green-500 text-white font-black shadow-2xl flex items-center gap-3 z-[200]"
          >
            <CheckCircle2 className="w-6 h-6" />
            Configurações Salvas com Sucesso!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BenefitCard({ title, content }: { title: string, content: string }) {
  return (
    <div className="p-6 rounded-3xl bg-bg-main border border-border/50 space-y-2">
      <h4 className="font-black text-brand text-sm uppercase tracking-widest">{title}</h4>
      <p className="text-text-muted text-xs font-medium leading-relaxed">{content}</p>
    </div>
  );
}
