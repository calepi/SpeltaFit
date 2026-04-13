import React from 'react';
import { motion } from 'motion/react';
import { 
  Dumbbell, ArrowRight, Zap, Target, Activity, 
  BrainCircuit, ClipboardList, LineChart, BookOpen, 
  Download, Cloud, Palette, CheckCircle2, Sparkles,
  Smartphone, ShieldCheck, Edit3, History, Cpu, Database,
  Apple, Users
} from 'lucide-react';

import { Logo } from './Logo';

interface Props {
  onStart: () => void;
  hasPlan?: boolean;
  onContinue?: () => void;
  onViewTerms?: () => void;
  onViewPrivacy?: () => void;
  hidePricing?: boolean;
}

export function LandingPage({ onStart, hasPlan, onContinue, onViewTerms, onViewPrivacy, hidePricing }: Props) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="flex flex-col items-center justify-center pb-24 space-y-32">
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-4xl mx-auto pt-12 px-4"
      >
        <div className="inline-flex items-center justify-center mb-8">
          <Logo size="xl" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-text-main mb-6 tracking-tight leading-tight">
          Performance Humana <br/>
          <span className="text-brand">Baseada em Dados</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed">
          O SpeltaFit utiliza motores de regras determinísticos baseados em fisiologia do exercício e nutrição esportiva para gerar planos precisos, sem depender de "IAs genéricas".
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {hasPlan && onContinue && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="bg-brand hover:bg-brand-hover text-text-inverse font-black text-xl px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center gap-3"
            >
              Continuar Meu Treino
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStart}
            className={`${hasPlan ? 'bg-surface text-text-main border-2 border-border hover:border-brand/50' : 'bg-brand hover:bg-brand-hover text-text-inverse'} font-black text-xl px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center gap-3`}
          >
            {hasPlan ? 'Criar Novo Treino' : (hidePricing ? 'Começar Agora' : 'Começar 7 Dias Grátis')}
            {!hasPlan && <ArrowRight className="w-6 h-6" />}
          </motion.button>
        </div>
      </motion.section>

      {/* O Papel do Sistema e Objetivo */}
      <section className="w-full max-w-6xl mx-auto px-4">
        <div className="bg-surface border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand font-bold text-sm mb-6">
                <Cpu className="w-5 h-5" />
                Motores Determinísticos
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-text-main mb-6 leading-tight">
                Engenharia de Treino e Nutrição
              </h2>
              <p className="text-lg text-text-muted mb-6 leading-relaxed">
                Nossos algoritmos não "adivinham". Eles calculam. Utilizamos heurísticas validadas cientificamente para determinar volume, intensidade e macronutrientes.
              </p>
              <ul className="space-y-4">
                {[
                  'Cálculo de TMB via Mifflin-St Jeor com fatores de atividade precisos.',
                  'Volume de treino (séries/semana) ajustado por nível de experiência e estresse.',
                  'Seleção de exercícios filtrada por equipamento disponível e biomecânica.',
                  'Protocolo 2026: Progressão estruturada de 3 meses para sedentários.'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-brand shrink-0" />
                    <span className="text-text-main font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-bg-main rounded-2xl p-8 border border-border shadow-inner">
              <h3 className="text-2xl font-black text-text-main mb-4">Controle Total e Transparência</h3>
              <p className="text-text-muted text-lg leading-relaxed mb-6">
                O sistema sugere a base ideal, mas você tem o controle final. Edite exercícios, ajuste cargas e substitua alimentos mantendo o balanço de macronutrientes intacto.
              </p>
              <div className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border">
                <Database className="w-10 h-10 text-brand" />
                <div>
                  <p className="font-bold text-text-main">Dados Seguros (Firestore)</p>
                  <p className="text-sm text-text-muted">Sua evolução salva na nuvem com isolamento total de dados.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-text-main mb-4">A Jornada do Resultado</h2>
          <p className="text-xl text-text-muted">Do planejamento à execução, tudo no seu celular.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: ClipboardList, title: '1. Coleta de Dados', desc: 'Anamnese física e nutricional detalhada para alimentar os motores de regras.' },
            { icon: Cpu, title: '2. Processamento', desc: 'Algoritmos calculam seu volume de treino e necessidades calóricas exatas.' },
            { icon: Activity, title: '3. Execução', desc: 'Vá para a academia, marque as séries feitas e anote as cargas no Tracker.' },
            { icon: LineChart, title: '4. Progressão', desc: 'Acompanhe seu histórico de cargas e peso corporal em gráficos interativos.' }
          ].map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-surface border-2 border-brand rounded-full flex items-center justify-center mb-6 shadow-lg relative z-10">
                <step.icon className="w-10 h-10 text-brand" />
              </div>
              {i < 3 && <div className="hidden md:block absolute top-10 left-[60%] w-full h-[2px] bg-border -z-0"></div>}
              <h3 className="text-xl font-bold text-text-main mb-3">{step.title}</h3>
              <p className="text-text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Funcionalidades Detalhadas */}
      <section className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-text-main mb-4">Ecossistema Completo</h2>
          <p className="text-xl text-text-muted">Ferramentas projetadas para quem treina de verdade.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            { icon: Cpu, title: 'Motores de Regras', desc: 'Geração de treinos e dietas baseada em algoritmos determinísticos, sem alucinações de IA.' },
            { icon: Apple, title: 'Motor de Substituição', desc: 'Troque alimentos da sua dieta mantendo o balanço exato de macronutrientes através de cálculos automáticos.' },
            { icon: Target, title: 'Gamificação (XP e Níveis)', desc: 'Ganhe XP por treinos concluídos, hidratação e refeições perfeitas. Suba de nível e desbloqueie conquistas.' },
            { icon: Activity, title: 'Tracker Interativo', desc: 'Marque séries concluídas com um toque e registre a carga exata utilizada em cada exercício.' },
            { icon: History, title: 'Progressive Overload', desc: 'O app lembra a carga que você usou no último treino para você focar apenas em progredir (Volume Load).' },
            { icon: Users, title: 'SpeltaGram', desc: 'Rede social interna para alunos. Compartilhe sua evolução, curta e comente nas postagens da comunidade.' },
            { icon: BookOpen, title: 'Documentação Técnica', desc: 'Acesse o Manual do Usuário e a Documentação Oficial detalhando todas as fórmulas matemáticas utilizadas.' },
            { icon: Palette, title: 'Múltiplos Temas', desc: 'Personalize a interface escolhendo entre os temas Laranja, Verde, Azul ou Dourado.' },
            { icon: ShieldCheck, title: 'Painel do Treinador', desc: 'Área exclusiva para administradores gerenciarem alunos, acompanharem resultados e acessarem a documentação técnica.' }
          ].map((feature, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-surface p-8 rounded-3xl border border-border hover:border-brand/50 transition-colors shadow-sm hover:shadow-md group">
              <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-brand" />
              </div>
              <h3 className="text-xl font-bold text-text-main mb-3">{feature.title}</h3>
              <p className="text-text-muted leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Pricing Section */}
      {!hidePricing && (
        <section className="w-full max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand font-bold text-sm mb-6">
              <Sparkles className="w-5 h-5" />
              7 Dias Grátis
            </div>
            <h2 className="text-4xl font-black text-text-main mb-4">Invista no seu Resultado</h2>
            <p className="text-xl text-text-muted max-w-2xl mx-auto">
              Comece agora com 7 dias de teste totalmente gratuitos. Cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Mensal', price: '14,90', period: '/mês', desc: 'Ideal para conhecer', total: 'Cobrado mensalmente' },
              { name: 'Trimestral', price: '34,90', period: '/trimestre', desc: 'Equivale a R$ 11,63/mês', total: 'Cobrado a cada 3 meses' },
              { name: 'Semestral', price: '59,90', period: '/semestre', desc: 'Equivale a R$ 9,98/mês', total: 'Cobrado a cada 6 meses' },
              { name: 'Anual', price: '99,90', period: '/ano', desc: 'Melhor custo-benefício (R$ 8,32/mês)', total: 'Cobrado anualmente', highlight: true },
            ].map((plan, i) => (
              <div key={i} className={`relative bg-surface rounded-3xl p-8 border-2 transition-transform hover:-translate-y-2 ${plan.highlight ? 'border-brand shadow-xl' : 'border-border shadow-sm'}`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand text-white text-sm font-bold px-4 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}
                <h3 className="text-xl font-bold text-text-main mb-2">{plan.name}</h3>
                <p className="text-sm text-text-muted mb-6 h-10">{plan.desc}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-text-main">R$</span>
                    <span className="text-4xl font-black text-text-main">{plan.price}</span>
                  </div>
                  <p className="text-sm text-text-muted mt-1">{plan.total}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2 text-sm text-text-main">
                    <CheckCircle2 className="w-4 h-4 text-brand" /> Treinos com IA
                  </li>
                  <li className="flex items-center gap-2 text-sm text-text-main">
                    <CheckCircle2 className="w-4 h-4 text-brand" /> Planos Nutricionais
                  </li>
                  <li className="flex items-center gap-2 text-sm text-text-main">
                    <CheckCircle2 className="w-4 h-4 text-brand" /> SpeltaGram
                  </li>
                </ul>

                <button
                  onClick={onStart}
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${plan.highlight ? 'bg-brand text-white hover:bg-brand-hover' : 'bg-bg-main text-text-main border border-border hover:border-brand'}`}
                >
                  Começar 7 Dias Grátis
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="w-full max-w-4xl mx-auto px-4 text-center bg-brand rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Pronto para evoluir com dados reais?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Abandone as fichas de papel e planilhas confusas. Tenha seu treino e nutrição calculados com precisão na palma da mão.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {hasPlan && onContinue && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onContinue}
                className="bg-white text-brand font-black text-xl px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-3"
              >
                Continuar Meu Treino
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className={`${hasPlan ? 'bg-transparent border-2 border-white text-white hover:bg-white/10' : 'bg-white text-brand'} font-black text-xl px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-3`}
            >
              {hasPlan ? 'Criar Novo Treino' : 'Começar 7 Dias Grátis'}
              {!hasPlan && <ArrowRight className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </section>

      {/* Legal Links & Contact */}
      <div className="flex flex-col items-center justify-center gap-4 text-sm text-text-muted mt-8">
        <div className="flex items-center justify-center gap-6">
          {onViewTerms && (
            <button onClick={onViewTerms} className="hover:text-brand transition-colors">
              Termos de Uso
            </button>
          )}
          {onViewPrivacy && (
            <button onClick={onViewPrivacy} className="hover:text-brand transition-colors">
              Política de Privacidade
            </button>
          )}
        </div>
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-xs opacity-70">
          <span>Contato: speltafit@gmail.com</span>
          <span className="hidden md:inline">•</span>
          <span>WhatsApp: (21) 97828-1073</span>
        </div>
      </div>

    </div>
  );
}

