import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';
import {
  User,
  Camera,
  Check,
  ShieldCheck,
  Sun,
  Moon,
  Fingerprint,
  LogOut,
  GraduationCap,
  BookOpen,
  Crown,
  Mail,
  Phone,
  Sparkles,
  Calendar,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

interface ProfileViewProps {
  onNavigate?: (path: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
];

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigate,
  onNavigateToTab
}) => {
  const {
    currentUser,
    setCurrentUser,
    currentRole,
    setCurrentRole,
    logout,
    teachers,
    students,
    activities,
    payments,
    selectedPeriod,
    currentTeacherId,
    currentStudentId,
    updateTeacher,
    updateTeacherAvatar,
    updateStudent,
    isDarkMode,
    toggleDarkMode,
    isBiometricsSupported,
    hasBiometricsEnabled,
    enableBiometrics,
    disableBiometrics,
    changePassword,
    setIsAuthModalOpen
  } = useApp();

  const currentTeacher = teachers.find(t => t.id === currentTeacherId);
  const currentStudent = students.find(s => s.id === currentStudentId);

  const isTeacherRole = currentRole === 'teacher' || currentRole === 'teacher_student';
  const isStudentRole = currentRole === 'student' || currentRole === 'teacher_student';

  const avatarStorageKey = `triskell_user_avatar_${currentUser?.id || currentUser?.email || currentRole}`;

  const resolveInitialAvatar = () => {
    if (isTeacherRole && (currentTeacher?.avatar || currentTeacher?.avatarUrl)) {
      return currentTeacher.avatar || currentTeacher.avatarUrl || '';
    }
    try {
      const saved = localStorage.getItem(avatarStorageKey);
      if (saved) return saved;
    } catch {
      // Ignorar si localStorage no está disponible
    }
    return currentUser?.photoURL || '';
  };

  const resolveInitialName = () => {
    if (currentRole === 'teacher' && currentTeacher?.name) return currentTeacher.name;
    if (currentRole === 'student' && currentStudent?.name) return currentStudent.name;
    return currentUser?.name || '';
  };

  const resolveInitialPhone = () => {
    if (isTeacherRole && currentTeacher?.phone) return currentTeacher.phone;
    if (isStudentRole && currentStudent?.phone) return currentStudent.phone;
    return '';
  };

  const resolveInitialEmail = () => {
    if (currentRole === 'teacher' && currentTeacher?.email) return currentTeacher.email;
    if (currentRole === 'student' && currentStudent?.email) return currentStudent.email;
    return currentUser?.email || '';
  };

  const [fullName, setFullName] = useState<string>(resolveInitialName);
  const [phone, setPhone] = useState<string>(resolveInitialPhone);
  const [email, setEmail] = useState<string>(resolveInitialEmail);
  const [avatarUrl, setAvatarUrl] = useState<string>(resolveInitialAvatar);
  const [collectionType, setCollectionType] = useState<'personal' | 'association'>(
    currentTeacher?.collectionType || 'personal'
  );

  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [biometricMessage, setBiometricMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [isBiometricBusy, setIsBiometricBusy] = useState(false);

  // Cambio de contraseña directo desde Seguridad
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassChars, setShowPassChars] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Sincronizar campos cuando cambia usuario/rol/datos cargados
  useEffect(() => {
    setFullName(resolveInitialName());
    setPhone(resolveInitialPhone());
    setEmail(resolveInitialEmail());
    setAvatarUrl(resolveInitialAvatar());
    if (currentTeacher?.collectionType) {
      setCollectionType(currentTeacher.collectionType);
    }
  }, [currentRole, currentUser?.id, currentTeacher?.id, currentStudent?.id]);

  // Datos específicos del rol
  const teacherActivities = activities.filter(a => a.teacherId === currentTeacher?.id);
  const teacherStudentsCount = students.filter(st =>
    st.activities.some(a => teacherActivities.some(ta => ta.id === a.activityId))
  ).length;

  const studentEnrolledActivities = activities.filter(act =>
    currentStudent?.activities.some(e => e.activityId === act.id)
  );
  const studentPendingPaymentsCount = payments.filter(
    p =>
      p.studentId === currentStudent?.id &&
      p.periodMonth === selectedPeriod &&
      (p.status === 'pending' || p.status === 'overdue')
  ).length;

  const roleBadgeLabel = (() => {
    switch (currentRole) {
      case 'admin':
        return 'Administrador';
      case 'teacher':
        return 'Monitor / Profesor';
      case 'student':
        return 'Alumno / Socio';
      case 'teacher_student':
        return 'Monitor-Alumno';
      default:
        return 'Usuario';
    }
  })();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedAvatar = avatarUrl.trim();
    if (!trimmedName) return;

    // 1. Guardar cambios específicos del Monitor si aplica
    if (isTeacherRole && currentTeacher) {
      await updateTeacher(currentTeacher.id, {
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail,
        avatar: trimmedAvatar,
        collectionType
      });
      if (trimmedAvatar) {
        await updateTeacherAvatar(currentTeacher.id, trimmedAvatar);
      }
    }

    // 2. Guardar cambios específicos del Alumno si aplica
    if (isStudentRole && currentStudent) {
      await updateStudent(currentStudent.id, {
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail
      });
    }

    // 3. Sincronizar nombre y avatar en la tabla `profiles` de Supabase (si tiene usuario real)
    if (currentUser?.id && !currentUser.id.startsWith('usr-') && !currentUser.id.startsWith('demo-') && !currentUser.id.startsWith('cached-')) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: trimmedName,
            avatar_url: trimmedAvatar || null
          })
          .eq('id', currentUser.id);
      } catch {
        // Ignorar si no aplica en entorno offline/demo
      }
    }

    // 4. Persistir avatar local y actualizar sesión actual
    try {
      if (trimmedAvatar) {
        localStorage.setItem(avatarStorageKey, trimmedAvatar);
      } else {
        localStorage.removeItem(avatarStorageKey);
      }
    } catch {
      // Ignorar si almacenamiento no está disponible
    }

    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        name: trimmedName,
        email: trimmedEmail || currentUser.email,
        photoURL: trimmedAvatar || currentUser.photoURL
      });
    }

    setSaveMessage('Perfil y preferencias guardados correctamente.');
    setTimeout(() => setSaveMessage(null), 3500);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword.trim().length < 6) {
      setPasswordMessage({ type: 'err', text: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'err', text: 'Las contraseñas no coinciden.' });
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await changePassword(newPassword);
      if (res.success) {
        setPasswordMessage({ type: 'ok', text: 'Contraseña actualizada correctamente.' });
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      } else {
        setPasswordMessage({ type: 'err', text: res.error || 'No se pudo actualizar la contraseña.' });
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleToggleBiometrics = async () => {
    setBiometricMessage(null);
    if (hasBiometricsEnabled) {
      disableBiometrics();
      setBiometricMessage({
        type: 'ok',
        text: 'Desbloqueo biométrico desactivado en este dispositivo.'
      });
      return;
    }
    setIsBiometricBusy(true);
    try {
      const ok = await enableBiometrics();
      if (ok) {
        setBiometricMessage({
          type: 'ok',
          text: 'Biometría activada correctamente para futuros accesos.'
        });
      } else {
        setBiometricMessage({
          type: 'err',
          text: 'No se pudo completar el registro biométrico.'
        });
      }
    } catch (err: any) {
      setBiometricMessage({
        type: 'err',
        text: err?.message || 'Error al activar biometría en este navegador.'
      });
    } finally {
      setIsBiometricBusy(false);
    }
  };

  const displayAvatar = avatarUrl || currentUser?.photoURL || '';
  const displayInitial = (fullName || currentUser?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabecera Universal del Perfil */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={fullName || currentUser?.name || 'Usuario'}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-sm shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                {displayInitial}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Perfil de Usuario
                </span>
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                  {roleBadgeLabel}
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate mt-0.5">
                {fullName || currentUser?.name || 'Usuario Triskell'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {email || currentUser?.email || 'Sesión activa en A.C. Triskell'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await logout();
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 px-4 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition min-h-[40px] shrink-0"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* Selector de perspectiva para roles con múltiples vistas (admin / teacher_student) */}
        {(currentUser?.role === 'admin' || currentUser?.role === 'teacher_student') && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Perspectiva activa de la aplicación
            </span>
            <div className="flex flex-wrap gap-2">
              {currentUser?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => setCurrentRole('admin' as UserRole)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
                    currentRole === 'admin'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Crown className="h-3.5 w-3.5" />
                  <span>Administrador</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setCurrentRole('teacher' as UserRole)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
                  currentRole === 'teacher'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Monitor</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentRole('student' as UserRole)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
                  currentRole === 'student'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Alumno</span>
              </button>
              {currentUser?.role === 'teacher_student' && (
                <button
                  type="button"
                  onClick={() => setCurrentRole('teacher_student' as UserRole)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition ${
                    currentRole === 'teacher_student'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Monitor-Alumno</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Información Específica del Rol */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentRole === 'admin' && (
          <>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Monitores Activos
              </span>
              <div className="mt-1 text-xl font-black tabular-nums text-slate-900 dark:text-white">
                {teachers.filter(t => t.active).length}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Equipo docente registrado</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Alumnos Censados
              </span>
              <div className="mt-1 text-xl font-black tabular-nums text-slate-900 dark:text-white">
                {students.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Socios activos y en prueba</p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Clases / Talleres
              </span>
              <div className="mt-1 text-xl font-black tabular-nums text-slate-900 dark:text-white">
                {activities.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Oferta formativa vigente</p>
            </div>
          </>
        )}

        {isTeacherRole && currentTeacher && (
          <>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tus Talleres Asignados
              </span>
              <div className="mt-1 text-xl font-black tabular-nums text-indigo-600 dark:text-indigo-400">
                {teacherActivities.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {teacherStudentsCount} alumnos inscritos
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Esquema de Honorarios
              </span>
              <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                {currentTeacher.paymentScheme === 'per_class' && `${currentTeacher.ratePerClass} € / clase`}
                {currentTeacher.paymentScheme === 'monthly_fixed' && `${currentTeacher.fixedMonthlyRate} € / mes fijo`}
                {currentTeacher.paymentScheme === 'revenue_share' && `${currentTeacher.revenueSharePercent}% de cuotas`}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Modalidad de liquidación asignada
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Modo de Cobro
              </span>
              <div className="mt-1 text-sm font-black text-emerald-600 dark:text-emerald-400">
                {collectionType === 'personal' ? 'Personal (Directo)' : 'Asociación'}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {onNavigateToTab ? (
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('teacher-payouts')}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Ver mis liquidaciones →
                  </button>
                ) : (
                  'Preferencia en tus clases'
                )}
              </p>
            </div>
          </>
        )}

        {currentRole === 'student' && currentStudent && (
          <>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Talleres Matriculados
              </span>
              <div className="mt-1 text-xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                {studentEnrolledActivities.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {studentEnrolledActivities.map(a => a.name).join(', ') || 'Sin talleres asignados'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Estado de Cuotas ({selectedPeriod})
              </span>
              <div className="mt-1 text-sm font-black text-slate-900 dark:text-white">
                {studentPendingPaymentsCount === 0
                  ? 'Al día'
                  : `${studentPendingPaymentsCount} pendiente${studentPendingPaymentsCount > 1 ? 's' : ''}`}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Consulta el detalle en tu Portal
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Socio Desde
              </span>
              <div className="mt-1 text-sm font-black tabular-nums text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-emerald-600" />
                <span>{currentStudent.registeredAt || '—'}</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 capitalize">
                Estado: {currentStudent.status}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Dos cuadros principales siempre visibles: Datos Personales y Foto de Perfil + Preferencias Personales y Seguridad */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Formulario Unificado: Datos Personales, Foto/Avatar y Ajustes del Rol */}
      <form
        onSubmit={handleSaveProfile}
        className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-5"
      >
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Datos Personales y Foto de Perfil</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Actualiza tu imagen, datos de contacto y configuración de perfil
            </p>
          </div>
        </div>

        {saveMessage && (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{saveMessage}</span>
          </div>
        )}

        {/* Foto Actual y Avatares Predefinidos */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={fullName}
              className="h-20 w-20 rounded-2xl object-cover border-2 border-emerald-500/60 shadow-sm shrink-0"
            />
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
              {displayInitial}
            </div>
          )}

          <div className="space-y-1.5 min-w-0">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Avatar / Imagen de Perfil
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isTeacherRole
                ? 'Visible para alumnos en sus talleres y en la cabecera de la aplicación.'
                : 'Se mostrará en tu barra de navegación y cabecera personal.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">Predefinidos:</span>
              <div className="flex items-center gap-1.5">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`h-7 w-7 rounded-lg overflow-hidden border-2 transition ${
                      avatarUrl === url
                        ? 'border-emerald-600 scale-110'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* URL personalizada de avatar */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Enlace a tu foto (URL de imagen)
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-emerald-500 font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span className="inline-flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Nombre Completo *</span>
              </span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>Teléfono / WhatsApp</span>
              </span>
            </label>
            <input
              type="tel"
              placeholder="+34 600 000 000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            <span className="inline-flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>Correo Electrónico</span>
            </span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
          />
        </div>

        {/* Configuración específica para Monitor: Tipo de cobro por defecto */}
        {isTeacherRole && currentTeacher && (
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/20 p-3.5 space-y-2">
            <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 block">
              Tipo de Cobro por Defecto de tus Clases
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Define si cobras directamente al alumno en clase o si la asociación gestiona el cobro primero.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                  collectionType === 'personal'
                    ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-transparent'
                }`}
              >
                <input
                  type="radio"
                  name="profileCollectionType"
                  checked={collectionType === 'personal'}
                  onChange={() => setCollectionType('personal')}
                  className="text-indigo-600"
                />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Personal (Cobro directo alumno ➜ monitor)
                </span>
              </label>

              <label
                className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition ${
                  collectionType === 'association'
                    ? 'border-indigo-600 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-transparent'
                }`}
              >
                <input
                  type="radio"
                  name="profileCollectionType"
                  checked={collectionType === 'association'}
                  onChange={() => setCollectionType('association')}
                  className="text-indigo-600"
                />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Asociación (El centro recauda primero)
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition min-h-[44px]"
          >
            <Check className="h-4 w-4" />
            <span>Guardar Cambios de Perfil</span>
          </button>
        </div>
      </form>

      {/* Preferencias Personales & Seguridad */}
      <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Preferencias Personales y Seguridad</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Apariencia de la interfaz y acceso rápido en este dispositivo
          </p>
        </div>

        {/* Apariencia: Modo Claro / Oscuro */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-amber-400">
              {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Tema de la aplicación
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {isDarkMode ? 'Modo oscuro activado' : 'Modo claro activado'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleDarkMode}
            className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {isDarkMode ? 'Cambiar a Claro' : 'Cambiar a Oscuro'}
          </button>
        </div>

        {/* Desbloqueo Biométrico */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Fingerprint className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Acceso Biométrico (Face ID / Huella / Passkey)
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {!isBiometricsSupported
                  ? 'No compatible en este navegador o entorno'
                  : hasBiometricsEnabled
                  ? 'Activado en este dispositivo para acceso rápido'
                  : 'Desactivado · Actívalo para desbloquear sin contraseña'}
              </div>
            </div>
          </div>

          {isBiometricsSupported && (
            <button
              type="button"
              disabled={isBiometricBusy}
              onClick={handleToggleBiometrics}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition whitespace-nowrap ${
                hasBiometricsEnabled
                  ? 'border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isBiometricBusy
                ? 'Procesando...'
                : hasBiometricsEnabled
                ? 'Desactivar'
                : 'Activar'}
            </button>
          )}
        </div>

        {biometricMessage && (
          <div
            className={`rounded-xl border p-3 text-xs font-semibold flex items-center gap-2 ${
              biometricMessage.type === 'ok'
                ? 'border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                : 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
            }`}
          >
            {biometricMessage.type === 'ok' ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{biometricMessage.text}</span>
          </div>
        )}

        {/* Seguridad de la Cuenta: Cambiar Contraseña */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Contraseña de Acceso
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Actualiza tu clave personal de acceso
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowPasswordForm(v => !v);
                setPasswordMessage(null);
              }}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition whitespace-nowrap"
            >
              {showPasswordForm ? 'Cancelar' : 'Cambiar'}
            </button>
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="relative">
                <input
                  type={showPassChars ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-9 py-2 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassChars(v => !v)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showPassChars ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <input
                type={showPassChars ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
              />
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Abrir Acceso TRISKELL
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {isUpdatingPassword ? 'Guardando...' : 'Actualizar contraseña'}
                </button>
              </div>
            </form>
          )}

          {passwordMessage && (
            <div
              className={`rounded-xl border p-2.5 text-xs font-semibold flex items-center gap-2 ${
                passwordMessage.type === 'ok'
                  ? 'border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                  : 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
              }`}
            >
              {passwordMessage.type === 'ok' ? (
                <Check className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{passwordMessage.text}</span>
            </div>
          )}
        </div>

        {/* Enlaces legales rápidos */}
        {onNavigate && (
          <div className="pt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => onNavigate('/privacidad')}
              className="hover:text-slate-900 dark:hover:text-white underline underline-offset-4"
            >
              Política de Privacidad
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/condiciones')}
              className="hover:text-slate-900 dark:hover:text-white underline underline-offset-4"
            >
              Condiciones del Servicio
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};
