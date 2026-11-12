import { Teacher, Activity, Student, PaymentRecord, TeacherPayout, CenterExpense, ClassSession, AppConfigSetting, NewsNote } from '../types';

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 't-1',
    name: 'Alex Fente',
    email: 'alex.fente@actriskell.org',
    phone: '+34 000 000 000',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    paymentScheme: 'per_class',
    ratePerClass: 30, // 30€ por clase impartida
    fixedMonthlyRate: 0,
    revenueSharePercent: 0,
    preferredPaymentMethod: 'transfer',
    collectionType: 'personal', // Por defecto: cobro directo alumno -> monitor
    bankAccount: 'ES45 2100 0418 4502 0005 1234',
    active: true,
    notes: 'Instructora certificada en Yoga Vinyasa y Hatha. Imparte martes y jueves.'
  },
  {
    id: 't-2',
    name: 'Maria Haz',
    email: 'maria.haz@actriskell.org',
    phone: '+34 620 987 654',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    paymentScheme: 'revenue_share',
    ratePerClass: 0,
    fixedMonthlyRate: 0,
    revenueSharePercent: 65, // 65% de las cuotas de sus alumnos
    preferredPaymentMethod: 'cash',
    collectionType: 'personal', // Por defecto: cobro directo alumno -> monitor
    bankAccount: '',
    active: true,
    notes: 'Monitor de Guitarra acústica y clásica. Cobro habitualmente en mano.'
  },
  {
    id: 't-3',
    name: 'Nuria Garrido Rivas',
    email: 'nuria.garrido@actriskell.org',
    phone: '+34 655 432 109',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    paymentScheme: 'monthly_fixed',
    ratePerClass: 0,
    fixedMonthlyRate: 550, // 550€ fijas al mes
    revenueSharePercent: 0,
    preferredPaymentMethod: 'transfer',
    collectionType: 'personal', // Por defecto: cobro directo alumno -> monitor
    bankAccount: 'ES89 0049 1500 0512 3456 7890',
    active: true,
    notes: 'Fisioterapeuta y monitora de Pilates Suelo y Espalda Sana.'
  },
  {
    id: 't-4',
    name: 'Bieito Romero',
    email: 'bieito.romero@actriskell.org',
    phone: '+34 000 000 000',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    paymentScheme: 'per_class',
    ratePerClass: 25,
    fixedMonthlyRate: 0,
    revenueSharePercent: 0,
    preferredPaymentMethod: 'bizum',
    collectionType: 'personal', // Por defecto: cobro directo alumno -> monitor
    bankAccount: '',
    active: true,
    notes: 'Monitor Gaita Iniciación.'
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    name: 'Yoga Vinyasa Flow',
    description: 'Secuencias dinámicas de respiración y posturas para fuerza y flexibilidad.',
    teacherId: 't-1',
    category: 'Yoga',
    color: 'emerald',
    schedule: ['Martes 18:30 - 19:45', 'Jueves 18:30 - 19:45'],
    defaultPriceMonthly: 50,
    defaultPricePerClass: 10,
    billingMode: 'monthly',
    bizum_enabled: true,
    bizum_phone: '+34 612 345 678',
    bizum_concept: 'Yoga Vinyasa',
    room: 'Sala Principal Zen',
    active: true
  },
  {
    id: 'act-2',
    name: 'Pilates Suelo & Espalda Sana',
    description: 'Reeducación postural, fortalecimiento del core y prevención de dolores lumbares.',
    teacherId: 't-3',
    category: 'Pilates',
    color: 'teal',
    schedule: ['Lunes 10:00 - 11:00', 'Miércoles 10:00 - 11:00'],
    defaultPriceMonthly: 45,
    defaultPricePerClass: 9,
    billingMode: 'monthly',
    bizum_enabled: false,
    room: 'Sala Tatami',
    active: true
  },
  {
    id: 'act-3',
    name: 'Guitarra Acústica & Solfeo',
    description: 'Técnica de dedos, acordes, armonía y repertorio clásico y contemporáneo.',
    teacherId: 't-2',
    category: 'Música',
    color: 'amber',
    schedule: ['Viernes 17:00 - 19:00'],
    defaultPriceMonthly: 60,
    defaultPricePerClass: 15,
    billingMode: 'per_class', // Modalidad de cobro por clase
    bizum_enabled: true,
    bizum_phone: '+34 620 987 654',
    bizum_concept: 'Clase Guitarra',
    room: 'Sala Acústica 2',
    active: true
  },
  {
    id: 'act-4',
    name: 'Francés Conversación B1/B2',
    description: 'Clases prácticas en grupos reducidos enfocadas en fluidez oral y cultura.',
    teacherId: 't-4',
    category: 'Idiomas',
    color: 'indigo',
    schedule: ['Miércoles 19:00 - 20:30'],
    defaultPriceMonthly: 40,
    defaultPricePerClass: 12,
    billingMode: 'monthly',
    bizum_enabled: true,
    bizum_phone: '+34 689 112 233',
    bizum_concept: 'Frances B1',
    room: 'Aula Biblioteca',
    active: true
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'st-1',
    name: 'Lucía Fernández Ramos',
    email: 'lucia.fdez@gmail.com',
    phone: '+34 633 111 222',
    status: 'active',
    registeredAt: '2026-01-15',
    activities: [
      { activityId: 'act-1', enrolledSince: '2026-01-15', billingMode: 'monthly' },
      { activityId: 'act-2', enrolledSince: '2026-03-01', billingMode: 'monthly' }
    ],
    notes: 'Asiste a Yoga y Pilates. Siempre puntual.'
  },
  {
    id: 'st-2',
    name: 'Alejandro Sanz Navarro',
    email: 'alejandro.sanz.n@hotmail.com',
    phone: '+34 644 222 333',
    status: 'active',
    registeredAt: '2026-02-10',
    activities: [
      { activityId: 'act-3', enrolledSince: '2026-02-10', billingMode: 'monthly' }
    ],
    notes: 'Paga habitualmente en efectivo en mano a Carlos.'
  },
  {
    id: 'st-3',
    name: 'Marina Casado Prieto',
    email: 'marina.casado@yahoo.es',
    phone: '+34 655 333 444',
    status: 'active',
    registeredAt: '2026-03-05',
    activities: [
      { activityId: 'act-1', customPrice: 45, enrolledSince: '2026-03-05', billingMode: 'monthly' } // Tarifa especial conveniada
    ],
    notes: 'Descuento especial por socia fundadora.'
  },
  {
    id: 'st-4',
    name: 'Javier Domínguez Cano',
    email: 'javi.cano@gmail.com',
    phone: '+34 666 444 555',
    status: 'active',
    registeredAt: '2026-04-12',
    activities: [
      { activityId: 'act-2', enrolledSince: '2026-04-12', billingMode: 'monthly' }
    ]
  },
  {
    id: 'st-5',
    name: 'Clara Valverde Gil',
    email: 'clara.valverde@gmail.com',
    phone: '+34 677 555 666',
    status: 'active',
    registeredAt: '2026-05-20',
    activities: [
      { activityId: 'act-4', enrolledSince: '2026-05-20', billingMode: 'monthly' }
    ]
  },
  {
    id: 'st-6',
    name: 'Mateo Ortiz Bermejo',
    email: 'mateo.ortiz@gmail.com',
    phone: '+34 688 666 777',
    status: 'active',
    registeredAt: '2026-06-01',
    activities: [
      { activityId: 'act-3', enrolledSince: '2026-06-01', billingMode: 'monthly' },
      { activityId: 'act-4', enrolledSince: '2026-09-10', billingMode: 'monthly' }
    ]
  },
  {
    id: 'st-7',
    name: 'Sofía Romero Campos',
    email: 'sofia.romero@gmail.com',
    phone: '+34 699 777 888',
    status: 'active',
    registeredAt: '2026-08-15',
    activities: [
      { activityId: 'act-1', enrolledSince: '2026-08-15', billingMode: 'monthly' }
    ]
  },
  {
    id: 'st-8',
    name: 'David Méndez Salgado',
    email: 'david.mendez@outlook.com',
    phone: '+34 610 888 999',
    status: 'active',
    registeredAt: '2026-09-01',
    activities: [
      { activityId: 'act-2', enrolledSince: '2026-09-01', billingMode: 'monthly' }
    ]
  }
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  // Noviembre 2026
  {
    id: 'pay-2611-01',
    receiptNumber: 'REC-2026-1101',
    studentId: 'st-1',
    studentName: 'Lucía Fernández Ramos',
    activityId: 'act-1',
    activityName: 'Yoga Vinyasa Flow',
    periodMonth: '2026-11',
    amount: 50,
    paymentDate: '2026-11-03',
    paymentMethod: 'transfer',
    status: 'paid',
    collectedByTeacher: false,
    notes: 'Transferencia bancaria recibida en cuenta central'
  },
  {
    id: 'pay-2611-02',
    receiptNumber: 'REC-2026-1102',
    studentId: 'st-1',
    studentName: 'Lucía Fernández Ramos',
    activityId: 'act-2',
    activityName: 'Pilates Suelo & Espalda Sana',
    periodMonth: '2026-11',
    amount: 45,
    paymentDate: '2026-11-03',
    paymentMethod: 'transfer',
    status: 'paid',
    collectedByTeacher: false
  },
  {
    id: 'pay-2611-03',
    receiptNumber: 'REC-2026-1103',
    studentId: 'st-2',
    studentName: 'Alejandro Sanz Navarro',
    activityId: 'act-3',
    activityName: 'Guitarra Acústica & Solfeo',
    periodMonth: '2026-11',
    amount: 60,
    paymentDate: '2026-11-05',
    paymentMethod: 'cash',
    status: 'paid',
    collectedByTeacher: true,
    collectedByTeacherId: 't-2',
    notes: 'Cobrado en mano por Carlos (profesor)'
  },
  {
    id: 'pay-2611-04',
    receiptNumber: 'REC-2026-1104',
    studentId: 'st-3',
    studentName: 'Marina Casado Prieto',
    activityId: 'act-1',
    activityName: 'Yoga Vinyasa Flow',
    periodMonth: '2026-11',
    amount: 45,
    paymentDate: '2026-11-02',
    paymentMethod: 'bizum',
    status: 'paid',
    collectedByTeacher: false
  },
  {
    id: 'pay-2611-05',
    receiptNumber: 'REC-2026-1105',
    studentId: 'st-4',
    studentName: 'Javier Domínguez Cano',
    activityId: 'act-2',
    activityName: 'Pilates Suelo & Espalda Sana',
    periodMonth: '2026-11',
    amount: 45,
    paymentDate: undefined,
    paymentMethod: 'cash',
    status: 'pending',
    collectedByTeacher: false,
    notes: 'Avisó que paga en la próxima clase'
  },
  {
    id: 'pay-2611-06',
    receiptNumber: 'REC-2026-1106',
    studentId: 'st-5',
    studentName: 'Clara Valverde Gil',
    activityId: 'act-4',
    activityName: 'Francés Conversación B1/B2',
    periodMonth: '2026-11',
    amount: 40,
    paymentDate: '2026-11-04',
    paymentMethod: 'transfer',
    status: 'paid',
    collectedByTeacher: false
  },
  {
    id: 'pay-2611-07',
    receiptNumber: 'REC-2026-1107',
    studentId: 'st-6',
    studentName: 'Mateo Ortiz Bermejo',
    activityId: 'act-3',
    activityName: 'Guitarra Acústica & Solfeo',
    periodMonth: '2026-11',
    amount: 60,
    paymentDate: undefined,
    paymentMethod: 'bizum',
    status: 'pending',
    collectedByTeacher: false
  },
  {
    id: 'pay-2611-08',
    receiptNumber: 'REC-2026-1108',
    studentId: 'st-6',
    studentName: 'Mateo Ortiz Bermejo',
    activityId: 'act-4',
    activityName: 'Francés Conversación B1/B2',
    periodMonth: '2026-11',
    amount: 40,
    paymentDate: '2026-11-06',
    paymentMethod: 'card',
    status: 'paid',
    collectedByTeacher: false
  },
  {
    id: 'pay-2611-09',
    receiptNumber: 'REC-2026-1109',
    studentId: 'st-7',
    studentName: 'Sofía Romero Campos',
    activityId: 'act-1',
    activityName: 'Yoga Vinyasa Flow',
    periodMonth: '2026-11',
    amount: 50,
    paymentDate: '2026-11-07',
    paymentMethod: 'bizum',
    status: 'paid',
    collectedByTeacher: false
  },
  {
    id: 'pay-2611-10',
    receiptNumber: 'REC-2026-1110',
    studentId: 'st-8',
    studentName: 'David Méndez Salgado',
    activityId: 'act-2',
    activityName: 'Pilates Suelo & Espalda Sana',
    periodMonth: '2026-11',
    amount: 45,
    paymentDate: undefined,
    paymentMethod: 'transfer',
    status: 'pending',
    collectedByTeacher: false
  },

  // Octubre 2026 (Histórico cerrado)
  {
    id: 'pay-2610-01',
    receiptNumber: 'REC-2026-1001',
    studentId: 'st-1',
    studentName: 'Lucía Fernández Ramos',
    activityId: 'act-1',
    activityName: 'Yoga Vinyasa Flow',
    periodMonth: '2026-10',
    amount: 50,
    paymentDate: '2026-10-02',
    paymentMethod: 'transfer',
    status: 'paid',
    collectedByTeacher: false
  },
  {
    id: 'pay-2610-02',
    receiptNumber: 'REC-2026-1002',
    studentId: 'st-1',
    studentName: 'Lucía Fernández Ramos',
    activityId: 'act-2',
    activityName: 'Pilates Suelo & Espalda Sana',
    periodMonth: '2026-10',
    amount: 45,
    paymentDate: '2026-10-02',
    paymentMethod: 'transfer',
    status: 'paid',
    collectedByTeacher: false
  },
  {
    id: 'pay-2610-03',
    receiptNumber: 'REC-2026-1003',
    studentId: 'st-2',
    studentName: 'Alejandro Sanz Navarro',
    activityId: 'act-3',
    activityName: 'Guitarra Acústica & Solfeo',
    periodMonth: '2026-10',
    amount: 60,
    paymentDate: '2026-10-04',
    paymentMethod: 'cash',
    status: 'paid',
    collectedByTeacher: true,
    collectedByTeacherId: 't-2'
  },
  {
    id: 'pay-2610-04',
    receiptNumber: 'REC-2026-1004',
    studentId: 'st-3',
    studentName: 'Marina Casado Prieto',
    activityId: 'act-1',
    activityName: 'Yoga Vinyasa Flow',
    periodMonth: '2026-10',
    amount: 45,
    paymentDate: '2026-10-03',
    paymentMethod: 'bizum',
    status: 'paid',
    collectedByTeacher: false
  },
  {
    id: 'pay-2610-05',
    receiptNumber: 'REC-2026-1005',
    studentId: 'st-4',
    studentName: 'Javier Domínguez Cano',
    activityId: 'act-2',
    activityName: 'Pilates Suelo & Espalda Sana',
    periodMonth: '2026-10',
    amount: 45,
    paymentDate: '2026-10-05',
    paymentMethod: 'cash',
    status: 'paid',
    collectedByTeacher: false
  },
  {
    id: 'pay-2610-06',
    receiptNumber: 'REC-2026-1006',
    studentId: 'st-5',
    studentName: 'Clara Valverde Gil',
    activityId: 'act-4',
    activityName: 'Francés Conversación B1/B2',
    periodMonth: '2026-10',
    amount: 40,
    paymentDate: '2026-10-04',
    paymentMethod: 'transfer',
    status: 'paid',
    collectedByTeacher: false
  },
  {
    id: 'pay-2610-07',
    receiptNumber: 'REC-2026-1007',
    studentId: 'st-6',
    studentName: 'Mateo Ortiz Bermejo',
    activityId: 'act-3',
    activityName: 'Guitarra Acústica & Solfeo',
    periodMonth: '2026-10',
    amount: 60,
    paymentDate: '2026-10-06',
    paymentMethod: 'bizum',
    status: 'paid',
    collectedByTeacher: false
  },
  {
    id: 'pay-2610-08',
    receiptNumber: 'REC-2026-1008',
    studentId: 'st-7',
    studentName: 'Sofía Romero Campos',
    activityId: 'act-1',
    activityName: 'Yoga Vinyasa Flow',
    periodMonth: '2026-10',
    amount: 50,
    paymentDate: '2026-10-05',
    paymentMethod: 'bizum',
    status: 'paid',
    collectedByTeacher: false
  },
  {
    id: 'pay-2610-09',
    receiptNumber: 'REC-2026-1009',
    studentId: 'st-8',
    studentName: 'David Méndez Salgado',
    activityId: 'act-2',
    activityName: 'Pilates Suelo & Espalda Sana',
    periodMonth: '2026-10',
    amount: 45,
    paymentDate: '2026-10-08',
    paymentMethod: 'transfer',
    status: 'paid',
    collectedByTeacher: false
  }
];

export const INITIAL_EXPENSES: CenterExpense[] = [
  {
    id: 'exp-2611-01',
    title: 'Alquiler del local (Noviembre)',
    category: 'rent',
    amount: 650,
    date: '2026-11-01',
    periodMonth: '2026-11',
    paymentMethod: 'transfer',
    status: 'paid',
    invoiceNumber: 'FAC-LOC-2026-11',
    notes: 'Local planta baja calle Mayor'
  },
  {
    id: 'exp-2611-02',
    title: 'Suministro Eléctrico & Climatización',
    category: 'utilities',
    amount: 115.40,
    date: '2026-11-05',
    periodMonth: '2026-11',
    paymentMethod: 'transfer',
    status: 'paid',
    invoiceNumber: 'IBD-89472'
  },
  {
    id: 'exp-2611-03',
    title: 'Esterillas y bloques de Yoga (Reposición)',
    category: 'materials',
    amount: 85.00,
    date: '2026-11-07',
    periodMonth: '2026-11',
    paymentMethod: 'card',
    status: 'paid',
    invoiceNumber: 'DEC-2026-9912'
  },
  {
    id: 'exp-2611-04',
    title: 'Seguro de Responsabilidad Civil (Cuota mensual)',
    category: 'insurance',
    amount: 68.50,
    date: '2026-11-02',
    periodMonth: '2026-11',
    paymentMethod: 'transfer',
    status: 'paid'
  },

  // Octubre 2026
  {
    id: 'exp-2610-01',
    title: 'Alquiler del local (Octubre)',
    category: 'rent',
    amount: 650,
    date: '2026-10-01',
    periodMonth: '2026-10',
    paymentMethod: 'transfer',
    status: 'paid'
  },
  {
    id: 'exp-2610-02',
    title: 'Suministro Eléctrico & Climatización',
    category: 'utilities',
    amount: 98.20,
    date: '2026-10-05',
    periodMonth: '2026-10',
    paymentMethod: 'transfer',
    status: 'paid'
  },
  {
    id: 'exp-2610-03',
    title: 'Servicio de limpieza y desinfección',
    category: 'cleaning',
    amount: 90.00,
    date: '2026-10-28',
    periodMonth: '2026-10',
    paymentMethod: 'transfer',
    status: 'paid'
  }
];

export const INITIAL_SESSIONS: ClassSession[] = [
  // Elena Morales (Yoga) - t-1 (per_class: 30€ / clase)
  { id: 'ses-1', activityId: 'act-1', teacherId: 't-1', date: '2026-11-03', attendeesCount: 3, durationMinutes: 75, topic: 'Apertura de cadera y Surya Namaskar B' },
  { id: 'ses-2', activityId: 'act-1', teacherId: 't-1', date: '2026-11-05', attendeesCount: 3, durationMinutes: 75, topic: 'Fuerza en brazos y posturas invertidas' },
  { id: 'ses-3', activityId: 'act-1', teacherId: 't-1', date: '2026-11-10', attendeesCount: 2, durationMinutes: 75, topic: 'Torsiones y flexiones hacia adelante' },
  { id: 'ses-4', activityId: 'act-1', teacherId: 't-1', date: '2026-11-12', attendeesCount: 3, durationMinutes: 75, topic: 'Respiración pranayama y relajación guiada' },

  // Nuria Garrido (Pilates) - t-3 (monthly_fixed: 550€)
  { id: 'ses-5', activityId: 'act-2', teacherId: 't-3', date: '2026-11-02', attendeesCount: 3, durationMinutes: 60, topic: 'Control pélvico e introduces The Hundred' },
  { id: 'ses-6', activityId: 'act-2', teacherId: 't-3', date: '2026-11-04', attendeesCount: 3, durationMinutes: 60, topic: 'Columna articulada y serie abdominal' },
  { id: 'ses-7', activityId: 'act-2', teacherId: 't-3', date: '2026-11-09', attendeesCount: 2, durationMinutes: 60, topic: 'Estabilidad de hombro con bandas elásticas' },

  // Carlos Benítez (Guitarra) - t-2 (revenue_share: 65%)
  { id: 'ses-8', activityId: 'act-3', teacherId: 't-2', date: '2026-11-06', attendeesCount: 2, durationMinutes: 120, topic: 'Círculo de quintas y técnica de arpegios' },

  // Marc Dubois (Francés) - t-4 (per_class: 25€)
  { id: 'ses-9', activityId: 'act-4', teacherId: 't-4', date: '2026-11-04', attendeesCount: 2, durationMinutes: 90, topic: 'Debate de actualidad y subjuntivo presente' }
];

export const INITIAL_PAYOUTS: TeacherPayout[] = [
  // Liquidación del mes pasado (Octubre 2026) ya saldada
  {
    id: 'payout-2610-t1',
    teacherId: 't-1',
    periodMonth: '2026-10',
    calculatedAmount: 240, // 8 clases x 30€
    classesCount: 8,
    studentsCount: 3,
    collectedInHandByTeacher: 0,
    balancePending: 0,
    totalSettled: 240,
    status: 'settled',
    settledDate: '2026-10-31',
    paymentMethod: 'transfer',
    notes: 'Transferencia realizada con éxito.'
  },
  {
    id: 'payout-2610-t2',
    teacherId: 't-2',
    periodMonth: '2026-10',
    calculatedAmount: 78, // 65% de 120€ recaudados = 78€
    classesCount: 4,
    studentsCount: 2,
    collectedInHandByTeacher: 60, // Alejandro le dio 60€ en mano
    balancePending: 0,
    totalSettled: 18, // Se le transfirieron los 18€ restantes
    status: 'settled',
    settledDate: '2026-10-31',
    paymentMethod: 'transfer',
    notes: 'Saldada la diferencia entre lo cobrado en mano y su 65%.'
  },
  {
    id: 'payout-2610-t3',
    teacherId: 't-3',
    periodMonth: '2026-10',
    calculatedAmount: 550,
    classesCount: 8,
    studentsCount: 3,
    collectedInHandByTeacher: 0,
    balancePending: 0,
    totalSettled: 550,
    status: 'settled',
    settledDate: '2026-10-31',
    paymentMethod: 'transfer'
  }
];

export const INITIAL_APP_CONFIGS: AppConfigSetting[] = [
  {
    config_key: 'popup_notification',
    config_value: '¡Bienvenidos al nuevo ciclo de talleres y actividades en la Asociación Cultural Triskell! Recuerda consultar el calendario y los horarios de clase con tu monitor.',
    is_active: true,
    description: 'Aviso emergente mostrado al entrar a la aplicación tras la pantalla de bienvenida'
  },
  {
    config_key: 'google_calendar',
    config_value: 'triskell_calendario_general@actriskell.org',
    is_active: true,
    description: 'Integración y visualización del calendario en vivo con tira semanal de 7 días'
  },
  {
    config_key: 'news_enabled',
    config_value: 'Tablón de avisos y últimas notas activo para todos los usuarios',
    is_active: true,
    description: 'Habilita la sección de últimas notas y comunicados oficiales de la asociación'
  },
  {
    config_key: 'association_name',
    config_value: 'Asociación Cultural y de Bienestar TRISKELL',
    is_active: true,
    description: 'Nombre visible de la entidad y membrete oficial'
  },
  {
    config_key: 'bizum_general',
    config_value: '+34 612 345 678',
    is_active: true,
    description: 'Teléfono oficial para cobros de cuotas y actividades por Bizum'
  }
];

export const INITIAL_NEWS_NOTES: NewsNote[] = [
  {
    id: 'note-1',
    title: 'Apertura de inscripciones para el nuevo ciclo de Yoga y Meditación',
    content: 'Comenzamos nuevo bloque formativo en Sala 1. Los alumnos inscritos pueden abonar sus cuotas directamente en mano con la monitora Elena Morales o vía Bizum oficial.',
    date: '2026-11-10',
    category: 'taller',
    author: 'Administración Triskell',
    pinned: true
  },
  {
    id: 'note-2',
    title: 'Nueva funcionalidad: Desbloqueo Biométrico y Sesión Segura',
    content: 'Ahora puedes activar tu Huella o Face ID / Passkey en este dispositivo para entrar a tu portal sin tener que volver a escribir tu usuario y contraseña.',
    date: '2026-11-09',
    category: 'aviso',
    author: 'Administración',
    pinned: false
  },
  {
    id: 'note-3',
    title: 'Horario especial de fin de semana y talleres monográficos',
    content: 'El próximo sábado tendremos el taller intensivo de Cerámica y Escultura creativa en Sala 2. Plazas limitadas a 12 participantes.',
    date: '2026-11-08',
    category: 'noticia',
    author: 'Nuria Garrido',
    pinned: false
  }
];

