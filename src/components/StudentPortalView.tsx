import React from 'react';
import { useApp } from '../context/AppContext';
import { PaymentRecord } from '../types';
import {
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  Sparkles,
  MapPin
} from 'lucide-react';

interface StudentPortalViewProps {}

export const StudentPortalView: React.FC<StudentPortalViewProps> = () => {
  const {
    students,
    activities,
    teachers,
    payments,
    selectedPeriod,
    currentStudentId,
    setCurrentStudentId
  } = useApp();

  const currentStudent = students.find(s => s.id === currentStudentId) || students[0];

  // Actividades en las que está matriculado este alumno
  const enrolledActivities = activities.filter(act =>
    currentStudent?.activities.some(enroll => enroll.activityId === act.id)
  );

  // Pagos del alumno en el período actual
  const myPeriodPayments = payments.filter(
    p => p.studentId === currentStudent?.id && p.periodMonth === selectedPeriod
  );

  // Historial completo de recibos del alumno
  const myAllPayments = payments.filter(p => p.studentId === currentStudent?.id);

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida del Alumno */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-slate-900/40 to-emerald-900/10 p-5 shadow-xs backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-extrabold text-xl shadow-xs">
              {currentStudent?.name.charAt(0) || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  Portal del Alumno / Socio
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  {enrolledActivities.length} talleres activos
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Hola, {currentStudent?.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consulta tus clases, horarios y comprobantes oficiales de pago
              </p>
            </div>
          </div>

          {/* Selector de alumno para simulación rápida */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ver como:</span>
            <select
              value={currentStudentId}
              onChange={e => setCurrentStudentId(e.target.value)}
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Estado de Pagos del Mes Seleccionado */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tus Cuotas del Mes ({selectedPeriod})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estado de tus cuotas y recibos correspondientes a este mes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myPeriodPayments.length === 0 ? (
            <div className="col-span-2 py-6 text-center text-xs text-slate-400">
              No constan cuotas generadas para este mes.
            </div>
          ) : (
            myPeriodPayments.map(p => {
              const isPaid = p.status === 'paid';
              return (
                <div
                  key={p.id}
                  className={`rounded-xl border p-4 transition ${
                    isPaid
                      ? 'border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20'
                      : 'border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 font-semibold block">
                        {p.receiptNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                        {p.activityName}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Mes: {p.periodMonth}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900 dark:text-white block">
                        {p.amount.toFixed(2)} €
                      </span>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Pagado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 text-xs">
                          <Clock className="h-3.5 w-3.5" />
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>

                  {isPaid ? (
                    <div className="mt-4 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">
                        Abonado el {p.paymentDate} · {p.paymentMethod}
                        {p.collectedByTeacher && ' (en mano al monitor)'}
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        <CheckCircle2 className="h-4 w-4" />
                        Comprobado
                      </span>
                    </div>
                  ) : (
                    <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-800/40 text-xs space-y-2">
                      <p className="text-amber-800 dark:text-amber-300 font-medium">
                        Puedes abonar esta cuota por <strong>Bizum</strong> al número del centro o en mano a tu profesor en la próxima clase.
                      </p>
                      <div className="rounded-lg bg-white/80 dark:bg-slate-900/60 p-2.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-amber-800">
                        Bizum Asociación: <strong>+34 600 123 456</strong> (Concepto: {p.receiptNumber})
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tus Clases & Talleres Inscritos */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Tus Actividades & Horarios de Asistencia
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrolledActivities.map(act => {
            const teacher = teachers.find(t => t.id === act.teacherId);
            return (
              <div
                key={act.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {act.name}
                  </h4>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {act.defaultPriceMonthly} € / mes
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {act.description}
                </p>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="font-medium">
                    Monitor: <strong className="text-slate-800 dark:text-slate-200">{teacher?.name}</strong>
                  </span>
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {act.room}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {act.schedule.map((sch, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
                    >
                      <Clock className="h-3 w-3" />
                      {sch}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historial Histórico de Recibos */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Histórico de Justificantes Oficiales
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Todos tus recibos emitidos por Triskell para deducción o resguardo
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {myAllPayments.filter(p => p.status === 'paid').map(p => (
            <div key={p.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block">
                  {p.receiptNumber}
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {p.activityName} · {p.periodMonth}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Pagado el {p.paymentDate} mediante {p.paymentMethod}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {p.amount.toFixed(2)} €
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Liquidado
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
