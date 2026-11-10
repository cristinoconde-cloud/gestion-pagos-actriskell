import React from 'react';
import { useApp } from '../context/AppContext';
import { Activity } from '../types';
import { Plus, Users, Clock, MapPin, Edit2, Trash2, Calendar, Sparkles } from 'lucide-react';

interface ActivitiesViewProps {
  onOpenAddActivity: (activity?: Activity) => void;
  onOpenAddStudent: () => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  onOpenAddActivity,
  onOpenAddStudent
}) => {
  const { activities, teachers, students, periodPayments, deleteActivity } = useApp();

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Talleres & Actividades Formativas ({activities.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Horarios, salas, precios y asignación de monitores
          </p>
        </div>

        <button
          onClick={() => onOpenAddActivity()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Actividad</span>
        </button>
      </div>

      {/* Grid de Actividades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {activities.map(act => {
          const teacher = teachers.find(t => t.id === act.teacherId);
          const enrolledStudents = students.filter(s =>
            s.activities.some(a => a.activityId === act.id)
          );

          // Recaudación mensual de esta actividad
          const activityRevenue = periodPayments
            .filter(p => p.activityId === act.id && p.status === 'paid')
            .reduce((acc, p) => acc + p.amount, 0);

          return (
            <div
              key={act.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Cabecera Actividad */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      {act.category}
                    </span>
                    <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                      {act.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenAddActivity(act)}
                      title="Editar actividad"
                      className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
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
                  </div>
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

                {/* Precios y Alumnos Inscritos */}
                <div className="mt-4 border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">Tarifas:</span>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {act.defaultPriceMonthly}€ / mes · {act.defaultPricePerClass}€ / clase
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 text-[11px]">Recaudado este mes:</span>
                    <div className="font-black text-emerald-600 dark:text-emerald-400">
                      {activityRevenue.toFixed(2)} €
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Alumnos */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{enrolledStudents.length} Alumnos inscritos</span>
                  </span>
                  <button
                    onClick={onOpenAddStudent}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    + Inscribir
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {enrolledStudents.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No hay alumnos todavía.</span>
                  ) : (
                    enrolledStudents.map(st => (
                      <span
                        key={st.id}
                        className="rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        {st.name}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
