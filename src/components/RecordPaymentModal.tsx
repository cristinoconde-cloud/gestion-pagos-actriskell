import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentRecord, PaymentMethod, PaymentStatus } from '../types';
import { X, Check } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPayment?: PaymentRecord | null;
  defaultStudentId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  initialPayment,
  defaultStudentId
}) => {
  const { students, activities, teachers, selectedPeriod, recordPayment, updatePayment } = useApp();

  const [studentId, setStudentId] = useState<string>(
    initialPayment?.studentId || defaultStudentId || (students[0]?.id || '')
  );

  // Determinar actividades del alumno seleccionado
  const selectedStudent = students.find(s => s.id === studentId);
  const studentActivityIds = selectedStudent?.activities.map(a => a.activityId) || [];
  const availableActivities = activities.filter(a => studentActivityIds.includes(a.id));

  const [activityId, setActivityId] = useState<string>(
    initialPayment?.activityId || (availableActivities[0]?.id || activities[0]?.id || '')
  );

  const selectedActivity = activities.find(a => a.id === activityId);
  const enrolledConfig = selectedStudent?.activities.find(a => a.activityId === activityId);

  const defaultAmt = enrolledConfig?.customPrice ?? selectedActivity?.defaultPriceMonthly ?? 45;

  const [amount, setAmount] = useState<number>(initialPayment?.amount ?? defaultAmt);
  const [periodMonth, setPeriodMonth] = useState<string>(initialPayment?.periodMonth || selectedPeriod);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialPayment?.paymentMethod || 'cash');
  const [status, setStatus] = useState<PaymentStatus>(initialPayment?.status || 'paid');
  const [paymentDate, setPaymentDate] = useState<string>(
    initialPayment?.paymentDate || new Date().toISOString().split('T')[0]
  );

  // Por defecto: pago en mano activo al profesor (true)
  const [collectedByTeacher, setCollectedByTeacher] = useState<boolean>(
    initialPayment?.collectedByTeacher ?? true
  );
  const [collectedByTeacherId, setCollectedByTeacherId] = useState<string>(
    initialPayment?.collectedByTeacherId || selectedActivity?.teacherId || (teachers[0]?.id || '')
  );
  const [notes, setNotes] = useState<string>(initialPayment?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const studentObj = students.find(s => s.id === studentId);
    const actObj = activities.find(a => a.id === activityId);

    if (initialPayment) {
      updatePayment(initialPayment.id, {
        studentId,
        studentName: studentObj?.name || initialPayment.studentName,
        activityId,
        activityName: actObj?.name || initialPayment.activityName,
        amount: Number(amount),
        periodMonth,
        paymentMethod,
        status,
        paymentDate: status === 'paid' ? paymentDate : undefined,
        collectedByTeacher,
        collectedByTeacherId: collectedByTeacher ? collectedByTeacherId : undefined,
        notes
      });
    } else {
      recordPayment({
        studentId,
        studentName: studentObj?.name || 'Alumno',
        activityId,
        activityName: actObj?.name || 'Actividad',
        amount: Number(amount),
        periodMonth,
        paymentMethod,
        status,
        paymentDate: status === 'paid' ? paymentDate : undefined,
        collectedByTeacher,
        collectedByTeacherId: collectedByTeacher ? collectedByTeacherId : undefined,
        notes
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Cabecera Fija: Siempre visible en móvil y desktop con botón X táctil de 44px */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {initialPayment ? 'Modificar Cuota' : 'Registrar Pago de Cuota'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pago y estado del alumno
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition touch-manipulation active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario con cuerpo escroleable independiente */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
            
            {/* Alumno y Actividad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alumno *
                </label>
                <select
                  value={studentId}
                  onChange={e => {
                    setStudentId(e.target.value);
                    const st = students.find(s => s.id === e.target.value);
                    if (st && st.activities.length > 0) {
                      setActivityId(st.activities[0].activityId);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Actividad / Taller *
                </label>
                <select
                  value={activityId}
                  onChange={e => setActivityId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                >
                  {activities.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.defaultPriceMonthly}€)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Importe (compacto) vs Fechas (anchas y claras) vs Estado */}
            <div className="grid grid-cols-12 gap-3">
              {/* Importe: ancho proporcionado y ajustado (4 cols en desktop, 4 cols en móvil) */}
              <div className="col-span-5 sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Importe (€)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-7 py-2.5 text-base font-black text-slate-900 dark:text-white focus:outline-emerald-500 text-right"
                    required
                  />
                  <span className="absolute right-2.5 top-3 text-xs font-bold text-slate-400 pointer-events-none">
                    €
                  </span>
                </div>
              </div>

              {/* Mes / Período: espacio generoso para que quepa bien el selector */}
              <div className="col-span-7 sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mes / Período *
                </label>
                <input
                  type="month"
                  value={periodMonth}
                  onChange={e => setPeriodMonth(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                  required
                />
              </div>

              {/* Estado */}
              <div className="col-span-12 sm:col-span-4">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estado
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as PaymentStatus)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500 font-bold"
                >
                  <option value="paid">✓ Pagado</option>
                  <option value="pending">⏳ Pendiente</option>
                  <option value="overdue">⚠️ Con retraso</option>
                </select>
              </div>
            </div>

            {/* Fecha de Pago y Método (con espacio generoso para selector de fecha) */}
            {status === 'paid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha exacta de cobro
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                  >
                    <option value="cash">Efectivo / En mano</option>
                    <option value="transfer">Transferencia bancaria</option>
                    <option value="bizum">Bizum</option>
                    <option value="card">Tarjeta de débito/crédito</option>
                  </select>
                </div>
              </div>
            )}

            {/* Opción Clave: Pago en mano activo por defecto */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer select-none min-h-[32px]">
                <input
                  type="checkbox"
                  checked={collectedByTeacher}
                  onChange={e => setCollectedByTeacher(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 shrink-0"
                />
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  Cobrado en mano por el profesor (activo por defecto)
                </span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-8 leading-relaxed">
                El dinero en efectivo fue entregado directamente al monitor. Se descontará automáticamente de su liquidación.
              </p>

              {collectedByTeacher && (
                <div className="pl-8 pt-1">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Profesor que lo recibió:
                  </label>
                  <select
                    value={collectedByTeacherId}
                    onChange={e => setCollectedByTeacherId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Observaciones (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Entregó 50€ exactos al comenzar la clase"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
              />
            </div>
          </div>

          {/* Barra Inferior Fija: Siempre a la vista en móviles y desktop */}
          <div className="sticky bottom-0 z-10 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-end gap-3 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[44px] flex items-center justify-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition min-h-[44px]"
            >
              <Check className="h-4 w-4" />
              <span>{initialPayment ? 'Actualizar Pago' : 'Guardar Pago'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
