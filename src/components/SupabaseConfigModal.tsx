import React, { useState, useEffect } from 'react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  DEFAULT_SUPABASE_CONFIG,
  SupabaseConfig
} from '../lib/supabase';
import { useApp } from '../context/AppContext';
import {
  X,
  Check,
  Database,
  Server,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Cloud
} from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const {
    refreshFromSupabase,
    seedInitialDataToSupabase,
    teachers,
    activities,
    students,
    payments,
    isLoadingDb
  } = useApp();

  const [config, setConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [testing, setTesting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: 'connected' | 'auth_required' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredSupabaseConfig();
      // Garantizar que esté activado por defecto
      setConfig({ ...stored, isEnabled: true });
      setTestResult(null);
      setSeedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(config.url, config.anonKey);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        status: 'error',
        message: err.message || 'Error desconocido al conectar con Supabase'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig({ ...config, isEnabled: true });
    await refreshFromSupabase();
    onClose();
  };

  const handleSeedData = async () => {
    if (
      window.confirm(
        '¿Deseas poblar la base de datos de Supabase con los talleres, monitores y alumnos de ejemplo?'
      )
    ) {
      setSeeding(true);
      try {
        await seedInitialDataToSupabase();
        setSeedSuccess(true);
      } catch (err) {
        console.error(err);
      } finally {
        setSeeding(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Base de Datos & Supabase Cloud
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Conectado en Tiempo Real
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                PostgreSQL en la nube conectado mediante @supabase/supabase-js
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario y Contenido */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-5 space-y-4 text-xs">

            {/* Estado del almacenamiento Cloud */}
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Tablas Activas en Supabase Cloud
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  PostgreSQL RLS Activo
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono">
                <div className="rounded-lg bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-black text-slate-900 dark:text-white block">{teachers.length}</span>
                  <span className="text-[10px] text-slate-400 font-sans">Monitores</span>
                </div>
                <div className="rounded-lg bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-black text-slate-900 dark:text-white block">{activities.length}</span>
                  <span className="text-[10px] text-slate-400 font-sans">Talleres</span>
                </div>
                <div className="rounded-lg bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-black text-slate-900 dark:text-white block">{students.length}</span>
                  <span className="text-[10px] text-slate-400 font-sans">Alumnos</span>
                </div>
                <div className="rounded-lg bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700">
                  <span className="text-lg font-black text-slate-900 dark:text-white block">{payments.length}</span>
                  <span className="text-[10px] text-slate-400 font-sans">Pagos</span>
                </div>
              </div>

              {/* Botón para poblar datos iniciales si está vacía */}
              {teachers.length === 0 && activities.length === 0 && (
                <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Tu base de datos está vacía. Puedes cargar los datos iniciales de ejemplo con 1 clic:
                  </p>
                  <button
                    type="button"
                    disabled={seeding}
                    onClick={handleSeedData}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shrink-0"
                  >
                    {seeding ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    <span>{seeding ? 'Insertando...' : 'Cargar Datos Iniciales'}</span>
                  </button>
                </div>
              )}

              {seedSuccess && (
                <p className="text-emerald-700 dark:text-emerald-300 font-bold text-xs mt-2">
                  ¡Datos iniciales cargados con éxito en tus tablas de Supabase!
                </p>
              )}
            </div>

            {/* Parámetros de Conexión */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  URL del Proyecto Supabase
                </label>
                <input
                  type="text"
                  required
                  value={config.url}
                  onChange={e => setConfig({ ...config, url: e.target.value.trim() })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Clave Pública (Anon Key / Public API Key)
                </label>
                <textarea
                  rows={2}
                  required
                  value={config.anonKey}
                  onChange={e => setConfig({ ...config, anonKey: e.target.value.trim() })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white font-mono text-xs focus:outline-emerald-500"
                />
              </div>
            </div>

            {/* Botones de prueba y refresco */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                {testing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Server className="h-3.5 w-3.5" />}
                <span>{testing ? 'Verificando...' : 'Probar Conexión Cloud'}</span>
              </button>

              <button
                type="button"
                onClick={refreshFromSupabase}
                disabled={isLoadingDb}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoadingDb ? 'animate-spin' : ''}`} />
                <span>Sincronizar Tablas</span>
              </button>
            </div>

            {/* Resultado del test */}
            {testResult && (
              <div
                className={`rounded-xl p-3 border text-xs ${
                  testResult.status === 'connected'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                    : testResult.status === 'auth_required'
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-800 dark:text-amber-300'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-800 dark:text-rose-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  {testResult.status === 'connected' ? (
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  )}
                  <div>
                    <p className="font-bold">
                      {testResult.status === 'connected'
                        ? 'Conexión Exitosa con Supabase Cloud'
                        : testResult.status === 'auth_required'
                        ? 'Servidor alcanzable (Requiere Auth / Políticas RLS)'
                        : 'Error de Conexión'}
                    </p>
                    <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barra Inferior Fija */}
          <div className="sticky bottom-0 z-10 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex items-center justify-end gap-3 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[44px] flex items-center justify-center"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition min-h-[44px]"
            >
              <Check className="h-4 w-4" />
              <span>Guardar Configuración Cloud</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
