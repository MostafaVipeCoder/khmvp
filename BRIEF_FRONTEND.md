
# ملخص واجهات التطبيق

## نظرة عامة
التطبيق هو نظام لإدارة خدمات جليسة الأطفال "خالة الأطفال"، يتكون من تطبيق رئيسي (للعملاء والخالات) ولوحة إدارة إدارية منفصلة. يتم بناؤه باستخدام React + Vite + Tailwind CSS + TypeScript مع Supabase كـ Backend-as-a-Service.

---

## 1. التطبيق الرئيسي (src/components/)

### A. الواجهات المشتركة
- **AuthPage.tsx**: صفحة تسجيل الدخول والتسجيل للمستخدمين (عملاء وخالات)
- **SplashScreen.tsx**: شاشة التحميل الأولى عند تشغيل التطبيق
- **QRCodeDisplay.tsx / QRCodeScanner.tsx**: عرض ومسح رموز QR للجلسات
- **ErrorBoundary.tsx**: معالجة الأخطاء في التطبيق
- **SupportTicketsPage.tsx** (والمكونات المرتبطة): إدارة تذاكر الدعم الفني

### B. واجهات العميل (client/)
- **ClientApp.tsx**: تطبيق العميل الرئيسي (يطبق التوجيه بين الصفحات)
- **ClientHome.tsx**: الصفحة الرئيسية للعميل (بحث عن خالات، خدمات متاحة)
- **ClientProfile.tsx**: ملف تعريف العميل (تعديل بيانات، عنوان، إلخ)
- **ClientBookings.tsx**: عرض جميع الحجوزات (السابقة والقادمة)
- **ClientActiveBookings.tsx**: عرض الحجوزات النشطة حالياً
- **ClientVerification.tsx**: تقديم طلبات التحقق للعميل
- **ClientNotifications.tsx**: عرض إشعارات العميل
- **ChatPage.tsx**: شات مع الخالة المخصصة للحجز
- **SitterProfile.tsx**: عرض ملف تعريف الخالة
- **PaymentPage.tsx**: صفحة الدفع للحجز
- **TrackingPage.tsx**: تتبع موقع الخالة أثناء الجلسة
- **ReviewsPage.tsx**: عرض التقييمات والمراجعات
- **HelpCenter.tsx**: مركز المساعدة والدعم الفني

### C. واجهات الخالة (sitter/)
- **SitterApp.tsx**: تطبيق الخالة الرئيسي
- **SitterHome.tsx**: الصفحة الرئيسية للخالة
- **SitterProfile.tsx**: ملف تعريف الخالة (تعديل بيانات، خدمات، مهارات، لغات)
- **SitterBookings.tsx**: عرض حجوزات الخالة
- **BookingRequests.tsx**: عرض طلبات الحجز الجديدة (قبول/رفض)
- **RequestDetails.tsx**: تفاصيل طلب الحجز
- **AvailabilityManagement.tsx**: إدارة توافر الخالة (أوقات عمل، أيام)
- **ServicesManagement.tsx**: إدارة خدمات الخالة والأسعار
- **SitterVerification.tsx**: تقديم طلبات التحقق للخالة
- **SitterNotifications.tsx**: إشعارات الخالة
- **SitterChatPage.tsx**: شات مع العميل
- **SitterEarnings.tsx**: عرض أرباح الخالة ومعاملات المحفظة
- **SitterSessionPage.tsx**: صفحة الجلسة النشطة (بدء/إنهاء، QR)
- **SitterHeader.tsx**: رأس الصفحة للخالة
- **RequestDetails.tsx**: تفاصيل طلب الحجز
- **AvailabilityManagement.tsx**: إدارة توافر الخالة (أوقات عمل، أيام)
- **ServicesManagement.tsx**: إدارة خدمات الخالة والأسعار
- **SitterVerification.tsx**: تقديم طلبات التحقق للخالة
- **SitterNotifications.tsx**: إشعارات الخالة
- **SitterChatPage.tsx**: شات مع العميل
- **SitterEarnings.tsx**: عرض أرباح الخالة ومعاملات المحفظة
- **SitterSessionPage.tsx**: صفحة الجلسة النشطة (بدء/إنهاء، QR)
- **SitterHeader.tsx**: رأس الصفحة للخالة

### D. واجهات الإدارة القديمة (admin/) - مُستعملة في التطبيق الرئيسي
- **AdminApp.tsx**: تطبيق الإدارة القديم (تم استبداله بـ admin-dashboard)
- **AdminLogin.tsx**: صفحة تسجيل دخول الإدارة
- **AdminSidebar.tsx**: الشريط الجانبي للإدارة
- **AdminDashboardStats.tsx**: إحصائيات لوحة التحكم
- **AdminFinanceCharts.tsx**: مخططات مالية
- **AdminSitterManagement.tsx**: إدارة الخالات
- **AdminClientVerification.tsx**: التحقق من العملاء
- **AdminActiveOrdersView.tsx**: عرض الطلبات النشطة
- **AdminInterviewsView.tsx**: مقابلات التوظيف للخالات
- **WithdrawalManagement.tsx**: إدارة السحوبات
- **DisputesPage.tsx**: إدارة النزاعات والدعم الفني
- **AdminDisputesPage.tsx**: إدارة النزاعات والدعم الفني
- **AdminSupportTicketsPage.tsx**: إدارة تذاكر الدعم الفني
- **PaymentManagement.tsx**: إدارة الدفعات
- **AdminNotificationsPage.tsx**: إدارة الإشعارات
- **AdminReviewsPage.tsx**: إدارة التقييمات والمراجعات
- **AdminTrackingPage.tsx**: إدارة تتبع الخالات
- **AdminWalletsPage.tsx**: إدارة المحافظ
- **AdminInterviewsView.tsx**: مقابلات التوظيف للخالات
- **AdminPermissionsSettings.tsx**: إعدادات الصلاحيات
- **AdminChatPage.tsx**: شات مع العملاء
- **AdminBookings.tsx**: عرض جميع الحجوزات
- **AdminActiveBookings.tsx**: عرض الحجوزات النشطة
- **AdminVerification.tsx**: تقديم طلبات التحقق للعملاء
- **AdminNotifications.tsx**: عرض إشعارات العميل
- **AdminChatPage.tsx**: شات مع الخالة المخصصة للحجز
- **SitterProfile.tsx**: عرض ملف تعريف الخالة
- **PaymentPage.tsx**: صفحة الدفع للحجز
- **TrackingPage.tsx**: تتبع موقع الخالة أثناء الجلسة
- **ReviewsPage.tsx**: عرض التقييمات والمراجعات
- **HelpCenter.tsx**: مركز المساعدة والدعم الفني
- **DisputesPage.tsx**: إدارة النزاعات والدعم الفني
---

## 2. لوحة التحكم الإدارية (admin-dashboard/)

### المكونات الرئيسية:
- **AdminSidebar.tsx**: شريط التنقل الجانبي مع دعم الصلاحيات
- **AdminLogin.tsx**: صفحة تسجيل دخول الإدارة
- **AdminDashboardStats.tsx**: بطاقات الإحصائيات الرئيسية (عدد العملاء، الخالات، إلخ)
- **AdminFinanceCharts.tsx**: مخططات مالية تفصيلية
- **AdminSitterManagement.tsx**: إدارة الخالات (تعديل، تحقق، إلخ)
- **AdminClientVerification.tsx**: إدارة العملاء وطلبات التحقق
- **AdminActiveOrdersView.tsx**: عرض وإدارة الطلبات النشطة
- **AdminInterviewsView.tsx**: إدارة مقابلات التوظيف للخالات
- **WithdrawalManagement.tsx**: إدارة طلبات السحوبات للخالات
- **AdminPermissionsSettings.tsx**: إعدادات الصلاحيات (للسوبر أدمن فقط)
- **AdminAddClient.tsx**: إضافة عميل جديد يدويًا (بدون حساب مستخدم)
- **AdminAddOrder.tsx**: إضافة طلب حجز جديد يدويًا
- **App.tsx**: التطبيق الرئيسي للوحة التحكم (يطبق الصلاحيات والتوجيه)
- 
