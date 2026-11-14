import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AppConfigSetting } from '../types';
import {
  Settings,
  Plus,
  Save,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Bell,
  Calendar,
  Newspaper
} from 'lucide-react';

export const AdminConfigView: React.FC = () => {
  const { appConfigs, updateAppConfig, addAppConfig, deleteAppConfig } = useApp();

  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<Record<string, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newActive, setNewActive] = useState(true);

  const getEditedValue = (config: AppConfigSetting) => {
    return editingValues[config.config_key] !== undefined
      ? editingValues[config.config_key]
      : config.config_value;
  };

  const handleValueChange = (key: string, val: string) => {
    setEditingValues(prev => ({ ...prev, [key]: val }));
  };

  const handleToggleActive = async (config: AppConfigSetting) => {
    const val = getEditedValue(config);
    await updateAppConfig(config.config_key, val, !config.is_active);
    triggerSuccessBadge(config.config_key);
  };

  const handleSaveConfig = async (config: AppConfigSetting) => {
    const val = getEditedValue(config);
    await updateAppConfig(config.config_key, val, config.is_active);
    triggerSuccessBadge(config.config_key);
  };

  const triggerSuccessBadge = (key: string) => {
    setSaveStatus(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, [key]: false }));
    }, 2500);
  };

  const handleCreateNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    await addAppConfig({
      config_key: newKey.trim().toLowerCase().replace(/\s+/g, '_'),
      config_value: newValue,
      is_active: newActive,
      description: newDesc
    });

    setNewKey('');
    setNewValue('');
    setNewDesc('');
    setNewActive(true);
    setIsAddModalOpen(false);
  };

  // Helper para mostrar iconos temáticos
  const getKeyIcon = (key: string) => {
    if (key.includes('popup') || key.includes('notification')) {
      return <Bell className="h-4 w-4 text-amber-500" />;
    }
    if (key.includes('calendar')) {
      return <Calendar className="h-4 w-4 text-indigo-500" />;
    }
    if (key.includes('news') || key.includes('nota')) {
      return <Newspaper className="h-4 w-4 text-emerald-500" />;
    }
    return <Settings className="h-4 w-4 text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Settings className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              Configuración Global del Sistema (app_config)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Panel exclusivo para administradores. Modifica parámetros de la app, comunicados emergentes y notas en tiempo real.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold transition shadow-md shadow-emerald-600/20 active:scale-95 shrink-0 min-h-[42px]"
        >
          <Plus className="h-4 w-4" />
          <span>+ Nuevo Parámetro</span>
        </button>
      </div>

      {/* Tarjetas de Parámetros de Configuración */}
      <div className="grid grid-cols-1 gap-4">
        {appConfigs
          .filter(c => c.config_key !== 'google_calendar')
          .map(config => {
          const isSaved = saveStatus[config.config_key];
          const currentValue = getEditedValue(config);
          const hasChanged = currentValue !== config.config_value;

          return (
            <div
              key={config.config_key}
              className={`rounded-2xl border p-4 sm:p-5 transition bg-white dark:bg-slate-900 shadow-xs ${
                config.is_active
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-200/60 dark:border-slate-800/60 opacity-80 bg-slate-50/50 dark:bg-slate-900/50'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                {/* Lado Izquierdo: Clave, Descripción y Estado */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {getKeyIcon(config.config_key)}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-mono">
                      {config.config_key}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        config.is_active
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                      }`}
                    >
                      {config.is_active ? '● Activo' : '○ Inactivo'}
                    </span>
                  </div>

                  {config.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {config.description}
                    </p>
                  )}

                  {/* Campo de Edición del Valor */}
                  <div className="mt-3">
                    <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                      Valor de la Configuración (config_value):
                    </label>
                    {config.config_value.length > 80 || config.config_key.includes('popup') ? (
                      <textarea
                        rows={2}
                        value={currentValue}
                        onChange={e => handleValueChange(config.config_key, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-emerald-500 font-sans"
                      />
                    ) : (
                      <input
                        type="text"
                        value={currentValue}
                        onChange={e => handleValueChange(config.config_key, e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-emerald-500 font-sans"
                      />
                    )}
                  </div>
                </div>

                {/* Lado Derecho: Acciones (Toggle Active, Guardar, Borrar) */}
                <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                  {/* Interruptor de Activar / Desactivar */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(config)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition min-h-[38px] active:scale-95 ${
                      config.is_active
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {config.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    <span>{config.is_active ? 'Desactivar' : 'Activar'}</span>
                  </button>

                  {/* Guardar cambios de valor */}
                  <button
                    type="button"
                    onClick={() => handleSaveConfig(config)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition min-h-[38px] active:scale-95 ${
                      hasChanged
                        ? 'bg-indigo-600 text-white shadow-xs animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{hasChanged ? 'Guardar Cambios' : 'Actualizar'}</span>
                  </button>

                  {/* Feedback de guardado */}
                  {isSaved && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Guardado en Supabase</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Crear Nuevo Parámetro */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Añadir Parámetro de Configuración
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Crea una nueva variable en la tabla 'app_config'.
            </p>

            <form onSubmit={handleCreateNew} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clave (config_key) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. horario_festivos_activo"
                  value={newKey}
                  onChange={e => setNewKey(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Valor (config_value) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Texto, enlace o valor de configuración..."
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Para qué sirve este parámetro..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={newActive}
                  onChange={e => setNewActive(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="font-semibold">Parámetro activo (is_active = true)</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-xs"
                >
                  Guardar Parámetro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
