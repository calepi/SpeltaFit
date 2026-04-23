import React, { useState } from 'react';
import { connectStrava } from '../services/stravaService';
import { Activity, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  userId: string;
  isConnected: boolean;
  onSuccess: () => void;
}

export function StravaConnect({ userId, isConnected, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      await connectStrava(userId);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com Strava');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {isConnected ? (
        <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 px-4 py-3 rounded-2xl">
          <div className="p-2 bg-orange-500 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-orange-500">Strava Conectado</p>
            <p className="text-xs text-orange-500/80">Atividades Sincronizadas</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <button 
            onClick={handleConnect}
            className="p-1 hover:bg-orange-500/10 rounded-full transition-colors"
            title="Reconectar"
          >
            <RotateCcw className="w-4 h-4 text-orange-500" />
          </button>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConnect}
          disabled={loading}
          className="flex items-center gap-3 bg-[#FC4C02] hover:bg-[#E34402] text-white px-6 py-3 rounded-2xl font-bold transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-50 w-full justify-center"
        >
          <Activity className="w-6 h-6" />
          {loading ? 'Conectando...' : 'Conectar com Strava'}
        </motion.button>
      )}
      {error && <p className="text-xs text-red-500 mt-1 px-2">{error}</p>}
    </div>
  );
}
