import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Sparkles,
  MapPin,
  ChevronDown,
  ChevronUp,
  Info,
  Smartphone,
  Copy,
  Check,
  Eye,
  EyeOff,
  User
} from 'lucide-react';
import { Activity } from '../types';

interface StudentPortalViewProps {}

export const StudentPortalView: React.FC<StudentPortalViewProps> = () => {
  const {
    students,
    activities,
    teachers,
    payments,
    selectedPeriod,
    currentStudentId,
    setCurrentStudentId,
    currentRole
  } = useApp();

  // Estados de acordeones replegados por defecto
  const [isCuotasOpen, setIsCuotasOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Modal / Detalle de "Datos actividad"
  const [selectedActivityForModal, setSelectedActivityForModal] = useState<Activity | null>(null);
  const [copiedBizum, setCopiedBizum] = useState(false);

  const currentStudent = students.find(s => s.id === currentStudentId) || students[0];

  // Actividades en las que está matriculado este alumno
  const enrolledActivities = activities.filter(act =>
    currentStudent?.activities.some(enroll => enroll.activityId === act.id)
  );

  // Pagos del alumno en el período actual
  const myPeriodPayments = payments.filter(
    p => p.studentId === currentStudent?.id && p.periodMonth === selectedPeriod
  );
  const pendingCount = myPeriodPayments.filter(p => p.status === 'pending' || p.status === 'overdue').length;
  const paidCount = myPeriodPayments.filter(p => p.status === 'paid').length;

  // Historial completo de recibos liquidados
  const myAllPaidPayments = payments.filter(p => p.studentId === currentStudent?.id && p.status === 'paid');

  const handleCopyBizum = (phone: string) => {
    navigator.clipboard?.writeText(phone);
    setCopiedBizum(true);
    setTimeout(() => setCopiedBizum(false), 2000);
  };

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
                  {enrolledActivities.length} {enrolledActivities.length === 1 ? 'taller activo' : 'talleres activos'}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Hola, {currentStudent?.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consulta tus clases, horarios de asistencia y detalles de tus talleres
              </p>
            </div>
          </div>

          {/* Selector de alumno para simulación rápida (solo Administrador) */}
          {currentRole === 'admin' && (
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
          )}
        </div>
      </div>

      {/* SECCIÓN 1: Tus Actividades & Horarios de Asistencia (Prioritaria con foto del monitor e importe oculto por privacidad) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Tus Actividades & Horarios de Asistencia
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Talleres y actividades formativas en los que participas en Triskell
            </p>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Pulsa en "Datos actividad" para ver cuotas y Bizum
          </span>
        </div>

        {enrolledActivities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No estás matriculado en ninguna actividad formativa actualmente.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledActivities.map(act => {
              const teacher = teachers.find(t => t.id === act.teacherId);
              return (
                <div
                  key={act.id}
                  className="rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 bg-slate-50/60 dark:bg-slate-800/30 hover:border-emerald-500/40 transition space-y-3.5"
                >
                  {/* Encabezado actividad */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {act.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                          {act.billingMode === 'per_class' ? 'Cobro por clase' : 'Cobro mensual'}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          Sala: <strong className="text-slate-700 dark:text-slate-300">{act.room}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Importe Oculto por Privacidad (Protegido) */}
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        <EyeOff className="h-3 w-3" />
                        Privado
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2">
                    {act.description}
                  </p>

                  {/* Monitor asignado con Foto/Avatar visible */}
                  <div className="rounded-xl bg-white dark:bg-slate-800/80 p-2.5 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {(teacher?.avatarUrl || teacher?.avatar) ? (
                        <img
                          src={teacher.avatarUrl || teacher.avatar}
                          alt={teacher.name}
                          className="h-10 w-10 rounded-full object-cover border-2 border-emerald-500/50 shadow-xs"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                          {teacher?.name.charAt(0) || 'M'}
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Monitor Responsable
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {teacher?.name}
                        </span>
                        {teacher?.phone && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            {teacher.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botón "Datos actividad" */}
                    <button
                      onClick={() => setSelectedActivityForModal(act)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-300 dark:hover:text-white px-3 py-1.5 text-xs font-bold transition min-h-[38px] active:scale-95"
                    >
                      <Info className="h-3.5 w-3.5" />
                      <span>Datos actividad</span>
                    </button>
                  </div>

                  {/* Horarios de asistencia */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">Horario:</span>
                    {act.schedule.map((sch, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300"
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
        )}
      </div>

      {/* SECCIÓN 2: Estado de tus cuotas (Acordeón replegado por defecto) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <button
          onClick={() => setIsCuotasOpen(!isCuotasOpen)}
          className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              💳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Estado de tus cuotas ({selectedPeriod})
                </h3>
                {pendingCount > 0 ? (
                  <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                    {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                    Al día
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isCuotasOpen
                  ? 'Desglose detallado de cuotas emitidas este mes'
                  : 'Pulsa para desplegar tus cuotas del mes actual'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-xs font-semibold hidden sm:inline">
              {isCuotasOpen ? 'Plegar' : 'Ver cuotas'}
            </span>
            {isCuotasOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </button>

        {isCuotasOpen && (
          <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {myPeriodPayments.length === 0 ? (
                <div className="col-span-2 py-6 text-center text-xs text-slate-400">
                  No constan cuotas generadas para este mes.
                </div>
              ) : (
                myPeriodPayments.map(p => {
                  const isPaid = p.status === 'paid';
                  const act = activities.find(a => a.id === p.activityId);
                  const teacher = teachers.find(t => t.id === act?.teacherId);

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
                              Abonado
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
                            Puedes abonar esta cuota directamente en mano a tu monitor en la próxima clase o mediante Bizum.
                          </p>

                          {act?.bizum_enabled && act.bizum_phone ? (
                            <div className="rounded-lg bg-white/90 dark:bg-slate-900 p-2.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-amber-300 dark:border-amber-800 flex items-center justify-between">
                              <div>
                                <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-sans font-bold">
                                  Bizum Directo del Taller:
                                </span>
                                <strong>{act.bizum_phone}</strong> ({act.bizum_concept || p.receiptNumber})
                              </div>
                              <button
                                onClick={() => handleCopyBizum(act.bizum_phone!)}
                                className="p-1 text-slate-500 hover:text-slate-900"
                                title="Copiar teléfono Bizum"
                              >
                                {copiedBizum ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                              </button>
                            </div>
                          ) : (
                            <div className="rounded-lg bg-white/80 dark:bg-slate-900/60 p-2.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-amber-800">
                              Bizum Asociación: <strong>+34 600 123 456</strong> (Concepto: {p.receiptNumber})
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 3: Histórico de pagos (Acordeón replegado por defecto) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              📑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Histórico de pagos
                </h3>
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold">
                  {myAllPaidPayments.length} justificante{myAllPaidPayments.length === 1 ? '' : 's'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isHistoryOpen
                  ? 'Listado histórico completo de recibos y justificantes de Triskell'
                  : 'Pulsa para desplegar todos tus pagos históricos comprobados'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-xs font-semibold hidden sm:inline">
              {isHistoryOpen ? 'Plegar' : 'Ver historial'}
            </span>
            {isHistoryOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </div>
        </button>

        {isHistoryOpen && (
          <div className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800">
            {myAllPaidPayments.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No hay pagos históricos registrados para este alumno.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {myAllPaidPayments.map(p => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold block">
                        {p.receiptNumber}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {p.activityName} · {p.periodMonth}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Abonado el {p.paymentDate} mediante {p.paymentMethod}
                        {p.collectedByTeacher && ' (en mano al monitor)'}
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
            )}
          </div>
        )}
      </div>

      {/* Modal / Ficha Informativa "Datos Actividad" (Revela Importe y Datos de Bizum) */}
      {selectedActivityForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Ficha de la Actividad
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedActivityForModal.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedActivityForModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Importe desglosado */}
            <div className="rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-500/20 p-4">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">
                Tarifa Oficial de la Actividad
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {selectedActivityForModal.defaultPriceMonthly.toFixed(2)} €
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {selectedActivityForModal.billingMode === 'per_class' ? '/ clase impartida' : '/ mes completo'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Modalidad:{' '}
                <strong>
                  {selectedActivityForModal.billingMode === 'per_class'
                    ? 'Pago por sesión o clase con el monitor'
                    : 'Cuota regular mensual'}
                </strong>
              </p>
            </div>

            {/* Parámetros Bizum si están activos */}
            {selectedActivityForModal.bizum_enabled && (
              <div className="rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-bold text-xs">
                  <Smartphone className="h-4 w-4" />
                  <span>Cobro Bizum Directo</span>
                </div>
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-sky-200 dark:border-sky-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Número Bizum:</span>
                    <strong className="text-slate-900 dark:text-white font-mono text-sm">
                      {selectedActivityForModal.bizum_phone || 'Consultar con el monitor'}
                    </strong>
                  </div>
                  {selectedActivityForModal.bizum_phone && (
                    <button
                      onClick={() => handleCopyBizum(selectedActivityForModal.bizum_phone!)}
                      className="inline-flex items-center gap-1 rounded-md bg-sky-100 dark:bg-sky-900/60 px-2 py-1 text-[11px] font-bold text-sky-700 dark:text-sky-300"
                    >
                      {copiedBizum ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedBizum ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  )}
                </div>
                {selectedActivityForModal.bizum_concept && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Concepto recomendado: <strong>{selectedActivityForModal.bizum_concept}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Datos de la sala y monitor */}
            <div className="text-xs space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Ubicación / Sala:</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedActivityForModal.room}</strong>
              </div>
              <div className="flex justify-between">
                <span>Horarios:</span>
                <strong className="text-slate-800 dark:text-slate-200">
                  {selectedActivityForModal.schedule.join(' | ')}
                </strong>
              </div>
              {(() => {
                const t = teachers.find(tch => tch.id === selectedActivityForModal.teacherId);
                return (
                  <div className="flex justify-between items-center pt-1">
                    <span>Monitor:</span>
                    <strong className="text-slate-800 dark:text-slate-200">{t?.name}</strong>
                  </div>
                );
              })()}
            </div>

            <button
              onClick={() => setSelectedActivityForModal(null)}
              className="w-full rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-2.5 text-xs transition"
            >
              Cerrar Ficha
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
