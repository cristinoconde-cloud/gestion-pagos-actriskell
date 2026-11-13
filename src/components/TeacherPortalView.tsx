import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, PaymentMethod } from '../types';
import { ProfileView } from './ProfileView';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  Plus,
  UserPlus,
  UserCheck,
  UserMinus,
  Edit2,
  Check,
  X,
  CreditCard,
  Banknote,
  DollarSign,
  AlertCircle,
  AlertTriangle,
  MessageCircle,
  Camera,
  Layers,
  ChevronDown,
  RotateCcw,
  Trash2
} from 'lucide-react';

const normalizeTextForSchedule = (raw: string) =>
  raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const SPANISH_DAY_NAMES = [
  'domingo',
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado'
];

const SPANISH_DAY_ABBRS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];

interface MatchedActivityResult {
  activity: Activity;
  matchType: 'live' | 'upcoming_today' | 'earlier_today' | 'fallback';
}

const findActiveActivityForNow = (
  activitiesList: Activity[],
  now: Date = new Date()
): MatchedActivityResult | null => {
  if (!activitiesList.length) return null;

  const dayIdx = now.getDay();
  const fullDay = SPANISH_DAY_NAMES[dayIdx];
  const abbrDay = SPANISH_DAY_ABBRS[dayIdx];
  const abbrRegex = new RegExp(`\\b${abbrDay}\\b`, 'i');
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  let bestLive: { activity: Activity; score: number } | null = null;
  let bestUpcoming: { activity: Activity; delta: number } | null = null;
  let bestEarlier: { activity: Activity; delta: number } | null = null;

  for (const act of activitiesList) {
    if (act.active === false) continue;
    for (const slot of act.schedule || []) {
      const normalized = normalizeTextForSchedule(slot);
      const matchesDay = normalized.includes(fullDay) || abbrRegex.test(normalized);
      if (!matchesDay) continue;

      const timeMatches = Array.from(normalized.matchAll(/(\d{1,2}):(\d{2})/g));
      if (timeMatches.length === 0) {
        if (!bestUpcoming) {
          bestUpcoming = { activity: act, delta: 24 * 60 };
        }
        continue;
      }

      const startMinutes =
        parseInt(timeMatches[0][1], 10) * 60 + parseInt(timeMatches[0][2], 10);
      const endMinutes =
        timeMatches.length >= 2
          ? parseInt(timeMatches[1][1], 10) * 60 + parseInt(timeMatches[1][2], 10)
          : startMinutes + 90;

      // En curso ahora (con margen de 15 min antes y 15 min después)
      if (nowMinutes >= startMinutes - 15 && nowMinutes <= endMinutes + 15) {
        const distanceFromStart = Math.abs(nowMinutes - startMinutes);
        if (!bestLive || distanceFromStart < bestLive.score) {
          bestLive = { activity: act, score: distanceFromStart };
        }
      } else if (startMinutes > nowMinutes) {
        const delta = startMinutes - nowMinutes;
        if (!bestUpcoming || delta < bestUpcoming.delta) {
          bestUpcoming = { activity: act, delta };
        }
      } else {
        const delta = nowMinutes - endMinutes;
        if (!bestEarlier || delta < bestEarlier.delta) {
          bestEarlier = { activity: act, delta };
        }
      }
    }
  }

  if (bestLive) return { activity: bestLive.activity, matchType: 'live' };
  if (bestUpcoming) return { activity: bestUpcoming.activity, matchType: 'upcoming_today' };
  if (bestEarlier) return { activity: bestEarlier.activity, matchType: 'earlier_today' };
  return { activity: activitiesList[0], matchType: 'fallback' };
};

interface TeacherPortalViewProps {
  onOpenAddSession: (teacherId?: string) => void;
  onOpenRecordPayment: () => void;
  onOpenAddActivity?: (activity?: Activity) => void;
  onOpenAddStudent?: () => void;
  onOpenEnrollStudent?: (activityId?: string) => void;
  onNavigateToProfile?: () => void;
}

interface TeacherWorkshopsSectionProps {
  onOpenAddActivity?: (activity?: Activity) => void;
  onOpenAddStudent?: () => void;
  onOpenEnrollStudent?: (activityId?: string) => void;
}

export const TeacherWorkshopsSection: React.FC<TeacherWorkshopsSectionProps> = ({
  onOpenAddActivity,
  onOpenAddStudent,
  onOpenEnrollStudent
}) => {
  const { currentTeacherId, teachers, activities, students, unenrollStudentFromActivity } = useApp();
  const currentTeacher = teachers.find(t => t.id === currentTeacherId) || teachers[0];
  const myActivities = useMemo(() => {
    return activities.filter(a => a.teacherId === currentTeacher?.id);
  }, [activities, currentTeacher?.id]);

  const [pendingRemoval, setPendingRemoval] = useState<{
    studentId: string;
    studentName: string;
    activityId: string;
    activityName: string;
  } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [workshopFeedback, setWorkshopFeedback] = useState<string | null>(null);

  const handleConfirmRemove = async () => {
    if (!pendingRemoval) return;
    setIsRemoving(true);
    try {
      const res = await unenrollStudentFromActivity(
        pendingRemoval.studentId,
        pendingRemoval.activityId
      );
      if (res.success) {
        setWorkshopFeedback(
          `Se quitó a ${pendingRemoval.studentName} de "${pendingRemoval.activityName}".`
        );
        setTimeout(() => setWorkshopFeedback(null), 3500);
      }
      setPendingRemoval(null);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Barra de Acciones del Monitor (Crear taller, Inscribir, Nuevo alumno) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tus Talleres Formativos ({myActivities.length})
          </h3>
          <p className="text-xs text-slate-500">
            Solo tú puedes gestionar tus talleres y los alumnos que asisten a ellos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {onOpenEnrollStudent && (
            <button
              type="button"
              onClick={() => onOpenEnrollStudent()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50/60 dark:bg-emerald-950/20 px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition min-h-[40px]"
            >
              <UserCheck className="h-4 w-4" />
              <span>+ Inscribir Alumno a Taller</span>
            </button>
          )}

          {onOpenAddActivity && (
            <button
              type="button"
              onClick={() => onOpenAddActivity()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition min-h-[40px]"
            >
              <Plus className="h-4 w-4" />
              <span>+ Crear Nuevo Taller</span>
            </button>
          )}
        </div>
      </div>

      {workshopFeedback && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{workshopFeedback}</span>
        </div>
      )}

      {/* Listado de Talleres */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {myActivities.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-xs text-slate-400">
            No tienes talleres registrados aún. Pulsa en "+ Crear Nuevo Taller".
          </div>
        ) : (
          myActivities.map(act => {
            const actStudents = students.filter(s =>
              s.activities.some(enroll => enroll.activityId === act.id)
            );
            return (
              <div
                key={act.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                        {act.category}
                      </span>
                      <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                        {act.billingMode === 'per_class' ? 'Pago por clase' : 'Cuota mensual'}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {act.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {act.description}
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 shrink-0">
                    <div className="text-right">
                      <span className="text-lg font-black tabular-nums text-slate-900 dark:text-white block">
                        {act.billingMode === 'per_class' ? `${act.defaultPricePerClass} €/c` : `${act.defaultPriceMonthly} €/m`}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {actStudents.length} inscritos
                      </span>
                    </div>
                    {onOpenAddActivity && (
                      <button
                        type="button"
                        onClick={() => onOpenAddActivity(act)}
                        title="Editar actividad / taller"
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Editar</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Sala: <strong>{act.room}</strong></span>
                  <span>Horario: {act.schedule.join(' · ')}</span>
                </div>

                {act.bizum_enabled && (
                  <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 p-2 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 border border-emerald-500/20">
                    <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Bizum: <strong>{act.bizum_phone}</strong> (Concepto: {act.bizum_concept})</span>
                  </div>
                )}

                {/* Alumnos del taller */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-400 block">
                      Alumnos en este taller ({actStudents.length})
                    </span>
                    {onOpenEnrollStudent && (
                      <button
                        type="button"
                        onClick={() => onOpenEnrollStudent(act.id)}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        + Inscribir aquí
                      </button>
                    )}
                  </div>
                  {actStudents.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No hay alumnos asignados a este taller.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {actStudents.map(st => {
                        const isPending =
                          st.status === 'pending_validation' || st.validationStatus === 'pending';
                        return (
                          <div key={st.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {st.name}
                              </span>
                              {isPending && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300 shrink-0">
                                  <Clock className="h-3 w-3" />
                                  Pendiente validación
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] text-slate-400 hidden sm:inline">
                                {st.phone || st.email}
                              </span>
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
                                title={`Quitar a ${st.name} del taller`}
                                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 px-2 py-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition whitespace-nowrap"
                              >
                                <UserMinus className="h-3 w-3" />
                                <span>Quitar</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

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
                onClick={handleConfirmRemove}
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

export const TeacherPortalView: React.FC<TeacherPortalViewProps> = ({
  onOpenAddSession,
  onOpenRecordPayment,
  onOpenAddActivity,
  onOpenAddStudent,
  onOpenEnrollStudent,
  onNavigateToProfile
}) => {
  const {
    currentTeacherId,
    setCurrentTeacherId,
    teachers,
    activities,
    students,
    selectedPeriod,
    teacherSummaries,
    sessions,
    periodPayments,
    recordClassPayment,
    deletePayment,
    unenrollStudentFromActivity,
    addClassSession,
    currentRole
  } = useApp();

  const currentTeacher = teachers.find(t => t.id === currentTeacherId) || teachers[0];
  const teacherSummary = teacherSummaries.find(ts => ts.teacher.id === currentTeacher?.id);

  // Filtro estricto: Solo actividades y talleres de ESTE monitor
  const myActivities = useMemo(() => {
    return activities.filter(a => a.teacherId === currentTeacher?.id);
  }, [activities, currentTeacher?.id]);

  // Alumnos inscritos exclusivamente en las actividades de este monitor
  const myActivityIds = useMemo(() => myActivities.map(a => a.id), [myActivities]);
  const myStudents = useMemo(() => {
    return students.filter(st =>
      st.activities.some(a => myActivityIds.includes(a.activityId))
    );
  }, [students, myActivityIds]);

  // Pestañas internas del Portal del Monitor
  const [activeTab, setActiveTab] = useState<'class_control' | 'workshops' | 'payout' | 'profile'>('class_control');

  // Auto-detección de clase activa según día y hora actual
  const autoDetectedMatch = useMemo(
    () => findActiveActivityForNow(myActivities),
    [myActivities]
  );

  // Estado del Módulo "Control de Clase & Cobros"
  const [selectedClassActivityId, setSelectedClassActivityId] = useState<string>(
    () => autoDetectedMatch?.activity.id || myActivities[0]?.id || ''
  );
  const manualClassChoiceRef = useRef(false);
  const lastTeacherForAutoSelectRef = useRef<string | undefined>(currentTeacher?.id);

  useEffect(() => {
    if (lastTeacherForAutoSelectRef.current !== currentTeacher?.id) {
      lastTeacherForAutoSelectRef.current = currentTeacher?.id;
      manualClassChoiceRef.current = false;
    }

    if (myActivities.length === 0) {
      setSelectedClassActivityId('');
      return;
    }

    const existsInMyActivities = myActivities.some(a => a.id === selectedClassActivityId);
    if (!manualClassChoiceRef.current || !existsInMyActivities) {
      const targetId = autoDetectedMatch?.activity.id || myActivities[0]?.id || '';
      if (targetId && targetId !== selectedClassActivityId) {
        setSelectedClassActivityId(targetId);
      }
    }
  }, [myActivities, currentTeacher?.id, autoDetectedMatch, selectedClassActivityId]);

  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionTopic, setSessionTopic] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<number>(75);

  // Registro de asistencia en memoria para la sesión activa { [studentId]: 'present' | 'absent' | 'partial' }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'partial'>>({});

  // Control de cobro parcial desplegado por alumno { [studentId]: boolean }
  const [partialInputOpen, setPartialInputOpen] = useState<Record<string, boolean>>({});
  const [partialAmountMap, setPartialAmountMap] = useState<Record<string, number>>({});
  const [paymentMethodMap, setPaymentMethodMap] = useState<Record<string, PaymentMethod>>({});

  // Modal de confirmación para anular/desmarcar pago o quitar alumno de un taller
  const [confirmDialog, setConfirmDialog] = useState<
    | {
        type: 'delete_payment';
        paymentId: string;
        studentName: string;
        amount: number;
      }
    | {
        type: 'remove_student';
        studentId: string;
        studentName: string;
        activityId: string;
        activityName: string;
      }
    | null
  >(null);
  const [isConfirmBusy, setIsConfirmBusy] = useState(false);

  // Feedback de guardado / acciones
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Actividad seleccionada en la sesión activa
  const activeClassActivity = myActivities.find(a => a.id === selectedClassActivityId) || myActivities[0];

  // Alumnos matriculados en la actividad de la sesión activa
  const enrolledStudentsInClass = useMemo(() => {
    if (!activeClassActivity) return [];
    return students.filter(s =>
      s.activities.some(act => act.activityId === activeClassActivity.id)
    );
  }, [students, activeClassActivity]);

  // Handlers de Asistencia
  const setStudentAttendance = (studentId: string, status: 'present' | 'absent' | 'partial') => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const updated: Record<string, 'present' | 'absent' | 'partial'> = {};
    enrolledStudentsInClass.forEach(s => {
      updated[s.id] = 'present';
    });
    setAttendanceMap(updated);
  };

  // Helper para saber si un alumno ya pagó este mes o esta clase
  const getStudentPaymentStatus = (studentId: string) => {
    if (!activeClassActivity) return null;
    const isMonthly = activeClassActivity.billingMode === 'monthly';

    if (isMonthly) {
      return (
        periodPayments.find(
          p =>
            p.studentId === studentId &&
            p.activityId === activeClassActivity.id &&
            p.periodMonth === selectedPeriod &&
            p.status === 'paid'
        ) ||
        periodPayments.find(
          p =>
            p.studentId === studentId &&
            p.activityId === activeClassActivity.id &&
            p.periodMonth === selectedPeriod
        )
      );
    } else {
      // Por clase: busca si se cobró en esta fecha
      return (
        periodPayments.find(
          p =>
            p.studentId === studentId &&
            p.activityId === activeClassActivity.id &&
            p.paymentDate === sessionDate &&
            p.status === 'paid'
        ) ||
        periodPayments.find(
          p =>
            p.studentId === studentId &&
            p.activityId === activeClassActivity.id &&
            p.paymentDate === sessionDate
        )
      );
    }
  };

  const handleConfirmDialogAction = async () => {
    if (!confirmDialog) return;
    setIsConfirmBusy(true);
    try {
      if (confirmDialog.type === 'delete_payment') {
        await deletePayment(confirmDialog.paymentId);
        setSaveSuccessMsg(
          `Pago de ${confirmDialog.studentName} (${confirmDialog.amount.toFixed(2)} €) desmarcado y eliminado.`
        );
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      } else if (confirmDialog.type === 'remove_student') {
        const res = await unenrollStudentFromActivity(
          confirmDialog.studentId,
          confirmDialog.activityId
        );
        if (res.success) {
          setSaveSuccessMsg(
            `${confirmDialog.studentName} ha sido dado de baja del taller "${confirmDialog.activityName}".`
          );
          setTimeout(() => setSaveSuccessMsg(null), 4000);
        }
      }
      setConfirmDialog(null);
    } finally {
      setIsConfirmBusy(false);
    }
  };

  // Handler de Cobro Rápido (completo o parcial)
  const handleCollectPayment = (studentId: string, fullAmount: number, isPartial: boolean = false) => {
    if (!activeClassActivity) return;
    const chosenAmount = isPartial ? (partialAmountMap[studentId] || fullAmount) : fullAmount;
    const chosenMethod = paymentMethodMap[studentId] || (activeClassActivity.bizum_enabled ? 'bizum' : 'cash');

    recordClassPayment({
      studentId,
      activityId: activeClassActivity.id,
      amount: chosenAmount,
      isPartial,
      paymentMethod: chosenMethod,
      date: sessionDate,
      notes: isPartial
        ? `Cobro parcial (${chosenAmount}€ de ${fullAmount}€) en clase de ${activeClassActivity.name}`
        : `Cobro en clase de ${activeClassActivity.name}`
    });

    // Cerrar input parcial si estaba abierto
    setPartialInputOpen(prev => ({ ...prev, [studentId]: false }));

    // Si no tenía asistencia marcada, marcar como presente
    if (!attendanceMap[studentId]) {
      setStudentAttendance(studentId, 'present');
    }
  };

  // Cobro a todos los presentes que tengan pago pendiente
  const handleCollectAllPresent = () => {
    if (!activeClassActivity) return;
    enrolledStudentsInClass.forEach(student => {
      const isPresent = attendanceMap[student.id] === 'present' || attendanceMap[student.id] === 'partial';
      if (isPresent) {
        const payment = getStudentPaymentStatus(student.id);
        if (!payment || payment.status !== 'paid') {
          const enroll = student.activities.find(a => a.activityId === activeClassActivity.id);
          const fee = enroll?.customPrice ?? (
            activeClassActivity.billingMode === 'per_class'
              ? activeClassActivity.defaultPricePerClass
              : activeClassActivity.defaultPriceMonthly
          );
          handleCollectPayment(student.id, fee, false);
        }
      }
    });
  };

  // Guardar Sesión de Clase Completa
  const handleSaveClassSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClassActivity) return;

    const attendees = enrolledStudentsInClass.filter(
      s => attendanceMap[s.id] === 'present' || attendanceMap[s.id] === 'partial'
    ).length;

    const attendanceRecords = enrolledStudentsInClass.map(s => {
      const pay = getStudentPaymentStatus(s.id);
      return {
        studentId: s.id,
        studentName: s.name,
        attendance: attendanceMap[s.id] || 'present',
        paid: pay?.status === 'paid',
        paidAmount: pay?.amount,
        paymentMethod: pay?.paymentMethod,
        paymentId: pay?.id
      };
    });

    addClassSession({
      activityId: activeClassActivity.id,
      teacherId: currentTeacher.id,
      date: sessionDate,
      attendeesCount: attendees,
      durationMinutes: sessionDuration,
      topic: sessionTopic.trim() || `Clase de ${activeClassActivity.name}`,
      attendanceRecords
    });

    setSaveSuccessMsg(`¡Clase del ${sessionDate} guardada con éxito (${attendees} asistentes registrados)!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal del Monitor */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/30 via-slate-900/50 to-indigo-900/20 p-5 shadow-xs backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <img
                src={currentTeacher?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
                alt={currentTeacher?.name}
                className="h-14 w-14 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md group-hover:border-indigo-400 transition"
              />
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToProfile) {
                    onNavigateToProfile();
                  } else {
                    setActiveTab('profile');
                  }
                }}
                title="Cambiar foto de perfil"
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs hover:bg-indigo-700 transition"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Portal del Monitor
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  {currentTeacher?.collectionType === 'personal'
                    ? 'Cobro Personal (Directo)'
                    : 'Cobro Asociación'}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Hola, {currentTeacher?.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {myActivities.length} talleres asignados · {myStudents.length} alumnos inscritos
              </p>
            </div>
          </div>

          {/* Selector de Monitor (solo Administrador para testing de perspectiva) */}
          {currentRole === 'admin' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Monitor:</span>
              <select
                value={currentTeacherId}
                onChange={e => setCurrentTeacherId(e.target.value)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-indigo-500"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Pestañas de Navegación Interna del Portal (ocultas en rol Monitor puro porque usa barra principal de 5 pestañas) */}
      {currentRole !== 'teacher' && (
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('class_control')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition min-h-[44px] shrink-0 ${
              activeTab === 'class_control'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Control de Clase & Cobros</span>
            <span className="rounded-full bg-emerald-400 text-slate-950 px-1.5 py-0.2 text-[9px] font-black uppercase">
              En vivo
            </span>
          </button>

          <button
            onClick={() => setActiveTab('workshops')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition min-h-[44px] shrink-0 ${
              activeTab === 'workshops'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Mis Talleres & Alumnos ({myActivities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payout')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition min-h-[44px] shrink-0 ${
              activeTab === 'payout'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Mi Liquidación ({selectedPeriod})</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateToProfile) {
                onNavigateToProfile();
              } else {
                setActiveTab('profile');
              }
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition min-h-[44px] shrink-0 ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Mi Perfil & Foto</span>
          </button>
        </div>
      )}

      {/* =========================================================================
          PESTAÑA 1: CONTROL DE ASISTENCIA Y COBROS EN CLASE (HERRAMIENTA CLAVE)
          ========================================================================= */}
      {(currentRole === 'teacher' || activeTab === 'class_control') && (
        <div className="space-y-5">
          {/* Barra de Selección de Clase */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Selector de Taller (solo los suyos) */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                      Seleccionar Taller / Clase *
                    </label>
                    {autoDetectedMatch &&
                      autoDetectedMatch.matchType !== 'fallback' &&
                      activeClassActivity?.id === autoDetectedMatch.activity.id && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                          <Clock className="h-3 w-3" />
                          {autoDetectedMatch.matchType === 'live'
                            ? 'En horario actual'
                            : autoDetectedMatch.matchType === 'upcoming_today'
                            ? 'Próxima clase hoy'
                            : 'Clase de hoy'}
                        </span>
                      )}
                  </div>
                  {myActivities.length === 0 ? (
                    <p className="text-xs text-rose-500">No tienes talleres asignados todavía.</p>
                  ) : (
                    <select
                      value={activeClassActivity?.id || ''}
                      onChange={e => {
                        manualClassChoiceRef.current = true;
                        setSelectedClassActivityId(e.target.value);
                      }}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-indigo-500 min-h-[40px]"
                    >
                      {myActivities.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.billingMode === 'per_class' ? `${a.defaultPricePerClass}€ / clase` : `${a.defaultPriceMonthly}€ / mes`})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Fecha de la Sesión */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Fecha de la Clase
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={e => setSessionDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-indigo-500 min-h-[40px]"
                  />
                </div>
              </div>

              {/* Botón rápido para inscribir más alumnos */}
              {onOpenEnrollStudent && (
                <button
                  type="button"
                  onClick={() => onOpenEnrollStudent(activeClassActivity?.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition shrink-0 min-h-[40px] w-full sm:w-auto"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>+ Inscribir Alumno a esta Clase</span>
                </button>
              )}
            </div>

            {/* Ficha informativa del Taller seleccionado */}
            {activeClassActivity && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    {activeClassActivity.billingMode === 'per_class' ? '🎟️ Modalidad: Pago por Clase' : '📅 Modalidad: Pago Mensual'}
                  </span>
                  <span className="font-semibold">
                    Tarifa base: <strong>{activeClassActivity.billingMode === 'per_class' ? `${activeClassActivity.defaultPricePerClass} €/clase` : `${activeClassActivity.defaultPriceMonthly} €/mes`}</strong>
                  </span>
                  <span>·</span>
                  <span>Sala: {activeClassActivity.room}</span>
                </div>

                {activeClassActivity.bizum_enabled && activeClassActivity.bizum_phone && (
                  <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    <Smartphone className="h-3.5 w-3.5" />
                    <span>Bizum disponible: {activeClassActivity.bizum_phone} ({activeClassActivity.bizum_concept || activeClassActivity.name})</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Acciones Colectivas y Contadores Rápidos */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-100/70 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Users className="h-4 w-4 text-indigo-500 shrink-0" />
              <span>{enrolledStudentsInClass.length} alumnos inscritos en este taller</span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={markAllPresent}
                className="w-full sm:w-auto rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition min-h-[38px] active:scale-95 text-center"
              >
                ✓ Marcar Todos Presentes
              </button>

              <button
                type="button"
                onClick={handleCollectAllPresent}
                className="w-full sm:w-auto rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs min-h-[38px] active:scale-95 text-center"
              >
                💰 Cobrar Cuota a Todos los Presentes
              </button>
            </div>
          </div>

          {/* Mensaje de Confirmación tras Guardar */}
          {saveSuccessMsg && (
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 p-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Lista de Alumnos para Asistencia & Cobro */}
          <div className="space-y-3">
            {enrolledStudentsInClass.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-xs text-slate-400">
                <Users className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="font-bold text-slate-600 dark:text-slate-300">Aún no hay alumnos inscritos en este taller.</p>
                <p className="mt-1">Inscribe a los primeros alumnos utilizando el botón "+ Inscribir Alumno a esta Clase".</p>
              </div>
            ) : (
              enrolledStudentsInClass.map(student => {
                const enrollment = student.activities.find(a => a.activityId === activeClassActivity.id);
                const standardFee = activeClassActivity.billingMode === 'per_class'
                  ? activeClassActivity.defaultPricePerClass
                  : activeClassActivity.defaultPriceMonthly;
                const studentFee = enrollment?.customPrice ?? standardFee;

                const payment = getStudentPaymentStatus(student.id);
                const isPaid = payment?.status === 'paid';
                const currentAttendance = attendanceMap[student.id] || 'present';

                const isPartialOpen = partialInputOpen[student.id] || false;
                const partialAmt = partialAmountMap[student.id] ?? Math.round(studentFee / 2);
                const selectedMethod = paymentMethodMap[student.id] || (activeClassActivity.bizum_enabled ? 'bizum' : 'cash');

                return (
                  <div
                    key={student.id}
                    className={`rounded-2xl border p-4 shadow-xs transition-colors ${
                      currentAttendance === 'absent'
                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 opacity-75'
                        : isPaid
                        ? 'border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                      {/* BOTONES DE ASISTENCIA Y PAGO A LA IZQUIERDA DE LOS ALUMNOS */}
                      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {/* Control 1: Selector de Asistencia */}
                        <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
                          <button
                            type="button"
                            onClick={() => setStudentAttendance(student.id, 'present')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition min-h-[38px] active:scale-95 ${
                              currentAttendance === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Presente
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentAttendance(student.id, 'partial')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition min-h-[38px] active:scale-95 ${
                              currentAttendance === 'partial'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Parcial
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentAttendance(student.id, 'absent')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition min-h-[38px] active:scale-95 ${
                              currentAttendance === 'absent'
                                ? 'bg-rose-500 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            Ausente
                          </button>
                        </div>

                        {/* Control 2: Estado de Cobro y Botones de Pago */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isPaid && payment ? (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 min-h-[38px]">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                <div className="text-left">
                                  <span>Pagado: {payment.amount.toFixed(2)} €</span>
                                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                                    {payment.paymentMethod === 'cash' ? 'En mano' : payment.paymentMethod} · {payment.paymentDate}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmDialog({
                                    type: 'delete_payment',
                                    paymentId: payment.id,
                                    studentName: student.name,
                                    amount: payment.amount
                                  })
                                }
                                title="Desmarcar / eliminar pago registrado"
                                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/20 px-2.5 py-2 text-[11px] font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition min-h-[38px] active:scale-95 touch-manipulation whitespace-nowrap"
                              >
                                <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                                <span>Desmarcar</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Botón Cobro Completo de 1 toque */}
                              <button
                                type="button"
                                onClick={() => handleCollectPayment(student.id, studentFee, false)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs min-h-[38px] active:scale-95 touch-manipulation"
                              >
                                <Banknote className="h-4 w-4 shrink-0" />
                                <span>Cobrar {studentFee} €</span>
                              </button>

                              {/* Botón Cobro Parcial */}
                              <button
                                type="button"
                                onClick={() =>
                                  setPartialInputOpen(prev => ({
                                    ...prev,
                                    [student.id]: !prev[student.id]
                                  }))
                                }
                                className="rounded-xl border border-slate-300 dark:border-slate-700 px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[38px] active:scale-95 touch-manipulation"
                              >
                                <span>Parcial...</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* INFORMACIÓN DEL ALUMNO A LA DERECHA DE LOS BOTONES */}
                      <div className="flex items-center justify-between gap-3 min-w-0 lg:ml-auto">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                {student.name}
                              </h4>
                              {enrollment?.customPrice !== undefined && (
                                <span className="rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-1.5 py-0.5 border border-amber-500/20 whitespace-nowrap">
                                  Tarifa especial: {studentFee}€
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              <span className="text-[11px] truncate">{student.phone}</span>
                              {student.phone && (
                                <a
                                  href={`https://wa.me/${student.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline shrink-0"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {activeClassActivity && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDialog({
                                type: 'remove_student',
                                studentId: student.id,
                                studentName: student.name,
                                activityId: activeClassActivity.id,
                                activityName: activeClassActivity.name
                              })
                            }
                            title={`Quitar a ${student.name} de este taller`}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:border-rose-300 hover:text-rose-600 dark:hover:text-rose-400 transition shrink-0 whitespace-nowrap"
                          >
                            <UserMinus className="h-3.5 w-3.5" />
                            <span>Quitar</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Desplegable para Cobro Parcial / Método */}
                    {!isPaid && isPartialOpen && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Importe entregado:
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.5"
                              min="1"
                              max={studentFee}
                              value={partialAmt}
                              onChange={e =>
                                setPartialAmountMap(prev => ({
                                  ...prev,
                                  [student.id]: Number(e.target.value)
                                }))
                              }
                              className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs font-black text-right pr-6 min-h-[36px]"
                            />
                            <span className="absolute right-2 top-2 text-xs font-bold text-slate-400">€</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Vía:
                          </label>
                          <select
                            value={selectedMethod}
                            onChange={e =>
                              setPaymentMethodMap(prev => ({
                                ...prev,
                                [student.id]: e.target.value as PaymentMethod
                              }))
                            }
                            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-semibold min-h-[36px]"
                          >
                            <option value="cash">Efectivo en mano</option>
                            <option value="bizum">Bizum</option>
                            <option value="transfer">Transferencia</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCollectPayment(student.id, studentFee, true)}
                          className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition min-h-[36px] active:scale-95 touch-manipulation"
                        >
                          Confirmar Cobro Parcial ({partialAmt}€)
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Formulario para Guardar Sesión de Clase Impartida */}
          {enrolledStudentsInClass.length > 0 && (
            <form
              onSubmit={handleSaveClassSession}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Guardar Registro de la Sesión Impartida
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Tema o Resumen de la Clase
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Respiración profunda y secuencias de equilibrio"
                    value={sessionTopic}
                    onChange={e => setSessionTopic(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="15"
                    value={sessionDuration}
                    onChange={e => setSessionDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-right"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition min-h-[44px]"
                >
                  <Check className="h-4 w-4" />
                  <span>Guardar Sesión de Clase Impartida</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* =========================================================================
          PESTAÑA 2: MIS TALLERES & GESTIÓN DE ALUMNOS (PERMISOS COMPLETOS)
          ========================================================================= */}
      {currentRole !== 'teacher' && activeTab === 'workshops' && (
        <TeacherWorkshopsSection
          onOpenAddActivity={onOpenAddActivity}
          onOpenAddStudent={onOpenAddStudent}
          onOpenEnrollStudent={onOpenEnrollStudent}
        />
      )}

      {/* =========================================================================
          PESTAÑA 3: LIQUIDACIÓN Y FINANZAS DEL MONITOR
          ========================================================================= */}
      {activeTab === 'payout' && (
        <div className="space-y-5">
          {/* Tarjetas KPI de Liquidación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Honorarios Totales Devengados
              </span>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {teacherSummary?.calculatedDue.toFixed(2)} €
                </span>
                <p className="text-xs text-indigo-500 font-medium mt-0.5">
                  {currentTeacher?.paymentScheme === 'per_class' && `${currentTeacher.ratePerClass}€ por sesión impartida`}
                  {currentTeacher?.paymentScheme === 'monthly_fixed' && `Sueldo fijo: ${currentTeacher.fixedMonthlyRate}€`}
                  {currentTeacher?.paymentScheme === 'revenue_share' && `${currentTeacher.revenueSharePercent}% sobre cuotas`}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Ya Cobrado en Mano
              </span>
              <div className="mt-2">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {teacherSummary?.collectedInHand.toFixed(2)} €
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cobros directos en clase (efectivo/Bizum)
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Transferido por Asociación
              </span>
              <div className="mt-2">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {teacherSummary?.alreadySettled.toFixed(2)} €
                </span>
                <p className="text-xs text-emerald-500 mt-0.5">
                  Transferencias bancarias recibidas
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">
                Saldo Pendiente a Transferir
              </span>
              <div className="mt-2">
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                  {teacherSummary?.balanceToPay.toFixed(2)} €
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {teacherSummary?.balanceToPay === 0 ? 'Liquidación al corriente' : 'Por transferir este mes'}
                </p>
              </div>
            </div>
          </div>

          {/* Historial de Sesiones Registradas este mes */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Clases Registradas en {selectedPeriod}
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {sessions
                .filter(s => s.teacherId === currentTeacher?.id && s.date.startsWith(selectedPeriod))
                .map(ses => {
                  const act = activities.find(a => a.id === ses.activityId);
                  return (
                    <div key={ses.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {act?.name || 'Clase'} · {ses.date}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {ses.topic || 'Sin temario'} · {ses.durationMinutes} min
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {ses.attendeesCount} asistentes
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PESTAÑA 4: PERFIL UNIVERSAL (Datos Personales y Preferencias Personales y Seguridad)
          ========================================================================= */}
      {activeTab === 'profile' && <ProfileView />}

      {/* Modal de Confirmación para desmarcar pago o quitar alumno de un taller */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shrink-0">
                {confirmDialog.type === 'delete_payment' ? (
                  <Trash2 className="h-5 w-5" />
                ) : (
                  <UserMinus className="h-5 w-5" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {confirmDialog.type === 'delete_payment'
                    ? 'Desmarcar y eliminar pago'
                    : 'Quitar alumno del taller'}
                </h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {confirmDialog.type === 'delete_payment' ? (
                    <>
                      ¿Seguro que quieres desmarcar el pago de{' '}
                      <strong>{confirmDialog.studentName}</strong> por importe de{' '}
                      <strong>{confirmDialog.amount.toFixed(2)} €</strong>? El registro del pago se
                      eliminará y volverá a aparecer como pendiente de cobro.
                    </>
                  ) : (
                    <>
                      ¿Seguro que quieres quitar a <strong>{confirmDialog.studentName}</strong> del
                      taller <strong>{confirmDialog.activityName}</strong>? Su ficha general de
                      socio no se eliminará.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                disabled={isConfirmBusy}
                onClick={() => setConfirmDialog(null)}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isConfirmBusy}
                onClick={handleConfirmDialogAction}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-60"
              >
                {isConfirmBusy
                  ? 'Procesando...'
                  : confirmDialog.type === 'delete_payment'
                  ? 'Sí, desmarcar pago'
                  : 'Sí, quitar del taller'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
