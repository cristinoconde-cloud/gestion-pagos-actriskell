import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuthUser, Student, StudentStatus, Teacher, UserRole } from '../types';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  GraduationCap,
  ShieldCheck,
  Search,
  Edit2,
  Trash2,
  Clock,
  Check,
  X,
  Copy,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Power,
  Mail,
  Phone,
  Link2
} from 'lucide-react';

interface AdminUsersViewProps {
  onOpenAddStudent: (student?: Student) => void;
  onOpenAddTeacher: (teacher?: Teacher) => void;
  onOpenEnrollStudent: (activityId?: string) => void;
}

type AdminUsersSubTab = 'enrollments' | 'students' | 'teachers' | 'accounts';

interface PendingConfirmAction {
  title: string;
  description: string;
  confirmLabel: string;
  tone: 'danger' | 'warning';
  onConfirm: () => Promise<void> | void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  onOpenAddStudent,
  onOpenAddTeacher,
  onOpenEnrollStudent
}) => {
  const {
    students,
    teachers,
    activities,
    profiles,
    currentUser,
    updateStudent,
    deleteStudent,
    validatePendingStudent,
    confirmActivityEnrollment,
    rejectActivityEnrollment,
    unenrollStudentFromActivity,
    updateTeacher,
    deleteTeacher,
    createUserByAdmin,
    updateUserRole,
    updateUserProfileByAdmin,
    deleteUserAccess
  } = useApp();

  const pendingValidationStudents = useMemo(
    () =>
      students.filter(
        s => s.status === 'pending_validation' || s.validationStatus === 'pending'
      ),
    [students]
  );

  const pendingEnrollmentRequests = useMemo(() => {
    const items: Array<{
      student: Student;
      activityId: string;
      activityName: string;
      teacherName: string;
      enrolledSince: string;
    }> = [];
    for (const st of students) {
      for (const req of st.pendingEnrollments || []) {
        const act = activities.find(a => a.id === req.activityId);
        if (!act) continue;
        const teacher = teachers.find(t => t.id === act.teacherId);
        items.push({
          student: st,
          activityId: act.id,
          activityName: act.name,
          teacherName: teacher?.name || 'Sin asignar',
          enrolledSince: req.enrolledSince
        });
      }
    }
    return items;
  }, [students, activities, teachers]);

  const totalPendingEnrollmentsAndSignups =
    pendingValidationStudents.length + pendingEnrollmentRequests.length;

  const [activeSubTab, setActiveSubTab] = useState<AdminUsersSubTab>(
    totalPendingEnrollmentsAndSignups > 0 ? 'enrollments' : 'students'
  );
  const hasManualSubTabRef = useRef(false);
  const selectSubTab = (tab: AdminUsersSubTab) => {
    hasManualSubTabRef.current = true;
    setActiveSubTab(tab);
  };

  useEffect(() => {
    if (!hasManualSubTabRef.current && totalPendingEnrollmentsAndSignups > 0) {
      setActiveSubTab('enrollments');
    }
  }, [totalPendingEnrollmentsAndSignups]);

  const [searchQuery, setSearchQuery] = useState('');

  // Filtros internos
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | StudentStatus>('all');
  const [teacherStatusFilter, setTeacherStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [enrollmentTeacherFilter, setEnrollmentTeacherFilter] = useState<string>('all');
  const [enrollmentActivityFilter, setEnrollmentActivityFilter] = useState<string>('all');

  // Confirmación in-app
  const [confirmAction, setConfirmAction] = useState<PendingConfirmAction | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Feedback general
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [validatingStudentId, setValidatingStudentId] = useState<string | null>(null);
  const [busyEnrollmentKey, setBusyEnrollmentKey] = useState<string | null>(null);

  // Alta de usuario Auth inline
  const [isAddingAuthUser, setIsAddingAuthUser] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authRole, setAuthRole] = useState<UserRole>('student');
  const [authPassword, setAuthPassword] = useState(`Triskell${Math.floor(1000 + Math.random() * 9000)}!`);
  const [authTeacherId, setAuthTeacherId] = useState('');
  const [authStudentId, setAuthStudentId] = useState('');
  const [authCreateTeacher, setAuthCreateTeacher] = useState(true);
  const [authCreateStudent, setAuthCreateStudent] = useState(true);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    pass: string;
    roleLabel: string;
  } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Edición de usuario Auth / Perfil
  const [editingProfile, setEditingProfile] = useState<AuthUser | null>(null);
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileRole, setEditProfileRole] = useState<UserRole>('student');
  const [editProfileTeacherId, setEditProfileTeacherId] = useState('');
  const [editProfileStudentId, setEditProfileStudentId] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const normalizedQuery = searchQuery.toLowerCase().trim();

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'teacher':
        return 'Profesor / Monitor';
      case 'student':
        return 'Alumno / Socio';
      case 'teacher_student':
        return 'Monitor-Alumno';
    }
  };

  const getStudentStatusBadge = (status: StudentStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            Socio activo
          </span>
        );
      case 'pending_validation':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
            <Clock className="h-3 w-3" />
            Pendiente validar
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300">
            En prueba
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/15 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
            De baja
          </span>
        );
    }
  };

  const getProfileNameById = (profileId?: string) => {
    if (!profileId) return null;
    const prof = profiles.find(p => p.id === profileId);
    return prof ? prof.name : null;
  };

  // Estadísticas rápidas
  const activeStudentsCount = students.filter(s => s.status === 'active').length;
  const activeTeachersCount = teachers.filter(t => t.active).length;

  // Filas de inscripciones planas para gestión detallada
  const enrollmentRows = useMemo(() => {
    const rows: Array<{
      student: Student;
      activityId: string;
      activityName: string;
      teacherId: string;
      teacherName: string;
      price: number;
      billingMode: 'monthly' | 'per_class';
      enrolledSince: string;
      addedByName: string | null;
      isPendingStudent: boolean;
    }> = [];

    for (const st of students) {
      const addedByName = getProfileNameById(st.registeredBy);
      const isPendingStudent =
        st.status === 'pending_validation' || st.validationStatus === 'pending';

      for (const enr of st.activities || []) {
        const act = activities.find(a => a.id === enr.activityId);
        if (!act) continue;
        const teacher = teachers.find(t => t.id === act.teacherId);
        const billingMode = enr.billingMode || act.billingMode;
        const defaultPrice =
          billingMode === 'per_class' ? act.defaultPricePerClass : act.defaultPriceMonthly;

        rows.push({
          student: st,
          activityId: act.id,
          activityName: act.name,
          teacherId: act.teacherId,
          teacherName: teacher?.name || 'Sin asignar',
          price: enr.customPrice ?? defaultPrice,
          billingMode,
          enrolledSince: enr.enrolledSince,
          addedByName,
          isPendingStudent
        });
      }
    }

    return rows.filter(row => {
      if (enrollmentTeacherFilter !== 'all' && row.teacherId !== enrollmentTeacherFilter) {
        return false;
      }
      if (enrollmentActivityFilter !== 'all' && row.activityId !== enrollmentActivityFilter) {
        return false;
      }
      if (normalizedQuery) {
        const haystack = [
          row.student.name,
          row.student.email,
          row.student.phone,
          row.activityName,
          row.teacherName,
          row.addedByName || ''
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [
    students,
    activities,
    teachers,
    profiles,
    enrollmentTeacherFilter,
    enrollmentActivityFilter,
    normalizedQuery
  ]);

  // Alumnos filtrados (pendientes de validación primero)
  const filteredStudents = useMemo(() => {
    const filtered = students.filter(st => {
      const isPending =
        st.status === 'pending_validation' || st.validationStatus === 'pending';
      if (studentStatusFilter === 'pending_validation') {
        if (!isPending) return false;
      } else if (studentStatusFilter !== 'all' && st.status !== studentStatusFilter) {
        return false;
      }
      if (normalizedQuery) {
        const actNames = (st.activities || [])
          .map(e => activities.find(a => a.id === e.activityId)?.name || '')
          .join(' ');
        const haystack = [st.name, st.email, st.phone, st.notes || '', actNames]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      const aPending = a.status === 'pending_validation' || a.validationStatus === 'pending';
      const bPending = b.status === 'pending_validation' || b.validationStatus === 'pending';
      if (aPending !== bPending) return aPending ? -1 : 1;
      return a.name.localeCompare(b.name, 'es');
    });
  }, [students, activities, studentStatusFilter, normalizedQuery]);

  // Profesores filtrados
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      if (teacherStatusFilter === 'active' && !t.active) return false;
      if (teacherStatusFilter === 'inactive' && t.active) return false;
      if (normalizedQuery) {
        const tActs = activities
          .filter(a => a.teacherId === t.id)
          .map(a => a.name)
          .join(' ');
        const haystack = [t.name, t.email, t.phone, t.notes || '', tActs]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [teachers, activities, teacherStatusFilter, normalizedQuery]);

  // Perfiles Auth filtrados
  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => {
      if (!normalizedQuery) return true;
      const haystack = [p.name, p.email, getRoleLabel(p.role), p.role].join(' ').toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [profiles, normalizedQuery]);

  const handleValidateStudent = async (st: Student, approve: boolean) => {
    if (validatingStudentId === st.id) return;
    setValidatingStudentId(st.id);
    setActionFeedback(null);
    try {
      const res = await validatePendingStudent(st.id, approve);
      if (res.success) {
        setActionFeedback({
          type: 'success',
          message: approve
            ? `Alta definitiva confirmada para "${st.name}" como socio activo.`
            : `Alta de "${st.name}" marcada como rechazada / de baja.`
        });
      } else {
        setActionFeedback({
          type: 'error',
          message: res.error || 'No se pudo actualizar el estado del socio.'
        });
      }
    } finally {
      setValidatingStudentId(null);
    }
  };

  const handleCreateAuthUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName.trim() || !authEmail.trim()) {
      setActionFeedback({ type: 'error', message: 'Indica nombre completo y correo electrónico.' });
      return;
    }

    setIsSubmittingAuth(true);
    setActionFeedback(null);
    try {
      const res = await createUserByAdmin({
        email: authEmail.trim(),
        fullName: authName.trim(),
        role: authRole,
        password: authPassword.trim() || undefined,
        teacherId:
          authRole === 'teacher' || authRole === 'teacher_student'
            ? authTeacherId || undefined
            : undefined,
        studentId:
          authRole === 'student' || authRole === 'teacher_student'
            ? authStudentId || undefined
            : undefined,
        createTeacherProfile:
          (authRole === 'teacher' || authRole === 'teacher_student') &&
          authCreateTeacher &&
          !authTeacherId,
        createStudentProfile:
          (authRole === 'student' || authRole === 'teacher_student') &&
          authCreateStudent &&
          !authStudentId
      });

      if (!res.success) {
        setActionFeedback({
          type: 'error',
          message: res.error || 'No se pudo dar de alta al usuario.'
        });
      } else {
        const passUsed = res.tempPassword || authPassword;
        setCreatedCredentials({
          email: authEmail.trim(),
          pass: passUsed,
          roleLabel: getRoleLabel(authRole)
        });
        setActionFeedback({
          type: 'success',
          message: `Usuario "${authName.trim()}" creado correctamente en Auth y Profiles.`
        });
        setAuthName('');
        setAuthEmail('');
        setAuthPassword(`Triskell${Math.floor(1000 + Math.random() * 9000)}!`);
        setAuthTeacherId('');
        setAuthStudentId('');
        setIsAddingAuthUser(false);
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const openEditProfileModal = (profile: AuthUser) => {
    setEditingProfile(profile);
    setEditProfileName(profile.name);
    setEditProfileRole(profile.role);
    setEditProfileTeacherId(profile.teacherId || '');
    setEditProfileStudentId(profile.studentId || '');
  };

  const handleSaveEditedProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !editProfileName.trim()) return;
    setIsSavingProfile(true);
    const res = await updateUserProfileByAdmin(editingProfile.id, {
      name: editProfileName.trim(),
      role: editProfileRole,
      teacherId:
        editProfileRole === 'teacher' || editProfileRole === 'teacher_student'
          ? editProfileTeacherId || null
          : null,
      studentId:
        editProfileRole === 'student' || editProfileRole === 'teacher_student'
          ? editProfileStudentId || null
          : null
    });
    setIsSavingProfile(false);
    if (res.success) {
      setActionFeedback({
        type: 'success',
        message: `Perfil de acceso "${editProfileName.trim()}" actualizado.`
      });
      setEditingProfile(null);
    } else {
      setActionFeedback({
        type: 'error',
        message: res.error || 'Error al actualizar el usuario.'
      });
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `Acceso a TRISKELL Asociación:\n- URL: ${window.location.origin}\n- Correo: ${createdCredentials.email}\n- Contraseña: ${createdCredentials.pass}\n- Rol: ${createdCredentials.roleLabel}`;
    navigator.clipboard?.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 2000);
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    setIsConfirming(true);
    try {
      await confirmAction.onConfirm();
    } finally {
      setIsConfirming(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Gestión de Usuarios, Socios e Inscripciones</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Altas, bajas, modificaciones de alumnos, socios y profesores, validación de altas rápidas e inscripciones en talleres.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAddStudent()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs whitespace-nowrap"
          >
            <UserPlus className="h-4 w-4" />
            <span>Alta Alumno / Socio</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAddTeacher()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-xs whitespace-nowrap"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Alta Profesor</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenEnrollStudent()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4" />
            <span>Inscribir en Taller</span>
          </button>
        </div>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => selectSubTab('students')}
          className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-emerald-400/60 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Alumnos y Socios
            </span>
            <BookOpen className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
            {students.length}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {activeStudentsCount} activos confirmados
          </p>
        </button>

        <button
          type="button"
          onClick={() => selectSubTab('enrollments')}
          className={`text-left rounded-2xl border p-4 shadow-xs transition ${
            pendingValidationStudents.length > 0
              ? 'border-amber-400/70 bg-amber-50/70 dark:bg-amber-950/25'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Pendientes Validar
            </span>
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
            {pendingValidationStudents.length}
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            Altas añadidas por profesores
          </p>
        </button>

        <button
          type="button"
          onClick={() => selectSubTab('teachers')}
          className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-indigo-400/60 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Profesores / Monitores
            </span>
            <GraduationCap className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
            {teachers.length}
          </p>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            {activeTeachersCount} en ejercicio
          </p>
        </button>

        <button
          type="button"
          onClick={() => selectSubTab('accounts')}
          className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs hover:border-purple-400/60 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Cuentas de Acceso
            </span>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <p className="mt-1.5 text-2xl font-black text-slate-900 dark:text-white">
            {profiles.length}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Perfiles en Auth & Supabase
          </p>
        </button>
      </div>

      {/* Feedback Banner */}
      {actionFeedback && (
        <div
          className={`rounded-xl border p-3 text-xs flex items-center justify-between gap-2 ${
            actionFeedback.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
              : 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <Check className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span className="font-semibold">{actionFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Barra de Sub-pestañas + Buscador */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          {[
            {
              id: 'enrollments' as const,
              label: 'Inscripciones y Altas',
              badge: totalPendingEnrollmentsAndSignups,
              icon: Sparkles
            },
            {
              id: 'students' as const,
              label: `Alumnos y Socios (${students.length})`,
              badge: pendingValidationStudents.length,
              icon: BookOpen
            },
            {
              id: 'teachers' as const,
              label: `Profesores (${teachers.length})`,
              badge: 0,
              icon: GraduationCap
            },
            {
              id: 'accounts' as const,
              label: `Accesos Auth (${profiles.length})`,
              badge: 0,
              icon: ShieldCheck
            }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => selectSubTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap shrink-0 transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span
                    className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                      isActive
                        ? 'bg-white text-emerald-700'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar alumno, profesor, taller o email..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Aviso destacado siempre visible si hay altas rápidas o solicitudes pendientes al estar en otra subpestaña */}
      {totalPendingEnrollmentsAndSignups > 0 && activeSubTab !== 'enrollments' && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-50/80 dark:bg-amber-950/30 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate">
              {pendingEnrollmentRequests.length > 0 && pendingValidationStudents.length > 0
                ? `${pendingEnrollmentRequests.length} solicitud(es) de taller y ${pendingValidationStudents.length} alta(s) pendiente(s)`
                : pendingEnrollmentRequests.length > 0
                ? `${pendingEnrollmentRequests.length} solicitud(es) de inscripción a talleres pendiente(s)`
                : `${pendingValidationStudents.length} alta(s) rápida(s) de alumnos pendiente(s) de validar`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => selectSubTab('enrollments')}
            className="shrink-0 rounded-xl bg-amber-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-amber-700 transition whitespace-nowrap"
          >
            Revisar ahora
          </button>
        </div>
      )}

      {/* ================================================================== */}
      {/* SUB-PESTAÑA 1: INSCRIPCIONES Y ALTAS DE PROFESORES                 */}
      {/* ================================================================== */}
      {activeSubTab === 'enrollments' && (
        <div className="space-y-5">
          {/* Bloque A: Altas rápidas pendientes de validación */}
          <div className="rounded-2xl border border-amber-500/35 bg-amber-50/60 dark:bg-amber-950/20 p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                    Altas Rápidas de Alumnos Añadidas por Profesores ({pendingValidationStudents.length})
                  </h2>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                    Valida estos registros para confirmar su alta definitiva como socio o recházalos si procede.
                  </p>
                </div>
              </div>
            </div>

            {pendingValidationStudents.length === 0 ? (
              <div className="rounded-xl border border-amber-500/20 bg-white/70 dark:bg-slate-900/60 p-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>No hay altas pendientes de validación en este momento.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingValidationStudents.map(st => {
                  const addedByName = getProfileNameById(st.registeredBy);
                  const stActivities = (st.activities || []).map(enr => {
                    const act = activities.find(a => a.id === enr.activityId);
                    const t = act ? teachers.find(tc => tc.id === act.teacherId) : undefined;
                    return {
                      actId: enr.activityId,
                      actName: act?.name || 'Taller eliminado',
                      teacherName: t?.name
                    };
                  });

                  return (
                    <div
                      key={st.id}
                      className="rounded-xl border border-amber-500/30 bg-white dark:bg-slate-900 px-3 py-2 md:p-3.5 shadow-xs"
                    >
                      {/* Vista móvil: 1 fila compacta + botones solo icono */}
                      <div className="flex md:hidden items-center justify-between gap-2">
                        <div className="min-w-0 flex-1 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" title="Pendiente" />
                          <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                            {st.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onOpenAddStudent(st)}
                            title="Editar ficha"
                            aria-label={`Editar ficha de ${st.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                title: 'Rechazar / Dar de baja alta pendiente',
                                description: `¿Seguro que quieres rechazar el alta de "${st.name}"? Pasará a estado de baja/inactivo.`,
                                confirmLabel: 'Sí, rechazar',
                                tone: 'warning',
                                onConfirm: () => handleValidateStudent(st, false)
                              })
                            }
                            title="Rechazar alta"
                            aria-label={`Rechazar alta de ${st.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={validatingStudentId === st.id}
                            onClick={() => handleValidateStudent(st, true)}
                            title="Confirmar Socio"
                            aria-label={`Confirmar socio ${st.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Vista escritorio */}
                      <div className="hidden md:flex md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {st.name}
                            </span>
                            {getStudentStatusBadge(st.status)}
                            {addedByName && (
                              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                                Añadido por: {addedByName}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                            {st.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {st.phone}
                              </span>
                            )}
                            {st.email && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {st.email}
                              </span>
                            )}
                            <span>Alta: {st.registeredAt}</span>
                          </div>
                          {stActivities.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {stActivities.map(item => (
                                <span
                                  key={item.actId}
                                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
                                >
                                  <Sparkles className="h-3 w-3 text-emerald-600" />
                                  {item.actName}
                                  {item.teacherName ? ` (${item.teacherName})` : ''}
                                </span>
                              ))}
                            </div>
                          )}
                          {st.notes && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                              Nota: {st.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => onOpenAddStudent(st)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                title: 'Rechazar / Dar de baja alta pendiente',
                                description: `¿Seguro que quieres rechazar el alta de "${st.name}"? Pasará a estado de baja/inactivo.`,
                                confirmLabel: 'Sí, rechazar',
                                tone: 'warning',
                                onConfirm: () => handleValidateStudent(st, false)
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-300 dark:border-rose-800 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition whitespace-nowrap"
                          >
                            <UserX className="h-3.5 w-3.5" />
                            <span>Rechazar</span>
                          </button>
                          <button
                            type="button"
                            disabled={validatingStudentId === st.id}
                            onClick={() => handleValidateStudent(st, true)}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs whitespace-nowrap disabled:opacity-50"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>{validatingStudentId === st.id ? 'Confirmando...' : 'Confirmar Socio'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bloque A2: Solicitudes de inscripción a talleres enviadas por alumnos */}
          {pendingEnrollmentRequests.length > 0 && (
            <div className="rounded-2xl border border-indigo-500/35 bg-indigo-50/60 dark:bg-indigo-950/20 p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <h2 className="text-sm font-bold text-indigo-950 dark:text-indigo-100">
                    Solicitudes de Inscripción a Talleres ({pendingEnrollmentRequests.length})
                  </h2>
                  <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
                    Alumnos que han solicitado plaza desde la app y esperan confirmación de su inscripción.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {pendingEnrollmentRequests.map(req => {
                  const confirmKey = `c:${req.student.id}:${req.activityId}`;
                  const rejectKey = `r:${req.student.id}:${req.activityId}`;
                  const isBusy = busyEnrollmentKey === confirmKey || busyEnrollmentKey === rejectKey;

                  const handleConfirm = async () => {
                    setBusyEnrollmentKey(confirmKey);
                    try {
                      const res = await confirmActivityEnrollment(req.student.id, req.activityId);
                      if (res.success) {
                        setActionFeedback({
                          type: 'success',
                          message: `Inscripción confirmada: "${req.student.name}" en "${req.activityName}".`
                        });
                      } else {
                        setActionFeedback({
                          type: 'error',
                          message: res.error || 'No se pudo confirmar la inscripción.'
                        });
                      }
                    } finally {
                      setBusyEnrollmentKey(null);
                    }
                  };

                  const handleReject = async () => {
                    setBusyEnrollmentKey(rejectKey);
                    try {
                      const res = await rejectActivityEnrollment(req.student.id, req.activityId);
                      if (res.success) {
                        setActionFeedback({
                          type: 'success',
                          message: `Solicitud de "${req.student.name}" para "${req.activityName}" rechazada.`
                        });
                      } else {
                        setActionFeedback({
                          type: 'error',
                          message: res.error || 'No se pudo rechazar la solicitud.'
                        });
                      }
                    } finally {
                      setBusyEnrollmentKey(null);
                    }
                  };

                  return (
                    <div
                      key={`${req.student.id}-${req.activityId}`}
                      className="rounded-xl border border-indigo-500/25 bg-white dark:bg-slate-900 px-3 py-2 md:p-3.5 shadow-xs"
                    >
                      {/* Vista móvil: 1 fila + botones solo icono */}
                      <div className="flex md:hidden items-center justify-between gap-2">
                        <div className="min-w-0 flex-1 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                          <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                            {req.student.name}
                          </span>
                          <span className="truncate text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                            · {req.activityName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={handleReject}
                            title="Rechazar solicitud"
                            aria-label={`Rechazar solicitud de ${req.student.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 transition disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={handleConfirm}
                            title="Confirmar inscripción"
                            aria-label={`Confirmar inscripción de ${req.student.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Vista escritorio */}
                      <div className="hidden md:flex items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {req.student.name}
                            </span>
                            <span className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                              {req.activityName}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Monitor: <strong>{req.teacherName}</strong>
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {[req.student.phone, req.student.email].filter(Boolean).join(' · ') || 'Sin contacto'} · Solicitada el {req.enrolledSince}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={handleReject}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-300 dark:border-rose-800 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span>Rechazar</span>
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={handleConfirm}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>{busyEnrollmentKey === confirmKey ? 'Confirmando...' : 'Confirmar plaza'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bloque B: Inscripciones activas por taller / profesor */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Control de Inscripciones en Talleres ({enrollmentRows.length})
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Revisa qué alumnos ha inscrito cada monitor o administración, cambia su ficha o dales de baja del taller.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={enrollmentTeacherFilter}
                  onChange={e => setEnrollmentTeacherFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="all">Todos los profesores</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      Monitor: {t.name}
                    </option>
                  ))}
                </select>

                <select
                  value={enrollmentActivityFilter}
                  onChange={e => setEnrollmentActivityFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <option value="all">Todos los talleres</option>
                  {activities.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    onOpenEnrollStudent(
                      enrollmentActivityFilter !== 'all' ? enrollmentActivityFilter : undefined
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition whitespace-nowrap"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Nueva Inscripción</span>
                </button>
              </div>
            </div>

            {enrollmentRows.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
                No hay inscripciones que coincidan con los filtros seleccionados.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {enrollmentRows.map(row => (
                  <div
                    key={`${row.student.id}-${row.activityId}`}
                    className="py-2 md:py-3"
                  >
                    {/* Vista móvil: 1 fila compacta + botones solo icono */}
                    <div className="flex md:hidden items-center justify-between gap-2">
                      <div className="min-w-0 flex-1 flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            row.student.status === 'active'
                              ? 'bg-emerald-500'
                              : row.student.status === 'pending_validation'
                              ? 'bg-amber-500'
                              : row.student.status === 'trial'
                              ? 'bg-sky-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {row.student.name}
                        </span>
                        <span className="truncate text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                          · {row.activityName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {row.isPendingStudent && (
                          <button
                            type="button"
                            disabled={validatingStudentId === row.student.id}
                            onClick={() => handleValidateStudent(row.student, true)}
                            title="Confirmar Socio"
                            aria-label={`Confirmar socio ${row.student.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenAddStudent(row.student)}
                          title="Editar ficha"
                          aria-label={`Editar ficha de ${row.student.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              title: 'Quitar inscripción del taller',
                              description: `¿Confirmas dar de baja a "${row.student.name}" del taller "${row.activityName}"?`,
                              confirmLabel: 'Sí, quitar del taller',
                              tone: 'danger',
                              onConfirm: async () => {
                                const res = await unenrollStudentFromActivity(row.student.id, row.activityId);
                                if (res.success) {
                                  setActionFeedback({
                                    type: 'success',
                                    message: `"${row.student.name}" ha sido dado de baja del taller "${row.activityName}".`
                                  });
                                } else {
                                  setActionFeedback({
                                    type: 'error',
                                    message: res.error || 'No se pudo quitar la inscripción.'
                                  });
                                }
                              }
                            })
                          }
                          title="Quitar del taller"
                          aria-label={`Quitar a ${row.student.name} de ${row.activityName}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Vista escritorio */}
                    <div className="hidden md:flex md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {row.student.name}
                          </span>
                          {getStudentStatusBadge(row.student.status)}
                          <span className="rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                            {row.activityName}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Monitor: <strong className="text-slate-700 dark:text-slate-200">{row.teacherName}</strong>
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            Tarifa: <strong className="text-slate-700 dark:text-slate-200">{row.price}€</strong>{' '}
                            ({row.billingMode === 'per_class' ? 'por clase' : 'mensual'})
                          </span>
                          <span>Inscrito: {row.enrolledSince}</span>
                          {row.addedByName && (
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                              Alta añadida por: {row.addedByName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {row.isPendingStudent && (
                          <button
                            type="button"
                            disabled={validatingStudentId === row.student.id}
                            onClick={() => handleValidateStudent(row.student, true)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition whitespace-nowrap disabled:opacity-50"
                          >
                            <UserCheck className="h-3 w-3" />
                            <span>{validatingStudentId === row.student.id ? 'Confirmando...' : 'Confirmar Socio'}</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenAddStudent(row.student)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Editar ficha</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              title: 'Quitar inscripción del taller',
                              description: `¿Confirmas dar de baja a "${row.student.name}" del taller "${row.activityName}"?`,
                              confirmLabel: 'Sí, quitar del taller',
                              tone: 'danger',
                              onConfirm: async () => {
                                const res = await unenrollStudentFromActivity(row.student.id, row.activityId);
                                if (res.success) {
                                  setActionFeedback({
                                    type: 'success',
                                    message: `"${row.student.name}" ha sido dado de baja del taller "${row.activityName}".`
                                  });
                                } else {
                                  setActionFeedback({
                                    type: 'error',
                                    message: res.error || 'No se pudo quitar la inscripción.'
                                  });
                                }
                              }
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900/60 px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition whitespace-nowrap"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Quitar del taller</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* SUB-PESTAÑA 2: ALUMNOS Y SOCIOS (ALTAS, BAJAS, MODIFICACIONES)     */}
      {/* ================================================================== */}
      {activeSubTab === 'students' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all' as const, label: 'Todos' },
                { id: 'active' as const, label: 'Socios Activos' },
                { id: 'pending_validation' as const, label: 'Pendientes' },
                { id: 'trial' as const, label: 'En prueba' },
                { id: 'inactive' as const, label: 'De baja' }
              ].map(chip => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setStudentStatusFilter(chip.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                    studentStatusFilter === chip.id
                      ? 'bg-slate-900 dark:bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onOpenAddStudent()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition whitespace-nowrap"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Nuevo Alumno / Socio</span>
            </button>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
              No se encontraron alumnos o socios con los filtros actuales.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map(st => {
                const enrolledActivities = (st.activities || [])
                  .map(e => activities.find(a => a.id === e.activityId))
                  .filter((a): a is NonNullable<typeof a> => Boolean(a));
                const isInactive = st.status === 'inactive';
                const isPending =
                  st.status === 'pending_validation' || st.validationStatus === 'pending';
                const linkedProfile = profiles.find(p => p.studentId === st.id || p.id === st.profileId);

                return (
                  <div
                    key={st.id}
                    className={`py-2 md:py-3.5 ${isInactive ? 'opacity-75' : ''}`}
                  >
                    {/* Vista móvil: 1 fila por socio/alumno + botones solo icono */}
                    <div className="flex md:hidden items-center justify-between gap-2">
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            isPending
                              ? 'bg-amber-500'
                              : st.status === 'active'
                              ? 'bg-emerald-500'
                              : st.status === 'trial'
                              ? 'bg-sky-500'
                              : 'bg-slate-400'
                          }`}
                          title={isPending ? 'pending_validation' : st.status}
                        />
                        <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {st.name}
                        </span>
                        {(isPending || st.status !== 'active') && (
                          <span
                            className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                              isPending
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                : st.status === 'trial'
                                ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                                : 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {isPending ? 'Pend.' : st.status === 'trial' ? 'Prueba' : 'Baja'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isPending && (
                          <button
                            type="button"
                            disabled={validatingStudentId === st.id}
                            onClick={() => handleValidateStudent(st, true)}
                            title="Confirmar Socio"
                            aria-label={`Confirmar socio ${st.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onOpenAddStudent(st)}
                          title="Modificar"
                          aria-label={`Modificar ${st.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await updateStudent(st.id, { status: isInactive ? 'active' : 'inactive' });
                            if (res.success) {
                              setActionFeedback({
                                type: 'success',
                                message: isInactive
                                  ? `"${st.name}" reactivado como socio activo.`
                                  : `"${st.name}" pasado a estado de baja.`
                              });
                            } else {
                              setActionFeedback({
                                type: 'error',
                                message: res.error || 'No se pudo cambiar el estado del alumno.'
                              });
                            }
                          }}
                          title={isInactive ? 'Reactivar' : 'Dar de baja'}
                          aria-label={isInactive ? `Reactivar a ${st.name}` : `Dar de baja a ${st.name}`}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                            isInactive
                              ? 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                              : 'border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              title: 'Eliminar alumno / socio definitivamente',
                              description: `¿Seguro que quieres eliminar la ficha de "${st.name}"? Se perderá su historial de matrícula asociado si no hay recibos que lo bloqueen.`,
                              confirmLabel: 'Eliminar ficha',
                              tone: 'danger',
                              onConfirm: async () => {
                                await deleteStudent(st.id);
                                setActionFeedback({
                                  type: 'success',
                                  message: `Ficha de "${st.name}" eliminada.`
                                });
                              }
                            })
                          }
                          title="Eliminar"
                          aria-label={`Eliminar ficha de ${st.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Vista escritorio */}
                    <div className="hidden md:flex md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {st.name}
                          </span>
                          {getStudentStatusBadge(st.status)}
                          {linkedProfile && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300">
                              <Link2 className="h-3 w-3" /> Acceso Auth vinculado
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          {st.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" /> {st.phone}
                            </span>
                          )}
                          {st.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {st.email}
                            </span>
                          )}
                          <span>Registro: {st.registeredAt}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {enrolledActivities.length === 0 ? (
                            <span className="text-[11px] text-slate-400 italic">
                              Sin talleres asignados
                            </span>
                          ) : (
                            enrolledActivities.map(act => (
                              <span
                                key={act.id}
                                className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
                              >
                                {act.name}
                              </span>
                            ))
                          )}
                        </div>

                        {st.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                            {st.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {isPending && (
                          <button
                            type="button"
                            disabled={validatingStudentId === st.id}
                            onClick={() => handleValidateStudent(st, true)}
                            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition whitespace-nowrap disabled:opacity-50"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>{validatingStudentId === st.id ? 'Confirmando...' : 'Confirmar Socio'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenAddStudent(st)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Modificar</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            const res = await updateStudent(st.id, { status: isInactive ? 'active' : 'inactive' });
                            if (res.success) {
                              setActionFeedback({
                                type: 'success',
                                message: isInactive
                                  ? `"${st.name}" reactivado como socio activo.`
                                  : `"${st.name}" pasado a estado de baja.`
                              });
                            } else {
                              setActionFeedback({
                                type: 'error',
                                message: res.error || 'No se pudo cambiar el estado del alumno.'
                              });
                            }
                          }}
                          className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                            isInactive
                              ? 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                              : 'border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                          <span>{isInactive ? 'Reactivar' : 'Dar de baja'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              title: 'Eliminar alumno / socio definitivamente',
                              description: `¿Seguro que quieres eliminar la ficha de "${st.name}"? Se perderá su historial de matrícula asociado si no hay recibos que lo bloqueen.`,
                              confirmLabel: 'Eliminar ficha',
                              tone: 'danger',
                              onConfirm: async () => {
                                await deleteStudent(st.id);
                                setActionFeedback({
                                  type: 'success',
                                  message: `Ficha de "${st.name}" eliminada.`
                                });
                              }
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-200 dark:border-rose-900/60 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition whitespace-nowrap"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* SUB-PESTAÑA 3: PROFESORES / MONITORES                              */}
      {/* ================================================================== */}
      {activeSubTab === 'teachers' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all' as const, label: 'Todos' },
                { id: 'active' as const, label: 'Activos' },
                { id: 'inactive' as const, label: 'De baja' }
              ].map(chip => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setTeacherStatusFilter(chip.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                    teacherStatusFilter === chip.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onOpenAddTeacher()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition whitespace-nowrap"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Nuevo Profesor / Monitor</span>
            </button>
          </div>

          {filteredTeachers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
              No se encontraron profesores con los filtros actuales.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTeachers.map(t => {
                const tActivities = activities.filter(a => a.teacherId === t.id);
                const linkedProfile = profiles.find(p => p.teacherId === t.id);
                const schemeText =
                  t.paymentScheme === 'per_class'
                    ? `${t.ratePerClass}€ / clase`
                    : t.paymentScheme === 'monthly_fixed'
                    ? `${t.fixedMonthlyRate}€ fijo / mes`
                    : `${t.revenueSharePercent}% recaudación`;

                return (
                  <div
                    key={t.id}
                    className={`py-2 md:py-3.5 ${!t.active ? 'opacity-75' : ''}`}
                  >
                    {/* Vista móvil: 1 fila compacta + botones solo icono */}
                    <div className="flex md:hidden items-center justify-between gap-2">
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        {t.avatarUrl || t.avatar ? (
                          <img
                            src={t.avatarUrl || t.avatar}
                            alt={t.name}
                            className="h-7 w-7 rounded-full object-cover border border-indigo-400 shrink-0"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0">
                            {t.name.charAt(0)}
                          </div>
                        )}
                        <span
                          className={`h-2 w-2 rounded-full shrink-0 ${
                            t.active ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                        <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {t.name}
                        </span>
                        {!t.active && (
                          <span className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase bg-slate-500/15 text-slate-600 dark:text-slate-400">
                            Baja
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onOpenAddTeacher(t)}
                          title="Modificar"
                          aria-label={`Modificar monitor ${t.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateTeacher(t.id, { active: !t.active }).then(() => {
                              setActionFeedback({
                                type: 'success',
                                message: t.active
                                  ? `Monitor "${t.name}" marcado como de baja.`
                                  : `Monitor "${t.name}" reactivado.`
                              });
                            })
                          }
                          title={t.active ? 'Dar de baja' : 'Reactivar'}
                          aria-label={t.active ? `Dar de baja a ${t.name}` : `Reactivar a ${t.name}`}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                            !t.active
                              ? 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                              : 'border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              title: 'Eliminar profesor / monitor',
                              description:
                                tActivities.length > 0
                                  ? `"${t.name}" tiene ${tActivities.length} taller(es) asignado(s). ¿Seguro que deseas eliminarlo? Revisa si prefieres darle de baja en su lugar.`
                                  : `¿Seguro que quieres eliminar definitivamente la ficha del monitor "${t.name}"?`,
                              confirmLabel: 'Eliminar monitor',
                              tone: 'danger',
                              onConfirm: async () => {
                                await deleteTeacher(t.id);
                                setActionFeedback({
                                  type: 'success',
                                  message: `Monitor "${t.name}" eliminado.`
                                });
                              }
                            })
                          }
                          title="Eliminar"
                          aria-label={`Eliminar monitor ${t.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Vista escritorio */}
                    <div className="hidden md:flex md:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {t.avatarUrl || t.avatar ? (
                          <img
                            src={t.avatarUrl || t.avatar}
                            alt={t.name}
                            className="h-10 w-10 rounded-full object-cover border border-indigo-400 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-sm shrink-0">
                            {t.name.charAt(0)}
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {t.name}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                t.active
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-slate-500/15 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {t.active ? 'Activo' : 'De baja'}
                            </span>
                            <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                              {schemeText}
                            </span>
                            {linkedProfile && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300">
                                <Link2 className="h-3 w-3" /> Cuenta Auth vinculada
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                            {t.phone && (
                              <span className="inline-flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {t.phone}
                              </span>
                            )}
                            {t.email && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {t.email}
                              </span>
                            )}
                            <span>
                              Cobro: {t.collectionType === 'association' ? 'Asociación' : 'Personal'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {tActivities.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic">
                                Sin talleres asignados
                              </span>
                            ) : (
                              tActivities.map(act => (
                                <span
                                  key={act.id}
                                  className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
                                >
                                  {act.name}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onOpenAddTeacher(t)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Modificar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateTeacher(t.id, { active: !t.active }).then(() => {
                              setActionFeedback({
                                type: 'success',
                                message: t.active
                                  ? `Monitor "${t.name}" marcado como de baja.`
                                  : `Monitor "${t.name}" reactivado.`
                              });
                            })
                          }
                          className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                            !t.active
                              ? 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                              : 'border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                          }`}
                        >
                          <Power className="h-3.5 w-3.5" />
                          <span>{t.active ? 'Dar de baja' : 'Reactivar'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setConfirmAction({
                              title: 'Eliminar profesor / monitor',
                              description:
                                tActivities.length > 0
                                  ? `"${t.name}" tiene ${tActivities.length} taller(es) asignado(s). ¿Seguro que deseas eliminarlo? Revisa si prefieres darle de baja en su lugar.`
                                  : `¿Seguro que quieres eliminar definitivamente la ficha del monitor "${t.name}"?`,
                              confirmLabel: 'Eliminar monitor',
                              tone: 'danger',
                              onConfirm: async () => {
                                await deleteTeacher(t.id);
                                setActionFeedback({
                                  type: 'success',
                                  message: `Monitor "${t.name}" eliminado.`
                                });
                              }
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-xl border border-rose-200 dark:border-rose-900/60 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition whitespace-nowrap"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================================================================== */}
      {/* SUB-PESTAÑA 4: CUENTAS DE ACCESO (AUTH & PROFILES)                 */}
      {/* ================================================================== */}
      {activeSubTab === 'accounts' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Cuentas de Acceso en Supabase Auth & Tabla Profiles
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Crea credenciales de inicio de sesión, cambia roles, vincula fichas de profesor/alumno o revoca accesos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingAuthUser(prev => !prev)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-700 transition whitespace-nowrap"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{isAddingAuthUser ? 'Cerrar formulario' : '+ Alta Usuario con Acceso'}</span>
            </button>
          </div>

          {createdCredentials && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/30 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Check className="h-4 w-4" />
                  Credenciales de Acceso Generadas
                </span>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedCreds ? '¡Copiado!' : 'Copiar para enviar'}</span>
                </button>
              </div>
              <div className="rounded-lg bg-white dark:bg-slate-800 p-2.5 font-mono text-[11px] border border-emerald-200 dark:border-emerald-800 text-slate-700 dark:text-slate-200 space-y-1">
                <div>Correo: <strong>{createdCredentials.email}</strong></div>
                <div>Contraseña: <strong>{createdCredentials.pass}</strong></div>
                <div>Rol: <strong>{createdCredentials.roleLabel}</strong></div>
              </div>
            </div>
          )}

          {isAddingAuthUser && (
            <form
              onSubmit={handleCreateAuthUser}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Roberto Sánchez"
                    value={authName}
                    onChange={e => setAuthName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@actriskell.org"
                    value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rol *
                  </label>
                  <select
                    value={authRole}
                    onChange={e => setAuthRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="student">Alumno / Socio</option>
                    <option value="teacher">Profesor / Monitor</option>
                    <option value="teacher_student">Monitor-Alumno (Híbrido)</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contraseña Inicial
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 font-mono text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAuthPassword(`Triskell${Math.floor(1000 + Math.random() * 9000)}!`)
                      }
                      className="rounded-xl border border-slate-300 dark:border-slate-700 px-2.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Generar contraseña aleatoria"
                    >
                      🎲
                    </button>
                  </div>
                </div>
              </div>

              {(authRole === 'teacher' || authRole === 'teacher_student') && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 space-y-2">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 block text-[11px]">
                    Vincular a Ficha de Profesor
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <select
                      value={authTeacherId}
                      onChange={e => setAuthTeacherId(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Vincular a Profesor existente --</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.email || 'sin email'})
                        </option>
                      ))}
                    </select>
                    {!authTeacherId && (
                      <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={authCreateTeacher}
                          onChange={e => setAuthCreateTeacher(e.target.checked)}
                          className="rounded text-emerald-600 h-4 w-4"
                        />
                        <span>Crear ficha de profesor automáticamente</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {(authRole === 'student' || authRole === 'teacher_student') && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 block text-[11px]">
                    Vincular a Ficha de Alumno / Socio
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <select
                      value={authStudentId}
                      onChange={e => setAuthStudentId(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="">-- Vincular a Alumno existente --</option>
                      {students.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.email || 'sin email'})
                        </option>
                      ))}
                    </select>
                    {!authStudentId && (
                      <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={authCreateStudent}
                          onChange={e => setAuthCreateStudent(e.target.checked)}
                          className="rounded text-emerald-600 h-4 w-4"
                        />
                        <span>Crear ficha de alumno automáticamente</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingAuthUser(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2 font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 transition"
                >
                  <Check className="h-4 w-4" />
                  <span>{isSubmittingAuth ? 'Creando...' : 'Crear Usuario y Acceso'}</span>
                </button>
              </div>
            </form>
          )}

          {filteredProfiles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
              No se encontraron cuentas de usuario.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProfiles.map(p => {
                const isSelf = currentUser?.id === p.id;
                const linkedTeacher = p.teacherId
                  ? teachers.find(t => t.id === p.teacherId)
                  : undefined;
                const linkedStudent = p.studentId
                  ? students.find(s => s.id === p.studentId)
                  : undefined;

                return (
                  <div
                    key={p.id}
                    className="py-2 md:py-3"
                  >
                    {/* Vista móvil: 1 fila compacta + botones solo icono */}
                    <div className="flex md:hidden items-center justify-between gap-2">
                      <div className="min-w-0 flex-1 flex items-center gap-2">
                        {p.photoURL ? (
                          <img
                            src={p.photoURL}
                            alt={p.name}
                            className="h-7 w-7 rounded-full object-cover border border-emerald-500 shrink-0"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-xs shrink-0">
                            {p.name.charAt(0) || 'U'}
                          </div>
                        )}
                        <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {p.name}
                        </span>
                        <span
                          className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                            p.role === 'admin'
                              ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300'
                              : p.role === 'teacher'
                              ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300'
                              : p.role === 'teacher_student'
                              ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {p.role === 'admin'
                            ? 'Admin'
                            : p.role === 'teacher'
                            ? 'Prof'
                            : p.role === 'teacher_student'
                            ? 'Híb'
                            : 'Soc'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditProfileModal(p)}
                          title="Editar rol y vínculos"
                          aria-label={`Editar perfil y vínculos de ${p.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                title: 'Revocar acceso del usuario',
                                description: `¿Seguro que quieres revocar el acceso de "${p.name}" (${p.email})? Ya no podrá entrar a la aplicación.`,
                                confirmLabel: 'Sí, revocar acceso',
                                tone: 'danger',
                                onConfirm: async () => {
                                  await deleteUserAccess(p.id);
                                  setActionFeedback({
                                    type: 'success',
                                    message: `Acceso revocado para "${p.name}".`
                                  });
                                }
                              })
                            }
                            title="Revocar acceso"
                            aria-label={`Revocar acceso de ${p.name}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Vista escritorio */}
                    <div className="hidden md:flex md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {p.photoURL ? (
                          <img
                            src={p.photoURL}
                            alt={p.name}
                            className="h-10 w-10 rounded-full object-cover border border-emerald-500 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center text-sm shrink-0">
                            {p.name.charAt(0) || 'U'}
                          </div>
                        )}
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              {p.name}
                            </span>
                            {isSelf && (
                              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                Tu usuario
                              </span>
                            )}
                            {linkedTeacher && (
                              <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                                Profesor: {linkedTeacher.name}
                              </span>
                            )}
                            {linkedStudent && (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                                Alumno: {linkedStudent.name}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                            {p.email}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <select
                          value={p.role}
                          onChange={e => updateUserRole(p.id, e.target.value as UserRole)}
                          className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                        >
                          <option value="student">Alumno / Socio</option>
                          <option value="teacher">Profesor / Monitor</option>
                          <option value="teacher_student">Monitor-Alumno</option>
                          <option value="admin">Administrador</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => openEditProfileModal(p)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition whitespace-nowrap"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Editar vínculos</span>
                        </button>

                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                title: 'Revocar acceso del usuario',
                                description: `¿Seguro que quieres revocar el acceso de "${p.name}" (${p.email})? Ya no podrá entrar a la aplicación.`,
                                confirmLabel: 'Sí, revocar acceso',
                                tone: 'danger',
                                onConfirm: async () => {
                                  await deleteUserAccess(p.id);
                                  setActionFeedback({
                                    type: 'success',
                                    message: `Acceso revocado para "${p.name}".`
                                  });
                                }
                              })
                            }
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 dark:border-rose-900/60 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition whitespace-nowrap"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Revocar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal de Edición de Perfil Auth & Vínculos */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Modificar Usuario y Vínculos
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">{editingProfile.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProfile} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre para mostrar *
                </label>
                <input
                  type="text"
                  required
                  value={editProfileName}
                  onChange={e => setEditProfileName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rol asignado
                </label>
                <select
                  value={editProfileRole}
                  onChange={e => setEditProfileRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-semibold text-slate-900 dark:text-white"
                >
                  <option value="student">Alumno / Socio</option>
                  <option value="teacher">Profesor / Monitor</option>
                  <option value="teacher_student">Monitor-Alumno (Híbrido)</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              {(editProfileRole === 'teacher' || editProfileRole === 'teacher_student') && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ficha de Profesor vinculada
                  </label>
                  <select
                    value={editProfileTeacherId}
                    onChange={e => setEditProfileTeacherId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Sin ficha de profesor --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(editProfileRole === 'student' || editProfileRole === 'teacher_student') && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ficha de Alumno / Socio vinculada
                  </label>
                  <select
                    value={editProfileStudentId}
                    onChange={e => setEditProfileStudentId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="">-- Sin ficha de alumno --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 transition"
                >
                  <Check className="h-4 w-4" />
                  <span>{isSavingProfile ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación In-App */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  confirmAction.tone === 'danger'
                    ? 'bg-rose-500/15 text-rose-600'
                    : 'bg-amber-500/15 text-amber-600'
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {confirmAction.title}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {confirmAction.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isConfirming}
                onClick={() => setConfirmAction(null)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isConfirming}
                onClick={executeConfirmAction}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition ${
                  confirmAction.tone === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {isConfirming ? 'Procesando...' : confirmAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
