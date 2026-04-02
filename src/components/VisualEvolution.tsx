import React from 'react';
import { Camera, Plus, Trash2, Calendar, ChevronLeft, ChevronRight, Ruler, Weight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { evolutionService, EvolutionPhoto, Measurement } from '../services/evolutionService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VisualEvolutionProps {
  userId: string;
}

export function VisualEvolution({ userId }: VisualEvolutionProps) {
  const [photos, setPhotos] = React.useState<EvolutionPhoto[]>([]);
  const [measurements, setMeasurements] = React.useState<Measurement[]>([]);
  const [showAddPhoto, setShowAddPhoto] = React.useState(false);
  const [showAddMeasurement, setShowAddMeasurement] = React.useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!userId) return;
    const unsubPhotos = evolutionService.subscribeToPhotos(userId, setPhotos);
    const unsubMeasurements = evolutionService.subscribeToMeasurements(userId, setMeasurements);
    return () => {
      unsubPhotos();
      unsubMeasurements();
    };
  }, [userId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, we'd upload to Firebase Storage. 
    // For this demo, we'll use a placeholder URL.
    const reader = new FileReader();
    reader.onloadend = async () => {
      await evolutionService.addPhoto(userId, {
        url: reader.result as string,
        type: 'front',
        notes: 'Nova foto de progresso'
      });
      setShowAddPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8">
      {/* Photos Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand/10 text-brand">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Diário de Fotos</h3>
          </div>
          <button 
            onClick={() => setShowAddPhoto(true)}
            className="p-3 rounded-2xl bg-brand text-text-inverse hover:scale-105 transition-all shadow-lg shadow-brand/20 active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {photos.length === 0 ? (
          <div className="bg-surface border border-border rounded-[2.5rem] p-12 text-center space-y-4">
            <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-10 h-10" />
            </div>
            <p className="text-text-muted font-medium">Nenhuma foto registrada ainda. Comece a documentar sua jornada!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <motion.div 
                key={photo.id}
                layoutId={photo.id}
                onClick={() => setSelectedPhotoIndex(index)}
                className="aspect-[3/4] rounded-3xl overflow-hidden bg-bg-main border border-border cursor-pointer group relative"
              >
                <img 
                  src={photo.url} 
                  alt="Evolução" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                  <p className="text-white text-xs font-black uppercase tracking-widest">
                    {format(photo.timestamp.toDate(), 'dd MMM yyyy', { locale: ptBR })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Measurements Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
              <Ruler className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Medidas Corporais</h3>
          </div>
          <button 
            onClick={() => setShowAddMeasurement(true)}
            className="p-3 rounded-2xl bg-blue-500 text-text-inverse hover:scale-105 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-bg-main border-b border-border">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-text-muted">Data</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-text-muted">Peso</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-text-muted">Cintura</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-text-muted">Braço D/E</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-text-muted">Coxa D/E</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {measurements.map((m) => (
                  <tr key={m.id} className="hover:bg-bg-main/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm">
                      {format(m.timestamp.toDate(), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 font-black text-brand">{m.weight}kg</td>
                    <td className="px-6 py-4 font-medium">{m.waist || '-'}cm</td>
                    <td className="px-6 py-4 font-medium">{m.armRight || '-'}/{m.armLeft || '-'}cm</td>
                    <td className="px-6 py-4 font-medium">{m.thighRight || '-'}/{m.thighLeft || '-'}cm</td>
                  </tr>
                ))}
                {measurements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-text-muted font-medium">
                      Nenhuma medida registrada ainda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Photo Comparison Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8"
          >
            <button 
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-8 right-8 p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
            >
              <Plus className="w-8 h-8 rotate-45" />
            </button>

            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Before (Previous Photo) */}
              <div className="space-y-4">
                <h4 className="text-white text-center font-black uppercase tracking-widest opacity-60">Anterior</h4>
                <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden border-2 border-white/10">
                  {selectedPhotoIndex < photos.length - 1 ? (
                    <img 
                      src={photos[selectedPhotoIndex + 1].url} 
                      className="w-full h-full object-cover"
                      alt="Antes"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/20 text-center p-8">
                      <p className="font-black uppercase tracking-widest">Primeira foto registrada</p>
                    </div>
                  )}
                </div>
                {selectedPhotoIndex < photos.length - 1 && (
                  <p className="text-white text-center font-bold">
                    {format(photos[selectedPhotoIndex + 1].timestamp.toDate(), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                )}
              </div>

              {/* After (Selected Photo) */}
              <div className="space-y-4">
                <h4 className="text-brand text-center font-black uppercase tracking-widest">Atual</h4>
                <div className="aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-brand shadow-2xl shadow-brand/20">
                  <img 
                    src={photos[selectedPhotoIndex].url} 
                    className="w-full h-full object-cover"
                    alt="Depois"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-brand text-center font-black">
                  {format(photos[selectedPhotoIndex].timestamp.toDate(), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button 
                disabled={selectedPhotoIndex === photos.length - 1}
                onClick={() => setSelectedPhotoIndex(selectedPhotoIndex + 1)}
                className="p-4 rounded-2xl bg-white/10 text-white disabled:opacity-20 hover:bg-white/20 transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                disabled={selectedPhotoIndex === 0}
                onClick={() => setSelectedPhotoIndex(selectedPhotoIndex - 1)}
                className="p-4 rounded-2xl bg-white/10 text-white disabled:opacity-20 hover:bg-white/20 transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Photo Modal */}
      <AnimatePresence>
        {showAddPhoto && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface border border-border rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black tracking-tight">Adicionar Foto</h3>
                <button onClick={() => setShowAddPhoto(false)} className="p-2 hover:bg-bg-main rounded-xl transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="space-y-6">
                <label className="block aspect-[3/4] rounded-3xl border-4 border-dashed border-border hover:border-brand hover:bg-brand/5 transition-all cursor-pointer relative group">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
                    <div className="p-4 rounded-2xl bg-brand/10 text-brand group-hover:scale-110 transition-transform">
                      <Camera className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="font-black text-lg">Clique para subir</p>
                      <p className="text-sm text-text-muted font-medium">Ou arraste sua foto aqui</p>
                    </div>
                  </div>
                </label>
                <p className="text-xs text-text-muted text-center font-medium">
                  Dica: Tente usar a mesma iluminação e posição para melhores comparações.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Measurement Modal */}
      <AnimatePresence>
        {showAddMeasurement && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface border border-border rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black tracking-tight">Novas Medidas</h3>
                <button onClick={() => setShowAddMeasurement(false)} className="p-2 hover:bg-bg-main rounded-xl transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                await evolutionService.addMeasurement(userId, {
                  weight: Number(formData.get('weight')),
                  waist: Number(formData.get('waist')) || undefined,
                  armRight: Number(formData.get('armRight')) || undefined,
                  armLeft: Number(formData.get('armLeft')) || undefined,
                  thighRight: Number(formData.get('thighRight')) || undefined,
                  thighLeft: Number(formData.get('thighLeft')) || undefined,
                });
                setShowAddMeasurement(false);
              }} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-2">Peso (kg)</label>
                    <input name="weight" type="number" step="0.1" required className="w-full px-6 py-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-2">Cintura (cm)</label>
                    <input name="waist" type="number" step="0.1" className="w-full px-6 py-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-2">Braço D (cm)</label>
                    <input name="armRight" type="number" step="0.1" className="w-full px-6 py-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-2">Braço E (cm)</label>
                    <input name="armLeft" type="number" step="0.1" className="w-full px-6 py-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-2">Coxa D (cm)</label>
                    <input name="thighRight" type="number" step="0.1" className="w-full px-6 py-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-2">Coxa E (cm)</label>
                    <input name="thighLeft" type="number" step="0.1" className="w-full px-6 py-4 rounded-2xl bg-bg-main border border-border focus:border-brand outline-none font-bold" />
                  </div>
                </div>

                <button type="submit" className="w-full py-4 rounded-2xl bg-brand text-text-inverse font-black shadow-xl shadow-brand/20 hover:scale-[1.02] transition-all active:scale-95">
                  Salvar Medidas
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
