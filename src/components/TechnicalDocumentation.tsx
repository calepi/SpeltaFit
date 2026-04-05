import React from 'react';
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

interface TechnicalDocumentationProps {
  onBack?: () => void;
}

export function TechnicalDocumentation({ onBack }: TechnicalDocumentationProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 print:p-0 print:m-0 print:max-w-none">
      {/* Header */}
      <div className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl relative overflow-hidden print:shadow-none print:border-none print:rounded-none">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand/5 to-transparent pointer-events-none print:hidden" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 text-brand text-xs font-black uppercase tracking-widest">
              Documentação Técnica do Sistema
            </div>
            <div className="flex gap-2 print:hidden">
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
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-text-inverse hover:scale-105 transition-all font-bold shadow-lg shadow-brand/20"
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
            <div className="p-4 rounded-2xl bg-brand/10 text-brand">
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
                  <h4 className="font-black text-xs uppercase text-brand mb-2">Lógica de Volume</h4>
                  <p className="text-sm">Calcula o número de séries semanais por grupamento muscular baseado no nível (Iniciante: 10-12, Intermediário: 14-18, Avançado: 20+). Ajusta o volume dinamicamente conforme o estresse e sono relatados.</p>
                </div>
                <div className="p-6 rounded-3xl bg-bg-main border border-border">
                  <h4 className="font-black text-xs uppercase text-brand mb-2">Seleção de Exercícios</h4>
                  <p className="text-sm">Filtra o banco de dados de exercícios (ExerciseDB) cruzando o equipamento disponível com a divisão de treino (Push/Pull/Legs, Full Body, etc.) e limitações físicas.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-text-main mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-brand rounded-full" />
                Motor Nutricional (Nutrition Engine)
              </h3>
              <p className="text-text-muted mb-4">
                Utiliza as fórmulas de Mifflin-St Jeor para Taxa Metabólica Basal (TMB) e aplica fatores de atividade física e objetivos térmicos.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-bg-main border border-border">
                  <h4 className="font-black text-xs uppercase text-brand mb-2">Cálculo de Macros</h4>
                  <p className="text-sm">Proteína: 1.8g a 2.5g/kg. Gordura: 0.7g a 1.2g/kg. Carboidratos: Restante calórico. Ajustes automáticos para dietas Low Carb, Cetogênica e Hiperproteica.</p>
                </div>
                <div className="p-6 rounded-3xl bg-bg-main border border-border">
                  <h4 className="font-black text-xs uppercase text-brand mb-2">Protocolo 2026 (Iniciantes)</h4>
                  <p className="text-sm">Motor específico para o Mês 1 e 2 de sedentários, priorizando mudanças comportamentais e hidratação antes da contagem calórica rigorosa.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Banco de Dados */}
        <section className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl print:shadow-none print:border-none">
          <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
            <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500">
              <Database className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight m-0 uppercase">Estrutura de Dados (Firestore)</h2>
          </div>

          <div className="space-y-6">
            <p className="text-text-muted">A persistência de dados é feita no Google Cloud Firestore, utilizando uma estrutura de subcoleções para isolamento e segurança.</p>
            
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
                    <td className="py-4 font-mono text-xs">/users/&#123;uid&#125;/data/dietPlan</td>
                    <td className="py-4">Plano alimentar atual</td>
                    <td className="py-4">calories, macros, meals, recommendations</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-4 font-mono text-xs">/users/&#123;uid&#125;/data/nutritionTracking</td>
                    <td className="py-4">Histórico de peso e adesão</td>
                    <td className="py-4">entries (array de objetos TrackingEntry)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 3. Segurança e Permissões */}
        <section className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl print:shadow-none print:border-none">
          <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight m-0 uppercase">Segurança e RBAC</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-bg-main border border-border space-y-2">
              <Lock className="w-5 h-5 text-emerald-500" />
              <h4 className="font-black text-sm uppercase">Isolamento</h4>
              <p className="text-xs text-text-muted">Firestore Security Rules garantem que um usuário só possa ler/escrever em seu próprio subdiretório de dados.</p>
            </div>
            <div className="p-6 rounded-3xl bg-bg-main border border-border space-y-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h4 className="font-black text-sm uppercase">Admin Role</h4>
              <p className="text-xs text-text-muted">Usuários com role 'admin' possuem permissão global de leitura para monitoramento de todos os alunos.</p>
            </div>
            <div className="p-6 rounded-3xl bg-bg-main border border-border space-y-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <h4 className="font-black text-sm uppercase">Validação</h4>
              <p className="text-xs text-text-muted">Toda entrada de dados passa por sanitização via regras do Firestore e validação de tipos em tempo de execução.</p>
            </div>
          </div>
        </section>

        {/* 4. Funcionalidades Core */}
        <section className="bg-surface border border-border rounded-[2.5rem] p-8 md:p-12 shadow-xl print:shadow-none print:border-none">
          <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500">
              <Layers className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black tracking-tight m-0 uppercase">Funcionalidades Core</h2>
          </div>

          <div className="space-y-4">
             <div className="flex items-start gap-4 p-6 bg-bg-main rounded-3xl border border-border">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Printer className="w-4 h-4" /></div>
                <div>
                  <h4 className="font-black text-sm uppercase">Exportação de Fichas</h4>
                  <p className="text-sm text-text-muted">Utiliza CSS Print Media Queries para gerar PDFs formatados das fichas de treino, garantindo legibilidade física.</p>
                </div>
             </div>
             <div className="flex items-start gap-4 p-6 bg-bg-main rounded-3xl border border-border">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Code className="w-4 h-4" /></div>
                <div>
                  <h4 className="font-black text-sm uppercase">Progressão de Carga</h4>
                  <p className="text-sm text-text-muted">Sistema de cache local e persistência remota que compara o volume total do treino anterior com o atual em tempo real.</p>
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
