import React, { useRef } from 'react';
import { 
  Book, 
  Zap, 
  Dumbbell, 
  TrendingUp, 
  Users, 
  Shield, 
  Settings, 
  Info, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  ArrowRight,
  Scale,
  Clock,
  Flame,
  Search,
  MessageSquare,
  Printer,
  FileText,
  Apple,
  Trophy,
  Bell
} from 'lucide-react';
import { motion } from 'motion/react';
import html2pdf from 'html2pdf.js';

export function UserManual() {
  const [activeSection, setActiveSection] = React.useState('intro');
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!contentRef.current) return;
    
    const opt = {
      margin:       10,
      filename:     'SpeltaFit_Manual_do_Usuario.pdf',
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    // Hide buttons before generating PDF
    const buttons = contentRef.current.querySelectorAll('.pdf-exclude');
    buttons.forEach(btn => (btn as HTMLElement).style.display = 'none');

    html2pdf().set(opt).from(contentRef.current).save().then(() => {
      // Restore buttons after generating PDF
      buttons.forEach(btn => (btn as HTMLElement).style.display = '');
    });
  };

  const sections = [
    { id: 'intro', label: 'Introdução', icon: <Book className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance Humana', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'anamnesis', label: 'Motores e Anamnese', icon: <Zap className="w-4 h-4" /> },
    { id: 'workout', label: 'Guia de Treino', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'nutrition', label: 'SpeltaNutri', icon: <Apple className="w-4 h-4" /> },
    { id: 'evolution', label: 'Evolução e Dados', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'gamification', label: 'Gamificação', icon: <Trophy className="w-4 h-4" /> },
    { id: 'community', label: 'SpeltaGram', icon: <Users className="w-4 h-4" /> },
    { id: 'reminders', label: 'Lembretes', icon: <Bell className="w-4 h-4" /> },
    { id: 'admin', label: 'Painel do Treinador', icon: <Shield className="w-4 h-4" /> },
    { id: 'config', label: 'Configuração Técnica', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20" ref={contentRef}>
      {/* Header */}
      <div className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-light to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-light text-brand text-xs font-black uppercase tracking-widest">
              Documentação Oficial
            </div>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-text-inverse hover:scale-105 transition-all font-bold shadow-none pdf-exclude"
            >
              <Printer className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Manual do Usuário <br />
            <span className="text-brand">SpeltaFit v2.0</span>
          </h1>
          <p className="text-text-muted max-w-2xl text-lg font-medium">
            Este é o guia completo e exaustivo sobre como dominar a ferramenta SpeltaFit. 
            Aqui você aprenderá desde os conceitos básicos até as lógicas avançadas dos nossos motores determinísticos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2 sticky top-24 h-fit">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                activeSection === s.id 
                  ? 'bg-brand text-text-inverse shadow-none scale-[1.02]' 
                  : 'bg-surface border border-border text-text-muted hover:border-brand/50 hover:text-brand'
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl min-h-[600px]">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="prose prose-brand max-w-none"
          >
            {activeSection === 'intro' && <IntroSection />}
            {activeSection === 'performance' && <PerformanceSection />}
            {activeSection === 'anamnesis' && <AnamnesisSection />}
            {activeSection === 'workout' && <WorkoutSection />}
            {activeSection === 'nutrition' && <NutritionSection />}
            {activeSection === 'evolution' && <EvolutionSection />}
            {activeSection === 'gamification' && <GamificationSection />}
            {activeSection === 'community' && <CommunitySection />}
            {activeSection === 'reminders' && <RemindersSection />}
            {activeSection === 'admin' && <AdminSection />}
            {activeSection === 'config' && <ConfigSection />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode, icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
      <div className="p-4 rounded-2xl bg-brand-light text-brand">
        {icon}
      </div>
      <h2 className="text-3xl font-black tracking-tight m-0 uppercase">{children}</h2>
    </div>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl font-black text-text-main mt-10 mb-4 flex items-center gap-2">
    <div className="w-2 h-6 bg-brand rounded-full" />
    {children}
  </h3>;
}

function InfoBox({ title, children, type = 'info' }: { title: string, children: React.ReactNode, type?: 'info' | 'warning' | 'success' }) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900'
  };
  const icons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
  };

  return (
    <div className={`p-6 rounded-3xl border-2 ${styles[type]} my-6 space-y-2`}>
      <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs">
        {icons[type]}
        {title}
      </div>
      <div className="text-sm font-medium leading-relaxed opacity-80">
        {children}
      </div>
    </div>
  );
}

function IntroSection() {
  return (
    <div>
      <SectionTitle icon={<Book className="w-6 h-6" />}>Bem-vindo ao SpeltaFit</SectionTitle>
      <p className="text-lg leading-relaxed text-text-muted">
        O SpeltaFit não é apenas um aplicativo de treino; é um sistema de gestão de performance humana. 
        Nossa filosofia baseia-se em três pilares: <strong>Dados</strong>, <strong>Consistência</strong> e <strong>Algoritmos Determinísticos</strong>.
      </p>
      
      <SubTitle>O que esperar deste manual?</SubTitle>
      <p>
        Este documento foi expandido para cobrir todas as nuances da ferramenta. Você aprenderá como nossos motores de regras tomam decisões, 
        como interpretar os gráficos de evolução e como utilizar o motor de substituição nutricional para nunca mais 
        sair da dieta por falta de opção.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div className="p-6 rounded-3xl bg-bg-main border border-border space-y-2">
          <h4 className="font-black text-brand text-sm uppercase">Para o Aluno</h4>
          <p className="text-xs text-text-muted">Foco em execução, registro de cargas e acompanhamento de resultados diários.</p>
        </div>
        <div className="p-6 rounded-3xl bg-bg-main border border-border space-y-2">
          <h4 className="font-black text-brand text-sm uppercase">Para o Treinador</h4>
          <p className="text-xs text-text-muted">Foco em análise de dados, monitoramento de adesão e ajustes estratégicos.</p>
        </div>
      </div>
    </div>
  );
}

function AnamnesisSection() {
  return (
    <div>
      <SectionTitle icon={<Zap className="w-6 h-6" />}>Motores e Anamnese</SectionTitle>
      <p>
        A Anamnese é o ponto de partida. Sem dados precisos aqui, os motores de regras não conseguem gerar um plano otimizado.
      </p>

      <SubTitle>Como o sistema calcula seu treino?</SubTitle>
      <ul className="space-y-4 list-none p-0">
        <li className="flex gap-3">
          <div className="mt-1"><CheckCircle2 className="w-4 h-4 text-brand" /></div>
          <div>
            <span className="font-bold">Volume de Treino:</span> Calculado com base na sua experiência e nível de estresse. 
            Se você está muito estressado e dorme mal, o motor reduz o volume para evitar o overtraining.
          </div>
        </li>
        <li className="flex gap-3">
          <div className="mt-1"><CheckCircle2 className="w-4 h-4 text-brand" /></div>
          <div>
            <span className="font-bold">Seleção de Exercícios:</span> Baseada no seu equipamento disponível. 
            Se você selecionar "Home Gym", o algoritmo priorizará halteres e elásticos em vez de máquinas complexas.
          </div>
        </li>
        <li className="flex gap-3">
          <div className="mt-1"><CheckCircle2 className="w-4 h-4 text-brand" /></div>
          <div>
            <span className="font-bold">Frequência Semanal:</span> Ajustada para garantir que cada grupamento muscular 
            seja estimulado pelo menos 2x na semana (frequência ótima para hipertrofia).
          </div>
        </li>
      </ul>

      <InfoBox title="Exemplo Prático" type="success">
        Um usuário <strong>Iniciante</strong> com <strong>Alto Estresse</strong> receberá um treino com menos séries por exercício (ex: 2 séries), 
        focando em técnica. Já um <strong>Avançado</strong> com <strong>Baixo Estresse</strong> receberá técnicas avançadas como Drop-sets e RPE 9.
      </InfoBox>
    </div>
  );
}

function WorkoutSection() {
  return (
    <div>
      <SectionTitle icon={<Dumbbell className="w-6 h-6" />}>Guia de Treino</SectionTitle>
      
      <SubTitle>O Workout Tracker</SubTitle>
      <p>Esta é a tela que você usará na academia. Ela foi desenhada para ser rápida e intuitiva.</p>
      
      <div className="space-y-6">
        <div className="p-6 rounded-3xl bg-bg-main border border-border">
          <h4 className="font-black text-sm uppercase mb-2">1. Registro de Cargas</h4>
          <p className="text-sm text-text-muted">
            Ao lado de cada exercício, existe um campo para digitar o peso. 
            <strong>Dica de Ouro:</strong> Sempre registre a carga. No próximo treino, o SpeltaFit mostrará quanto você pegou 
            anteriormente, incentivando a <strong>Sobrecarga Progressiva</strong>.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-bg-main border border-border">
          <h4 className="font-black text-sm uppercase mb-2">2. Entendendo o RPE</h4>
          <p className="text-sm text-text-muted">
            RPE significa *Rate of Perceived Exertion* (Escala de Esforço Percebido).
            - <strong>RPE 10:</strong> Esforço máximo, zero repetições na reserva.
            - <strong>RPE 8:</strong> Esforço alto, você conseguiria fazer mais 2 repetições.
            - <strong>RPE 6:</strong> Esforço moderado, aquecimento ou técnica.
          </p>
        </div>
      </div>

      <SubTitle>Check-in e Finalização</SubTitle>
      <p>
        Nunca saia da academia sem clicar em <strong>"Finalizar Check-in"</strong>. É neste momento que:
        1. O sistema salva seu peso do dia.
        2. O motor registra sua consistência e XP.
        3. O treino "A" vira "B" para o dia seguinte.
      </p>

      <InfoBox title="Configuração de Descanso" type="info">
        O tempo de descanso sugerido pelo sistema (ex: 60s ou 120s) não é aleatório. 
        Exercícios compostos (Agachamento) têm descansos maiores para recuperação do sistema nervoso central.
      </InfoBox>
    </div>
  );
}

function EvolutionSection() {
  return (
    <div>
      <SectionTitle icon={<TrendingUp className="w-6 h-6" />}>Evolução e Dados</SectionTitle>
      <p>Dados sem interpretação são apenas números. O SpeltaFit interpreta para você.</p>

      <SubTitle>Interpretando os Gráficos</SubTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h5 className="font-black text-xs uppercase text-brand">Gráfico de Peso</h5>
          <p className="text-sm text-text-muted">
            Não se assuste com oscilações diárias. Foque na <strong>tendência semanal</strong>. 
            O sistema calcula médias móveis para ignorar picos isolados causados por retenção hídrica.
          </p>
        </div>
        <div className="space-y-2">
          <h5 className="font-black text-xs uppercase text-brand">Gráfico de Consistência</h5>
          <p className="text-sm text-text-muted">
            Sua meta deve ser manter acima de <strong>85%</strong>. Abaixo disso, os resultados fisiológicos 
            começam a ser comprometidos.
          </p>
        </div>
      </div>

      <SubTitle>Insights do Sistema</SubTitle>
      <p>
        Abaixo dos gráficos, você verá cards de "Insights". Eles são gerados cruzando seus dados de treino 
        com seus dados de peso usando regras pré-definidas.
      </p>
      <InfoBox title="Exemplo de Insight" type="info">
        "Seu peso subiu 500g, mas suas cargas no Supino e Agachamento subiram 10%. 
        Isso indica ganho de massa magra (recomposição corporal). Continue assim!"
      </InfoBox>
    </div>
  );
}

function CommunitySection() {
  return (
    <div>
      <SectionTitle icon={<Users className="w-6 h-6" />}>SpeltaGram</SectionTitle>
      <p>A comunidade é o que mantém a chama acesa nos dias difíceis.</p>

      <SubTitle>Funcionalidades Sociais</SubTitle>
      <ul className="space-y-4 list-none p-0">
        <li className="flex gap-3">
          <div className="mt-1"><MessageSquare className="w-4 h-4 text-brand" /></div>
          <div><strong>Feed Global:</strong> Veja postagens de todos os alunos da plataforma. É o lugar perfeito para buscar inspiração.</div>
        </li>
        <li className="flex gap-3">
          <div className="mt-1"><MessageSquare className="w-4 h-4 text-brand" /></div>
          <div><strong>Minhas Postagens:</strong> Uma área reservada para você visualizar apenas o seu histórico de fotos e conquistas.</div>
        </li>
        <li className="flex gap-3">
          <div className="mt-1"><MessageSquare className="w-4 h-4 text-brand" /></div>
          <div><strong>Comentários e Curtidas:</strong> Interaja com outros alunos. O apoio mútuo é um dos pilares do sucesso no SpeltaFit.</div>
        </li>
      </ul>

      <InfoBox title="Regras da Comunidade" type="warning">
        Mantenha o ambiente positivo. O SpeltaGram é um local de suporte mútuo para saúde e bem-estar. 
        Postagens ofensivas serão removidas pelo administrador.
      </InfoBox>
    </div>
  );
}

function PerformanceSection() {
  return (
    <div>
      <SectionTitle icon={<TrendingUp className="w-6 h-6" />}>Performance Humana</SectionTitle>
      <p className="text-lg leading-relaxed text-text-muted">
        O SpeltaFit não é apenas um aplicativo de treino; é um sistema de gestão de performance humana. 
        Nossa filosofia baseia-se em três pilares: <strong>Dados</strong>, <strong>Consistência</strong> e <strong>Algoritmos Determinísticos</strong>.
      </p>

      <div className="space-y-4 my-8">
        <div className="bg-bg-main p-6 rounded-2xl border border-border">
          <h3 className="font-bold text-text-main mb-2">1. Dados: A Base da Evolução</h3>
          <p className="text-sm text-text-muted">
            Sem medição, não há gestão. Ao registrar cada carga e cada série, você fornece ao sistema os dados necessários para ajustar seu volume e intensidade de forma precisa.
          </p>
        </div>
        <div className="bg-bg-main p-6 rounded-2xl border border-border">
          <h3 className="font-bold text-text-main mb-2">2. Consistência: O Fator Multiplicador</h3>
          <p className="text-sm text-text-muted">
            O melhor treino do mundo não funciona se não for executado. O SpeltaFit monitora sua frequência semanal para garantir que você esteja no caminho certo.
          </p>
        </div>
        <div className="bg-bg-main p-6 rounded-2xl border border-border">
          <h3 className="font-bold text-text-main mb-2">3. Algoritmos: O Cérebro do Sistema</h3>
          <p className="text-sm text-text-muted">
            Nossos motores determinísticos analisam seu perfil antropométrico, nível de estresse e qualidade do sono para sugerir ajustes que otimizam sua recuperação e ganho de massa.
          </p>
        </div>
      </div>

      <div className="bg-surface p-8 rounded-[2.5rem] border border-border shadow-inner">
        <h3 className="font-black text-brand uppercase tracking-widest text-sm mb-6">Dicas de Ouro para Resultados Máximos:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h4 className="font-bold text-text-main">Sono é Treino</h4>
            <p className="text-sm text-text-muted">Tente dormir entre 7 a 9 horas por noite. É durante o sono profundo que ocorre a maior parte da síntese proteica e liberação de GH.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-text-main">Hidratação Constante</h4>
            <p className="text-sm text-text-muted">Músculos são compostos por cerca de 75% de água. Uma desidratação leve de 2% pode reduzir sua força em até 10%.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-text-main">Progressão de Carga</h4>
            <p className="text-sm text-text-muted">Não tente aumentar o peso em todo treino. Às vezes, progredir significa fazer a mesma carga com melhor técnica ou menor tempo de descanso.</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-text-main">Mente e Músculo</h4>
            <p className="text-sm text-text-muted">Foque na contração muscular, não apenas em mover o peso do ponto A ao ponto B. A conexão mente-músculo é real e comprovada.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NutritionSection() {
  return (
    <div>
      <SectionTitle icon={<Apple className="w-6 h-6" />}>SpeltaNutri</SectionTitle>
      <p>
        O SpeltaNutri é o nosso motor de inteligência nutricional. Ele cria planos alimentares adaptados à sua rotina, orçamento e objetivos.
      </p>

      <SubTitle>Como funciona?</SubTitle>
      <ul className="space-y-4 list-none p-0">
        <li className="flex gap-3">
          <div className="mt-1"><CheckCircle2 className="w-4 h-4 text-brand" /></div>
          <div>
            <span className="font-bold">Anamnese Nutricional:</span> Você informa seu objetivo (emagrecimento, hipertrofia), tipo de dieta (flexível, low-carb, vegana), alergias, orçamento e tempo para cozinhar.
          </div>
        </li>
        <li className="flex gap-3">
          <div className="mt-1"><CheckCircle2 className="w-4 h-4 text-brand" /></div>
          <div>
            <span className="font-bold">Geração do Plano:</span> O motor calcula seus macros e calorias diárias e monta refeições práticas.
          </div>
        </li>
        <li className="flex gap-3">
          <div className="mt-1"><CheckCircle2 className="w-4 h-4 text-brand" /></div>
          <div>
            <span className="font-bold">Substituições Inteligentes:</span> Cansou de frango? Clique no botão de "Substituir" ao lado do alimento e o sistema calculará automaticamente a quantidade exata de outra proteína (ex: carne, ovo, whey) para manter os mesmos macros da refeição.
          </div>
        </li>
      </ul>

      <InfoBox title="Acompanhamento (Tracking)" type="success">
        Na aba de Nutrição, você pode registrar seu peso diário e sua adesão à dieta (0 a 100%). O sistema cruzará esses dados com seus treinos para gerar insights poderosos sobre sua recomposição corporal.
      </InfoBox>
    </div>
  );
}

function GamificationSection() {
  return (
    <div>
      <SectionTitle icon={<Trophy className="w-6 h-6" />}>Gamificação e Ranking</SectionTitle>
      <p>A consistência é recompensada. Transformamos seu esforço diário em um jogo onde você é o personagem principal.</p>

      <SubTitle>Sistema de Pontuação (XP)</SubTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-bg-main border border-border rounded-2xl flex items-center justify-between">
          <span className="font-bold">Treino Concluído</span>
          <span className="text-brand font-black">+50 XP</span>
        </div>
        <div className="p-4 bg-bg-main border border-border rounded-2xl flex items-center justify-between">
          <span className="font-bold">Check-in Diário</span>
          <span className="text-brand font-black">+10 XP</span>
        </div>
        <div className="p-4 bg-bg-main border border-border rounded-2xl flex items-center justify-between">
          <span className="font-bold">Bater Meta de Água</span>
          <span className="text-brand font-black">+15 XP</span>
        </div>
        <div className="p-4 bg-bg-main border border-border rounded-2xl flex items-center justify-between">
          <span className="font-bold">Refeição 100% na Dieta</span>
          <span className="text-brand font-black">+20 XP</span>
        </div>
      </div>

      <SubTitle>Níveis e Conquistas (Badges)</SubTitle>
      <p>
        Conforme você acumula XP, seu nível sobe. Além disso, você desbloqueia medalhas exclusivas por marcos importantes, como "7 dias seguidos de treino" ou "1000kg levantados no total".
      </p>

      <InfoBox title="Ranking Global" type="info">
        Compare seu nível com outros alunos na aba "Ranking". A competição amigável é um excelente motivador para os dias em que a preguicia bater.
      </InfoBox>
    </div>
  );
}

function RemindersSection() {
  return (
    <div>
      <SectionTitle icon={<Bell className="w-6 h-6" />}>Lembretes e Alarmes</SectionTitle>
      <p>O SpeltaFit ajuda você a manter a disciplina automatizando seus avisos diários.</p>

      <SubTitle>Configurando Alertas</SubTitle>
      <p>Na aba de Lembretes (ícone de sino no menu), você pode ativar notificações para:</p>
      <ul className="space-y-2 list-disc pl-6 text-text-muted">
        <li>Beber Água (intervalos regulares)</li>
        <li>Hora do Treino</li>
        <li>Refeições Planejadas (sincronizado com seu SpeltaNutri)</li>
        <li>Hora de Dormir (Higiene do Sono)</li>
      </ul>

      <InfoBox title="Permissões do Navegador" type="warning">
        Para que os alarmes funcionem, você precisa permitir que o site envie notificações no seu navegador ou celular. O sistema solicitará essa permissão no primeiro uso.
      </InfoBox>
    </div>
  );
}

function AdminSection() {
  return (
    <div>
      <SectionTitle icon={<Shield className="w-6 h-6" />}>Painel do Treinador</SectionTitle>
      <p>Seção exclusiva para o gestor da plataforma.</p>

      <SubTitle>Gestão de Alunos</SubTitle>
      <p>
        O administrador tem uma visão "olho de Deus" sobre o progresso de todos.
      </p>
      <div className="space-y-4">
        <div className="p-4 bg-bg-main border border-border rounded-2xl">
          <span className="font-bold">Monitoramento em Tempo Real:</span> Veja quem treinou hoje e quais cargas foram utilizadas.
        </div>
        <div className="p-4 bg-bg-main border border-border rounded-2xl">
          <span className="font-bold">Ajuste de Planos:</span> O treinador pode intervir e modificar um treino ou dieta 
          caso perceba que o aluno está estagnado.
        </div>
      </div>

      <SubTitle>Reset de Fábrica (Wipe Database)</SubTitle>
      <div className="p-6 rounded-3xl bg-red-50 border border-red-200 text-red-900 mt-4">
        <h4 className="font-black text-sm uppercase mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Atenção: Ação Irreversível
        </h4>
        <p className="text-sm">
          O botão <strong>"Resetar Banco"</strong> apaga absolutamente todos os dados gerados pelos usuários (Treinos, Dietas, Fotos, Posts no SpeltaGram, XP, etc). 
          Ele é útil para reiniciar turmas ou limpar o sistema após um período de testes. 
          <br/><br/>
          <strong>Nota de Segurança:</strong> A conta do administrador também tem seus dados limpos, mas o acesso ao painel é mantido intacto. Os motores e o banco de alimentos não são afetados.
        </p>
      </div>
    </div>
  );
}

function ConfigSection() {
  return (
    <div>
      <SectionTitle icon={<Settings className="w-6 h-6" />}>Configuração Técnica</SectionTitle>
      <p>Para garantir que o SpeltaFit funcione perfeitamente no seu dispositivo.</p>

      <SubTitle>Autorização de Domínio</SubTitle>
      <p>
        Se você receber um erro de "Unauthorized Domain" ao tentar logar, siga estes passos:
      </p>
      <ol className="list-decimal pl-6 space-y-2">
        <li>Acesse o Console do Firebase.</li>
        <li>Vá em Authentication &gt; Settings &gt; Authorized Domains.</li>
        <li>Adicione o domínio que aparece na barra de endereços do seu navegador.</li>
      </ol>

      <SubTitle>Limpeza de Cache</SubTitle>
      <p>
        Caso a interface pareça "travada", você pode usar o botão de <strong>Reset</strong> na aba de treino. 
        Isso limpará os dados locais e forçará uma nova sincronização com o banco de dados.
      </p>

      <InfoBox title="Documentação Técnica" type="info">
        Para desenvolvedores e gestores que desejam entender os motores de regras e a estrutura do banco de dados, 
        acesse a <strong>Documentação Técnica Completa</strong> no Painel do Administrador.
      </InfoBox>

      <InfoBox title="Suporte Técnico" type="warning">
        Em caso de erros críticos de permissão (Permission Denied), verifique se o seu e-mail 
        está corretamente cadastrado na coleção `users` do Firestore.
      </InfoBox>
    </div>
  );
}
