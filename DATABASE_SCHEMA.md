
# مخطط قاعدة البيانات الكامل

## 1. جدول المستخدمين (profiles)
يخزن بيانات جميع المستخدمين (عملاء، خالات، مديرين):
- `id` UUID (PK): معرف المستخدم (مرتبط بـ auth.users)
- `full_name` TEXT: الاسم الكامل
- `avatar_url` TEXT: رابط صورة الملف الشخصي
- `bio` TEXT: سيرة ذاتية
- `location` TEXT: الموقع
- `experience_years` INTEGER: سنوات الخبرة (للخالات)
- `average_rating` NUMERIC(3,2): متوسط التقييم (1-5)
- `review_count` INTEGER: عدد التقييمات
- `role` TEXT: دور المستخدم (client, khala, admin, super_admin, client_manager, sitter_manager)
- `availability_type` TEXT: نوع التوافر (home, outside, both)
- `is_verified` BOOLEAN: هل تم التحقق؟
- `is_active` BOOLEAN: هل الحساب نشط؟
- `phone` TEXT: رقم الهاتف
- `mother_job` TEXT: وظيفة الأم (للعملاء)
- `father_job` TEXT: وظيفة الأب (للعملاء)
- `default_address` TEXT: العنوان الافتراضي
- `client_unique_code` TEXT (UNIQUE): كود عميل فريد (CLI-XXXXXX)
- `created_at` TIMESTAMPTZ: تاريخ الإنشاء
- `updated_at` TIMESTAMPTZ: تاريخ التحديث

---

## 2. جداول الخالات (Sitters)
### sitter_services (خدمات الخالة)
- `id` UUID (PK)
- `sitter_id` UUID (FK → profiles.id): معرف الخالة
- `service_type` TEXT: نوع الخدمة
- `price` NUMERIC(10,2): السعر
- `description` TEXT: وصف الخدمة
- `minimum_hours` INTEGER: الحد الأدنى للساعات
- `features` JSONB: مميزات الخدمة
- `is_active` BOOLEAN: هل الخدمة نشطة؟
- `created_at`, `updated_at`: التواريخ

### sitter_skills (مهارات الخالة)
- `id` UUID (PK)
- `sitter_id` UUID (FK → profiles.id)
- `skill` TEXT: المهارة
- `created_at`: التاريخ

### sitter_languages (لغات الخالة)
- `id` UUID (PK)
- `sitter_id` UUID (FK → profiles.id)
- `language` TEXT: اللغة
- `created_at`: التاريخ

### sitter_availability (توافر الخالة)
- `id` UUID (PK)
- `sitter_id` UUID (FK → profiles.id)
- `date` DATE: التاريخ (للتوافر غير المتكرر)
- `day_of_week` INTEGER: يوم الأسبوع (0-6)
- `start_time` TIME: وقت البدء
- `end_time` TIME: وقت الانتهاء
- `is_recurring` BOOLEAN: هل التوافر متكرر؟
- `created_at`: التاريخ

---

## 3. جداول الحجوزات
### bookings (الحجوزات)
- `id` UUID (PK)
- `client_id` UUID (FK → profiles.id): معرف العميل
- `sitter_id` UUID (FK → profiles.id): معرف الخالة
- `date` DATE: تاريخ الحجز
- `start_time` TIME: وقت البدء
- `duration_hours` INTEGER: عدد الساعات
- `location` TEXT: موقع الحجز
- `booking_type` TEXT: نوع الحجز (home, outside)
- `status` TEXT: الحالة (pending, waiting_payment, upcoming, ongoing, completed, cancelled)
- `total_price` NUMERIC(10,2): السعر الإجمالي
- `children_count` INTEGER: عدد الأطفال
- `notes` TEXT: ملاحظات
- `payment_screenshot_url` TEXT: رابط لقطة شاشة الدفع
- `feedback_screenshot_url` TEXT: رابط لقطة شاشة الملاحظات
- `assigned_sitter_code` TEXT: كود الخالة المخصصة
- `created_at`, `updated_at`: التواريخ

### booking_status_history (تاريخ حالة الحجز)
- `id` UUID (PK)
- `booking_id` UUID (FK → bookings.id)
- `old_status` TEXT: الحالة القديمة
- `new_status` TEXT: الحالة الجديدة
- `changed_by` UUID (FK → profiles.id): من غير الحالة
- `notes` TEXT: ملاحظات
- `attachments` JSONB: مرفقات
- `created_at`: التاريخ

---

## 4. جدول الأطفال (children)
- `id` UUID (PK)
- `client_id` UUID (FK → profiles.id): معرف العميل
- `name` TEXT: اسم الطفل
- `age` INTEGER: العمر
- `gender` TEXT: الجنس (male, female)
- `notes` TEXT: ملاحظات
- `medical_conditions` TEXT: حالات طبية
- `allergies` TEXT: حساسية
- `special_needs` TEXT: احتياجات خاصة
- `created_at`, `updated_at`: التواريخ

---

## 5. جداول الإشعارات والرسائل
### notifications (الإشعارات)
- `id` UUID (PK)
- `user_id` UUID (FK → profiles.id): المستخدم الهدف
- `type` TEXT: نوع الإشعار
- `title` TEXT: العنوان
- `message` TEXT: الرسالة
- `is_read` BOOLEAN: هل تم قراءته؟
- `data` JSONB: بيانات إضافية
- `created_at`: التاريخ

### fcm_tokens (رموز FCM)
- `id` UUID (PK)
- `user_id` UUID (FK → profiles.id)
- `token` TEXT: رمز FCM
- `device_type` TEXT: نوع الجهاز (ios, android, web)
- `created_at`: التاريخ
- `UNIQUE(user_id, token)`

### chat_messages (رسائل الشات)
- `id` UUID (PK)
- `booking_id` UUID (FK → bookings.id): الحجز المرتبط
- `sender_id` UUID (FK → profiles.id): المرسل
- `receiver_id` UUID (FK → profiles.id): المستلم
- `content` TEXT: محتوى الرسالة
- `read_at` TIMESTAMPTZ: وقت القراءة
- `created_at`: التاريخ

---

## 6. جدول التقييمات (reviews)
- `id` UUID (PK)
- `booking_id` UUID (FK → bookings.id)
- `reviewer_id` UUID (FK → profiles.id): المقيم
- `reviewee_id` UUID (FK → profiles.id): المُقيم
- `rating` INTEGER: التقييم (1-5)
- `comment` TEXT: التعليق
- `created_at`: التاريخ
- `UNIQUE(booking_id)`

---

## 7. جدول طلبات التحقق (verification_requests)
- `id` UUID (PK)
- `user_id` UUID (FK → profiles.id): العميل (إذا كان طلب تحقق عميل)
- `sitter_id` UUID (FK → profiles.id): الخالة (إذا كان طلب تحقق خالة)
- `document_type` TEXT: نوع المستند
- `document_url` TEXT: رابط المستند
- `status` TEXT: الحالة (pending, approved, rejected)
- `rejection_reason` TEXT: سبب الرفض
- `reviewed_by` UUID (FK → profiles.id): من راجع الطلب
- `reviewed_at` TIMESTAMPTZ: وقت المراجعة
- `created_at`, `updated_at`: التواريخ
- `CHECK(user_id IS NOT NULL OR sitter_id IS NOT NULL)`

---

## 8. جداول المال والمحفظة
### transactions (المعاملات)
- `id` UUID (PK)
- `user_id` UUID (FK → profiles.id): المستخدم
- `amount` NUMERIC(10,2): المبلغ
- `type` TEXT: نوع المعاملة (earning, withdrawal)
- `status` TEXT: الحالة (completed, pending, failed)
- `description` TEXT: الوصف
- `booking_id` UUID (FK → bookings.id): الحجز المرتبط
- `created_at`, `updated_at`: التواريخ

### payments (المدفوعات)
- `id` UUID (PK)
- `booking_id` UUID (FK → bookings.id)
- `amount` NUMERIC(10,2): المبلغ
- `payment_method` TEXT: طريقة الدفع (card, instapay, vodafone, fawry)
- `status` TEXT: الحالة (pending, completed, failed, refunded)
- `transaction_id` TEXT: معرف المعاملة الخارجية
- `gateway_response` JSONB: استجابة بوابة الدفع
- `created_at`, `updated_at`: التواريخ

---

## 9. جدول تتبع الموقع (sitter_locations)
- `id` UUID (PK)
- `sitter_id` UUID (FK → profiles.id)
- `booking_id` UUID (FK → bookings.id)
- `latitude` NUMERIC(10,6): خط العرض
- `longitude` NUMERIC(10,6): خط الطول
- `accuracy` NUMERIC(10,2): دقة الموقع
- `created_at`: التاريخ

---

## 10. جدول النزاعات (disputes)
- `id` UUID (PK)
- `booking_id` UUID (FK → bookings.id)
- `reported_by` TEXT: من أبلغ (client, khala)
- `type` TEXT: نوع النزاع (no_show, late, quality, payment, behavior, other)
- `status` TEXT: الحالة (open, in_review, resolved, closed)
- `title` TEXT: العنوان
- `description` TEXT: الوصف
- `evidence` JSONB: أدلة
- `resolution` TEXT: الحل
- `resolved_by` UUID (FK → profiles.id): من حل النزاع
- `created_at`, `updated_at`, `closed_at`: التواريخ

---

## 11. جداول الدعم الفني
### support_tickets (تذاكر الدعم)
- `id` UUID (PK)
- `user_id` UUID (FK → profiles.id): المستخدم
- `user_type` TEXT: نوع المستخدم (client, khala)
- `category` TEXT: الفئة (technical, account, payment, booking, other)
- `priority` TEXT: الأولوية (low, medium, high)
- `status` TEXT: الحالة (open, in_progress, waiting_response, resolved, closed)
- `subject` TEXT: الموضوع
- `description` TEXT: الوصف
- `attachments` JSONB: مرفقات
- `created_at`, `updated_at`: التواريخ

### ticket_messages (رسائل التذكر)
- `id` UUID (PK)
- `ticket_id` UUID (FK → support_tickets.id)
- `sender_id` UUID (FK → profiles.id): المرسل
- `sender_type` TEXT: نوع المرسل (user, support)
- `message` TEXT: الرسالة
- `attachments` JSONB: مرفقات
- `created_at`: التاريخ

---

## 12. جداول الإدارة
### admin_permissions (صلاحيات الإدارة)
- `id` UUID (PK)
- `role` TEXT (UNIQUE): الدور (super_admin, client_manager, sitter_manager)
- `allowed_tabs` TEXT[]: علامات التبويب المسموح بها
- `created_at`, `updated_at`: التواريخ

### sitter_evaluations (تقييمات الخالات - المقابلات)
- `id` UUID (PK)
- `sitter_id` UUID (FK → profiles.id): الخالة
- `evaluated_by` UUID (FK → profiles.id): المقيم
- `interview_date` TIMESTAMPTZ: تاريخ المقابلة
- `punctuality_score` INTEGER (1-5): تقييم الالتزام بالوقت
- `education_level` TEXT: المستوى التعليمي
- `age` INTEGER: العمر
- `secondary_phone` TEXT: هاتف ثانوي
- `residence_area` TEXT: منطقة الإقامة
- `nearest_metro` TEXT: أقرب محطة مترو
- `phone_type` TEXT: نوع الهاتف
- `marital_status` TEXT: الحالة الاجتماعية
- `number_of_children` INTEGER: عدد الأطفال
- `current_employment_status` TEXT: الحالة الوظيفية الحالية
- `additional_work_notes` TEXT: ملاحظات عمل إضافية
- `q1_score` to `q8_score`: درجات الأسئلة (0-10)
- `open_answer_1` to `open_answer_3`: إجابات أسئلة مفتوحة
- `has_camera_issue` BOOLEAN: هل توجد مشكلة في الكاميرا؟
- `camera_issue_notes` TEXT: ملاحظات مشكلة الكاميرا
- `courses` TEXT: دورات
- `certificates` TEXT: شهادات
- `general_notes` TEXT: ملاحظات عامة
- `photo_url` TEXT: رابط صورة
- `total_score` NUMERIC(5,2): الدرجة الكلية
- `evaluation_percentage` NUMERIC(5,2): النسبة المئوية للتقييم
- `summary` TEXT: ملخص
- `created_at`, `updated_at`: التواريخ

---

## 13. جدول التدقيق (audit_logs)
- `id` UUID (PK)
- `admin_id` UUID (FK → profiles.id): المدير
- `action` TEXT: الإجراء
- `target_type` TEXT: نوع الهدف
- `target_id` UUID: معرف الهدف
- `details` JSONB: تفاصيل
- `ip_address` TEXT: عنوان IP
- `user_agent` TEXT: معلومات المتصفح
- `created_at`: التاريخ

---

## ملاحظات إضافية
- جميع الجداول تم تمكين RLS (Row Level Security) عليها مع سياسات أمان مناسبة
- تم تضمين دوال و triggers لتبسيط العمليات (توليد كود العميل، تحديث التواريخ، إلخ)
