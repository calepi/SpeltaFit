import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Plus, Scale, Battery, Target, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TrackingEntry {
  date: string;
  weight: number;
  adherence: number; // 0 to 100
  energyLevel: number; // 1 to 5
}

export function NutritionProgressView() {
  const [entries, setEntries] = useState<TrackingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [weight, setWeight] = useState('');
  const [adherence, setAdherence] = useState('100');
  const [energyLevel, setEnergyLevel] = useState('3');

  useEffect(() => {
    loadTrackingData();
  }, []);

  const loadTrackingData = async () => {
    if (!auth.currentUser) return;
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/data/nutritionTracking`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setEntries(docSnap.data().entries || []);
      } else {
        // Generate some mock data for the last 7 days if empty, just to show how it works
        const mockEntries = Array.from({ length: 7 }).map((_, i) => ({
          date: format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'),
          weight: 75 - (i * 0.2),
          adherence: 80 + Math.random() * 20,
          energyLevel: Math.floor(Math.random() * 3) + 3
        }));
        setEntries(mockEntries);
        await setDoc(docRef, { entries: mockEntries });
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
      date: format(new Date(), 'yyyy-MM-dd'),
      weight: parseFloat(weight),
      adherence: parseInt(adherence),
      energyLevel: parseInt(energyLevel)
    };

    // Remove existing entry for today if exists, then add new
    const updatedEntries = [...entries.filter(e => e.date !== newEntry.date), newEntry]
      .sort((a, b) => a.date.localeCompare(b.date));

    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/data/nutritionTracking`);
      await setDoc(docRef, { entries: updatedEntries }, { merge: true });
      setEntries(updatedEntries);
      setShowForm(false);
      setWeight('');
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
    displayDate: format(parseISO(e.date), 'dd/MM', { locale: ptBR })
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Acompanhamento</h2>
          <p className="text-text-muted">Monitore sua evolução corporal e adesão à dieta.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-brand text-text-inverse rounded-2xl font-bold hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20"
        >
          <Plus className="w-5 h-5" />
          Registrar Hoje
        </button>
      </div>

      {showForm && (
        <motion.form 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted flex items-center gap-2">
              <Scale className="w-4 h-4" /> Peso (kg)
            </label>
            <input 
              type="number" 
              step="0.1"
              required
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full bg-bg-main border border-border rounded-xl px-4 py-3 font-bold focus:border-brand outline-none"
              placeholder="Ex: 75.5"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted flex items-center gap-2">
              <Target className="w-4 h-4" /> Adesão à Dieta (%)
            </label>
            <input 
              type="range" 
              min="0" max="100" step="10"
              value={adherence}
              onChange={e => setAdherence(e.target.value)}
              className="w-full accent-brand"
            />
            <div className="text-right font-bold text-brand">{adherence}%</div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-text-muted flex items-center gap-2">
              <Battery className="w-4 h-4" /> Nível de Energia (1-5)
            </label>
            <input 
              type="range" 
              min="1" max="5" step="1"
              value={energyLevel}
              onChange={e => setEnergyLevel(e.target.value)}
              className="w-full accent-brand"
            />
            <div className="text-right font-bold text-brand">{energyLevel}/5</div>
          </div>
          <div className="md:col-span-3 flex justify-end gap-4 mt-4">
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
            <h3 className="text-xl font-black tracking-tight">Evolução de Peso</h3>
          </div>
          <div className="h-64 w-full">
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
          </div>
        </div>

        {/* Adherence Chart */}
        <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Adesão à Dieta</h3>
          </div>
          <div className="h-64 w-full">
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
                <Area type="monotone" dataKey="adherence" name="Adesão (%)" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorAdherence)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
