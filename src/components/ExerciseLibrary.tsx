import React, { useState } from 'react';
import { EXERCISE_DB, Exercise } from '../data/exerciseDatabase';
import { Search, Play, X, Dumbbell, Activity, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function getEmbedUrl(url: string) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname === '/watch') {
        const videoId = urlObj.searchParams.get('v');
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (urlObj.pathname.startsWith('/shorts/')) {
        const videoId = urlObj.pathname.split('/')[2];
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      } else if (urlObj.pathname.startsWith('/embed/')) {
        return url;
      }
    } else if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.substring(1);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
  } catch (e) {
    // ignore invalid URLs
  }
  return url;
}

export function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [activeVideo, setActiveVideo] = useState<{ name: string, url: string } | null>(null);

  const allExercises = Object.values(EXERCISE_DB).flat();
  const groups = Object.keys(EXERCISE_DB);

  const filteredExercises = allExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ex.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === 'all' || ex.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const formatGroupName = (group: string) => {
    return group.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-text-main mb-4">Biblioteca de Exercícios</h1>
        <p className="text-text-muted">Consulte a execução correta, músculos trabalhados e detalhes de cada exercício.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar exercício..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
              selectedGroup === 'all' 
                ? 'bg-brand text-text-inverse' 
                : 'bg-surface text-text-muted border border-border hover:border-brand/50'
            }`}
          >
            Todos
          </button>
          {groups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedGroup === group 
                  ? 'bg-brand text-text-inverse' 
                  : 'bg-surface text-text-muted border border-border hover:border-brand/50'
              }`}
            >
              {formatGroupName(group)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map(ex => (
          <div key={ex.id} className="bg-surface rounded-2xl border border-border overflow-hidden hover:border-brand/30 transition-all flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-text-main leading-tight">{ex.name}</h3>
                <span className="bg-bg-main text-text-muted px-2.5 py-1 rounded-lg text-xs font-bold border border-border whitespace-nowrap ml-3">
                  {formatGroupName(ex.group)}
                </span>
              </div>
              
              <p className="text-sm text-text-muted mb-6">{ex.description}</p>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-text-main mb-1">
                    <Target className="w-4 h-4 text-brand" />
                    Músculos Trabalhados
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ex.musclesWorked.map((muscle, i) => (
                      <span key={i} className="bg-brand/10 text-brand px-2 py-0.5 rounded text-xs font-medium">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-text-main mb-1">
                    <Activity className="w-4 h-4 text-brand" />
                    Execução
                  </div>
                  <p className="text-sm text-text-muted">{ex.execution}</p>
                </div>
                
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                    <Dumbbell className="w-3.5 h-3.5" />
                    {ex.equipment}
                  </div>
                </div>
              </div>
            </div>
            
            {ex.videoUrl && (
              <div className="p-4 border-t border-border bg-bg-main/50">
                <button 
                  onClick={() => setActiveVideo({ name: ex.name, url: getEmbedUrl(ex.videoUrl!) })}
                  className="w-full flex items-center justify-center gap-2 bg-brand text-text-inverse py-2.5 rounded-xl font-bold hover:scale-[1.02] transition-transform"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Ver Vídeo da Execução
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-20">
          <Dumbbell className="w-16 h-16 text-border mx-auto mb-4" />
          <h3 className="text-xl font-bold text-text-main mb-2">Nenhum exercício encontrado</h3>
          <p className="text-text-muted">Tente buscar por outro termo ou selecione outro grupo muscular.</p>
        </div>
      )}

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideo(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-surface rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 flex justify-between items-start border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                    <Play className="w-6 h-6 text-brand fill-current" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-black text-text-main leading-tight">
                      {activeVideo.name}
                    </h3>
                    <p className="text-sm text-text-muted font-medium">Demonstração da Execução</p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveVideo(null)}
                  className="p-3 hover:bg-bg-main rounded-2xl transition-all border border-transparent hover:border-border group"
                >
                  <X className="w-6 h-6 text-text-muted group-hover:text-text-main" />
                </button>
              </div>
              
              <div className="aspect-video bg-black relative group">
                <iframe 
                  src={activeVideo.url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
