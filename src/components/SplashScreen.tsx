import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
  appName?: string;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  appName = 'A.C.TRISKELL',
  duration = 1600
}) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, duration - 400);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white transition-opacity duration-400 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Círculos decorativos de fondo */}
      <div className="absolute h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute h-64 w-64 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

      {/* Contenedor Central con Logo Centrado */}
      <div className="relative flex flex-col items-center text-center px-6">
        {/* Logo Triskel Céltico con brillo y animación */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-400 opacity-40 blur-xl animate-pulse" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 text-white shadow-2xl shadow-emerald-500/40 border border-emerald-400/30">
            {/* Imagen del logo con la animación de giro continuo */}
            <img 
              src="/logo.png" 
              alt="Logo Triskell" 
              className="h-full w-full object-contain animate-[spin_12s_linear_infinite]"
            />
          </div>
        </div>

        {/* Nombre de la Aplicación */}
        <h1 className="text-3xl font-black tracking-wider text-white drop-shadow-md">
          {appName}
        </h1>
        <p className="mt-1 text-xs font-bold tracking-widest uppercase text-emerald-400">
          Asociación & Gestión Integral
        </p>

        {/* Indicador de carga suave */}
        <div className="mt-8 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.3s]" />
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:-0.15s]" />
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-bounce" />
        </div>
        <span className="mt-3 text-[11px] font-medium text-slate-400">
          Iniciando sesión y verificando credenciales...
        </span>
      </div>
    </div>
  );
};
