import React, { useState, useMemo } from 'react';
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
  Edit2,
  Check,
  X,
  CreditCard,
  Banknote,
  DollarSign,
  AlertCircle,
  MessageCircle,
  Camera,
  Layers,
  ChevronDown
} from 'lucide-react';

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
  const { currentTeacherId, teachers, activities, students } = useApp();
  const currentTeacher = teachers.find(t => t.id === currentTeacherId) || teachers[0];
  const myActivities = useMemo(() => {
    return activities.filter(a => a.teacherId === currentTeacher?.id);
  }, [activities, currentTeacher?.id]);

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
          {onOpenAddStudent && (
            <button
              type="button"
              onClick={onOpenAddStudent}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[40px]"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Dar de Alta Nuevo Alumno</span>
            </button>
          )}

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
                          <div key={st.id} className="py-1.5 flex items-center justify-between gap-2 text-xs">
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
                            <span className="text-[11px] text-slate-400 shrink-0">
                              {st.phone || st.email}
                            </span>
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

  // Estado del Módulo "Control de Clase & Cobros"
  const [selectedClassActivityId, setSelectedClassActivityId] = useState<string>(myActivities[0]?.id || '');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionTopic, setSessionTopic] = useState<string>('');
  const [sessionDuration, setSessionDuration] = useState<number>(75);

  // Registro de asistencia en memoria para la sesión activa { [studentId]: 'present' | 'absent' | 'partial' }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'partial'>>({});

  // Control de cobro parcial desplegado por alumno { [studentId]: boolean }
  const [partialInputOpen, setPartialInputOpen] = useState<Record<string, boolean>>({});
  const [partialAmountMap, setPartialAmountMap] = useState<Record<string, number>>({});
  const [paymentMethodMap, setPaymentMethodMap] = useState<Record<string, PaymentMethod>>({});

  // Feedback de guardado
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
      return periodPayments.find(
        p => p.studentId === studentId && p.activityId === activeClassActivity.id && p.periodMonth === selectedPeriod
      );
    } else {
      // Por clase: busca si se cobró en esta fecha
      return periodPayments.find(
        p => p.studentId === studentId && p.activityId === activeClassActivity.id && p.paymentDate === sessionDate
      );
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
                  <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                    Seleccionar Taller / Clase *
                  </label>
                  {myActivities.length === 0 ? (
                    <p className="text-xs text-rose-500">No tienes talleres asignados todavía.</p>
                  ) : (
                    <select
                      value={activeClassActivity?.id || ''}
                      onChange={e => setSelectedClassActivityId(e.target.value)}
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
                          {isPaid ? (
                            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 min-h-[38px]">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              <div className="text-left">
                                <span>Pagado: {payment.amount.toFixed(2)} €</span>
                                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                                  {payment.paymentMethod === 'cash' ? 'En mano' : payment.paymentMethod} · {payment.paymentDate}
                                </span>
                              </div>
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
                      <div className="flex items-center gap-3 min-w-0 lg:ml-auto">
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
    </div>
  );
};
