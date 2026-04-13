import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Lock } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export function PrivacyPolicy({ onBack }: Props) {
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
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-text-main">Política de Privacidade</h1>
        </div>

        <div className="prose prose-invert max-w-none text-text-muted space-y-6">
          <p><strong>Última atualização:</strong> 02 de Abril de 2026</p>

          <p>
            A sua privacidade é importante para nós. É política do SpeltaFit respeitar a sua privacidade em relação 
            a qualquer informação sua que possamos coletar no aplicativo SpeltaFit e outros sites que possuímos e operamos.
          </p>

          <h2 className="text-xl font-bold text-text-main mt-8">1. Informações que Coletamos</h2>
          <p>
            Coletamos informações pessoais que você nos fornece voluntariamente ao se registrar no aplicativo, 
            expressar interesse em obter informações sobre nós ou nossos produtos e serviços, ou ao usar o aplicativo.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Dados de Perfil:</strong> Nome, endereço de e-mail, foto de perfil (via Google Login).</li>
            <li><strong>Dados de Saúde e Fitness:</strong> Peso, altura, idade, gênero, nível de atividade, objetivos de condicionamento físico, histórico de lesões e medidas corporais.</li>
            <li><strong>Dados Nutricionais:</strong> Preferências alimentares, alergias, restrições, histórico de refeições e adesão à dieta.</li>
            <li><strong>Fotos de Evolução:</strong> Imagens que você faz upload para acompanhar seu progresso visual.</li>
            <li><strong>Dados de Uso:</strong> Informações sobre como você interage com o aplicativo, treinos concluídos, pontuação de gamificação e interações na comunidade.</li>
          </ul>

          <h2 className="text-xl font-bold text-text-main mt-8">2. Como Usamos Suas Informações</h2>
          <p>
            Usamos as informações que coletamos de várias maneiras, incluindo para:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Fornecer, operar e manter nosso aplicativo.</li>
            <li>Gerar planos de treino e dieta personalizados baseados no seu perfil.</li>
            <li>Melhorar, personalizar e expandir nosso aplicativo.</li>
            <li>Entender e analisar como você usa nosso aplicativo.</li>
            <li>Desenvolver novos produtos, serviços, recursos e funcionalidades.</li>
            <li>Processar suas transações e gerenciar sua assinatura.</li>
          </ul>

          <h2 className="text-xl font-bold text-text-main mt-8">3. Compartilhamento de Dados</h2>
          <p>
            Não compartilhamos suas informações pessoais com terceiros, exceto nos seguintes casos:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Com o seu consentimento:</strong> Podemos compartilhar seus dados com terceiros quando você nos der consentimento explícito para fazê-lo.</li>
            <li><strong>Para processamento de pagamentos:</strong> Compartilhamos dados necessários com gateways de pagamento seguros para processar suas assinaturas.</li>
            <li><strong>Por exigência legal:</strong> Podemos divulgar suas informações quando exigido por lei, intimação ou outro processo legal.</li>
          </ul>

          <h2 className="text-xl font-bold text-text-main mt-8">4. Segurança dos Dados</h2>
          <p>
            Implementamos medidas de segurança técnicas e organizacionais apropriadas projetadas para proteger a 
            segurança de qualquer informação pessoal que processamos. No entanto, lembre-se de que não podemos 
            garantir que a internet em si seja 100% segura.
          </p>

          <h2 className="text-xl font-bold text-text-main mt-8">5. Seus Direitos (LGPD)</h2>
          <p>
            De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Acessar seus dados pessoais.</li>
            <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
            <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou excessivos.</li>
            <li>Solicitar a portabilidade dos dados a outro fornecedor de serviço ou produto.</li>
            <li>Revogar o consentimento a qualquer momento.</li>
          </ul>
          <p>
            Você pode excluir sua conta e todos os dados associados diretamente nas configurações do aplicativo.
          </p>

          <h2 className="text-xl font-bold text-text-main mt-8">6. Contato</h2>
          <p>
            Para exercer seus direitos ou tirar dúvidas sobre esta Política de Privacidade, entre em contato conosco 
            através do suporte no aplicativo.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
