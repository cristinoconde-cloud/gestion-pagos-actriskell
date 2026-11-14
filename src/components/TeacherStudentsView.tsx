import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, PaymentStatus, Student } from '../types';
import {
  Users,
  Search,
  Sparkles,
  Clock,
  Check,
  X,
  Phone,
  Mail,
  MessageCircle,
  UserPlus,
  UserMinus,
  AlertTriangle,
  CheckCircle2,
  Filter
} from 'lucide-react';

interface TeacherStudentsViewProps {
  onOpenEnrollStudent?: (activityId?: string) => void;
}

export const TeacherStudentsView: React.FC<TeacherStudentsViewProps> = ({
  onOpenEnrollStudent
}) => {
  const {
    students,
    activities,
    teachers,
    periodPayments,
    selectedPeriod,
    currentTeacherId,
    confirmActivityEnrollment,
    rejectActivityEnrollment,
    unenrollStudentFromActivity
  } = useApp();

  const currentTeacher = teachers.find(t => t.id === currentTeacherId) || teachers[0];

  const myActivities = useMemo(
    () => activities.filter(a => a.teacherId === currentTeacher?.id),
    [activities, currentTeacher?.id]
  );
  const myActivityIds = useMemo(() => new Set(myActivities.map(a => a.id)), [myActivities]);

  const [scopeFilter, setScopeFilter] = useState<'all_activities' | 'my_activities'>('all_activities');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending_requests' | 'paid' | 'unpaid'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [pendingRemoval, setPendingRemoval] = useState<{
    studentId: string;
    studentName: string;
    activityId: string;
    activityName: string;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Solicitudes pendientes de inscripción en actividades de este monitor
  const myPendingRequests = useMemo(() => {
    const items: Array<{
      student: Student;
      activity: Activity;
      enrolledSince: string;
    }> = [];
    for (const st of students) {
      for (const req of st.pendingEnrollments || []) {
        if (!myActivityIds.has(req.activityId)) continue;
        const act = activities.find(a => a.id === req.activityId);
        if (!act) continue;
        items.push({
          student: st,
          activity: act,
          enrolledSince: req.enrolledSince
        });
      }
    }
    return items;
  }, [students, activities, myActivityIds]);

  const activitiesAvailableInScope = useMemo(() => {
    if (scopeFilter === 'my_activities') return myActivities;
    return activities.filter(a => a.active !== false);
  }, [scopeFilter, myActivities, activities]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Resolver estado de pago de un alumno en una actividad para el mes seleccionado
  const getStudentActivityPaymentStatus = (
    studentId: string,
    activityId: string
  ): PaymentStatus | 'none' => {
    const matches = periodPayments.filter(
      p => p.studentId === studentId && p.activityId === activityId
    );
    if (matches.some(p => p.status === 'paid')) return 'paid';
    if (matches.some(p => p.status === 'partial')) return 'partial';
    if (matches.some(p => p.status === 'overdue')) return 'overdue';
    if (matches.some(p => p.status === 'pending')) return 'pending';
    return 'none';
  };

  // Listado consolidado de alumnos con sus matrículas dentro del alcance seleccionado
  const studentRows = useMemo(() => {
    const scopedActivityIds = new Set(
      activityFilter !== 'all'
        ? [activityFilter]
        : activitiesAvailableInScope.map(a => a.id)
    );

    return students
      .filter(st => st.status !== 'inactive')
      .map(st => {
        const matchedActiveEnrollments = (st.activities || [])
          .filter(enr => scopedActivityIds.has(enr.activityId))
          .map(enr => {
            const act = activities.find(a => a.id === enr.activityId);
            if (!act) return null;
            const teacher = teachers.find(t => t.id === act.teacherId);
            const billingMode = enr.billingMode || act.billingMode;
            const price =
              enr.customPrice ??
              (billingMode === 'per_class' ? act.defaultPricePerClass : act.defaultPriceMonthly);
            const paymentStatus = getStudentActivityPaymentStatus(st.id, act.id);
            return {
              activity: act,
              teacherName: teacher?.name || 'Sin monitor',
              isMine: myActivityIds.has(act.id),
              billingMode,
              price,
              enrolledSince: enr.enrolledSince,
              paymentStatus
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item));

        const matchedPendingEnrollments = (st.pendingEnrollments || [])
          .filter(enr => scopedActivityIds.has(enr.activityId))
          .map(enr => {
            const act = activities.find(a => a.id === enr.activityId);
            if (!act) return null;
            const teacher = teachers.find(t => t.id === act.teacherId);
            return {
              activity: act,
              teacherName: teacher?.name || 'Sin monitor',
              isMine: myActivityIds.has(act.id),
              enrolledSince: enr.enrolledSince
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item));

        return {
          student: st,
          enrollments: matchedActiveEnrollments,
          pendingRequests: matchedPendingEnrollments
        };
      })
      .filter(row => row.enrollments.length > 0 || row.pendingRequests.length > 0)
      .filter(row => {
        if (statusFilter === 'pending_requests' && row.pendingRequests.length === 0) {
          return false;
        }
        if (
          statusFilter === 'paid' &&
          !row.enrollments.some(e => e.paymentStatus === 'paid')
        ) {
          return false;
        }
        if (
          statusFilter === 'unpaid' &&
          !row.enrollments.some(
            e =>
              e.paymentStatus === 'pending' ||
              e.paymentStatus === 'overdue' ||
              e.paymentStatus === 'partial' ||
              e.paymentStatus === 'none'
          )
        ) {
          return false;
        }
        if (normalizedQuery) {
          const haystack = [
            row.student.name,
            row.student.email,
            row.student.phone,
            ...row.enrollments.map(e => `${e.activity.name} ${e.teacherName}`),
            ...row.pendingRequests.map(p => `${p.activity.name} ${p.teacherName}`)
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
    periodPayments,
    activitiesAvailableInScope,
    activityFilter,
    statusFilter,
    normalizedQuery,
    myActivityIds
  ]);

  const totalEnrollmentsInList = useMemo(
    () => studentRows.reduce((acc, r) => acc + r.enrollments.length, 0),
    [studentRows]
  );

  const handleConfirmEnrollment = async (student: Student, activity: Activity) => {
    const key = `confirm:${student.id}:${activity.id}`;
    setBusyKey(key);
    setErrorMsg(null);
    setFeedbackMsg(null);
    try {
      const res = await confirmActivityEnrollment(student.id, activity.id);
      if (res.success) {
        setFeedbackMsg(`Inscripción confirmada: ${student.name} en "${activity.name}".`);
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setErrorMsg(res.error || 'No se pudo confirmar la solicitud.');
      }
    } finally {
      setBusyKey(null);
    }
  };

  const handleRejectEnrollment = async (student: Student, activity: Activity) => {
    const key = `reject:${student.id}:${activity.id}`;
    setBusyKey(key);
    setErrorMsg(null);
    setFeedbackMsg(null);
    try {
      const res = await rejectActivityEnrollment(student.id, activity.id);
      if (res.success) {
        setFeedbackMsg(`Solicitud de ${student.name} para "${activity.name}" rechazada.`);
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setErrorMsg(res.error || 'No se pudo rechazar la solicitud.');
      }
    } finally {
      setBusyKey(null);
    }
  };

  const handleConfirmRemoval = async () => {
    if (!pendingRemoval) return;
    setIsRemoving(true);
    setErrorMsg(null);
    try {
      const res = await unenrollStudentFromActivity(
        pendingRemoval.studentId,
        pendingRemoval.activityId
      );
      if (res.success) {
        setFeedbackMsg(
          `Se quitó a ${pendingRemoval.studentName} de "${pendingRemoval.activityName}".`
        );
        setTimeout(() => setFeedbackMsg(null), 3500);
      } else {
        setErrorMsg(res.error || 'No se pudo quitar al alumno del taller.');
      }
      setPendingRemoval(null);
    } finally {
      setIsRemoving(false);
    }
  };

  const getPaymentBadge = (status: PaymentStatus | 'none') => {
    switch (status) {
      case 'paid':
        return {
          label: 'Pagado',
          className:
            'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
        };
      case 'partial':
        return {
          label: 'Parcial',
          className:
            'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30'
        };
      case 'overdue':
        return {
          label: 'Vencido',
          className: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
        };
      case 'pending':
        return {
          label: 'Pendiente',
          className:
            'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
        };
      default:
        return {
          label: 'Sin cuota',
          className:
            'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
        };
    }
  };

  return (
    <div className="space-y-5">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>Alumnos por Actividades</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Directorio unificado de alumnos inscritos en todas las actividades y solicitudes pendientes ({selectedPeriod})
          </p>
        </div>

        {onOpenEnrollStudent && (
          <button
            type="button"
            onClick={() =>
              onOpenEnrollStudent(activityFilter !== 'all' ? activityFilter : myActivities[0]?.id)
            }
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-xs whitespace-nowrap"
          >
            <UserPlus className="h-4 w-4" />
            <span>Inscribir Alumno</span>
          </button>
        )}
      </div>

      {/* Resumen numérico rápido */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Alumnos
          </span>
          <span className="text-lg sm:text-xl font-black tabular-nums text-slate-900 dark:text-white">
            {studentRows.length}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Matrículas
          </span>
          <span className="text-lg sm:text-xl font-black tabular-nums text-indigo-600 dark:text-indigo-400">
            {totalEnrollmentsInList}
          </span>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 p-3 sm:p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
            Solicitudes
          </span>
          <span className="text-lg sm:text-xl font-black tabular-nums text-amber-700 dark:text-amber-300">
            {myPendingRequests.length}
          </span>
        </div>
      </div>

      {/* Feedback */}
      {feedbackMsg && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/30 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-50/80 dark:bg-rose-950/30 p-3 text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Solicitudes pendientes en actividades del monitor */}
      {myPendingRequests.length > 0 && (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-50/70 dark:bg-amber-950/20 p-4 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100">
                Solicitudes pendientes de confirmar en tus clases ({myPendingRequests.length})
              </h2>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                Confirma o rechaza las peticiones enviadas por alumnos desde Clases/Taller.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {myPendingRequests.map(({ student, activity, enrolledSince }) => {
              const cKey = `confirm:${student.id}:${activity.id}`;
              const rKey = `reject:${student.id}:${activity.id}`;
              const isBusy = busyKey === cKey || busyKey === rKey;
              return (
                <div
                  key={`${student.id}-${activity.id}`}
                  className="rounded-xl border border-amber-500/25 bg-white dark:bg-slate-900 px-3 py-2.5 flex items-center justify-between gap-2 text-xs shadow-xs"
                >
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-slate-900 dark:text-white truncate block">
                      {student.name}
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold truncate block">
                      {activity.name} · {enrolledSince}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleConfirmEnrollment(student, activity)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{busyKey === cKey ? '...' : 'Confirmar'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleRejectEnrollment(student, activity)}
                      title="Rechazar solicitud"
                      aria-label={`Rechazar solicitud de ${student.name}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtros y Buscador */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Alcance: Todas las actividades vs Mis actividades */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setScopeFilter('all_activities');
                  setActivityFilter('all');
                }}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  scopeFilter === 'all_activities'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todas las actividades
              </button>
              <button
                type="button"
                onClick={() => {
                  setScopeFilter('my_activities');
                  setActivityFilter('all');
                }}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  scopeFilter === 'my_activities'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Mis actividades ({myActivities.length})
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                value={activityFilter}
                onChange={e => setActivityFilter(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-indigo-500"
              >
                <option value="all">
                  {scopeFilter === 'my_activities'
                    ? 'Todos mis talleres'
                    : 'Todos los talleres del centro'}
                </option>
                {activitiesAvailableInScope.map(act => (
                  <option key={act.id} value={act.id}>
                    {act.name}
                    {myActivityIds.has(act.id) ? ' (Mía)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar alumno, teléfono o taller..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-white focus:outline-indigo-500"
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

        {/* Chips de estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all' as const, label: 'Todos' },
            { id: 'pending_requests' as const, label: 'Con solicitudes pendientes' },
            { id: 'paid' as const, label: 'Cuota pagada' },
            { id: 'unpaid' as const, label: 'Pendiente / Sin cuota' }
          ].map(chip => (
            <button
              key={chip.id}
              type="button"
              onClick={() => setStatusFilter(chip.id)}
              className={`rounded-xl px-3 py-1 text-[11px] font-bold whitespace-nowrap transition ${
                statusFilter === chip.id
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Alumnos */}
      {studentRows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-xs text-slate-400">
          No se encontraron alumnos con los filtros actuales.
        </div>
      ) : (
        <div className="space-y-3">
          {studentRows.map(({ student, enrollments, pendingRequests }) => {
            const cleanPhone = student.phone?.replace(/[^0-9]/g, '');
            const isPendingSocio =
              student.status === 'pending_validation' || student.validationStatus === 'pending';

            return (
              <div
                key={student.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3"
              >
                {/* Cabecera del alumno */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-extrabold text-indigo-700 dark:text-indigo-300 text-sm shrink-0">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {student.name}
                        </span>
                        {isPendingSocio && (
                          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            Alta pendiente
                          </span>
                        )}
                        {student.status === 'trial' && (
                          <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                            En prueba
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {student.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{student.phone}</span>
                          </span>
                        )}
                        {student.email && (
                          <span className="inline-flex items-center gap-1 truncate">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{student.email}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {cleanPhone && (
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-xl border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition whitespace-nowrap"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>

                {/* Actividades confirmadas del alumno */}
                {enrollments.length > 0 && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 px-3">
                    {enrollments.map(enr => {
                      const badge = getPaymentBadge(enr.paymentStatus);
                      return (
                        <div
                          key={enr.activity.id}
                          className="py-2 flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 font-bold text-slate-800 dark:text-slate-200">
                              <Sparkles
                                className={`h-3.5 w-3.5 shrink-0 ${
                                  enr.isMine ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600'
                                }`}
                              />
                              <span>{enr.activity.name}</span>
                            </span>
                            {enr.isMine ? (
                              <span className="rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                                Tu clase
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                · {enr.teacherName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] font-bold tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                              {enr.price}€/{enr.billingMode === 'per_class' ? 'c' : 'mes'}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                            {enr.isMine && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPendingRemoval({
                                    studentId: student.id,
                                    studentName: student.name,
                                    activityId: enr.activity.id,
                                    activityName: enr.activity.name
                                  })
                                }
                                title={`Quitar a ${student.name} de ${enr.activity.name}`}
                                aria-label={`Quitar a ${student.name} de ${enr.activity.name}`}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Solicitudes pendientes del alumno */}
                {pendingRequests.length > 0 && (
                  <div className="space-y-1.5">
                    {pendingRequests.map(req => {
                      const cKey = `confirm:${student.id}:${req.activity.id}`;
                      const rKey = `reject:${student.id}:${req.activity.id}`;
                      const isBusy = busyKey === cKey || busyKey === rKey;
                      return (
                        <div
                          key={`pending-${req.activity.id}`}
                          className="rounded-xl border border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/25 px-3 py-2 flex items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0 flex-1 flex items-center gap-2 flex-wrap">
                            <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span className="font-bold text-amber-900 dark:text-amber-200">
                              Solicitud pendiente: {req.activity.name}
                            </span>
                            <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                              ({req.teacherName})
                            </span>
                          </div>
                          {req.isMine && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleConfirmEnrollment(student, req.activity)}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                              >
                                <Check className="h-3 w-3" />
                                <span>{busyKey === cKey ? '...' : 'Confirmar'}</span>
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => handleRejectEnrollment(student, req.activity)}
                                title="Rechazar solicitud"
                                aria-label={`Rechazar solicitud de ${student.name}`}
                                className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 transition disabled:opacity-50"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmación para quitar alumno del taller */}
      {pendingRemoval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Quitar alumno del taller
                </h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  ¿Seguro que quieres dar de baja a <strong>{pendingRemoval.studentName}</strong> del taller{' '}
                  <strong>{pendingRemoval.activityName}</strong>? Su ficha general de socio no se eliminará.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={isRemoving}
                onClick={() => setPendingRemoval(null)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isRemoving}
                onClick={handleConfirmRemoval}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-60"
              >
                {isRemoving ? 'Quitando...' : 'Sí, quitar del taller'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
