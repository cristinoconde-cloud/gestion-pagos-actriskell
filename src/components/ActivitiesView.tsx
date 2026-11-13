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
  MessageCircle
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
    currentRole,
    currentTeacherId,
    currentStudentId,
    currentUser
  } = useApp();

  const currentTeacher = teachers.find(t => t.id === currentTeacherId);
  const currentStudent = students.find(s => s.id === currentStudentId);

  const isAdmin = currentRole === 'admin';
  const isTeacher = currentRole === 'teacher';
  const isStudent = currentRole === 'student';
  const isUnion = currentRole === 'teacher_student';

  // Filtro interno para monitor-alumno (unión de asignadas + disponibles para solicitar)
  const [unionFilter, setUnionFilter] = useState<'all' | 'assigned' | 'request'>('all');

  // Solicitudes enviadas persistidas por usuario/alumno en localStorage
  const storageKey = `triskell_activity_requests_${currentUser?.id || currentStudentId || 'guest'}`;
  const [requestedIds, setRequestedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setRequestedIds(raw ? JSON.parse(raw) : []);
    } catch {
      setRequestedIds([]);
    }
  }, [storageKey]);

  const handleRequestEnrollment = (act: Activity) => {
    const next = Array.from(new Set([...requestedIds, act.id]));
    setRequestedIds(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Ignorar si almacenamiento está bloqueado
    }
    setFeedbackMsg(
      `Solicitud enviada para "${act.name}". El coordinador o monitor confirmará tu plaza.`
    );
    setTimeout(() => setFeedbackMsg(null), 5000);
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
        onOpenAddActivity={() => onOpenAddActivity()}
        onOpenAddStudent={onOpenAddStudent}
        onOpenEnrollStudent={onOpenEnrollStudent}
      />
    );
  }

  const headerSubtitle = useMemo(() => {
    if (isAdmin) return 'Horarios, salas, precios, recaudación y asignación de monitores';
    if (isTeacher) return 'Clases y talleres asignados a tu monitoría';
    if (isStudent) return 'Consulta las clases disponibles y solicita inscripción';
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

      {/* Confirmación de solicitud enviada */}
      {feedbackMsg && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/30 p-3.5 text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
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
            const isEnrolledAsStudent = currentStudent?.activities.some(
              a => a.activityId === act.id
            );
            const isRequested = requestedIds.includes(act.id);

            const enrolledStudents = students.filter(s =>
              s.activities.some(a => a.activityId === act.id)
            );

            // Recaudación mensual visible solo para administración (o asignadas del monitor si aplica)
            const activityRevenue = periodPayments
              .filter(p => p.activityId === act.id && p.status === 'paid')
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
                            onClick={() => {
                              if (window.confirm(`¿Eliminar la actividad ${act.name}?`)) {
                                deleteActivity(act.id);
                              }
                            }}
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
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
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
                            </span>
                          );
                        })
                      )}
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
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 flex-1 justify-center">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Solicitud enviada</span>
                        </span>
                        {teacher?.phone && (
                          <a
                            href={`https://wa.me/${teacher.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hola ${teacher.name}, he solicitado plaza en la clase "${act.name}" desde la app Triskell.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
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
                        onClick={() => handleRequestEnrollment(act)}
                        className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Solicitar inscripción</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
