import React, { useState, useEffect } from 'react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  DEFAULT_SUPABASE_CONFIG,
  SupabaseConfig,
  getSupabaseClient
} from '../lib/supabase';
import { X, Check, Database, Server, AlertTriangle, ShieldCheck, RefreshCw, LogIn } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: 'connected' | 'auth_required' | 'error';
    message: string;
  } | null>(null);

  // Campos de Auth opcional si quieren iniciar sesión en Supabase
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredSupabaseConfig());
      setTestResult(null);
      setAuthMsg(null);
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
        message: err.message || 'Error desconocido'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(config);
    onClose();
    window.location.reload();
  };

  const handleResetDefaults = () => {
    setConfig({
      url: DEFAULT_SUPABASE_CONFIG.url,
      anonKey: DEFAULT_SUPABASE_CONFIG.anonKey,
      isEnabled: true
    });
  };

  const handleLoginSupabase = async () => {
    if (!email || !password) return;
    setAuthLoading(true);
    setAuthMsg(null);
    try {
      const client = getSupabaseClient(config);
      if (!client) {
        setAuthMsg('No se pudo inicializar el cliente de Supabase.');
        return;
      }
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthMsg(`Error de inicio de sesión: ${error.message}`);
      } else {
        setAuthMsg(`¡Sesión iniciada con éxito como ${data.user?.email}!`);
      }
    } catch (err: any) {
      setAuthMsg(err.message || 'Error al iniciar sesión');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92dvh] sm:max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Cabecera Fija con botón de 44px */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                Base de Datos & Supabase
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Almacenamiento en la nube o local
              </p>
            </div>
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
        <form onSubmit={handleSave} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
            
            {/* Explicación de la arquitectura actual */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-3.5 border border-slate-200/60 dark:border-slate-800 text-xs space-y-2 leading-relaxed">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                ℹ️ ¿Cómo está funcionando la base de datos?
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Tu proyecto de Bolt apunta a <code className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">qlpuwpktenwmptpnlusu.supabase.co</code>.
                Aquí funciona en **modo híbrido**: datos locales en tu navegador para que la aplicación nunca se caiga ni falle, con sincronización opcional con Supabase.
              </p>
            </div>

            {/* Toggle modo activo */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Activar Cliente de Supabase Cloud
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Si se desactiva, opera con almacenamiento local 100% offline
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.isEnabled}
                  onChange={e => setConfig({ ...config, isEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL del Proyecto de Supabase
              </label>
              <input
                type="url"
                required
                placeholder="https://xyz.supabase.co"
                value={config.url}
                onChange={e => setConfig({ ...config, url: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clave Pública (anon / publishable key)
              </label>
              <input
                type="text"
                required
                placeholder="sb_publishable_..."
                value={config.anonKey}
                onChange={e => setConfig({ ...config, anonKey: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-emerald-500"
              />
            </div>

            {/* Botones Probar Conexión y Valores por defecto */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium underline"
              >
                Restablecer claves de Bolt
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                {testing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Server className="h-3.5 w-3.5" />}
                <span>{testing ? 'Verificando...' : 'Probar Conexión'}</span>
              </button>
            </div>

            {/* Resultado de la prueba */}
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
                        ? 'Conexión Exitosa'
                        : testResult.status === 'auth_required'
                        ? 'Servidor alcanzable (Requiere Auth / Políticas RLS)'
                        : 'Error de Conexión'}
                    </p>
                    <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Inicio de sesión opcional con Supabase Auth */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <LogIn className="h-3.5 w-3.5 text-emerald-600" />
                <span>Iniciar sesión en Supabase (Opcional)</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Si tu proyecto tiene usuarios creados en Supabase Auth, puedes iniciar sesión aquí:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <input
                  type="email"
                  placeholder="Email de Supabase"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                />
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <button
                type="button"
                disabled={authLoading || !email || !password}
                onClick={handleLoginSupabase}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 dark:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition disabled:opacity-50"
              >
                {authLoading ? 'Accediendo...' : 'Autenticar en Supabase'}
              </button>

              {authMsg && (
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {authMsg}
                </p>
              )}
            </div>
          </div>

          {/* Barra Inferior Fija: Siempre a la vista */}
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
              <span>Guardar Configuración</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
