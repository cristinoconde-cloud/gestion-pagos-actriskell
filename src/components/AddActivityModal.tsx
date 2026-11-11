import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity } from '../types';
import { X, Check, Smartphone } from 'lucide-react';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activityToEdit?: Activity | null;
  defaultTeacherId?: string;
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  isOpen,
  onClose,
  activityToEdit,
  defaultTeacherId
}) => {
  const { teachers, addActivity, updateActivity } = useApp();

  const [name, setName] = useState(activityToEdit?.name || '');
  const [description, setDescription] = useState(activityToEdit?.description || '');
  const [teacherId, setTeacherId] = useState(
    activityToEdit?.teacherId || defaultTeacherId || (teachers[0]?.id || '')
  );
  const [category, setCategory] = useState(activityToEdit?.category || 'Yoga');
  const [billingMode, setBillingMode] = useState<'monthly' | 'per_class'>(
    activityToEdit?.billingMode || 'monthly'
  );
  const [defaultPriceMonthly, setDefaultPriceMonthly] = useState<number>(
    activityToEdit?.defaultPriceMonthly || 50
  );
  const [defaultPricePerClass, setDefaultPricePerClass] = useState<number>(
    activityToEdit?.defaultPricePerClass || 10
  );
  const [bizumEnabled, setBizumEnabled] = useState<boolean>(
    activityToEdit?.bizum_enabled ?? true
  );
  const selectedTeacher = teachers.find(t => t.id === teacherId);
  const [bizumPhone, setBizumPhone] = useState<string>(
    activityToEdit?.bizum_phone || selectedTeacher?.phone || '+34 600 000 000'
  );
  const [bizumConcept, setBizumConcept] = useState<string>(
    activityToEdit?.bizum_concept || activityToEdit?.name || ''
  );
  const [room, setRoom] = useState(activityToEdit?.room || 'Sala Principal');
  const [scheduleText, setScheduleText] = useState(
    activityToEdit?.schedule.join(', ') || 'Martes 18:30, Jueves 18:30'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const schedules = scheduleText.split(',').map(s => s.trim()).filter(Boolean);

    const payload = {
      name,
      description,
      teacherId,
      category,
      billingMode,
      defaultPriceMonthly: Number(defaultPriceMonthly),
      defaultPricePerClass: Number(defaultPricePerClass),
      bizum_enabled: bizumEnabled,
      bizum_phone: bizumEnabled ? bizumPhone.trim() : undefined,
      bizum_concept: bizumEnabled ? (bizumConcept.trim() || name.trim()) : undefined,
      room,
      schedule: schedules
    };

    if (activityToEdit) {
      updateActivity(activityToEdit.id, payload);
    } else {
      addActivity({
        ...payload,
        color: 'emerald',
        active: true
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
              {activityToEdit ? 'Editar Taller / Actividad' : 'Nuevo Taller Formativo'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Modalidad de cobro, Bizum, monitor y horarios
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
                Nombre de la Actividad / Taller *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Yoga Vinyasa, Francés B1, Cerámica..."
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (!bizumConcept) setBizumConcept(e.target.value);
                }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monitor Responsable
                </label>
                <select
                  value={teacherId}
                  onChange={e => {
                    setTeacherId(e.target.value);
                    const t = teachers.find(item => item.id === e.target.value);
                    if (t?.phone && !bizumPhone) setBizumPhone(t.phone);
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500 font-semibold"
                >
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-base sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                >
                  <option value="Yoga">Yoga</option>
                  <option value="Pilates">Pilates</option>
                  <option value="Música">Música</option>
                  <option value="Idiomas">Idiomas</option>
                  <option value="Danza">Danza</option>
                  <option value="Arte">Arte & Cerámica</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            {/* Modalidad de cobro */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
                  Modalidad de Cobro Principal *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBillingMode('monthly')}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      billingMode === 'monthly'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>📅 Cuota Mensual</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBillingMode('per_class')}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      billingMode === 'per_class'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>🎟️ Pago por Clase</span>
                  </button>
                </div>
              </div>

              {/* Importes según modalidad */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Precio Mensual (€)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={defaultPriceMonthly}
                      onChange={e => setDefaultPriceMonthly(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pr-7 pl-3 py-2 text-base font-bold text-slate-900 dark:text-white focus:outline-emerald-500 text-right"
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">€/m</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Precio Clase Suelta (€)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={defaultPricePerClass}
                      onChange={e => setDefaultPricePerClass(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pr-7 pl-3 py-2 text-base font-bold text-slate-900 dark:text-white focus:outline-emerald-500 text-right"
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">€/c</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de Bizum para este taller */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={bizumEnabled}
                  onChange={e => setBizumEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                  Habilitar pagos por Bizum para este taller (flag bizum_enabled)
                </span>
              </label>

              {bizumEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-6 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Teléfono receptor Bizum *
                    </label>
                    <input
                      type="tel"
                      required={bizumEnabled}
                      placeholder="+34 600 000 000"
                      value={bizumPhone}
                      onChange={e => setBizumPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Concepto sugerido Bizum
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Yoga Triskell"
                      value={bizumConcept}
                      onChange={e => setBizumConcept(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sala / Espacio
                </label>
                <input
                  type="text"
                  placeholder="Ej. Sala Zen"
                  value={room}
                  onChange={e => setRoom(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Horarios (separados por coma)
                </label>
                <input
                  type="text"
                  placeholder="Lunes 10:00, Miércoles 10:00"
                  value={scheduleText}
                  onChange={e => setScheduleText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Descripción
              </label>
              <textarea
                rows={2}
                placeholder="Breve descripción del contenido o nivel del taller..."
                value={description}
                onChange={e => setDescription(e.target.value)}
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
              <span>{activityToEdit ? 'Actualizar Taller' : 'Crear Taller'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
