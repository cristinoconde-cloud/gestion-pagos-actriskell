import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Student, StudentStatus } from '../types';
import { X, Check, AlertCircle } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ isOpen, onClose, studentToEdit }) => {
  const { activities, addStudent, updateStudent, currentRole } = useApp();
  const isTeacherRole = currentRole === 'teacher' || currentRole === 'teacher_student';
  const defaultNewStatus: StudentStatus = isTeacherRole ? 'pending_validation' : 'active';

  const [name, setName] = useState(studentToEdit?.name || '');
  const [email, setEmail] = useState(studentToEdit?.email || '');
  const [phone, setPhone] = useState(studentToEdit?.phone || '');
  const [status, setStatus] = useState<StudentStatus>(studentToEdit?.status || defaultNewStatus);
  const [notes, setNotes] = useState(studentToEdit?.notes || '');
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>(
    studentToEdit?.activities.map(a => a.activityId) || []
  );
  const [customPrices, setCustomPrices] = useState<Record<string, number>>(
    studentToEdit?.activities?.reduce((acc, a) => {
      if (a.customPrice !== undefined) acc[a.activityId] = a.customPrice;
      return acc;
    }, {} as Record<string, number>) || {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setName(studentToEdit?.name || '');
    setEmail(studentToEdit?.email || '');
    setPhone(studentToEdit?.phone || '');
    setStatus(studentToEdit?.status || defaultNewStatus);
    setNotes(studentToEdit?.notes || '');
    setSelectedActivityIds(studentToEdit?.activities.map(a => a.activityId) || []);
    setCustomPrices(
      studentToEdit?.activities?.reduce((acc, a) => {
        if (a.customPrice !== undefined) acc[a.activityId] = a.customPrice;
        return acc;
      }, {} as Record<string, number>) || {}
    );
    setIsSaving(false);
    setErrorMsg(null);
  }, [isOpen, studentToEdit, defaultNewStatus]);

  if (!isOpen) return null;

  const toggleActivity = (actId: string) => {
    setSelectedActivityIds(prev =>
      prev.includes(actId) ? prev.filter(id => id !== actId) : [...prev, actId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;

    setIsSaving(true);
    setErrorMsg(null);

    const todayStr = new Date().toISOString().split('T')[0];
    const enrolledList = selectedActivityIds.map(actId => {
      const existing = studentToEdit?.activities.find(a => a.activityId === actId);
      const activityInfo = activities.find(a => a.id === actId);
      return {
        activityId: actId,
        customPrice: customPrices[actId] !== undefined ? Number(customPrices[actId]) : undefined,
        enrolledSince: existing?.enrolledSince || todayStr,
        billingMode: existing?.billingMode || activityInfo?.billingMode || ('monthly' as const)
      };
    });

    const cleanedNotes =
      status === 'pending_validation'
        ? notes.trim()
        : notes.replace(/\[Pendiente validación\]/gi, '').trim();

    try {
      const res = studentToEdit
        ? await updateStudent(studentToEdit.id, {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            status,
            notes: cleanedNotes,
            activities: enrolledList
          })
        : await addStudent({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            status,
            activities: enrolledList,
            notes: cleanedNotes
          });

      if (!res.success) {
        setErrorMsg(res.error || 'No se pudieron guardar los cambios en la base de datos.');
        return;
      }

      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error inesperado al guardar la ficha.');
    } finally {
      setIsSaving(false);
    }
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
            {errorMsg && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40 px-3 py-2.5 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estado del Socio / Alumno
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as StudentStatus)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500 font-semibold"
              >
                <option value="active">Activo / Socio confirmado</option>
                <option value="trial">En prueba</option>
                <option value="pending_validation">Pendiente de validación</option>
                <option value="inactive">Baja / Inactivo</option>
              </select>
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
              disabled={isSaving}
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[44px] flex items-center justify-center disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition min-h-[44px] disabled:opacity-60"
            >
              <Check className="h-4 w-4" />
              <span>
                {isSaving
                  ? 'Guardando...'
                  : studentToEdit
                  ? 'Actualizar Alumno'
                  : 'Registrar Alumno'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
