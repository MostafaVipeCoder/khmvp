import { View, Text } from '../../tw';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Upload, Check, X, FileText, AlertCircle, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import type { Language } from '../../App';
import { monitoring } from '@/lib/monitoring';

const translations = {
  ar: {
    back: 'رجوع',
    verification: 'توثيق الحساب',
    verificationRequired: 'يجب توثيق حسابك لعمل طلبات',
    nationalId: 'البطاقة الشخصية',
    nationalIdDesc: 'صورة من البطاقة الشخصية (الوجهين)',
    uploadFront: 'رفع الوجه الأمامي',
    uploadBack: 'رفع الوجه الخلفي',
    uploadDocument: 'رفع المستند',
    changeDocument: 'تغيير المستند',
    status: 'الحالة',
    pending: 'قيد المراجعة',
    approved: 'موثق',
    rejected: 'مرفوض',
    notUploaded: 'لم يتم الرفع',
    uploadedSuccessfully: 'تم الرفع بنجاح',
    submit: 'إرسال للمراجعة',
    verificationPending: 'طلب التوثيق قيد المراجعة',
    verificationApproved: 'تم توثيق حسابك بنجاح',
    verificationRejected: 'تم رفض طلب التوثيق',
    rejectionReason: 'سبب الرفض',
    resubmit: 'إعادة الإرسال',
    requirements: 'المتطلبات',
    requirement1: 'صورة البطاقة الشخصية (الوجهين)',
    requirement2: 'البطاقة يجب أن تكون سارية',
    requirement3: 'الصور يجب أن تكون واضحة ومقروءة',
    requirement4: 'البيانات يجب أن تكون مطابقة للاسم المسجل',
    note: 'ملحوظة',
    noteText: 'عملية المراجعة تستغرق من 24-48 ساعة',
    cannotMakeRequests: 'لا يمكنك عمل طلبات حتى يتم توثيق حسابك',
    whyVerification: 'لماذا نحتاج التوثيق؟',
    reason1: 'لضمان سلامة الخالات',
    reason2: 'لحماية بياناتك الشخصية',
    reason3: 'لتوفير خدمة موثوقة وآمنة',
  },
  en: {
    back: 'Back',
    verification: 'Account Verification',
    verificationRequired: 'You must verify your account to make requests',
    nationalId: 'National ID',
    nationalIdDesc: 'Photo of National ID (both sides)',
    uploadFront: 'Upload Front Side',
    uploadBack: 'Upload Back Side',
    uploadDocument: 'Upload Document',
    changeDocument: 'Change Document',
    status: 'Status',
    pending: 'Under Review',
    approved: 'Verified',
    rejected: 'Rejected',
    notUploaded: 'Not Uploaded',
    uploadedSuccessfully: 'Uploaded Successfully',
    submit: 'Submit for Review',
    verificationPending: 'Verification request under review',
    verificationApproved: 'Your account has been verified successfully',
    verificationRejected: 'Verification request rejected',
    rejectionReason: 'Rejection Reason',
    resubmit: 'Resubmit',
    requirements: 'Requirements',
    requirement1: 'National ID photo (both sides)',
    requirement2: 'ID must be valid',
    requirement3: 'Photos must be clear and readable',
    requirement4: 'Information must match registered name',
    note: 'Note',
    noteText: 'Review process takes 24-48 hours',
    cannotMakeRequests: 'You cannot make requests until your account is verified',
    whyVerification: 'Why do we need verification?',
    reason1: 'To ensure sitter safety',
    reason2: 'To protect your personal information',
    reason3: 'To provide reliable and secure service',
  }
};

interface ClientVerificationProps {
  language: Language;
  onBack: () => void;
}

export default function ClientVerification({ language, onBack }: ClientVerificationProps) {
  const [nationalIdFrontFile, setNationalIdFrontFile] = useState<File | null>(null);
  const [nationalIdBackFile, setNationalIdBackFile] = useState<File | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<'not_submitted' | 'pending' | 'approved' | 'rejected'>('not_submitted');
  const [rejectionReason] = useState('');

  const t = translations[language];

  const handleNationalIdFrontUpload = (e: React.ChangeEvent<any>) => {
    if (e.target.files && e.target.files[0]) {
      setNationalIdFrontFile(e.target.files[0]);
    }
  };

  const handleNationalIdBackUpload = (e: React.ChangeEvent<any>) => {
    if (e.target.files && e.target.files[0]) {
      setNationalIdBackFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!nationalIdFrontFile || !nationalIdBackFile) {
      alert(language === 'ar' ? 'يرجى رفع صورتي البطاقة (الوجهين)' : 'Please upload both sides of your ID');
      return;
    }

    // In real app, this would upload to backend
    monitoring.logUserAction('submit_verification', {
      filesCount: (nationalIdFrontFile ? 1 : 0) + (nationalIdBackFile ? 1 : 0)
    });

    setVerificationStatus('pending');
    alert(language === 'ar' ? 'تم إرسال طلب التوثيق بنجاح' : 'Verification request submitted successfully');
  };

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'pending':
        return <Badge className="bg-yellow-500">{t.pending}</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">{t.approved}</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">{t.rejected}</Badge>;
      default:
        return <Badge variant="outline">{t.notUploaded}</Badge>;
    }
  };

  const isDocumentsComplete = nationalIdFrontFile && nationalIdBackFile;

  return (
    <View className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <View className="max-w-7xl mx-auto px-4 py-4">
          <View className="flex items-center gap-4">
            <Button
              onPress={onBack}
              variant="ghost"
              className="p-2"
            >
              {language === 'ar' ? <ArrowRight className="size-5" /> : <ArrowLeft className="size-5" />}
            </Button>
            <View className="flex-1">
              <Text className="text-xl">{t.verification}</Text>
              <Text className="text-sm text-gray-600 dark:text-gray-400">{t.verificationRequired}</Text>
            </View>
            {getStatusBadge()}
          </View>
        </View>
      </View>

      <View className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Status Alerts */}
        {verificationStatus === 'not_submitted' && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              {t.cannotMakeRequests}
            </AlertDescription>
          </Alert>
        )}

        {verificationStatus === 'pending' && (
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-900/20">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              {t.verificationPending}
            </AlertDescription>
          </Alert>
        )}

        {verificationStatus === 'approved' && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {t.verificationApproved}
            </AlertDescription>
          </Alert>
        )}

        {verificationStatus === 'rejected' && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
            <X className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <View>{t.verificationRejected}</View>
              {rejectionReason && (
                <View className="mt-2 text-sm">
                  <strong>{t.rejectionReason}:</strong> {rejectionReason}
                </View>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Why Verification */}
        <Card className="p-6 bg-[#FB5E7A]/5 border-[#FB5E7A]/20">
          <View className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-[#FB5E7A] mt-1 shrink-0" />
            <View>
              <Text className="text-lg mb-3">{t.whyVerification}</Text>
              <View className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <View className="flex items-start gap-2">
                  <Check className="size-4 text-[#FB5E7A] mt-0.5 shrink-0" />
                  <Text>{t.reason1}</Text>
                </View>
                <View className="flex items-start gap-2">
                  <Check className="size-4 text-[#FB5E7A] mt-0.5 shrink-0" />
                  <Text>{t.reason2}</Text>
                </View>
                <View className="flex items-start gap-2">
                  <Check className="size-4 text-[#FB5E7A] mt-0.5 shrink-0" />
                  <Text>{t.reason3}</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Requirements */}
        <Card className="p-6">
          <Text className="text-lg mb-4">{t.requirements}</Text>
          <View className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <View className="flex items-start gap-2">
              <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
              <Text>{t.requirement1}</Text>
            </View>
            <View className="flex items-start gap-2">
              <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
              <Text>{t.requirement2}</Text>
            </View>
            <View className="flex items-start gap-2">
              <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
              <Text>{t.requirement3}</Text>
            </View>
            <View className="flex items-start gap-2">
              <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
              <Text>{t.requirement4}</Text>
            </View>
          </View>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{t.note}:</strong> {t.noteText}
            </AlertDescription>
          </Alert>
        </Card>

        {/* National ID Upload */}
        <Card className="p-6">
          <View className="space-y-4">
            <View className="flex items-center gap-3 mb-4">
              <View className="w-12 h-12 rounded-full bg-[#FB5E7A]/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#FB5E7A]" />
              </View>
              <View className="flex-1">
                <Text className="text-lg">{t.nationalId}</Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">{t.nationalIdDesc}</Text>
              </View>
              {nationalIdFrontFile && nationalIdBackFile && <Check className="size-6 text-green-500" />}
            </View>

            <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Front Side */}
              <View className="border-2 border-dashed rounded-lg p-6 text-center">
                {nationalIdFrontFile ? (
                  <View className="space-y-3">
                    <FileText className="size-12 mx-auto text-green-500" />
                    <View>
                      <Text className="text-sm">{nationalIdFrontFile.name}</Text>
                      <Text className="text-xs text-gray-500">{(nationalIdFrontFile.size / 1024).toFixed(2)} KB</Text>
                    </View>
                    <Label htmlFor="national-id-front-change" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <Text>{t.changeDocument}</Text>
                      </Button>
                    </Label>
                    <Input
                      id="national-id-front-change"
                      type="file"
                      accept="image/*"
                      onChange={handleNationalIdFrontUpload}
                      className="hidden"
                    />
                  </View>
                ) : (
                  <View className="space-y-3">
                    <Upload className="size-12 mx-auto text-gray-400" />
                    <Label htmlFor="national-id-front-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <Text>{t.uploadFront}</Text>
                      </Button>
                    </Label>
                    <Input
                      id="national-id-front-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleNationalIdFrontUpload}
                      className="hidden"
                    />
                  </View>
                )}
              </View>

              {/* Back Side */}
              <View className="border-2 border-dashed rounded-lg p-6 text-center">
                {nationalIdBackFile ? (
                  <View className="space-y-3">
                    <FileText className="size-12 mx-auto text-green-500" />
                    <View>
                      <Text className="text-sm">{nationalIdBackFile.name}</Text>
                      <Text className="text-xs text-gray-500">{(nationalIdBackFile.size / 1024).toFixed(2)} KB</Text>
                    </View>
                    <Label htmlFor="national-id-back-change" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <Text>{t.changeDocument}</Text>
                      </Button>
                    </Label>
                    <Input
                      id="national-id-back-change"
                      type="file"
                      accept="image/*"
                      onChange={handleNationalIdBackUpload}
                      className="hidden"
                    />
                  </View>
                ) : (
                  <View className="space-y-3">
                    <Upload className="size-12 mx-auto text-gray-400" />
                    <Label htmlFor="national-id-back-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <Text>{t.uploadBack}</Text>
                      </Button>
                    </Label>
                    <Input
                      id="national-id-back-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleNationalIdBackUpload}
                      className="hidden"
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        </Card>

        {/* Submit Button */}
        {verificationStatus !== 'approved' && (
          <Button
            onPress={handleSubmit}
            disabled={!isDocumentsComplete || verificationStatus === 'pending'}
            className="w-full bg-[#FB5E7A] hover:bg-[#e5536e] disabled:opacity-50"
            size="lg"
          >
            {verificationStatus === 'rejected' ? t.resubmit : t.submit}
          </Button>
        )}
      </View>
    </View>
  );
}
