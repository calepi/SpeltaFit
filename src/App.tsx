import React, { useState, useEffect } from 'react';
import { AnamnesisForm } from './components/AnamnesisForm';
import { WorkoutPlanView } from './components/WorkoutPlanView';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { AnamnesisData, WorkoutPlan, ExistingDay } from './services/workoutGenerator';
import { generateWorkoutPlanRuleBased } from './services/workoutGenerator';
import { Logo } from './components/Logo';
import { LogIn, LogOut, User as UserIcon, Shield, BookOpen, Apple, Users, Palette, TrendingUp, HelpCircle, Trophy, Bell } from 'lucide-react';
import { ReminderSettings } from './components/ReminderSettings';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

import { NutritionalTool } from './components/NutritionalTool';
import { WorkoutComparisonView } from './components/WorkoutComparisonView';
import { SpeltaGramFeed } from './components/SpeltaGram';
import { EvolutionCharts } from './components/EvolutionCharts';
import { UserManual } from './components/UserManual';
import { GamificationDashboard } from './components/GamificationDashboard';

type AppState = 'landing' | 'form' | 'plan' | 'admin' | 'library' | 'nutrition' | 'speltagram' | 'evolution' | 'manual' | 'comparison' | 'gamification' | 'reminders';
type Theme = 'default' | 'green' | 'blue' | 'gold';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [userData, setUserData] = useState<AnamnesisData | null>(null);
  const [proposedPlan, setProposedPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('default');
  
  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Load theme from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('fitgenius_theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Handle Firebase Auth and Data Loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Clear local storage and state to prevent data bleed from previous user
        setPlan(null);
        setUserData(null);
        localStorage.removeItem('fitgenius_plan');
        localStorage.removeItem('fitgenius_user');
        localStorage.removeItem('fitgenius_completed_sets');
        localStorage.removeItem('fitgenius_actual_loads');

        // Load data from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          
          // Ensure user document exists
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || 'Aluno',
            role: 'user',
            createdAt: new Date().toISOString()
          }, { merge: true });

          const anamnesisRef = doc(db, `users/${currentUser.uid}/data/anamnesis`);
          const planRef = doc(db, `users/${currentUser.uid}/data/workoutPlan`);
          
          const [anamnesisSnap, planSnap] = await Promise.all([
            getDoc(anamnesisRef),
            getDoc(planRef)
          ]);

          if (anamnesisSnap.exists() && planSnap.exists()) {
            setUserData(anamnesisSnap.data() as AnamnesisData);
            setPlan(planSnap.data() as WorkoutPlan);
            // Do not auto-redirect to plan to allow users to see the landing page
          } else {
            setPlan(null);
            setUserData(null);
            if (appState === 'plan') setAppState('landing');
          }
        } catch (err) {
          console.error("Error loading user data from Firestore:", err);
        }
      } else {
        // Clear state if not logged in
        setPlan(null);
        setUserData(null);
        if (appState === 'plan' || appState === 'form' || appState === 'admin') {
          setAppState('landing');
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        alert(`Erro ao fazer login (${err.code || 'erro desconhecido'}). Certifique-se de que o domínio está autorizado no Console do Firebase.`);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setPlan(null);
      setUserData(null);
      setAppState('landing');
      localStorage.removeItem('fitgenius_plan');
      localStorage.removeItem('fitgenius_user');
      localStorage.removeItem('fitgenius_completed_sets');
      localStorage.removeItem('fitgenius_actual_loads');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('fitgenius_theme', newTheme);
  };

  const handleAnamnesisSubmit = async (data: AnamnesisData) => {
    if (!user) {
      alert("Você precisa estar logado para gerar um treino.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const generatedPlan = await generateWorkoutPlanRuleBased(data);
      
      if (data.remodelPlan && data.structuredExistingPlan && data.structuredExistingPlan.length > 0) {
        setProposedPlan(generatedPlan);
        setUserData(data);
        setAppState('comparison');
      } else {
        setPlan(generatedPlan);
        setUserData(data);
        setAppState('plan');
        
        // Save to Firestore (only if not going to comparison)
        await savePlanToFirestore(data, generatedPlan);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao gerar seu plano. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const savePlanToFirestore = async (data: AnamnesisData, finalPlan: WorkoutPlan) => {
    if (!user) return;
    
    const anamnesisRef = doc(db, `users/${user.uid}/data/anamnesis`);
    const planRef = doc(db, `users/${user.uid}/data/workoutPlan`);
    
    const cleanObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(cleanObject);
      } else if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, cleanObject(v)])
        );
      }
      return obj;
    };

    const cleanData = cleanObject(data);
    const cleanPlan = cleanObject(finalPlan);

    await Promise.all([
      setDoc(anamnesisRef, { ...cleanData, updatedAt: new Date().toISOString() }),
      setDoc(planRef, { ...cleanPlan, createdAt: new Date().toISOString() })
    ]);
    
    const progressRef = doc(db, `users/${user.uid}/data/progress`);
    await deleteDoc(progressRef).catch(() => {});
  };

  const handleComparisonConfirm = async (finalPlan: WorkoutPlan) => {
    if (!user || !userData) return;
    setPlan(finalPlan);
    setAppState('plan');
    await savePlanToFirestore(userData, finalPlan);
  };

  const handleUpdatePlan = async (newPlan: WorkoutPlan) => {
    if (!user) return;
    setPlan(newPlan);
    const planRef = doc(db, `users/${user.uid}/data/workoutPlan`);
    
    // Deep clean undefined values before saving to Firestore
    const cleanObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(cleanObject);
      } else if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, cleanObject(v)])
        );
      }
      return obj;
    };

    const cleanPlan = cleanObject(newPlan);
    await setDoc(planRef, { ...cleanPlan, createdAt: new Date().toISOString() });
  };

  const handleReset = async () => {
    // If we have a current plan, we can use it as the "Existing Plan" for the next form
    const currentPlanAsExisting: ExistingDay[] = plan?.weeklyRoutine.map(day => ({
      dayName: day.day,
      exercises: day.exercises?.map(ex => ({
        name: ex.name,
        sets: ex.sets.toString(),
        reps: ex.reps
      })) || []
    })) || [];

    const previousUserData = userData;

    setPlan(null);
    setUserData(previousUserData ? {
      ...previousUserData,
      structuredExistingPlan: currentPlanAsExisting,
      remodelPlan: true // Default to remodel for re-evaluations
    } : null);
    setError(null);
    setAppState('form');
    
    // We don't delete from Firestore here anymore, we just move to the form
    // The data will be overwritten when the new plan is generated
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-main text-text-main font-sans transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border bg-bg-main/80 backdrop-blur-md sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => {
              window.scrollTo(0,0);
              setAppState('landing');
            }}
          >
            <Logo size="sm" />
          </div>

            <div className="flex items-center gap-2">
            {user && (
              <>
                <button 
                  onClick={() => setAppState(appState === 'gamification' ? 'plan' : 'gamification')}
                  className={`p-2 rounded-xl transition-colors ${appState === 'gamification' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                  title="Gamificação"
                >
                  <Trophy className="w-5 h-5" />
                </button>

                <button 
                  onClick={() => setAppState(appState === 'reminders' ? 'plan' : 'reminders')}
                  className={`p-2 rounded-xl transition-colors ${appState === 'reminders' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                  title="Lembretes"
                >
                  <Bell className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setAppState(appState === 'evolution' ? 'plan' : 'evolution')}
                  className={`p-2 rounded-xl transition-colors ${appState === 'evolution' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                  title="Evolução"
                >
                  <TrendingUp className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setAppState(appState === 'speltagram' ? 'plan' : 'speltagram')}
                  className={`p-2 rounded-xl transition-colors ${appState === 'speltagram' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                  title="SpeltaGram"
                >
                  <Users className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setAppState(appState === 'nutrition' ? 'plan' : 'nutrition')}
                  className={`p-2 rounded-xl transition-colors ${appState === 'nutrition' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                  title="Ferramenta Nutricional"
                >
                  <Apple className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setAppState(appState === 'manual' ? 'plan' : 'manual')}
                  className={`p-2 rounded-xl transition-colors ${appState === 'manual' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                  title="Manual do Usuário"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </>
            )}
            {user ? (
              <div className="flex items-center gap-3 mr-2">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold text-text-main">{user.displayName}</span>
                  <span className="text-xs text-text-muted">{user.email}</span>
                </div>
                {user.email === 'calepi@gmail.com' && (
                  <button 
                    onClick={() => setAppState('admin')}
                    className={`p-2 ml-1 rounded-xl transition-colors ${appState === 'admin' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                    title="Painel do Treinador"
                  >
                    <Shield className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={() => setAppState('library')}
                  className={`p-2 ml-1 rounded-xl transition-colors ${appState === 'library' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                  title="Biblioteca de Exercícios"
                >
                  <BookOpen className="w-5 h-5" />
                </button>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-border" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand/20 text-brand flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <button 
                  onClick={handleLogout}
                  className="p-2 ml-1 rounded-full hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 mr-2 rounded-xl bg-brand/10 text-brand hover:bg-brand/20 transition-colors font-bold text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}

            <div className="group relative">
              <button className="p-2 rounded-full hover:bg-surface transition-colors flex items-center gap-2 text-text-muted hover:text-text-main">
                <Palette className="w-5 h-5" />
                <span className="hidden sm:inline text-sm font-medium">Tema</span>
              </button>
              <div className="absolute right-0 top-full mt-2 bg-surface border border-border rounded-xl shadow-xl p-2 hidden group-hover:flex flex-col gap-1 min-w-[120px]">
                <button onClick={() => handleThemeChange('default')} className={`px-3 py-2 rounded-lg text-sm text-left hover:bg-bg-main transition-colors ${theme === 'default' ? 'text-brand font-bold' : 'text-text-main'}`}>Laranja (Padrão)</button>
                <button onClick={() => handleThemeChange('green')} className={`px-3 py-2 rounded-lg text-sm text-left hover:bg-bg-main transition-colors ${theme === 'green' ? 'text-brand font-bold' : 'text-text-main'}`}>Verde</button>
                <button onClick={() => handleThemeChange('blue')} className={`px-3 py-2 rounded-lg text-sm text-left hover:bg-bg-main transition-colors ${theme === 'blue' ? 'text-brand font-bold' : 'text-text-main'}`}>Azul</button>
                <button onClick={() => handleThemeChange('gold')} className={`px-3 py-2 rounded-lg text-sm text-left hover:bg-bg-main transition-colors ${theme === 'gold' ? 'text-brand font-bold' : 'text-text-main'}`}>Dourado</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {appState === 'landing' && (
          <LandingPage 
            onStart={async () => {
              if (user) {
                setAppState('form');
              } else {
                try {
                  await signInWithPopup(auth, googleProvider);
                  setAppState('form');
                } catch (err: any) {
                  console.error("Login error:", err);
                  if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
                    alert("Você precisa fazer login para criar um treino.");
                  }
                }
              }
            }} 
            hasPlan={!!plan}
            onContinue={() => setAppState('plan')}
          />
        )}

        {appState === 'form' && (
          <AnamnesisForm 
            onSubmit={handleAnamnesisSubmit} 
            isLoading={isLoading} 
            initialData={userData}
          />
        )}

        {appState === 'comparison' && userData && proposedPlan && (
          <WorkoutComparisonView 
            userData={userData} 
            proposedPlan={proposedPlan} 
            onConfirm={handleComparisonConfirm}
            onCancel={() => setAppState('form')}
          />
        )}

        {appState === 'plan' && plan && userData && (
          <WorkoutPlanView 
            plan={plan} 
            user={userData} 
            onReset={handleReset} 
            onUpdatePlan={handleUpdatePlan}
          />
        )}

        {appState === 'admin' && user?.email === 'calepi@gmail.com' && (
          <AdminDashboard />
        )}

        {appState === 'library' && (
          <ExerciseLibrary />
        )}

        {appState === 'nutrition' && userData && (
          <NutritionalTool 
            physicalAnamnesis={userData} 
            onBack={() => setAppState('plan')} 
          />
        )}

        {appState === 'speltagram' && user && (
          <SpeltaGramFeed 
            user={user} 
            isAdmin={user.email === 'calepi@gmail.com'} 
          />
        )}

        {appState === 'evolution' && user && (
          <EvolutionCharts userId={user.uid} />
        )}

        {appState === 'gamification' && user && (
          <GamificationDashboard userId={user.uid} />
        )}

        {appState === 'reminders' && (
          <ReminderSettings />
        )}

        {appState === 'manual' && (
          <UserManual />
        )}
      </main>

      {/* Footer / Credits */}
      <footer className="border-t border-border bg-bg-main/50 py-6 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-text-muted">
            Ferramenta desenvolvida por <span className="font-semibold text-brand">Carlos Alexandre Pinheiro</span> e <span className="font-semibold text-brand">Márcio Spelta</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
