import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Logo } from './Logo';

interface Props {
  onSubscribe: () => void;
  onLogout: () => void;
  isLoading?: boolean;
}

export function Paywall({ onSubscribe, onLogout, isLoading }: Props) {
  const [selectedPlan, setSelectedPlan] = useState('annual');

  const plans = [
    { id: 'monthly', name: 'Mensal', price: '14,90', period: '/mês', desc: 'Ideal para conhecer', total: 'Cobrado mensalmente' },
    { id: 'quarterly', name: 'Trimestral', price: '34,90', period: '/trimestre', desc: 'Equivale a R$ 11,63/mês', total: 'Cobrado a cada 3 meses' },
    { id: 'semiannual', name: 'Semestral', price: '59,90', period: '/semestre', desc: 'Equivale a R$ 9,98/mês', total: 'Cobrado a cada 6 meses' },
    { id: 'annual', name: 'Anual', price: '99,90', period: '/ano', desc: 'Melhor custo-benefício (R$ 8,32/mês)', total: 'Cobrado anualmente', highlight: true },
  ];

  return (
    <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <Logo size="xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-main mb-4">
            Desbloqueie seu <span className="text-brand">Potencial Máximo</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto">
            Seu período de teste acabou. Escolha um plano para continuar transformando seu corpo com inteligência artificial e acompanhamento profissional.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
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

          {/* Pricing Plans */}
          <div className="flex flex-col gap-4">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative bg-surface border-2 rounded-2xl p-5 cursor-pointer transition-all ${selectedPlan === plan.id ? 'border-brand shadow-lg scale-[1.02]' : 'border-border hover:border-brand/50'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
                    MAIS POPULAR
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-text-main">{plan.name}</h3>
                    <p className="text-sm text-text-muted">{plan.desc}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-text-main">R$</span>
                      <span className="text-2xl font-black text-text-main">{plan.price}</span>
                    </div>
                    <p className="text-xs text-text-muted">{plan.total}</p>
                  </div>
                </div>
                {selectedPlan === plan.id && (
                  <div className="absolute inset-0 border-2 border-brand rounded-2xl pointer-events-none"></div>
                )}
              </div>
            ))}

            <button
              onClick={onSubscribe}
              disabled={isLoading}
              className="w-full mt-4 bg-brand text-white hover:bg-brand-hover font-black text-xl px-8 py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processando...' : 'Assinar Agora'}
              {!isLoading && <ArrowRight className="w-6 h-6" />}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-text-muted text-sm">
              <ShieldCheck className="w-4 h-4" />
              Pagamento 100% seguro via Stripe
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
