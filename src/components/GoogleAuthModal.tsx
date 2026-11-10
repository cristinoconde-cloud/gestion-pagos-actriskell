import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getStoredSupabaseConfig, getSupabaseClient } from '../lib/supabase';
import { UserRole } from '../types';
import { X, Check, ShieldCheck, LogOut, ArrowRight, UserCheck, Sparkles, Building, GraduationCap } from 'lucide-react';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, loginWithGoogle, logout, teachers, students } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser?.role || 'admin');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    currentUser?.teacherId || teachers[0]?.id || 't-1'
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentUser?.studentId || students[0]?.id || 'st-1'
  );
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthMsg, setOauthMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Cuentas rápidas de demostración que cubren los 4 roles
  const quickAccounts = [
    {
      name: 'Cristino Conde',
      email: 'cristinoconde@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: 'admin' as UserRole,
      label: 'Coordinador General (Acceso Total)'
    },
    {
      name: 'Elena Morales Soto',
      email: 'elena.morales@triskell.es',
      photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
      role: 'teacher' as UserRole,
      teacherId: 't-1',
      label: 'Rol: Profesora (Clases, Alumnos y Liquidación)'
    },
    {
      name: 'Lucía Fernández Ramos',
      email: 'lucia.fdez@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'student' as UserRole,
      studentId: 'st-1',
      label: 'Rol: Alumna (Mis Talleres, Cuotas y Recibos)'
    },
    {
      name: 'Carlos Benítez Vega',
      email: 'carlos.benitez@triskell.es',
      photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      role: 'teacher_student' as UserRole,
      teacherId: 't-2',
      studentId: 'st-2',
      label: 'Rol Híbrido: Profesor de Guitarra + Alumno'
    }
  ];

  const handleSelectQuickAccount = (acc: typeof quickAccounts[0]) => {
    loginWithGoogle({
      name: acc.name,
      email: acc.email,
      photoURL: acc.photoURL,
      role: acc.role,
      teacherId: acc.teacherId,
      studentId: acc.studentId
    });
    onClose();
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customName.trim()) return;

    loginWithGoogle({
      name: customName.trim(),
      email: customEmail.trim(),
      role: selectedRole,
      teacherId: (selectedRole === 'teacher' || selectedRole === 'teacher_student') ? selectedTeacherId : undefined,
      studentId: (selectedRole === 'student' || selectedRole === 'teacher_student') ? selectedStudentId : undefined
    });
    onClose();
  };

  const handleSupabaseGoogleOAuth = async () => {
    const cfg = getStoredSupabaseConfig();
    const client = getSupabaseClient(cfg);
    if (!client) {
      setOauthMsg('Configura primero tu Supabase en el botón de Base de Datos.');
      return;
    }

    setOauthLoading(true);
    setOauthMsg(null);
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        setOauthMsg(`Error en Google OAuth: ${error.message}`);
      }
    } catch (e: any) {
      setOauthMsg(e.message || 'Error al conectar con Google OAuth');
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Cabecera Fija con botón de 44px */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-xs">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Cuenta de Google
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registro y acceso para Triskell
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition touch-manipulation active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo escroleable independiente */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">

        {/* Estado actual de la sesión */}
        {currentUser ? (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={currentUser.name}
                  className="h-10 w-10 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                />
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm block">
                    {currentUser.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block truncate max-w-[180px]">
                    {currentUser.email}
                  </span>
                  <span className="inline-block mt-0.5 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                    Rol: {currentUser.role === 'admin' ? 'Coordinador' : 'Monitor'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400 text-center">
            No has iniciado sesión. Selecciona una cuenta de Google para acceder a Triskell.
          </div>
        )}

        {/* Acceso Rápido con 1 clic */}
        <div className="mt-5 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Acceso Rápido con Google (1 Clic)
          </span>

          <div className="space-y-2">
            {quickAccounts.map((acc, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectQuickAccount(acc)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition text-left group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={acc.photoURL}
                    alt={acc.name}
                    className="h-9 w-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block group-hover:text-emerald-600 transition">
                      {acc.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {acc.email}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                      {acc.label}
                    </span>
                  </div>
                </div>

                <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:text-emerald-600 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950/80 transition">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Acceso personalizado con otra cuenta Google */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline block mb-3"
          >
            {isCustomMode ? '− Ocultar formulario manual' : '+ Usar otra cuenta de Google distinta'}
          </button>

          {isCustomMode && (
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email de Google (@gmail.com o corporativo)
                </label>
                <input
                  type="email"
                  required
                  placeholder="usuario@gmail.com"
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rol de acceso
                </label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="admin">Coordinador / Dirección (Acceso completo)</option>
                  <option value="teacher">Profesor / Monitor (Clases y honorarios)</option>
                  <option value="student">Alumno / Socio (Mis talleres y recibos)</option>
                  <option value="teacher_student">Profesor y Alumno (Doble Rol)</option>
                </select>
              </div>

              {(selectedRole === 'teacher' || selectedRole === 'teacher_student') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vincular a perfil de profesor
                  </label>
                  <select
                    value={selectedTeacherId}
                    onChange={e => setSelectedTeacherId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(selectedRole === 'student' || selectedRole === 'teacher_student') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vincular a ficha de alumno
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition"
              >
                Acceder con esta cuenta
              </button>
            </form>
          )}

          {/* Opción de Supabase Google OAuth */}
          <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-center">
            <button
              type="button"
              disabled={oauthLoading}
              onClick={handleSupabaseGoogleOAuth}
              className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition"
            >
              <span>{oauthLoading ? 'Conectando...' : 'Iniciar popup OAuth vía Supabase Cloud'}</span>
            </button>
            {oauthMsg && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                {oauthMsg}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
