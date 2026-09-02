export enum SitterStatus {
  PENDING = 'pending',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  TRAINING = 'training',
  QUALIFIED = 'qualified',
  REJECTED = 'rejected',
}

export enum SitterWorkStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  AWAY = 'away'
}

export interface Sitter {
  id: string;
  name: string;
  phone: string;
  address: string;
  age?: string;
  qualification?: string;
  experience: string;
  availability: string; // e.g. "9 AM - 5 PM"
  idPhoto?: string;
  husbandIdPhoto?: string;
  relativeIdPhoto?: string;
  profilePhoto?: string;
  criminalRecordPhoto?: string;
  onboardingStartDate?: string;
  rank?: string;
  totalHours?: number;
  status: SitterStatus;
  workStatus: SitterWorkStatus;
  notes?: string;
  createdAt: string;
}

export enum CustomerOrderStatus {
  PENDING = 'pending',    // قيد التسكين
  ASSIGNED = 'assigned',  // تم التسكين (في انتظار البدء)
  ACTIVE = 'active',      // جاري العمل (بدأت الجلسة)
  COMPLETED = 'completed', // تم التنفيذ
  CANCELLED = 'cancelled'  // ملغي
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  childName: string;
  childAge: string;
  tasks: string;
  hoursNeeded: number;
  location: string;
  createdAt: string;
  status: CustomerOrderStatus;
  assignedSitterId?: string;
  packageId?: string;
  notes?: string;
  idPhoto?: string;
  startTime?: string;
  endTime?: string;
}

export interface Package {
  id: string;
  name: string;
  hours: number;
  price: number;
  sitterPay?: number;
  archived?: boolean;
}

export interface Invoice {
  id: string;
  customerId?: string;
  sitterId?: string;
  orderId?: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
  items: string[];
}

export interface RecruitmentCycle {
  id: string;
  month: string;
  year: number;
  startDate: string;
  targetCount: number;
  status: 'active' | 'completed' | 'planned';
  stages: {
    calls: { start: string; end: string; status: 'pending' | 'active' | 'done' };
    interviews: { start: string; end: string; status: 'pending' | 'active' | 'done' };
    training: { start: string; end: string; status: 'pending' | 'active' | 'done' };
  };
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum UserRole {
  ADMIN = 'admin',       // المدير - يرى كل شيء (بما في ذلك الأرباح والإعدادات)
  COORDINATOR = 'coordinator' // مسؤولة الخالات - ترى الجليسات، العملاء، الجلسات، والمقابلات
}

export type AppState = {
  sitters: Sitter[];
  customers: Customer[];
  invoices: Invoice[];
  packages: Package[];
  recruitmentCycles: RecruitmentCycle[];
  currentUserRole: UserRole;
};
