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
  AuthUser,
  AppConfigSetting,
  NewsNote
} from '../types';
import {
  supabase,
  createIsolatedAuthClient,
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
  INITIAL_PAYOUTS,
  INITIAL_APP_CONFIGS,
  INITIAL_NEWS_NOTES
} from '../data/initialData';
import {
  isBiometricsSupported,
  getStoredBiometricUser,
  cacheAuthSession,
  getCachedAuthSession,
  clearCachedAuthSession,
  registerBiometricCredential,
  authenticateWithBiometrics,
  disableBiometrics as disableBiometricsUtil,
  StoredBiometricInfo
} from '../lib/biometrics';


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
  setCurrentUser: (user: AuthUser | null) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  isPasswordRecoveryMode: boolean;
  setIsPasswordRecoveryMode: (recovery: boolean) => void;
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

  // Gestión de Usuarios y Accesos (Exclusivo Administrador)
  profiles: AuthUser[];
  createUserByAdmin: (params: {
    email: string;
    fullName: string;
    role: UserRole;
    password?: string;
    teacherId?: string;
    studentId?: string;
    createTeacherProfile?: boolean;
    createStudentProfile?: boolean;
  }) => Promise<{ success: boolean; error?: string; tempPassword?: string }>;
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  deleteUserAccess: (userId: string) => Promise<void>;

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
  enrollStudentInActivity: (studentId: string, activityId: string, customPrice?: number) => Promise<{ success: boolean; error?: string }>;
  enrollUserFromProfile: (params: {
    profile: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      studentId?: string;
      teacherId?: string;
    };
    activityId: string;
    customPrice?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  quickCreateAndEnrollStudent: (params: {
    name: string;
    email?: string;
    phone?: string;
    notes?: string;
    activityId: string;
    customPrice?: number;
  }) => Promise<{ success: boolean; studentId?: string; error?: string }>;
  validatePendingStudent: (studentId: string, approve: boolean) => Promise<{ success: boolean; error?: string }>;

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

  // Configuración Global ('app_config')
  appConfigs: AppConfigSetting[];
  updateAppConfig: (config_key: string, config_value: string, is_active: boolean) => Promise<void>;
  addAppConfig: (config: AppConfigSetting) => Promise<void>;
  deleteAppConfig: (config_key: string) => Promise<void>;

  // Últimas notas / Comunicados
  newsNotes: NewsNote[];
  addNewsNote: (note: Omit<NewsNote, 'id'>) => Promise<void>;
  deleteNewsNote: (id: string) => Promise<void>;

  // Biometría y Sesión en Caché
  isBiometricsSupported: boolean;
  hasBiometricsEnabled: boolean;
  biometricUser: StoredBiometricInfo | null;
  enableBiometrics: () => Promise<boolean>;
  disableBiometrics: () => void;
  unlockWithBiometrics: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado de usuario y autenticación con Supabase Auth
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPasswordRecoveryMode, setIsPasswordRecoveryMode] = useState(false);

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
  const [profiles, setProfiles] = useState<AuthUser[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [expenses, setExpenses] = useState<CenterExpense[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [payouts, setPayouts] = useState<TeacherPayout[]>([]);

  // Configuración Global ('app_config')
  const [appConfigs, setAppConfigs] = useState<AppConfigSetting[]>(() => {
    try {
      const local = localStorage.getItem('triskell_app_configs');
      return local ? JSON.parse(local) : INITIAL_APP_CONFIGS;
    } catch {
      return INITIAL_APP_CONFIGS;
    }
  });

  // Últimas notas / Comunicados
  const [newsNotes, setNewsNotes] = useState<NewsNote[]>(() => {
    try {
      const local = localStorage.getItem('triskell_news_notes');
      return local ? JSON.parse(local) : INITIAL_NEWS_NOTES;
    } catch {
      return INITIAL_NEWS_NOTES;
    }
  });

  // Biometría
  const [isBiometricsSupportedState, setIsBiometricsSupportedState] = useState(false);
  const [biometricUserState, setBiometricUserState] = useState<StoredBiometricInfo | null>(null);

  useEffect(() => {
    isBiometricsSupported().then(supported => {
      setIsBiometricsSupportedState(supported);
      setBiometricUserState(getStoredBiometricUser());
    });
  }, []);

  const clearDbError = useCallback(() => setDbError(null), []);

  const handleSupabaseError = useCallback((contextMsg: string, error: any) => {
    console.error(`[Supabase Error] ${contextMsg}:`, error);
    let msg = error?.message || 'Error de comunicación con Supabase';
    if (error?.code === '42501' || msg.includes('permission denied') || msg.includes('row-level security')) {
      msg = `Permiso RLS denegado: Tu usuario actual no tiene permisos suficientes para ${contextMsg.toLowerCase()}. Inicia sesión con la cuenta de Administrador.`;
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

      // 1. Cargar Usuarios / Perfiles Autorizados
      const profilesRes = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!profilesRes.error && profilesRes.data) {
        setProfiles(
          profilesRes.data.map(p => ({
            id: p.id,
            email: p.email,
            name: p.full_name,
            role: p.role as UserRole,
            photoURL: p.avatar_url || undefined,
            teacherId: p.teacher_id || undefined,
            studentId: p.student_id || undefined,
            provider: 'email',
            createdAt: p.created_at
          }))
        );
      }

      // 2. Cargar Monitores
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

      // 3. Cargar Talleres / Actividades
      const activitiesRes = await supabase.from('activities').select('*').order('name');
      if (activitiesRes.error) {
        handleSupabaseError('Cargar talleres', activitiesRes.error);
      } else {
        const loadedActivities = (activitiesRes.data || []).map(mapDbActivityToActivity);
        setActivities(loadedActivities);
      }

      // 4. Cargar Alumnos y Matrículas
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

      // 5. Cargar Pagos y Recibos
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

      // 6. Cargar Gastos del Centro
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

      // 7. Cargar Sesiones y Asistencias
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

      // 8. Cargar Liquidaciones de Monitores
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

      // 9. Cargar Configuración Global ('app_config')
      try {
        const configRes = await supabase.from('app_config').select('*');
        if (!configRes.error && configRes.data && configRes.data.length > 0) {
          const loadedConfigs: AppConfigSetting[] = configRes.data.map((c: any) => ({
            id: c.id,
            config_key: c.config_key,
            config_value: c.config_value,
            is_active: Boolean(c.is_active),
            description: c.description,
            updated_at: c.updated_at
          }));
          setAppConfigs(loadedConfigs);
          localStorage.setItem('triskell_app_configs', JSON.stringify(loadedConfigs));
        }
      } catch (e) {
        console.warn('app_config fetch error:', e);
      }

      // 10. Cargar Últimas notas / Comunicados
      try {
        const notesRes = await supabase.from('news_notes').select('*').order('date', { ascending: false });
        if (!notesRes.error && notesRes.data && notesRes.data.length > 0) {
          const loadedNotes: NewsNote[] = notesRes.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            date: n.date,
            category: n.category || 'general',
            author: n.author,
            pinned: Boolean(n.pinned)
          }));
          setNewsNotes(loadedNotes);
          localStorage.setItem('triskell_news_notes', JSON.stringify(loadedNotes));
        }
      } catch (e) {
        console.warn('news_notes fetch error:', e);
      }


    } catch (err: any) {
      handleSupabaseError('Sincronización general', err);
    } finally {
      setIsLoadingDb(false);
    }
  }, [handleSupabaseError, currentTeacherId, currentStudentId]);

  // Cargar perfil del usuario desde Supabase auth.users y public.profiles con control estricto de autorización (Whitelisting)
  const syncUserProfile = useCallback(async (userId: string, userEmail?: string, userMeta?: any) => {
    try {
      if (!userEmail) {
        await supabase.auth.signOut();
        setCurrentUser(null);
        return;
      }

      const emailNormalized = userEmail.toLowerCase().trim();
      const isMasterAdmin = emailNormalized === 'cristino.conde@actriskell.org';

      // 1. Buscar en profiles por ID o por email
      const { data: profileByUid } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data: profileByEmail } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', emailNormalized)
        .maybeSingle();

      const existingProfile = profileByUid || profileByEmail;

      // 2. Buscar si el correo fue dado de alta en profesores o alumnos
      const { data: teacherMatch } = await supabase
        .from('teachers')
        .select('*')
        .ilike('email', emailNormalized)
        .maybeSingle();

      const { data: studentMatch } = await supabase
        .from('students')
        .select('*')
        .ilike('email', emailNormalized)
        .maybeSingle();

      // Comprobar si el usuario fue autorizado previamente por el Administrador
      const isWhitelisted = isMasterAdmin || Boolean(existingProfile) || Boolean(teacherMatch) || Boolean(studentMatch);

      if (!isWhitelisted) {
        console.warn(`[TRISKELL AUTH] Acceso no autorizado para correo: ${emailNormalized}`);
        await supabase.auth.signOut();
        setCurrentUser(null);
        setDbError(`Acceso Denegado: El correo "${userEmail}" no ha sido dado de alta por la Administración de TRISKELL. Solicita al administrador tu alta para poder acceder.`);
        return;
      }

      // Determinar rol
      let role: UserRole = 'student';
      if (isMasterAdmin) {
        role = 'admin';
      } else if (existingProfile?.role) {
        role = existingProfile.role as UserRole;
      } else if (teacherMatch && studentMatch) {
        role = 'teacher_student';
      } else if (teacherMatch) {
        role = 'teacher';
      } else if (studentMatch) {
        role = 'student';
      }

      const fullName = existingProfile?.full_name || teacherMatch?.name || studentMatch?.name || userMeta?.full_name || userMeta?.name || userEmail.split('@')[0] || 'Usuario';
      const avatarUrl = existingProfile?.avatar_url || teacherMatch?.avatar_url || userMeta?.avatar_url || userMeta?.picture || undefined;
      const teacherId = existingProfile?.teacher_id || teacherMatch?.id || undefined;
      const studentId = existingProfile?.student_id || studentMatch?.id || undefined;

      // Vincular o actualizar la fila en profiles con el auth user id
      await supabase.from('profiles').upsert({
        id: userId,
        email: emailNormalized,
        full_name: fullName,
        avatar_url: avatarUrl || null,
        role: role,
        teacher_id: teacherId || null,
        student_id: studentId || null
      });

      const authUserObj: AuthUser = {
        id: userId,
        email: emailNormalized,
        name: fullName,
        photoURL: avatarUrl,
        role: role,
        teacherId: teacherId,
        studentId: studentId,
        provider: userMeta?.iss?.includes('google') ? 'google' : 'email',
        lastLogin: new Date().toISOString()
      };

      setCurrentUser(authUserObj);
      setCurrentRoleState(role);
      if (teacherId) setCurrentTeacherId(teacherId);
      if (studentId) setCurrentStudentId(studentId);

      // Guardar en caché local para desbloqueo rápido / biométrico
      cacheAuthSession({
        email: emailNormalized,
        name: fullName,
        role: role,
        userId: userId,
        timestamp: Date.now()
      });

    } catch (e: any) {
      console.error('Error synchronizing user profile:', e);
      handleSupabaseError('Sincronizar perfil de usuario', e);
    }
  }, [handleSupabaseError]);

  // Suscripción al estado de Auth de Supabase
  useEffect(() => {
    let mounted = true;

    // Verificar sesión existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        syncUserProfile(session.user.id, session.user.email, session.user.user_metadata);
      } else {
        // Verificar si hay sesión recordada en caché o biometría
        const cached = getCachedAuthSession();
        const storedBio = getStoredBiometricUser();

        // Si hay sesión recordada y NO tiene biometría obligatoria, restaurar
        if (cached && !storedBio) {
          setCurrentUser({
            id: cached.userId || 'cached-usr',
            email: cached.email,
            name: cached.name,
            role: (cached.role as UserRole) || 'student',
            provider: 'email',
            lastLogin: new Date(cached.timestamp).toISOString()
          });
          setCurrentRoleState((cached.role as UserRole) || 'student');
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecoveryMode(true);
        setIsAuthModalOpen(true);
      }
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
      const emailNorm = email.toLowerCase().trim();

      // Verificar primero que el correo esté autorizado por el administrador
      const isMaster = emailNorm === 'cristino.conde@actriskell.org';
      const [profileCheck, teacherCheck, studentCheck] = await Promise.all([
        supabase.from('profiles').select('id').ilike('email', emailNorm).maybeSingle(),
        supabase.from('teachers').select('id').ilike('email', emailNorm).maybeSingle(),
        supabase.from('students').select('id').ilike('email', emailNorm).maybeSingle()
      ]);

      const isWhitelisted = isMaster || Boolean(profileCheck.data) || Boolean(teacherCheck.data) || Boolean(studentCheck.data);

      if (!isWhitelisted) {
        return {
          success: false,
          error: `Acceso no autorizado: El correo "${email}" no figura en el registro de usuarios de la asociación. Contacta con la Coordinación para que dé de alta tu cuenta.`
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailNorm,
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

  // Cambio de contraseña para el usuario autenticado en Supabase Auth
  const changePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    clearDbError();
    try {
      const trimmed = newPassword.trim();
      if (trimmed.length < 6) {
        return {
          success: false,
          error: 'La nueva contraseña debe tener al menos 6 caracteres.'
        };
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        return {
          success: false,
          error: 'No hay una sesión activa de Supabase Auth. Inicia sesión con tu correo y contraseña actual o solicita un correo de restablecimiento.'
        };
      }

      const { error } = await supabase.auth.updateUser({ password: trimmed });
      if (error) {
        handleSupabaseError('Cambiar contraseña', error);
        return { success: false, error: error.message };
      }

      setIsPasswordRecoveryMode(false);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'No se pudo actualizar la contraseña.' };
    }
  };

  // Solicitar enlace de restablecimiento / cambio de contraseña por correo
  const requestPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    clearDbError();
    try {
      const emailNorm = email.trim().toLowerCase();
      if (!emailNorm) {
        return { success: false, error: 'Introduce tu correo electrónico.' };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(emailNorm, {
        redirectTo: window.location.origin
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'No se pudo enviar el correo de recuperación.' };
    }
  };

  // Cierre de sesión en Supabase
  const logout = async () => {
    try {
      clearCachedAuthSession();
      setIsPasswordRecoveryMode(false);
      await supabase.auth.signOut();
      setCurrentUser(null);
    } catch (e) {
      console.error('Error logging out:', e);
    }
  };

  // Configuración Global ('app_config')
  const updateAppConfig = async (config_key: string, config_value: string, is_active: boolean) => {
    setAppConfigs(prev => {
      const updated = prev.map(c =>
        c.config_key === config_key
          ? { ...c, config_value, is_active, updated_at: new Date().toISOString() }
          : c
      );
      localStorage.setItem('triskell_app_configs', JSON.stringify(updated));
      return updated;
    });

    try {
      const { error } = await supabase.from('app_config').upsert({
        config_key,
        config_value,
        is_active,
        updated_at: new Date().toISOString()
      });
      if (error) {
        console.warn('Could not persist to Supabase app_config:', error.message);
      }
    } catch (e) {
      console.warn('app_config persistence error:', e);
    }
  };

  const addAppConfig = async (config: AppConfigSetting) => {
    setAppConfigs(prev => {
      const filtered = prev.filter(c => c.config_key !== config.config_key);
      const updated = [...filtered, { ...config, updated_at: new Date().toISOString() }];
      localStorage.setItem('triskell_app_configs', JSON.stringify(updated));
      return updated;
    });

    try {
      await supabase.from('app_config').upsert({
        config_key: config.config_key,
        config_value: config.config_value,
        is_active: config.is_active,
        description: config.description,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('app_config upsert error:', e);
    }
  };

  const deleteAppConfig = async (config_key: string) => {
    setAppConfigs(prev => {
      const updated = prev.filter(c => c.config_key !== config_key);
      localStorage.setItem('triskell_app_configs', JSON.stringify(updated));
      return updated;
    });

    try {
      await supabase.from('app_config').delete().eq('config_key', config_key);
    } catch (e) {
      console.warn('app_config delete error:', e);
    }
  };

  // Últimas notas / Comunicados
  const addNewsNote = async (note: Omit<NewsNote, 'id'>) => {
    const newNote: NewsNote = {
      ...note,
      id: `note-${Date.now()}`
    };
    setNewsNotes(prev => {
      const updated = [newNote, ...prev];
      localStorage.setItem('triskell_news_notes', JSON.stringify(updated));
      return updated;
    });

    try {
      await supabase.from('news_notes').insert([newNote]);
    } catch (e) {
      console.warn('news_notes insert error:', e);
    }
  };

  const deleteNewsNote = async (id: string) => {
    setNewsNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('triskell_news_notes', JSON.stringify(updated));
      return updated;
    });

    try {
      await supabase.from('news_notes').delete().eq('id', id);
    } catch (e) {
      console.warn('news_notes delete error:', e);
    }
  };

  // Biometría
  const enableBiometrics = async (): Promise<boolean> => {
    if (!currentUser) throw new Error('Debes haber iniciado sesión para activar biometría.');
    const ok = await registerBiometricCredential(
      currentUser.id,
      currentUser.email,
      currentUser.name,
      currentUser.role
    );
    if (ok) {
      setBiometricUserState(getStoredBiometricUser());
    }
    return ok;
  };

  const disableBiometrics = () => {
    disableBiometricsUtil();
    setBiometricUserState(null);
  };

  const unlockWithBiometrics = async (): Promise<boolean> => {
    try {
      const user = await authenticateWithBiometrics();
      if (user) {
        const authUserObj: AuthUser = {
          id: user.credentialId,
          email: user.email,
          name: user.name,
          role: (user.role as UserRole) || 'student',
          lastLogin: new Date().toISOString()
        };
        setCurrentUser(authUserObj);
        setCurrentRoleState((user.role as UserRole) || 'student');

        cacheAuthSession({
          email: user.email,
          name: user.name,
          role: user.role,
          userId: user.credentialId,
          timestamp: Date.now()
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error unlocking with biometrics:', err);
      throw err;
    }
  };


  // ==============================================================================
  // GESTIÓN EXCLUSIVA DE USUARIOS POR EL ADMINISTRADOR (auth.users + profiles)
  // ==============================================================================

  const createUserByAdmin = async (params: {
    email: string;
    fullName: string;
    role: UserRole;
    password?: string;
    teacherId?: string;
    studentId?: string;
    createTeacherProfile?: boolean;
    createStudentProfile?: boolean;
  }): Promise<{ success: boolean; error?: string; tempPassword?: string }> => {
    clearDbError();
    try {
      const emailNorm = params.email.toLowerCase().trim();
      const fullNameClean = params.fullName.trim();
      const tempPassword = (params.password || `Triskell${Math.floor(1000 + Math.random() * 9000)}!`).trim();

      if (!emailNorm || !emailNorm.includes('@')) {
        return { success: false, error: 'El correo electrónico no es válido.' };
      }
      if (tempPassword.length < 6) {
        return { success: false, error: 'La contraseña debe tener al menos 6 caracteres para Supabase Auth.' };
      }

      // 0. Verificar sesión JWT real del Administrador para evitar fallos RLS posteriores
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
      if (sessionErr || !sessionData?.session?.access_token) {
        return {
          success: false,
          error: 'No hay una sesión real activa de Administrador en Supabase Auth. Inicia sesión con Google o correo/contraseña antes de dar de alta usuarios.'
        };
      }

      // 1. Crear PRIMERO en auth.users con cliente aislado (no pisa la sesión del Admin)
      const isolatedAuth = createIsolatedAuthClient();
      const { data: authData, error: authError } = await isolatedAuth.auth.signUp({
        email: emailNorm,
        password: tempPassword,
        options: {
          data: {
            full_name: fullNameClean,
            role: params.role
          }
        }
      });

      if (authError) {
        const msg = authError.message || 'Error en Supabase Auth al registrar el usuario.';
        if (msg.toLowerCase().includes('signups not allowed')) {
          return {
            success: false,
            error: 'Supabase Auth tiene desactivado el registro (Signups not allowed). Activa "Allow new users to sign up" en Supabase Auth o usa una Edge Function con service_role.'
          };
        }
        return { success: false, error: `Error en Supabase Auth: ${msg}` };
      }

      const newAuthUserId = authData?.user?.id;
      if (!newAuthUserId) {
        return {
          success: false,
          error: 'Supabase Auth no devolvió ningún ID de usuario (auth.users). Operación abortada.'
        };
      }

      // En Supabase, si el email ya existe y Confirm Email está activo, devuelve identities = []
      if (Array.isArray(authData.user?.identities) && authData.user.identities.length === 0) {
        return {
          success: false,
          error: `El correo "${emailNorm}" ya existe en Supabase Auth (auth.users).`
        };
      }

      let linkedTeacherId = params.teacherId || null;
      let linkedStudentId = params.studentId || null;

      // 2. Si se solicitó crear ficha de monitor automática (o reutilizar por email)
      if ((params.role === 'teacher' || params.role === 'teacher_student') && params.createTeacherProfile && !linkedTeacherId) {
        const { data: existingTeacher, error: findTeacherErr } = await supabase
          .from('teachers')
          .select('id')
          .ilike('email', emailNorm)
          .maybeSingle();

        if (findTeacherErr) {
          return { success: false, error: `Usuario creado en Auth, pero error consultando monitores: ${findTeacherErr.message}` };
        }

        if (existingTeacher?.id) {
          linkedTeacherId = existingTeacher.id;
        } else {
          const { data: newTeacher, error: teacherErr } = await supabase
            .from('teachers')
            .insert([{
              name: fullNameClean,
              email: emailNorm,
              payment_scheme: 'per_class',
              rate_per_class: 25,
              fixed_monthly_rate: 0,
              revenue_share_percent: 60,
              preferred_payment_method: 'cash',
              collection_type: 'personal',
              active: true
            }])
            .select('id')
            .single();

          if (teacherErr) {
            return { success: false, error: `Usuario creado en Auth (${newAuthUserId}), pero error al crear ficha de Monitor: ${teacherErr.message}` };
          }
          linkedTeacherId = newTeacher.id;
        }
      }

      // 3. Si se solicitó crear ficha de alumno automática (o reutilizar por email)
      if ((params.role === 'student' || params.role === 'teacher_student') && params.createStudentProfile && !linkedStudentId) {
        const { data: existingStudent, error: findStudentErr } = await supabase
          .from('students')
          .select('id')
          .ilike('email', emailNorm)
          .maybeSingle();

        if (findStudentErr) {
          return { success: false, error: `Usuario creado en Auth, pero error consultando alumnos: ${findStudentErr.message}` };
        }

        if (existingStudent?.id) {
          linkedStudentId = existingStudent.id;
        } else {
          const { data: newStudent, error: studentErr } = await supabase
            .from('students')
            .insert([{
              name: fullNameClean,
              email: emailNorm,
              status: 'active',
              registered_at: new Date().toISOString().split('T')[0]
            }])
            .select('id')
            .single();

          if (studentErr) {
            return { success: false, error: `Usuario creado en Auth (${newAuthUserId}), pero error al crear ficha de Alumno: ${studentErr.message}` };
          }
          linkedStudentId = newStudent.id;
        }
      }

      // 4. Registrar o actualizar en public.profiles con el ID exacto de auth.users
      const { error: profileErr } = await supabase
        .from('profiles')
        .upsert(
          {
            id: newAuthUserId,
            email: emailNorm,
            full_name: fullNameClean,
            role: params.role,
            teacher_id: linkedTeacherId,
            student_id: linkedStudentId
          },
          { onConflict: 'id' }
        );

      if (profileErr) {
        return {
          success: false,
          error: `Usuario creado en Auth (${newAuthUserId}), pero error al vincular public.profiles: ${profileErr.message}`
        };
      }

      await refreshFromSupabase();
      return { success: true, tempPassword };
    } catch (err: any) {
      console.error('Error creating user by administrator:', err);
      return { success: false, error: err.message || 'Error inesperado al registrar el usuario' };
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    clearDbError();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        handleSupabaseError('Actualizar rol de usuario', error);
        return;
      }

      setProfiles(prev =>
        prev.map(p => (p.id === userId ? { ...p, role: newRole } : p))
      );
    } catch (e: any) {
      handleSupabaseError('Actualizar rol', e);
    }
  };

  const deleteUserAccess = async (userId: string) => {
    clearDbError();
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        handleSupabaseError('Revocar acceso de usuario', error);
        return;
      }

      setProfiles(prev => prev.filter(p => p.id !== userId));
    } catch (e: any) {
      handleSupabaseError('Revocar acceso', e);
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

  const upsertEnrollmentRow = async (
    studentId: string,
    activityId: string,
    customPrice?: number
  ): Promise<{ error: any }> => {
    const act = activities.find(a => a.id === activityId);
    const payload = {
      student_id: studentId,
      activity_id: activityId,
      custom_price: customPrice !== undefined ? customPrice : null,
      billing_mode: act?.billingMode || 'monthly',
      enrolled_since: new Date().toISOString().split('T')[0],
      active: true
    };

    const res = await supabase
      .from('student_enrollments')
      .upsert(payload, { onConflict: 'student_id,activity_id' });

    if (res.error && (res.error.code === '42P10' || res.error.message?.includes('no unique or exclusion constraint'))) {
      const { data: existing } = await supabase
        .from('student_enrollments')
        .select('id')
        .eq('student_id', studentId)
        .eq('activity_id', activityId)
        .maybeSingle();

      if (existing?.id) {
        return await supabase
          .from('student_enrollments')
          .update(payload)
          .eq('id', existing.id);
      }
      return await supabase.from('student_enrollments').insert([payload]);
    }

    return res;
  };

  const enrollStudentInActivity = async (
    studentId: string,
    activityId: string,
    customPrice?: number
  ): Promise<{ success: boolean; error?: string }> => {
    clearDbError();
    const { error } = await upsertEnrollmentRow(studentId, activityId, customPrice);

    if (error) {
      handleSupabaseError('Inscribir alumno en taller', error);
      return { success: false, error: error.message };
    }
    await refreshFromSupabase();
    return { success: true };
  };

  const enrollUserFromProfile: AppContextType['enrollUserFromProfile'] = async ({
    profile,
    activityId,
    customPrice
  }) => {
    clearDbError();
    try {
      const emailNorm = (profile.email || '').trim().toLowerCase();

      // 1. Resolver si ya existe ficha en `students` (por studentId, profileId o email)
      let resolvedStudent = students.find(
        s =>
          (profile.studentId && s.id === profile.studentId) ||
          s.profileId === profile.id ||
          (emailNorm && s.email.toLowerCase().trim() === emailNorm)
      );

      let resolvedStudentId = resolvedStudent?.id || profile.studentId;

      if (!resolvedStudentId && emailNorm) {
        const { data: existingByEmail } = await supabase
          .from('students')
          .select('id')
          .ilike('email', emailNorm)
          .maybeSingle();
        if (existingByEmail?.id) {
          resolvedStudentId = existingByEmail.id;
        }
      }

      // 2. Si es monitor/admin/usuario de `profiles` sin ficha en `students`, crearla automáticamente
      if (!resolvedStudentId) {
        const basePayload = {
          name: profile.name,
          email: emailNorm || null,
          phone: null,
          status: 'active',
          notes:
            profile.role === 'teacher' || profile.role === 'teacher_student'
              ? 'Monitor inscrito como alumno en taller'
              : null
        };

        const extendedPayload = {
          ...basePayload,
          profile_id: profile.id,
          validation_status: 'validated',
          registered_by: currentUser?.id || null
        };

        let insertRes = await supabase
          .from('students')
          .insert([extendedPayload])
          .select()
          .single();

        if (
          insertRes.error &&
          (insertRes.error.code === '42703' || insertRes.error.message?.includes('column'))
        ) {
          insertRes = await supabase
            .from('students')
            .insert([basePayload])
            .select()
            .single();
        }

        if (insertRes.error || !insertRes.data) {
          const msg = insertRes.error?.message || 'No se pudo crear la ficha de alumno para el perfil.';
          handleSupabaseError('Vincular usuario como alumno', insertRes.error || new Error(msg));
          return { success: false, error: msg };
        }

        resolvedStudentId = insertRes.data.id;

        // 3. Vincular student_id en profiles (y promover teacher -> teacher_student si aplica)
        const profileUpdates: Record<string, any> = { student_id: resolvedStudentId };
        if (profile.role === 'teacher') {
          profileUpdates.role = 'teacher_student';
        }
        try {
          await supabase.from('profiles').update(profileUpdates).eq('id', profile.id);
        } catch {
          // Best-effort: si RLS restringe editar profiles a otros usuarios, el trigger SQL o admin lo sincroniza
        }
      } else if (!resolvedStudent?.profileId) {
        try {
          await supabase.from('students').update({ profile_id: profile.id }).eq('id', resolvedStudentId);
        } catch {
          // Ignorar si la columna profile_id aún no existe o RLS no aplica
        }
      }

      // 4. Registrar la matrícula en student_enrollments
      const { error: enrollErr } = await upsertEnrollmentRow(resolvedStudentId!, activityId, customPrice);
      if (enrollErr) {
        handleSupabaseError('Registrar matrícula de usuario', enrollErr);
        return { success: false, error: enrollErr.message };
      }

      await refreshFromSupabase();
      return { success: true };
    } catch (err: any) {
      handleSupabaseError('Inscribir usuario existente', err);
      return { success: false, error: err?.message || 'Error al inscribir usuario' };
    }
  };

  const quickCreateAndEnrollStudent: AppContextType['quickCreateAndEnrollStudent'] = async ({
    name,
    email,
    phone,
    notes,
    activityId,
    customPrice
  }) => {
    clearDbError();
    try {
      const cleanName = name.trim();
      const cleanEmail = email?.trim().toLowerCase() || null;
      const cleanPhone = phone?.trim() || null;
      const cleanNotes = notes?.trim() || 'Alta rápida desde inscripción a taller (pendiente de validación)';

      const basePendingPayload = {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        status: 'pending_validation',
        notes: cleanNotes
      };

      const extendedPendingPayload = {
        ...basePendingPayload,
        validation_status: 'pending',
        registered_by: currentUser?.id || null
      };

      let createRes = await supabase
        .from('students')
        .insert([extendedPendingPayload])
        .select()
        .single();

      if (
        createRes.error &&
        (createRes.error.code === '42703' || createRes.error.message?.includes('column'))
      ) {
        createRes = await supabase
          .from('students')
          .insert([basePendingPayload])
          .select()
          .single();
      }

      if (createRes.error || !createRes.data) {
        const rawMsg = createRes.error?.message || 'Error al crear alumno provisional.';
        const friendlyMsg = rawMsg.includes('students_status_check')
          ? 'La restricción students_status_check en Supabase no incluye aún "pending_validation". Ejecuta el SQL de actualización.'
          : rawMsg;
        handleSupabaseError('Alta rápida de alumno pendiente', createRes.error || new Error(friendlyMsg));
        return { success: false, error: friendlyMsg };
      }

      const newStudentId = createRes.data.id;
      const { error: enrollErr } = await upsertEnrollmentRow(newStudentId, activityId, customPrice);

      if (enrollErr) {
        handleSupabaseError('Matricular alumno recién creado', enrollErr);
        await refreshFromSupabase();
        return { success: false, studentId: newStudentId, error: enrollErr.message };
      }

      await refreshFromSupabase();
      return { success: true, studentId: newStudentId };
    } catch (err: any) {
      handleSupabaseError('Alta rápida y matrícula', err);
      return { success: false, error: err?.message || 'Error inesperado al dar de alta al alumno' };
    }
  };

  const validatePendingStudent: AppContextType['validatePendingStudent'] = async (
    studentId,
    approve
  ) => {
    clearDbError();
    try {
      const targetStatus = approve ? 'active' : 'inactive';
      const extendedUpdate = {
        status: targetStatus,
        validation_status: approve ? 'validated' : 'rejected',
        validated_at: new Date().toISOString(),
        validated_by: currentUser?.id || null
      };

      let updateRes = await supabase
        .from('students')
        .update(extendedUpdate)
        .eq('id', studentId);

      if (
        updateRes.error &&
        (updateRes.error.code === '42703' || updateRes.error.message?.includes('column'))
      ) {
        updateRes = await supabase
          .from('students')
          .update({ status: targetStatus })
          .eq('id', studentId);
      }

      if (updateRes.error) {
        handleSupabaseError('Validar alta definitiva de socio', updateRes.error);
        return { success: false, error: updateRes.error.message };
      }

      await refreshFromSupabase();
      return { success: true };
    } catch (err: any) {
      handleSupabaseError('Validar socio pendiente', err);
      return { success: false, error: err?.message || 'No se pudo validar el socio' };
    }
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
        setCurrentUser,
        loginWithGoogle,
        loginWithEmail,
        changePassword,
        requestPasswordReset,
        isPasswordRecoveryMode,
        setIsPasswordRecoveryMode,
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
        profiles,
        createUserByAdmin,
        updateUserRole,
        deleteUserAccess,
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
        enrollUserFromProfile,
        quickCreateAndEnrollStudent,
        validatePendingStudent,
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
        netMonthlyBalance,
        appConfigs,
        updateAppConfig,
        addAppConfig,
        deleteAppConfig,
        newsNotes,
        addNewsNote,
        deleteNewsNote,
        isBiometricsSupported: isBiometricsSupportedState,
        hasBiometricsEnabled: Boolean(biometricUserState),
        biometricUser: biometricUserState,
        enableBiometrics,
        disableBiometrics,
        unlockWithBiometrics
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
