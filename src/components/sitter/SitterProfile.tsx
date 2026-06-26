import { Star, Loader2, Moon, Sun, Languages, LogOut, Trash2, Plus, Edit, Shield, Check, Upload, ChevronLeft, ChevronRight, Eye, Headphones, CreditCard } from 'lucide-react';
import SupportTicketsPage from '../common/SupportTicketsPage';
import PaymentHistory from '../common/PaymentHistory';
import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useAuthStore } from '../../stores/useAuthStore';
import { sitterService } from '../../services/sitter';
import { bookingService } from '../../services/booking';
import { reviewService } from '../../services/review';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import type { Language } from '../../App';

interface SitterProfileProps {
  language: Language;
  onLogout: () => void;
  onLanguageChange: () => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
  onBack?: () => void;
}

const translations = {
  ar: {
    profile: 'الملف الشخصي',
    personalInfo: 'المعلومات الشخصية',
    verification: 'التوثيق',
    availability: 'الأوقات المتاحة',
    availabilitySettings: 'إعدادات التوفر',
    atHomeOnly: 'متاحة في المنزل فقط',
    outsideOnly: 'متاحة خارج المنزل فقط',
    both: 'متاحة في المنزل وخارج المنزل',
    skills: 'المهارات',
    photos: 'الصور',
    services: 'الخدمات',
    myServices: 'خدماتي',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    location: 'الموقع',
    bio: 'نبذة عني',
    experience: 'سنوات الخبرة',
    edit: 'تعديل',
    save: 'حفظ',
    cancel: 'إلغاء',
    verified: 'موثق',
    notVerified: 'غير موثق',
    idCard: 'بطاقة الهوية',
    introVideo: 'فيديو تعريفي',
    certificates: 'الشهادات',
    uploadIdCard: 'رفع بطاقة الهوية',
    uploadVideo: 'رفع فيديو',
    uploadCertificate: 'رفع شهادة',
    addSkill: 'إضافة مهارة',
    skillName: 'اسم المهارة',
    addPhoto: 'إضافة صورة',
    logout: 'تسجيل خروج',
    memberSince: 'عضو منذ',
    rating: 'التقييم',
    reviews: 'تقييم',
    completedJobs: 'جلسة مكتملة',
    egp: 'جنيه',
    delete: 'حذف',
    languages: 'اللغات',
    addLanguage: 'إضافة لغة',
    language: 'اللغة',
    stats: 'الإحصائيات',
    verificationStatus: 'حالة التوثيق',
    pending: 'قيد المراجعة',
    approved: 'موثق',
    rejected: 'مرفوض',
    theme: 'المظهر',
    lightMode: 'الوضع النهاري',
    darkMode: 'الوضع الليلي',
    serviceOutside: 'مرافقة خارج المنزل',
    serviceWeekly: 'جلسات اسبوعية',
    serviceMonthly: 'جلسات شهرية',
    setPrice: 'تحديد سعر الساعة',
    minPriceError: 'سعر الساعة لا يجب أن يقل عن 30 جنيه',
    homeServices: 'خدمات منزلية',
    outsideServices: 'خدمات خارجية',
    contactSupport: 'تواصل مع الدعم',
    success: 'تمت العملية بنجاح',
    error: 'حدث خطأ ما',
    visibilitySettings: 'إعدادات الظهور',
    visibilityDesc: 'عند تعطيل هذه الخاصية، لن تظهري للعملاء في نتائج البحث، ولكن ستظلين قادرة على إكمال طلباتك الحالية.',
    activeStatus: 'الحساب نشط الآن',
    inactiveStatus: 'الحساب متوقف حالياً'
  },
  en: {
    profile: 'Profile',
    personalInfo: 'Personal Information',
    verification: 'Verification',
    availability: 'Availability',
    availabilitySettings: 'Availability Settings',
    atHomeOnly: 'Available at home only',
    outsideOnly: 'Available outside only',
    both: 'Available at home and outside',
    skills: 'Skills',
    photos: 'Photos',
    services: 'Services',
    myServices: 'My Services',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone Number',
    location: 'Location',
    bio: 'About Me',
    experience: 'Years of Experience',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    verified: 'Verified',
    notVerified: 'Not Verified',
    idCard: 'ID Card',
    introVideo: 'Intro Video',
    certificates: 'Certificates',
    uploadIdCard: 'Upload ID Card',
    uploadVideo: 'Upload Video',
    uploadCertificate: 'Upload Certificate',
    addSkill: 'Add Skill',
    skillName: 'Skill Name',
    addPhoto: 'Add Photo',
    logout: 'Logout',
    memberSince: 'Member Since',
    rating: 'Rating',
    reviews: 'reviews',
    completedJobs: 'completed jobs',
    egp: 'EGP',
    delete: 'Delete',
    languages: 'Languages',
    addLanguage: 'Add Language',
    language: 'Language',
    stats: 'Statistics',
    verificationStatus: 'Verification Status',
    pending: 'Pending Review',
    approved: 'Verified',
    rejected: 'Rejected',
    theme: 'Theme',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    serviceOutside: 'Accompaniment Outside Home',
    serviceWeekly: 'Weekly Sessions',
    serviceMonthly: 'Monthly Sessions',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    setPrice: 'Set Hourly Rate',
    minPriceError: 'Hourly rate must be at least 30 EGP',
    homeServices: 'Home Services',
    outsideServices: 'Outside Services',
    contactSupport: 'Contact Support',
    success: 'Operation Successful',
    error: 'Something went wrong',
    visibilitySettings: 'Visibility Settings',
    visibilityDesc: 'When disabled, you will not appear in client search results, but you can still complete your ongoing bookings.',
    activeStatus: 'Account is Active',
    inactiveStatus: 'Account is Paused'
  }
};

export default function SitterProfile({ language, onLogout, onLanguageChange, theme, onThemeChange, onBack }: SitterProfileProps) {
  const { user } = useAuthStore();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddSkillDialog, setShowAddSkillDialog] = useState(false);
  const [showAddLanguageDialog, setShowAddLanguageDialog] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeView, setActiveView] = useState<'profile' | 'support' | 'payments'>('profile');
  const t = translations[language];

  const [profile, setProfile] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    location: '',
    bio: '',
    experience: 0,
    rating: 5.0,
    reviews: 0,
    completedJobs: 0,
    memberSince: '',
    isVerified: false,
    avatarUrl: ''
  });

  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<{ id: string, skill: string }[]>([]);
  const [languagesList, setLanguagesList] = useState<{ id: string, language: string }[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [availabilityType, setAvailabilityType] = useState<'home' | 'outside' | 'both'>('both');
  const [isActive, setIsActive] = useState(true);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
      loadExtensions();
      loadRatings();

      const channel = supabase
        .channel(`profile-updates-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          (payload) => {
            const updatedProfile = payload.new as any;
            if (updatedProfile.is_verified !== undefined) {
              setProfile(prev => ({ ...prev, isVerified: updatedProfile.is_verified }));
              if (updatedProfile.is_verified) {
                toast.success(language === 'ar' ? 'تم توثيق حسابك بنجاح!' : 'Your account has been verified!');
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  const loadRatings = async () => {
    try {
      if (!user?.id) return;
      const { average, count } = await reviewService.getSitterAverageRating(user.id);
      setProfile(prev => ({
        ...prev,
        rating: count > 0 ? average : 5.0,
        reviews: count
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (!user?.id) return;
      const data = await sitterService.getProfile(user.id);
      const bookings = await bookingService.getSitterBookings(user.id);
      const completedCount = bookings.filter((b: any) => b.status === 'completed').length;

      if (data) {
        setProfile(prev => ({
          ...prev,
          name: data.full_name || user?.user_metadata?.full_name || '',
          email: user?.email || '',
          phone: data.phone || user?.user_metadata?.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          experience: data.experience_years || 0,
          isVerified: data.is_verified || false,
          memberSince: data.created_at ? new Date(data.created_at).toLocaleDateString() : '',
          completedJobs: completedCount,
          avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
        }));
        if (data.availability_type) setAvailabilityType(data.availability_type);
        setIsActive((data as any).is_active ?? true);
      }
    } catch {
      console.error('Error loading profile');
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  const loadExtensions = async () => {
    try {
      if (!user?.id) return;
      const [skillsData, languagesData] = await Promise.all([
        sitterService.getSkills(user.id),
        sitterService.getLanguages(user.id)
      ]);
      if (skillsData) setSkills(skillsData.map((s: any) => ({ id: s.id, skill: s.skill })));
      if (languagesData) setLanguagesList(languagesData.map((l: any) => ({ id: l.id, language: l.language })));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'ar' ? 'حجم الصورة يجب أن لا يتعدى 5 ميجابايت' : 'Image size must be less than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error(language === 'ar' ? 'يجب أن تكون الصورة بصيغة JPG, PNG أو WebP' : 'Image must be JPG, PNG or WebP');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const url = await sitterService.updateAvatar(user.id, file);
      setProfile(prev => ({ ...prev, avatarUrl: url }));
      toast.success(t.success);
    } catch (error) {
      console.error(error);
      toast.error(t.error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!user?.id) return;
      await sitterService.updateProfile(user.id, {
        full_name: profile.name,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        experience_years: profile.experience,
        availability_type: availabilityType,
        is_active: isActive as any
      });
      setIsEditingProfile(false);
      toast.success(t.success);
    } catch (error) {
      console.error(error);
      toast.error(t.error);
    }
  };

  const handleToggleVisibility = async () => {
    if (!user?.id || isUpdatingVisibility) return;
    try {
      setIsUpdatingVisibility(true);
      const newStatus = !isActive;
      await sitterService.updateProfile(user.id, { is_active: newStatus as any });
      setIsActive(newStatus);
      toast.success(t.success);
    } catch (error) {
      console.error(error);
      toast.error(t.error);
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  const handleAddSkill = async () => {
    if (newSkill.trim() && user?.id) {
      try {
        await sitterService.addSkill(user.id, newSkill);
        setNewSkill('');
        setShowAddSkillDialog(false);
        await loadExtensions();
        toast.success(t.success);
      } catch (error) {
        toast.error(t.error);
      }
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await sitterService.removeSkill(id);
      setSkills(skills.filter(s => s.id !== id));
    } catch (error) {
      toast.error(t.error);
    }
  };

  const handleAddLanguage = async () => {
    if (newLanguage.trim() && user?.id) {
      try {
        await sitterService.addLanguage(user.id, newLanguage);
        setNewLanguage('');
        setShowAddLanguageDialog(false);
        await loadExtensions();
        toast.success(t.success);
      } catch (error) {
        toast.error(t.error);
      }
    }
  };

  const handleDeleteLanguage = async (id: string) => {
    try {
      await sitterService.removeLanguage(id);
      setLanguagesList(languagesList.filter(l => l.id !== id));
      toast.success(t.success);
    } catch (error) {
      toast.error(t.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FB5E7A]" />
      </div>
    );
  }

  if (activeView === 'support') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 pt-6 pb-4 -mx-4 px-8 mb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setActiveView('profile')} className="rounded-full">
              {language === 'ar' ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
            </Button>
            <h1 className="text-[#FB5E7A] text-2xl font-bold">
              {language === 'ar' ? 'تذاكر الدعم الفني' : 'Support Tickets'}
            </h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4">
          <SupportTicketsPage onBack={() => setActiveView('profile')} />
        </div>
      </div>
    );
  }

  if (activeView === 'payments') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
        <div className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 pt-6 pb-4 -mx-4 px-8 mb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setActiveView('profile')} className="rounded-full">
              {language === 'ar' ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
            </Button>
            <h1 className="text-[#FB5E7A] text-2xl font-bold">
              {language === 'ar' ? 'سجل المدفوعات' : 'Payment History'}
            </h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4">
          <PaymentHistory onBack={() => setActiveView('profile')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-gray-50 dark:bg-gray-900 pt-6 pb-4 -mx-4 px-8 mb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            {language === 'ar' ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
          </Button>
          <h1 className="text-[#FB5E7A] text-2xl font-bold">{t.profile}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative group">
              <div
                className={`w-20 h-20 rounded-full bg-[#FFD1DA] flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-[#FB5E7A] transition-all cursor-pointer ${isUploadingAvatar ? 'opacity-50' : ''}`}
                onClick={() => document.getElementById('avatar-input')?.click()}
              >
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#FB5E7A]" />
                  </div>
                )}
              </div>
              <input id="avatar-input" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
              <p className="text-[10px] text-gray-500 text-center mt-2 w-24 mx-auto">
                {language === 'ar' ? 'JPG, PNG - بحد أقصى 5 ميجا' : 'JPG, PNG - Max 5MB'}
              </p>
              {profile.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-[#FB5E7A] mb-1">{profile.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t.memberSince} {profile.memberSince}</p>
              {profile.isVerified && (
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  <Shield className="w-3 h-3 mr-1" />
                  {t.verified}
                </Badge>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-[#FB5E7A] mb-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{profile.rating}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{profile.reviews} {t.reviews}</p>
            </div>
            <div className="text-center">
              <div className="text-[#FB5E7A] mb-1">{profile.completedJobs}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t.completedJobs}</p>
            </div>
          </div>
        </Card>

        {/* Visibility Toggle */}
        <Card className="p-6 mb-6 border-2 transition-all duration-300 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-[#FB5E7A]" />
              <h3 className="font-bold">{t.visibilitySettings}</h3>
            </div>
            <Button
              variant={isActive ? "default" : "outline"}
              className={isActive ? "bg-green-600 hover:bg-green-700" : "border-red-500 text-red-500 cursor-pointer"}
              onClick={handleToggleVisibility}
              disabled={isUpdatingVisibility}
            >
              {isUpdatingVisibility ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : isActive ? <Check className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              {isActive ? t.activeStatus : t.inactiveStatus}
            </Button>
          </div>
          <p className="text-sm text-gray-500">{t.visibilityDesc}</p>
        </Card>

        {/* Personal Information */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3>{t.personalInfo}</h3>
            {!isEditingProfile && (
              <Button variant="ghost" size="sm" onClick={() => setIsEditingProfile(true)} className="text-[#FB5E7A]">
                <Edit className="w-4 h-4 mr-2" />
                {t.edit}
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t.fullName}</Label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                disabled={true}
                className="bg-gray-50 cursor-not-allowed"
              />
              {isEditingProfile && (
                <p className="text-[10px] text-gray-500 mt-1">
                  {language === 'ar' ? '* لا يمكن تغيير الاسم' : '* Name cannot be changed'}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t.email}</Label>
              <Input
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                disabled={true}
                className="bg-gray-50 cursor-not-allowed"
              />
              {isEditingProfile && (
                <p className="text-[10px] text-gray-500 mt-1">
                  {language === 'ar' ? '* لا يمكن تغيير البريد الإلكتروني' : '* Email cannot be changed'}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t.phone}</Label>
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={!isEditingProfile} />
            </div>
            <div className="space-y-2">
              <Label>{t.location}</Label>
              <Input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} disabled={!isEditingProfile} />
            </div>
            <div className="space-y-2">
              <Label>{t.bio}</Label>
              <Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} disabled={!isEditingProfile} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>{t.experience}</Label>
              <Input type="number" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: parseInt(e.target.value) || 0 })} disabled={!isEditingProfile} />
            </div>
            {isEditingProfile && (
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} className="flex-1 bg-[#FB5E7A]">
                  {t.save}
                </Button>
                <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="flex-1">
                  {t.cancel}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Availability Settings */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3>{t.availabilitySettings}</h3>
            <Button onClick={handleSaveProfile} size="sm" className="bg-[#FB5E7A]">
              {t.save}
            </Button>
          </div>
          <div className="space-y-3">
            {['home', 'outside', 'both'].map((type) => (
              <div
                key={type}
                onClick={() => setAvailabilityType(type as any)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${availabilityType === type ? 'border-[#FB5E7A] bg-[#FFD1DA]/20' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <h4 className="mb-1">{t[`${type}Only` as keyof typeof t] || t.both}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {language === 'ar' ? 'سأكون متاحة للعمل حسب الاختيار' : 'I will be available based on this choice'}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Skills */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3>{t.skills}</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowAddSkillDialog(true)} className="text-[#FB5E7A]">
              <Plus className="w-4 h-4 mr-2" />
              {t.addSkill}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skillItem) => (
              <Badge key={skillItem.id} className="bg-[#FFD1DA] text-[#FB5E7A] pr-1">
                {skillItem.skill}
                <button onClick={() => handleDeleteSkill(skillItem.id)} className="ml-2 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </Card>

        {/* Languages */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3>{t.languages}</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowAddLanguageDialog(true)} className="text-[#FB5E7A]">
              <Plus className="w-4 h-4 mr-2" />
              {t.addLanguage}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {languagesList.map((langItem) => (
              <Badge key={langItem.id} className="bg-[#E5E7EB] text-gray-700 pr-1">
                {langItem.language}
                <button onClick={() => handleDeleteLanguage(langItem.id)} className="ml-2 hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </Card>

        {/* Support, Payments, Settings & Logout */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full border-[#FB5E7A] text-[#FB5E7A] hover:bg-[#FB5E7A]/10" onClick={() => setActiveView('support')}>
            <Headphones className="w-5 h-5 mr-2" />
            {language === 'ar' ? 'تذاكر الدعم الفني' : 'Support Tickets'}
          </Button>
          <Button variant="outline" className="w-full border-[#FB5E7A] text-[#FB5E7A] hover:bg-[#FB5E7A]/10" onClick={() => setActiveView('payments')}>
            <CreditCard className="w-5 h-5 mr-2" />
            {language === 'ar' ? 'سجل المدفوعات' : 'Payment History'}
          </Button>

          <Button variant="outline" className="w-full h-12 flex justify-between px-6 border-[#FB5E7A] text-[#FB5E7A]" onClick={onLanguageChange}>
            <div className="flex items-center gap-3">
              <Languages className="w-5 h-5" />
              <span>{t.language}</span>
            </div>
            <span>{language === 'ar' ? '🇬🇧 EN' : '🇪🇬 AR'}</span>
          </Button>

          <Button variant="outline" className="w-full h-12 flex justify-between px-6 border-[#FB5E7A] text-[#FB5E7A]" onClick={onThemeChange}>
            <div className="flex items-center gap-3">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span>{t.theme}</span>
            </div>
            <span>{theme === 'light' ? t.darkMode : t.lightMode}</span>
          </Button>

          <Button variant="outline" className="w-full h-12 border-red-500 text-red-500 hover:bg-red-50" onClick={onLogout}>
            <LogOut className="w-5 h-5 mr-3" />
            {t.logout}
          </Button>
        </div>
      </div>

      {/* Add Skill Dialog */}
      <Dialog open={showAddSkillDialog} onOpenChange={setShowAddSkillDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.addSkill}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder={t.skillName} />
            <Button onClick={handleAddSkill} className="w-full bg-[#FB5E7A]">{t.addSkill}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Language Dialog */}
      <Dialog open={showAddLanguageDialog} onOpenChange={setShowAddLanguageDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t.addLanguage}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} placeholder={t.language} />
            <Button onClick={handleAddLanguage} className="w-full bg-[#FB5E7A]">{t.addLanguage}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}