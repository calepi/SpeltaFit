import React from 'react';
import { Trophy, Star, Zap, Target, Award, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { gamificationService, UserStats, BADGES } from '../services/gamificationService';

interface GamificationDashboardProps {
  userId: string;
}

export function GamificationDashboard({ userId }: GamificationDashboardProps) {
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!userId) return;
    gamificationService.getUserStats(userId).then(s => {
      setStats(s);
      setLoading(false);
    });
  }, [userId]);

  if (loading || !stats) return null;

  const nextLevelPoints = Math.pow(stats.level, 2) * 100;
  const currentLevelPoints = Math.pow(stats.level - 1, 2) * 100;
  const progress = ((stats.points - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;

  return (
    <div className="space-y-8">
      {/* Level & Points Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand/5 to-transparent pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-3xl bg-brand text-text-inverse flex items-center justify-center text-4xl font-black shadow-2xl shadow-brand/20">
                {stats.level}
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">Nível {stats.level}</h2>
                <p className="text-text-muted font-bold uppercase tracking-widest text-xs">Guerreiro SpeltaFit</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-black uppercase tracking-widest">
                <span className="text-text-muted">Progresso do Nível</span>
                <span className="text-brand">{stats.points} / {nextLevelPoints} XP</span>
              </div>
              <div className="h-4 bg-bg-main rounded-full overflow-hidden border border-border p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-brand rounded-full shadow-lg shadow-brand/20"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-brand text-text-inverse rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <Zap className="absolute -top-4 -right-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="p-3 rounded-2xl bg-white/20 w-fit mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <div className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Ofensiva Atual</div>
            <div className="text-4xl font-black tracking-tighter">{stats.streak} Dias</div>
          </div>
          <p className="text-xs font-bold opacity-80 mt-4">Mantenha a constância para ganhar bônus de XP!</p>
        </div>
      </div>

      {/* Badges Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gold/10 text-gold">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">Suas Conquistas</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {BADGES.map(badge => {
            const isUnlocked = stats.badges.includes(badge.id);
            return (
              <div 
                key={badge.id}
                className={`p-6 rounded-[2rem] border transition-all text-center space-y-3 group ${
                  isUnlocked 
                    ? 'bg-surface border-border shadow-xl hover:scale-105' 
                    : 'bg-bg-main border-border/50 opacity-40 grayscale'
                }`}
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{badge.icon}</div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-tight leading-tight">{badge.name}</h4>
                  <p className="text-[10px] text-text-muted font-bold mt-1 leading-tight">{badge.requirement}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Estatísticas Gerais</h3>
          </div>
          
          <div className="space-y-4">
            <StatRow label="Treinos Concluídos" value={stats.completedWorkouts} icon={<TrendingUp className="w-4 h-4" />} />
            <StatRow label="Postagens no Feed" value={stats.postsCount} icon={<Star className="w-4 h-4" />} />
            <StatRow label="Total de XP" value={stats.points} icon={<Zap className="w-4 h-4" />} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand/10 text-brand">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Próximos Desafios</h3>
          </div>
          
          <div className="space-y-4">
            <ChallengeRow title="Semana de Ferro" description="Treine 5 dias nesta semana" progress={60} />
            <ChallengeRow title="Comunidade Ativa" description="Comente em 3 posts hoje" progress={33} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, icon }: { label: string, value: number | string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-bg-main border border-border/50">
      <div className="flex items-center gap-3">
        <div className="text-text-muted">{icon}</div>
        <span className="text-sm font-bold text-text-muted">{label}</span>
      </div>
      <span className="text-lg font-black">{value}</span>
    </div>
  );
}

function ChallengeRow({ title, description, progress }: { title: string, description: string, progress: number }) {
  return (
    <div className="p-4 rounded-2xl bg-bg-main border border-border/50 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-black tracking-tight">{title}</h4>
          <p className="text-xs text-text-muted font-medium">{description}</p>
        </div>
        <span className="text-xs font-black text-brand">{progress}%</span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden border border-border">
        <div className="h-full bg-brand rounded-full" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
