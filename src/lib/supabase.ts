import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import {
  Teacher,
  Activity,
  Student,
  PaymentRecord,
  TeacherPayout,
  CenterExpense,
  ClassSession,
  SessionAttendanceRecord,
  StudentActivityEnrollment,
  UserRole,
  AuthUser
} from '../types';

const STORAGE_KEY = 'triskell_supabase_config';

export const DEFAULT_SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://qlpuwpktenwmptpnlusu.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_RAyfFJ0HivXJMr4quVilow_97KJWY3L'
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isEnabled: boolean;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        url: parsed.url || DEFAULT_SUPABASE_CONFIG.url,
        anonKey: parsed.anonKey || DEFAULT_SUPABASE_CONFIG.anonKey,
        isEnabled: parsed.isEnabled !== undefined ? parsed.isEnabled : true // Activado por defecto
      };
    }
  } catch (e) {
    console.error('Error reading supabase config:', e);
  }
  return {
    url: DEFAULT_SUPABASE_CONFIG.url,
    anonKey: DEFAULT_SUPABASE_CONFIG.anonKey,
    isEnabled: true // Activado por defecto
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  // Reiniciar cliente si cambian las credenciales
  supabaseInstance = null;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(customConfig?: SupabaseConfig): SupabaseClient {
  const cfg = customConfig || getStoredSupabaseConfig();
  const url = cfg.url || DEFAULT_SUPABASE_CONFIG.url;
  const anonKey = cfg.anonKey || DEFAULT_SUPABASE_CONFIG.anonKey;

  if (!supabaseInstance || customConfig) {
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }
  return supabaseInstance;
}

// Cliente exportado para uso directo
export const supabase = getSupabaseClient();

// Cliente aislado sin persistencia para altas de usuarios por el Administrador
// Evita sobrescribir el JWT y la sesión del Administrador en localStorage al llamar a auth.signUp()
export function createIsolatedAuthClient(): SupabaseClient {
  const cfg = getStoredSupabaseConfig();
  const url = cfg.url || DEFAULT_SUPABASE_CONFIG.url;
  const anonKey = cfg.anonKey || DEFAULT_SUPABASE_CONFIG.anonKey;

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: `triskell-ephemeral-auth-${Date.now()}`
    }
  });
}

// Verificación de conexión
export async function testSupabaseConnection(url: string, anonKey: string): Promise<{
  success: boolean;
  status: 'connected' | 'auth_required' | 'error';
  message: string;
}> {
  try {
    const client = createClient(url, anonKey);
    const { data, error } = await client.from('teachers').select('*').limit(1);

    if (!error) {
      return {
        success: true,
        status: 'connected',
        message: 'Conexión establecida con éxito con Supabase Cloud.'
      };
    }

    if (error.code === '42501' || error.message.includes('permission denied')) {
      return {
        success: true,
        status: 'auth_required',
        message: 'Servidor alcanzable. Las políticas RLS requieren iniciar sesión con Google/Email.'
      };
    }

    return {
      success: false,
      status: 'error',
      message: `Error de Supabase: ${error.message} (Código ${error.code})`
    };
  } catch (e: any) {
    return {
      success: false,
      status: 'error',
      message: `No se pudo conectar: ${e?.message || 'URL inválida'}`
    };
  }
}

// ==============================================================================
// TRANSFORMADORES DE DATOS: BASE DE DATOS (snake_case) <-> TYPESCRIPT (camelCase)
// ==============================================================================

export function mapDbTeacherToTeacher(row: any): Teacher {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    avatar: row.avatar_url || '',
    avatarUrl: row.avatar_url || '',
    paymentScheme: row.payment_scheme || 'per_class',
    ratePerClass: Number(row.rate_per_class) || 25,
    fixedMonthlyRate: Number(row.fixed_monthly_rate) || 0,
    revenueSharePercent: Number(row.revenue_share_percent) || 60,
    preferredPaymentMethod: row.preferred_payment_method || 'cash',
    collectionType: row.collection_type || 'personal',
    bankAccount: row.bank_account || '',
    active: row.active ?? true,
    notes: row.notes || ''
  };
}

export function mapTeacherToDb(teacher: Omit<Teacher, 'id'> | Teacher) {
  return {
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone,
    avatar_url: teacher.avatarUrl || teacher.avatar || null,
    payment_scheme: teacher.paymentScheme,
    rate_per_class: teacher.ratePerClass,
    fixed_monthly_rate: teacher.fixedMonthlyRate,
    revenue_share_percent: teacher.revenueSharePercent,
    preferred_payment_method: teacher.preferredPaymentMethod,
    collection_type: teacher.collectionType || 'personal',
    bank_account: teacher.bankAccount || null,
    active: teacher.active ?? true,
    notes: teacher.notes || null
  };
}

export function mapDbActivityToActivity(row: any): Activity {
  let schedule: string[] = [];
  if (Array.isArray(row.schedule)) {
    schedule = row.schedule;
  } else if (typeof row.schedule === 'string') {
    try {
      schedule = JSON.parse(row.schedule);
    } catch {
      schedule = [row.schedule];
    }
  }

  return {
    id: row.id,
    name: row.name || '',
    description: row.description || '',
    teacherId: row.teacher_id,
    category: row.category || 'General',
    color: row.color || 'emerald',
    schedule,
    defaultPriceMonthly: Number(row.default_price_monthly) || 0,
    defaultPricePerClass: Number(row.default_price_per_class) || 0,
    billingMode: row.billing_mode || 'monthly',
    bizum_enabled: Boolean(row.bizum_enabled),
    bizum_phone: row.bizum_phone || '',
    bizum_concept: row.bizum_concept || '',
    room: row.room || 'Sala Principal',
    active: row.active ?? true
  };
}

export function mapActivityToDb(act: Omit<Activity, 'id'> | Activity) {
  return {
    name: act.name,
    description: act.description,
    teacher_id: act.teacherId,
    category: act.category,
    color: act.color,
    schedule: act.schedule,
    default_price_monthly: act.defaultPriceMonthly,
    default_price_per_class: act.defaultPricePerClass,
    billing_mode: act.billingMode,
    bizum_enabled: Boolean(act.bizum_enabled),
    bizum_phone: act.bizum_phone || null,
    bizum_concept: act.bizum_concept || null,
    room: act.room,
    active: act.active ?? true
  };
}

export function mapDbStudentToStudent(row: any, enrollments: any[] = []): Student {
  const studentEnrollments: StudentActivityEnrollment[] = enrollments
    .filter(e => e.student_id === row.id && (e.active ?? true))
    .map(e => ({
      activityId: e.activity_id,
      customPrice: e.custom_price !== null && e.custom_price !== undefined ? Number(e.custom_price) : undefined,
      enrolledSince: e.enrolled_since || new Date().toISOString().split('T')[0],
      billingMode: e.billing_mode || 'monthly'
    }));

  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    phone: row.phone || '',
    status: row.status || 'active',
    registeredAt: row.registered_at || new Date().toISOString().split('T')[0],
    activities: studentEnrollments,
    notes: row.notes || ''
  };
}

export function mapDbPaymentToPayment(row: any, studentName = '', activityName = ''): PaymentRecord {
  return {
    id: row.id,
    receiptNumber: row.receipt_number,
    studentId: row.student_id,
    studentName: row.students?.name || studentName || 'Alumno',
    activityId: row.activity_id,
    activityName: row.activities?.name || activityName || 'Actividad',
    periodMonth: row.period_month,
    amount: Number(row.amount) || 0,
    paymentDate: row.payment_date || undefined,
    paymentMethod: row.payment_method || 'cash',
    status: row.status || 'pending',
    collectedByTeacher: Boolean(row.collected_by_teacher),
    collectedByTeacherId: row.collected_by_teacher_id || undefined,
    notes: row.notes || ''
  };
}

export function mapPaymentToDb(payment: Omit<PaymentRecord, 'id'> | PaymentRecord) {
  return {
    receipt_number: payment.receiptNumber,
    student_id: payment.studentId,
    activity_id: payment.activityId,
    period_month: payment.periodMonth,
    amount: payment.amount,
    payment_date: payment.paymentDate || null,
    payment_method: payment.paymentMethod,
    status: payment.status,
    collected_by_teacher: Boolean(payment.collectedByTeacher),
    collected_by_teacher_id: payment.collectedByTeacherId || null,
    notes: payment.notes || null
  };
}

export function mapDbSessionToSession(row: any, attendances: any[] = []): ClassSession {
  const records: SessionAttendanceRecord[] = attendances
    .filter(a => a.session_id === row.id)
    .map(a => ({
      studentId: a.student_id,
      studentName: a.students?.name || '',
      attendance: a.attendance || 'present',
      paid: Boolean(a.paid),
      paidAmount: a.paid_amount ? Number(a.paid_amount) : undefined,
      paymentMethod: a.payment_method || 'cash',
      paymentId: a.payment_id || undefined
    }));

  return {
    id: row.id,
    activityId: row.activity_id,
    teacherId: row.teacher_id,
    date: row.date,
    attendeesCount: Number(row.attendees_count) || records.filter(r => r.attendance !== 'absent').length,
    durationMinutes: Number(row.duration_minutes) || 75,
    topic: row.topic || '',
    attendanceRecords: records
  };
}

export function mapDbExpenseToExpense(row: any): CenterExpense {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    amount: Number(row.amount) || 0,
    date: row.date,
    periodMonth: row.period_month,
    paymentMethod: row.payment_method || 'transfer',
    status: row.status || 'paid',
    invoiceNumber: row.invoice_number || '',
    notes: row.notes || ''
  };
}

export function mapExpenseToDb(exp: Omit<CenterExpense, 'id'> | CenterExpense) {
  return {
    title: exp.title,
    category: exp.category,
    amount: exp.amount,
    date: exp.date,
    period_month: exp.periodMonth,
    payment_method: exp.paymentMethod,
    status: exp.status,
    invoice_number: exp.invoiceNumber || null,
    notes: exp.notes || null
  };
}

export function mapDbPayoutToPayout(row: any): TeacherPayout {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    periodMonth: row.period_month,
    calculatedAmount: Number(row.calculated_amount) || 0,
    classesCount: Number(row.classes_count) || 0,
    studentsCount: Number(row.students_count) || 0,
    collectedInHandByTeacher: Number(row.collected_in_hand_by_teacher) || 0,
    balancePending: Number(row.balance_pending) || 0,
    totalSettled: Number(row.total_settled) || 0,
    status: row.status || 'pending',
    settledDate: row.settled_date || undefined,
    paymentMethod: row.payment_method || 'transfer',
    notes: row.notes || ''
  };
}

export function mapPayoutToDb(payout: Omit<TeacherPayout, 'id'> | TeacherPayout) {
  return {
    teacher_id: payout.teacherId,
    period_month: payout.periodMonth,
    calculated_amount: payout.calculatedAmount,
    classes_count: payout.classesCount,
    students_count: payout.studentsCount,
    collected_in_hand_by_teacher: payout.collectedInHandByTeacher,
    balance_pending: payout.balancePending,
    total_settled: payout.totalSettled,
    status: payout.status,
    settled_date: payout.settledDate || null,
    payment_method: payout.paymentMethod,
    notes: payout.notes || null
  };
}
