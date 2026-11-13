import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppProvider, useApp, TeacherFinancialSummary } from './context/AppContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PaymentsView } from './components/PaymentsView';
import { TeachersView } from './components/TeachersView';
import { ActivitiesView } from './components/ActivitiesView';
import { ExpensesView } from './components/ExpensesView';
import { TeacherPortalView } from './components/TeacherPortalView';
import { TeacherPayoutsView } from './components/TeacherPayoutsView';
import { StudentPortalView } from './components/StudentPortalView';
import { ProfileView } from './components/ProfileView';
import { CalendarView } from './components/CalendarView';
import { AdminConfigView } from './components/AdminConfigView';
import { AdminUsersView } from './components/AdminUsersView';
import { SplashScreen } from './components/SplashScreen';
import { SignInScreen } from './components/SignInScreen';
import { LandingPage } from './components/LandingPage';
import { PrivacyPolicyPage, TermsOfServicePage } from './components/LegalPages';
import { ConditionalNotificationModal } from './components/ConditionalNotificationModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { RecordTeacherPayoutModal } from './components/RecordTeacherPayoutModal';
import { AddStudentModal } from './components/AddStudentModal';
import { AddTeacherModal } from './components/AddTeacherModal';
import { AddActivityModal } from './components/AddActivityModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddSessionModal } from './components/AddSessionModal';
import { EnrollStudentModal } from './components/EnrollStudentModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { UserManagementModal } from './components/UserManagementModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PaymentRecord, Student, Teacher, Activity } from './types';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    currentRole,
    currentTeacherId,
    teachers,
    isAuthModalOpen,
    setIsAuthModalOpen,
    dbError,
    clearDbError,
    refreshFromSupabase,
    isLoadingDb,
    currentUser,
    appConfigs
  } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  // Estados de modales
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentRecord | null>(null);

  const [isTeacherPayoutOpen, setIsTeacherPayoutOpen] = useState(false);
  const [payoutSummary, setPayoutSummary] = useState<TeacherFinancialSummary | null>(null);

  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [sessionTeacherId, setSessionTeacherId] = useState<string | undefined>(undefined);

  const [isEnrollStudentOpen, setIsEnrollStudentOpen] = useState(false);
  const [enrollActivityId, setEnrollActivityId] = useState<string | undefined>(undefined);

  // Enrutamiento público por pathname (/ , /privacidad , /condiciones , /login)
  const normalizePath = (raw: string) => {
    if (!raw || raw === '/') return '/';
    return raw.endsWith('/') ? raw.slice(0, -1) : raw;
  };

  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePath(window.location.pathname)
  );

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateTo = (path: string) => {
    const normalized = normalizePath(path);
    if (normalizePath(window.location.pathname) !== normalized) {
      window.history.pushState({}, '', normalized);
    }
    setCurrentPath(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Estado para la Splash Screen (solo cuando hay sesión activa)
  const [showSplash, setShowSplash] = useState(true);

  // Estado para el Comunicado Emergente condicional (app_config.popup_notification)
  const [isConditionalPopupOpen, setIsConditionalPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  // Finalizar splash screen y comprobar pop-up
  const handleSplashFinish = () => {
    setShowSplash(false);
    // Verificar si hay comunicado activo en app_config
    const popupCfg = appConfigs.find(c => c.config_key === 'popup_notification');
    if (popupCfg && popupCfg.is_active && popupCfg.config_value) {
      try {
        const isDismissed = sessionStorage.getItem('triskell_popup_dismissed');
        if (!isDismissed) {
          setPopupMessage(popupCfg.config_value);
          setIsConditionalPopupOpen(true);
        }
      } catch {
        setPopupMessage(popupCfg.config_value);
        setIsConditionalPopupOpen(true);
      }
    }
  };

  // Gestos táctiles de deslizamiento horizontal (Swipe izquierda / derecha) entre pestañas
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const availableTabsForRole = useMemo(() => {
    switch (currentRole) {
      case 'admin':
        return ['dashboard', 'admin-users', 'calendar', 'payments', 'teachers', 'activities', 'expenses', 'admin-config', 'teacher-portal', 'student-portal', 'profile'];
      case 'teacher':
        return ['teacher-portal', 'calendar', 'activities', 'teacher-payouts', 'profile'];
      case 'student':
        return ['student-portal', 'calendar', 'activities', 'profile'];
      case 'teacher_student':
        return ['teacher-portal', 'student-portal', 'calendar', 'activities', 'profile'];
      default:
        return ['dashboard', 'calendar', 'profile'];
    }
  }, [currentRole]);

  useEffect(() => {
    if (!availableTabsForRole.includes(currentTab)) {
      setCurrentTab(availableTabsForRole[0]);
    }
  }, [availableTabsForRole, currentTab]);

  // Redirigir automáticamente al Portal correspondiente al iniciar sesión
  const lastAuthUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentUser) {
      lastAuthUserIdRef.current = null;
      return;
    }

    if (lastAuthUserIdRef.current !== currentUser.id) {
      lastAuthUserIdRef.current = currentUser.id;
      const defaultPortalTab =
        currentUser.role === 'admin'
          ? 'dashboard'
          : currentUser.role === 'student'
          ? 'student-portal'
          : 'teacher-portal';
      setCurrentTab(defaultPortalTab);
      if (currentPath === '/login') {
        navigateTo('/');
      }
    }
  }, [currentUser, currentPath]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Detectar swipe horizontal mínimo de 60px y dominante sobre el eje vertical
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      const currentIndex = availableTabsForRole.indexOf(currentTab);
      if (currentIndex !== -1) {
        if (deltaX < 0) {
          // Deslizar izquierda -> Pestaña siguiente
          const nextIndex = (currentIndex + 1) % availableTabsForRole.length;
          setCurrentTab(availableTabsForRole[nextIndex]);
        } else {
          // Deslizar derecha -> Pestaña anterior
          const prevIndex = (currentIndex - 1 + availableTabsForRole.length) % availableTabsForRole.length;
          setCurrentTab(availableTabsForRole[prevIndex]);
        }
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Handlers para abrir modales
  const handleOpenRecordPayment = (payment?: PaymentRecord) => {
    setEditingPayment(payment || null);
    setIsRecordPaymentOpen(true);
  };

  const handleOpenTeacherPayout = (summary: TeacherFinancialSummary) => {
    setPayoutSummary(summary);
    setIsTeacherPayoutOpen(true);
  };

  const handleOpenAddStudent = (student?: Student) => {
    setEditingStudent(student || null);
    setIsAddStudentOpen(true);
  };

  const handleOpenAddTeacher = (teacher?: Teacher) => {
    setEditingTeacher(teacher || null);
    setIsAddTeacherOpen(true);
  };

  const handleOpenAddActivity = (activity?: Activity) => {
    setEditingActivity(activity || null);
    setIsAddActivityOpen(true);
  };

  const handleOpenAddSession = (teacherId?: string) => {
    setSessionTeacherId(teacherId || (currentRole === 'teacher' ? currentTeacherId : undefined));
    setIsAddSessionOpen(true);
  };

  // Rutas legales públicas accesibles siempre sin autenticación ni splash screen
  if (currentPath === '/privacidad') {
    return (
      <PrivacyPolicyPage
        onNavigate={navigateTo}
        onSignIn={() => navigateTo(currentUser ? '/' : '/login')}
      />
    );
  }

  if (currentPath === '/condiciones') {
    return (
      <TermsOfServicePage
        onNavigate={navigateTo}
        onSignIn={() => navigateTo(currentUser ? '/' : '/login')}
      />
    );
  }

  // Si no hay usuario autenticado: servir Landing Pública en / o SignInScreen en /login
  if (!currentUser) {
    if (currentPath === '/login') {
      return (
        <SignInScreen
          onNavigate={navigateTo}
          onSuccess={() => navigateTo('/')}
        />
      );
    }

    return (
      <LandingPage
        onNavigate={navigateTo}
        onSignIn={() => navigateTo('/login')}
      />
    );
  }

  // Renderizar Splash Screen al iniciar sesión autenticada
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <div
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenRecordPayment={() => handleOpenRecordPayment()}
        onOpenAddStudent={() => handleOpenAddStudent()}
        onOpenAddTeacher={() => handleOpenAddTeacher()}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenAddSession={() => handleOpenAddSession()}
        onOpenSupabaseModal={() => setIsSupabaseConfigOpen(true)}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {/* Banner de Errores de Base de Datos y Permisos RLS */}
        {dbError && (
          <div className="mb-4 rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50/95 dark:bg-rose-950/80 p-4 text-xs shadow-lg backdrop-blur-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-3 text-rose-800 dark:text-rose-200">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div>
                <p className="font-bold text-sm">Aviso de Base de Datos Supabase / RLS</p>
                <p className="mt-0.5 leading-relaxed">{dbError}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 transition text-xs shadow-xs"
              >
                Autenticar en Supabase
              </button>
              <button
                type="button"
                onClick={clearDbError}
                className="rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold px-3 py-1.5 transition text-xs hover:bg-rose-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
        {currentTab === 'dashboard' && availableTabsForRole.includes('dashboard') && (
          <DashboardView
            onOpenRecordPayment={handleOpenRecordPayment}
            onOpenAddSession={handleOpenAddSession}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'payments' && availableTabsForRole.includes('payments') && (
          <PaymentsView
            onOpenRecordPayment={handleOpenRecordPayment}
            onOpenAddStudent={() => handleOpenAddStudent()}
          />
        )}

        {currentTab === 'teachers' && availableTabsForRole.includes('teachers') && (
          <TeachersView
            onOpenTeacherPayout={handleOpenTeacherPayout}
            onOpenAddTeacher={handleOpenAddTeacher}
            onOpenAddSession={handleOpenAddSession}
          />
        )}

        {currentTab === 'activities' && availableTabsForRole.includes('activities') && (
          <ActivitiesView
            onOpenAddActivity={handleOpenAddActivity}
            onOpenAddStudent={() => handleOpenAddStudent()}
            onOpenEnrollStudent={(activityId?: string) => {
              setEnrollActivityId(activityId);
              setIsEnrollStudentOpen(true);
            }}
          />
        )}

        {currentTab === 'expenses' && availableTabsForRole.includes('expenses') && (
          <ExpensesView
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          />
        )}

        {currentTab === 'teacher-portal' && availableTabsForRole.includes('teacher-portal') && (
          <TeacherPortalView
            onOpenAddSession={handleOpenAddSession}
            onOpenRecordPayment={() => handleOpenRecordPayment()}
            onOpenAddActivity={(activity?: Activity) => handleOpenAddActivity(activity)}
            onOpenAddStudent={() => handleOpenAddStudent()}
            onOpenEnrollStudent={(activityId?: string) => {
              setEnrollActivityId(activityId);
              setIsEnrollStudentOpen(true);
            }}
            onNavigateToProfile={() => setCurrentTab('profile')}
          />
        )}

        {currentTab === 'teacher-payouts' && availableTabsForRole.includes('teacher-payouts') && (
          <TeacherPayoutsView />
        )}

        {currentTab === 'student-portal' && availableTabsForRole.includes('student-portal') && (
          <StudentPortalView />
        )}

        {currentTab === 'calendar' && availableTabsForRole.includes('calendar') && (
          <CalendarView
            onOpenAddSession={handleOpenAddSession}
            onNavigateToActivities={() => setCurrentTab('activities')}
          />
        )}

        {currentTab === 'admin-config' && availableTabsForRole.includes('admin-config') && (
          <AdminConfigView />
        )}

        {currentTab === 'admin-users' && availableTabsForRole.includes('admin-users') && (
          <AdminUsersView
            onOpenAddStudent={handleOpenAddStudent}
            onOpenAddTeacher={handleOpenAddTeacher}
            onOpenEnrollStudent={(activityId?: string) => {
              setEnrollActivityId(activityId);
              setIsEnrollStudentOpen(true);
            }}
          />
        )}

        {currentTab === 'profile' && availableTabsForRole.includes('profile') && (
          <ProfileView
            onNavigate={navigateTo}
            onNavigateToTab={setCurrentTab}
          />
        )}
      </main>

      {/* Pie de página sutil */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-4 pb-16 md:pb-6 text-center text-xs text-slate-500 dark:text-slate-400 no-print">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="font-extrabold tracking-tight text-slate-800 dark:text-slate-200">
            A.C.TRISKELL
          </span>
          <span>·</span>
          <span>Control de Pagos y Liquidaciones</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Diseñado para centros de actividades, academias y asociaciones. Cálculos automáticos y exportación de datos.
        </p>
        <div className="mt-2 flex items-center justify-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <a
            href="/privacidad"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/privacidad');
            }}
            className="hover:text-slate-900 dark:hover:text-white underline underline-offset-4"
          >
            Política de Privacidad
          </a>
          <span aria-hidden="true">·</span>
          <a
            href="/condiciones"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/condiciones');
            }}
            className="hover:text-slate-900 dark:hover:text-white underline underline-offset-4"
          >
            Condiciones del Servicio
          </a>
        </div>
      </footer>

      {/* Modales */}

      {isRecordPaymentOpen && (
        <RecordPaymentModal
          isOpen={isRecordPaymentOpen}
          onClose={() => {
            setIsRecordPaymentOpen(false);
            setEditingPayment(null);
          }}
          initialPayment={editingPayment}
        />
      )}

      {isTeacherPayoutOpen && (
        <RecordTeacherPayoutModal
          summary={payoutSummary}
          onClose={() => {
            setIsTeacherPayoutOpen(false);
            setPayoutSummary(null);
          }}
        />
      )}

      {isAddStudentOpen && (
        <AddStudentModal
          isOpen={isAddStudentOpen}
          onClose={() => {
            setIsAddStudentOpen(false);
            setEditingStudent(null);
          }}
          studentToEdit={editingStudent}
        />
      )}

      {isAddTeacherOpen && (
        <AddTeacherModal
          isOpen={isAddTeacherOpen}
          onClose={() => {
            setIsAddTeacherOpen(false);
            setEditingTeacher(null);
          }}
          teacherToEdit={editingTeacher}
        />
      )}

      {isAddActivityOpen && (
        <AddActivityModal
          isOpen={isAddActivityOpen}
          onClose={() => {
            setIsAddActivityOpen(false);
            setEditingActivity(null);
          }}
          activityToEdit={editingActivity}
          defaultTeacherId={currentRole !== 'admin' ? currentTeacherId : undefined}
          lockTeacherSelection={currentRole !== 'admin'}
        />
      )}

      {isAddExpenseOpen && (
        <AddExpenseModal
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
        />
      )}

      {isAddSessionOpen && (
        <AddSessionModal
          isOpen={isAddSessionOpen}
          onClose={() => {
            setIsAddSessionOpen(false);
            setSessionTeacherId(undefined);
          }}
          defaultTeacherId={sessionTeacherId}
        />
      )}

      {isEnrollStudentOpen && (
        <EnrollStudentModal
          isOpen={isEnrollStudentOpen}
          onClose={() => {
            setIsEnrollStudentOpen(false);
            setEnrollActivityId(undefined);
          }}
          initialActivityId={enrollActivityId}
          allowedTeacherId={currentRole === 'teacher' ? currentTeacherId : undefined}
        />
      )}

      {isSupabaseConfigOpen && (
        <SupabaseConfigModal
          isOpen={isSupabaseConfigOpen}
          onClose={() => setIsSupabaseConfigOpen(false)}
        />
      )}

      {/* Modal de Autenticación con Google */}
      <GoogleAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Modal de Gestión de Usuarios y Accesos para el Administrador */}
      {isUserManagementOpen && (
        <UserManagementModal
          isOpen={isUserManagementOpen}
          onClose={() => setIsUserManagementOpen(false)}
        />
      )}

      {/* Pop-up de Comunicado Condicional tras Splash Screen */}
      <ConditionalNotificationModal
        isOpen={isConditionalPopupOpen}
        onClose={() => setIsConditionalPopupOpen(false)}
        message={popupMessage}
      />

      {/* Barra de Navegación Inferior Nativa en Móviles */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenRecordPayment={() => handleOpenRecordPayment()}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
