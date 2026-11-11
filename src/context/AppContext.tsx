import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  supabase,
  mapDbTeacherToTeacher,
  mapTeacherToDb,
  mapDbActivityToActivity,
  mapActivityToDb,
  mapDbStudentToStudent,
  mapDbPaymentToPayment,
  mapPaymentToDb,
  mapDbSessionToSession,
  mapDbExpenseToExpense,
  mapExpenseToDb,
  mapDbPayoutToPayout,
  mapPayoutToDb
} from '../lib/supabase';
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
  calculatedDue: number;
  collectedInHand: number;
  alreadySettled: number;
  balanceToPay: number;
  status: 'settled' | 'pending' | 'surplus';
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
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, pass: string, fullName: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Estado de base de datos en tiempo real
  isLoadingDb: boolean;
  dbError: string | null;
  clearDbError: () => void;
  refreshFromSupabase: () => Promise<void>;
  seedInitialDataToSupabase: () => Promise<void>;

  teachers: Teacher[];
  activities: Activity[];
  students: Student[];
  payments: PaymentRecord[];
  expenses: CenterExpense[];
  sessions: ClassSession[];
  payouts: TeacherPayout[];

  // Acciones en tiempo real
  recordPayment: (payment: Omit<PaymentRecord, 'id' | 'receiptNumber'> & { id?: string }) => Promise<PaymentRecord | null>;
  updatePayment: (id: string, updates: Partial<PaymentRecord>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  markPaymentPaid: (id: string, method?: PaymentMethod) => Promise<void>;

  addStudent: (student: Omit<Student, 'id' | 'registeredAt'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  enrollStudentInActivity: (studentId: string, activityId: string, customPrice?: number) => Promise<void>;

  addTeacher: (teacher: Omit<Teacher, 'id'>) => Promise<void>;
  updateTeacher: (id: string, updates: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  updateTeacherAvatar: (teacherId: string, avatarUrl: string) => Promise<void>;

  addActivity: (activity: Omit<Activity, 'id'>) => Promise<void>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;

  addExpense: (expense: Omit<CenterExpense, 'id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addClassSession: (session: Omit<ClassSession, 'id'>) => Promise<void>;
  deleteClassSession: (id: string) => Promise<void>;
  recordClassPayment: (params: {
    studentId: string;
    activityId: string;
    amount: number;
    isPartial?: boolean;
    paymentMethod?: PaymentMethod;
    date?: string;
    notes?: string;
  }) => Promise<PaymentRecord | null>;

  settleTeacherPayout: (
    teacherId: string,
    periodMonth: string,
    amountToPay: number,
    method: PaymentMethod,
    notes?: string
  ) => Promise<void>;

  resetToInitialData: () => Promise<void>;
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado de usuario y autenticación con Supabase Auth
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Estados de navegación y roles
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-11');
  const [currentRole, setCurrentRoleState] = useState<UserRole>('admin');
  const [currentTeacherId, setCurrentTeacherId] = useState<string>('');
  const [currentStudentId, setCurrentStudentId] = useState<string>('');

  // Modo oscuro
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('triskell_theme') === 'dark';
  });

  // Estado de conexión y errores de Supabase
  const [isLoadingDb, setIsLoadingDb] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Colecciones sincronizadas en tiempo real con Supabase
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [expenses, setExpenses] = useState<CenterExpense[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [payouts, setPayouts] = useState<TeacherPayout[]>([]);

  const clearDbError = useCallback(() => setDbError(null), []);

  const handleSupabaseError = useCallback((contextMsg: string, error: any) => {
    console.error(`[Supabase Error] ${contextMsg}:`, error);
    let msg = error?.message || 'Error de comunicación con Supabase';
    if (error?.code === '42501' || msg.includes('permission denied') || msg.includes('row-level security')) {
      msg = `Permiso RLS denegado: Tu usuario actual no tiene permisos suficientes para ${contextMsg.toLowerCase()}. Inicia sesión con la cuenta adecuada.`;
    }
    setDbError(msg);
  }, []);

  // Sincronizar dark mode con clase en elemento HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('triskell_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('triskell_theme', 'light');
    }
  }, [isDarkMode]);

  // Carga completa de datos desde Supabase
  const refreshFromSupabase = useCallback(async () => {
    try {
      setIsLoadingDb(true);

      // 1. Cargar Monitores
      const teachersRes = await supabase.from('teachers').select('*').order('name');
      if (teachersRes.error) {
        handleSupabaseError('Cargar monitores', teachersRes.error);
      } else {
        const loadedTeachers = (teachersRes.data || []).map(mapDbTeacherToTeacher);
        setTeachers(loadedTeachers);
        if (loadedTeachers.length > 0 && !currentTeacherId) {
          setCurrentTeacherId(loadedTeachers[0].id);
        }
      }

      // 2. Cargar Talleres / Actividades
      const activitiesRes = await supabase.from('activities').select('*').order('name');
      if (activitiesRes.error) {
        handleSupabaseError('Cargar talleres', activitiesRes.error);
      } else {
        const loadedActivities = (activitiesRes.data || []).map(mapDbActivityToActivity);
        setActivities(loadedActivities);
      }

      // 3. Cargar Alumnos y Matrículas
      const [studentsRes, enrollmentsRes] = await Promise.all([
        supabase.from('students').select('*').order('name'),
        supabase.from('student_enrollments').select('*')
      ]);

      if (studentsRes.error) {
        handleSupabaseError('Cargar alumnos', studentsRes.error);
      } else {
        const enrollments = enrollmentsRes.data || [];
        const loadedStudents = (studentsRes.data || []).map(row => mapDbStudentToStudent(row, enrollments));
        setStudents(loadedStudents);
        if (loadedStudents.length > 0 && !currentStudentId) {
          setCurrentStudentId(loadedStudents[0].id);
        }
      }

      // 4. Cargar Pagos y Recibos
      const paymentsRes = await supabase
        .from('payments')
        .select('*, students(name), activities(name)')
        .order('created_at', { ascending: false });

      if (paymentsRes.error) {
        handleSupabaseError('Cargar pagos', paymentsRes.error);
      } else {
        const loadedPayments = (paymentsRes.data || []).map(row => mapDbPaymentToPayment(row));
        setPayments(loadedPayments);
      }

      // 5. Cargar Gastos del Centro
      const expensesRes = await supabase
        .from('center_expenses')
        .select('*')
        .order('date', { ascending: false });

      if (expensesRes.error) {
        handleSupabaseError('Cargar gastos', expensesRes.error);
      } else {
        const loadedExpenses = (expensesRes.data || []).map(mapDbExpenseToExpense);
        setExpenses(loadedExpenses);
      }

      // 6. Cargar Sesiones y Asistencias
      const [sessionsRes, attendancesRes] = await Promise.all([
        supabase.from('class_sessions').select('*').order('date', { ascending: false }),
        supabase.from('session_attendances').select('*, students(name)')
      ]);

      if (sessionsRes.error) {
        handleSupabaseError('Cargar clases impartidas', sessionsRes.error);
      } else {
        const attendances = attendancesRes.data || [];
        const loadedSessions = (sessionsRes.data || []).map(row => mapDbSessionToSession(row, attendances));
        setSessions(loadedSessions);
      }

      // 7. Cargar Liquidaciones de Monitores
      const payoutsRes = await supabase
        .from('teacher_payouts')
        .select('*')
        .order('period_month', { ascending: false });

      if (payoutsRes.error) {
        handleSupabaseError('Cargar liquidaciones', payoutsRes.error);
      } else {
        const loadedPayouts = (payoutsRes.data || []).map(mapDbPayoutToPayout);
        setPayouts(loadedPayouts);
      }

    } catch (err: any) {
      handleSupabaseError('Sincronización general', err);
    } finally {
      setIsLoadingDb(false);
    }
  }, [handleSupabaseError, currentTeacherId, currentStudentId]);

  // Cargar perfil del usuario desde Supabase auth.users y public.profiles
  const syncUserProfile = useCallback(async (userId: string, userEmail?: string, userMeta?: any) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile:', error);
      }

      let role: UserRole = (profile?.role as UserRole) || (userMeta?.role as UserRole) || 'admin';
      let fullName = profile?.full_name || userMeta?.full_name || userMeta?.name || userEmail?.split('@')[0] || 'Usuario';
      let avatarUrl = profile?.avatar_url || userMeta?.avatar_url || userMeta?.picture || undefined;
      let teacherId = profile?.teacher_id || undefined;
      let studentId = profile?.student_id || undefined;

      // Si no existe perfil en la tabla de profiles, crearlo
      if (!profile) {
        const { error: insertErr } = await supabase.from('profiles').upsert({
          id: userId,
          email: userEmail || '',
          full_name: fullName,
          avatar_url: avatarUrl || null,
          role: role,
          teacher_id: teacherId || null,
          student_id: studentId || null
        });
        if (insertErr) {
          console.warn('Error creating default profile:', insertErr);
        }
      }

      const authUserObj: AuthUser = {
        id: userId,
        email: userEmail || '',
        name: fullName,
        photoURL: avatarUrl,
        role: role,
        teacherId: teacherId,
        studentId: studentId,
        provider: 'google',
        lastLogin: new Date().toISOString()
      };

      setCurrentUser(authUserObj);
      setCurrentRoleState(role);
      if (teacherId) setCurrentTeacherId(teacherId);
      if (studentId) setCurrentStudentId(studentId);

    } catch (e) {
      console.error('Error synchronizing user profile:', e);
    }
  }, []);

  // Suscripción al estado de Auth de Supabase
  useEffect(() => {
    let mounted = true;

    // Verificar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        syncUserProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else {
        // Usuario demo inicial si no hay sesión activa aún en Supabase
        setCurrentUser({
          id: 'demo-admin-cristino',
          email: 'cristinoconde@gmail.com',
          name: 'Cristino Conde',
          photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          role: 'admin',
          provider: 'google',
          lastLogin: new Date().toISOString()
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        await syncUserProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncUserProfile]);

  // Cargar datos iniciales y configurar canal en tiempo real de Supabase
  useEffect(() => {
    refreshFromSupabase();

    // Canal Realtime para escuchar cambios en cualquier tabla de la base de datos
    const channel = supabase
      .channel('triskell_db_realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        refreshFromSupabase();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshFromSupabase]);

  // Función para cambiar de rol y persistirlo en la tabla profiles de Supabase
  const setCurrentRole = useCallback(async (newRole: UserRole) => {
    setCurrentRoleState(newRole);
    if (currentUser?.id && !currentUser.id.startsWith('demo-')) {
      try {
        await supabase
          .from('profiles')
          .update({ role: newRole })
          .eq('id', currentUser.id);
      } catch (err) {
        console.warn('Error updating role in Supabase profiles:', err);
      }
    }
  }, [currentUser]);

  // Inicio de sesión con Google OAuth mediante Supabase
  const loginWithGoogle = async () => {
    clearDbError();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        handleSupabaseError('Inicio de sesión con Google', error);
      }
    } catch (e: any) {
      handleSupabaseError('Inicio de sesión con Google', e);
    }
  };

  // Inicio de sesión con Email y Contraseña mediante Supabase
  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    clearDbError();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass
      });
      if (error) {
        handleSupabaseError('Inicio de sesión con Email', error);
        return { success: false, error: error.message };
      }
      if (data.user) {
        await syncUserProfile(data.user.id, data.user.email, data.user.user_metadata);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error de autenticación' };
    }
  };

  // Registro con Email y Contraseña mediante Supabase
  const signUpWithEmail = async (
    email: string,
    pass: string,
    fullName: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    clearDbError();
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
            role: role
          }
        }
      });
      if (error) {
        handleSupabaseError('Registro con Email', error);
        return { success: false, error: error.message };
      }
      if (data.user) {
        await syncUserProfile(data.user.id, data.user.email, data.user.user_metadata);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Error de registro' };
    }
  };

  // Cierre de sesión en Supabase
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
    } catch (e) {
      console.error('Error logging out:', e);
    }
  };

  // Navegación de Períodos Mensuales
  const goToPrevPeriod = () => {
    const [year, month] = selectedPeriod.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const newY = prevDate.getFullYear();
    const newM = String(prevDate.getMonth() + 1).padStart(2, '0');
    setSelectedPeriod(`${newY}-${newM}`);
  };

  const goToNextPeriod = () => {
    const [year, month] = selectedPeriod.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const newY = nextDate.getFullYear();
    const newM = String(nextDate.getMonth() + 1).padStart(2, '0');
    setSelectedPeriod(`${newY}-${newM}`);
  };

  const goToCurrentPeriod = () => {
    setSelectedPeriod('2026-11');
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // ==============================================================================
  // OPERACIONES CRUD EN TIEMPO REAL CON SUPABASE
  // ==============================================================================

  // Monitores
  const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
    clearDbError();
    const dbPayload = mapTeacherToDb(teacher);
    const { data, error } = await supabase.from('teachers').insert([dbPayload]).select().single();
    if (error) {
      handleSupabaseError('Alta de monitor', error);
      return;
    }
    if (data) {
      const newTeacher = mapDbTeacherToTeacher(data);
      setTeachers(prev => [...prev, newTeacher]);
    }
  };

  const updateTeacher = async (id: string, updates: Partial<Teacher>) => {
    clearDbError();
    const current = teachers.find(t => t.id === id);
    if (!current) return;
    const merged = { ...current, ...updates };
    const dbPayload = mapTeacherToDb(merged);
    const { error } = await supabase.from('teachers').update(dbPayload).eq('id', id);
    if (error) {
      handleSupabaseError('Actualizar monitor', error);
      return;
    }
    setTeachers(prev => prev.map(t => (t.id === id ? merged : t)));
  };

  const deleteTeacher = async (id: string) => {
    clearDbError();
    const { error } = await supabase.from('teachers').delete().eq('id', id);
    if (error) {
      handleSupabaseError('Eliminar monitor', error);
      return;
    }
    setTeachers(prev => prev.filter(t => t.id !== id));
  };

  const updateTeacherAvatar = async (teacherId: string, avatarUrl: string) => {
    await updateTeacher(teacherId, { avatarUrl, avatar: avatarUrl });
  };

  // Talleres / Actividades
  const addActivity = async (activity: Omit<Activity, 'id'>) => {
    clearDbError();
    const dbPayload = mapActivityToDb(activity);
    const { data, error } = await supabase.from('activities').insert([dbPayload]).select().single();
    if (error) {
      handleSupabaseError('Crear taller', error);
      return;
    }
    if (data) {
      const newAct = mapDbActivityToActivity(data);
      setActivities(prev => [...prev, newAct]);
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    clearDbError();
    const current = activities.find(a => a.id === id);
    if (!current) return;
    const merged = { ...current, ...updates };
    const dbPayload = mapActivityToDb(merged);
    const { error } = await supabase.from('activities').update(dbPayload).eq('id', id);
    if (error) {
      handleSupabaseError('Actualizar taller', error);
      return;
    }
    setActivities(prev => prev.map(a => (a.id === id ? merged : a)));
  };

  const deleteActivity = async (id: string) => {
    clearDbError();
    const { error } = await supabase.from('activities').delete().eq('id', id);
    if (error) {
      handleSupabaseError('Eliminar taller', error);
      return;
    }
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  // Alumnos y Matrículas
  const addStudent = async (student: Omit<Student, 'id' | 'registeredAt'>) => {
    clearDbError();
    const studentDb = {
      name: student.name,
      email: student.email || null,
      phone: student.phone || null,
      status: student.status,
      notes: student.notes || null
    };

    const { data: newStudentRow, error: studentErr } = await supabase
      .from('students')
      .insert([studentDb])
      .select()
      .single();

    if (studentErr) {
      handleSupabaseError('Alta de alumno', studentErr);
      return;
    }

    if (newStudentRow) {
      // Inscribir en las actividades seleccionadas
      if (student.activities && student.activities.length > 0) {
        const enrollmentsDb = student.activities.map(act => ({
          student_id: newStudentRow.id,
          activity_id: act.activityId,
          custom_price: act.customPrice || null,
          billing_mode: act.billingMode,
          enrolled_since: act.enrolledSince || new Date().toISOString().split('T')[0]
        }));
        await supabase.from('student_enrollments').insert(enrollmentsDb);
      }
      await refreshFromSupabase();
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    clearDbError();
    const studentDb: any = {};
    if (updates.name !== undefined) studentDb.name = updates.name;
    if (updates.email !== undefined) studentDb.email = updates.email || null;
    if (updates.phone !== undefined) studentDb.phone = updates.phone || null;
    if (updates.status !== undefined) studentDb.status = updates.status;
    if (updates.notes !== undefined) studentDb.notes = updates.notes || null;

    if (Object.keys(studentDb).length > 0) {
      const { error } = await supabase.from('students').update(studentDb).eq('id', id);
      if (error) {
        handleSupabaseError('Actualizar alumno', error);
        return;
      }
    }

    // Si actualizan matrículas
    if (updates.activities) {
      await supabase.from('student_enrollments').delete().eq('student_id', id);
      if (updates.activities.length > 0) {
        const enrollmentsDb = updates.activities.map(act => ({
          student_id: id,
          activity_id: act.activityId,
          custom_price: act.customPrice || null,
          billing_mode: act.billingMode,
          enrolled_since: act.enrolledSince || new Date().toISOString().split('T')[0]
        }));
        await supabase.from('student_enrollments').insert(enrollmentsDb);
      }
    }
    await refreshFromSupabase();
  };

  const deleteStudent = async (id: string) => {
    clearDbError();
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) {
      handleSupabaseError('Eliminar alumno', error);
      return;
    }
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const enrollStudentInActivity = async (studentId: string, activityId: string, customPrice?: number) => {
    clearDbError();
    const act = activities.find(a => a.id === activityId);
    const { error } = await supabase.from('student_enrollments').upsert({
      student_id: studentId,
      activity_id: activityId,
      custom_price: customPrice || null,
      billing_mode: act?.billingMode || 'monthly',
      enrolled_since: new Date().toISOString().split('T')[0],
      active: true
    });

    if (error) {
      handleSupabaseError('Inscribir alumno en taller', error);
      return;
    }
    await refreshFromSupabase();
  };

  // Pagos y Recibos
  const recordPayment = async (
    payment: Omit<PaymentRecord, 'id' | 'receiptNumber'> & { id?: string }
  ): Promise<PaymentRecord | null> => {
    clearDbError();
    const receiptNumber = `REC-${selectedPeriod.replace('-', '')}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const student = students.find(s => s.id === payment.studentId);
    const activity = activities.find(a => a.id === payment.activityId);

    const dbPayload = mapPaymentToDb({
      id: payment.id || '',
      receiptNumber,
      studentId: payment.studentId,
      studentName: student?.name || '',
      activityId: payment.activityId,
      activityName: activity?.name || '',
      periodMonth: payment.periodMonth || selectedPeriod,
      amount: payment.amount,
      paymentDate: payment.paymentDate || (payment.status === 'paid' ? new Date().toISOString().split('T')[0] : undefined),
      paymentMethod: payment.paymentMethod || 'cash',
      status: payment.status || 'paid',
      collectedByTeacher: payment.collectedByTeacher ?? true,
      collectedByTeacherId: payment.collectedByTeacherId || activity?.teacherId,
      notes: payment.notes || ''
    });

    const { data, error } = await supabase.from('payments').insert([dbPayload]).select().single();
    if (error) {
      handleSupabaseError('Registrar pago en Supabase', error);
      return null;
    }

    if (data) {
      const createdPayment = mapDbPaymentToPayment(data, student?.name, activity?.name);
      setPayments(prev => [createdPayment, ...prev]);
      return createdPayment;
    }
    return null;
  };

  const updatePayment = async (id: string, updates: Partial<PaymentRecord>) => {
    clearDbError();
    const current = payments.find(p => p.id === id);
    if (!current) return;
    const merged = { ...current, ...updates };
    const dbPayload = mapPaymentToDb(merged);
    const { error } = await supabase.from('payments').update(dbPayload).eq('id', id);
    if (error) {
      handleSupabaseError('Actualizar pago', error);
      return;
    }
    setPayments(prev => prev.map(p => (p.id === id ? merged : p)));
  };

  const deletePayment = async (id: string) => {
    clearDbError();
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) {
      handleSupabaseError('Eliminar pago', error);
      return;
    }
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const markPaymentPaid = async (id: string, method?: PaymentMethod) => {
    await updatePayment(id, {
      status: 'paid',
      paymentDate: new Date().toISOString().split('T')[0],
      ...(method ? { paymentMethod: method } : {})
    });
  };

  const recordClassPayment = async (params: {
    studentId: string;
    activityId: string;
    amount: number;
    isPartial?: boolean;
    paymentMethod?: PaymentMethod;
    date?: string;
    notes?: string;
  }): Promise<PaymentRecord | null> => {
    clearDbError();
    const activity = activities.find(a => a.id === params.activityId);
    const student = students.find(s => s.id === params.studentId);
    const paymentDate = params.date || new Date().toISOString().split('T')[0];

    const receipt = await recordPayment({
      studentId: params.studentId,
      studentName: student?.name || 'Alumno',
      activityId: params.activityId,
      activityName: activity?.name || 'Taller',
      periodMonth: selectedPeriod,
      amount: params.amount,
      paymentDate: paymentDate,
      paymentMethod: params.paymentMethod || 'cash',
      status: 'paid',
      collectedByTeacher: true,
      collectedByTeacherId: activity?.teacherId || currentTeacherId,
      notes: params.notes || (params.isPartial ? 'Pago parcial en clase' : 'Pago de clase impartida')
    });

    return receipt;
  };

  // Clases Impartidas y Asistencias
  const addClassSession = async (session: Omit<ClassSession, 'id'>) => {
    clearDbError();
    const sessionDb = {
      activity_id: session.activityId,
      teacher_id: session.teacherId,
      date: session.date,
      attendees_count: session.attendeesCount,
      duration_minutes: session.durationMinutes,
      topic: session.topic || null
    };

    const { data: newSessionRow, error: sessionErr } = await supabase
      .from('class_sessions')
      .insert([sessionDb])
      .select()
      .single();

    if (sessionErr) {
      handleSupabaseError('Anotar clase impartida', sessionErr);
      return;
    }

    if (newSessionRow && session.attendanceRecords && session.attendanceRecords.length > 0) {
      const attendanceDb = session.attendanceRecords.map(rec => ({
        session_id: newSessionRow.id,
        student_id: rec.studentId,
        attendance: rec.attendance,
        paid: rec.paid,
        paid_amount: rec.paidAmount || 0,
        payment_method: rec.paymentMethod || 'cash',
        payment_id: rec.paymentId || null
      }));
      await supabase.from('session_attendances').insert(attendanceDb);
    }

    await refreshFromSupabase();
  };

  const deleteClassSession = async (id: string) => {
    clearDbError();
    const { error } = await supabase.from('class_sessions').delete().eq('id', id);
    if (error) {
      handleSupabaseError('Eliminar sesión de clase', error);
      return;
    }
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  // Gastos
  const addExpense = async (expense: Omit<CenterExpense, 'id'>) => {
    clearDbError();
    const dbPayload = mapExpenseToDb(expense);
    const { data, error } = await supabase.from('center_expenses').insert([dbPayload]).select().single();
    if (error) {
      handleSupabaseError('Registrar gasto', error);
      return;
    }
    if (data) {
      setExpenses(prev => [mapDbExpenseToExpense(data), ...prev]);
    }
  };

  const deleteExpense = async (id: string) => {
    clearDbError();
    const { error } = await supabase.from('center_expenses').delete().eq('id', id);
    if (error) {
      handleSupabaseError('Eliminar gasto', error);
      return;
    }
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Liquidaciones
  const settleTeacherPayout = async (
    teacherId: string,
    periodMonth: string,
    amountToPay: number,
    method: PaymentMethod,
    notes?: string
  ) => {
    clearDbError();
    const summary = teacherSummaries.find(s => s.teacher.id === teacherId);
    const dbPayload = mapPayoutToDb({
      id: '',
      teacherId,
      periodMonth,
      calculatedAmount: summary?.calculatedDue || amountToPay,
      classesCount: summary?.classesCount || 0,
      studentsCount: summary?.studentsCount || 0,
      collectedInHandByTeacher: summary?.collectedInHand || 0,
      balancePending: 0,
      totalSettled: amountToPay,
      status: 'settled',
      settledDate: new Date().toISOString().split('T')[0],
      paymentMethod: method,
      notes: notes || 'Liquidación mensual formalizada'
    });

    const { error } = await supabase.from('teacher_payouts').insert([dbPayload]);
    if (error) {
      handleSupabaseError('Registrar liquidación', error);
      return;
    }
    await refreshFromSupabase();
  };

  // Sembrador / Inicializador de datos en Supabase si la base de datos está vacía
  const seedInitialDataToSupabase = async () => {
    clearDbError();
    setIsLoadingDb(true);
    try {
      // 1. Insertar Monitores
      const teachersPayload = INITIAL_TEACHERS.map(t => ({
        name: t.name,
        email: t.email,
        phone: t.phone,
        avatar_url: t.avatarUrl || t.avatar,
        payment_scheme: t.paymentScheme,
        rate_per_class: t.ratePerClass,
        fixed_monthly_rate: t.fixedMonthlyRate,
        revenue_share_percent: t.revenueSharePercent,
        preferred_payment_method: t.preferredPaymentMethod,
        collection_type: t.collectionType || 'personal',
        bank_account: t.bankAccount,
        active: t.active,
        notes: t.notes
      }));
      const { data: createdTeachers, error: tErr } = await supabase.from('teachers').insert(teachersPayload).select();
      if (tErr) throw tErr;

      const tMap: Record<string, string> = {};
      createdTeachers?.forEach((ct, idx) => {
        tMap[INITIAL_TEACHERS[idx].id] = ct.id;
      });

      // 2. Insertar Talleres
      const activitiesPayload = INITIAL_ACTIVITIES.map(a => ({
        name: a.name,
        description: a.description,
        teacher_id: tMap[a.teacherId] || createdTeachers?.[0]?.id,
        category: a.category,
        color: a.color,
        schedule: a.schedule,
        default_price_monthly: a.defaultPriceMonthly,
        default_price_per_class: a.defaultPricePerClass,
        billing_mode: a.billingMode,
        bizum_enabled: a.bizum_enabled,
        bizum_phone: a.bizum_phone,
        bizum_concept: a.bizum_concept,
        room: a.room,
        active: a.active
      }));
      const { data: createdActivities, error: aErr } = await supabase.from('activities').insert(activitiesPayload).select();
      if (aErr) throw aErr;

      const aMap: Record<string, string> = {};
      createdActivities?.forEach((ca, idx) => {
        aMap[INITIAL_ACTIVITIES[idx].id] = ca.id;
      });

      // 3. Insertar Alumnos
      const studentsPayload = INITIAL_STUDENTS.map(s => ({
        name: s.name,
        email: s.email,
        phone: s.phone,
        status: s.status,
        registered_at: s.registeredAt,
        notes: s.notes
      }));
      const { data: createdStudents, error: sErr } = await supabase.from('students').insert(studentsPayload).select();
      if (sErr) throw sErr;

      // 4. Insertar Matrículas
      const enrollmentsPayload: any[] = [];
      INITIAL_STUDENTS.forEach((origS, sIdx) => {
        const newStudentId = createdStudents?.[sIdx]?.id;
        if (newStudentId && origS.activities) {
          origS.activities.forEach(enr => {
            const newActId = aMap[enr.activityId];
            if (newActId) {
              enrollmentsPayload.push({
                student_id: newStudentId,
                activity_id: newActId,
                custom_price: enr.customPrice || null,
                billing_mode: enr.billingMode || 'monthly',
                enrolled_since: enr.enrolledSince
              });
            }
          });
        }
      });
      if (enrollmentsPayload.length > 0) {
        await supabase.from('student_enrollments').insert(enrollmentsPayload);
      }

      // 5. Insertar Gastos
      const expensesPayload = INITIAL_EXPENSES.map(e => ({
        title: e.title,
        category: e.category,
        amount: e.amount,
        date: e.date,
        period_month: e.periodMonth,
        payment_method: e.paymentMethod,
        status: e.status,
        invoice_number: e.invoiceNumber,
        notes: e.notes
      }));
      await supabase.from('center_expenses').insert(expensesPayload);

      await refreshFromSupabase();
    } catch (err: any) {
      handleSupabaseError('Poblar datos iniciales en Supabase', err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const resetToInitialData = async () => {
    await seedInitialDataToSupabase();
  };

  // Exportar a CSV
  const exportToCSV = (type: 'payments' | 'students' | 'expenses' | 'teachers') => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = `triskell_${type}_${selectedPeriod}.csv`;

    if (type === 'payments') {
      csvContent += 'Recibo,Alumno,Actividad,Mes,Importe,Estado,FechaPago,Metodo,CobradoEnMano\n';
      periodPayments.forEach(p => {
        csvContent += `"${p.receiptNumber}","${p.studentName}","${p.activityName}","${p.periodMonth}",${p.amount},"${p.status}","${p.paymentDate || ''}","${p.paymentMethod}","${p.collectedByTeacher ? 'Sí' : 'No'}"\n`;
      });
    } else if (type === 'students') {
      csvContent += 'Nombre,Email,Telefono,Estado,FechaAlta\n';
      students.forEach(s => {
        csvContent += `"${s.name}","${s.email}","${s.phone}","${s.status}","${s.registeredAt}"\n`;
      });
    } else if (type === 'expenses') {
      csvContent += 'Concepto,Categoria,Importe,Fecha,Mes,Metodo,Factura\n';
      expenses.filter(e => e.periodMonth === selectedPeriod).forEach(e => {
        csvContent += `"${e.title}","${e.category}",${e.amount},"${e.date}","${e.periodMonth}","${e.paymentMethod}","${e.invoiceNumber || ''}"\n`;
      });
    } else if (type === 'teachers') {
      csvContent += 'Nombre,Email,Telefono,Modalidad,TarifaClase,FijoMensual,PorcentajeCuotas\n';
      teachers.forEach(t => {
        csvContent += `"${t.name}","${t.email}","${t.phone}","${t.paymentScheme}",${t.ratePerClass},${t.fixedMonthlyRate},${t.revenueSharePercent}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==============================================================================
  // CÁLCULOS DINÁMICOS DEL PERÍODO MENSUAL
  // ==============================================================================

  const periodPayments = useMemo(() => {
    return payments.filter(p => p.periodMonth === selectedPeriod);
  }, [payments, selectedPeriod]);

  const totalIncomeCollected = useMemo(() => {
    return periodPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [periodPayments]);

  const totalIncomePending = useMemo(() => {
    return periodPayments
      .filter(p => p.status === 'pending' || p.status === 'overdue')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [periodPayments]);

  const totalExpenses = useMemo(() => {
    return expenses
      .filter(e => e.periodMonth === selectedPeriod && e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, selectedPeriod]);

  const teacherSummaries = useMemo<TeacherFinancialSummary[]>(() => {
    return teachers.map(teacher => {
      const teacherActivities = activities.filter(a => a.teacherId === teacher.id);
      const activityIds = teacherActivities.map(a => a.id);

      const teacherSessions = sessions.filter(
        s => s.teacherId === teacher.id && s.date.startsWith(selectedPeriod)
      );
      const classesCount = teacherSessions.length;

      const enrolledStudentIds = new Set<string>();
      students.forEach(s => {
        if (s.activities.some(act => activityIds.includes(act.activityId))) {
          enrolledStudentIds.add(s.id);
        }
      });
      const studentsCount = enrolledStudentIds.size;

      const teacherPeriodPayments = periodPayments.filter(p => activityIds.includes(p.activityId));
      const grossActivityRevenue = teacherPeriodPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

      let calculatedDue = 0;
      switch (teacher.paymentScheme) {
        case 'per_class':
          calculatedDue = classesCount * teacher.ratePerClass;
          break;
        case 'monthly_fixed':
          calculatedDue = teacher.fixedMonthlyRate;
          break;
        case 'revenue_share':
          calculatedDue = grossActivityRevenue * (teacher.revenueSharePercent / 100);
          break;
      }

      const collectedInHand = teacherPeriodPayments
        .filter(p => p.status === 'paid' && p.collectedByTeacher)
        .reduce((sum, p) => sum + p.amount, 0);

      const teacherPeriodPayouts = payouts.filter(
        p => p.teacherId === teacher.id && p.periodMonth === selectedPeriod && p.status === 'settled'
      );
      const alreadySettled = teacherPeriodPayouts.reduce((sum, p) => sum + p.totalSettled, 0);

      const balanceToPay = Math.max(0, calculatedDue - collectedInHand - alreadySettled);

      let status: 'settled' | 'pending' | 'surplus' = 'pending';
      if (balanceToPay === 0) {
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
        loginWithEmail,
        signUpWithEmail,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isDarkMode,
        toggleDarkMode,
        isLoadingDb,
        dbError,
        clearDbError,
        refreshFromSupabase,
        seedInitialDataToSupabase,
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
