import React, { useState } from 'react';
import { AppProvider, useApp, TeacherFinancialSummary } from './context/AppContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { PaymentsView } from './components/PaymentsView';
import { TeachersView } from './components/TeachersView';
import { ActivitiesView } from './components/ActivitiesView';
import { ExpensesView } from './components/ExpensesView';
import { TeacherPortalView } from './components/TeacherPortalView';
import { StudentPortalView } from './components/StudentPortalView';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { RecordTeacherPayoutModal } from './components/RecordTeacherPayoutModal';
import { AddStudentModal } from './components/AddStudentModal';
import { AddTeacherModal } from './components/AddTeacherModal';
import { AddActivityModal } from './components/AddActivityModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddSessionModal } from './components/AddSessionModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PaymentRecord, Student, Teacher, Activity } from './types';

const MainAppContent: React.FC = () => {
  const { currentRole, currentTeacherId, teachers, isAuthModalOpen, setIsAuthModalOpen } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isSupabaseConfigOpen, setIsSupabaseConfigOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-200">
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenRecordPayment={() => handleOpenRecordPayment()}
        onOpenAddStudent={() => handleOpenAddStudent()}
        onOpenAddTeacher={() => handleOpenAddTeacher()}
        onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        onOpenAddSession={() => handleOpenAddSession()}
        onOpenSupabaseModal={() => setIsSupabaseConfigOpen(true)}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            onOpenRecordPayment={handleOpenRecordPayment}
            onOpenAddSession={handleOpenAddSession}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'payments' && (
          <PaymentsView
            onOpenRecordPayment={handleOpenRecordPayment}
            onOpenAddStudent={() => handleOpenAddStudent()}
          />
        )}

        {currentTab === 'teachers' && (
          <TeachersView
            onOpenTeacherPayout={handleOpenTeacherPayout}
            onOpenAddTeacher={handleOpenAddTeacher}
            onOpenAddSession={handleOpenAddSession}
          />
        )}

        {currentTab === 'activities' && (
          <ActivitiesView
            onOpenAddActivity={handleOpenAddActivity}
            onOpenAddStudent={() => handleOpenAddStudent()}
          />
        )}

        {currentTab === 'expenses' && (
          <ExpensesView
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          />
        )}

        {currentTab === 'teacher-portal' && (
          <TeacherPortalView
            onOpenAddSession={handleOpenAddSession}
            onOpenRecordPayment={() => handleOpenRecordPayment()}
          />
        )}

        {currentTab === 'student-portal' && (
          <StudentPortalView />
        )}
      </main>

      {/* Pie de página sutil */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 no-print">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="font-extrabold tracking-tight text-slate-800 dark:text-slate-200">
            TRISKELL
          </span>
          <span>·</span>
          <span>Control de Pagos y Liquidaciones</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Diseñado para centros de actividades, academias y asociaciones. Cálculos automáticos y exportación de datos.
        </p>
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
