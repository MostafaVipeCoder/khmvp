
# ملخص الباك إند والخدمات

## نظرة عامة
يستخدم التطبيق **Supabase** كـ Backend-as-a-Service (BaaS)، حيث يوفر Supabase:
- قاعدة بيانات PostgreSQL
- مصادقة المستخدمين (Auth)
- تخزين الملفات (Storage)
- سياسات أمان على مستوى الصف (RLS)
- دال مخططات قاعدة البيانات (Migrations)

---

## 1. خدمات التكامل Supabase (src/lib/supabase.ts
- الاتصال الرئيسي بـ Supabase باستخدام مفتاح المشروع وعنوان URL
- تكوين عميل Supabase للوظائف Auth وRealtime وStorage

---

## 2. خدمات التطبيق (src/services/)
تحتوي على دوال TypeScript للتعامل مع كافة العمليات في التطبيق مع قاعدة البيانات:

| Service | الوصف |
|---------|--------|
| **booking.ts** | إدارة الحجوزات (إنشاء، تحديث، إلغاء، عرض الحجوزات) |
| **chat.ts** | إدارة الرسائل بين العملاء والخالات داخل الحجوزات |
| **children.ts** | إدارة بيانات الأطفال للعميل |
| **disputes.ts** | إدارة النزاعات (الشكاوى) |
| **location.ts** | تتبع موقع الخالة أثناء الجلسة |
| **notification.ts** | إدارة الإشعارات للمستخدمين |
| **payments.ts** | إدارة المدفوعات والحجوزات المدفوعة |
| **qr.ts** | إنشاء ومسح رموز QR للجلسات |
| **review.ts** | إدارة التقييمات والتعليقات |
| **sitter.ts** | إدارة بيانات الخالات، خدماتها، مهاراتها، توافرها |
| **supportTickets.ts** | إدارة تذاكر الدعم الفني والرسائل المرتبطة |
| **verification.ts** | إدارة طلبات التحقق للعملاء والخالات |
| **wallet.ts** | إدارة معاملات المحفظة وسحوبات الخالات |

---

## 3. دوال قاعدة البيانات (SQL Functions)
تُنشأ في قاعدة البيانات PostgreSQL:

| Function | الوصف |
|----------|--------|
| **handle_new_user()** | تشغّل تلقائيًا عند إنشاء مستخدم جديد، لإنشاء سجل في جدول profiles |
| **get_user_balance(uid UUID)** | احسب رصيد المستخدم في المحفظة |
| **get_sitter_stats(sitter_id UUID)** | احسب إحصائيات الخالة (عدد الحجوزات، إجمالي الأرباح، متوسط التقييم |
| **search_sitters(...)** | بحث عن الخالات بناءً على الأسعار، الخبرة، الخدمات، التحقق |
| **generate_client_unique_code()** | توليد كود عميل فريد (CLI-XXXXXX) |
| **assign_client_unique_code()** | تشغّل تلقائيًا عند إضافة عميل جديد لتعيين كود فريد |
| **update_updated_at_column()** | حدث عمود updated_at تلقائيًا عند تحديث سجل |

---

## 4. المشغلات (Triggers)
- **on_auth_user_created**: تشغّل handle_new_user() عند إضافة مستخدم Auth جديد
- **trigger_assign_client_unique_code** تشغّل assign_client_unique_code()** قبل** إضافة سجل إلى profiles
- **update_admin_permissions_updated_at** حدث updated_at في admin_permissions عند التعديل |

---

## 5. سياسات الأمان (RLS Policies)
تحدد من يمكنه القراءة والكتابة في كل جدول، مع دعم الأدوار الإدارية:
- **super_admin**: صلاحيات كاملة
- **client_manager**: إدارة العملاء والطلبات
- **sitter_manager**: إدارة الخالات والمقابلات
