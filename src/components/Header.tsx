import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Plus,
  Download,
  RotateCcw,
  UserCheck,
  Building,
  GraduationCap,
  Sparkles,
  Calendar,
  Database
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenRecordPayment: () => void;
  onOpenAddStudent: () => void;
  onOpenAddTeacher: () => void;
  onOpenAddExpense: () => void;
  onOpenAddSession: () => void;
  onOpenSupabaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenRecordPayment,
  onOpenAddStudent,
  onOpenAddTeacher,
  onOpenAddExpense,
  onOpenAddSession,
  onOpenSupabaseModal
}) => {
  const {
    selectedPeriod,
    goToPrevPeriod,
    goToNextPeriod,
    goToCurrentPeriod,
    currentRole,
    setCurrentRole,
    teachers,
    currentTeacherId,
    setCurrentTeacherId,
    currentUser,
    setIsAuthModalOpen,
    isDarkMode,
    toggleDarkMode,
    exportToCSV,
    resetToInitialData,
    isLoadingDb
  } = useApp();

  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Formato legible del mes (ej. Noviembre 2026)
  const formatPeriodName = (periodStr: string) => {
    const [y, m] = periodStr.split('-');
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
  };

  const currentTeacher = teachers.find(t => t.id === currentTeacherId);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      {/* Barra principal superior */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Marca Triskell */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-700/20 font-black text-xl">
              🌀
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  TRISKELL
                </span>
                <span className="hidden sm:inline-block rounded-md bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/50">
                  Control de Pagos
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Gestión de Alumnos, Honorarios de Monitores y Gastos
              </p>
            </div>
          </div>

          {/* Navegador de Mes / Período */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-1 shadow-xs">
            <button
              onClick={goToPrevPeriod}
              title="Mes anterior"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5 px-2">
              <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[110px] text-center">
                {formatPeriodName(selectedPeriod)}
              </span>
            </div>

            <button
              onClick={goToNextPeriod}
              title="Mes siguiente"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Acciones de la derecha */}
          <div className="flex items-center gap-2">
            {/* Selector de Rol simulado con 4 opciones */}
            <div className="hidden lg:flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-medium">
              <button
                onClick={() => {
                  setCurrentRole('admin');
                  setCurrentTab('dashboard');
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition ${
                  currentRole === 'admin'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building className="h-3.5 w-3.5 text-emerald-600" />
                <span>Coordinador</span>
              </button>

              <button
                onClick={() => {
                  setCurrentRole('teacher');
                  setCurrentTab('teacher-portal');
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition ${
                  currentRole === 'teacher'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                <span>Monitor</span>
              </button>

              <button
                onClick={() => {
                  setCurrentRole('student');
                  setCurrentTab('student-portal');
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition ${
                  currentRole === 'student'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>🎒</span>
                <span>Alumno</span>
              </button>

              <button
                onClick={() => {
                  setCurrentRole('teacher_student');
                  setCurrentTab('teacher-portal');
                }}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition ${
                  currentRole === 'teacher_student'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>⭐</span>
                <span>Monitor-Alumno</span>
              </button>
            </div>

            {/* Si está en rol profesor, permitir elegir cuál */}
            {currentRole === 'teacher' && (
              <select
                value={currentTeacherId}
                onChange={e => setCurrentTeacherId(e.target.value)}
                className="hidden md:block rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}

            {/* Menú Nuevo Registro */}
            <div className="relative">
              <button
                onClick={() => setShowNewMenu(!showNewMenu)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-emerald-700/20 hover:bg-emerald-700 transition"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nuevo</span>
              </button>

              {showNewMenu && (
                <div
                  onMouseLeave={() => setShowNewMenu(false)}
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 text-xs"
                >
                  <button
                    onClick={() => {
                      setShowNewMenu(false);
                      onOpenRecordPayment();
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 flex items-center gap-2"
                  >
                    <span>💳</span>
                    <span className="font-medium">Registrar Pago / Cuota</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowNewMenu(false);
                      onOpenAddStudent();
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 flex items-center gap-2"
                  >
                    <span>👤</span>
                    <span className="font-medium">Inscribir Alumno</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowNewMenu(false);
                      onOpenAddSession();
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 flex items-center gap-2"
                  >
                    <span>📅</span>
                    <span className="font-medium">Anotar Clase Impartida</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowNewMenu(false);
                      onOpenAddExpense();
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 flex items-center gap-2"
                  >
                    <span>🧾</span>
                    <span className="font-medium">Registrar Gasto del Centro</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowNewMenu(false);
                      onOpenAddTeacher();
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                  >
                    <span>🎓</span>
                    <span className="font-medium">Alta de Monitor</span>
                  </button>
                </div>
              )}
            </div>

            {/* Exportar CSV */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                title="Exportar datos a CSV"
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 transition"
              >
                <Download className="h-4 w-4" />
              </button>

              {showExportMenu && (
                <div
                  onMouseLeave={() => setShowExportMenu(false)}
                  className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 text-xs"
                >
                  <div className="px-3 py-1 font-semibold text-slate-400 uppercase text-[10px]">
                    Exportar a Excel / CSV
                  </div>
                  <button
                    onClick={() => {
                      exportToCSV('payments');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Pagos del Mes ({selectedPeriod})
                  </button>
                  <button
                    onClick={() => {
                      exportToCSV('students');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Censo de Alumnos
                  </button>
                  <button
                    onClick={() => {
                      exportToCSV('expenses');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Gastos del Centro
                  </button>
                  <button
                    onClick={() => {
                      exportToCSV('teachers');
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Listado de Monitores
                  </button>
                </div>
              )}
            </div>

            {/* Base de Datos / Supabase Cloud */}
            <button
              onClick={onOpenSupabaseModal}
              title="Base de Datos en Tiempo Real (Supabase Cloud)"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition"
            >
              <Database className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${isLoadingDb ? 'animate-pulse' : ''}`} />
              <span className="hidden xl:inline text-[11px] font-bold">Supabase Cloud</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
            </button>

            {/* Botón de Cuenta de Google */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              title={currentUser ? `Conectado como ${currentUser.name}` : 'Acceder con Google'}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.name}
                  className="h-4 w-4 rounded-full object-cover border border-emerald-500"
                />
              ) : (
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span className="hidden sm:inline text-[11px] font-bold">
                {currentUser ? currentUser.name.split(' ')[0] : 'Entrar'}
              </span>
            </button>

            {/* Toggle Modo Oscuro */}
            <button
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 transition"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Reset data */}
            <button
              onClick={() => {
                if (window.confirm('¿Restablecer los datos de ejemplo iniciales de Triskell?')) {
                  resetToInitialData();
                }
              }}
              title="Restablecer datos de ejemplo"
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación Dinámicas según Rol */}
        <nav className="hidden md:flex space-x-1 sm:space-x-4 border-t border-slate-200/60 dark:border-slate-800/60 py-2.5 overflow-x-auto text-xs font-semibold">
          {/* Pestañas de Administrador / Coordinador */}
          {currentRole === 'admin' && (
            <>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  currentTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                📊 Balance & Resumen
              </button>

              <button
                onClick={() => setCurrentTab('payments')}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  currentTab === 'payments'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                💳 Cobros a Alumnos
              </button>

              <button
                onClick={() => setCurrentTab('teachers')}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  currentTab === 'teachers'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                🎓 Monitores & Liquidaciones
              </button>

              <button
                onClick={() => setCurrentTab('activities')}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  currentTab === 'activities'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                🧘 Actividades & Horarios
              </button>

              <button
                onClick={() => setCurrentTab('expenses')}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  currentTab === 'expenses'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                🧾 Gastos del Centro
              </button>

              <button
                onClick={() => setCurrentTab('teacher-portal')}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  currentTab === 'teacher-portal'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                }`}
              >
                👤 Vista Monitor
              </button>

              <button
                onClick={() => setCurrentTab('student-portal')}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  currentTab === 'student-portal'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                🎒 Vista Alumno
              </button>
            </>
          )}

          {/* Pestañas de Monitor */}
          {currentRole === 'teacher' && (
            <>
              <button
                onClick={() => setCurrentTab('teacher-portal')}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  currentTab === 'teacher-portal'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                👤 Mi Panel de Monitor (Clases, Alumnos y Liquidación)
              </button>

              <button
                onClick={() => setCurrentTab('activities')}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  currentTab === 'activities'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                🧘 Actividades Asignadas
              </button>
            </>
          )}

          {/* Pestañas de Alumno */}
          {currentRole === 'student' && (
            <button
              onClick={() => setCurrentTab('student-portal')}
              className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                currentTab === 'student-portal'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🎒 Mi Portal de Alumno (Mis Clases, Cuotas y Recibos)
            </button>
          )}

          {/* Pestañas de Monitor-Alumno (Híbrido) */}
          {currentRole === 'teacher_student' && (
            <>
              <button
                onClick={() => setCurrentTab('teacher-portal')}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  currentTab === 'teacher-portal'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                👤 Mi Labor como Monitor
              </button>

              <button
                onClick={() => setCurrentTab('student-portal')}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  currentTab === 'student-portal'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                🎒 Mis Clases como Alumno
              </button>

              <button
                onClick={() => setCurrentTab('activities')}
                className={`rounded-lg px-3 py-1.5 transition whitespace-nowrap ${
                  currentTab === 'activities'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                🧘 Catálogo de Actividades
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
