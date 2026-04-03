import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

interface Props {
  onSubscribe: () => void;
  onLogout: () => void;
  isLoading?: boolean;
}

export function Paywall({ onSubscribe, onLogout, isLoading }: Props) {
  return (
    <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <Logo size="xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-main mb-4">
            Desbloqueie seu <span className="text-brand">Potencial Máximo</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            Você está a um passo de transformar seu corpo com inteligência artificial e acompanhamento profissional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Features List */}
          <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-text-main mb-6">O que você ganha:</h2>
            <ul className="space-y-4">
              {[
                'Treinos personalizados com IA',
                'Planos nutricionais e lista de compras',
                'Acompanhamento de evolução visual e medidas',
                'Acesso à comunidade SpeltaGram',
                'Gamificação e recompensas',
                'Suporte direto no app'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-brand shrink-0" />
                  <span className="text-text-main font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Card */}
          <div className="bg-brand rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 font-bold text-sm mb-6">
                <Lock className="w-4 h-4" />
                Acesso Premium
              </div>
              
              <div className="mb-8">
                <span className="text-5xl font-black">R$ 49,90</span>
                <span className="text-white/80 text-lg">/mês</span>
              </div>

              <button
                onClick={onSubscribe}
                disabled={isLoading}
                className="w-full bg-white text-brand hover:bg-gray-50 font-black text-xl px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processando...' : 'Assinar Agora'}
                {!isLoading && <ArrowRight className="w-6 h-6" />}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-white/80 text-sm">
                <ShieldCheck className="w-4 h-4" />
                Pagamento 100% seguro
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={onLogout}
            className="text-text-muted hover:text-text-main transition-colors underline"
          >
            Sair e usar outra conta
          </button>
        </div>
      </div>
    </div>
  );
}
