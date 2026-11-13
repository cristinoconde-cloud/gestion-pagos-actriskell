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
  Calendar,
  Database,
  MoreVertical,
  LayoutDashboard,
  CreditCard,
  Sparkles,
  Receipt,
  Settings,
  BookOpen,
  DollarSign,
  User
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
  onOpenUserManagement: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenRecordPayment,
  onOpenAddStudent,
  onOpenAddTeacher,
  onOpenAddExpense,
  onOpenAddSession,
  onOpenSupabaseModal,
  onOpenUserManagement
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
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Estado para el menú desplegable móvil

  const formatPeriodName = (periodStr: string) => {
    const [y, m] = periodStr.split('-');
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ];
    return `${months[parseInt(m, 10) - 1]} ${y}`;
  };

  const currentTeacher = teachers.find(t => t.id === currentTeacherId);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
          
          {/* 1. Logo & Marca Triskell */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-black text-white shadow-md overflow-hidden p-1">
              <img 
                src="/logo.png" 
                alt="Logo Triskell" 
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  A.C.TRISKELL
                </span>
                <span className="hidden md:inline-block rounded-md bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-700/50">
                  Control de Pagos
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden xl:block">
                Gestión de Alumnos, Honorarios de Monitores y Gastos
              </p>
            </div>
          </div>

          {/* 2. Navegador de Mes / Período (Optimizado) */}
          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-0.5 sm:p-1 shadow-xs shrink-0">
            <button
              onClick={goToPrevPeriod}
              title="Mes anterior"
              className="rounded-lg p-1 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1 px-1.5 sm:px-2">
              <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap text-center">
                {formatPeriodName(selectedPeriod)}
              </span>
            </div>

            <button
              onClick={goToNextPeriod}
              title="Mes siguiente"
              className="rounded-lg p-1 text-slate-500 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
{/* 3. Acciones de la derecha */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Botón Nuevo Registro (Escritorio - oculto para alumnos) */}
            {currentRole !== 'student' && (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowNewMenu(!showNewMenu)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-emerald-700/20 hover:bg-emerald-700 transition whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nuevo</span>
                </button>

                {showNewMenu && (
                  <div
                    onMouseLeave={() => setShowNewMenu(false)}
                    className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 text-xs"
                  >
                    <button
                      onClick={() => { setShowNewMenu(false); onOpenRecordPayment(); }}
                      className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 flex items-center gap-2"
                    >
                      <span>💳</span>
                      <span className="font-medium">Registrar Pago / Cuota</span>
                    </button>
                    <button
                      onClick={() => { setShowNewMenu(false); onOpenAddStudent(); }}
                      className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 flex items-center gap-2"
                    >
                      <span>👤</span>
                      <span className="font-medium">Inscribir Alumno</span>
                    </button>
                    <button
                      onClick={() => { setShowNewMenu(false); onOpenAddSession(); }}
                      className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 flex items-center gap-2"
                    >
                      <span>📅</span>
                      <span className="font-medium">Anotar Clase Impartida</span>
                    </button>
                    {currentRole === 'admin' && (
                      <>
                        <button
                          onClick={() => { setShowNewMenu(false); onOpenAddExpense(); }}
                          className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 flex items-center gap-2"
                        >
                          <span>🧾</span>
                          <span className="font-medium">Registrar Gasto del Centro</span>
                        </button>
                        <button
                          onClick={() => { setShowNewMenu(false); onOpenAddTeacher(); }}
                          className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-700 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800"
                        >
                          <span>🎓</span>
                          <span className="font-medium">Alta de Monitor</span>
                        </button>
                        <button
                          onClick={() => { setShowNewMenu(false); onOpenUserManagement(); }}
                          className="w-full text-left rounded-lg px-3 py-2 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 border-t border-indigo-100 dark:border-indigo-900/60 font-semibold"
                        >
                          <span>🛡️</span>
                          <span>Alta de Usuario & Acceso</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Elementos de Escritorio (Exportar, Supabase, Permisos, Usuario) */}
            <div className="hidden md:flex items-center gap-2">
              {currentRole === 'admin' && (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      title="Exportar datos a CSV"
                      className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                        <button onClick={() => { exportToCSV('payments'); setShowExportMenu(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                          Pagos del Mes ({selectedPeriod})
                        </button>
                        <button onClick={() => { exportToCSV('students'); setShowExportMenu(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                          Censo de Alumnos
                        </button>
                        <button onClick={() => { exportToCSV('expenses'); setShowExportMenu(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                          Gastos del Centro
                        </button>
                        <button onClick={() => { exportToCSV('teachers'); setShowExportMenu(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                          Listado de Monitores
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={onOpenSupabaseModal}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 whitespace-nowrap"
                  >
                    <Database className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Supabase</span>
                  </button>

                  <button
                    onClick={onOpenUserManagement}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/20 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 whitespace-nowrap"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Permisos</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setCurrentTab('profile')}
                title="Mi Perfil y Preferencias"
                className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  currentTab === 'profile'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold">
                  {currentUser ? currentUser.name.split(' ')[0] : 'Perfil'}
                </span>
              </button>
            </div>

            {/* Toggle Modo Oscuro (Solo visible en escritorio: hidden md:block) */}
            <button
              onClick={toggleDarkMode}
              title="Cambiar modo oscuro"
              className="hidden md:block rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* --- BOTÓN MENÚ MÓVIL (Tres puntos) - Incluye Modo Oscuro, + Nuevo y demás --- */}
            <div className="relative md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                title="Más opciones"
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {showMobileMenu && (
                <div
                  onMouseLeave={() => setShowMobileMenu(false)}
                  className="absolute right-0 mt-2 w-60 max-h-[80vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 shadow-xl z-50 text-xs flex flex-col gap-0.5"
                >
                  {/* Cambiar Modo Oscuro en Móvil */}
                  <button
                    onClick={() => { toggleDarkMode(); setShowMobileMenu(false); }}
                    className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 font-semibold"
                  >
                    {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
                    <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                  </button>

                  {currentRole !== 'student' && (
                    <>
                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      {/* Sección: Nuevo Registro */}
                      <div className="px-3 py-1 font-semibold text-emerald-600 dark:text-emerald-400 uppercase text-[10px]">
                        + Nuevo Registro
                      </div>
                      <button
                        onClick={() => { setShowMobileMenu(false); onOpenRecordPayment(); }}
                        className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <span>💳</span>
                        <span className="font-medium">Registrar Pago / Cuota</span>
                      </button>
                      <button
                        onClick={() => { setShowMobileMenu(false); onOpenAddStudent(); }}
                        className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <span>👤</span>
                        <span className="font-medium">Inscribir Alumno</span>
                      </button>
                      <button
                        onClick={() => { setShowMobileMenu(false); onOpenAddSession(); }}
                        className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <span>📅</span>
                        <span className="font-medium">Anotar Clase Impartida</span>
                      </button>
                    </>
                  )}

                  {currentRole === 'admin' && (
                    <>
                      <button
                        onClick={() => { setShowMobileMenu(false); onOpenAddExpense(); }}
                        className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <span>🧾</span>
                        <span className="font-medium">Registrar Gasto del Centro</span>
                      </button>
                      <button
                        onClick={() => { setShowMobileMenu(false); onOpenAddTeacher(); }}
                        className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <span>🎓</span>
                        <span className="font-medium">Alta de Monitor</span>
                      </button>
                      <button
                        onClick={() => { setShowMobileMenu(false); onOpenUserManagement(); }}
                        className="w-full text-left rounded-lg px-3 py-2 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2 font-semibold"
                      >
                        <span>🛡️</span>
                        <span>Alta de Usuario & Acceso</span>
                      </button>
                    </>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  {/* Sección: Acciones y Accesos */}
                  <div className="px-3 py-1 font-semibold text-slate-400 uppercase text-[10px]">
                    Acciones y Accesos
                  </div>
                  <button
                    onClick={() => { setIsAuthModalOpen(true); setShowMobileMenu(false); }}
                    className="w-full text-left rounded-lg px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <span>👤</span>
                    <span>{currentUser ? `Conectado: ${currentUser.name.split(' ')[0]}` : 'Acceder con Google'}</span>
                  </button>
                  {currentRole === 'admin' && (
                    <>
                      <button
                        onClick={() => { onOpenSupabaseModal(); setShowMobileMenu(false); }}
                        className="w-full text-left rounded-lg px-3 py-2 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <Database className="h-3.5 w-3.5" />
                        <span>Supabase Cloud</span>
                      </button>
                      <button
                        onClick={() => { onOpenUserManagement(); setShowMobileMenu(false); }}
                        className="w-full text-left rounded-lg px-3 py-2 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        <span>Usuarios & Permisos</span>
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      {/* Sección: Exportar Datos */}
                      <div className="px-3 py-1 font-semibold text-slate-400 uppercase text-[10px]">
                        Exportar Datos
                      </div>
                      <button onClick={() => { exportToCSV('payments'); setShowMobileMenu(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                        Pagos del Mes ({selectedPeriod})
                      </button>
                      <button onClick={() => { exportToCSV('students'); setShowMobileMenu(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                        Censo de Alumnos
                      </button>
                      <button onClick={() => { exportToCSV('expenses'); setShowMobileMenu(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                        Gastos del Centro
                      </button>
                      <button onClick={() => { exportToCSV('teachers'); setShowMobileMenu(false); }} className="w-full text-left rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                        Listado de Monitores
                      </button>

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                      {/* Restablecer datos */}
                      <button
                        onClick={() => {
                          setShowMobileMenu(false);
                          if (window.confirm('¿Restablecer los datos de ejemplo iniciales de Triskell?')) {
                            resetToInitialData();
                          }
                        }}
                        className="w-full text-left rounded-lg px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 flex items-center gap-2"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Restablecer datos</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Reset data (Solo escritorio xl y admin) */}
            {currentRole === 'admin' && (
              <button
                onClick={() => {
                  if (window.confirm('¿Restablecer los datos de ejemplo iniciales de Triskell?')) {
                    resetToInitialData();
                  }
                }}
                title="Restablecer datos"
                className="hidden xl:block rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}

          </div>
          
        </div>

        {/* Pestañas de Navegación Dinámicas según Rol (Ocultas en móvil, usa el menú inferior) */}
        <nav className="hidden md:flex items-center gap-1.5 border-t border-slate-200/60 dark:border-slate-800/60 py-2 overflow-x-auto no-scrollbar text-xs font-semibold">
          {currentRole === 'admin' && (
            <>
              {[
                { id: 'dashboard', label: 'Portal del Administrador', icon: LayoutDashboard },
                { id: 'calendar', label: 'Calendario', icon: Calendar },
                { id: 'payments', label: 'Cuotas y Cobros', icon: CreditCard },
                { id: 'teachers', label: 'Monitores', icon: GraduationCap },
                { id: 'activities', label: 'Clases/Taller', icon: Sparkles },
                { id: 'expenses', label: 'Gastos', icon: Receipt },
                { id: 'admin-config', label: 'Configuración', icon: Settings },
                { id: 'teacher-portal', label: 'Portal Monitor', icon: Building },
                { id: 'student-portal', label: 'Portal Alumno', icon: BookOpen },
                { id: 'profile', label: 'Perfil', icon: User }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCurrentTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 whitespace-nowrap shrink-0 transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </>
          )}

          {currentRole === 'teacher' && (
            <>
              {[
                { id: 'teacher-portal', label: 'Portal', icon: GraduationCap },
                { id: 'calendar', label: 'Calendario', icon: Calendar },
                { id: 'activities', label: 'Clase/Taller', icon: Sparkles },
                { id: 'teacher-payouts', label: 'Mis liquidaciones', icon: DollarSign },
                { id: 'profile', label: 'Perfil', icon: User }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCurrentTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 whitespace-nowrap shrink-0 transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </>
          )}

          {currentRole === 'student' && (
            <>
              {[
                { id: 'student-portal', label: 'Portal', icon: BookOpen },
                { id: 'calendar', label: 'Calendario', icon: Calendar },
                { id: 'activities', label: 'Clases/Taller', icon: Sparkles },
                { id: 'profile', label: 'Perfil', icon: User }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCurrentTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 whitespace-nowrap shrink-0 transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </>
          )}

          {currentRole === 'teacher_student' && (
            <>
              {[
                { id: 'teacher-portal', label: 'Portal Monitor', icon: GraduationCap },
                { id: 'student-portal', label: 'Portal Alumno', icon: BookOpen },
                { id: 'calendar', label: 'Calendario', icon: Calendar },
                { id: 'activities', label: 'Clases/Taller', icon: Sparkles },
                { id: 'profile', label: 'Perfil', icon: User }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setCurrentTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 whitespace-nowrap shrink-0 transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>
      </div>
    </header>
  );
};