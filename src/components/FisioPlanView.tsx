import React from 'react';
import { FisioPlan } from '../services/fisioGenerator';
import { AnamnesisData } from '../services/workoutGenerator';
import { HeartPulse, AlertTriangle, ShieldCheck, Dumbbell, Shield } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  plan: FisioPlan;
  user: AnamnesisData;
}

export function FisioPlanView({ plan, user }: Props) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl overflow-hidden border border-red-100 mb-8"
    >
      <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 md:p-8 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse className="w-5 h-5 opacity-80" />
            <span className="text-sm font-bold tracking-wider uppercase opacity-90">SpeltaFisio - Protocolo Ativo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">{plan.phaseName}</h2>
        </div>
        <ShieldCheck className="w-12 h-12 opacity-50" />
      </div>

      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Estratégia Ortopédica
          </h3>
          <p className="text-gray-700 leading-relaxed bg-red-50 p-4 rounded-xl border border-red-100">
            {plan.strategySummary}
          </p>
        </div>

        {plan.restrictedMovements.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Exercícios Vetados (Override SpeltaFit)
            </h3>
            <ul className="space-y-2">
              {plan.restrictedMovements.map((move, idx) => (
                <li key={idx} className="flex items-start gap-2 text-gray-700">
                  <span className="text-orange-500 font-bold mt-0.5">•</span>
                  <span>{move}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {plan.preHabRoutine.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-gray-500" />
              Pre-Hab (Fazer ANTES do treino principal)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.preHabRoutine.map((routine, idx) => (
                <div key={idx} className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                  <div className="font-bold text-gray-900 mb-1">{routine.name}</div>
                  <div className="text-sm text-brand font-bold mb-2">{routine.duration}</div>
                  <p className="text-sm text-gray-600">{routine.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
