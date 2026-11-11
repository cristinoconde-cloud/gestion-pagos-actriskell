import React, { useState } from 'react';
import { useApp, TeacherFinancialSummary } from '../context/AppContext';
import { Teacher } from '../types';
import {
  GraduationCap,
  Calendar,
  DollarSign,
  Plus,
  CheckCircle2,
  Clock,
  Landmark,
  Edit2,
  Trash2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface TeachersViewProps {
  onOpenTeacherPayout: (summary: TeacherFinancialSummary) => void;
  onOpenAddTeacher: (teacher?: Teacher) => void;
  onOpenAddSession: (teacherId?: string) => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  onOpenTeacherPayout,
  onOpenAddTeacher,
  onOpenAddSession
}) => {
  const {
    selectedPeriod,
    teacherSummaries,
    sessions,
    payouts,
    deleteClassSession,
    deleteTeacher
  } = useApp();

  const [activeTab, setActiveTab] = useState<'roster' | 'sessions' | 'payouts'>('roster');

  const periodSessions = sessions.filter(s => s.date.startsWith(selectedPeriod));
  const periodPayouts = payouts.filter(p => p.periodMonth === selectedPeriod);

  return (
    <div className="space-y-6">
      {/* Cabecera & Pestañas del módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Monitores & Liquidación de Honorarios ({selectedPeriod})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cálculo de honorarios por clase, nómina fija o porcentaje de cuotas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAddSession()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Calendar className="h-4 w-4" />
            <span>+ Anotar Clase</span>
          </button>
          <button
            onClick={() => onOpenAddTeacher()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Alta de Monitor</span>
          </button>
        </div>
      </div>

      {/* Sub-navegación interna */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('roster')}
          className={`rounded-lg px-3 py-1.5 transition ${
            activeTab === 'roster'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Resumen & Liquidaciones ({teacherSummaries.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`rounded-lg px-3 py-1.5 transition ${
            activeTab === 'sessions'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Registro de Clases Impartidas ({periodSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`rounded-lg px-3 py-1.5 transition ${
            activeTab === 'payouts'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Historial de Pagos Emitidos ({periodPayouts.length})
        </button>
      </div>

      {/* Vista 1: Roster de Profesores con Desglose Financiero */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teacherSummaries.map(ts => {
            const { teacher, calculatedDue, collectedInHand, alreadySettled, balanceToPay, classesCount, studentsCount } = ts;

            const schemeBadge = {
              per_class: `Por Clase (${teacher.ratePerClass}€ / ses.)`,
              monthly_fixed: `Fijo Mensual (${teacher.fixedMonthlyRate}€ / mes)`,
              revenue_share: `% de Cuotas (${teacher.revenueSharePercent}%)`
            }[teacher.paymentScheme];

            return (
              <div
                key={teacher.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Encabezado del profesor */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={teacher.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                        alt={teacher.name}
                        className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {teacher.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {teacher.phone} · {teacher.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenAddTeacher(teacher)}
                        title="Editar profesor"
                        className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Dar de baja a ${teacher.name}?`)) {
                            deleteTeacher(teacher.id);
                          }
                        }}
                        title="Eliminar profesor"
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Etiqueta de esquema contractual */}
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                      {schemeBadge}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {classesCount} clases dadas este mes
                    </span>
                    <span className="text-slate-400 text-[11px]">•</span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {studentsCount} alumnos en sus grupos
                    </span>
                  </div>

                  {/* Cuadro de Liquidación Detallada */}
                  <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3.5 border border-slate-200/60 dark:border-slate-800 text-xs space-y-2">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>Total devengado por clases/contrato:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {calculatedDue.toFixed(2)} €
                      </span>
                    </div>

                    {collectedInHand > 0 && (
                      <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-medium">
                        <span>− Cobrado en mano a los alumnos:</span>
                        <span>−{collectedInHand.toFixed(2)} €</span>
                      </div>
                    )}

                    {alreadySettled > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>− Transferencias ya abonadas:</span>
                        <span>−{alreadySettled.toFixed(2)} €</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 font-bold">
                      <span className="text-slate-900 dark:text-white">Saldo Pendiente de Liquidar:</span>
                      <span className="text-base text-emerald-600 dark:text-emerald-400">
                        {balanceToPay.toFixed(2)} €
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onOpenAddSession(teacher.id)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Anotar Clase</span>
                  </button>

                  <button
                    onClick={() => onOpenTeacherPayout(ts)}
                    className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs flex items-center gap-1.5"
                  >
                    <Landmark className="h-3.5 w-3.5" />
                    <span>Liquidar Honorarios</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vista 2: Registro de Clases Impartidas */}
      {activeTab === 'sessions' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Bitácora de Sesiones del Período ({selectedPeriod})
            </span>
            <button
              onClick={() => onOpenAddSession()}
              className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              + Nueva Sesión
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Fecha</th>
                  <th className="py-2.5 px-4">Profesor</th>
                  <th className="py-2.5 px-4">Asistentes</th>
                  <th className="py-2.5 px-4">Duración</th>
                  <th className="py-2.5 px-4">Temario / Resumen</th>
                  <th className="py-2.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {periodSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No hay clases registradas en este mes todavía.
                    </td>
                  </tr>
                ) : (
                  periodSessions.map(s => {
                    const teacher = teacherSummaries.find(t => t.teacher.id === s.teacherId)?.teacher;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {s.date}
                        </td>
                        <td className="py-2.5 px-4 font-medium">
                          {teacher?.name || 'Profesor'}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                            {s.attendeesCount} alumnos
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {s.durationMinutes} min
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                          {s.topic || 'Clase regular'}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => deleteClassSession(s.id)}
                            className="text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Vista 3: Historial de Liquidaciones Emitidas */}
      {activeTab === 'payouts' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Comprobantes de Liquidación a Profesores
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200/80 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">ID Liquidación</th>
                  <th className="py-2.5 px-4">Profesor</th>
                  <th className="py-2.5 px-4">Importe Abonado</th>
                  <th className="py-2.5 px-4">Fecha Pago</th>
                  <th className="py-2.5 px-4">Método</th>
                  <th className="py-2.5 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {periodPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No hay pagos transferidos a profesores en este mes todavía.
                    </td>
                  </tr>
                ) : (
                  periodPayouts.map(p => {
                    const teacher = teacherSummaries.find(t => t.teacher.id === p.teacherId)?.teacher;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                          {p.id}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {teacher?.name || 'Profesor'}
                        </td>
                        <td className="py-2.5 px-4 font-extrabold text-sm text-slate-900 dark:text-white">
                          {p.totalSettled.toFixed(2)} €
                        </td>
                        <td className="py-2.5 px-4 text-slate-500">
                          {p.settledDate}
                        </td>
                        <td className="py-2.5 px-4 capitalize">
                          {p.paymentMethod}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Transferido
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
