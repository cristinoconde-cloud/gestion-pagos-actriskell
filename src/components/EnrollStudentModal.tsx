import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';
import {
  X,
  UserPlus,
  UserCheck,
  Search,
  AlertCircle,
  Clock,
  GraduationCap,
  ShieldCheck,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultActivityId?: string;
  initialActivityId?: string;
  allowedTeacherId?: string;
  onOpenCreateStudent?: () => void;
}

interface ProfileCandidate {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  teacherId?: string;
  studentId?: string;
}

type CandidateEntry =
  | {
      kind: 'profile';
      key: string;
      profile: ProfileCandidate;
      linkedStudentId?: string;
      isPendingValidation: boolean;
      alreadyEnrolled: boolean;
    }
  | {
      kind: 'student';
      key: string;
      studentId: string;
      name: string;
      email: string;
      phone: string;
      isPendingValidation: boolean;
      alreadyEnrolled: boolean;
    };

export const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({
  isOpen,
  onClose,
  defaultActivityId,
  initialActivityId,
  allowedTeacherId
}) => {
  const effectiveDefaultActivityId = initialActivityId || defaultActivityId;
  const {
    activities,
    students,
    profiles: contextProfiles,
    enrollStudentInActivity,
    enrollUserFromProfile,
    quickCreateAndEnrollStudent
  } = useApp();

  const availableActivities = useMemo(
    () => (allowedTeacherId ? activities.filter(a => a.teacherId === allowedTeacherId) : activities),
    [activities, allowedTeacherId]
  );

  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    effectiveDefaultActivityId || availableActivities[0]?.id || ''
  );
  const [mode, setMode] = useState<'existing' | 'quick_create'>('existing');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCandidateKey, setSelectedCandidateKey] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<number | ''>('');

  // Campos de Alta Rápida al vuelo
  const [quickName, setQuickName] = useState<string>('');
  const [quickPhone, setQuickPhone] = useState<string>('');
  const [quickEmail, setQuickEmail] = useState<string>('');
  const [quickNotes, setQuickNotes] = useState<string>('');

  // Consulta en vivo a la tabla `profiles` de Supabase
  const [dbProfiles, setDbProfiles] = useState<ProfileCandidate[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setSelectedActivityId(effectiveDefaultActivityId || availableActivities[0]?.id || '');
    setSelectedCandidateKey('');
    setSearchQuery('');
    setCustomPrice('');
    setQuickName('');
    setQuickPhone('');
    setQuickEmail('');
    setQuickNotes('');
    setMode('existing');
    setErrorMsg(null);

    let active = true;
    const loadProfiles = async () => {
      setIsLoadingProfiles(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email, role, avatar_url, teacher_id, student_id')
          .order('full_name', { ascending: true });

        if (!active) return;
        if (!error && data) {
          setDbProfiles(
            data.map((row: any) => ({
              id: row.id,
              fullName: row.full_name || row.email || 'Usuario sin nombre',
              email: row.email || '',
              role: (row.role || 'student') as UserRole,
              avatarUrl: row.avatar_url || undefined,
              teacherId: row.teacher_id || undefined,
              studentId: row.student_id || undefined
            }))
          );
        }
      } catch {
        // Si falla la lectura directa, el listado usa el fallback de AppContext.profiles
      } finally {
        if (active) setIsLoadingProfiles(false);
      }
    };

    loadProfiles();
    return () => {
      active = false;
    };
  }, [isOpen, effectiveDefaultActivityId, availableActivities]);

  const candidates = useMemo<CandidateEntry[]>(() => {
    const mergedProfilesMap = new Map<string, ProfileCandidate>();

    contextProfiles.forEach(p => {
      mergedProfilesMap.set(p.id, {
        id: p.id,
        fullName: p.name,
        email: p.email,
        role: p.role,
        avatarUrl: p.photoURL,
        teacherId: p.teacherId,
        studentId: p.studentId
      });
    });

    dbProfiles.forEach(p => {
      mergedProfilesMap.set(p.id, p);
    });

    const profileEntries: CandidateEntry[] = [];
    const matchedStudentIds = new Set<string>();

    mergedProfilesMap.forEach(profile => {
      const emailNorm = profile.email.trim().toLowerCase();
      const linkedStudent = students.find(
        s =>
          (profile.studentId && s.id === profile.studentId) ||
          s.profileId === profile.id ||
          (emailNorm && s.email.trim().toLowerCase() === emailNorm)
      );

      if (linkedStudent) {
        matchedStudentIds.add(linkedStudent.id);
      }

      const alreadyEnrolled = Boolean(
        linkedStudent &&
          (linkedStudent.activities || []).some(act => act.activityId === selectedActivityId)
      );

      profileEntries.push({
        kind: 'profile',
        key: `profile:${profile.id}`,
        profile,
        linkedStudentId: linkedStudent?.id || profile.studentId,
        isPendingValidation:
          linkedStudent?.status === 'pending_validation' ||
          linkedStudent?.validationStatus === 'pending',
        alreadyEnrolled
      });
    });

    // Incluir también alumnos registrados sin perfil en `profiles` (ej. altas rápidas pendientes)
    const unlinkedStudentEntries: CandidateEntry[] = students
      .filter(s => !matchedStudentIds.has(s.id))
      .map(s => ({
        kind: 'student',
        key: `student:${s.id}`,
        studentId: s.id,
        name: s.name,
        email: s.email,
        phone: s.phone,
        isPendingValidation:
          s.status === 'pending_validation' || s.validationStatus === 'pending',
        alreadyEnrolled: (s.activities || []).some(act => act.activityId === selectedActivityId)
      }));

    return [...profileEntries, ...unlinkedStudentEntries];
  }, [contextProfiles, dbProfiles, students, selectedActivityId]);

  const filteredCandidates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(entry => {
      if (entry.kind === 'profile') {
        const roleLabel =
          entry.profile.role === 'teacher'
            ? 'monitor profesor'
            : entry.profile.role === 'teacher_student'
            ? 'monitor alumno'
            : entry.profile.role === 'admin'
            ? 'administrador'
            : 'alumno socio';
        return (
          entry.profile.fullName.toLowerCase().includes(q) ||
          entry.profile.email.toLowerCase().includes(q) ||
          roleLabel.includes(q)
        );
      }
      return (
        entry.name.toLowerCase().includes(q) ||
        entry.email.toLowerCase().includes(q) ||
        entry.phone.toLowerCase().includes(q) ||
        (entry.isPendingValidation && 'pendiente'.includes(q))
      );
    });
  }, [candidates, searchQuery]);

  if (!isOpen) return null;

  const selectedActivity = activities.find(a => a.id === selectedActivityId);
  const selectedCandidate = candidates.find(c => c.key === selectedCandidateKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityId) return;

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const priceValue = customPrice === '' ? undefined : Number(customPrice);

      if (mode === 'quick_create') {
        if (!quickName.trim()) {
          setErrorMsg('Introduce el nombre completo del nuevo alumno.');
          setIsSubmitting(false);
          return;
        }

        const res = await quickCreateAndEnrollStudent({
          name: quickName.trim(),
          email: quickEmail.trim() || undefined,
          phone: quickPhone.trim() || undefined,
          notes: quickNotes.trim() || undefined,
          activityId: selectedActivityId,
          customPrice: priceValue
        });

        if (!res.success) {
          setErrorMsg(res.error || 'No se pudo completar el alta rápida.');
          setIsSubmitting(false);
          return;
        }

        onClose();
        return;
      }

      if (!selectedCandidate) {
        setErrorMsg('Selecciona un usuario de la lista o cambia a "Alta rápida al vuelo".');
        setIsSubmitting(false);
        return;
      }

      if (selectedCandidate.alreadyEnrolled) {
        setErrorMsg('Este usuario ya está matriculado en el taller seleccionado.');
        setIsSubmitting(false);
        return;
      }

      if (selectedCandidate.kind === 'profile') {
        const res = await enrollUserFromProfile({
          profile: {
            id: selectedCandidate.profile.id,
            name: selectedCandidate.profile.fullName,
            email: selectedCandidate.profile.email,
            role: selectedCandidate.profile.role,
            studentId: selectedCandidate.linkedStudentId,
            teacherId: selectedCandidate.profile.teacherId
          },
          activityId: selectedActivityId,
          customPrice: priceValue
        });

        if (!res.success) {
          setErrorMsg(res.error || 'No se pudo inscribir al usuario seleccionado.');
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await enrollStudentInActivity(
          selectedCandidate.studentId,
          selectedActivityId,
          priceValue
        );
        if (!res.success) {
          setErrorMsg(res.error || 'No se pudo inscribir al alumno seleccionado.');
          setIsSubmitting(false);
          return;
        }
      }

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'teacher':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 whitespace-nowrap">
            <GraduationCap className="h-3 w-3" />
            Monitor (inscribir como alumno)
          </span>
        );
      case 'teacher_student':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 whitespace-nowrap">
            <GraduationCap className="h-3 w-3" />
            Monitor-Alumno
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 whitespace-nowrap">
            <ShieldCheck className="h-3 w-3" />
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap">
            Socio / Alumno
          </span>
        );
    }
  };

  const canSubmit =
    Boolean(selectedActivityId) &&
    !isSubmitting &&
    (mode === 'quick_create'
      ? quickName.trim().length > 0
      : Boolean(selectedCandidate && !selectedCandidate.alreadyEnrolled));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden">
        {/* Cabecera Fija */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Inscribir Alumno a Taller
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selecciona un usuario de la plataforma o realiza un alta rápida
            </p>
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
            {errorMsg && (
              <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Taller / Actividad */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Taller Formativo *
              </label>
              <select
                value={selectedActivityId}
                onChange={e => {
                  setSelectedActivityId(e.target.value);
                  setSelectedCandidateKey('');
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500 font-semibold"
              >
                {availableActivities.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.billingMode === 'per_class' ? `${a.defaultPricePerClass}€/clase` : `${a.defaultPriceMonthly}€/mes`})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Modo: Usuario Existente vs Alta Rápida al Vuelo */}
            <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('existing');
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition whitespace-nowrap ${
                  mode === 'existing'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Usuario existente</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('quick_create');
                  setErrorMsg(null);
                }}
                className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition whitespace-nowrap ${
                  mode === 'quick_create'
                    ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Alta rápida al vuelo</span>
              </button>
            </div>

            {mode === 'existing' ? (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Usuarios en plataforma (incluye monitores) *
                  </label>
                  {isLoadingProfiles && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Consultando perfiles...
                    </span>
                  )}
                </div>

                {/* Buscador en vivo */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, correo o rol (ej. monitor)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-emerald-500"
                  />
                </div>

                {/* Listado de Perfiles y Alumnos */}
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                  {filteredCandidates.length === 0 ? (
                    <div className="p-5 text-center space-y-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        No se encontraron usuarios con "{searchQuery}".
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setQuickName(searchQuery.trim());
                          setMode('quick_create');
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600/20 transition"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Dar de alta rápida{searchQuery.trim() ? ` a "${searchQuery.trim()}"` : ''}</span>
                      </button>
                    </div>
                  ) : (
                    filteredCandidates.map(entry => {
                      const isSelected = selectedCandidateKey === entry.key;
                      const displayName =
                        entry.kind === 'profile' ? entry.profile.fullName : entry.name;
                      const displayContact =
                        entry.kind === 'profile'
                          ? entry.profile.email
                          : entry.phone || entry.email || 'Sin contacto';

                      return (
                        <button
                          key={entry.key}
                          type="button"
                          disabled={entry.alreadyEnrolled}
                          onClick={() => setSelectedCandidateKey(entry.key)}
                          className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-2.5 transition ${
                            entry.alreadyEnrolled
                              ? 'opacity-55 cursor-not-allowed bg-slate-100/60 dark:bg-slate-800/40'
                              : isSelected
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 ring-1 ring-inset ring-emerald-500'
                              : 'hover:bg-white dark:hover:bg-slate-800/70'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {displayName}
                              </span>
                              {entry.kind === 'profile'
                                ? renderRoleBadge(entry.profile.role)
                                : (
                                  <span className="rounded-md bg-slate-200/80 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                    Ficha alumno
                                  </span>
                                )}
                              {entry.isPendingValidation && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 whitespace-nowrap">
                                  <Clock className="h-3 w-3" />
                                  Pendiente validación
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {displayContact}
                            </p>
                          </div>

                          <div className="shrink-0">
                            {entry.alreadyEnrolled ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                Ya inscrito
                              </span>
                            ) : isSelected ? (
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              /* Formulario integrado de Alta Rápida al vuelo */
              <div className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 p-4">
                <div className="flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <p className="leading-relaxed">
                    <strong>Pendiente de validación:</strong> Se creará la ficha provisional y quedará matriculado al instante. El <strong>Administrador</strong> deberá confirmar su alta definitiva como socio nuevo posteriormente.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required={mode === 'quick_create'}
                    placeholder="Ej. Marta Gómez Díaz"
                    value={quickName}
                    onChange={e => setQuickName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Teléfono / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="+34 600 000 000"
                      value={quickPhone}
                      onChange={e => setQuickPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="socio@correo.com"
                      value={quickEmail}
                      onChange={e => setQuickEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Observaciones para Administración (opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Prueba primera clase, pendiente ficha de socio"
                    value={quickNotes}
                    onChange={e => setQuickNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Tarifa Personalizada Opcional */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tarifa Especial / Precio acordado (opcional)
              </label>
              <div className="relative max-w-[170px]">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder={String(
                    selectedActivity?.billingMode === 'per_class'
                      ? selectedActivity.defaultPricePerClass
                      : selectedActivity?.defaultPriceMonthly || 45
                  )}
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-8 py-2 text-sm font-bold tabular-nums text-slate-900 dark:text-white focus:outline-emerald-500 text-right"
                />
                <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                  €
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Déjalo vacío para aplicar la tarifa estándar de {selectedActivity?.billingMode === 'per_class' ? `${selectedActivity.defaultPricePerClass}€ por clase` : `${selectedActivity?.defaultPriceMonthly}€ al mes`}.
              </p>
            </div>
          </div>

          {/* Barra Inferior Fija */}
          <div className="sticky bottom-0 z-10 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-end gap-3 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[44px] flex items-center justify-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition min-h-[44px] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Inscribiendo...</span>
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  <span>
                    {mode === 'quick_create'
                      ? 'Crear como Pendiente e Inscribir'
                      : 'Confirmar Inscripción'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
