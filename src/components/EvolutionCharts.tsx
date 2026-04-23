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
import { TrendingUp, Calendar, Target, Activity, ChevronRight, Info, Share2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { VisualEvolution } from './VisualEvolution';
import { StravaConnect } from './StravaConnect';
import { getStravaActivities } from '../services/stravaService';

interface EvolutionData {
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  workoutConsistency: number;
}

import { analyzeEcosystemContinuously } from '../services/ecosystemEngine';
import { getDoc } from 'firebase/firestore';

interface EvolutionChartsProps {
  userId: string;
}

export function EvolutionCharts({ userId }: EvolutionChartsProps) {
  const [data, setData] = React.useState<EvolutionData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'charts' | 'visual' | 'integrations'>('charts');
  const [stravaActivities, setStravaActivities] = React.useState<any[]>([]);
  const [userData, setUserData] = React.useState<any>(null);
  const [anamnesis, setAnamnesis] = React.useState<any>(null);

  React.useEffect(() => {
    if (!userId) return;

    // Fetch Anamnese Data for Ecosystem calculation
    getDoc(doc(db, `users/${userId}/data/anamnesis`)).then(snap => {
      if (snap.exists()) {
        setAnamnesis(snap.data());
      }
    });

    // Listen to user data for Strava connection status
    const userUnsubscribe = onSnapshot(doc(db, "users", userId), async (doc) => {
      const data = doc.data();
      setUserData(data);
      if (data?.strava) {
        try {
          const activities = await getStravaActivities(userId);
          console.log("Atividades do Strava retornadas:", activities);
          if (activities && Array.isArray(activities)) {
            setStravaActivities(activities);
          }
        } catch (err) {
          console.error('Error fetching strava activities', err);
        }
      }
    });

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

  const latest = data.length > 0 ? data[data.length - 1] : null;
  const previous = data.length > 1 ? data[data.length - 2] : latest;
  const weightDiff = latest && previous ? latest.weight - previous.weight : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-surface rounded-2xl border border-border w-fit print:hidden">
        <button
          onClick={() => setActiveTab('charts')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'charts' ? 'bg-bg-main text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Gráficos de Evolução
        </button>
        <button
          onClick={() => setActiveTab('visual')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'visual' ? 'bg-bg-main text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Diário Visual e Medidas
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'integrations' ? 'bg-bg-main text-brand shadow-sm border border-border' : 'text-text-muted hover:text-text-main'
          }`}
        >
          Integrações
        </button>
      </div>

      {activeTab === 'charts' ? (
        data.length === 0 ? (
          <div className="bg-surface border border-border rounded-[2.5rem] p-12 text-center space-y-4 mt-8">
            <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Comece sua Jornada</h3>
            <p className="text-text-muted max-w-md mx-auto font-medium">
              Ainda não temos dados suficientes para gerar seus gráficos. 
              Continue fazendo seus check-ins diários e registrando seu peso!
            </p>
          </div>
        ) : (
          <>
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

      {/* Ecosystem Monitor Section */}
      <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-brand/10 text-brand">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black tracking-tight">Monitoramento Geral do Ecossistema</h3>
            </div>
            
            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
              analyzeEcosystemContinuously(anamnesis, latest.weight, stravaActivities, latest.workoutConsistency).status === 'Otimizado' 
                ? 'bg-green-500/10 text-green-600' 
                : analyzeEcosystemContinuously(anamnesis, latest.weight, stravaActivities, latest.workoutConsistency).status === 'Ajuste Automático Aplicado'
                  ? 'bg-blue-500/10 text-blue-600'
                  : 'bg-orange-500/10 text-orange-600'
            }`}>
              Status: {analyzeEcosystemContinuously(anamnesis, latest.weight, stravaActivities, latest.workoutConsistency).status}
            </div>
          </div>

          <p className="text-text-muted mb-8 font-medium">
            O SpeltaFit monitora constantemente seus resultados (SpeltaNutro, SpeltaFit e Strava) e avalia algoritmicamente contra sua Anamnese Inicial para efetuar mudanças de rota reais no seu programa.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyzeEcosystemContinuously(anamnesis, latest.weight, stravaActivities, latest.workoutConsistency).details.map((detail, index) => (
              <div key={index} className="p-6 rounded-3xl bg-bg-main border border-border/50">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-black text-brand text-sm uppercase tracking-widest">{detail.category}</h4>
                  {detail.actionTaken && (
                    <span className="bg-brand/10 text-brand px-2 py-0.5 rounded text-[10px] font-bold uppercase">Ação Tomada</span>
                  )}
                </div>
                <p className="text-text-muted text-sm font-medium leading-relaxed mb-3">{detail.message}</p>
                {detail.actionTaken && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-sm font-bold text-text-main">
                      <span className="text-brand mr-2">↳</span>
                      {detail.actionTaken}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
    )
  ) : activeTab === 'visual' ? (
    <VisualEvolution userId={userId} />
  ) : (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black mb-4">Conecte seus Apps</h2>
          <p className="text-text-muted mb-8 font-medium"> Sincronize seus dados de outros dispositivos para uma análise 360 do seu corpo e performance.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-bg-main p-8 rounded-3xl border border-border space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FC4C02] rounded-2xl flex items-center justify-center text-white">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-xl">Strava</h4>
                  <p className="text-xs text-text-muted">Corrida, Ciclismo e Caminhada</p>
                </div>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                Importe automaticamente seus cardios ao ar livre para que a SpeltaFit ajuste sua dieta em tempo real.
              </p>
              <StravaConnect 
                userId={userId} 
                isConnected={!!userData?.strava} 
                onSuccess={() => {}} 
              />
              {stravaActivities.length > 0 ? (
                <div className="mt-4 pt-4 border-t border-border space-y-3">
                  <h5 className="font-bold text-sm text-text-muted mb-2">Últimas atividades:</h5>
                  {stravaActivities.map(act => (
                    <div key={act.id} className="flex justify-between items-center bg-surface p-3 rounded-xl border border-border/50 text-sm">
                      <div className="flex flex-col">
                        <span className="font-bold truncate max-w-[150px]">{act.name}</span>
                        <span className="text-xs text-text-muted">{new Date(act.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-brand">{(act.distance / 1000).toFixed(2)} km</span>
                        <span className="text-xs text-orange-500 font-bold">{act.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm font-medium text-text-muted text-center py-2">
                    Nenhuma atividade recente encontrada no seu Strava.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-bg-main p-8 rounded-3xl border border-border space-y-6 opacity-50 grayscale cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black border border-border">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-xl">Apple Health</h4>
                  <p className="text-xs text-text-muted">Passos e Batimentos</p>
                </div>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                Em breve: sincronize seus passos e métricas de saúde do seu iPhone.
              </p>
              <button disabled className="w-full py-3 bg-gray-200 text-gray-500 font-bold rounded-2xl">Breve</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
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
