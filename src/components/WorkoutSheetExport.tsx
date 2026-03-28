import React, { forwardRef } from 'react';
import { WorkoutPlan, AnamnesisData } from '../services/workoutGenerator';
import { Dumbbell } from 'lucide-react';

interface Props {
  plan: WorkoutPlan;
  user: AnamnesisData;
}

export const WorkoutSheetExport = forwardRef<HTMLDivElement, Props>(({ plan, user }, ref) => {
  return (
    <div ref={ref} className="bg-white text-black font-sans w-full max-w-[794px] mx-auto box-border" style={{ color: '#000' }}>
      {/* Page 1: Overview */}
      <div className="box-border flex flex-col bg-white" style={{ pageBreakAfter: 'always' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-black p-2 rounded-lg">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase">SpeltaFit</h1>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Ficha de Treino Oficial</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-gray-500 uppercase">Aluno(a)</p>
            <p className="text-xl font-black uppercase">{user.name}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6 text-sm border-b-2 border-black pb-6">
          <div>
            <p className="font-bold text-gray-500 uppercase text-xs">Fase / Mesociclo</p>
            <p className="font-bold">{plan.phaseName}</p>
          </div>
          <div>
            <p className="font-bold text-gray-500 uppercase text-xs">Duração</p>
            <p className="font-bold">{plan.durationWeeks} Semanas</p>
          </div>
          <div>
            <p className="font-bold text-gray-500 uppercase text-xs">Frequência</p>
            <p className="font-bold">{user.daysPerWeek}x na semana</p>
          </div>
          <div>
            <p className="font-bold text-gray-500 uppercase text-xs">Local</p>
            <p className="font-bold">{user.equipment}</p>
          </div>
        </div>

        {/* Student Profile (Anamnesis) */}
        <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="font-black uppercase border-b border-gray-300 mb-3 text-brand">👤 Perfil do Aluno (Anamnese)</p>
          <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-sm text-gray-800">
            <div><span className="font-bold">Nome:</span> {user.name}</div>
            <div><span className="font-bold">Idade:</span> {user.age} anos</div>
            <div><span className="font-bold">Gênero:</span> {user.gender}</div>
            <div><span className="font-bold">Peso:</span> {user.weight} kg</div>
            <div><span className="font-bold">Altura:</span> {user.height} cm</div>
            <div><span className="font-bold">Objetivo:</span> {user.goal}</div>
            <div><span className="font-bold">Nível:</span> {user.experience}</div>
            <div><span className="font-bold">Status Hormonal:</span> {user.hormonalStatus}</div>
            <div className="col-span-1"><span className="font-bold">Limitações:</span> {user.limitations || 'Nenhuma'}</div>
          </div>
        </div>

        {/* Strategy & Guidelines */}
        <div className="mb-8 space-y-4 text-sm flex-1">
          <div>
            <p className="font-black uppercase border-b border-gray-300 mb-1">Estratégia</p>
            <p className="text-gray-800">{plan.strategySummary}</p>
          </div>
          <div>
            <p className="font-black uppercase border-b border-gray-300 mb-1">Progressão de Carga</p>
            <p className="text-gray-800">{plan.progressiveOverloadPlan}</p>
          </div>
          <div>
            <p className="font-black uppercase border-b border-gray-300 mb-1">Diretrizes de Monitoramento</p>
            <p className="text-gray-800">{plan.monitoringGuidelines}</p>
          </div>
          
          {/* Glossary Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6 break-inside-avoid">
            <p className="font-black uppercase border-b border-gray-300 mb-2 text-brand">📖 Guia de Execução (Glossário)</p>
            <div className="space-y-4 text-sm text-gray-800">
              <div className="break-inside-avoid">
                <span className="font-bold text-black">Série Normal:</span> 
                <span> É a série padrão de trabalho. Você deve executar o número de repetições estipulado mantendo o mesmo peso do início ao fim. O foco deve ser no controle do movimento: uma descida (fase excêntrica) controlada de 2 a 3 segundos, e uma subida (fase concêntrica) explosiva e forte. Não use técnicas avançadas (como drop-set) a menos que esteja especificado.</span>
              </div>
              <div className="break-inside-avoid">
                <span className="font-bold text-black">RIR (Repetições na Reserva):</span> 
                <span> É a principal ferramenta de controle de intensidade. RIR significa quantas repetições você ainda conseguiria fazer com boa forma antes de travar (falhar) completamente.</span>
                <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-700">
                  <li className="break-inside-avoid"><strong>Exemplo RIR 2:</strong> Se a ficha pede 10 repetições com RIR 2, você deve escolher um peso com o qual você falharia na 12ª repetição. Você para na 10ª repetição sentindo que "daria para fazer só mais duas chorando".</li>
                  <li className="break-inside-avoid"><strong>Exemplo RIR 0:</strong> Significa que não há repetições na reserva. Você deve ir até a falha total, onde é fisicamente impossível fazer mais uma repetição.</li>
                  <li className="break-inside-avoid"><strong>Por que usar?</strong> Treinar até a falha em todas as séries destrói seu Sistema Nervoso Central e prejudica a recuperação. O RIR permite que você treine pesado (próximo à falha) acumulando volume sem entrar em overtraining.</li>
                </ul>
              </div>
              <div className="break-inside-avoid">
                <span className="font-bold text-black">Falha Concêntrica:</span> 
                <span> É o momento exato em que você tenta subir o peso (fase concêntrica) e o músculo simplesmente não responde mais, travando no meio do caminho, mesmo você fazendo força máxima. 
                <br/><strong>Atenção:</strong> Iniciantes devem evitar a falha em exercícios complexos (Agachamento, Supino, Terra) pelo risco de lesão ao perder a postura. Deixe a falha para exercícios em máquinas ou cabos.</span>
              </div>
              <div className="break-inside-avoid">
                <span className="font-bold text-black">PSE (Percepção Subjetiva de Esforço):</span> 
                <span> Uma nota de 1 a 10 que você dá para o quão difícil foi a série ou o treino. 1 é estar deitado no sofá, 10 é o esforço máximo da sua vida (falha total). Um treino de hipertrofia ideal geralmente orbita entre PSE 7 e 9.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t-2 border-black text-center text-xs font-bold text-gray-500 uppercase">
          Gerado por SpeltaFit IA • {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* Pages 2+: Days / Tables */}
      {Array.isArray(plan.weeklyRoutine) && plan.weeklyRoutine.map((day, idx) => (
        <div key={idx} className="box-border flex flex-col bg-white" style={{ pageBreakAfter: 'always' }}>
          {/* Header for Day Page */}
          <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-black p-2 rounded-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight uppercase">SpeltaFit</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black uppercase">{day.day}</p>
              <p className="text-sm font-bold text-gray-500 uppercase">{day.focus}</p>
            </div>
          </div>

          <div className="flex-1">
            {day.cardio && (
              <div className="mb-4 p-3 bg-gray-100 border-l-4 border-black">
                <p className="font-black uppercase text-sm mb-1">Cardio Recomendado</p>
                <p className="text-sm">
                  <span className="font-bold">{day.cardio.type}</span> • {day.cardio.duration} • {day.cardio.intensity}
                  <br />
                  <span className="text-gray-600 italic">{day.cardio.method}</span>
                </p>
                {day.cardio.setup && (
                  <div className="mt-1 text-xs text-gray-800"><span className="font-bold">Setup Inicial:</span> {day.cardio.setup}</div>
                )}
              </div>
            )}
            
            {Array.isArray(day.exercises) && day.exercises.length > 0 ? (
              <table className="w-full text-sm border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs">
                    <th className="border border-gray-300 px-2 py-1.5 w-8 text-center">#</th>
                    <th className="border border-gray-300 px-2 py-1.5 w-[20%]">Exercício</th>
                    <th className="border border-gray-300 px-2 py-1.5 w-20 text-center whitespace-nowrap">Séries x Reps</th>
                    <th className="border border-gray-300 px-2 py-1.5 w-16 text-center">Pausa</th>
                    <th className="border border-gray-300 px-2 py-1.5 w-20 text-center">Carga Sug.</th>
                    <th className="border border-gray-300 px-2 py-1.5 w-20 text-center">Carga Real</th>
                    <th className="border border-gray-300 px-2 py-1.5 w-auto">Observações / Método</th>
                  </tr>
                </thead>
                <tbody>
                  {day.exercises.map((ex, i) => (
                    <tr key={i} className="border-b border-gray-300 break-inside-avoid" style={{ pageBreakInside: 'avoid' }}>
                      <td className="border border-gray-300 px-2 py-1.5 text-center font-bold">{i + 1}</td>
                      <td className="border border-gray-300 px-2 py-1.5 font-bold">
                        {ex.name}
                        {ex.videoUrl && <div className="text-[8px] text-gray-400 mt-0.5 uppercase tracking-tighter">Vídeo disponível no App</div>}
                      </td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center font-bold whitespace-nowrap">{ex.sets} x {ex.reps}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">{ex.rest}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center">{ex.suggestedLoad}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center"></td>
                      <td className="border border-gray-300 px-2 py-1.5 text-[11px] leading-tight">
                        <div className="font-bold uppercase mb-0.5">{ex.method} {ex.rir && <span className="text-gray-600">({ex.rir})</span>}</div>
                        {ex.setup && <div className="mt-0.5 text-gray-800"><span className="font-bold">Setup:</span> {ex.setup}</div>}
                        {ex.notes && <div className="mt-0.5 text-gray-600 italic break-words whitespace-pre-wrap">{ex.notes}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-gray-500 italic border border-gray-300 bg-gray-50">
                Dia de Descanso / Recuperação
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t-2 border-black text-center text-xs font-bold text-gray-500 uppercase">
            {user.goal} • {plan.phaseName} • Página {idx + 2}
          </div>
        </div>
      ))}
    </div>
  );
});
