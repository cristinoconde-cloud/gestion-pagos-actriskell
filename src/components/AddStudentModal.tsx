import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { X, Check } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, studentToEdit }) => {
  const { activities, addStudent, updateStudent } = useApp();

  const [name, setName] = useState(studentToEdit?.name || '');
  const [email, setEmail] = useState(studentToEdit?.email || '');
  const [phone, setPhone] = useState(studentToEdit?.phone || '');
  const [notes, setNotes] = useState(studentToEdit?.notes || '');
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>(
    studentToEdit?.activities.map(a => a.activityId) || (activities[0] ? [activities[0].id] : [])
  );
  const [customPrices, setCustomPrices] = useState<Record<string, number>>(
    studentToEdit?.activities.reduce((acc, a) => {
      if (a.customPrice !== undefined) acc[a.activityId] = a.customPrice;
      return acc;
    }, {} as Record<string, number>) || {}
  );

  if (!isOpen) return null;

  const toggleActivity = (actId: string) => {
    setSelectedActivityIds(prev =>
      prev.includes(actId) ? prev.filter(id => id !== actId) : [...prev, actId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const enrolledList = selectedActivityIds.map(actId => ({
      activityId: actId,
      customPrice: customPrices[actId] !== undefined ? Number(customPrices[actId]) : undefined,
      enrolledSince: new Date().toISOString().split('T')[0],
      billingMode: 'monthly' as const
    }));

    if (studentToEdit) {
      updateStudent(studentToEdit.id, {
        name,
        email,
        phone,
        notes,
        activities: enrolledList
      });
    } else {
      addStudent({
        name,
        email,
        phone,
        status: 'active',
        activities: enrolledList,
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
              {studentToEdit ? 'Editar Ficha del Alumno' : 'Inscribir Nuevo Alumno'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Datos de contacto y asignación de talleres
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

        {/* Formulario con cuerpo escroleable */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Lucía Fernández Ramos"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono móvil (WhatsApp)
                </label>
                <input
                  type="tel"
                  placeholder="+34 600 000 000"
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
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>
            </div>

            {/* Actividades inscritas */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Actividades en las que se inscribe
              </label>
              <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/30">
                {activities.map(act => {
                  const isSelected = selectedActivityIds.includes(act.id);
                  return (
                    <div
                      key={act.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60"
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-800 dark:text-slate-200 min-h-[32px]">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleActivity(act.id)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold">{act.name}</span>
                        <span className="text-slate-400">({act.defaultPriceMonthly}€/mes)</span>
                      </label>

                      {isSelected && (
                        <div className="flex items-center gap-1.5 text-xs pl-6 sm:pl-0">
                          <span className="text-slate-400 text-[11px]">Tarifa:</span>
                          <div className="relative">
                            <input
                              type="number"
                              placeholder={String(act.defaultPriceMonthly)}
                              value={customPrices[act.id] !== undefined ? customPrices[act.id] : ''}
                              onChange={e => {
                                const val = e.target.value ? Number(e.target.value) : undefined;
                                setCustomPrices(prev => {
                                  const copy = { ...prev };
                                  if (val !== undefined) copy[act.id] = val;
                                  else delete copy[act.id];
                                  return copy;
                                });
                              }}
                              className="w-20 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pr-5 pl-2 py-1 text-xs text-right font-bold text-slate-900 dark:text-white"
                            />
                            <span className="absolute right-1.5 top-1 text-[11px] font-bold text-slate-400 pointer-events-none">€</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Observaciones o notas
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Lesión leve en hombro, avisó que los jueves se incorpora 10 min tarde..."
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
              <span>{studentToEdit ? 'Actualizar Alumno' : 'Registrar Alumno'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
