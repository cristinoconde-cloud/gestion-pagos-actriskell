import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Clock, DollarSign, Calendar } from 'lucide-react';

export const TeacherPayoutsView: React.FC = () => {
  const {
    currentTeacherId,
    setCurrentTeacherId,
    teachers,
    activities,
    selectedPeriod,
    teacherSummaries,
    sessions,
    payouts,
    currentRole
  } = useApp();

  const currentTeacher = teachers.find(t => t.id === currentTeacherId) || teachers[0];
  const teacherSummary = teacherSummaries.find(ts => ts.teacher.id === currentTeacher?.id);

  const teacherSessions = sessions.filter(
    s => s.teacherId === currentTeacher?.id && s.date.startsWith(selectedPeriod)
  );

  const teacherPayoutHistory = payouts.filter(
    p => p.teacherId === currentTeacher?.id
  );

  return (
    <div className="space-y-6">
      {/* Cabecera Mis Liquidaciones */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Mis liquidaciones ({selectedPeriod})
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Desglose de honorarios devengados, cobros en mano y transferencias de {currentTeacher?.name || 'Monitor'}
            </p>
          </div>
        </div>

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

      {/* Tarjetas KPI de Liquidación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Honorarios Totales Devengados
          </span>
          <div className="mt-2">
            <span className="text-2xl font-black tabular-nums text-slate-900 dark:text-white">
              {(teacherSummary?.calculatedDue ?? 0).toFixed(2)} €
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
            <span className="text-2xl font-black tabular-nums text-amber-600 dark:text-amber-400">
              {(teacherSummary?.collectedInHand ?? 0).toFixed(2)} €
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
            <span className="text-2xl font-black tabular-nums text-emerald-600 dark:text-emerald-400">
              {(teacherSummary?.alreadySettled ?? 0).toFixed(2)} €
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
            <span className="text-2xl font-black tabular-nums text-emerald-700 dark:text-emerald-400">
              {(teacherSummary?.balanceToPay ?? 0).toFixed(2)} €
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {(teacherSummary?.balanceToPay ?? 0) === 0
                ? 'Liquidación al corriente'
                : 'Por transferir este mes'}
            </p>
          </div>
        </div>
      </div>

      {/* Historial de Liquidaciones / Abonos de la Asociación */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Historial de Liquidaciones y Transferencias
        </h2>
        {teacherPayoutHistory.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No constan transferencias registradas todavía para este monitor.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {teacherPayoutHistory.map(payout => (
              <div key={payout.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Período {payout.periodMonth}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {payout.settledDate ? `Liquidado el ${payout.settledDate}` : 'En proceso'} ·{' '}
                    <span className="capitalize">{payout.paymentMethod}</span>
                    {payout.notes ? ` · ${payout.notes}` : ''}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black tabular-nums text-sm text-slate-900 dark:text-white block">
                    {payout.totalSettled.toFixed(2)} €
                  </span>
                  {payout.status === 'settled' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Liquidado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                      <Clock className="h-3.5 w-3.5" />
                      Pendiente
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial de Sesiones Registradas este mes */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-500" />
          <span>Clases Registradas en {selectedPeriod}</span>
        </h2>
        {teacherSessions.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No hay clases registradas para el período {selectedPeriod}.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {teacherSessions.map(ses => {
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
                    <span className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {ses.attendeesCount} asistentes
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
