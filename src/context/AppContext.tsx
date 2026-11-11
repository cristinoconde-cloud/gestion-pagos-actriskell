import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Teacher,
  Activity,
  Student,
  PaymentRecord,
  TeacherPayout,
  CenterExpense,
  ClassSession,
  UserRole,
  PaymentMethod,
  AuthUser
} from '../types';
import {
  INITIAL_TEACHERS,
  INITIAL_ACTIVITIES,
  INITIAL_STUDENTS,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_SESSIONS,
  INITIAL_PAYOUTS
} from '../data/initialData';

export interface TeacherFinancialSummary {
  teacher: Teacher;
  classesCount: number;
  studentsCount: number;
  grossActivityRevenue: number;
  calculatedDue: number; // lo que le corresponde según su contrato
  collectedInHand: number; // lo que el monitor ya cobró físicamente en mano
  alreadySettled: number; // lo que ya se le pagó/transfirió formalmente este mes
  balanceToPay: number; // saldo pendiente a transferirle (calculado - cobrado en mano - ya pagado)
  status: 'settled' | 'pending' | 'surplus'; // si cobró de más en mano, surplus
}

interface AppContextType {
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  goToPrevPeriod: () => void;
  goToNextPeriod: () => void;
  goToCurrentPeriod: () => void;

  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentTeacherId: string;
  setCurrentTeacherId: (id: string) => void;
  currentStudentId: string;
  setCurrentStudentId: (id: string) => void;

  currentUser: AuthUser | null;
  loginWithGoogle: (userData: {
    name: string;
    email: string;
    photoURL?: string;
    role: UserRole;
    teacherId?: string;
    studentId?: string;
  }) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  isDarkMode: boolean;
  toggleDarkMode: () => void;

  teachers: Teacher[];
  activities: Activity[];
  students: Student[];
  payments: PaymentRecord[];
  expenses: CenterExpense[];
  sessions: ClassSession[];
  payouts: TeacherPayout[];

  // Acciones
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'receiptNumber'> & { id?: string }) => PaymentRecord;
  updatePayment: (id: string, updates: Partial<PaymentRecord>) => void;
  deletePayment: (id: string) => void;
  markPaymentPaid: (id: string, method?: PaymentMethod) => void;

  addStudent: (student: Omit<Student, 'id' | 'registeredAt'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  enrollStudentInActivity: (studentId: string, activityId: string, customPrice?: number) => void;

  addTeacher: (teacher: Omit<Teacher, 'id'>) => void;
  updateTeacher: (id: string, updates: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;
  updateTeacherAvatar: (teacherId: string, avatarUrl: string) => void;

  addActivity: (activity: Omit<Activity, 'id'>) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;

  addExpense: (expense: Omit<CenterExpense, 'id'>) => void;
  deleteExpense: (id: string) => void;

  addClassSession: (session: Omit<ClassSession, 'id'>) => void;
  deleteClassSession: (id: string) => void;
  recordClassPayment: (params: {
    studentId: string;
    activityId: string;
    amount: number;
    isPartial?: boolean;
    paymentMethod?: PaymentMethod;
    date?: string;
    notes?: string;
  }) => PaymentRecord;

  settleTeacherPayout: (
    teacherId: string,
    periodMonth: string,
    amountToPay: number,
    method: PaymentMethod,
    notes?: string
  ) => void;

  resetToInitialData: () => void;
  exportToCSV: (type: 'payments' | 'students' | 'expenses' | 'teachers') => void;

  // Cálculos automáticos del período
  periodPayments: PaymentRecord[];
  totalIncomeCollected: number;
  totalIncomePending: number;
  totalExpenses: number;
  teacherSummaries: TeacherFinancialSummary[];
  totalTeacherCosts: number;
  netMonthlyBalance: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PERIOD: 'triskell_period',
  ROLE: 'triskell_role',
  TEACHER_ID: 'triskell_teacher_id',
  STUDENT_ID: 'triskell_student_id',
  DARK_MODE: 'triskell_dark_mode',
  TEACHERS: 'triskell_teachers',
  ACTIVITIES: 'triskell_activities',
  STUDENTS: 'triskell_students',
  PAYMENTS: 'triskell_payments',
  EXPENSES: 'triskell_expenses',
  SESSIONS: 'triskell_sessions',
  PAYOUTS: 'triskell_payouts',
  AUTH_USER: 'triskell_auth_user'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Cuenta inicial predeterminada de Google para Cristino
    return {
      id: 'usr-google-cristino',
      name: 'Cristino Conde',
      email: 'cristinoconde@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: 'admin',
      provider: 'google',
      lastLogin: new Date().toISOString()
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.PERIOD) || '2026-11';
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'admin';
  });

  const [currentTeacherId, setCurrentTeacherId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.TEACHER_ID) || 't-1';
  });

  const [currentStudentId, setCurrentStudentId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.STUDENT_ID) || 'st-1';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    return saved !== null ? saved === 'true' : false;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEACHERS);
    if (!saved) return INITIAL_TEACHERS;
    try {
      const parsed: Teacher[] = JSON.parse(saved);
      return parsed.map(t => ({
        ...t,
        collectionType: t.collectionType || 'personal'
      }));
    } catch {
      return INITIAL_TEACHERS;
    }
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
    if (!saved) return INITIAL_ACTIVITIES;
    try {
      const parsed: Activity[] = JSON.parse(saved);
      return parsed.map(a => {
        const init = INITIAL_ACTIVITIES.find(ia => ia.id === a.id);
        return {
          ...a,
          bizum_enabled: a.bizum_enabled ?? init?.bizum_enabled ?? false,
          bizum_phone: a.bizum_phone || init?.bizum_phone || '',
          bizum_concept: a.bizum_concept || init?.bizum_concept || a.name,
          billingMode: a.billingMode || init?.billingMode || 'monthly'
        };
      });
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [expenses, setExpenses] = useState<CenterExpense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [sessions, setSessions] = useState<ClassSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [payouts, setPayouts] = useState<TeacherPayout[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PAYOUTS);
    return saved ? JSON.parse(saved) : INITIAL_PAYOUTS;
  });

  // Sincronizar dark mode con class en html tag
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, String(isDarkMode));
  }, [isDarkMode]);

  // Persistir estado en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PERIOD, selectedPeriod);
    localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
    localStorage.setItem(STORAGE_KEYS.TEACHER_ID, currentTeacherId);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    localStorage.setItem(STORAGE_KEYS.PAYOUTS, JSON.stringify(payouts));
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  }, [selectedPeriod, currentRole, currentTeacherId, teachers, activities, students, payments, expenses, sessions, payouts, currentUser]);

  const loginWithGoogle = (userData: {
    name: string;
    email: string;
    photoURL?: string;
    role: UserRole;
    teacherId?: string;
    studentId?: string;
  }) => {
    const newUser: AuthUser = {
      id: `usr-google-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      photoURL: userData.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: userData.role,
      teacherId: userData.teacherId,
      studentId: userData.studentId,
      provider: 'google',
      lastLogin: new Date().toISOString()
    };
    setCurrentUser(newUser);
    setCurrentRole(userData.role);
    if (userData.teacherId) {
      setCurrentTeacherId(userData.teacherId);
    }
    if (userData.studentId) {
      setCurrentStudentId(userData.studentId);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Navegación de períodos mensuales
  const goToPrevPeriod = () => {
    const [year, month] = selectedPeriod.split('-').map(Number);
    const date = new Date(year, month - 2, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedPeriod(`${newY}-${newM}`);
  };

  const goToNextPeriod = () => {
    const [year, month] = selectedPeriod.split('-').map(Number);
    const date = new Date(year, month, 1);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedPeriod(`${newY}-${newM}`);
  };

  const goToCurrentPeriod = () => {
    setSelectedPeriod('2026-11');
  };

  // Acciones de pagos
  const recordPayment = (p: Omit<PaymentRecord, 'id' | 'receiptNumber'> & { id?: string }) => {
    const newId = p.id || `pay-${Date.now()}`;
    const receiptNumber = `REC-${selectedPeriod.replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: PaymentRecord = {
      ...p,
      id: newId,
      receiptNumber
    };
    setPayments(prev => [newRecord, ...prev]);
    return newRecord;
  };

  const updatePayment = (id: string, updates: Partial<PaymentRecord>) => {
    setPayments(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePayment = (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const markPaymentPaid = (id: string, method?: PaymentMethod) => {
    const today = new Date().toISOString().split('T')[0];
    setPayments(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              status: 'paid',
              paymentDate: p.paymentDate || today,
              paymentMethod: method || p.paymentMethod || 'transfer'
            }
          : p
      )
    );
  };

  // Acciones de alumnos
  const addStudent = (studentData: Omit<Student, 'id' | 'registeredAt'>) => {
    const newId = `st-${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const newStudent: Student = {
      ...studentData,
      id: newId,
      registeredAt: today
    };
    setStudents(prev => [newStudent, ...prev]);

    // Generar automáticamente las cuotas iniciales del período actual para este alumno
    newStudent.activities.forEach(actEnroll => {
      const act = activities.find(a => a.id === actEnroll.activityId);
      const amount = actEnroll.customPrice ?? act?.defaultPriceMonthly ?? 45;
      const receiptNumber = `REC-${selectedPeriod.replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      setPayments(prev => [
        {
          id: `pay-${Date.now()}-${actEnroll.activityId}`,
          receiptNumber,
          studentId: newStudent.id,
          studentName: newStudent.name,
          activityId: actEnroll.activityId,
          activityName: act?.name || 'Actividad',
          periodMonth: selectedPeriod,
          amount,
          status: 'pending',
          paymentMethod: 'cash',
          collectedByTeacher: false
        },
        ...prev
      ]);
    });
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
    // Si cambia el nombre, actualizar en los pagos
    if (updates.name) {
      setPayments(prev =>
        prev.map(p => (p.studentId === id ? { ...p, studentName: updates.name! } : p))
      );
    }
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const enrollStudentInActivity = (studentId: string, activityId: string, customPrice?: number) => {
    const act = activities.find(a => a.id === activityId);
    if (!act) return;
    const today = new Date().toISOString().split('T')[0];

    setStudents(prev =>
      prev.map(st => {
        if (st.id !== studentId) return st;
        if (st.activities.some(a => a.activityId === activityId)) return st;
        return {
          ...st,
          activities: [
            ...st.activities,
            {
              activityId,
              customPrice,
              enrolledSince: today,
              billingMode: act.billingMode || 'monthly'
            }
          ]
        };
      })
    );

    if (act.billingMode === 'monthly') {
      const student = students.find(s => s.id === studentId);
      const exists = payments.some(
        p => p.studentId === studentId && p.activityId === activityId && p.periodMonth === selectedPeriod
      );
      if (!exists && student) {
        const amount = customPrice ?? act.defaultPriceMonthly;
        const receiptNumber = `REC-${selectedPeriod.replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
        setPayments(prev => [
          {
            id: `pay-${Date.now()}-${activityId}`,
            receiptNumber,
            studentId,
            studentName: student.name,
            activityId,
            activityName: act.name,
            periodMonth: selectedPeriod,
            amount,
            status: 'pending',
            paymentMethod: 'cash',
            collectedByTeacher: true,
            collectedByTeacherId: act.teacherId
          },
          ...prev
        ]);
      }
    }
  };

  // Acciones de profesores
  const addTeacher = (teacherData: Omit<Teacher, 'id'>) => {
    const newId = `t-${Date.now()}`;
    setTeachers(prev => [...prev, { ...teacherData, id: newId }]);
  };

  const updateTeacher = (id: string, updates: Partial<Teacher>) => {
    setTeachers(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    // Si se actualiza el monitor actual, reflejar también en currentUser
    if (currentUser && (currentUser.teacherId === id || currentTeacherId === id)) {
      if (updates.name || updates.avatar) {
        setCurrentUser(prev =>
          prev
            ? {
                ...prev,
                name: updates.name || prev.name,
                photoURL: updates.avatar || prev.photoURL
              }
            : null
        );
      }
    }
  };

  const updateTeacherAvatar = (teacherId: string, avatarUrl: string) => {
    setTeachers(prev =>
      prev.map(t => (t.id === teacherId ? { ...t, avatar: avatarUrl } : t))
    );
    if (currentUser && (currentUser.teacherId === teacherId || currentTeacherId === teacherId)) {
      setCurrentUser(prev => (prev ? { ...prev, photoURL: avatarUrl } : null));
    }
  };

  const deleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  // Acciones de actividades
  const addActivity = (actData: Omit<Activity, 'id'>) => {
    const newId = `act-${Date.now()}`;
    setActivities(prev => [...prev, { ...actData, id: newId }]);
  };

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    setActivities(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  };

  const deleteActivity = (id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  // Acciones de gastos
  const addExpense = (expData: Omit<CenterExpense, 'id'>) => {
    const newId = `exp-${Date.now()}`;
    setExpenses(prev => [{ ...expData, id: newId }, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Clases impartidas / asistencias
  const addClassSession = (sesData: Omit<ClassSession, 'id'>) => {
    const newId = `ses-${Date.now()}`;
    setSessions(prev => [{ ...sesData, id: newId }, ...prev]);
  };

  const deleteClassSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  const recordClassPayment = (params: {
    studentId: string;
    activityId: string;
    amount: number;
    isPartial?: boolean;
    paymentMethod?: PaymentMethod;
    date?: string;
    notes?: string;
  }) => {
    const student = students.find(s => s.id === params.studentId);
    const act = activities.find(a => a.id === params.activityId);
    const today = params.date || new Date().toISOString().split('T')[0];
    const teacherId = act?.teacherId || currentTeacherId;
    const method = params.paymentMethod || (act?.bizum_enabled ? 'bizum' : 'cash');

    // Comprobar si ya existe un pago pendiente de este alumno para la actividad en el mes
    const existingPending = payments.find(
      p => p.studentId === params.studentId && p.activityId === params.activityId && p.periodMonth === selectedPeriod && p.status !== 'paid'
    );

    if (existingPending) {
      const updatedNotes = params.isPartial
        ? `Pago parcial en clase (${params.amount}€). ${params.notes || ''}`.trim()
        : (params.notes || existingPending.notes || 'Cobrado en clase por monitor');

      const updatedRecord: PaymentRecord = {
        ...existingPending,
        amount: params.amount,
        status: 'paid',
        paymentDate: today,
        paymentMethod: method,
        collectedByTeacher: true,
        collectedByTeacherId: teacherId,
        notes: updatedNotes
      };

      setPayments(prev => prev.map(p => (p.id === existingPending.id ? updatedRecord : p)));
      return updatedRecord;
    } else {
      const receiptNumber = `REC-${selectedPeriod.replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newRecord: PaymentRecord = {
        id: `pay-${Date.now()}`,
        receiptNumber,
        studentId: params.studentId,
        studentName: student?.name || 'Alumno',
        activityId: params.activityId,
        activityName: act?.name || 'Clase',
        periodMonth: selectedPeriod,
        amount: params.amount,
        status: 'paid',
        paymentDate: today,
        paymentMethod: method,
        collectedByTeacher: true,
        collectedByTeacherId: teacherId,
        notes: params.isPartial
          ? `Cobro parcial en clase (${params.amount}€). ${params.notes || ''}`.trim()
          : (params.notes || 'Cobrado en clase por monitor')
      };

      setPayments(prev => [newRecord, ...prev]);
      return newRecord;
    }
  };

  // Liquidación formal de honorarios a profesor
  const settleTeacherPayout = (
    teacherId: string,
    periodMonth: string,
    amountToPay: number,
    method: PaymentMethod,
    notes?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newPayout: TeacherPayout = {
      id: `payout-${Date.now()}`,
      teacherId,
      periodMonth,
      calculatedAmount: amountToPay,
      classesCount: sessions.filter(s => s.teacherId === teacherId && s.date.startsWith(periodMonth)).length,
      studentsCount: students.filter(st =>
        st.activities.some(act => activities.find(a => a.id === act.activityId)?.teacherId === teacherId)
      ).length,
      collectedInHandByTeacher: 0,
      balancePending: 0,
      totalSettled: amountToPay,
      status: 'settled',
      settledDate: today,
      paymentMethod: method,
      notes: notes || 'Liquidación mensual completada'
    };
    setPayouts(prev => [newPayout, ...prev]);
  };

  // Restablecer datos
  const resetToInitialData = () => {
    localStorage.clear();
    setSelectedPeriod('2026-11');
    setCurrentRole('admin');
    setCurrentTeacherId('t-1');
    setIsDarkMode(false);
    setTeachers(INITIAL_TEACHERS);
    setActivities(INITIAL_ACTIVITIES);
    setStudents(INITIAL_STUDENTS);
    setPayments(INITIAL_PAYMENTS);
    setExpenses(INITIAL_EXPENSES);
    setSessions(INITIAL_SESSIONS);
    setPayouts(INITIAL_PAYOUTS);
  };

  // Exportar datos a CSV
  const exportToCSV = (type: 'payments' | 'students' | 'expenses' | 'teachers') => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `triskell_${type}_${selectedPeriod}.csv`;

    if (type === 'payments') {
      headers = ['Recibo', 'Periodo', 'Alumno', 'Actividad', 'Importe (€)', 'Estado', 'Fecha Pago', 'Metodo', 'Cobrado por Monitor'];
      rows = periodPayments.map(p => [
        p.receiptNumber,
        p.periodMonth,
        `"${p.studentName}"`,
        `"${p.activityName}"`,
        p.amount,
        p.status,
        p.paymentDate || '',
        p.paymentMethod,
        p.collectedByTeacher ? 'SI' : 'NO'
      ]);
    } else if (type === 'students') {
      headers = ['ID', 'Nombre', 'Email', 'Telefono', 'Estado', 'Fecha Alta', 'Total Actividades'];
      rows = students.map(s => [
        s.id,
        `"${s.name}"`,
        s.email,
        s.phone,
        s.status,
        s.registeredAt,
        s.activities.length
      ]);
    } else if (type === 'expenses') {
      headers = ['ID', 'Concepto', 'Categoria', 'Periodo', 'Importe (€)', 'Fecha', 'Metodo', 'Factura'];
      rows = expenses.filter(e => e.periodMonth === selectedPeriod).map(e => [
        e.id,
        `"${e.title}"`,
        e.category,
        e.periodMonth,
        e.amount,
        e.date,
        e.paymentMethod,
        e.invoiceNumber || ''
      ]);
    } else if (type === 'teachers') {
      headers = ['Profesor', 'Email', 'Esquema de Pago', 'Tarifa Clase (€)', 'Fijo Mensual (€)', '% Reparto', 'Metodo'];
      rows = teachers.map(t => [
        `"${t.name}"`,
        t.email,
        t.paymentScheme,
        t.ratePerClass,
        t.fixedMonthlyRate,
        t.revenueSharePercent,
        t.preferredPaymentMethod
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // CÁLCULOS PERÍODO
  const periodPayments = useMemo(() => {
    return payments.filter(p => p.periodMonth === selectedPeriod);
  }, [payments, selectedPeriod]);

  const totalIncomeCollected = useMemo(() => {
    return periodPayments
      .filter(p => p.status === 'paid')
      .reduce((acc, p) => acc + p.amount, 0);
  }, [periodPayments]);

  const totalIncomePending = useMemo(() => {
    return periodPayments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((acc, p) => acc + p.amount, 0);
  }, [periodPayments]);

  const totalExpenses = useMemo(() => {
    return expenses
      .filter(e => e.periodMonth === selectedPeriod)
      .reduce((acc, e) => acc + e.amount, 0);
  }, [expenses, selectedPeriod]);

  // Desglose financiero por profesor para el período seleccionado
  const teacherSummaries: TeacherFinancialSummary[] = useMemo(() => {
    return teachers.map(teacher => {
      // Actividades que imparte
      const teacherActs = activities.filter(a => a.teacherId === teacher.id);
      const actIds = teacherActs.map(a => a.id);

      // Alumnos inscritos en sus actividades
      const studentsCount = students.filter(st =>
        st.activities.some(act => actIds.includes(act.activityId))
      ).length;

      // Clases dadas en este período
      const teacherSessions = sessions.filter(
        s => s.teacherId === teacher.id && s.date.startsWith(selectedPeriod)
      );
      const classesCount = teacherSessions.length;

      // Recaudación bruta generada por sus actividades este mes
      const activityPayments = periodPayments.filter(p => actIds.includes(p.activityId));
      const grossActivityRevenue = activityPayments.reduce((acc, p) => acc + p.amount, 0);

      // Cuánto le corresponde cobrar según su modelo contractual
      let calculatedDue = 0;
      if (teacher.paymentScheme === 'per_class') {
        calculatedDue = classesCount * (teacher.ratePerClass || 0);
      } else if (teacher.paymentScheme === 'monthly_fixed') {
        calculatedDue = teacher.fixedMonthlyRate || 0;
      } else if (teacher.paymentScheme === 'revenue_share') {
        calculatedDue = (grossActivityRevenue * (teacher.revenueSharePercent || 0)) / 100;
      }

      // Cuánto ha cobrado ya el profesor directamente en mano a los alumnos
      const collectedInHand = activityPayments
        .filter(p => p.collectedByTeacher && (p.collectedByTeacherId === teacher.id || !p.collectedByTeacherId) && p.status === 'paid')
        .reduce((acc, p) => acc + p.amount, 0);

      // Cuánto se le ha transferido/liquidado ya formalmente desde el centro
      const settledRecords = payouts.filter(
        pay => pay.teacherId === teacher.id && pay.periodMonth === selectedPeriod && pay.status === 'settled'
      );
      const alreadySettled = settledRecords.reduce((acc, pay) => acc + pay.totalSettled, 0);

      // Balance pendiente a transferirle
      const balanceToPay = Math.max(0, calculatedDue - collectedInHand - alreadySettled);

      let status: 'settled' | 'pending' | 'surplus' = 'pending';
      if (collectedInHand + alreadySettled >= calculatedDue && calculatedDue > 0) {
        status = 'settled';
      } else if (collectedInHand > calculatedDue) {
        status = 'surplus';
      }

      return {
        teacher,
        classesCount,
        studentsCount,
        grossActivityRevenue,
        calculatedDue,
        collectedInHand,
        alreadySettled,
        balanceToPay,
        status
      };
    });
  }, [teachers, activities, students, sessions, periodPayments, selectedPeriod, payouts]);

  const totalTeacherCosts = useMemo(() => {
    return teacherSummaries.reduce((acc, s) => acc + s.calculatedDue, 0);
  }, [teacherSummaries]);

  const netMonthlyBalance = useMemo(() => {
    return totalIncomeCollected - totalExpenses - totalTeacherCosts;
  }, [totalIncomeCollected, totalExpenses, totalTeacherCosts]);

  return (
    <AppContext.Provider
      value={{
        selectedPeriod,
        setSelectedPeriod,
        goToPrevPeriod,
        goToNextPeriod,
        goToCurrentPeriod,
        currentRole,
        setCurrentRole,
        currentTeacherId,
        setCurrentTeacherId,
        currentStudentId,
        setCurrentStudentId,
        currentUser,
        loginWithGoogle,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isDarkMode,
        toggleDarkMode,
        teachers,
        activities,
        students,
        payments,
        expenses,
        sessions,
        payouts,
        recordPayment,
        updatePayment,
        deletePayment,
        markPaymentPaid,
        addStudent,
        updateStudent,
        deleteStudent,
        enrollStudentInActivity,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        updateTeacherAvatar,
        addActivity,
        updateActivity,
        deleteActivity,
        addExpense,
        deleteExpense,
        addClassSession,
        deleteClassSession,
        recordClassPayment,
        settleTeacherPayout,
        resetToInitialData,
        exportToCSV,
        periodPayments,
        totalIncomeCollected,
        totalIncomePending,
        totalExpenses,
        teacherSummaries,
        totalTeacherCosts,
        netMonthlyBalance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
