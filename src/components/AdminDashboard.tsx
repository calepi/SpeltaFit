import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, deleteDoc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebase';
import { AnamnesisData, WorkoutPlan } from '../services/workoutGenerator';
import { Users, Activity, Target, Calendar, ChevronRight, ArrowLeft, Search, Dumbbell, Trash2, FileText, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';
import { WorkoutPlanView } from './WorkoutPlanView';
import { NutritionalPlanView } from './NutritionalPlanView';
import { NutriAnamnesisData, NutritionalPlan } from '../types/nutrition';

interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface StudentData {
  profile: UserProfile;
  anamnesis: AnamnesisData | null;
  plan: WorkoutPlan | null;
  nutriAnamnesis: NutriAnamnesisData | null;
  nutriPlan: NutritionalPlan | null;
  progress: any | null;
}

interface AdminDashboardProps {
  onViewDocumentation?: () => void;
  onViewPatent?: () => void;
}

export function AdminDashboard({ onViewDocumentation, onViewPatent }: AdminDashboardProps) {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showWipeModal, setShowWipeModal] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersList: UserProfile[] = [];
      usersSnap.forEach((doc) => {
        usersList.push(doc.data() as UserProfile);
      });
      // Sort by newest first
      usersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setStudents(usersList);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWipeDatabase = async () => {
    setShowWipeModal(false);
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      
      const deletePromises: Promise<void>[] = [];
      
      usersSnap.forEach((userDoc) => {
        const uid = userDoc.id;
        
        // Delete subcollections manually (Firestore doesn't delete them automatically when deleting parent doc)
        const deleteData = async () => {
          try {
            // Treino
            await deleteDoc(doc(db, `users/${uid}/data/anamnesis`)).catch(e => console.error(e));
            await deleteDoc(doc(db, `users/${uid}/data/workoutPlan`)).catch(e => console.error(e));
            await deleteDoc(doc(db, `users/${uid}/data/progress`)).catch(e => console.error(e));
            
            // Nutrição
            await deleteDoc(doc(db, `users/${uid}/data/nutriAnamnesis`)).catch(e => console.error(e));
            await deleteDoc(doc(db, `users/${uid}/data/nutriPlan`)).catch(e => console.error(e));
            await deleteDoc(doc(db, `users/${uid}/data/dietPlan`)).catch(e => console.error(e));
            await deleteDoc(doc(db, `users/${uid}/data/nutritionalAnamnesis`)).catch(e => console.error(e));
            await deleteDoc(doc(db, `users/${uid}/data/nutritionTracking`)).catch(e => console.error(e));
            
            // Outros
            await deleteDoc(doc(db, `users/${uid}/data/reminders`)).catch(e => console.error(e));
            
            // Delete evolution docs
            const evolutionSnap = await getDocs(collection(db, `users/${uid}/evolution`)).catch(e => { console.error(e); return null; });
            if (evolutionSnap) {
              const evPromises = evolutionSnap.docs.map(d => deleteDoc(d.ref));
              await Promise.all(evPromises).catch(e => console.error(e));
            }
            
            // Delete photos docs
            const photosSnap = await getDocs(collection(db, `users/${uid}/photos`)).catch(e => { console.error(e); return null; });
            if (photosSnap) {
              const phPromises = photosSnap.docs.map(d => deleteDoc(d.ref));
              await Promise.all(phPromises).catch(e => console.error(e));
            }
            
            // Delete activities docs
            const activitiesSnap = await getDocs(collection(db, `users/${uid}/activities`)).catch(e => { console.error(e); return null; });
            if (activitiesSnap) {
              const actPromises = activitiesSnap.docs.map(d => deleteDoc(d.ref));
              await Promise.all(actPromises).catch(e => console.error(e));
            }

            // Explicitly clear stats field to ensure gamification reset
            await updateDoc(doc(db, 'users', uid), { stats: deleteField() }).catch(e => console.error("Error clearing stats:", e));

            // Finally delete the user document
            await deleteDoc(doc(db, 'users', uid)).catch(e => console.error("Error deleting user doc:", e));
          } catch (e) {
            console.error(`Error deleting data for user ${uid}`, e);
          }
        };
        deletePromises.push(deleteData());
      });
      
      await Promise.all(deletePromises);
      
      // Delete all speltagram posts
      try {
        const postsSnap = await getDocs(collection(db, 'speltagram_posts'));
        const postDeletePromises: Promise<void>[] = [];
        postsSnap.forEach((postDoc) => {
          // Delete comments subcollection first
          const deletePostData = async () => {
            const commentsSnap = await getDocs(collection(db, `speltagram_posts/${postDoc.id}/comments`)).catch(() => null);
            if (commentsSnap) {
              commentsSnap.forEach(c => deleteDoc(c.ref).catch(() => {}));
            }
            await deleteDoc(postDoc.ref).catch(() => {});
          };
          postDeletePromises.push(deletePostData());
        });
        await Promise.all(postDeletePromises);
      } catch (e) {
        console.error("Error deleting speltagram posts", e);
      }

      // Force a full page reload to clear all React state in memory
      window.location.reload();
    } catch (error) {
      console.error("Erro ao limpar banco de dados:", error);
      setLoading(false);
    }
  };

  const loadStudentData = async (profile: UserProfile) => {
    setLoadingStudent(true);
    try {
      const anamnesisSnap = await getDoc(doc(db, `users/${profile.uid}/data/anamnesis`));
      const planSnap = await getDoc(doc(db, `users/${profile.uid}/data/workoutPlan`));
      const progressSnap = await getDoc(doc(db, `users/${profile.uid}/data/progress`));
      const nutriAnamnesisSnap = await getDoc(doc(db, `users/${profile.uid}/data/nutriAnamnesis`));
      const nutriPlanSnap = await getDoc(doc(db, `users/${profile.uid}/data/nutriPlan`));

      setSelectedStudent({
        profile,
        anamnesis: anamnesisSnap.exists() ? (anamnesisSnap.data() as AnamnesisData) : null,
        plan: planSnap.exists() ? (planSnap.data() as WorkoutPlan) : null,
        nutriAnamnesis: nutriAnamnesisSnap.exists() ? (nutriAnamnesisSnap.data() as NutriAnamnesisData) : null,
        nutriPlan: nutriPlanSnap.exists() ? (nutriPlanSnap.data() as NutritionalPlan) : null,
        progress: progressSnap.exists() ? progressSnap.data() : null,
      });
    } catch (error) {
      console.error("Error loading student data:", error);
    } finally {
      setLoadingStudent(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (selectedStudent) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <button 
          onClick={() => setSelectedStudent(null)}
          className="flex items-center gap-2 text-text-muted hover:text-brand transition-colors font-bold"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Lista de Alunos
        </button>

        <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center text-brand text-2xl font-black">
              {selectedStudent.profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black text-text-main">{selectedStudent.profile.name}</h2>
              <p className="text-text-muted">{selectedStudent.profile.email}</p>
            </div>
          </div>

          {!selectedStudent.anamnesis && !selectedStudent.plan && !selectedStudent.nutriPlan && (
            <div className="text-center py-12 bg-bg-main rounded-2xl border border-border">
              <Dumbbell className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-text-main mb-2">Nenhum dado encontrado</h3>
              <p className="text-text-muted">Este aluno ainda não preencheu a anamnese ou gerou um treino/dieta.</p>
            </div>
          )}

          <div className="space-y-12">
            {selectedStudent.plan && selectedStudent.anamnesis && (
              <div className="mt-8">
                <h3 className="text-xl font-black text-text-main mb-6 border-b border-border pb-4">Treino e Avaliação do Aluno</h3>
                <WorkoutPlanView 
                  plan={selectedStudent.plan} 
                  user={selectedStudent.anamnesis} 
                  onReset={() => {}} 
                  onUpdatePlan={() => {}} 
                  readOnly={true}
                  studentUid={selectedStudent.profile.uid}
                />
              </div>
            )}

            {selectedStudent.nutriPlan && selectedStudent.nutriAnamnesis && (
              <div className="mt-8">
                <h3 className="text-xl font-black text-text-main mb-6 border-b border-border pb-4">Plano Nutricional do Aluno</h3>
                <NutritionalPlanView 
                  plan={selectedStudent.nutriPlan} 
                  userData={selectedStudent.nutriAnamnesis} 
                  onReset={() => {}} 
                  readOnly={true}
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-text-main flex items-center gap-3">
            <Users className="w-8 h-8 text-brand" />
            Painel do Treinador
          </h2>
          <p className="text-text-muted mt-1">Gerencie seus alunos, treinos e evoluções.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input 
              type="text" 
              placeholder="Buscar aluno..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text-main focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all"
            />
          </div>
          <button
            onClick={() => setShowWipeModal(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl font-bold transition-all"
            title="Apagar todos os dados"
          >
            <Trash2 className="w-5 h-5" />
            <span className="hidden sm:inline">Resetar Banco</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-4 bg-brand/10 text-brand rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-text-muted font-bold">Total de Alunos</p>
            <p className="text-2xl font-black text-text-main">{students.length}</p>
          </div>
        </div>

        {onViewDocumentation && (
          <button 
            onClick={onViewDocumentation}
            className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-brand transition-all group text-left"
          >
            <div className="p-4 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-muted font-bold">Documentação</p>
              <p className="text-lg font-black text-text-main">Motores e DB</p>
            </div>
          </button>
        )}

        {onViewPatent && (
          <button 
            onClick={onViewPatent}
            className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-brand transition-all group text-left"
          >
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-muted font-bold">Propriedade Intelectual</p>
              <p className="text-lg font-black text-text-main">Dossiê de Patente</p>
            </div>
          </button>
        )}
      </div>

      <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-main border-b border-border">
                <th className="p-4 font-bold text-text-muted text-sm uppercase tracking-wider">Aluno</th>
                <th className="p-4 font-bold text-text-muted text-sm uppercase tracking-wider">Email</th>
                <th className="p-4 font-bold text-text-muted text-sm uppercase tracking-wider">Data de Cadastro</th>
                <th className="p-4 font-bold text-text-muted text-sm uppercase tracking-wider text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr 
                  key={student.uid} 
                  className="border-b border-border hover:bg-bg-main/50 transition-colors cursor-pointer"
                  onClick={() => loadStudentData(student)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-main">{student.name}</span>
                        {(student.email === 'calepi@gmail.com' || student.email === 'tazmania.crvg@gmail.com' || student.email === 'teste@speltafit.com' || student.role === 'admin') && (
                          <span className="px-2 py-0.5 bg-brand/10 text-brand text-[10px] font-black uppercase tracking-widest rounded-full">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-text-muted">{student.email}</td>
                  <td className="p-4 text-text-muted">
                    {new Date(student.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      className="inline-flex items-center justify-center p-2 text-brand hover:bg-brand/10 rounded-lg transition-colors"
                      disabled={loadingStudent}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-text-muted">
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showWipeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-3xl p-8 max-w-md w-full border border-border shadow-2xl">
            <div className="flex items-center gap-4 mb-6 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black">Resetar Banco</h3>
            </div>
            <p className="text-text-main mb-2 font-bold">ATENÇÃO: Esta ação é irreversível.</p>
            <p className="text-text-muted mb-8">Isso apagará TODOS os usuários, treinos e dados do banco de dados. Tem certeza que deseja continuar?</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowWipeModal(false)}
                className="flex-1 py-3 px-4 bg-bg-main text-text-main rounded-xl font-bold hover:bg-surface border border-border transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleWipeDatabase}
                className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                Sim, Apagar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
