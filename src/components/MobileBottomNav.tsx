import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  CreditCard,
  GraduationCap,
  Sparkles,
  User,
  Plus,
  BookOpen,
  Calendar,
  DollarSign
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenRecordPayment: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  onOpenRecordPayment
}) => {
  const { periodPayments, currentRole, currentUser, setIsAuthModalOpen } = useApp();

  const pendingCount = periodPayments.filter(p => p.status === 'pending' || p.status === 'overdue').length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] shadow-lg no-print">
      <div className="flex h-16 items-center justify-around px-2">
        {/* ROL: ADMINISTRADOR */}
        {currentRole === 'admin' && (
          <>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors min-h-[44px] ${
                currentTab === 'dashboard'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="text-[10px] mt-1 tracking-tight">Inicio</span>
            </button>

            <button
              onClick={() => setCurrentTab('payments')}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-colors min-h-[44px] ${
                currentTab === 'payments'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-[10px] mt-1 tracking-tight">Cuotas</span>
              {pendingCount > 0 && (
                <span className="absolute top-1 right-3 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-white shadow-xs">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Botón Central Rápido "+" */}
            <div className="flex items-center justify-center px-1">
              <button
                onClick={onOpenRecordPayment}
                title="Registrar Cobro"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 active:scale-95 transition min-h-[48px] min-w-[48px]"
              >
                <Plus className="h-6 w-6" />
              </button>
            </div>

            <button
              onClick={() => setCurrentTab('teachers')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors min-h-[44px] ${
                currentTab === 'teachers'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <GraduationCap className="h-5 w-5" />
              <span className="text-[10px] mt-1 tracking-tight">Monitores</span>
            </button>
          </>
        )}

        {/* ROL: MONITOR */}
        {currentRole === 'teacher' && (
          <>
            <button
              onClick={() => setCurrentTab('teacher-portal')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors min-h-[44px] ${
                currentTab === 'teacher-portal'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <GraduationCap className="h-5 w-5" />
              <span className="text-[10px] mt-1 tracking-tight">Mi Monitoría</span>
            </button>

            <button
              onClick={() => setCurrentTab('activities')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors min-h-[44px] ${
                currentTab === 'activities'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-[10px] mt-1 tracking-tight">Mis Talleres</span>
            </button>
          </>
        )}

        {/* ROL: ALUMNO */}
        {currentRole === 'student' && (
          <>
            <button
              onClick={() => setCurrentTab('student-portal')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors min-h-[44px] ${
                currentTab === 'student-portal'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-[10px] mt-1 tracking-tight">Mis Cuotas</span>
            </button>

            <button
              onClick={() => setCurrentTab('activities')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors min-h-[44px] ${
                currentTab === 'activities'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-[10px] mt-1 tracking-tight">Talleres</span>
            </button>
          </>
        )}

        {/* ROL: MONITOR-ALUMNO */}
        {currentRole === 'teacher_student' && (
          <>
            <button
              onClick={() => setCurrentTab('teacher-portal')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors min-h-[44px] ${
                currentTab === 'teacher-portal'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <GraduationCap className="h-5 w-5" />
              <span className="text-[10px] mt-1 tracking-tight">Monitor</span>
            </button>

            <button
              onClick={() => setCurrentTab('student-portal')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors min-h-[44px] ${
                currentTab === 'student-portal'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span className="text-[10px] mt-1 tracking-tight">Alumno</span>
            </button>

            <button
              onClick={() => setCurrentTab('activities')}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors min-h-[44px] ${
                currentTab === 'activities'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-[10px] mt-1 tracking-tight">Talleres</span>
            </button>
          </>
        )}

        {/* Perfil / Cuenta (Común a todos) */}
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors min-h-[44px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200`}
        >
          {currentUser?.photoURL ? (
            <img
              src={currentUser.photoURL}
              alt={currentUser.name}
              className="h-5 w-5 rounded-full object-cover border border-emerald-500"
            />
          ) : (
            <User className="h-5 w-5" />
          )}
          <span className="text-[10px] mt-1 tracking-tight truncate max-w-[50px]">
            {currentUser ? currentUser.name.split(' ')[0] : 'Cuenta'}
          </span>
        </button>
      </div>
    </div>
  );
};
