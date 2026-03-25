import React from 'react';
import { motion } from 'motion/react';
import { 
  Dumbbell, ArrowRight, Zap, Target, Activity, 
  BrainCircuit, ClipboardList, LineChart, BookOpen, 
  Download, Cloud, Palette, CheckCircle2, Sparkles,
  Smartphone, ShieldCheck
} from 'lucide-react';

import { Logo } from './Logo';

interface Props {
  onStart: () => void;
  hasPlan?: boolean;
  onContinue?: () => void;
}

export function LandingPage({ onStart, hasPlan, onContinue }: Props) {
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
          Seu Personal Trainer <br/>
          <span className="text-brand">Impulsionado por IA</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed">
          O SpeltaFit é uma plataforma inteligente que cria, gerencia e acompanha seus treinos de musculação com precisão científica, adaptando-se perfeitamente à sua rotina e objetivos.
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

      {/* O Papel da IA e Objetivo */}
      <section className="w-full max-w-6xl mx-auto px-4">
        <div className="bg-surface border border-border rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 text-brand font-bold text-sm mb-6">
                <BrainCircuit className="w-5 h-5" />
                Inteligência Artificial Gemini
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-text-main mb-6 leading-tight">
                Como a IA atua no seu resultado?
              </h2>
              <p className="text-lg text-text-muted mb-6 leading-relaxed">
                O coração do SpeltaFit é a inteligência artificial do Google (Gemini). Ela atua como um treinador especialista, analisando dezenas de variáveis do seu perfil para prescrever o treino ideal.
              </p>
              <ul className="space-y-4">
                {[
                  'Analisa sua idade, peso, limitações e nível de experiência.',
                  'Define o volume ideal (séries e repetições) para o seu objetivo.',
                  'Seleciona os melhores exercícios com base nos equipamentos disponíveis.',
                  'Cria uma estratégia de progressão de carga (Overload) segura.'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-brand shrink-0" />
                    <span className="text-text-main font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-bg-main rounded-2xl p-8 border border-border shadow-inner">
              <h3 className="text-2xl font-black text-text-main mb-4">Nosso Objetivo</h3>
              <p className="text-text-muted text-lg leading-relaxed mb-6">
                Democratizar o acesso a treinos de alta qualidade. Queremos que qualquer pessoa, em qualquer lugar, tenha acesso a uma periodização profissional que traga resultados reais, minimizando riscos de lesão e maximizando a adesão ao exercício.
              </p>
              <div className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border">
                <Target className="w-10 h-10 text-brand" />
                <div>
                  <p className="font-bold text-text-main">Foco no Resultado</p>
                  <p className="text-sm text-text-muted">Treino inteligente = Menos tempo, mais ganhos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="w-full max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-text-main mb-4">Como Funciona?</h2>
          <p className="text-xl text-text-muted">Quatro passos simples para transformar seu corpo.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: ClipboardList, title: '1. Anamnese', desc: 'Preencha um formulário detalhado sobre seu corpo, rotina e objetivos.' },
            { icon: Sparkles, title: '2. Geração por IA', desc: 'Nossa IA processa seus dados e monta uma periodização exclusiva em segundos.' },
            { icon: Smartphone, title: '3. Treine e Registre', desc: 'Vá para a academia, acompanhe o treino pelo app e registre suas cargas.' },
            { icon: LineChart, title: '4. Evolua', desc: 'Acompanhe seu progresso, ajuste as cargas e veja os resultados aparecerem.' }
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
          <h2 className="text-4xl font-black text-text-main mb-4">Todas as Funcionalidades</h2>
          <p className="text-xl text-text-muted">Tudo o que você precisa em um único lugar.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            { icon: ClipboardList, title: 'Anamnese Completa', desc: 'Coleta de dados físicos, nível de experiência, status hormonal, limitações articulares e disponibilidade de tempo.' },
            { icon: BrainCircuit, title: 'Prescrição Inteligente', desc: 'Treinos gerados via IA com seleção de exercícios, séries, repetições e métodos avançados (Drop-set, Rest-pause, etc).' },
            { icon: Activity, title: 'Tracker de Treino', desc: 'Acompanhe seu treino em tempo real, marque séries concluídas e registre a carga (kg) utilizada em cada exercício.' },
            { icon: BookOpen, title: 'Biblioteca de Exercícios', desc: 'Guia de execução gerado automaticamente para cada exercício prescrito no seu treino, garantindo a postura correta.' },
            { icon: Download, title: 'Exportação em PDF', desc: 'Gere uma ficha de treino profissional em PDF, pronta para impressão ou para salvar no seu celular.' },
            { icon: Cloud, title: 'Sincronização em Nuvem', desc: 'Seus dados, treinos e histórico de cargas salvos com segurança no Firebase. Acesse de qualquer dispositivo.' },
            { icon: Palette, title: 'Temas Personalizáveis', desc: 'Deixe o app com a sua cara escolhendo entre os temas Laranja (Padrão), Verde, Azul ou Dourado.' },
            { icon: ShieldCheck, title: 'Autenticação Segura', desc: 'Login rápido e seguro utilizando sua conta Google, protegendo todas as suas informações pessoais.' },
            { icon: Target, title: 'Dashboard do Aluno', desc: 'Visão geral do seu perfil, estratégia de treino, diretrizes de monitoramento e plano de progressão de carga.' }
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
            Pronto para levar seu treino a sério?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Junte-se ao SpeltaFit e deixe a inteligência artificial guiar você até os seus melhores resultados.
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
              {hasPlan ? 'Criar Novo Treino' : 'Criar Meu Treino Agora'}
              {!hasPlan && <ArrowRight className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </section>

    </div>
  );
}

