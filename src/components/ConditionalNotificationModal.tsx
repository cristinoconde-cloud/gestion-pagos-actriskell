import React, { useState } from 'react';
import { Bell, Check, Sparkles, X } from 'lucide-react';

interface ConditionalNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export const ConditionalNotificationModal: React.FC<ConditionalNotificationModalProps> = ({
  isOpen,
  onClose,
  message
}) => {
  const [dontShowAgainSession, setDontShowAgainSession] = useState(true);

  if (!isOpen || !message) return null;

  const handleDismiss = () => {
    if (dontShowAgainSession) {
      try {
        sessionStorage.setItem('triskell_popup_dismissed', 'true');
      } catch (e) {
        console.error(e);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 overflow-hidden text-center">
        {/* Glow de fondo */}
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        {/* Botón cerrar X */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icono central */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
          <Bell className="h-7 w-7" />
        </div>

        {/* Título */}
        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
          Comunicado de la Asociación
        </h3>
        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1">
          Aviso Importante para Alumnos y Monitores
        </p>

        {/* Mensaje de la configuración (app_config.popup_notification) */}
        <div className="my-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-4 border border-slate-200/80 dark:border-slate-700/60 text-left">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
            {message}
          </p>
        </div>

        {/* Checkbox de sesión */}
        <div className="mb-5 flex items-center justify-center">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-500 dark:text-slate-400 select-none">
            <input
              type="checkbox"
              checked={dontShowAgainSession}
              onChange={e => setDontShowAgainSession(e.target.checked)}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
            />
            <span>No volver a mostrar durante esta sesión</span>
          </label>
        </div>

        {/* Botón de acción */}
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-3 px-4 text-xs font-bold transition shadow-lg shadow-emerald-600/25 min-h-[44px]"
        >
          <Check className="h-4 w-4" />
          <span>Entendido, Continuar</span>
        </button>
      </div>
    </div>
  );
};
