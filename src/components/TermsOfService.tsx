import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export function TermsOfService({ onBack }: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-brand transition-colors mb-8"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-border rounded-3xl p-8 md:p-12 shadow-xl"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-text-main">Termos de Uso</h1>
        </div>

        <div className="prose prose-invert max-w-none text-text-muted space-y-6">
          <p><strong>Última atualização:</strong> 02 de Abril de 2026</p>

          <h2 className="text-xl font-bold text-text-main mt-8">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar o aplicativo SpeltaFit, você concorda em cumprir e ficar vinculado a estes Termos de Uso. 
            Se você não concordar com qualquer parte destes termos, não deverá usar nossos serviços.
          </p>

          <h2 className="text-xl font-bold text-text-main mt-8">2. Descrição do Serviço</h2>
          <p>
            O SpeltaFit é uma plataforma digital que fornece planos de treinamento físico, orientações nutricionais, 
            ferramentas de acompanhamento de evolução e interação social (SpeltaGram). Os resultados podem variar 
            de pessoa para pessoa e dependem do comprometimento individual.
          </p>

          <h2 className="text-xl font-bold text-text-main mt-8">3. Isenção de Responsabilidade Médica</h2>
          <p>
            As informações fornecidas pelo SpeltaFit não substituem o aconselhamento médico profissional, 
            diagnóstico ou tratamento. Sempre procure o conselho de seu médico ou outro profissional de saúde 
            qualificado com qualquer dúvida que possa ter sobre uma condição médica ou antes de iniciar qualquer 
            novo programa de exercícios ou dieta.
          </p>

          <h2 className="text-xl font-bold text-text-main mt-8">4. Assinaturas e Pagamentos</h2>
          <p>
            O acesso completo às funcionalidades do SpeltaFit requer uma assinatura ativa. Os pagamentos são 
            processados de forma segura através de nossos parceiros de pagamento. As assinaturas são renovadas 
            automaticamente, a menos que canceladas antes do final do período de cobrança atual.
          </p>

          <h2 className="text-xl font-bold text-text-main mt-8">5. Conduta do Usuário</h2>
          <p>
            Você concorda em usar o SpeltaFit apenas para fins legais. É estritamente proibido publicar conteúdo 
            ofensivo, discriminatório, ou que viole os direitos de terceiros na nossa comunidade (SpeltaGram). 
            Reservamo-nos o direito de suspender ou encerrar contas que violem estas regras.
          </p>

          <h2 className="text-xl font-bold text-text-main mt-8">6. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo, design, gráficos, compilação, tradução magnética, conversão digital e outros assuntos 
            relacionados ao SpeltaFit são protegidos por direitos autorais e marcas registradas aplicáveis.
          </p>

          <h2 className="text-xl font-bold text-text-main mt-8">7. Modificações dos Termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os usuários sobre 
            mudanças significativas. O uso contínuo do aplicativo após tais modificações constitui sua aceitação 
            dos novos termos.
          </p>

          <h2 className="text-xl font-bold text-text-main mt-8">8. Contato</h2>
          <p>
            Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco através do suporte no aplicativo.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
