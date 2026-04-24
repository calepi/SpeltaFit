import React, { useState, useEffect } from 'react';
import { Profile360Form } from './components/Profile360Form';
import { FisioPlanView } from './components/FisioPlanView';
import { generateFisioPlan, FisioPlan } from './services/fisioGenerator';
import { WorkoutPlanView } from './components/WorkoutPlanView';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { AnamnesisData, WorkoutPlan, ExistingDay } from './services/workoutGenerator';
import { generateWorkoutPlanRuleBased } from './services/workoutGenerator';
import { Logo } from './components/Logo';
import { LogIn, LogOut, User as UserIcon, Shield, BookOpen, Users, Palette, TrendingUp, HelpCircle, Trophy, Bell, Menu, X, LayoutDashboard } from 'lucide-react';
import { ReminderSettings } from './components/ReminderSettings';
import { ReminderManager } from './components/ReminderManager';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

import { WorkoutComparisonView } from './components/WorkoutComparisonView';
import { SpeltaGramFeed } from './components/SpeltaGram';
import { EvolutionCharts } from './components/EvolutionCharts';
import { UserManual } from './components/UserManual';
import { TechnicalDocumentation } from './components/TechnicalDocumentation';
import { GamificationDashboard } from './components/GamificationDashboard';
import { TermsOfService } from './components/TermsOfService';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { PatentDocumentation } from './components/PatentDocumentation';
import { Paywall } from './components/Paywall';
import { NutritionalPlanView } from './components/NutritionalPlanView';
import { AuthModal } from './components/AuthModal';
import { NutriAnamnesisData, NutritionalPlan } from './types/nutrition';
import { generateNutritionalPlan } from './services/nutritionGenerator';

type AppState = 'landing' | 'form' | 'dashboard' | 'admin' | 'library' | 'speltagram' | 'evolution' | 'manual' | 'documentation' | 'patent' | 'comparison' | 'gamification' | 'reminders' | 'terms' | 'privacy' | 'paywall';
type Theme = 'default' | 'green' | 'blue' | 'gold';

export default function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [userData, setUserData] = useState<AnamnesisData | null>(null);
  const [nutriData, setNutriData] = useState<NutriAnamnesisData | null>(null);
  const [nutriPlan, setNutriPlan] = useState<NutritionalPlan | null>(null);
  const [fisioPlan, setFisioPlan] = useState<FisioPlan | null>(null);
  const [proposedPlan, setProposedPlan] = useState<WorkoutPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>('default');
  
  // Firebase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState<'workout' | 'nutrition' | 'fisio'>('workout');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [appState]);

  // ============================================================================
  // MODO DE REVISÃO DA PLAY STORE
  // ============================================================================
  // ATENÇÃO: Mantenha como TRUE enquanto o app estiver em análise pelo Google.
  // Isso esconde os preços e o paywall para evitar rejeição por não usar o 
  // Google Play Billing.
  // Mude para FALSE após o app ser aprovado e publicado na loja.
  const IS_PLAY_STORE_REVIEW_MODE = true; 
  // ============================================================================

  // Handle Firebase Auth and Data Loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Clear state to prevent data bleed from previous user
        setPlan(null);
        setUserData(null);

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

          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setHasSubscription(userData.hasSubscription === true || userData.role === 'admin' || currentUser.email === 'calepi@gmail.com');
            setTrialEndsAt(userData.trialEndsAt || null);
            if (userData.theme) {
              setTheme(userData.theme as Theme);
              document.documentElement.setAttribute('data-theme', userData.theme);
            }
          }

          const anamnesisRef = doc(db, `users/${currentUser.uid}/data/anamnesis`);
          const planRef = doc(db, `users/${currentUser.uid}/data/workoutPlan`);
          const nutriAnamnesisRef = doc(db, `users/${currentUser.uid}/data/nutriAnamnesis`);
          const nutriPlanRef = doc(db, `users/${currentUser.uid}/data/nutriPlan`);
          const fisioPlanRef = doc(db, `users/${currentUser.uid}/data/fisioPlan`);
          
          const [anamnesisSnap, planSnap, nutriAnamnesisSnap, nutriPlanSnap, fisioPlanSnap] = await Promise.all([
            getDoc(anamnesisRef),
            getDoc(planRef),
            getDoc(nutriAnamnesisRef),
            getDoc(nutriPlanRef),
            getDoc(fisioPlanRef)
          ]);

          if (anamnesisSnap.exists() && planSnap.exists()) {
            setUserData(anamnesisSnap.data() as AnamnesisData);
            setPlan(planSnap.data() as WorkoutPlan);
            // Do not auto-redirect to plan to allow users to see the landing page
          } else {
            setPlan(null);
            setUserData(null);
            if (appState === 'dashboard') setAppState('landing');
          }

          if (nutriAnamnesisSnap.exists()) {
            setNutriData(nutriAnamnesisSnap.data() as NutriAnamnesisData);
          } else {
            setNutriData(null);
          }

          if (nutriPlanSnap.exists()) {
            setNutriPlan(nutriPlanSnap.data() as NutritionalPlan);
          } else {
            setNutriPlan(null);
          }
          
          if (fisioPlanSnap.exists()) {
            setFisioPlan(fisioPlanSnap.data() as FisioPlan);
          } else {
            setFisioPlan(null);
          }
        } catch (err) {
          console.error("Error loading user data from Firestore:", err);
        }
      } else {
        // Clear state if not logged in
        setPlan(null);
        setUserData(null);
        setNutriData(null);
        setNutriPlan(null);
        setFisioPlan(null);
        if (appState === 'dashboard' || appState === 'form' || appState === 'admin') {
          setAppState('landing');
        }
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setPlan(null);
      setUserData(null);
      setHasSubscription(false);
      setAppState('landing');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSubscribe = async () => {
    if (!user) return;
    setIsProcessingPayment(true);
    
    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { hasSubscription: true }, { merge: true });
        setHasSubscription(true);
        alert("Pagamento aprovado! Bem-vindo ao SpeltaFit Premium.");
      } catch (error) {
        console.error("Error updating subscription:", error);
        alert("Erro ao processar assinatura. Tente novamente.");
      } finally {
        setIsProcessingPayment(false);
      }
    }, 2000);
  };

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { theme: newTheme }, { merge: true });
      } catch (err) {
        console.error("Error saving theme:", err);
      }
    }
  };

  const handleProfile360Submit = async (data: AnamnesisData) => {
    if (!user) {
      alert("Você precisa estar logado para gerar seu ecossistema esportivo.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const finalData = { ...data };
      if (!finalData.trainingStartDate) {
        finalData.trainingStartDate = new Date().toISOString();
      }

      // Generate all 3 engines
      const genWorkout = await generateWorkoutPlanRuleBased(finalData);
      const generatedFisio = generateFisioPlan(finalData);
      
      // We need to map Profile360 to NutriAnamnesis data format or just use the same data
      // For now we map what we can
      const nutriMappedData: NutriAnamnesisData = {
        name: finalData.name,
        age: finalData.age || 0,
        gender: finalData.gender as any,
        weight: finalData.weight || 0,
        height: finalData.height || 0,
        bodyFatPercentage: finalData.bodyFat,
        goal: finalData.goal,
        activityLevel: finalData.activityLevel || 'Moderadamente Ativo',
        trainingFrequency: `${finalData.daysPerWeek} dias`,
        dietaryPreference: finalData.dietaryPreference || '',
        allergiesIntolerances: finalData.allergiesIntolerances || [],
        foodAversions: finalData.foodAversions || [],
        mealsPerDay: finalData.mealsPerDay || '4 refeições',
        waterIntake: finalData.waterIntake || '1 a 2 Litros',
        emotionalEating: finalData.emotionalEating || [],
        stressLevel: finalData.stressLevel || '',
        sleepQuality: finalData.sleepQuality || '',
        energyLevels: 'Normal', // Defaulting as removed from AnamnesisData
        bowelMovement: finalData.bowelMovement || '',
        medicalConditions: finalData.medicalConditions || [],
        currentSupplements: [],
        medications: finalData.medications || ''
      };
      
      const genNutri = await generateNutritionalPlan(nutriMappedData, finalData);

      setPlan(genWorkout);
      setFisioPlan(generatedFisio);
      setNutriPlan(genNutri);
      setUserData(finalData);
      setNutriData(nutriMappedData);
      
      if (finalData.remodelPlan && finalData.structuredExistingPlan && finalData.structuredExistingPlan.length > 0) {
        setProposedPlan(genWorkout);
        setAppState('comparison');
      } else {
        setAppState('dashboard');
        await saveAllPlansToFirestore(finalData, genWorkout, nutriMappedData, genNutri, generatedFisio);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao gerar seus planos. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveAllPlansToFirestore = async (
    data: AnamnesisData, 
    workout: WorkoutPlan, 
    nutriDat: NutriAnamnesisData, 
    nutriPln: NutritionalPlan,
    fisio: FisioPlan | null
  ) => {
    if (!user) return;
    
    const dbRefs = {
      anamnesis: doc(db, `users/${user.uid}/data/anamnesis`),
      workoutPlan: doc(db, `users/${user.uid}/data/workoutPlan`),
      nutriAnamnesis: doc(db, `users/${user.uid}/data/nutriAnamnesis`),
      nutriPlan: doc(db, `users/${user.uid}/data/nutriPlan`),
      fisioPlan: doc(db, `users/${user.uid}/data/fisioPlan`)
    };
    
    const cleanObject = (obj: any): any => {
      if (Array.isArray(obj)) return obj.map(cleanObject);
      else if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, cleanObject(v)])
        );
      }
      return obj;
    };

    const promises = [
      setDoc(dbRefs.anamnesis, { ...cleanObject(data), updatedAt: new Date().toISOString() }),
      setDoc(dbRefs.workoutPlan, { ...cleanObject(workout), createdAt: new Date().toISOString() }),
      setDoc(dbRefs.nutriAnamnesis, { ...cleanObject(nutriDat), updatedAt: new Date().toISOString() }),
      setDoc(dbRefs.nutriPlan, { ...cleanObject(nutriPln), createdAt: new Date().toISOString() })
    ];
    
    if (fisio) {
      promises.push(setDoc(dbRefs.fisioPlan, { ...cleanObject(fisio), createdAt: new Date().toISOString() }));
    } else {
      promises.push(deleteDoc(dbRefs.fisioPlan).catch(() => {}));
    }

    await Promise.all(promises);
    
    const progressRef = doc(db, `users/${user.uid}/data/progress`);
    await deleteDoc(progressRef).catch(() => {});
  };

  const handleComparisonConfirm = async (finalPlan: WorkoutPlan) => {
    if (!user || !userData || !nutriData || !nutriPlan) return;
    setPlan(finalPlan);
    setAppState('dashboard');
    
    await saveAllPlansToFirestore(userData, finalPlan, nutriData, nutriPlan, fisioPlan);
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
    if (!user) return;

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

    // 1. Clear local state
    setPlan(null);
    setNutriPlan(null);
    setFisioPlan(null);
    setUserData(previousUserData ? {
      ...previousUserData,
      structuredExistingPlan: currentPlanAsExisting,
      remodelPlan: true // Default to remodel for re-evaluations
    } : null);
    setError(null);
    setAppState('form');
    
    // 2. Delete from Firestore for a clean reset
    try {
      const anamnesisRef = doc(db, `users/${user.uid}/data/anamnesis`);
      const planRef = doc(db, `users/${user.uid}/data/workoutPlan`);
      const dietPlanRef = doc(db, `users/${user.uid}/data/dietPlan`);
      const nutritionalAnamnesisRef = doc(db, `users/${user.uid}/data/nutriAnamnesis`);
      const getNutriPlanRef = doc(db, `users/${user.uid}/data/nutriPlan`);
      const getFisioPlanRef = doc(db, `users/${user.uid}/data/fisioPlan`);
      const trackingRef = doc(db, `users/${user.uid}/data/nutritionTracking`); // If this exists as a doc
      
      await Promise.all([
        deleteDoc(anamnesisRef).catch(() => {}),
        deleteDoc(planRef).catch(() => {}),
        deleteDoc(dietPlanRef).catch(() => {}),
        deleteDoc(nutritionalAnamnesisRef).catch(() => {}),
        deleteDoc(getNutriPlanRef).catch(() => {}),
        deleteDoc(getFisioPlanRef).catch(() => {}),
        deleteDoc(trackingRef).catch(() => {})
      ]);
    } catch (err) {
      console.error("Error resetting plan in Firestore:", err);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  const isSpecialAccount = user?.email === 'calepi@gmail.com' || user?.email === 'tazmania.crvg@gmail.com' || user?.email === 'teste@speltafit.com';
  const isTrialActive = trialEndsAt ? new Date() < new Date(trialEndsAt) : false;
  const daysLeft = trialEndsAt ? Math.ceil((new Date(trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const showPaywall = !IS_PLAY_STORE_REVIEW_MODE && user && !hasSubscription && !isTrialActive && !isSpecialAccount && appState !== 'terms' && appState !== 'privacy' && appState !== 'landing';

  return (
    <div className="min-h-screen flex flex-col bg-bg-main text-text-main font-sans transition-colors duration-300">
      {!IS_PLAY_STORE_REVIEW_MODE && user && !hasSubscription && isTrialActive && !isSpecialAccount && (
        <div className="bg-brand text-white text-center py-2 px-4 text-sm font-bold flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 print:hidden">
          <span>Você está no período de teste. Restam {daysLeft} dias.</span>
          <button onClick={() => setAppState('paywall')} className="bg-white text-brand px-3 py-1 rounded-full text-xs hover:bg-gray-100 transition-colors">
            Assinar Premium
          </button>
        </div>
      )}
      {/* Header */}
      <header className="border-b border-border bg-bg-main/80 backdrop-blur-md sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => {
              window.scrollTo(0,0);
              setAppState('landing');
              setIsMobileMenuOpen(false);
            }}
          >
            <Logo size="sm" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {user && (
              <>
                <button 
                  onClick={() => setAppState('dashboard')}
                  className={`p-2 rounded-xl transition-colors ${appState === 'dashboard' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                  title="Painel Central do Aluno"
                >
                  <LayoutDashboard className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setAppState(appState === 'gamification' ? 'dashboard' : 'gamification')}
                  className={`p-2 rounded-xl transition-colors ${appState === 'gamification' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                  title="Gamificação"
                >
                  <Trophy className="w-5 h-5" />
                </button>

                <button 
                  onClick={() => setAppState(appState === 'reminders' ? 'dashboard' : 'reminders')}
                  className={`p-2 rounded-xl transition-colors ${appState === 'reminders' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                  title="Lembretes"
                >
                  <Bell className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setAppState(appState === 'evolution' ? 'dashboard' : 'evolution')}
                  className={`p-2 rounded-xl transition-colors ${appState === 'evolution' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                  title="Evolução"
                >
                  <TrendingUp className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setAppState(appState === 'speltagram' ? 'dashboard' : 'speltagram')}
                  className={`p-2 rounded-xl transition-colors ${appState === 'speltagram' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                  title="SpeltaGram"
                >
                  <Users className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setAppState(appState === 'manual' ? 'dashboard' : 'manual')}
                  className={`p-2 rounded-xl transition-colors ${appState === 'manual' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                  title="Manual do Usuário"
                >
                  <HelpCircle className="w-5 h-5" />
                </button>
              </>
            )}
            {user ? (
              <div className="flex items-center gap-3 ml-2 border-l border-border pl-4">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-sm font-bold text-text-main">{user.displayName}</span>
                  <span className="text-xs text-text-muted">{user.email}</span>
                </div>
                {(user.email === 'calepi@gmail.com' || user.email === 'tazmania.crvg@gmail.com') && (
                  <button 
                    onClick={() => setAppState('admin')}
                    className={`p-2 rounded-xl transition-colors ${appState === 'admin' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
                    title="Painel do Treinador"
                  >
                    <Shield className="w-5 h-5" />
                  </button>
                )}
                <button 
                  onClick={() => setAppState('library')}
                  className={`p-2 rounded-xl transition-colors ${appState === 'library' ? 'bg-brand text-text-inverse' : 'bg-brand/10 text-brand hover:bg-brand/20'}`}
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
                  className="p-2 rounded-full hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 ml-2 rounded-xl bg-brand/10 text-brand hover:bg-brand/20 transition-colors font-bold text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </button>
            )}

            <div className="group relative ml-2">
              <button className="p-2 rounded-full hover:bg-surface transition-colors flex items-center gap-2 text-text-muted hover:text-text-main">
                <Palette className="w-5 h-5" />
              </button>
              <div className="absolute right-0 top-full mt-2 bg-surface border border-border rounded-xl shadow-xl p-2 hidden group-hover:flex flex-col gap-1 min-w-[120px]">
                <button onClick={() => handleThemeChange('default')} className={`px-3 py-2 rounded-lg text-sm text-left hover:bg-bg-main transition-colors ${theme === 'default' ? 'text-brand font-bold' : 'text-text-main'}`}>Laranja (Padrão)</button>
                <button onClick={() => handleThemeChange('green')} className={`px-3 py-2 rounded-lg text-sm text-left hover:bg-bg-main transition-colors ${theme === 'green' ? 'text-brand font-bold' : 'text-text-main'}`}>Verde</button>
                <button onClick={() => handleThemeChange('blue')} className={`px-3 py-2 rounded-lg text-sm text-left hover:bg-bg-main transition-colors ${theme === 'blue' ? 'text-brand font-bold' : 'text-text-main'}`}>Azul</button>
                <button onClick={() => handleThemeChange('gold')} className={`px-3 py-2 rounded-lg text-sm text-left hover:bg-bg-main transition-colors ${theme === 'gold' ? 'text-brand font-bold' : 'text-text-main'}`}>Dourado</button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {user && user.photoURL ? (
              <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-border" referrerPolicy="no-referrer" />
            ) : user ? (
              <div className="w-8 h-8 rounded-full bg-brand/20 text-brand flex items-center justify-center">
                <UserIcon className="w-4 h-4" />
              </div>
            ) : null}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-surface border border-border text-text-main hover:bg-bg-main transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-4 shadow-xl absolute w-full left-0 top-full">
            {user ? (
              <>
                <div className="grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => { setAppState('dashboard'); setIsMobileMenuOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-colors ${appState === 'dashboard' ? 'bg-brand text-text-inverse' : 'bg-bg-main text-text-main hover:bg-brand/10 hover:text-brand'}`}
                  >
                    <LayoutDashboard className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Painel</span>
                  </button>
                  <button 
                    onClick={() => { setAppState('gamification'); setIsMobileMenuOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-colors ${appState === 'gamification' ? 'bg-brand text-text-inverse' : 'bg-bg-main text-text-main hover:bg-brand/10 hover:text-brand'}`}
                  >
                    <Trophy className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Ranking</span>
                  </button>
                  <button 
                    onClick={() => { setAppState('reminders'); setIsMobileMenuOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-colors ${appState === 'reminders' ? 'bg-brand text-text-inverse' : 'bg-bg-main text-text-main hover:bg-brand/10 hover:text-brand'}`}
                  >
                    <Bell className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Lembretes</span>
                  </button>
                  <button 
                    onClick={() => { setAppState('evolution'); setIsMobileMenuOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-colors ${appState === 'evolution' ? 'bg-brand text-text-inverse' : 'bg-bg-main text-text-main hover:bg-brand/10 hover:text-brand'}`}
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Evolução</span>
                  </button>
                  <button 
                    onClick={() => { setAppState('speltagram'); setIsMobileMenuOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-colors ${appState === 'speltagram' ? 'bg-brand text-text-inverse' : 'bg-bg-main text-text-main hover:bg-brand/10 hover:text-brand'}`}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Social</span>
                  </button>
                  <button 
                    onClick={() => { setAppState('library'); setIsMobileMenuOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-colors ${appState === 'library' ? 'bg-brand text-text-inverse' : 'bg-bg-main text-text-main hover:bg-brand/10 hover:text-brand'}`}
                  >
                    <BookOpen className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Exercícios</span>
                  </button>
                  <button 
                    onClick={() => { setAppState('manual'); setIsMobileMenuOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-colors ${appState === 'manual' ? 'bg-brand text-text-inverse' : 'bg-bg-main text-text-main hover:bg-brand/10 hover:text-brand'}`}
                  >
                    <HelpCircle className="w-6 h-6" />
                    <span className="text-[10px] font-bold">Manual</span>
                  </button>
                  {(user.email === 'calepi@gmail.com' || user.email === 'tazmania.crvg@gmail.com') && (
                    <button 
                      onClick={() => { setAppState('admin'); setIsMobileMenuOpen(false); }}
                      className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-colors ${appState === 'admin' ? 'bg-brand text-text-inverse' : 'bg-bg-main text-text-main hover:bg-brand/10 hover:text-brand'}`}
                    >
                      <Shield className="w-6 h-6" />
                      <span className="text-[10px] font-bold">Admin</span>
                    </button>
                  )}
                </div>
                
                <div className="border-t border-border pt-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-bold text-text-main">Tema</span>
                    <div className="flex gap-2">
                      <button onClick={() => { handleThemeChange('default'); setIsMobileMenuOpen(false); }} className={`w-6 h-6 rounded-full bg-[#FF5722] ${theme === 'default' ? 'ring-2 ring-offset-2 ring-offset-surface ring-[#FF5722]' : ''}`} />
                      <button onClick={() => { handleThemeChange('green'); setIsMobileMenuOpen(false); }} className={`w-6 h-6 rounded-full bg-[#10B981] ${theme === 'green' ? 'ring-2 ring-offset-2 ring-offset-surface ring-[#10B981]' : ''}`} />
                      <button onClick={() => { handleThemeChange('blue'); setIsMobileMenuOpen(false); }} className={`w-6 h-6 rounded-full bg-[#3B82F6] ${theme === 'blue' ? 'ring-2 ring-offset-2 ring-offset-surface ring-[#3B82F6]' : ''}`} />
                      <button onClick={() => { handleThemeChange('gold'); setIsMobileMenuOpen(false); }} className={`w-6 h-6 rounded-full bg-[#F59E0B] ${theme === 'gold' ? 'ring-2 ring-offset-2 ring-offset-surface ring-[#F59E0B]' : ''}`} />
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full py-3 mt-2 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sair da Conta
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { handleLogin(); setIsMobileMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand text-text-inverse font-bold hover:bg-brand-hover transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  Entrar / Cadastrar
                </button>
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-bold text-text-main">Tema</span>
                  <div className="flex gap-2">
                    <button onClick={() => { handleThemeChange('default'); setIsMobileMenuOpen(false); }} className={`w-6 h-6 rounded-full bg-[#FF5722] ${theme === 'default' ? 'ring-2 ring-offset-2 ring-offset-surface ring-[#FF5722]' : ''}`} />
                    <button onClick={() => { handleThemeChange('green'); setIsMobileMenuOpen(false); }} className={`w-6 h-6 rounded-full bg-[#10B981] ${theme === 'green' ? 'ring-2 ring-offset-2 ring-offset-surface ring-[#10B981]' : ''}`} />
                    <button onClick={() => { handleThemeChange('blue'); setIsMobileMenuOpen(false); }} className={`w-6 h-6 rounded-full bg-[#3B82F6] ${theme === 'blue' ? 'ring-2 ring-offset-2 ring-offset-surface ring-[#3B82F6]' : ''}`} />
                    <button onClick={() => { handleThemeChange('gold'); setIsMobileMenuOpen(false); }} className={`w-6 h-6 rounded-full bg-[#F59E0B] ${theme === 'gold' ? 'ring-2 ring-offset-2 ring-offset-surface ring-[#F59E0B]' : ''}`} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full">
        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {showPaywall || appState === 'paywall' ? (
          <Paywall 
            onSubscribe={handleSubscribe} 
            onLogout={handleLogout} 
            isLoading={isProcessingPayment} 
          />
        ) : (
          <>
            {appState === 'landing' && (
              <LandingPage 
                onStart={() => {
                  if (user) {
                    setAppState('form');
                  } else {
                    setShowAuthModal(true);
                  }
                }} 
                hasPlan={!!plan}
                onContinue={() => setAppState('dashboard')}
                onViewTerms={() => setAppState('terms')}
                onViewPrivacy={() => setAppState('privacy')}
                hidePricing={IS_PLAY_STORE_REVIEW_MODE}
              />
            )}

            {appState === 'form' && (
              <Profile360Form 
                onSubmit={handleProfile360Submit} 
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

            {appState === 'dashboard' && (userData) && (
              <div className="space-y-8 animate-in fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-3xl font-black text-text-main">
                      Protocolo Integrado <span className="text-brand">Spelta360</span>
                    </h2>
                    <p className="text-text-muted mt-1">Seu chassi, seu combustível e sua performance.</p>
                  </div>
                </div>

                <div className="flex gap-2 p-1 bg-surface border border-border rounded-2xl overflow-x-auto print:hidden w-full max-w-2xl mx-auto mb-8">
                  <button
                    onClick={() => setActiveDashboardTab('workout')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-center transition-all min-w-[120px] ${activeDashboardTab === 'workout' ? 'bg-brand text-white shadow-lg' : 'text-text-muted hover:bg-bg-main'}`}
                  >
                    🏋️‍♂️ Menu de Treinos
                  </button>
                  <button
                    onClick={() => setActiveDashboardTab('nutrition')}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-center transition-all min-w-[120px] ${activeDashboardTab === 'nutrition' ? 'bg-brand text-white shadow-lg' : 'text-text-muted hover:bg-bg-main'}`}
                  >
                    🍏 Menu Nutricional
                  </button>
                  {fisioPlan && (
                    <button
                      onClick={() => setActiveDashboardTab('fisio')}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-center transition-all min-w-[120px] ${activeDashboardTab === 'fisio' ? 'bg-brand text-white shadow-lg' : 'text-text-muted hover:bg-bg-main'}`}
                    >
                      ⚕️ Fisioterapia
                    </button>
                  )}
                </div>

                {activeDashboardTab === 'fisio' && fisioPlan && (
                  <FisioPlanView plan={fisioPlan} user={userData} />
                )}

                {activeDashboardTab === 'workout' && plan && (
                  <WorkoutPlanView 
                    plan={plan} 
                    user={userData} 
                    onReset={handleReset} 
                    onUpdatePlan={handleUpdatePlan}
                    hideResetButton={true}
                  />
                )}

                {activeDashboardTab === 'nutrition' && nutriPlan && nutriData && (
                  <NutritionalPlanView 
                    plan={nutriPlan} 
                    userData={nutriData} 
                    onReset={handleReset} 
                    hideResetButton={true}
                  />
                )}
              </div>
            )}

            {appState === 'admin' && user?.email === 'calepi@gmail.com' && (
              <AdminDashboard 
                onViewDocumentation={() => setAppState('documentation')} 
                onViewPatent={() => setAppState('patent')}
              />
            )}

            {appState === 'library' && (
              <ExerciseLibrary />
            )}

            {appState === 'speltagram' && user && (
              <SpeltaGramFeed 
                user={user} 
                isAdmin={user.email === 'calepi@gmail.com' || user.email === 'tazmania.crvg@gmail.com'} 
              />
            )}

            {appState === 'evolution' && user && (
              <EvolutionCharts userId={user.uid} />
            )}

            {appState === 'gamification' && user && (
              <GamificationDashboard userId={user.uid} />
            )}

            {appState === 'reminders' && user && (
              <ReminderSettings userId={user.uid} />
            )}

            {appState === 'manual' && (
              <UserManual />
            )}

            {appState === 'documentation' && (
              <TechnicalDocumentation onBack={() => setAppState('admin')} />
            )}

            {appState === 'patent' && (
              <PatentDocumentation onBack={() => setAppState('admin')} />
            )}

            {appState === 'terms' && (
              <TermsOfService onBack={() => setAppState('landing')} />
            )}

            {appState === 'privacy' && (
              <PrivacyPolicy onBack={() => setAppState('landing')} />
            )}
          </>
        )}
      </main>

      {/* Footer / Credits */}
      <footer className="border-t border-border bg-bg-main/50 py-6 mt-auto print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col gap-2">
          <p className="text-sm text-text-muted">
            Ferramenta desenvolvida por <span className="font-semibold text-brand">Carlos Alexandre Pinheiro</span> e <span className="font-semibold text-brand">Márcio Spelta</span>
          </p>
          <p className="text-xs text-text-muted">
            Suporte: <a href="mailto:speltafit@gmail.com" className="hover:text-brand transition-colors">speltafit@gmail.com</a> | WhatsApp: <a href="https://wa.me/5521978281073" target="_blank" rel="noopener noreferrer" className="hover:text-brand transition-colors">(21) 97828-1073</a>
          </p>
        </div>
      </footer>

      {/* Reminder Manager (Background Logic) */}
      {user && <ReminderManager userId={user.uid} />}

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}
