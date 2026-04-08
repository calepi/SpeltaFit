import React, { useRef } from 'react';
import { 
  Settings, 
  Database, 
  Cpu, 
  Shield, 
  FileText, 
  ChevronRight, 
  CheckCircle2, 
  Code,
  Layers,
  Lock,
  Printer,
  ChevronLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import html2pdf from 'html2pdf.js';

interface TechnicalDocumentationProps {
  onBack?: () => void;
}

export function TechnicalDocumentation({ onBack }: TechnicalDocumentationProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!contentRef.current) return;
    
    const opt = {
      margin:       10,
      filename:     'SpeltaFit_Documentacao_Tecnica.pdf',
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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20" ref={contentRef}>
      {/* Header */}
      <div className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-light to-transparent pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-light text-brand text-xs font-black uppercase tracking-widest">
              Documentação Técnica do Sistema
            </div>
            <div className="flex gap-2 pdf-exclude">
               {onBack && (
                <button 
                  onClick={onBack}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-main text-text-muted hover:text-text-main transition-all font-bold border border-border"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
              )}
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-text-inverse hover:scale-105 transition-all font-bold shadow-none"
              >
                <Printer className="w-4 h-4" />
                Exportar PDF
              </button>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Arquitetura e <br />
            <span className="text-brand">Motores SpeltaFit</span>
          </h1>
          <p className="text-text-muted max-w-2xl text-lg font-medium">
            Detalhamento técnico dos algoritmos determinísticos, estrutura de dados e lógica de negócios da plataforma SpeltaFit v2.0.
          </p>
        </div>
      </div>

      <div className="space-y-12">
        {/* 1. Motores de Regras */}
        <section className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl print:shadow-none print:border-none">
          <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
            <div className="p-4 rounded-2xl bg-brand-light text-brand">
              <Cpu className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight m-0 uppercase">Motores de Regras</h2>
          </div>

          <div className="space-y-10">
            <div>
              <h3 className="text-xl font-black text-text-main mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-brand rounded-full" />
                Motor de Treino (Workout Engine)
              </h3>
              <p className="text-text-muted mb-4">
                O motor de treino é um sistema determinístico baseado em heurísticas de fisiologia do exercício. Ele não utiliza IA generativa, garantindo segurança e reprodutibilidade.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-bg-main border border-border">
                  <h4 className="font-black text-xs uppercase text-brand mb-2">Lógica de Volume e Intensidade</h4>
                  <p className="text-sm text-text-muted mb-2">Calcula o número de séries semanais por grupamento muscular baseado no nível de experiência e ajusta dinamicamente conforme o estresse e sono relatados.</p>
                  <ul className="text-xs text-text-muted list-disc pl-4 space-y-1">
                    <li><strong>Iniciante:</strong> 10-12 séries/semana. Foco em RIR 2-3 (Repetições na Reserva).</li>
                    <li><strong>Intermediário:</strong> 14-18 séries/semana. Foco em RIR 1-2.</li>
                    <li><strong>Avançado:</strong> 20+ séries/semana. Foco em RIR 0-1 e técnicas avançadas (Drop-set, Rest-pause).</li>
                    <li><strong>Ajuste de Estresse:</strong> Se estresse for "Alto" ou sono "Ruim", o volume total é reduzido em 20% para evitar overtraining.</li>
                  </ul>
                </div>
                <div className="p-6 rounded-3xl bg-bg-main border border-border">
                  <h4 className="font-black text-xs uppercase text-brand mb-2">Seleção de Exercícios e Divisão</h4>
                  <p className="text-sm text-text-muted mb-2">Filtra o banco de dados de exercícios (ExerciseDB) cruzando o equipamento disponível com a divisão de treino e limitações físicas.</p>
                  <ul className="text-xs text-text-muted list-disc pl-4 space-y-1">
                    <li><strong>Divisões:</strong> Full Body (Iniciantes/3x semana), Upper/Lower (4x semana), Push/Pull/Legs (5-6x semana).</li>
                    <li><strong>Filtro de Equipamento:</strong> "Academia Completa", "Apenas Halteres", "Peso Corporal".</li>
                    <li><strong>Limitações:</strong> Exclui exercícios que sobrecarregam articulações específicas (ex: Agachamento Livre se houver limitação no joelho).</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Banco de Dados */}
        <section className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl print:shadow-none print:border-none">
          <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-500">
              <Database className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight m-0 uppercase">Estrutura de Dados (Firestore)</h2>
          </div>

          <div className="space-y-6">
            <p className="text-text-muted">A persistência de dados é feita no Google Cloud Firestore, utilizando uma estrutura de subcoleções para isolamento e segurança. O modelo NoSQL permite flexibilidade na evolução dos schemas.</p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-4 font-black text-xs uppercase tracking-wider">Caminho (Path)</th>
                    <th className="py-4 font-black text-xs uppercase tracking-wider">Descrição</th>
                    <th className="py-4 font-black text-xs uppercase tracking-wider">Campos Principais</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-border/50">
                    <td className="py-4 font-mono text-xs">/users/&#123;uid&#125;</td>
                    <td className="py-4">Perfil básico do usuário</td>
                    <td className="py-4">name, email, role, hasSubscription</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 font-mono text-xs">/users/&#123;uid&#125;/data/anamnesis</td>
                    <td className="py-4">Dados físicos e objetivos</td>
                    <td className="py-4">weight, height, goal, experience, limitations</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 font-mono text-xs">/users/&#123;uid&#125;/data/workoutPlan</td>
                    <td className="py-4">Plano de treino atual</td>
                    <td className="py-4">weeklyRoutine, createdAt, trainingStartDate</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 font-mono text-xs">/users/&#123;uid&#125;/data/progress</td>
                    <td className="py-4">Histórico de treinos concluídos</td>
                    <td className="py-4">workouts (array de objetos com data, foco e cargas)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 font-mono text-xs">/posts/&#123;postId&#125;</td>
                    <td className="py-4">Feed Global (SpeltaGram)</td>
                    <td className="py-4">userId, content, imageUrl, likes, comments, createdAt</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-200 text-blue-900 mt-6">
              <h4 className="font-black text-sm uppercase mb-2">Procedimento de Deleção (Wipe)</h4>
              <p className="text-sm">
                Como o Firestore não deleta subcoleções automaticamente ao deletar o documento pai, o botão "Resetar Banco" no painel Admin executa um script em lote que itera sobre todos os usuários e deleta explicitamente cada documento dentro das subcoleções `/data/*` antes de deletar o documento do usuário.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Segurança e Permissões */}
        <section className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl print:shadow-none print:border-none">
          <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-500">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight m-0 uppercase">Segurança e RBAC</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-6 rounded-3xl bg-bg-main border border-border space-y-2">
              <Lock className="w-5 h-5 text-emerald-500" />
              <h4 className="font-black text-sm uppercase">Isolamento de Dados</h4>
              <p className="text-xs text-text-muted">Firestore Security Rules garantem que um usuário só possa ler/escrever em seu próprio subdiretório de dados (`match /users/&#123;userId&#125; &#123; allow read, write: if request.auth.uid == userId; &#125;`).</p>
            </div>
            <div className="p-6 rounded-3xl bg-bg-main border border-border space-y-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h4 className="font-black text-sm uppercase">Admin Role</h4>
              <p className="text-xs text-text-muted">Usuários com role 'admin' (verificado via email hardcoded ou claim no Firestore) possuem permissão global de leitura para monitoramento de todos os alunos.</p>
            </div>
            <div className="p-6 rounded-3xl bg-bg-main border border-border space-y-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h4 className="font-black text-sm uppercase">Validação de Entrada</h4>
              <p className="text-xs text-text-muted">Toda entrada de dados passa por sanitização via regras do Firestore e validação de tipos em tempo de execução no frontend antes de ser persistida.</p>
            </div>
          </div>
          
          <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900">
            <h4 className="font-black text-sm uppercase mb-2">Procedimento de Autenticação</h4>
            <p className="text-sm">
              A autenticação é gerida exclusivamente pelo Firebase Auth utilizando o Google Provider (`signInWithPopup`). O estado de autenticação é monitorado via `onAuthStateChanged` na raiz da aplicação (`App.tsx`), garantindo que rotas protegidas não sejam renderizadas até que o token JWT seja validado.
            </p>
          </div>
        </section>

        {/* 4. Funcionalidades Core */}
        <section className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl print:shadow-none print:border-none">
          <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
            <div className="p-4 rounded-2xl bg-amber-50 text-amber-500">
              <Layers className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight m-0 uppercase">Funcionalidades Core e Procedimentos</h2>
          </div>

          <div className="space-y-6">
             <div className="flex items-start gap-4 p-6 bg-bg-main rounded-3xl border border-border">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Code className="w-4 h-4" /></div>
                <div>
                  <h4 className="font-black text-sm uppercase mb-2">Sistema de Gamificação (Gamification Engine)</h4>
                  <p className="text-sm text-text-muted mb-2">
                    Módulo de engajamento baseado em pontuação (XP), níveis e conquistas (Badges) para incentivar a consistência.
                  </p>
                  <ul className="text-xs text-text-muted list-disc pl-4 space-y-1">
                    <li><strong>Cálculo de XP:</strong> Treino Concluído (+50 XP), Check-in Diário (+10 XP).</li>
                    <li><strong>Níveis:</strong> Progressão logarítmica. Nível = floor(sqrt(XP / 100)). Exige mais esforço para subir em níveis mais altos.</li>
                    <li><strong>Badges:</strong> "Iniciante" (1º treino), "Consistente" (7 dias seguidos), "Mestre do Aço" (Levantou 1000kg no total).</li>
                    <li><strong>Persistência:</strong> Dados salvos em `/users/&#123;uid&#125;/data/gamification`.</li>
                  </ul>
                </div>
             </div>

             <div className="flex items-start gap-4 p-6 bg-bg-main rounded-3xl border border-border">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Code className="w-4 h-4" /></div>
                <div>
                  <h4 className="font-black text-sm uppercase mb-2">Progressão de Carga (Progressive Overload Tracker)</h4>
                  <p className="text-sm text-text-muted mb-2">
                    Sistema de persistência remota (`Firestore`) que compara o volume total (Séries x Reps x Carga) do treino anterior com o atual em tempo real.
                  </p>
                  <ul className="text-xs text-text-muted list-disc pl-4 space-y-1">
                    <li><strong>Procedimento:</strong> Ao iniciar um treino, o sistema busca o último registro correspondente àquele dia/foco.</li>
                    <li><strong>Feedback Visual:</strong> Exibe a carga anterior ao lado do input atual para incentivar a progressão.</li>
                  </ul>
                </div>
             </div>

             <div className="flex items-start gap-4 p-6 bg-bg-main rounded-3xl border border-border">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-500"><Printer className="w-4 h-4" /></div>
                <div>
                  <h4 className="font-black text-sm uppercase mb-2">Exportação de Fichas (PDF Generation)</h4>
                  <p className="text-sm text-text-muted">
                    Utiliza CSS Print Media Queries (`@media print`) para gerar PDFs formatados das fichas de treino e documentação. Oculta elementos de navegação (`print:hidden`) e ajusta margens e cores para garantir legibilidade física e economia de tinta.
                  </p>
                </div>
             </div>
          </div>
        </section>
      </div>

      {/* Footer for Print */}
      <div className="hidden print:block mt-12 pt-8 border-t border-border text-center text-xs text-text-muted">
        Documento Gerado Automaticamente pelo Sistema SpeltaFit v2.0 - {new Date().toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
}
