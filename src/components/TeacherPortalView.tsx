import React from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Calendar,
  DollarSign,
  Users,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface TeacherPortalViewProps {
  onOpenAddSession: (teacherId?: string) => void;
  onOpenRecordPayment: () => void;
}

export const TeacherPortalView: React.FC<TeacherPortalViewProps> = ({
  onOpenAddSession,
  onOpenRecordPayment
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
    periodPayments
  } = useApp();

  const currentTeacher = teachers.find(t => t.id === currentTeacherId) || teachers[0];
  const teacherSummary = teacherSummaries.find(ts => ts.teacher.id === currentTeacher?.id);

  // Actividades que imparte
  const teacherActivities = activities.filter(a => a.teacherId === currentTeacher?.id);
  const actIds = teacherActivities.map(a => a.id);

  // Alumnos en sus actividades
  const teacherStudents = students.filter(st =>
    st.activities.some(a => actIds.includes(a.activityId))
  );

  // Clases dadas por este profesor en el mes
  const teacherSessions = sessions.filter(
    s => s.teacherId === currentTeacher?.id && s.date.startsWith(selectedPeriod)
  );

  // Pagos correspondientes a sus actividades en este mes
  const myActivityPayments = periodPayments.filter(p => actIds.includes(p.activityId));

  return (
    <div className="space-y-6">
      {/* Banner de bienvenida y selector de monitor */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/20 via-slate-900/40 to-indigo-900/10 p-5 shadow-xs backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={currentTeacher?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
              alt={currentTeacher?.name}
              className="h-12 w-12 rounded-xl object-cover border border-indigo-500/30 shadow-md"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                Portal Privado del Monitor
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Hola, {currentTeacher?.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resumen de tus clases y liquidación de {selectedPeriod}
              </p>
            </div>
          </div>

          {/* Selector para cambiar de profesor y simular su perspectiva */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ver como:</span>
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
        </div>
      </div>

      {/* KPI Cards del Monitor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Honorarios */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Honorarios Devengados
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {teacherSummary?.calculatedDue.toFixed(2)} €
            </span>
            <span className="text-xs font-medium text-indigo-500">
              {currentTeacher?.paymentScheme === 'per_class' && `${currentTeacher.ratePerClass}€/clase`}
              {currentTeacher?.paymentScheme === 'monthly_fixed' && 'Fijo mensual'}
              {currentTeacher?.paymentScheme === 'revenue_share' && `${currentTeacher.revenueSharePercent}% cuotas`}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {teacherSessions.length} clases dadas este mes
          </p>
        </div>

        {/* Cobrado en Mano */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Cobrado en Mano
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {teacherSummary?.collectedInHand.toFixed(2)} €
            </span>
            <span className="text-xs font-medium text-slate-400">
              Efectivo directo
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Dinero recibido de alumnos
          </p>
        </div>

        {/* Transferido por el centro */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
            Ya Liquidado / Transferido
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {teacherSummary?.alreadySettled.toFixed(2)} €
            </span>
            <span className="text-xs font-medium text-emerald-500">
              En banco
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Abonado formalmente
          </p>
        </div>

        {/* Saldo Pendiente */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 shadow-xs">
          <span className="text-xs font-semibold uppercase text-emerald-800 dark:text-emerald-300 tracking-wider">
            Saldo Pendiente a Recibir
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
              {teacherSummary?.balanceToPay.toFixed(2)} €
            </span>
            <span className="text-xs font-bold text-emerald-600">
              {teacherSummary?.balanceToPay === 0 ? 'Liquidado' : 'Por pagar'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Lo que el centro te transferirá
          </p>
        </div>
      </div>

      {/* Acciones Rápidas del Monitor */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => onOpenAddSession(currentTeacher?.id)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-xs"
        >
          <Calendar className="h-4 w-4" />
          <span>Anotar Clase Impartida Hoy</span>
        </button>

        <button
          onClick={onOpenRecordPayment}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <span>Anotar Pago Recibido en Mano</span>
        </button>
      </div>

      {/* Grid: Tus Actividades & Clases del Mes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividades asignadas */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Tus Actividades ({teacherActivities.length})
          </h3>
          <div className="space-y-3">
            {teacherActivities.map(act => (
              <div
                key={act.id}
                className="rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {act.name}
                  </h4>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {act.defaultPriceMonthly}€ / mes
                  </span>
                </div>
                <p className="text-slate-500 mt-1 text-[11px]">
                  Sala: {act.room} · Horario: {act.schedule.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Alumnos en tus clases */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tus Alumnos ({teacherStudents.length})
            </h3>
            <span className="text-xs text-slate-400">
              Estado de sus cuotas este mes
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {teacherStudents.map(st => {
              const payment = myActivityPayments.find(p => p.studentId === st.id);
              const isPaid = payment?.status === 'paid';
              return (
                <div key={st.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">
                      {st.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {st.phone}
                    </span>
                  </div>

                  <div>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Al corriente
                        {payment?.collectedByTeacher && ' (Te pagó a ti)'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600 text-[11px]">
                        <Clock className="h-3.5 w-3.5" />
                        Cuota pendiente
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
