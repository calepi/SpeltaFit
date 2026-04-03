import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Plus, Scale, Battery, Target, Calendar, ArrowRight, Flag } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrackingEntry {
  date: string;
  weight: number;
  adherence: string; // "100", "75", "50", "25"
  energyLevel: string; // "high", "normal", "low"
  sleepQuality?: string; // "good", "average", "bad"
  bowelMovement?: string; // "good", "irregular", "bad"
  waterIntake?: string; // "goal_met", "half", "low"
  isMarcoZero?: boolean;
}

interface NutritionProgressViewProps {
  physicalAnamnesis: any;
}

export function NutritionProgressView({ physicalAnamnesis }: NutritionProgressViewProps) {
  const [entries, setEntries] = useState<TrackingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [entryDate, setEntryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState('');
  const [adherence, setAdherence] = useState('100');
  const [energyLevel, setEnergyLevel] = useState('normal');
  const [sleepQuality, setSleepQuality] = useState('good');
  const [bowelMovement, setBowelMovement] = useState('good');
  const [waterIntake, setWaterIntake] = useState('goal_met');

  useEffect(() => {
    loadTrackingData();
  }, []);

  const loadTrackingData = async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/data/nutritionTracking`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists() && docSnap.data().entries && docSnap.data().entries.length > 0) {
        setEntries(docSnap.data().entries);
      } else {
        // Create Marco 0 if no entries exist
        const initialWeight = parseFloat(physicalAnamnesis?.weight) || 0;
        if (initialWeight > 0) {
          const marcoZero: TrackingEntry = {
            date: format(new Date(), 'yyyy-MM-dd'),
            weight: initialWeight,
            adherence: '100',
            energyLevel: 'normal',
            sleepQuality: 'good',
            bowelMovement: 'good',
            waterIntake: 'goal_met',
            isMarcoZero: true
          };
          setEntries([marcoZero]);
          await setDoc(docRef, { entries: [marcoZero] });
        }
      }
    } catch (error) {
      console.error("Error loading tracking data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    const newEntry: TrackingEntry = {
      date: entryDate,
      weight: parseFloat(weight),
      adherence,
      energyLevel,
      sleepQuality,
      bowelMovement,
      waterIntake
    };

    // Remove existing entry for selected date if exists
    const updatedEntries = [...entries.filter(e => e.date !== newEntry.date), newEntry]
      .sort((a, b) => a.date.localeCompare(b.date));

    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/data/nutritionTracking`);
      await setDoc(docRef, { entries: updatedEntries }, { merge: true });
      setEntries(updatedEntries);
      setShowForm(false);
      setWeight('');
      // Reset form to today
      setEntryDate(format(new Date(), 'yyyy-MM-dd'));
      setAdherence('100');
      setEnergyLevel('normal');
      setSleepQuality('good');
      setBowelMovement('good');
      setWaterIntake('goal_met');
    } catch (error) {
      console.error("Error saving tracking data:", error);
      alert("Erro ao salvar dados.");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const chartData = entries.map(e => ({
    ...e,
    adherenceNum: typeof e.adherence === 'number' ? e.adherence : (parseInt(e.adherence as string) || 100),
    displayDate: format(parseISO(e.date), 'dd/MM', { locale: ptBR })
  }));

  const initialWeight = entries.length > 0 ? entries[0].weight : (parseFloat(physicalAnamnesis?.weight) || 0);
  const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight : initialWeight;
  const weightDiff = currentWeight - initialWeight;
  const goal = physicalAnamnesis?.goal || 'Saúde e Bem-estar';

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight mb-2">Seu Progresso</h2>
            <p className="text-text-muted flex items-center gap-2">
              <Target className="w-5 h-5 text-brand" />
              Objetivo Principal: <strong className="text-text-main uppercase">{goal}</strong>
            </p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-brand text-text-inverse rounded-2xl font-bold hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 w-full md:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Novo Registro
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-bg-main border border-border flex flex-col justify-center">
            <span className="text-sm font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2">
              <Flag className="w-4 h-4" /> Marco 0
            </span>
            <span className="text-3xl font-black">{initialWeight.toFixed(1)} kg</span>
            <span className="text-xs text-text-muted mt-1">Peso inicial</span>
          </div>
          
          <div className="p-6 rounded-3xl bg-bg-main border border-border flex flex-col justify-center">
            <span className="text-sm font-bold text-text-muted uppercase tracking-widest mb-1 flex items-center gap-2">
              <Scale className="w-4 h-4" /> Atual
            </span>
            <span className="text-3xl font-black text-brand">{currentWeight.toFixed(1)} kg</span>
            <span className="text-xs text-text-muted mt-1">Último registro</span>
          </div>

          <div className="p-6 rounded-3xl bg-brand/5 border border-brand/20 flex flex-col justify-center">
            <span className="text-sm font-bold text-brand uppercase tracking-widest mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Variação
            </span>
            <span className="text-3xl font-black text-brand">
              {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
            </span>
            <span className="text-xs text-brand/70 mt-1">Desde o início</span>
          </div>
        </div>
      </div>

      {showForm && (
        <motion.form 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Data do Registro
            </label>
            <input 
              type="date" 
              required
              value={entryDate}
              max={format(new Date(), 'yyyy-MM-dd')}
              onChange={e => setEntryDate(e.target.value)}
              className="w-full bg-bg-main border border-border rounded-xl px-4 py-3 font-bold focus:border-brand outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted flex items-center gap-2">
              <Scale className="w-4 h-4" /> Peso Atual (kg)
            </label>
            <input 
              type="number" 
              step="0.1"
              required
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full bg-bg-main border border-border rounded-xl px-4 py-3 font-bold focus:border-brand outline-none"
              placeholder={`Ex: ${currentWeight}`}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted flex items-center gap-2">
              <Target className="w-4 h-4" /> Como foi sua alimentação?
            </label>
            <select 
              value={adherence}
              onChange={e => setAdherence(e.target.value)}
              className="w-full bg-bg-main border border-border rounded-xl px-4 py-3 font-bold focus:border-brand outline-none appearance-none"
            >
              <option value="100">Segui 100% o plano</option>
              <option value="75">Tive pequenos furos (ex: 1 ref. livre)</option>
              <option value="50">Segui mais ou menos (metade do dia)</option>
              <option value="25">Comi totalmente fora do plano</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted flex items-center gap-2">
              <Battery className="w-4 h-4" /> Como você se sentiu hoje?
            </label>
            <select 
              value={energyLevel}
              onChange={e => setEnergyLevel(e.target.value)}
              className="w-full bg-bg-main border border-border rounded-xl px-4 py-3 font-bold focus:border-brand outline-none appearance-none"
            >
              <option value="high">Cheio de energia / Disposto</option>
              <option value="normal">Normal / Estável</option>
              <option value="low">Muito cansado / Fadigado</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Qualidade do Sono
            </label>
            <select 
              value={sleepQuality}
              onChange={e => setSleepQuality(e.target.value)}
              className="w-full bg-bg-main border border-border rounded-xl px-4 py-3 font-bold focus:border-brand outline-none appearance-none"
            >
              <option value="good">Dormi muito bem (Acordei descansado)</option>
              <option value="average">Razoável (Acordei algumas vezes)</option>
              <option value="bad">Ruim (Insônia ou acordei cansado)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Funcionamento do Intestino
            </label>
            <select 
              value={bowelMovement}
              onChange={e => setBowelMovement(e.target.value)}
              className="w-full bg-bg-main border border-border rounded-xl px-4 py-3 font-bold focus:border-brand outline-none appearance-none"
            >
              <option value="good">Normal (Fui ao banheiro sem problemas)</option>
              <option value="irregular">Irregular (Preso ou solto demais)</option>
              <option value="bad">Ruim (Não fui ou tive muito desconforto)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Ingestão de Água
            </label>
            <select 
              value={waterIntake}
              onChange={e => setWaterIntake(e.target.value)}
              className="w-full bg-bg-main border border-border rounded-xl px-4 py-3 font-bold focus:border-brand outline-none appearance-none"
            >
              <option value="goal_met">Bati a meta (2L a 3L+)</option>
              <option value="half">Tomei um pouco (Cerca de 1L a 1.5L)</option>
              <option value="low">Quase não tomei água (Menos de 1L)</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-4 mt-4">
            <button 
              type="button" 
              onClick={() => setShowForm(false)}
              className="px-6 py-3 font-bold text-text-muted hover:text-text-main transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-8 py-3 bg-brand text-text-inverse rounded-xl font-bold hover:bg-brand-hover transition-colors"
            >
              Salvar Registro
            </button>
          </div>
        </motion.form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weight Chart */}
        <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-brand/10 text-brand">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Curva de Peso</h3>
          </div>
          <div className="h-64 w-full">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="displayDate" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '1rem', fontWeight: 'bold' }}
                    itemStyle={{ color: '#FF5722' }}
                  />
                  <Line type="monotone" dataKey="weight" name="Peso (kg)" stroke="#FF5722" strokeWidth={4} dot={{ r: 4, fill: '#FF5722', strokeWidth: 2, stroke: '#1A1A1A' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                <LineChart className="w-12 h-12 mb-4 opacity-20" />
                <p>Adicione mais registros para ver o gráfico.</p>
              </div>
            )}
          </div>
        </div>

        {/* Adherence Chart */}
        <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Consistência na Dieta</h3>
          </div>
          <div className="h-64 w-full">
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAdherence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="displayDate" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '1rem', fontWeight: 'bold' }}
                    itemStyle={{ color: '#3B82F6' }}
                  />
                  <Area type="monotone" dataKey="adherenceNum" name="Adesão (%)" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorAdherence)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-muted">
                <Target className="w-12 h-12 mb-4 opacity-20" />
                <p>Adicione mais registros para ver o gráfico.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
