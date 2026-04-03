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
      
      if (docSnap.exists() && docSnap.data().entries) {
        // Filter out legacy Marco 0 entries from Firestore
        const loadedEntries = docSnap.data().entries.filter((e: TrackingEntry) => !e.isMarcoZero);
        setEntries(loadedEntries);
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

  const anamnesisWeight = parseFloat(physicalAnamnesis?.weight) || 0;
  
  const effectiveEntries = [...entries];
  if (anamnesisWeight > 0) {
    let m0Date = format(new Date(), 'yyyy-MM-dd');
    if (effectiveEntries.length > 0) {
      m0Date = format(subDays(parseISO(effectiveEntries[0].date), 1), 'yyyy-MM-dd');
    }
    effectiveEntries.unshift({
      date: m0Date,
      weight: anamnesisWeight,
      adherence: '100',
      energyLevel: 'normal',
      sleepQuality: 'good',
      bowelMovement: 'good',
      waterIntake: 'goal_met',
      isMarcoZero: true
    });
  }

  const chartData = effectiveEntries.map(e => {
    let score = 0;
    const adherenceVal = parseInt(e.adherence as string) || 100;
    score += (adherenceVal / 100) * 40;
    if (e.waterIntake === 'goal_met') score += 20;
    else if (e.waterIntake === 'half') score += 10;
    if (e.sleepQuality === 'good') score += 20;
    else if (e.sleepQuality === 'average') score += 10;
    if (e.energyLevel === 'high') score += 10;
    else if (e.energyLevel === 'normal') score += 5;
    if (e.bowelMovement === 'good') score += 10;
    else if (e.bowelMovement === 'irregular') score += 5;

    // If it's Marco 0 and no other data was provided, default to 100
    if (e.isMarcoZero && !e.sleepQuality) {
      score = 100;
    }

    return {
      ...e,
      adherenceNum: adherenceVal,
      wellnessScore: Math.round(score),
      displayDate: format(parseISO(e.date), 'dd/MM', { locale: ptBR })
    };
  });

  const initialWeight = anamnesisWeight;
  const currentWeight = entries.length > 0 ? entries[entries.length - 1].weight : initialWeight;
  const weightDiff = currentWeight - initialWeight;
  const goal = physicalAnamnesis?.goal || 'Saúde e Bem-estar';
  const targetWeight = parseFloat(physicalAnamnesis?.targetWeight) || null;

  // Calculate water goal (35ml per kg of current weight)
  const waterGoalMl = currentWeight * 35;
  const waterGoalLiters = (waterGoalMl / 1000).toFixed(1);

  // Calculate Wellness Score based on the latest entry
  let wellnessScore = 0;
  if (entries.length > 0) {
    const latest = entries[entries.length - 1];
    
    // Adherence (up to 40 pts)
    const adherenceVal = parseInt(latest.adherence as string) || 100;
    wellnessScore += (adherenceVal / 100) * 40;
    
    // Water (up to 20 pts)
    if (latest.waterIntake === 'goal_met') wellnessScore += 20;
    else if (latest.waterIntake === 'half') wellnessScore += 10;
    
    // Sleep (up to 20 pts)
    if (latest.sleepQuality === 'good') wellnessScore += 20;
    else if (latest.sleepQuality === 'average') wellnessScore += 10;
    
    // Energy (up to 10 pts)
    if (latest.energyLevel === 'high') wellnessScore += 10;
    else if (latest.energyLevel === 'normal') wellnessScore += 5;
    
    // Bowel (up to 10 pts)
    if (latest.bowelMovement === 'good') wellnessScore += 10;
    else if (latest.bowelMovement === 'irregular') wellnessScore += 5;
  } else {
    wellnessScore = 100; // Default for Marco 0 if no entries
  }

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
            <span className="text-xs text-brand/70 mt-1">
              {entries.length <= 1 ? "Adicione mais registros para ver a variação" : "Desde o Marco 0"}
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-green-500/10 border border-green-500/20 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10 text-green-500">
              <Battery className="w-24 h-24" />
            </div>
            <span className="text-sm font-bold text-green-500 uppercase tracking-widest mb-1 flex items-center gap-2 relative z-10">
              <Battery className="w-4 h-4" /> Score de Saúde
            </span>
            <div className="flex items-end gap-1 relative z-10">
              <span className="text-3xl font-black text-green-500">{Math.round(wellnessScore)}</span>
              <span className="text-sm font-bold text-green-500/70 mb-1">/100</span>
            </div>
            <span className="text-xs text-green-500/70 mt-1 relative z-10">Baseado no último registro</span>
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
              <option value="100">Seguindo 100% o plano</option>
              <option value="75">Tive pequenos furos (ex: 1 ref. livre)</option>
              <option value="50">Seguindo mais ou menos (metade do dia)</option>
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
              <option value="goal_met">Bati a meta ({waterGoalLiters}L ou mais)</option>
              <option value="half">Tomei um pouco (Cerca da metade da meta)</option>
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
                  {targetWeight && (
                    <Line type="monotone" dataKey={() => targetWeight} name="Meta (kg)" stroke="#4CAF50" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-center px-4">
                <LineChart className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold mb-1">Gráfico em construção</p>
                <p className="text-sm">Adicione mais um registro em outro dia para visualizar a linha do tempo.</p>
              </div>
            )}
          </div>
          
          {/* Insights for Weight */}
          {chartData.length > 1 && targetWeight && (
            <div className="mt-6 p-4 bg-bg-main rounded-2xl border border-border">
              <h4 className="font-bold text-sm text-text-muted mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Análise de Peso
              </h4>
              <p className="text-sm">
                {goal.toLowerCase().includes('emagrecimento') || goal.toLowerCase().includes('perder') ? (
                  currentWeight <= targetWeight ? 
                    <span className="text-green-500 font-bold">Parabéns! Você atingiu sua meta de peso!</span> :
                    currentWeight < initialWeight ? 
                      <span>Você já perdeu <strong className="text-brand">{Math.abs(weightDiff).toFixed(1)} kg</strong>. Faltam <strong className="text-brand">{(currentWeight - targetWeight).toFixed(1)} kg</strong> para sua meta. Continue firme!</span> :
                      <span className="text-yellow-500">Seu peso aumentou ou se manteve. Revise sua adesão à dieta e rotina de treinos.</span>
                ) : goal.toLowerCase().includes('hipertrofia') || goal.toLowerCase().includes('ganhar') ? (
                  currentWeight >= targetWeight ? 
                    <span className="text-green-500 font-bold">Parabéns! Você atingiu sua meta de peso!</span> :
                    currentWeight > initialWeight ? 
                      <span>Você já ganhou <strong className="text-brand">{weightDiff.toFixed(1)} kg</strong>. Faltam <strong className="text-brand">{(targetWeight - currentWeight).toFixed(1)} kg</strong> para sua meta. Bom trabalho!</span> :
                      <span className="text-yellow-500">Seu peso diminuiu ou se manteve. Certifique-se de estar consumindo calorias suficientes.</span>
                ) : (
                  <span>Acompanhe sua variação de peso para garantir que está de acordo com seus objetivos de saúde.</span>
                )}
              </p>
            </div>
          )}
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
              <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-center px-4">
                <Target className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-bold mb-1">Gráfico em construção</p>
                <p className="text-sm">Adicione mais um registro em outro dia para visualizar a linha do tempo.</p>
              </div>
            )}
          </div>

          {/* Insights for Adherence */}
          {chartData.length > 1 && (
            <div className="mt-6 p-4 bg-bg-main rounded-2xl border border-border">
              <h4 className="font-bold text-sm text-text-muted mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" /> Análise de Consistência
              </h4>
              <p className="text-sm">
                {(() => {
                  const recentEntries = chartData.slice(-3);
                  const avgAdherence = recentEntries.reduce((acc, curr) => acc + curr.adherenceNum, 0) / recentEntries.length;
                  
                  if (avgAdherence >= 90) {
                    return <span className="text-green-500 font-bold">Excelente! Sua adesão recente está muito alta. Os resultados virão!</span>;
                  } else if (avgAdherence >= 70) {
                    return <span>Sua consistência está boa, mas tente evitar furos frequentes para acelerar seus resultados.</span>;
                  } else {
                    return <span className="text-yellow-500">Atenção: Sua adesão recente caiu. Lembre-se do seu objetivo principal: {goal}. Tente retomar o foco hoje!</span>;
                  }
                })()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Wellness Score Chart */}
      <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
            <Battery className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Evolução do Score de Saúde</h3>
        </div>
        <div className="h-64 w-full">
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWellness" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '1rem', fontWeight: 'bold' }}
                  itemStyle={{ color: '#22C55E' }}
                />
                <Area type="monotone" dataKey="wellnessScore" name="Score" stroke="#22C55E" strokeWidth={4} fillOpacity={1} fill="url(#colorWellness)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-text-muted text-center px-4">
              <Battery className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold mb-1">Gráfico em construção</p>
              <p className="text-sm">Adicione mais um registro em outro dia para visualizar a linha do tempo.</p>
            </div>
          )}
        </div>
        
        {/* Insights for Wellness Score */}
        {chartData.length > 1 && (
          <div className="mt-6 p-4 bg-bg-main rounded-2xl border border-border">
            <h4 className="font-bold text-sm text-text-muted mb-2 flex items-center gap-2">
              <Battery className="w-4 h-4" /> Análise de Saúde Global
            </h4>
            <p className="text-sm">
              {(() => {
                const latestScore = chartData[chartData.length - 1].wellnessScore;
                const previousScore = chartData[chartData.length - 2].wellnessScore;
                const diff = latestScore - previousScore;
                
                if (latestScore >= 80) {
                  return <span className="text-green-500 font-bold">Seu corpo está funcionando de forma otimizada! Ótimo sono, energia e hidratação.</span>;
                } else if (diff > 0) {
                  return <span className="text-blue-500">Seus hábitos estão melhorando (+{diff} pts). Continue focando na hidratação e sono.</span>;
                } else {
                  return <span className="text-yellow-500">Seu score de saúde caiu. Tente beber mais água e priorizar seu descanso hoje.</span>;
                }
              })()}
            </p>
          </div>
        )}
      </div>

      {/* History Table */}
      {effectiveEntries.length > 0 && (
        <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-brand/10 text-brand">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Histórico de Registros</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-text-muted text-sm">
                  <th className="pb-4 font-bold">Data</th>
                  <th className="pb-4 font-bold">Peso</th>
                  <th className="pb-4 font-bold">Adesão</th>
                  <th className="pb-4 font-bold hidden md:table-cell">Energia</th>
                  <th className="pb-4 font-bold hidden lg:table-cell">Sono</th>
                  <th className="pb-4 font-bold hidden lg:table-cell">Água</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[...effectiveEntries].reverse().map((entry, idx) => (
                  <tr key={entry.date} className="border-b border-border/50 last:border-0 hover:bg-bg-main/50 transition-colors">
                    <td className="py-4 font-bold flex items-center gap-2">
                      {format(parseISO(entry.date), 'dd/MM/yyyy')}
                      {entry.isMarcoZero && <span className="text-[10px] bg-brand/20 text-brand px-2 py-0.5 rounded-full uppercase tracking-wider">Marco 0</span>}
                    </td>
                    <td className="py-4 font-bold text-brand">{entry.weight} kg</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-bg-main rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${parseInt(entry.adherence as string) >= 75 ? 'bg-green-500' : parseInt(entry.adherence as string) >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${entry.adherence}%` }}
                          />
                        </div>
                        <span className="text-xs text-text-muted">{entry.adherence}%</span>
                      </div>
                    </td>
                    <td className="py-4 hidden md:table-cell capitalize text-text-muted">
                      {entry.energyLevel === 'high' ? 'Alta' : entry.energyLevel === 'normal' ? 'Normal' : 'Baixa'}
                    </td>
                    <td className="py-4 hidden lg:table-cell capitalize text-text-muted">
                      {entry.sleepQuality === 'good' ? 'Bom' : entry.sleepQuality === 'average' ? 'Razoável' : 'Ruim'}
                    </td>
                    <td className="py-4 hidden lg:table-cell capitalize text-text-muted">
                      {entry.waterIntake === 'goal_met' ? 'Meta Batida' : entry.waterIntake === 'half' ? 'Metade' : 'Baixa'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
