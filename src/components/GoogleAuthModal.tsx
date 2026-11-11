import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  X,
  Check,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  AlertCircle,
  Building,
  GraduationCap,
  Sparkles,
  User
} from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    logout,
    currentRole,
    setCurrentRole,
    teachers,
    students
  } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [roleToRegister, setRoleToRegister] = useState<UserRole>('admin');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor, introduce tu correo y contraseña.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (authMode === 'login') {
        const res = await loginWithEmail(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Credenciales incorrectas o usuario no encontrado en Supabase.');
        } else {
          setSuccessMessage('¡Sesión iniciada con éxito!');
          setTimeout(() => onClose(), 800);
        }
      } else {
        if (!fullName.trim()) {
          setErrorMessage('Por favor, indica tu nombre completo.');
          setIsSubmitting(false);
          return;
        }
        const res = await signUpWithEmail(email, password, fullName.trim(), roleToRegister);
        if (!res.success) {
          setErrorMessage(res.error || 'Error al crear la cuenta en Supabase.');
        } else {
          setSuccessMessage('¡Cuenta creada con éxito en Supabase Auth y tabla de perfiles!');
          setTimeout(() => onClose(), 1000);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error en la autenticación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Autenticación & Perfil (Supabase Auth)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Gestión de usuarios y permisos basados en PostgreSQL RLS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">

          {/* Si ya hay usuario conectado */}
          {currentUser && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Sesión Activa
                </span>
                <span className="rounded-full bg-emerald-600/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  {currentUser.role === 'admin'
                    ? 'Coordinador'
                    : currentUser.role === 'teacher'
                    ? 'Monitor'
                    : currentUser.role === 'student'
                    ? 'Alumno'
                    : 'Monitor-Alumno'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.name}
                    className="h-11 w-11 rounded-full object-cover border-2 border-emerald-500"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-base">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                    {currentUser.name}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              {/* Selector de Rol asignado en Supabase Profiles */}
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/60">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Cambiar Rol Activo (sincronizado con tabla profiles):
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentRole('admin')}
                    className={`rounded-lg px-2.5 py-1.5 text-left border transition ${
                      currentRole === 'admin'
                        ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    👑 Coordinador
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentRole('teacher')}
                    className={`rounded-lg px-2.5 py-1.5 text-left border transition ${
                      currentRole === 'teacher'
                        ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🎓 Monitor
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentRole('student')}
                    className={`rounded-lg px-2.5 py-1.5 text-left border transition ${
                      currentRole === 'student'
                        ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🎒 Alumno
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentRole('teacher_student')}
                    className={`rounded-lg px-2.5 py-1.5 text-left border transition ${
                      currentRole === 'teacher_student'
                        ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ⭐ Monitor-Alumno
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 py-2 font-bold hover:bg-rose-100 transition"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión en Supabase</span>
              </button>
            </div>
          )}

          {/* Avisos de error o éxito */}
          {errorMessage && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-3 text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3 text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
              <Check className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{successMessage}</p>
            </div>
          )}

          {/* Botón de Google OAuth directo con Supabase */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 font-bold text-slate-800 dark:text-slate-100 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700/80 transition min-h-[44px]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
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
              <span>Continuar con Cuenta de Google</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              O con correo y contraseña
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>

          {/* Pestañas Iniciar Sesión vs Registrarse */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                authMode === 'login'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg transition text-center ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Crear Cuenta
            </button>
          </div>

          {/* Formulario de Email y Contraseña */}
          <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Cristino Conde"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rol Inicial en la Asociación
                  </label>
                  <select
                    value={roleToRegister}
                    onChange={e => setRoleToRegister(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-emerald-500"
                  >
                    <option value="admin">Coordinador General</option>
                    <option value="teacher">Monitor de Talleres</option>
                    <option value="student">Alumno / Socio</option>
                    <option value="teacher_student">Monitor-Alumno</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                placeholder="usuario@asociacion.es"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition min-h-[44px]"
            >
              {authMode === 'login' ? (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>{isSubmitting ? 'Accediendo...' : 'Iniciar Sesión'}</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>{isSubmitting ? 'Creando...' : 'Registrar Cuenta en Supabase'}</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};
