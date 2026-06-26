
# خطة إعداد قاعدة البيانات في Supabase

الخطوات سهلة ومباشرة! فقط اتبع التالي:

## الخطوة 1: فتح محرر SQL في Supabase
1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك (ilpsaouboehkkeigibui)
3. من الشريط الأيسر، اضغط على **SQL Editor** (المحرر SQL)

## الخطوة 2: تشغيل ملف schema.sql
1. في SQL Editor، اضغط على **+ New Query** (استعلام جديد)
2. افتح الملف `schema.sql` من مجلد المشروع
3. نسخ كل المحتوى
4. لصق المحتوى في مربع الاستعلام الجديد
5. اضغط على **Run** (تشغيل) أو Ctrl+Enter

## الخطوة 3: تشغيل ملف clear-client-data.sql (إذا أردت مسح بيانات العملاء الحالية)
1. اضغط على **+ New Query** مرة أخرى
2. افتح الملف `clear-client-data.sql`
3. نسخ كل المحتوى
4. لصق المحتوى في مربع الاستعلام الجديد
5. اضغط على **Run**

## الخطوة 4: إنشاء storage buckets (اختياري لكن مهم)
في نفس الصفحة Supabase Dashboard:
1. من الشريط الأيسر، اضغط على **Storage** (التخزين)
2. اضغط على **New Bucket** (مجلد جديد)
3. اسمه: `avatars`، اختر Public ثم اضغط على Create
4. اضغط على **New Bucket** مرة أخرى
5. اسمه: `verification-docs`، اختر Private ثم اضغط على Create

هذا كل شيء! الآن قاعدة البيانات جاهزة للاستخدام!
