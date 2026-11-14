import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Activity } from '../types';
import {
  Plus,
  Users,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  Send,
  GraduationCap,
  MessageCircle,
  UserMinus,
  AlertTriangle,
  X,
  Check,
  Loader2
} from 'lucide-react';
import { TeacherWorkshopsSection } from './TeacherPortalView';

interface ActivitiesViewProps {
  onOpenAddActivity: (activity?: Activity) => void;
  onOpenAddStudent: () => void;
  onOpenEnrollStudent?: (activityId?: string) => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  onOpenAddActivity,
  onOpenAddStudent,
  onOpenEnrollStudent
}) => {
  const {
    activities,
    teachers,
    students,
    periodPayments,
    deleteActivity,
    unenrollStudentFromActivity,
    requestActivityEnrollment,
    cancelActivityEnrollmentRequest,
    confirmActivityEnrollment,
    rejectActivityEnrollment,
    currentRole,
    currentTeacherId,
    currentStudentId,
    currentUser
  } = useApp();

  const currentTeacher = teachers.find(t => t.id === currentTeacherId);

  const currentStudent = useMemo(() => {
    const emailNorm = (currentUser?.email || '').trim().toLowerCase();
    return (
      students.find(
        s =>
          (currentUser?.studentId && s.id === currentUser.studentId) ||
          (currentUser?.id && s.profileId === currentUser.id) ||
          (emailNorm && s.email.trim().toLowerCase() === emailNorm)
      ) ||
      students.find(s => s.id === currentStudentId) ||
      undefined
    );
  }, [students, currentUser, currentStudentId]);

  const isAdmin = currentRole === 'admin';
  const isTeacher = currentRole === 'teacher';
  const isStudent = currentRole === 'student';
  const isUnion = currentRole === 'teacher_student';

  // Filtro interno para monitor-alumno (unión de asignadas + disponibles para solicitar)
  const [unionFilter, setUnionFilter] = useState<'all' | 'assigned' | 'request'>('all');

  const storageKey = `triskell_activity_requests_${currentUser?.id || currentStudentId || 'guest'}`;
  const [legacyRequestedIds, setLegacyRequestedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [busyActivityKey, setBusyActivityKey] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<{
    studentId: string;
    studentName: string;
    activityId: string;
    activityName: string;
  } | null>(null);
  const [pendingActivityDelete, setPendingActivityDelete] = useState<Activity | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const removeLegacyRequestId = (actId: string) => {
    setLegacyRequestedIds(prev => {
      const next = prev.filter(id => id !== actId);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // Ignorar
      }
      return next;
    });
  };

  const handleConfirmUnenroll = async () => {
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
          `Se quitó a ${pendingRemoval.studentName} del taller "${pendingRemoval.activityName}".`
        );
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setErrorMsg(res.error || 'No se pudo quitar al alumno del taller.');
      }
      setPendingRemoval(null);
    } finally {
      setIsRemoving(false);
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setLegacyRequestedIds(raw ? JSON.parse(raw) : []);
    } catch {
      setLegacyRequestedIds([]);
    }
  }, [storageKey]);

  const handleRequestEnrollment = async (act: Activity) => {
    setBusyActivityKey(`req:${act.id}`);
    setErrorMsg(null);
    setFeedbackMsg(null);
    try {
      const res = await requestActivityEnrollment(act.id, currentStudent?.id);
      if (res.success) {
        removeLegacyRequestId(act.id);
        setFeedbackMsg(
          `Solicitud enviada para "${act.name}". El coordinador o monitor confirmará tu plaza.`
        );
        setTimeout(() => setFeedbackMsg(null), 5000);
      } else {
        setErrorMsg(res.error || `No se pudo enviar la solicitud para "${act.name}".`);
      }
    } finally {
      setBusyActivityKey(null);
    }
  };

  const handleCancelRequest = async (act: Activity) => {
    setBusyActivityKey(`cancel:${act.id}`);
    setErrorMsg(null);
    setFeedbackMsg(null);
    try {
      if (currentStudent?.id) {
        const hasDbPending = (currentStudent.pendingEnrollments || []).some(
          e => e.activityId === act.id
        );
        if (hasDbPending) {
          const res = await cancelActivityEnrollmentRequest(currentStudent.id, act.id);
          if (!res.success) {
            setErrorMsg(res.error || 'No se pudo cancelar la solicitud.');
            return;
          }
        }
      }
      removeLegacyRequestId(act.id);
      setFeedbackMsg(`Has cancelado tu solicitud de inscripción en "${act.name}".`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    } finally {
      setBusyActivityKey(null);
    }
  };

  const handleConfirmPendingEnrollment = async (
    studentId: string,
    studentName: string,
    act: Activity
  ) => {
    setBusyActivityKey(`confirm:${studentId}:${act.id}`);
    setErrorMsg(null);
    setFeedbackMsg(null);
    try {
      const res = await confirmActivityEnrollment(studentId, act.id);
      if (res.success) {
        setFeedbackMsg(`Inscripción confirmada: ${studentName} en "${act.name}".`);
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setErrorMsg(res.error || 'No se pudo confirmar la inscripción.');
      }
    } finally {
      setBusyActivityKey(null);
    }
  };

  const handleRejectPendingEnrollment = async (
    studentId: string,
    studentName: string,
    act: Activity
  ) => {
    setBusyActivityKey(`reject:${studentId}:${act.id}`);
    setErrorMsg(null);
    setFeedbackMsg(null);
    try {
      const res = await rejectActivityEnrollment(studentId, act.id);
      if (res.success) {
        setFeedbackMsg(`Solicitud de ${studentName} para "${act.name}" rechazada.`);
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setErrorMsg(res.error || 'No se pudo rechazar la solicitud.');
      }
    } finally {
      setBusyActivityKey(null);
    }
  };

  // Filtrado de actividades según rol
  const visibleActivities = useMemo(() => {
    if (isAdmin) return activities;
    if (isTeacher) {
      return activities.filter(act => act.teacherId === currentTeacher?.id);
    }
    if (isStudent) {
      return activities.filter(act => act.active !== false);
    }
    // teacher_student (unión)
    if (unionFilter === 'assigned') {
      return activities.filter(act => act.teacherId === currentTeacher?.id);
    }
    if (unionFilter === 'request') {
      return activities.filter(act => act.active !== false && act.teacherId !== currentTeacher?.id);
    }
    return activities.filter(act => act.active !== false || act.teacherId === currentTeacher?.id);
  }, [activities, isAdmin, isTeacher, isStudent, isUnion, unionFilter, currentTeacher?.id]);

  // Vista dedicada para el Monitor ("Mis talleres & Alumnos")
  if (isTeacher) {
    return (
      <TeacherWorkshopsSection
        onOpenAddActivity={(act) => onOpenAddActivity(act)}
        onOpenAddStudent={onOpenAddStudent}
        onOpenEnrollStudent={onOpenEnrollStudent}
      />
    );
  }

  const headerSubtitle = useMemo(() => {
    if (isAdmin) return 'Horarios, salas, precios, recaudación y asignación de monitores';
    if (isTeacher) return 'Clases y talleres asignados a tu monitoría';
    if (isStudent) return 'Consulta las clases disponibles y solicita o cancela tu inscripción';
    return 'Tus clases asignadas como monitor y talleres disponibles para solicitar como alumno';
  }, [isAdmin, isTeacher, isStudent]);

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Clases/Taller ({visibleActivities.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {headerSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isUnion && (
            <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'assigned', label: 'Asignadas' },
                { id: 'request', label: 'Solicitar plaza' }
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setUnionFilter(opt.id as 'all' | 'assigned' | 'request')}
                  className={`rounded-lg px-2.5 py-1 transition whitespace-nowrap ${
                    unionFilter === opt.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {isAdmin && (
            <button
              onClick={() => onOpenAddActivity()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Actividad</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmación / Error */}
      {feedbackMsg && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/30 p-3.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-50/80 dark:bg-rose-950/30 p-3.5 text-xs font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Estado vacío */}
      {visibleActivities.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-xs text-slate-500 dark:text-slate-400">
          {isTeacher
            ? 'No tienes clases ni talleres asignados actualmente.'
            : 'No hay clases o talleres disponibles en esta vista.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {visibleActivities.map(act => {
            const teacher = teachers.find(t => t.id === act.teacherId);
            const isAssignedToMe = act.teacherId === currentTeacher?.id;
            const isEnrolledAsStudent = Boolean(
              currentStudent?.activities.some(a => a.activityId === act.id)
            );
            const isDbRequested = Boolean(
              (currentStudent?.pendingEnrollments || []).some(a => a.activityId === act.id)
            );
            const isRequested = isDbRequested || legacyRequestedIds.includes(act.id);

            const enrolledStudents = students.filter(s =>
              s.activities.some(a => a.activityId === act.id)
            );
            const pendingRequestsForActivity = students.filter(s =>
              (s.pendingEnrollments || []).some(p => p.activityId === act.id)
            );

            // Recaudación mensual visible solo para administración
            const activityRevenue = periodPayments
              .filter(p => p.activityId === act.id && (p.status === 'paid' || p.status === 'partial'))
              .reduce((acc, p) => acc + p.amount, 0);

            const showRosterAndManagement = isAdmin || ((isTeacher || isUnion) && isAssignedToMe);
            const showRequestAction = isStudent || (isUnion && !isAssignedToMe);

            return (
              <div
                key={act.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Cabecera Actividad */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                          {act.category}
                        </span>
                        {(isTeacher || isUnion) && isAssignedToMe && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                            <GraduationCap className="h-3 w-3" />
                            Asignada
                          </span>
                        )}
                        {showRosterAndManagement && pendingRequestsForActivity.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                            <Clock className="h-3 w-3" />
                            {pendingRequestsForActivity.length} solicitud{pendingRequestsForActivity.length > 1 ? 'es' : ''}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1.5 text-base font-bold text-slate-900 dark:text-white">
                        {act.name}
                      </h3>
                    </div>

                    {(isAdmin || ((isTeacher || isUnion) && isAssignedToMe)) && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenAddActivity(act)}
                          title="Editar actividad / taller"
                          className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setPendingActivityDelete(act)}
                            title="Eliminar actividad"
                            className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {act.description}
                  </p>

                  {/* Detalles clave */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-2.5 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Monitor Responsable
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block truncate">
                        {teacher?.name || 'Sin profesor'}
                      </span>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-2.5 border border-slate-200/60 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Espacio / Sala
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block truncate">
                        {act.room}
                      </span>
                    </div>
                  </div>

                  {/* Horarios */}
                  <div className="mt-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Horarios de clase
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {act.schedule.map((sch, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                        >
                          <Clock className="h-3 w-3 text-emerald-600" />
                          {sch}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tarifas (y recaudación solo para Admin) */}
                  <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Tarifas:</span>
                      <div className="font-bold tabular-nums text-slate-900 dark:text-white">
                        {act.defaultPriceMonthly}€ / mes · {act.defaultPricePerClass}€ / clase
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="text-right">
                        <span className="text-slate-400 text-[11px]">Recaudado este mes:</span>
                        <div className="font-black tabular-nums text-emerald-600 dark:text-emerald-400">
                          {activityRevenue.toFixed(2)} €
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pie de tarjeta según rol */}
                {showRosterAndManagement && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                    {/* Solicitudes pendientes de confirmación por profesor/admin */}
                    {pendingRequestsForActivity.length > 0 && (
                      <div className="rounded-xl border border-amber-500/35 bg-amber-50/70 dark:bg-amber-950/25 p-2.5 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Solicitudes pendientes de confirmar ({pendingRequestsForActivity.length})
                        </span>
                        <div className="space-y-1.5">
                          {pendingRequestsForActivity.map(st => {
                            const confirmKey = `confirm:${st.id}:${act.id}`;
                            const rejectKey = `reject:${st.id}:${act.id}`;
                            const isBusy = busyActivityKey === confirmKey || busyActivityKey === rejectKey;
                            return (
                              <div
                                key={st.id}
                                className="flex items-center justify-between gap-2 rounded-lg bg-white/90 dark:bg-slate-900/90 px-2.5 py-1.5 text-xs border border-amber-500/20"
                              >
                                <div className="min-w-0 flex-1">
                                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                                    {st.name}
                                  </span>
                                  {(st.phone || st.email) && (
                                    <span className="text-[10px] text-slate-500 truncate block">
                                      {st.phone || st.email}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => handleConfirmPendingEnrollment(st.id, st.name, act)}
                                    title="Confirmar inscripción"
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                                  >
                                    {busyActivityKey === confirmKey ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                    <span>Confirmar</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() => handleRejectPendingEnrollment(st.id, st.name, act)}
                                    title="Rechazar solicitud"
                                    aria-label={`Rechazar solicitud de ${st.name}`}
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-50"
                                  >
                                    {busyActivityKey === rejectKey ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <X className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{enrolledStudents.length} Alumnos inscritos</span>
                        </span>
                        {(isAdmin || ((isTeacher || isUnion) && isAssignedToMe)) && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenEnrollStudent
                                ? onOpenEnrollStudent(act.id)
                                : onOpenAddStudent()
                            }
                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            + Inscribir
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {enrolledStudents.length === 0 ? (
                          <span className="text-xs text-slate-400 italic">No hay alumnos todavía.</span>
                        ) : (
                          enrolledStudents.map(st => {
                            const isPending =
                              st.status === 'pending_validation' || st.validationStatus === 'pending';
                            return (
                              <span
                                key={st.id}
                                className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-medium ${
                                  isPending
                                    ? 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span>{st.name}</span>
                                {isPending && (
                                  <span className="text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                                    · Pendiente
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPendingRemoval({
                                      studentId: st.id,
                                      studentName: st.name,
                                      activityId: act.id,
                                      activityName: act.name
                                    })
                                  }
                                  title={`Quitar a ${st.name} de ${act.name}`}
                                  className="ml-0.5 rounded p-0.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                                >
                                  <UserMinus className="h-3 w-3" />
                                </button>
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {showRequestAction && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    {isEnrolledAsStudent ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 w-full justify-center">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Ya estás inscrito en esta clase</span>
                      </span>
                    ) : isRequested ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 w-full">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 flex-1 justify-center whitespace-nowrap">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>Solicitud pendiente</span>
                        </span>
                        <button
                          type="button"
                          disabled={busyActivityKey === `cancel:${act.id}`}
                          onClick={() => handleCancelRequest(act)}
                          className="inline-flex items-center justify-center gap-1 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition whitespace-nowrap disabled:opacity-50"
                        >
                          {busyActivityKey === `cancel:${act.id}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                          <span>Cancelar solicitud</span>
                        </button>
                        {teacher?.phone && (
                          <a
                            href={`https://wa.me/${teacher.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hola ${teacher.name}, he solicitado plaza en la clase "${act.name}" desde la app Triskell.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Escribir por WhatsApp al monitor"
                            className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition whitespace-nowrap"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={busyActivityKey === `req:${act.id}`}
                        onClick={() => handleRequestEnrollment(act)}
                        className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs disabled:opacity-60"
                      >
                        {busyActivityKey === `req:${act.id}` ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        <span>
                          {busyActivityKey === `req:${act.id}` ? 'Enviando solicitud...' : 'Solicitar inscripción'}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
                  ¿Seguro que quieres quitar a <strong>{pendingRemoval.studentName}</strong> del
                  taller <strong>{pendingRemoval.activityName}</strong>? Su ficha general de socio
                  no se eliminará.
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
                onClick={handleConfirmUnenroll}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-60"
              >
                {isRemoving ? 'Quitando...' : 'Sí, quitar del taller'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingActivityDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Eliminar actividad
                </h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  ¿Seguro que quieres eliminar la actividad{' '}
                  <strong>{pendingActivityDelete.name}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingActivityDelete(null)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  const idToDelete = pendingActivityDelete.id;
                  setPendingActivityDelete(null);
                  await deleteActivity(idToDelete);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

