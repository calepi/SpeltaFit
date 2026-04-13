import React from 'react';
import { Lightbulb, CheckCircle2, ShieldCheck, Zap, FileText, Printer, Scale, Target, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface PatentDocumentationProps {
  onBack: () => void;
}

export function PatentDocumentation({ onBack }: PatentDocumentationProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-text-muted hover:text-brand transition-colors font-bold mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para Painel do Treinador
          </button>
          <h2 className="text-3xl font-black text-text-main flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-amber-500" />
            Dossiê de Propriedade Intelectual
          </h2>
          <p className="text-text-muted mt-1">
            Documentação técnica e legal sobre o Motor de Inferência SpeltaFit para submissão de patente.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-text-main hover:text-brand hover:border-brand transition-colors"
        >
          <Printer className="w-4 h-4" />
          Imprimir Dossiê
        </button>
      </div>

      <div className="bg-surface border border-border rounded-3xl p-8 shadow-xl space-y-12">
        
        {/* Section 1: Por que patentear */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Scale className="w-6 h-6 text-brand" />
            <h3 className="text-2xl font-black text-text-main">1. Por que podemos pleitear esta patente?</h3>
          </div>
          <div className="prose prose-invert max-w-none text-text-muted">
            <p>
              No Brasil (INPI) e internacionalmente (WIPO/USPTO), software "como tal" (o código-fonte) não é patenteável, sendo protegido por Direitos Autorais. No entanto, <strong>métodos computacionais que resolvem problemas técnicos de forma inovadora</strong> são patenteáveis sob a categoria de "Invenções Implementadas por Programa de Computador".
            </p>
            <p>
              O SpeltaFit não é um simples "aplicativo de treinos". Ele é um <strong>Sistema de Controle de Malha Fechada para Modulação Fisiológica</strong>. O problema técnico resolvido é a complexidade computacional de cruzar, em tempo real, variáveis subjetivas (estresse, sono) com restrições objetivas (lesões articulares, equipamentos) para gerar uma saída biomecanicamente segura sem intervenção humana.
            </p>
            <p>
              A inovação reside na nossa <strong>arquitetura determinística de cruzamento de dados</strong>, que atua como um "Motor de Inferência Biopsicossocial", garantindo que a prescrição de treino e nutrição seja dinamicamente ajustada com base em regras estritas da ciência do esporte, caracterizando um efeito técnico novo e inventivo.
            </p>
          </div>
        </section>

        {/* Section 2: O que faz */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Target className="w-6 h-6 text-brand" />
            <h3 className="text-2xl font-black text-text-main">2. O que o método realmente faz?</h3>
          </div>
          <div className="prose prose-invert max-w-none text-text-muted">
            <p>
              O "Motor SpeltaFit" atua como um orquestrador algorítmico em duas frentes simultâneas:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Módulo Biomecânico (Treino):</strong> O sistema recebe $N$ inputs do usuário (limitações articulares, equipamentos disponíveis, nível de fadiga). Ele aplica um filtro booleano no banco de dados de exercícios (ex: se há limitação no joelho, exclui vetores de força axial). Em seguida, aplica um multiplicador de fadiga dinâmico (ex: se o sono foi ruim, o volume total do treino é reduzido matematicamente em 20%).
              </li>
              <li>
                <strong>Módulo Metabólico (Nutrição):</strong> Utiliza um algoritmo de substituição de matriz exata. Quando o usuário substitui um alimento (ex: Frango por Ovo), o sistema não busca uma "refeição parecida". Ele resolve uma equação linear de primeiro grau <code>(MacroAlvo / MacroNovo) * 100</code> para entregar a gramagem exata, garantindo que o balanço calórico e de macronutrientes do dia permaneça inalterado com precisão de casas decimais.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Vantagens */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <ShieldCheck className="w-6 h-6 text-brand" />
            <h3 className="text-2xl font-black text-text-main">3. Vantagens em relação ao Estado da Técnica</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div className="bg-bg-main p-6 rounded-2xl border border-border">
              <h4 className="font-bold text-text-main mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Contra Apps Tradicionais
              </h4>
              <p className="text-sm text-text-muted">
                Aplicativos comuns entregam PDFs estáticos ou templates fixos de treino. O SpeltaFit é dinâmico e reativo, alterando o volume e a seleção de exercícios diariamente com base no estado de prontidão (readiness) do usuário.
              </p>
            </div>
            <div className="bg-bg-main p-6 rounded-2xl border border-border">
              <h4 className="font-bold text-text-main mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand"></span>
                Contra IAs Generativas (LLMs)
              </h4>
              <p className="text-sm text-text-muted">
                IAs como o ChatGPT são estocásticas (baseadas em probabilidade) e sofrem de "alucinação", podendo prescrever exercícios perigosos para lesionados. Nosso método é <strong>Determinístico</strong>, garantindo risco zero de prescrições medicamente contraindicadas.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Eficiência */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Zap className="w-6 h-6 text-brand" />
            <h3 className="text-2xl font-black text-text-main">4. Assertividade e Eficiência Computacional</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-text-main block">Assertividade de 100% em Restrições</strong>
                <span className="text-text-muted text-sm">O motor de regras garante obediência absoluta às limitações físicas cadastradas. Se há dor na lombar, a probabilidade de um exercício de compressão espinhal ser gerado é matematicamente zero.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-text-main block">Precisão Metabólica</strong>
                <span className="text-text-muted text-sm">O algoritmo de substituição nutricional garante 100% de equivalência de macronutrientes, eliminando o erro humano no cálculo de dietas flexíveis.</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-text-main block">Complexidade O(1) e O(N)</strong>
                <span className="text-text-muted text-sm">O processamento ocorre em milissegundos no lado do cliente (Edge Computing). As substituições matemáticas operam em tempo constante O(1), e a filtragem de treinos em O(N), economizando custos de servidor e garantindo funcionamento imediato.</span>
              </div>
            </li>
          </ul>
        </section>

        {/* Section 5: Draft da Patente */}
        <section className="space-y-4 pt-8 border-t-2 border-dashed border-border">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-text-main" />
            <h3 className="text-2xl font-black text-text-main">5. Documento de Modelo (Draft INPI)</h3>
          </div>
          
          <div className="bg-white text-black p-8 md:p-12 rounded-xl font-serif shadow-inner text-sm leading-relaxed">
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold uppercase mb-2">Pedido de Patente de Invenção</h1>
              <p className="text-gray-600">Instituto Nacional da Propriedade Industrial (INPI)</p>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="font-bold uppercase text-gray-800">1. Título da Invenção</h2>
                <p className="mt-1">SISTEMA E MÉTODO COMPUTACIONAL PARA PRESCRIÇÃO DINÂMICA E ADAPTATIVA DE TREINAMENTO FÍSICO E NUTRIÇÃO BASEADO EM VARIÁVEIS BIOPSICOSSOCIAIS E RESTRIÇÕES FÍSICAS.</p>
              </div>

              <div>
                <h2 className="font-bold uppercase text-gray-800">2. Campo da Invenção</h2>
                <p className="mt-1">A presente invenção insere-se no campo da Ciência da Computação aplicada à Saúde Digital e Ciências do Esporte, especificamente relacionando-se a sistemas de processamento de dados para modulação fisiológica e prescrição determinística de exercícios e dietas.</p>
              </div>

              <div>
                <h2 className="font-bold uppercase text-gray-800">3. Estado da Técnica</h2>
                <p className="mt-1">Atualmente, sistemas de prescrição de treino baseiam-se em matrizes estáticas (templates) ou em modelos de Inteligência Artificial Generativa (LLMs). Os modelos estáticos falham por não se adaptarem ao estado diário de fadiga do usuário. Os modelos generativos falham por sua natureza estocástica, apresentando risco de "alucinação" e prescrevendo movimentos biomecanicamente contraindicados para usuários com lesões pré-existentes.</p>
              </div>

              <div>
                <h2 className="font-bold uppercase text-gray-800">4. Resumo da Invenção</h2>
                <p className="mt-1">A presente invenção resolve os problemas do estado da técnica ao prover um método computacional determinístico que atua como um motor de inferência. O sistema recebe dados de entrada contínuos (nível de estresse, qualidade do sono, disponibilidade de equipamentos e limitações articulares) e aplica uma filtragem booleana estrita para seleção de exercícios. Simultaneamente, aplica um multiplicador matemático de fadiga que modula o volume total do treinamento. Na vertente nutricional, o sistema emprega uma matriz de substituição que resolve equações lineares em tempo real para garantir equivalência exata de macronutrientes, sem depender de aproximações probabilísticas.</p>
              </div>

              <div>
                <h2 className="font-bold uppercase text-gray-800">5. Reivindicações (Claims)</h2>
                <ol className="list-decimal pl-5 mt-2 space-y-3">
                  <li>
                    <strong>MÉTODO COMPUTACIONAL PARA PRESCRIÇÃO DINÂMICA</strong>, caracterizado por compreender as etapas de: (a) recepção de dados de entrada incluindo limitações articulares, equipamentos e marcadores de fadiga diária; (b) aplicação de um filtro booleano determinístico sobre um banco de dados de exercícios para exclusão de vetores de força contraindicados; (c) cálculo de um multiplicador de volume baseado nos marcadores de fadiga; e (d) geração de uma matriz de treinamento adaptada em tempo real.
                  </li>
                  <li>
                    <strong>MÉTODO</strong>, de acordo com a reivindicação 1, caracterizado pelo fato de que o multiplicador de volume reduz ou aumenta a carga de trabalho total (séries x repetições) de forma inversamente proporcional ao nível de estresse e privação de sono reportados.
                  </li>
                  <li>
                    <strong>SISTEMA DE SUBSTITUIÇÃO NUTRICIONAL EXATA</strong>, caracterizado por compreender um processador configurado para: (a) receber uma solicitação de substituição de um alimento A por um alimento B; (b) extrair a densidade de macronutrientes de ambos; e (c) resolver uma equação linear para determinar a massa exata do alimento B necessária para igualar o macronutriente principal do alimento A, ajustando o balanço calórico diário em tempo O(1).
                  </li>
                  <li>
                    <strong>SISTEMA</strong>, de acordo com as reivindicações 1 e 3, caracterizado por operar inteiramente de forma determinística, garantindo a ausência de resultados estocásticos (alucinações) na prescrição final de saúde.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>

      </div>
    </motion.div>
  );
}
