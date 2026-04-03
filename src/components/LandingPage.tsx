import React from 'react';
import { motion } from 'motion/react';
import { 
  Dumbbell, ArrowRight, Zap, Target, Activity, 
  BrainCircuit, ClipboardList, LineChart, BookOpen, 
  Download, Cloud, Palette, CheckCircle2, Sparkles,
  Smartphone, ShieldCheck, Edit3, History
} from 'lucide-react';

import { Logo } from './Logo';

interface Props {
  onStart: () => void;
  hasPlan?: boolean;
  onContinue?: () => void;
  onViewTerms?: () => void;
  onViewPrivacy?: () => void;
}

export function LandingPage({ onStart, hasPlan, onContinue, onViewTerms, onViewPrivacy }: Props) {
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
          Sua Evolução <br/>
          <span className="text-brand">Sistema Inteligente</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed">
          O SpeltaFit cria, gerencia e adapta seus treinos com precisão. Registre cargas, edite exercícios e acompanhe seu progresso real a cada sessão.
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
            {hasPlan ? 'Criar Novo Treino' : 'Começar Minha Avaliação'}
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
                <BrainCircuit className="w-5 h-5" />
                Sistema de Treinamento Inteligente
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-text-main mb-6 leading-tight">
                Treinos que se Adaptam a Você
              </h2>
              <p className="text-lg text-text-muted mb-6 leading-relaxed">
                Nosso sistema não apenas cria o treino inicial, ele entende seu perfil para prescrever a periodização ideal, permitindo que você ajuste e evolua com o tempo.
              </p>
              <ul className="space-y-4">
                {[
                  'Prescrição baseada em idade, peso, limitações e experiência.',
                  'Volume e intensidade calculados para o seu objetivo específico.',
                  'Flexibilidade total: edite exercícios, séries e repetições a qualquer momento.',
                  'Acompanhamento de carga (Overload) para garantir progressão contínua.'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-brand shrink-0" />
                    <span className="text-text-main font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-bg-main rounded-2xl p-8 border border-border shadow-inner">
              <h3 className="text-2xl font-black text-text-main mb-4">Controle Total</h3>
              <p className="text-text-muted text-lg leading-relaxed mb-6">
                O sistema sugere, mas você no comando. Troque exercícios que não se adaptaram bem, ajuste o número de séries no dia que estiver mais cansado e registre cada kg levantado para ver sua evolução real.
              </p>
              <div className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border">
                <Edit3 className="w-10 h-10 text-brand" />
                <div>
                  <p className="font-bold text-text-main">100% Editável</p>
                  <p className="text-sm text-text-muted">Seu treino, suas regras. Ajuste tudo na hora.</p>
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
            { icon: ClipboardList, title: '1. Avaliação', desc: 'Conte sobre você, seus objetivos e limitações para o sistema.' },
            { icon: Sparkles, title: '2. Prescrição', desc: 'Receba um plano completo, periodizado e focado no seu objetivo.' },
            { icon: Activity, title: '3. Execução', desc: 'Vá para a academia, marque as séries feitas e anote as cargas.' },
            { icon: LineChart, title: '4. Progressão', desc: 'Acompanhe seu histórico, faça check-ins diários e evolua.' }
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
          <h2 className="text-4xl font-black text-text-main mb-4">Arsenal Completo</h2>
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
            { icon: BrainCircuit, title: 'Sistema Personalizado', desc: 'Treinos gerados com seleção inteligente de exercícios, séries e métodos avançados.' },
            { icon: Edit3, title: 'Edição Livre', desc: 'Não gostou de um exercício? Troque. Quer fazer mais séries? Adicione. Você tem controle total sobre o plano gerado.' },
            { icon: Activity, title: 'Tracker Interativo', desc: 'Marque séries concluídas com um toque e registre a carga exata utilizada em cada exercício.' },
            { icon: History, title: 'Histórico de Cargas', desc: 'O app lembra a carga que você usou no último treino para você focar apenas em progredir.' },
            { icon: BookOpen, title: 'Guia de Execução', desc: 'Dúvidas de como fazer? Acesse instruções detalhadas para cada exercício prescrito.' },
            { icon: CheckCircle2, title: 'Check-in Diário', desc: 'Registre seu esforço (PSE) e anotações após cada treino para monitorar sua recuperação.' },
            { icon: Cloud, title: 'Sincronização em Nuvem', desc: 'Seus dados, treinos e histórico salvos com segurança. Acesse de qualquer dispositivo.' },
            { icon: Palette, title: 'Múltiplos Temas', desc: 'Personalize a interface escolhendo entre os temas Laranja, Verde, Azul ou Dourado.' },
            { icon: ShieldCheck, title: 'Painel do Treinador', desc: 'Área exclusiva para administradores gerenciarem alunos e acompanharem resultados.' }
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

      {/* Bottom CTA */}
      <section className="w-full max-w-4xl mx-auto px-4 text-center bg-brand rounded-[3rem] p-12 md:p-20 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
            Pronto para evoluir de verdade?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Abandone as fichas de papel e planilhas confusas. Tenha seu treino inteligente na palma da mão.
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
              {hasPlan ? 'Criar Novo Treino' : 'Começar Agora'}
              {!hasPlan && <ArrowRight className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </section>

      {/* Legal Links */}
      <div className="flex items-center justify-center gap-6 text-sm text-text-muted mt-8">
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

    </div>
  );
}

