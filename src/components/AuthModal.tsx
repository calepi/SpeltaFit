import React, { useState } from 'react';
import { Mail, Lock, User, Phone, X, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'register' | 'reset';

export function AuthModal({ isOpen, onClose }: Props) {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor, digite seu e-mail.");
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      await sendPasswordResetEmail(auth, email);
      setSuccess("E-mail de recuperação enviado! Verifique sua caixa de entrada (e a pasta de spam).");
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError("Nenhuma conta encontrada com este e-mail.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Erro de conexão. Verifique sua internet ou tente novamente em alguns instantes.");
      } else {
        setError("Erro ao enviar e-mail de recuperação. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (view === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else if (view === 'register') {
        if (!name || !whatsapp) {
          throw new Error("Por favor, preencha todos os campos.");
        }
        
        // 1. Create user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update profile with name
        await updateProfile(user, { displayName: name });

        // 3. Save to Firestore
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 7);

        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: name,
          whatsapp: whatsapp,
          role: (email === 'calepi@gmail.com' || email === 'tazmania.crvg@gmail.com') ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          trialEndsAt: trialEndDate.toISOString()
        });

        onClose();
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Este e-mail já está cadastrado. Clique em 'Esqueci a senha?' para criar uma senha.");
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("E-mail ou senha incorretos. Se você usava o login do Google, clique em 'Esqueceu a senha?' para criar uma senha.");
      } else if (err.code === 'auth/weak-password') {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else if (err.code === 'auth/operation-not-allowed') {
        setError("O login por E-mail/Senha não está ativado no Firebase Console. Por favor, ative-o na aba Authentication > Sign-in method.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Erro de rede. Verifique sua conexão com a internet e tente novamente.");
      } else {
        setError(err.message || "Ocorreu um erro ao autenticar.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setError(null);
    setSuccess(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    
    let formatted = v;
    if (v.length > 2) {
      formatted = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    }
    if (v.length > 7) {
      formatted = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    }
    setWhatsapp(formatted);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-border">
          <div className="flex items-center gap-3">
            {view === 'reset' && (
              <button 
                onClick={() => { setView('login'); resetState(); }}
                className="p-1 -ml-2 text-text-muted hover:text-text-main hover:bg-bg-main rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-2xl font-black text-text-main">
              {view === 'login' ? 'Entrar' : view === 'register' ? 'Criar Conta' : 'Recuperar Senha'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main hover:bg-bg-main rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-500 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 text-green-500 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{success}</p>
            </div>
          )}

          {view === 'reset' ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-text-muted mb-4">
                Digite seu e-mail abaixo. Enviaremos um link para você redefinir sua senha.
              </p>
              <div>
                <label className="block text-sm font-bold text-text-main mb-1">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-text-muted" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-bg-main border border-border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-text-main"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-text-main mb-1">Nome Completo</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-text-muted" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-bg-main border border-border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-text-main"
                        placeholder="Seu nome"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-text-main mb-1">WhatsApp</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-text-muted" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={whatsapp}
                        onChange={handlePhoneChange}
                        className="w-full pl-10 pr-4 py-3 bg-bg-main border border-border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-text-main"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-text-main mb-1">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-text-muted" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-bg-main border border-border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-text-main"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-bold text-text-main">Senha</label>
                  {view === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setView('reset'); resetState(); }}
                      className="text-xs font-bold text-brand hover:text-brand-hover transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-text-muted" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-bg-main border border-border rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-text-main"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? 'Aguarde...' : (view === 'login' ? 'Entrar' : 'Criar Conta')}
              </button>
            </form>
          )}

          {view !== 'reset' && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setView(view === 'login' ? 'register' : 'login');
                  resetState();
                }}
                className="text-sm text-text-muted hover:text-brand transition-colors"
              >
                {view === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
