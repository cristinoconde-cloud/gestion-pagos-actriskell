import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Fingerprint, Lock, Mail, Eye, EyeOff, ShieldCheck, Sparkles, UserCheck, AlertCircle } from 'lucide-react';

interface SignInScreenProps {
  onSuccess?: () => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ onSuccess }) => {
  const {
    loginWithGoogle,
    loginWithEmail,
    unlockWithBiometrics,
    hasBiometricsEnabled,
    biometricUser,
    isBiometricsSupported,
    enableBiometrics,
    dbError,
    clearDbError,
    setCurrentUser,
    setCurrentRole
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberBiometrics, setRememberBiometrics] = useState(true);
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pre-fill email if biometric user is stored
  useEffect(() => {
    if (biometricUser?.email) {
      setEmail(biometricUser.email);
    }
  }, [biometricUser]);

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor introduce tu correo y contraseña.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await loginWithEmail(email, password);
      if (res.success) {
        if (rememberBiometrics && isBiometricsSupported && !hasBiometricsEnabled) {
          try {
            await enableBiometrics();
          } catch (bioErr) {
            console.log('Biometrics optional activation ignored:', bioErr);
          }
        }
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.error || 'Credenciales incorrectas o usuario no registrado.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricUnlock = async () => {
    setBiometricLoading(true);
    setErrorMessage(null);
    try {
      const ok = await unlockWithBiometrics();
      if (ok && onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo verificar la huella o Face ID.');
    } finally {
      setBiometricLoading(false);
    }
  };

  // Demo shortcut login for quick testing
  const handleDemoLogin = (role: 'admin' | 'teacher' | 'student') => {
    if (role === 'admin') {
      setCurrentUser({
        id: 'usr-admin-cristino',
        name: 'Cristino Conde',
        email: 'cristino.conde@actriskell.org',
        role: 'admin',
        provider: 'google',
        lastLogin: new Date().toISOString()
      });
      setCurrentRole('admin');
    } else if (role === 'teacher') {
      setCurrentUser({
        id: 'usr-teacher-elena',
        name: 'Elena Morales Soto',
        email: 'elena.morales@actriskell.org',
        role: 'teacher',
        teacherId: 't-1',
        provider: 'email',
        lastLogin: new Date().toISOString()
      });
      setCurrentRole('teacher');
    } else {
      setCurrentUser({
        id: 'usr-student-alejandro',
        name: 'Alejandro Sanz',
        email: 'alejandro.sanz@gmail.com',
        role: 'student',
        studentId: 'st-1',
        provider: 'email',
        lastLogin: new Date().toISOString()
      });
      setCurrentRole('student');
    }
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Círculos ambientales de fondo */}
      <div className="absolute top-0 -left-20 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 rounded-full bg-teal-600/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 relative z-10">
        {/* Cabecera / Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-600/30 mb-3 border border-emerald-400/30">
            {/* Imagen del logo con la animación de giro continuo */}
            <img 
              src="/logo.png" 
              alt="Logo Triskell" 
              className="h-full w-full object-contain animate-[spin_12s_linear_infinite]"
            />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            A.C.TRISKELL
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestión de Asociación, Monitores y Alumnos
          </p>
        </div>

        {/* Mensaje de error si existe */}
        {(errorMessage || dbError) && (
          <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMessage || dbError}</span>
            </div>
            <button
              onClick={() => {
                setErrorMessage(null);
                clearDbError();
              }}
              className="text-rose-500 hover:text-rose-700 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* BOTÓN PROMINENTE: DESBLOQUEO BIOMÉTRICO (Si el usuario ya lo tiene activado) */}
        {hasBiometricsEnabled && biometricUser && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Bienvenido de nuevo, {biometricUser.name || biometricUser.email}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Credencial biométrica activa en este dispositivo
            </p>
            <button
              type="button"
              onClick={handleBiometricUnlock}
              disabled={biometricLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-3 px-4 text-xs font-bold transition shadow-lg shadow-emerald-600/25 min-h-[46px]"
            >
              <Fingerprint className="h-5 w-5" />
              <span>
                {biometricLoading ? 'Verificando huella / Face ID...' : 'Desbloquear con Huella o Face ID'}
              </span>
            </button>
          </div>
        )}

        {/* 1. Botón Google Auth */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition shadow-xs active:scale-95 min-h-[44px]"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continuar con Google</span>
        </button>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <span className="relative bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            o con correo y contraseña
          </span>
        </div>

        {/* Formulario de Correo / Contraseña */}
        <form onSubmit={handlePasswordSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@actriskell.org"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-emerald-500 min-h-[40px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-10 py-2 text-xs text-slate-900 dark:text-white focus:outline-emerald-500 min-h-[40px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Opción Biometría */}
          {isBiometricsSupported && (
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={rememberBiometrics}
                onChange={e => setRememberBiometrics(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className="flex items-center gap-1">
                <Fingerprint className="h-3.5 w-3.5 text-emerald-600" />
                Habilitar desbloqueo biométrico en este dispositivo
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-2.5 px-4 text-xs font-bold transition shadow-md shadow-emerald-600/20 min-h-[44px]"
          >
            {loading ? 'Verificando acceso...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Acceso Rápido Demo (Ambiente AI Studio) */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Acceso Rápido para Pruebas
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500/40 transition active:scale-95"
            >
              👑 Coordinador
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('teacher')}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-500/40 transition active:scale-95"
            >
              🎓 Monitor
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-2 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/30 hover:border-teal-500/40 transition active:scale-95"
            >
              🎒 Alumno
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
