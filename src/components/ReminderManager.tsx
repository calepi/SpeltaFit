import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Droplets, Utensils, Zap, X, Volume2 } from 'lucide-react';

interface Reminder {
  id: string;
  type: 'water' | 'meal' | 'workout';
  time: string;
  enabled: boolean;
  label: string;
}

export function ReminderManager() {
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const lastTriggeredRef = useRef<Record<string, string>>({}); // id -> date string
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element for the alarm sound
    // Using a clean, non-annoying beep sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.loop = true;
    audioRef.current = audio;

    const checkReminders = () => {
      // Check for test trigger
      const testTrigger = localStorage.getItem('fitgenius_reminders_trigger_test');
      if (testTrigger) {
        const reminder = JSON.parse(testTrigger);
        setActiveReminder(reminder);
        localStorage.removeItem('fitgenius_reminders_trigger_test');
        if (audioRef.current) {
          audioRef.current.play().catch(err => console.log('Audio play blocked:', err));
        }
        return;
      }

      const saved = localStorage.getItem('fitgenius_reminders');
      if (!saved) return;

      const reminders: Reminder[] = JSON.parse(saved);
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDate = now.toDateString();

      reminders.forEach(reminder => {
        if (reminder.enabled && reminder.time === currentTime) {
          // Check if already triggered today for this specific time
          if (lastTriggeredRef.current[reminder.id] !== currentDate) {
            setActiveReminder(reminder);
            lastTriggeredRef.current[reminder.id] = currentDate;
            
            // Play sound
            if (audioRef.current) {
              audioRef.current.play().catch(err => console.log('Audio play blocked by browser:', err));
            }
          }
        }
      });
    };

    // Listen for storage events to catch test triggers immediately
    window.addEventListener('storage', checkReminders);

    const interval = setInterval(checkReminders, 10000); // Check every 10 seconds for better responsiveness
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkReminders);
    };
  }, []);

  const closeReminder = () => {
    setActiveReminder(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <AnimatePresence>
      {activeReminder && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-surface border-4 border-brand rounded-[3rem] p-8 max-w-md w-full shadow-[0_0_50px_rgba(var(--brand-rgb),0.3)] text-center relative overflow-hidden"
          >
            {/* Animated Background Pulse */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-brand pointer-events-none"
            />

            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <motion.div 
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                  className={`p-6 rounded-3xl ${
                    activeReminder.type === 'water' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40' :
                    activeReminder.type === 'meal' ? 'bg-green-500 text-white shadow-lg shadow-green-500/40' :
                    'bg-brand text-white shadow-lg shadow-brand/40'
                  }`}
                >
                  {activeReminder.type === 'water' ? <Droplets className="w-12 h-12" /> :
                   activeReminder.type === 'meal' ? <Utensils className="w-12 h-12" /> :
                   <Zap className="w-12 h-12" />}
                </motion.div>
              </div>

              <h2 className="text-3xl font-black text-text-main mb-2 tracking-tight">
                {activeReminder.label}
              </h2>
              <p className="text-brand font-black text-xl mb-6">
                Hora: {activeReminder.time}
              </p>

              <div className="flex items-center justify-center gap-2 text-text-muted mb-8 font-bold">
                <Volume2 className="w-5 h-5 animate-pulse" />
                Alarme Sonoro Ativo
              </div>

              <button 
                onClick={closeReminder}
                className="w-full py-5 rounded-2xl bg-brand text-text-inverse font-black text-xl shadow-xl shadow-brand/20 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <CheckCircle2 className="w-6 h-6" />
                Entendido, Spelta!
              </button>
            </div>

            <button 
              onClick={closeReminder}
              className="absolute top-6 right-6 p-2 text-text-muted hover:text-text-main transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
