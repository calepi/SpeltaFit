import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Calendar, Target, Activity, ChevronRight, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EvolutionData {
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  workoutConsistency: number;
}

interface EvolutionChartsProps {
  userId: string;
}

export function EvolutionCharts({ userId }: EvolutionChartsProps) {
  const [data, setData] = React.useState<EvolutionData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, `users/${userId}/evolution`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const evolutionData = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          date: format(d.timestamp.toDate(), 'dd/MM', { locale: ptBR }),
          weight: d.weight,
          bodyFat: d.bodyFat,
          muscleMass: d.muscleMass,
          workoutConsistency: d.workoutConsistency || 0
        };
      });
      setData(evolutionData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to evolution data:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-[2.5rem] p-12 text-center space-y-4">
        <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto">
          <TrendingUp className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-black tracking-tight">Comece sua Jornada</h3>
        <p className="text-text-muted max-w-md mx-auto font-medium">
          Ainda não temos dados suficientes para gerar seus gráficos. 
          Continue fazendo seus check-ins diários e registrando seu peso!
        </p>
      </div>
    );
  }

  const latest = data[data.length - 1];
  const previous = data.length > 1 ? data[data.length - 2] : latest;
  const weightDiff = latest.weight - previous.weight;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand/5 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 text-brand text-xs font-black uppercase tracking-widest">
              Análise de Performance
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Sua Evolução <br />
              <span className="text-brand text-2xl md:text-3xl">Visualizada em Dados</span>
            </h2>
          </div>
        </div>

        <div className="bg-brand text-text-inverse rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-2xl bg-white/20">
              <Activity className="w-6 h-6" />
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${weightDiff <= 0 ? 'bg-green-500/20 text-green-100' : 'bg-red-500/20 text-red-100'}`}>
              {weightDiff > 0 ? `+${weightDiff.toFixed(1)}kg` : `${weightDiff.toFixed(1)}kg`}
            </div>
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Peso Atual</div>
            <div className="text-4xl font-black tracking-tighter">{latest.weight}kg</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weight Chart */}
        <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-brand/10 text-brand">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Histórico de Peso</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--color-text-muted)' }}
                />
                <YAxis 
                  hide 
                  domain={['dataMin - 2', 'dataMax + 2']} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderRadius: '1rem', 
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ fontWeight: 800, color: 'var(--color-brand)' }}
                  labelStyle={{ fontWeight: 800, marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="var(--color-brand)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorWeight)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consistency Chart */}
        <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Consistência de Treino</h3>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--color-text-muted)' }}
                />
                <YAxis 
                  hide 
                  domain={[0, 100]} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderRadius: '1rem', 
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ fontWeight: 800, color: '#3b82f6' }}
                  labelStyle={{ fontWeight: 800, marginBottom: '4px' }}
                />
                <Line 
                  type="stepAfter" 
                  dataKey="workoutConsistency" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-2xl bg-gold/10 text-gold">
            <Info className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black tracking-tight">Insights da IA SpeltaFit</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InsightCard 
            title="Tendência de Peso"
            content={weightDiff <= 0 
              ? "Seu peso está em uma tendência de queda saudável. Mantenha o déficit calórico e a ingestão de proteínas." 
              : "Houve um leve aumento de peso. Isso pode ser retenção hídrica ou ganho de massa muscular se os treinos estão intensos."}
          />
          <InsightCard 
            title="Consistência"
            content={latest.workoutConsistency >= 80 
              ? "Sua consistência está excelente! Você está no caminho certo para resultados duradouros." 
              : "Tente aumentar sua frequência de treinos. A consistência é o fator #1 para a mudança corporal."}
          />
        </div>
      </div>
    </div>
  );
}

function InsightCard({ title, content }: { title: string, content: string }) {
  return (
    <div className="p-6 rounded-3xl bg-bg-main border border-border/50 space-y-2">
      <h4 className="font-black text-brand text-sm uppercase tracking-widest">{title}</h4>
      <p className="text-text-muted text-sm font-medium leading-relaxed">{content}</p>
    </div>
  );
}
