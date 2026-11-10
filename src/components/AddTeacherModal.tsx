import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Teacher, TeacherPaymentScheme, PaymentMethod } from '../types';
import { X, Check } from 'lucide-react';

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherToEdit?: Teacher | null;
}

export const AddTeacherModal: React.FC<AddTeacherModalProps> = ({ isOpen, onClose, teacherToEdit }) => {
  const { addTeacher, updateTeacher } = useApp();

  const [name, setName] = useState(teacherToEdit?.name || '');
  const [email, setEmail] = useState(teacherToEdit?.email || '');
  const [phone, setPhone] = useState(teacherToEdit?.phone || '');
  const [paymentScheme, setPaymentScheme] = useState<TeacherPaymentScheme>(
    teacherToEdit?.paymentScheme || 'per_class'
  );
  const [ratePerClass, setRatePerClass] = useState<number>(teacherToEdit?.ratePerClass || 30);
  const [fixedMonthlyRate, setFixedMonthlyRate] = useState<number>(teacherToEdit?.fixedMonthlyRate || 400);
  const [revenueSharePercent, setRevenueSharePercent] = useState<number>(teacherToEdit?.revenueSharePercent || 60);
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState<PaymentMethod>(
    teacherToEdit?.preferredPaymentMethod || 'transfer'
  );
  const [bankAccount, setBankAccount] = useState(teacherToEdit?.bankAccount || '');
  const [notes, setNotes] = useState(teacherToEdit?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (teacherToEdit) {
      updateTeacher(teacherToEdit.id, {
        name,
        email,
        phone,
        paymentScheme,
        ratePerClass: Number(ratePerClass),
        fixedMonthlyRate: Number(fixedMonthlyRate),
        revenueSharePercent: Number(revenueSharePercent),
        preferredPaymentMethod,
        bankAccount,
        notes
      });
    } else {
      addTeacher({
        name,
        email,
        phone,
        paymentScheme,
        ratePerClass: Number(ratePerClass),
        fixedMonthlyRate: Number(fixedMonthlyRate),
        revenueSharePercent: Number(revenueSharePercent),
        preferredPaymentMethod,
        bankAccount,
        active: true,
        notes
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Cabecera Fija con botón táctil de 44px */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {teacherToEdit ? 'Editar Profesor / Monitor' : 'Alta de Nuevo Profesor'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Esquema de liquidación y datos de abono
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Elena Morales Soto"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono móvil
                </label>
                <input
                  type="tel"
                  placeholder="+34 612 345 678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="profesor@triskell.es"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>
            </div>

            {/* Esquema Salarial */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Esquema de Remuneración
              </span>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Contrato / Pago
                </label>
                <select
                  value={paymentScheme}
                  onChange={e => setPaymentScheme(e.target.value as TeacherPaymentScheme)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500 font-semibold"
                >
                  <option value="per_class">Tarifa por clase impartida (€ / clase)</option>
                  <option value="monthly_fixed">Sueldo mensual fijo acordado (€ / mes)</option>
                  <option value="revenue_share">Porcentaje sobre recaudación (% de alumnos)</option>
                </select>
              </div>

              {paymentScheme === 'per_class' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Precio por clase impartida
                  </label>
                  <div className="relative max-w-[160px]">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={ratePerClass}
                      onChange={e => setRatePerClass(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pr-7 pl-3 py-2 text-base font-bold text-slate-900 dark:text-white focus:outline-emerald-500 text-right"
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">€</span>
                  </div>
                </div>
              )}

              {paymentScheme === 'monthly_fixed' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cuota mensual fija
                  </label>
                  <div className="relative max-w-[160px]">
                    <input
                      type="number"
                      step="5"
                      min="0"
                      value={fixedMonthlyRate}
                      onChange={e => setFixedMonthlyRate(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pr-7 pl-3 py-2 text-base font-bold text-slate-900 dark:text-white focus:outline-emerald-500 text-right"
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">€</span>
                  </div>
                </div>
              )}

              {paymentScheme === 'revenue_share' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Porcentaje de las cuotas de sus alumnos
                  </label>
                  <div className="relative max-w-[160px]">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="100"
                      value={revenueSharePercent}
                      onChange={e => setRevenueSharePercent(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pr-7 pl-3 py-2 text-base font-bold text-slate-900 dark:text-white focus:outline-emerald-500 text-right"
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Método preferido de abono
                </label>
                <select
                  value={preferredPaymentMethod}
                  onChange={e => setPreferredPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                >
                  <option value="transfer">Transferencia bancaria</option>
                  <option value="cash">Efectivo en mano</option>
                  <option value="bizum">Bizum</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  IBAN Bancario (si aplica)
                </label>
                <input
                  type="text"
                  placeholder="ES00 0000 0000 0000"
                  value={bankAccount}
                  onChange={e => setBankAccount(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-mono text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notas u observaciones
              </label>
              <input
                type="text"
                placeholder="Ej. Especialidad en Yoga Dinámico y Pilates Suelo"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
              />
            </div>
          </div>

          {/* Barra Inferior Fija: Siempre a la vista */}
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
              <span>{teacherToEdit ? 'Actualizar Profesor' : 'Registrar Profesor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
