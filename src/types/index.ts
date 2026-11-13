export type PaymentMethod = 'cash' | 'transfer' | 'bizum' | 'card';
export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';
export type TeacherPaymentScheme = 'per_class' | 'monthly_fixed' | 'revenue_share';
export type StudentStatus = 'active' | 'inactive' | 'trial' | 'pending_validation';
export type StudentValidationStatus = 'pending' | 'validated' | 'rejected';
export type ExpenseCategory = 'rent' | 'utilities' | 'materials' | 'cleaning' | 'insurance' | 'marketing' | 'other';
export type UserRole = 'admin' | 'teacher' | 'student' | 'teacher_student';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  teacherId?: string; // Si es monitor, vincula a su perfil de profesor
  studentId?: string; // Si es alumno, vincula a su ficha de estudiante
  provider?: 'google' | 'email';
  lastLogin?: string;
  createdAt?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  avatarUrl?: string;
  paymentScheme: TeacherPaymentScheme;
  ratePerClass: number; // e.g., 25 € / clase
  fixedMonthlyRate: number; // e.g., 400 € / mes
  revenueSharePercent: number; // e.g., 60 % de cuotas de sus alumnos
  preferredPaymentMethod: PaymentMethod;
  collectionType?: 'personal' | 'association'; // Tipo de cobro: Personal (directo alumno->monitor) o Asociación
  bankAccount?: string;
  active: boolean;
  notes?: string;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  teacherId: string;
  category: string;
  color: string;
  schedule: string[];
  defaultPriceMonthly: number;
  defaultPricePerClass: number;
  billingMode: 'monthly' | 'per_class';
  bizum_enabled?: boolean;
  bizum_phone?: string;
  bizum_concept?: string;
  room: string;
  active: boolean;
}

export interface StudentActivityEnrollment {
  activityId: string;
  customPrice?: number;
  enrolledSince: string;
  billingMode: 'monthly' | 'per_class';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: StudentStatus;
  validationStatus?: StudentValidationStatus;
  profileId?: string;
  registeredBy?: string;
  validatedAt?: string;
  registeredAt: string;
  activities: StudentActivityEnrollment[];
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  receiptNumber: string;
  studentId: string;
  studentName: string;
  activityId: string;
  activityName: string;
  periodMonth: string; // "YYYY-MM" e.g., "2026-11"
  amount: number;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  collectedByTeacher: boolean;
  collectedByTeacherId?: string;
  notes?: string;
}

export interface TeacherPayout {
  id: string;
  teacherId: string;
  periodMonth: string;
  calculatedAmount: number;
  classesCount: number;
  studentsCount: number;
  collectedInHandByTeacher: number; // ya cobrado en efectivo por él
  balancePending: number; // pendiente de transferirle/pagarle
  totalSettled: number;
  status: 'settled' | 'pending';
  settledDate?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CenterExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  periodMonth: string;
  paymentMethod: PaymentMethod;
  status: 'paid' | 'pending';
  invoiceNumber?: string;
  notes?: string;
}

export interface SessionAttendanceRecord {
  studentId: string;
  studentName: string;
  attendance: 'present' | 'absent' | 'partial';
  paid: boolean;
  paidAmount?: number;
  paymentMethod?: PaymentMethod;
  paymentId?: string;
}

export interface ClassSession {
  id: string;
  activityId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  attendeesCount: number;
  durationMinutes: number;
  topic?: string;
  attendanceRecords?: SessionAttendanceRecord[];
}

export interface AppConfigSetting {
  id?: string;
  config_key: string;
  config_value: string;
  is_active: boolean;
  description?: string;
  updated_at?: string;
}

export interface NewsNote {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'noticia' | 'aviso' | 'taller' | 'general';
  author?: string;
  pinned?: boolean;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  startTime: string; // e.g., "10:00"
  endTime: string;   // e.g., "11:30"
  date: string;      // "YYYY-MM-DD"
  teacherName?: string;
  room?: string;
  activityName?: string;
  category?: string;
  billingMode?: 'monthly' | 'per_class';
  price?: number;
  description?: string;
}

