import React, { forwardRef } from 'react';
import { WorkoutPlan, AnamnesisData, formatProgressionText } from '../services/workoutGenerator';
import { Dumbbell } from 'lucide-react';

interface Props {
  plan: WorkoutPlan;
  user: AnamnesisData;
  selectedWeek?: number;
  actualLoads?: Record<string, string>;
}

export const WorkoutSheetExport = forwardRef<HTMLDivElement, Props>(({ plan, user, selectedWeek = 1, actualLoads = {} }, ref) => {
  const getDynamicSets = (baseSets: number | string, currentWeek: number, phaseName?: string) => {
    if (phaseName && phaseName.includes('Adaptação e Aprendizado Motor') && Number(baseSets) === 1) {
      return currentWeek === 1 ? 1 : currentWeek === 2 ? 2 : 3;
    }
    return Number(baseSets) || 0;
  };

  return (
    <div ref={ref} className="font-sans w-full max-w-[1123px] mx-auto box-border" style={{ color: '#000000', backgroundColor: '#FFFFFF' }}>
      {/* Page 1: Overview */}
      <div className="box-border flex flex-col" style={{ pageBreakAfter: 'always', backgroundColor: '#FFFFFF' }}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6" style={{ borderBottom: '2px solid #000000' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#000000' }}>
              <Dumbbell className="w-8 h-8" style={{ color: '#FFFFFF' }} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase" style={{ color: '#000000' }}>SpeltaFit</h1>
              <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#4B5563' }}>Ficha de Treino Oficial - Semana {selectedWeek}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold uppercase" style={{ color: '#6B7280' }}>Aluno(a)</p>
            <p className="text-xl font-black uppercase" style={{ color: '#000000' }}>{user.name}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-4 gap-4 mb-6 text-sm pb-6" style={{ borderBottom: '2px solid #000000' }}>
          <div>
            <p className="font-bold uppercase text-xs" style={{ color: '#6B7280' }}>Fase / Mesociclo</p>
            <p className="font-bold" style={{ color: '#000000' }}>{plan.phaseName}</p>
          </div>
          <div>
            <p className="font-bold uppercase text-xs" style={{ color: '#6B7280' }}>Duração</p>
            <p className="font-bold" style={{ color: '#000000' }}>{plan.durationWeeks} Semanas</p>
          </div>
          <div>
            <p className="font-bold uppercase text-xs" style={{ color: '#6B7280' }}>Frequência</p>
            <p className="font-bold" style={{ color: '#000000' }}>{user.daysPerWeek}x na semana</p>
          </div>
          <div>
            <p className="font-bold uppercase text-xs" style={{ color: '#6B7280' }}>Local</p>
            <p className="font-bold" style={{ color: '#000000' }}>{user.equipment}</p>
          </div>
        </div>

        {/* Student Profile (Anamnesis) */}
          <div className="mb-8 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
            <p className="font-black uppercase mb-3" style={{ color: '#00D1FF', borderBottom: '1px solid #D1D5DB' }}>👤 Perfil do Aluno (Anamnese)</p>
            <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-sm" style={{ color: '#1F2937' }}>
            <div><span className="font-bold">Nome:</span> {user.name}</div>
            <div><span className="font-bold">Idade:</span> {user.age} anos</div>
            <div><span className="font-bold">Gênero:</span> {user.gender}</div>
            <div><span className="font-bold">Peso:</span> {user.weight} kg</div>
            <div><span className="font-bold">Altura:</span> {user.height} cm</div>
            <div><span className="font-bold">Objetivo:</span> {user.goal}</div>
            <div><span className="font-bold">Nível:</span> {user.experience}</div>
            <div className="col-span-2"><span className="font-bold">Limitações:</span> {user.limitations || 'Nenhuma'}</div>
          </div>
        </div>

        {/* Strategy & Guidelines */}
        <div className="mb-8 space-y-4 text-sm flex-1">
          <div>
            <p className="font-black uppercase mb-1" style={{ borderBottom: '1px solid #D1D5DB', color: '#000000' }}>Estratégia</p>
            <p style={{ color: '#1F2937' }}>{plan.strategySummary}</p>
          </div>
          <div>
            <p className="font-black uppercase mb-1" style={{ borderBottom: '1px solid #D1D5DB', color: '#000000' }}>Progressão de Carga</p>
            <p style={{ color: '#1F2937' }}>{plan.progressiveOverloadPlan}</p>
          </div>
          <div>
            <p className="font-black uppercase mb-1" style={{ borderBottom: '1px solid #D1D5DB', color: '#000000' }}>Diretrizes de Monitoramento</p>
            <p style={{ color: '#1F2937' }}>{plan.monitoringGuidelines}</p>
          </div>
          
            {/* Glossary Section */}
            <div className="p-4 rounded-lg mt-6 break-inside-avoid" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
              <p className="font-black uppercase mb-2" style={{ color: '#00D1FF', borderBottom: '1px solid #D1D5DB' }}>📖 Guia de Execução (Glossário)</p>
              <div className="space-y-4 text-sm" style={{ color: '#1F2937' }}>
              <div className="break-inside-avoid">
                <span className="font-bold" style={{ color: '#000000' }}>Série Normal:</span> 
                <span> É a série padrão de trabalho. Você deve executar o número de repetições estipulado mantendo o mesmo peso do início ao fim. O foco deve ser no controle do movimento: uma descida (fase excêntrica) controlada de 2 a 3 segundos, e uma subida (fase concêntrica) explosiva e forte. Não use técnicas avançadas (como drop-set) a menos que esteja especificado.</span>
              </div>
              <div className="break-inside-avoid">
                <span className="font-bold" style={{ color: '#000000' }}>RIR (Repetições na Reserva):</span> 
                <span> É a principal ferramenta de controle de intensidade. RIR significa quantas repetições você ainda conseguiria fazer com boa forma antes de travar (falhar) completamente.</span>
                <ul className="list-disc pl-5 mt-2 space-y-2" style={{ color: '#374151' }}>
                  <li className="break-inside-avoid"><strong>Exemplo RIR 2:</strong> Se a ficha pede 10 repetições com RIR 2, você deve escolher um peso com o qual você falharia na 12ª repetição. Você para na 10ª repetição sentindo que "daria para fazer só mais duas chorando".</li>
                  <li className="break-inside-avoid"><strong>Exemplo RIR 0:</strong> Significa que não há repetições na reserva. Você deve ir até a falha total, onde é fisicamente impossível fazer mais uma repetição.</li>
                  <li className="break-inside-avoid"><strong>Por que usar?</strong> Treinar até a falha em todas as séries destrói seu Sistema Nervoso Central e prejudica a recuperação. O RIR permite que você treine pesado (próximo à falha) acumulando volume sem entrar em overtraining.</li>
                </ul>
              </div>
              <div className="break-inside-avoid">
                <span className="font-bold" style={{ color: '#000000' }}>Falha Concêntrica:</span> 
                <span> É o momento exato em que você tenta subir o peso (fase concêntrica) e o músculo simplesmente não responde mais, travando no meio do caminho, mesmo você fazendo força máxima. 
                <br/><strong>Atenção:</strong> Iniciantes devem evitar a falha em exercícios complexos (Agachamento, Supino, Terra) pelo risco de lesão ao perder a postura. Deixe a falha para exercícios em máquinas ou cabos.</span>
              </div>
              <div className="break-inside-avoid">
                <span className="font-bold" style={{ color: '#000000' }}>PSE (Percepção Subjetiva de Esforço):</span> 
                <span> Uma nota de 1 a 10 que você dá para o quão difícil foi a série ou o treino. 1 é estar deitado no sofá, 10 é o esforço máximo da sua vida (falha total). Um treino de hipertrofia ideal geralmente orbita entre PSE 7 e 9.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-4 text-center text-xs font-bold uppercase" style={{ color: '#6B7280', borderTop: '2px solid #000000' }}>
          Gerado por SpeltaFit • {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* Pages 2+: Days / Tables */}
      {Array.isArray(plan.weeklyRoutine) && plan.weeklyRoutine.map((day, idx) => (
        <div key={idx} className="box-border flex flex-col" style={{ pageBreakAfter: 'always', backgroundColor: '#FFFFFF' }}>
          {/* Header for Day Page */}
          <div className="flex items-center justify-between pb-4 mb-6" style={{ borderBottom: '2px solid #000000' }}>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#000000' }}>
                <Dumbbell className="w-6 h-6" style={{ color: '#FFFFFF' }} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight uppercase" style={{ color: '#000000' }}>SpeltaFit</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black uppercase" style={{ color: '#000000' }}>{day.day}</p>
              <p className="text-sm font-bold uppercase" style={{ color: '#6B7280' }}>{day.focus}</p>
            </div>
          </div>

          <div className="flex-1">
            {day.cardio && (
              <div className="mb-4 p-3" style={{ backgroundColor: '#F3F4F6', borderLeft: '4px solid #000000' }}>
                <p className="font-black uppercase text-sm mb-1" style={{ color: '#000000' }}>Cardio Recomendado</p>
                <p className="text-sm" style={{ color: '#1F2937' }}>
                  <span className="font-bold">{day.cardio.type}</span> • {day.cardio.duration} • {day.cardio.intensity}
                  <br />
                  <span className="italic" style={{ color: '#4B5563' }}>{day.cardio.method}</span>
                </p>
                {day.cardio.setup && (
                  <div className="mt-1 text-xs" style={{ color: '#1F2937' }}><span className="font-bold">Progressão:</span> {formatProgressionText(day.cardio.setup, selectedWeek, plan, user, 'Cardio', 'Cardio')}</div>
                )}
              </div>
            )}
            
            {Array.isArray(day.exercises) && day.exercises.length > 0 ? (
              <table className="w-full text-sm border-collapse" style={{ border: '1px solid #D1D5DB' }}>
                <thead>
                  <tr className="text-left text-xs" style={{ backgroundColor: '#F9FAFB', color: '#000000' }}>
                    <th className="px-3 py-2 w-8 text-center" style={{ border: '1px solid #D1D5DB' }}>#</th>
                    <th className="px-3 py-2 w-[25%]" style={{ border: '1px solid #D1D5DB' }}>Exercício</th>
                    <th className="px-3 py-2 w-24 text-center whitespace-nowrap" style={{ border: '1px solid #D1D5DB' }}>Séries x Reps</th>
                    <th className="px-3 py-2 w-20 text-center" style={{ border: '1px solid #D1D5DB' }}>Pausa</th>
                    <th className="px-3 py-2 w-24 text-center" style={{ border: '1px solid #D1D5DB' }}>Carga Sug.</th>
                    <th className="px-3 py-2 w-24 text-center" style={{ border: '1px solid #D1D5DB' }}>Carga Real</th>
                    <th className="px-3 py-2 w-auto" style={{ border: '1px solid #D1D5DB' }}>Observações / Método</th>
                  </tr>
                </thead>
                <tbody>
                  {day.exercises.map((ex, i) => {
                    const setLoads = Array.from({ length: getDynamicSets(ex.sets, selectedWeek, plan.phaseName) }).map((_, setIdx) => {
                      const setLoadKey = `w${selectedWeek}-d${idx}-${ex.id}-${setIdx}`;
                      return actualLoads[setLoadKey] || '-';
                    });
                    const actualLoadDisplay = setLoads.every(l => l === '-') ? '' : setLoads.join(' / ');
                    return (
                    <tr key={i} className="break-inside-avoid" style={{ pageBreakInside: 'avoid', borderBottom: '1px solid #D1D5DB', color: '#000000' }}>
                      <td className="px-3 py-2 text-center font-bold" style={{ border: '1px solid #D1D5DB' }}>{i + 1}</td>
                      <td className="px-3 py-2 font-bold" style={{ border: '1px solid #D1D5DB' }}>
                        {ex.name}
                        {ex.videoUrl && <div className="text-[9px] mt-0.5 uppercase tracking-tighter" style={{ color: '#9CA3AF' }}>Vídeo disponível no App</div>}
                      </td>
                      <td className="px-3 py-2 text-center font-bold whitespace-nowrap" style={{ border: '1px solid #D1D5DB' }}>{getDynamicSets(ex.sets, selectedWeek, plan.phaseName)} x {ex.reps}</td>
                      <td className="px-3 py-2 text-center" style={{ border: '1px solid #D1D5DB' }}>{ex.rest}</td>
                      <td className="px-3 py-2 text-center" style={{ border: '1px solid #D1D5DB' }}>{ex.suggestedLoad}</td>
                      <td className="px-3 py-2 text-center font-bold" style={{ color: '#00D1FF', border: '1px solid #D1D5DB' }}>{actualLoadDisplay}</td>
                      <td className="px-3 py-2 text-xs leading-tight" style={{ border: '1px solid #D1D5DB' }}>
                        {ex.rir && <div className="font-bold uppercase mb-0.5" style={{ color: '#4B5563' }}>RIR: {ex.rir}</div>}
                        {ex.setup && <div className="mt-0.5" style={{ color: '#1F2937' }}><span className="font-bold">Progressão:</span> {formatProgressionText(ex.setup, selectedWeek, plan, user, ex.name, ex.group)}</div>}
                        {ex.notes && <div className="mt-0.5 italic break-words whitespace-pre-wrap" style={{ color: '#4B5563' }}>{ex.notes}</div>}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center italic" style={{ backgroundColor: '#F9FAFB', border: '1px solid #D1D5DB', color: '#6B7280' }}>
                Dia de Descanso / Recuperação
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 text-center text-xs font-bold uppercase" style={{ color: '#6B7280', borderTop: '2px solid #000000' }}>
            {user.goal} • {plan.phaseName} • Página {idx + 2}
          </div>
        </div>
      ))}
    </div>
  );
});
