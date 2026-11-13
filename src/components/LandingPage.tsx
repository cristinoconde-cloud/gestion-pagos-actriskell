import React, { useState } from 'react';
import heroImage from '../assets/images/hero_actriskell_center_1794560767905.jpg';
import { ArrowRight, CalendarCheck2, Users, WalletCards, ShieldCheck, Building2 } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSignIn }) => {
  const [imgError, setImgError] = useState(false);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    onNavigate(path);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Bar (3-zone contract) */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand wordmark */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex items-center gap-2.5 text-base font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-emerald-600 rounded-md"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 overflow-hidden p-1 shrink-0">
              <img
                src="/logo.png"
                alt="App Actriskell"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
            </span>
            <span>App Actriskell</span>
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a
              href="#funcionalidades"
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Funcionalidades
            </a>
            <a
              href="#portales"
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Portales
            </a>
            <a
              href="/privacidad"
              onClick={(e) => handleLinkClick(e, '/privacidad')}
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Privacidad
            </a>
            <a
              href="/condiciones"
              onClick={(e) => handleLinkClick(e, '/condiciones')}
              className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Condiciones
            </a>
          </nav>

          {/* Zone 3: Single primary CTA */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={onSignIn}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 text-sm font-semibold transition-all shadow-sm shadow-emerald-600/20 whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Copy */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 tracking-wide mb-3">
                Asociación Cultural y Deportiva Triskell
              </p>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] text-balance">
                Gestión integral para asociaciones, talleres y monitores
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                App Actriskell centraliza el registro de socios y alumnos, el calendario de talleres formativos, el control de asistencia en clase, los recibos de cuotas y la liquidación mensual de honorarios en una sola plataforma privada.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={onSignIn}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-6 py-3 text-sm font-bold transition-all shadow-md shadow-emerald-600/20 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  <span>Iniciar sesión</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <a
                  href="#funcionalidades"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:underline underline-offset-4 transition-colors py-2"
                >
                  Conocer funcionalidades
                </a>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Acceso exclusivo para miembros autorizados</span>
                <span aria-hidden="true">·</span>
                <span>Autenticación con Google OAuth y correo</span>
                <span aria-hidden="true">·</span>
                <span>Datos cifrados</span>
              </div>
            </div>

            {/* Right Visual Anchor */}
            <div className="lg:col-span-6">
              <div className="h-full min-h-[260px] sm:min-h-[340px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                {!imgError ? (
                  <img
                    src={heroImage}
                    alt="Espacio de talleres culturales y formación musical de la Asociación Triskell"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
                    <Building2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-3" />
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      App Actriskell · Centro de Actividades
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Capabilities (Asymmetric Bento Grid) */}
        <section
          id="funcionalidades"
          className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance">
                Herramientas diseñadas para la gestión diaria de la asociación
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Cada módulo responde a las necesidades reales de monitores, alumnos y junta directiva sin hojas de cálculo dispersas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Featured Wide Card */}
              <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      01. Asistencia y cobros en clase
                    </span>
                    <CalendarCheck2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Control directo por sesión para monitores
                  </h3>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                    Al inicio o cierre de cada taller, el monitor selecciona su actividad y registra con un clic la asistencia completa o parcial de los alumnos inscritos, anotando pagos completos o parciales según modalidad mensual o por clase, con soporte para efectivo, transferencia o Bizum.
                  </p>
                </div>
                <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span>Pago mensual o por sesión</span>
                  <span aria-hidden="true">·</span>
                  <span>Cobros parciales</span>
                  <span aria-hidden="true">·</span>
                  <span>Recibos automáticos</span>
                </div>
              </div>

              {/* Narrow Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      02. Matrículas y socios
                    </span>
                    <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Censo actualizado
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Directorio de socios activos, inscripciones múltiples por taller, tarifas personalizadas y seguimiento claro de cuotas pendientes o abonadas.
                  </p>
                </div>
              </div>

              {/* Narrow Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      03. Contabilidad
                    </span>
                    <WalletCards className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Liquidaciones y gastos
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Cálculo automático de honorarios por clase impartida, sueldo fijo o porcentaje sobre cuotas, descontando cobros recibidos en mano y registrando gastos del local.
                  </p>
                </div>
              </div>

              {/* Wide Card */}
              <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      04. Privacidad y acceso seguro
                    </span>
                    <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    Lista blanca controlada por administración
                  </h3>
                  <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                    La plataforma no permite el autoregistro público de desconocidos. Solo las personas dadas de alta por la administración de la asociación pueden acceder mediante Google OAuth o correo y contraseña, recibiendo únicamente los permisos de su rol.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Role Portals */}
        <section id="portales" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white text-balance">
              Tres espacios diferenciados según el perfil de cada miembro
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                Coordinación y Administración
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Panel de Dirección
              </h3>
              <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Balance financiero mensual, alta de usuarios y roles, gestión de gastos operativos, exportación CSV y configuración global de avisos y calendarios.
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                Profesorado y Monitores
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Portal del Monitor
              </h3>
              <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Acceso exclusivo a sus propios talleres y grupos inscritos, creación de sesiones, paso de lista, cobros directos y consulta de su liquidación mensual.
              </p>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                Socios y Alumnos
              </p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Portal del Alumno
              </h3>
              <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Consulta rápida de sus actividades asignadas, horarios de asistencia, calendario semanal, notas de la asociación e histórico personal de recibos.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Data Transparency & CTA */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Uso transparente de Google OAuth y protección de datos
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Cuando accedes con tu cuenta de Google, App Actriskell solicita únicamente tu nombre y dirección de correo electrónico para verificar tu pertenencia a la asociación e identificarte de forma segura. Nunca cedemos ni compartimos tus datos con terceros.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold">
                <a
                  href="/privacidad"
                  onClick={(e) => handleLinkClick(e, '/privacidad')}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline underline-offset-4"
                >
                  Leer Política de Privacidad completa
                </a>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">/</span>
                <a
                  href="/condiciones"
                  onClick={(e) => handleLinkClick(e, '/condiciones')}
                  className="text-emerald-700 dark:text-emerald-400 hover:underline underline-offset-4"
                >
                  Leer Condiciones del Servicio
                </a>
              </div>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={onSignIn}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-6 py-3 text-sm font-bold transition-all shadow-md shadow-emerald-600/20 min-h-[44px] whitespace-nowrap"
              >
                <span>Iniciar sesión</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer with mandatory OAuth verification links */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">App Actriskell</span>
            <span aria-hidden="true">·</span>
            <span>A.C. Triskell</span>
            <span aria-hidden="true">·</span>
            <span>cristino.conde@actriskell.org</span>
          </div>

          <div className="flex items-center gap-5 font-medium">
            <a
              href="/privacidad"
              onClick={(e) => handleLinkClick(e, '/privacidad')}
              className="hover:text-slate-900 dark:hover:text-white underline underline-offset-4 transition-colors"
            >
              Política de Privacidad
            </a>
            <a
              href="/condiciones"
              onClick={(e) => handleLinkClick(e, '/condiciones')}
              className="hover:text-slate-900 dark:hover:text-white underline underline-offset-4 transition-colors"
            >
              Condiciones del Servicio
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
