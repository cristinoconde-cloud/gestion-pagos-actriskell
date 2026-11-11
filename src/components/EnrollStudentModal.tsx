import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, UserPlus, Sparkles, UserCheck } from 'lucide-react';

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultActivityId?: string;
  initialActivityId?: string;
  allowedTeacherId?: string;
  onOpenCreateStudent?: () => void;
}

export const EnrollStudentModal: React.FC<EnrollStudentModalProps> = ({
  isOpen,
  onClose,
  defaultActivityId,
  initialActivityId,
  allowedTeacherId,
  onOpenCreateStudent
}) => {
  const effectiveDefaultActivityId = initialActivityId || defaultActivityId;
  const { activities, students, enrollStudentInActivity } = useApp();

  const availableActivities = allowedTeacherId
    ? activities.filter(a => a.teacherId === allowedTeacherId)
    : activities;

  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    effectiveDefaultActivityId || (availableActivities[0]?.id || '')
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<number | ''>('');

  if (!isOpen) return null;

  const selectedActivity = activities.find(a => a.id === selectedActivityId);

  // Alumnos que AÚN NO están matriculados en esta actividad
  const unenrolledStudents = students.filter(
    s => !s.activities.some(act => act.activityId === selectedActivityId)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityId || !selectedStudentId) return;

    enrollStudentInActivity(
      selectedStudentId,
      selectedActivityId,
      customPrice === '' ? undefined : Number(customPrice)
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Cabecera Fija */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              Inscribir Alumno a Taller
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Asigna un alumno a tu clase formativa
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
            
            {/* Taller / Actividad */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Taller Formativo *
              </label>
              <select
                value={selectedActivityId}
                onChange={e => {
                  setSelectedActivityId(e.target.value);
                  setSelectedStudentId('');
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500 font-semibold"
              >
                {availableActivities.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.billingMode === 'per_class' ? `${a.defaultPricePerClass}€/clase` : `${a.defaultPriceMonthly}€/mes`})
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Alumno */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Seleccionar Alumno *
                </label>
                {onOpenCreateStudent && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCreateStudent();
                    }}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                  >
                    <UserPlus className="h-3 w-3" />
                    <span>+ Crear nuevo alumno</span>
                  </button>
                )}
              </div>

              {unenrolledStudents.length === 0 ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center text-xs text-slate-500">
                  Todos los alumnos registrados ya están matriculados en este taller.
                </div>
              ) : (
                <select
                  required
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                >
                  <option value="">-- Elige un alumno --</option>
                  {unenrolledStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.phone || s.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Tarifa Personalizada Opcional */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tarifa Especial / Precio acordado (opcional)
              </label>
              <div className="relative max-w-[170px]">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder={String(
                    selectedActivity?.billingMode === 'per_class'
                      ? selectedActivity.defaultPricePerClass
                      : selectedActivity?.defaultPriceMonthly || 45
                  )}
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-8 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-emerald-500 text-right"
                />
                <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                  €
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Déjalo vacío para aplicar la tarifa estándar de {selectedActivity?.billingMode === 'per_class' ? `${selectedActivity.defaultPricePerClass}€ por clase` : `${selectedActivity?.defaultPriceMonthly}€ al mes`}.
              </p>
            </div>
          </div>

          {/* Barra Inferior Fija */}
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
              disabled={!selectedStudentId || !selectedActivityId}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition min-h-[44px] disabled:opacity-50"
            >
              <UserCheck className="h-4 w-4" />
              <span>Confirmar Inscripción</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
