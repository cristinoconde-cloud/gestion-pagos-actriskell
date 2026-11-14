import React from 'react';
import { useApp } from '../context/AppContext';
import { PaymentRecord } from '../types';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Calendar,
  Sparkles,
  MessageCircle,
  Plus,
  UserCheck,
  UserX,
  Check,
  X
} from 'lucide-react';

interface DashboardViewProps {
  onOpenRecordPayment: (initialPayment?: PaymentRecord) => void;
  onOpenAddSession: () => void;
  onOpenAddExpense: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenRecordPayment,
  onOpenAddSession,
  onOpenAddExpense,
  onNavigateToTab
}) => {
  const {
    selectedPeriod,
    totalIncomeCollected,
    totalIncomePending,
    totalExpenses,
    totalTeacherCosts,
    netMonthlyBalance,
    periodPayments,
    markPaymentPaid,
    teacherSummaries,
    students,
    activities,
    teachers,
    validatePendingStudent,
    confirmActivityEnrollment,
    rejectActivityEnrollment
  } = useApp();

  // Alumnos con pagos pendientes en este mes
  const pendingPayments = periodPayments.filter(p => p.status === 'pending' || p.status === 'overdue');
  const paidPayments = periodPayments.filter(p => p.status === 'paid' || p.status === 'partial');

  // Altas rápidas pendientes de confirmación definitiva por el Administrador
  const pendingValidationStudents = students.filter(
    s => s.status === 'pending_validation' || s.validationStatus === 'pending'
  );

  // Solicitudes de inscripción a talleres enviadas por alumnos
  const pendingEnrollmentRequests = students.flatMap(st =>
    (st.pendingEnrollments || [])
      .map(enr => {
        const act = activities.find(a => a.id === enr.activityId);
        if (!act) return null;
        const teacher = teachers.find(t => t.id === act.teacherId);
        return {
          student: st,
          activityId: act.id,
          activityName: act.name,
          teacherName: teacher?.name || 'Sin monitor',
          enrolledSince: enr.enrolledSince
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
  );

  // Profesores con saldo pendiente de abonar
  const teachersWithPendingBalance = teacherSummaries.filter(ts => ts.balanceToPay > 0);

  // Generar enlace WhatsApp con mensaje predeterminado
  const handleWhatsAppReminder = (payment: PaymentRecord) => {
    const student = students.find(s => s.id === payment.studentId);
    const phone = student?.phone?.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hola ${payment.studentName}, te recordamos desde Triskell la cuota de ${payment.activityName} correspondiente a ${payment.periodMonth} por importe de ${payment.amount}€. Puedes abonarla por Bizum o transferencia. ¡Muchas gracias!`
    );
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    } else {
      navigator.clipboard.writeText(decodeURIComponent(message));
      alert('Texto del recordatorio copiado al portapapeles:\n\n' + decodeURIComponent(message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera Portal del Administrador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Portal del Administrador
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control financiero mensual, cuotas, honorarios y gastos ({selectedPeriod})
          </p>
        </div>
      </div>

      {/* KPI Cards de Finanzas Mensuales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Recaudado */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Recaudado</span>
            <div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowDownRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black tabular-nums text-slate-900 dark:text-white">
              {totalIncomeCollected.toFixed(2)} €
            </span>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              {paidPayments.length} cuotas cobradas
            </p>
          </div>
        </div>

        {/* Por cobrar */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Por cobrar</span>
            <div className="h-6 w-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black tabular-nums text-amber-600 dark:text-amber-400">
              {totalIncomePending.toFixed(2)} €
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {pendingPayments.length} alumnos pendientes
            </p>
          </div>
        </div>

        {/* Profesores */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Profesores</span>
            <div className="h-6 w-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black tabular-nums text-slate-900 dark:text-white">
              {totalTeacherCosts.toFixed(2)} €
            </span>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
              Honorarios calculados
            </p>
          </div>
        </div>

        {/* Gastos */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gastos</span>
            <div className="h-6 w-6 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-1.5">
            <span className="text-xl font-black tabular-nums text-slate-900 dark:text-white">
              {totalExpenses.toFixed(2)} €
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Alquiler, suministros...
            </p>
          </div>
        </div>

        {/* Margen neto */}
        <div className={`col-span-2 sm:col-span-2 lg:col-span-1 rounded-2xl border p-3.5 shadow-xs ${
          netMonthlyBalance >= 0
            ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20'
            : 'border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20'
        }`}>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Margen neto</span>
            {netMonthlyBalance >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            )}
          </div>
          <div className="mt-1.5">
            <span className={`text-xl font-black tabular-nums ${
              netMonthlyBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
            }`}>
              {netMonthlyBalance.toFixed(2)} €
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {netMonthlyBalance >= 0 ? 'Superávit del centro' : 'Atención al déficit'}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Progreso Financiero del Período */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Salud Financiera del Mes ({selectedPeriod})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Desglose porcentual: Recaudación vs Compromisos de gasto y honorarios
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              Recaudado ({totalIncomeCollected}€)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
              Monitores ({totalTeacherCosts}€)
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400"></span>
              Gastos ({totalExpenses}€)
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          {totalIncomeCollected + totalIncomePending > 0 ? (
            <>
              <div
                style={{
                  width: `${Math.min(100, (totalIncomeCollected / (totalIncomeCollected + totalIncomePending)) * 100)}%`
                }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Recaudado: ${totalIncomeCollected}€`}
              />
              <div
                style={{
                  width: `${Math.min(100, (totalIncomePending / (totalIncomeCollected + totalIncomePending)) * 100)}%`
                }}
                className="bg-amber-400 h-full transition-all duration-500"
                title={`Pendiente: ${totalIncomePending}€`}
              />
            </>
          ) : (
            <div className="bg-slate-300 w-full h-full" />
          )}
        </div>
      </div>

      {/* Altas rápidas pendientes de validación definitiva por Administrador */}
      {pendingValidationStudents.length > 0 && (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-50/60 dark:bg-amber-950/20 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Nuevos Socios Pendientes de Validación ({pendingValidationStudents.length})
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Altas rápidas realizadas desde inscripción a taller a la espera de confirmación definitiva
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 divide-y divide-amber-500/15">
            {pendingValidationStudents.map(st => {
              const enrolledNames = (st.activities || [])
                .map(enr => activities.find(a => a.id === enr.activityId)?.name)
                .filter(Boolean)
                .join(', ');

              return (
                <div
                  key={st.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {st.name}
                      </span>
                      <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                        Pendiente validación
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 mt-0.5">
                      {[st.phone, st.email].filter(Boolean).join(' · ') || 'Sin datos de contacto'}
                      {enrolledNames && (
                        <>
                          {' · '}
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            Taller: {enrolledNames}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => validatePendingStudent(st.id, false)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 transition"
                    >
                      <UserX className="h-3.5 w-3.5" />
                      <span>Rechazar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => validatePendingStudent(st.id, true)}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 font-bold text-white hover:bg-emerald-700 shadow-xs transition"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Confirmar socio</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Solicitudes de inscripción a talleres enviadas por alumnos */}
      {pendingEnrollmentRequests.length > 0 && (
        <div className="rounded-2xl border border-indigo-500/35 bg-indigo-50/60 dark:bg-indigo-950/20 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Solicitudes de Inscripción a Talleres ({pendingEnrollmentRequests.length})
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Alumnos esperando confirmación para entrar en una actividad
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('admin-users')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline self-start sm:self-auto"
            >
              Ver en Usuarios y Socios
            </button>
          </div>

          <div className="mt-3 divide-y divide-indigo-500/15">
            {pendingEnrollmentRequests.map(req => (
              <div
                key={`${req.student.id}-${req.activityId}`}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {req.student.name}
                    </span>
                    <span className="rounded-md bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:text-indigo-300">
                      {req.activityName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Monitor: <strong>{req.teacherName}</strong>
                    </span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {[req.student.phone, req.student.email].filter(Boolean).join(' · ') || 'Sin datos de contacto'} · Solicitada el {req.enrolledSince}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => rejectActivityEnrollment(req.student.id, req.activityId)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Rechazar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmActivityEnrollment(req.student.id, req.activityId)}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 font-bold text-white hover:bg-emerald-700 shadow-xs transition"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Confirmar plaza</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de 2 Columnas: Alertas & Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Izquierda: Alumnos con Pago Pendiente */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cuotas Pendientes de Alumnos ({pendingPayments.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('payments')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Ver todas
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80">
            {pendingPayments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-200">¡Todo al día!</p>
                <p>No hay cuotas pendientes para el mes de {selectedPeriod}.</p>
              </div>
            ) : (
              pendingPayments.map(p => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {p.studentName}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {p.activityName} · <span className="font-bold text-slate-800 dark:text-slate-200">{p.amount}€</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleWhatsAppReminder(p)}
                      title="Enviar recordatorio por WhatsApp"
                      className="rounded-lg border border-slate-200 dark:border-slate-700 p-1.5 text-slate-500 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 transition"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => markPaymentPaid(p.id)}
                      className="rounded-lg bg-emerald-600 px-2.5 py-1.5 font-bold text-white hover:bg-emerald-700 transition shadow-xs text-[11px]"
                    >
                      Marcar Pagado
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna Derecha: Estado de Monitores & Liquidaciones */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500 shrink-0" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Liquidación de Monitores ({selectedPeriod})
              </h3>
            </div>
            <button
              onClick={() => onNavigateToTab('teachers')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Gestionar
            </button>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80">
            {teacherSummaries.map(ts => (
              <div key={ts.teacher.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {ts.teacher.name}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {ts.classesCount} clases dadas · {ts.studentsCount} alumnos inscritos
                  </div>
                  {ts.collectedInHand > 0 && (
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                      Ya cobró en mano: {ts.collectedInHand.toFixed(2)}€
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {ts.calculatedDue.toFixed(2)} €
                  </div>
                  <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    Pendiente abono: {ts.balanceToPay.toFixed(2)} €
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recibos y Movimientos Recientes */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Últimos Cobros Registrados ({selectedPeriod})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Justificantes oficiales con folio de control
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('payments')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Ver libro completo
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-2 px-3">Folio / Recibo</th>
                <th className="py-2 px-3">Alumno</th>
                <th className="py-2 px-3">Actividad</th>
                <th className="py-2 px-3">Importe</th>
                <th className="py-2 px-3">Método</th>
                <th className="py-2 px-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
              {paidPayments.slice(0, 5).map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                    {p.receiptNumber}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                    {p.studentName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                    {p.activityName}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">
                    {p.amount.toFixed(2)} €
                  </td>
                  <td className="py-2.5 px-3 capitalize">
                    {p.paymentMethod} {p.collectedByTeacher && '· en mano'}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Pagado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};