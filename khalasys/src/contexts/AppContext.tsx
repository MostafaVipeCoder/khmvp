import React, { createContext, useContext, useEffect, useState } from 'react';
import { Customer, Sitter, Invoice, AppState, SitterStatus, SitterWorkStatus, CustomerOrderStatus, Package, RecruitmentCycle, UserRole } from '../types';
import { loadData, saveData, STORAGE_KEY } from '../lib/utils';

interface AppContextType {
  state: AppState;
  addSitter: (sitter: Omit<Sitter, 'id' | 'createdAt' | 'status' | 'workStatus'>) => void;
  updateSitter: (id: string, updates: Partial<Sitter>) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'status'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'date'>) => void;
  addPackage: (pkg: Omit<Package, 'id'>) => void;
  updatePackage: (id: string, updates: Partial<Package>) => void;
  deletePackage: (id: string) => void;
  restorePackage: (id: string) => void;
  addRecruitmentCycle: (cycle: Omit<RecruitmentCycle, 'id'>) => void;
  updateRecruitmentCycle: (id: string, updates: Partial<RecruitmentCycle>) => void;
  assignSitterToOrder: (customerId: string, sitterId: string) => void;
  startSession: (customerId: string) => void;
  endSession: (customerId: string) => void;
  setRole: (role: UserRole) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialData: AppState = {
  sitters: [
    {
      id: 's1',
      name: 'هناء محمد',
      phone: '01012345678',
      address: 'المعادي، القاهرة',
      age: '35',
      qualification: 'بكالوريوس تربية',
      experience: '5 سنوات - رعاية حديثي ولادة',
      availability: '9 ص - 5 م',
      status: SitterStatus.QUALIFIED,
      workStatus: SitterWorkStatus.AVAILABLE,
      rank: 'خالة ذهبية',
      totalHours: 240,
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      createdAt: '2024-04-15',
    },
    {
      id: 's2',
      name: 'سعاد أحمد',
      phone: '01198765432',
      address: 'مدينة نصر، القاهرة',
      age: '28',
      qualification: 'ليسانس آداب',
      experience: '3 سنوات - تعديل سلوك',
      availability: '10 ص - 6 م',
      status: SitterStatus.QUALIFIED,
      workStatus: SitterWorkStatus.BUSY,
      rank: 'خالة برونزية',
      totalHours: 120,
      profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
      createdAt: '2024-04-20',
    },
    {
      id: 's3',
      name: 'مروة علي',
      phone: '01233445566',
      address: 'التجمع، القاهرة',
      age: '24',
      qualification: 'بكالوريوس رياض أطفال',
      experience: 'حديثة تخرج - شغوفة بالتربية الإيجابية',
      availability: '8 ص - 4 م',
      status: SitterStatus.TRAINING,
      workStatus: SitterWorkStatus.AVAILABLE,
      rank: 'خالة متدربة',
      totalHours: 12,
      profilePhoto: 'https://images.unsplash.com/photo-1567532939604-b6b5b0ad2f0c?auto=format&fit=crop&q=80&w=200',
      createdAt: '2024-05-02',
    },
    {
      id: 's4',
      name: 'فاطمة حسن',
      phone: '01555667788',
      address: 'الشروق، القاهرة',
      age: '29',
      qualification: 'دبلوم فني',
      experience: 'سنتين في حضانة أطفال',
      availability: '9 ص - 3 م',
      status: SitterStatus.INTERVIEW_SCHEDULED,
      workStatus: SitterWorkStatus.AVAILABLE,
      rank: 'خالة تحت التقييم',
      totalHours: 0,
      profilePhoto: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=200',
      createdAt: '2024-05-05',
    },
    {
      id: 's5',
      name: 'نهى محمود',
      phone: '01000112233',
      address: 'الرحاب، القاهرة',
      age: '38',
      qualification: 'ثانوية عامة',
      experience: 'أم لـ 3 أطفال - خبرة عملية طويلة',
      availability: '7 ص - 2 م',
      status: SitterStatus.PENDING,
      workStatus: SitterWorkStatus.AVAILABLE,
      rank: 'متقدمة جديدة',
      totalHours: 0,
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      createdAt: '2024-05-08',
    },
    {
      id: 's6',
      name: 'ياسمين إبراهيم',
      phone: '01122334455',
      address: 'الدقي، الجيزة',
      age: '22',
      qualification: 'طالبة تمريض',
      experience: 'مهتمة بالرعاية الصحية للأطفال',
      availability: '4 م - 10 م',
      status: SitterStatus.TRAINING,
      workStatus: SitterWorkStatus.AVAILABLE,
      rank: 'خالة متدربة',
      totalHours: 8,
      profilePhoto: 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&q=80&w=200',
      createdAt: '2024-05-01',
    },
  ],

  customers: [
    {
      id: 'c1',
      name: 'سارة محمود',
      phone: '01234455667',
      address: 'التجمع الخامس، شارع التسعين',
      childName: 'ياسين',
      childAge: '3 سنوات',
      tasks: 'إطعام الطفل ومساعدته في حل الواجبات البسيطة',
      hoursNeeded: 6,
      location: 'التجمع',
      status: CustomerOrderStatus.COMPLETED,
      idPhoto: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'c2',
      name: 'ليلى يوسف',
      phone: '01277889900',
      address: 'الشيخ زايد، الحي الثامن',
      childName: 'ليان',
      childAge: 'سنتين',
      tasks: 'مرافقة الطفل واللعب معه',
      hoursNeeded: 4,
      location: 'الشيخ زايد',
      status: CustomerOrderStatus.PENDING,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'c3',
      name: 'أمل إبراهيم',
      phone: '01055667788',
      address: 'الرحاب، المرحلة الثالثة',
      childName: 'آدم',
      childAge: '5 سنوات',
      tasks: 'تعليم الحروف والأنشطة الإبداعية',
      hoursNeeded: 8,
      location: 'الرحاب',
      status: CustomerOrderStatus.ACTIVE,
      assignedSitterId: 's2',
      startTime: new Date(Date.now() - 7200000).toISOString(),
      createdAt: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 'c4',
      name: 'منى القاضي',
      phone: '01122334455',
      address: 'هليوبوليس، القاهرة',
      childName: 'عمر',
      childAge: '6 شهور',
      tasks: 'رعاية رضيع، تعقيم الرضاعات، نوم منتظم',
      hoursNeeded: 10,
      location: 'مصر الجديدة',
      status: CustomerOrderStatus.PENDING,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'c5',
      name: 'رانيا يوسف',
      phone: '01002233445',
      address: 'مدينتي، مجموعة 12',
      childName: 'فريدة',
      childAge: '4 سنوات',
      tasks: 'مرافقة للنادي والتمارين',
      hoursNeeded: 5,
      location: 'مدينتي',
      status: CustomerOrderStatus.ASSIGNED,
      assignedSitterId: 's3',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'c6',
      name: 'نادية صبري',
      phone: '01228833774',
      address: 'الشروق، الحي الثالث',
      childName: 'مالك',
      childAge: 'سنة ونصف',
      tasks: 'رعاية عامة ولعب استكشافي',
      hoursNeeded: 4,
      location: 'الشروق',
      status: CustomerOrderStatus.PENDING,
      createdAt: new Date().toISOString(),
    }
  ],
  invoices: [
    {
      id: 'INV-1001',
      customerId: 'c1',
      amount: 900,
      date: new Date(Date.now() - 86400000).toISOString(),
      status: 'paid',
      items: ['الباقة الفضية']
    },
    {
      id: 'INV-1002',
      customerId: 'c3',
      amount: 500,
      date: new Date().toISOString(),
      status: 'pending',
      items: ['الباقة البرونزية']
    }
  ],
  packages: [
    { id: '1', name: 'الباقة البرونزية', hours: 10, price: 500, sitterPay: 350 },
    { id: '2', name: 'الباقة الفضية', hours: 20, price: 900, sitterPay: 650 },
    { id: '3', name: 'الباقة الذهبية', hours: 50, price: 2000, sitterPay: 1500 },
  ],
  recruitmentCycles: [
    {
      id: 'rc1',
      month: 'مايو',
      year: 2024,
      startDate: '2024-05-01',
      targetCount: 8,
      status: 'active',
      stages: {
        calls: { start: '2024-05-01', end: '2024-05-07', status: 'done' },
        interviews: { start: '2024-05-08', end: '2024-05-10', status: 'active' },
        training: { start: '2024-05-11', end: '2024-05-25', status: 'pending' },
      }
    }
  ],
  currentUserRole: UserRole.ADMIN,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = loadData<AppState>(STORAGE_KEY, initialData);
    
    // Migration: Ensure existing data has new fields and combine with initial mock data if empty
    const sitters = (saved.sitters || []).length > 0 ? saved.sitters : initialData.sitters;
    const customers = (saved.customers || []).length > 0 ? saved.customers : initialData.customers;

    return {
      ...initialData,
      ...saved,
      sitters: sitters.map(s => ({
        ...s,
        workStatus: s.workStatus || SitterWorkStatus.AVAILABLE,
        status: s.status || SitterStatus.PENDING,
        rank: s.rank || 'خالة جديدة',
        totalHours: s.totalHours || 0
      })),
      customers: customers.map(c => ({
        ...c,
        status: c.status || CustomerOrderStatus.PENDING,
        idPhoto: c.idPhoto || undefined,
        packageId: c.packageId || undefined
      })),
      packages: (saved.packages || initialData.packages).map(p => ({
        ...p,
        archived: !!p.archived
      })),
      currentUserRole: saved.currentUserRole || UserRole.ADMIN
    };
  });

  const resetData = () => {
    setState(initialData);
    localStorage.removeItem(STORAGE_KEY);
  };

  useEffect(() => {
    saveData(STORAGE_KEY, state);
  }, [state]);

  const addSitter = (data: Omit<Sitter, 'id' | 'createdAt' | 'status' | 'workStatus'>) => {
    const newSitter: Sitter = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      status: SitterStatus.PENDING,
      workStatus: SitterWorkStatus.AVAILABLE,
      rank: 'خالة جديدة',
      totalHours: 0,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, sitters: [newSitter, ...prev.sitters] }));
  };

  const updateSitter = (id: string, updates: Partial<Sitter>) => {
    setState((prev) => ({
      ...prev,
      sitters: prev.sitters.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt' | 'status'>) => {
    const newCustomer: Customer = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      status: CustomerOrderStatus.PENDING,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, customers: [newCustomer, ...prev.customers] }));
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const assignSitterToOrder = (customerId: string, sitterId: string) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => 
        c.id === customerId ? { ...c, status: CustomerOrderStatus.ASSIGNED, assignedSitterId: sitterId } : c
      ),
      sitters: prev.sitters.map((s) => 
        s.id === sitterId ? { ...s, workStatus: SitterWorkStatus.BUSY } : s
      )
    }));
  };

  const startSession = (customerId: string) => {
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => 
        c.id === customerId ? { ...c, status: CustomerOrderStatus.ACTIVE, startTime: new Date().toISOString() } : c
      )
    }));
  };

  const endSession = (customerId: string) => {
    const customer = state.customers.find(c => c.id === customerId);
    setState((prev) => ({
      ...prev,
      customers: prev.customers.map((c) => 
        c.id === customerId ? { ...c, status: CustomerOrderStatus.COMPLETED, endTime: new Date().toISOString() } : c
      ),
      sitters: prev.sitters.map((s) => 
        s.id === customer?.assignedSitterId 
          ? { ...s, workStatus: SitterWorkStatus.AVAILABLE, totalHours: (s.totalHours || 0) + (customer?.hoursNeeded || 0) } 
          : s
      )
    }));
  };

  const addInvoice = (data: Omit<Invoice, 'id' | 'date'>) => {
    const newInvoice: Invoice = {
      ...data,
      id: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toISOString(),
    };
    setState((prev) => ({ ...prev, invoices: [newInvoice, ...prev.invoices] }));
  };

  const addPackage = (data: Omit<Package, 'id'>) => {
    const newPackage: Package = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      archived: false
    };
    setState((prev) => ({ ...prev, packages: [...prev.packages, newPackage] }));
  };

  const updatePackage = (id: string, updates: Partial<Package>) => {
    setState((prev) => ({
      ...prev,
      packages: prev.packages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const deletePackage = (id: string) => {
    setState((prev) => ({
      ...prev,
      packages: prev.packages.map((p) => p.id === id ? { ...p, archived: true } : p),
    }));
  };

  const restorePackage = (id: string) => {
    setState((prev) => ({
      ...prev,
      packages: prev.packages.map((p) => p.id === id ? { ...p, archived: false } : p),
    }));
  };

  const addRecruitmentCycle = (data: Omit<RecruitmentCycle, 'id'>) => {
    const newCycle: RecruitmentCycle = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
    };
    setState((prev) => ({ ...prev, recruitmentCycles: [newCycle, ...prev.recruitmentCycles] }));
  };

  const updateRecruitmentCycle = (id: string, updates: Partial<RecruitmentCycle>) => {
    setState((prev) => ({
      ...prev,
      recruitmentCycles: prev.recruitmentCycles.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const setRole = (role: UserRole) => {
    setState(prev => ({ ...prev, currentUserRole: role }));
  };

  return (
    <AppContext.Provider value={{ 
      state, 
      addSitter, 
      updateSitter, 
      addCustomer, 
      updateCustomer, 
      addInvoice, 
      addPackage, 
      updatePackage,
      deletePackage, 
      restorePackage,
      addRecruitmentCycle,
      updateRecruitmentCycle,
      assignSitterToOrder,
      startSession,
      endSession,
      setRole,
      resetData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
