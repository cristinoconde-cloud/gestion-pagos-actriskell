import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ShieldCheck,
  LogOut,
  LogIn,
  AlertCircle,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  Mail
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
    changePassword,
    requestPasswordReset,
    isPasswordRecoveryMode,
    setIsPasswordRecoveryMode,
    logout,
    currentRole,
    setCurrentRole
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Estado de cambio de contraseña (usuario autenticado o flujo recovery)
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Estado de restablecimiento de contraseña por email (cuando no hay sesión)
  const [showResetRequest, setShowResetRequest] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    if (isPasswordRecoveryMode) {
      setShowChangePasswordForm(true);
    }
  }, [isOpen, isPasswordRecoveryMode]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
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
      setErrorMessage('Introduce tu correo y contraseña.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await loginWithEmail(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Credenciales incorrectas o correo no autorizado.');
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error en la autenticación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword.trim().length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword(newPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'No se pudo cambiar la contraseña.');
      } else {
        setSuccessMessage('Contraseña actualizada correctamente. Ya puedes acceder con tu nueva contraseña.');
        setNewPassword('');
        setConfirmNewPassword('');
        setShowChangePasswordForm(false);
        setIsPasswordRecoveryMode(false);
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetEmail = email || currentUser?.email || '';
    if (!targetEmail.trim()) {
      setErrorMessage('Introduce tu correo electrónico para enviarte el enlace de cambio de contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestPasswordReset(targetEmail);
      if (!res.success) {
        setErrorMessage(res.error || 'No se pudo enviar el enlace de restablecimiento.');
      } else {
        setSuccessMessage(
          `Hemos enviado un enlace a "${targetEmail}" para cambiar o restablecer tu contraseña.`
        );
        setShowResetRequest(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4 bg-slate-50/70 dark:bg-slate-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Acceso a App TRISKELL
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Identificación de Socios, Monitores y Administración
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Avisos de éxito o error */}
          {successMessage && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 p-3 text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
              <p className="leading-relaxed font-semibold">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-3 text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {/* Si ya hay usuario conectado */}
          {currentUser && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Sesión Activa
                </span>
                <span className="rounded-full bg-emerald-600/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  {currentUser.role === 'admin'
                    ? 'Administrador'
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

              {/* Si es administrador o híbrido, permitir alternar vista */}
              {(currentUser.role === 'admin' || currentUser.role === 'teacher_student') && (
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/60">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Alternar Vista Activa:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {currentUser.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => setCurrentRole('admin')}
                        className={`rounded-lg px-2.5 py-1.5 text-left border transition ${
                          currentRole === 'admin'
                            ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        👑 Administrador
                      </button>
                    )}
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
                  </div>
                </div>
              )}

              {/* Cambio de contraseña directo para el usuario conectado */}
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/60 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordForm(prev => !prev);
                    setErrorMessage(null);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 transition"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>
                    {showChangePasswordForm ? 'Ocultar cambio de contraseña' : 'Cambiar mi contraseña'}
                  </span>
                </button>

                {showChangePasswordForm && (
                  <form
                    onSubmit={handleChangePasswordSubmit}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 space-y-2.5"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Nueva contraseña (mín. 6 caracteres) *
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Introduce nueva contraseña"
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-3 pr-9 py-2 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(v => !v)}
                          className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Confirmar nueva contraseña *
                      </label>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={confirmNewPassword}
                        onChange={e => setConfirmNewPassword(e.target.value)}
                        placeholder="Repite la nueva contraseña"
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isChangingPassword}
                      className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-60"
                    >
                      {isChangingPassword ? 'Actualizando contraseña...' : 'Guardar nueva contraseña'}
                    </button>
                  </form>
                )}
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
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}

          {/* Aviso de Registro Restringido */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 p-3 flex items-start gap-2.5 text-slate-600 dark:text-slate-400">
            <Lock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              El acceso a TRISKELL es restringido. Las altas de alumnos y monitores se gestionan exclusivamente desde la Administración.
            </p>
          </div>

          {/* Opción 1: Botón de Google OAuth */}
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
              <span>Acceder con Cuenta de Google</span>
            </button>
            <p className="text-[10px] text-center text-slate-400">
              (El correo debe coincidir con el dado de alta por la Administración)
            </p>
          </div>

          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              O con correo y contraseña
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>

          {showResetRequest ? (
            /* Solicitud de cambio / recuperación por correo */
            <form onSubmit={handleSendResetEmail} className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Cambiar o restablecer contraseña</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowResetRequest(false)}
                  className="text-[11px] font-semibold text-slate-500 hover:underline"
                >
                  Volver
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Introduce tu correo autorizado y te enviaremos un enlace seguro para establecer una nueva contraseña.
              </p>
              <input
                type="email"
                required
                placeholder="tu.correo@actriskell.org"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-emerald-500"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white hover:bg-emerald-700 transition min-h-[42px]"
              >
                {isSubmitting ? 'Enviando enlace...' : 'Enviar enlace de cambio de contraseña'}
              </button>
            </form>
          ) : (
            /* Formulario de Email y Contraseña (Iniciar Sesión) */
            <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="tu.correo@actriskell.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  placeholder="Contraseña facilitada por administración"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-emerald-500"
                />
                <div className="flex items-center justify-end mb-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetRequest(true);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      ¿Cambiar o recuperar contraseña?
                    </button>
                  </div>                
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition min-h-[44px]"
              >
                <LogIn className="h-4 w-4" />
                <span>{isSubmitting ? 'Verificando...' : 'Iniciar Sesión'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
