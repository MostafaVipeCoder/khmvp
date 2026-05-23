import { View, Text } from '../../tw';
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Upload, Check, X, FileText, AlertCircle, Shield, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import type { Language } from '../../App';
import { useAuthStore } from '../../stores/useAuthStore';
import { sitterService } from '../../services/sitter';
import { toast } from 'sonner';

const translations = {
  ar: {
    back: 'رجوع',
    verification: 'توثيق الحساب',
    verificationRequired: 'يجب توثيق حسابك لقبول الطلبات',
    policeRecord: 'الفيش الجنائي',
    policeRecordDesc: 'يرجى رفع صورة واضحة من الفيش الجنائي',
    uploadDocument: 'رفع المستند',
    changeDocument: 'تغيير المستند',
    nationalId: 'البطاقة الشخصية',
    nationalIdDesc: 'صورة من البطاقة الشخصية (الوجهين)',
    uploadFront: 'رفع الوجه الأمامي',
    uploadBack: 'رفع الوجه الخلفي',
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
    requirement1: 'صورة واضحة للفيش الجنائي',
    requirement2: 'صورة البطاقة الشخصية (الوجهين)',
    requirement3: 'المستندات يجب أن تكون سارية',
    requirement4: 'الصور يجب أن تكون واضحة ومقروءة',
    note: 'ملحوظة',
    noteText: 'عملية المراجعة تستغرق من 24-48 ساعة',
    cannotAcceptRequests: 'لا يمكنك قبول طلبات حتى يتم توثيق حسابك',
    alreadyUploaded: 'تم الرفع',
    fileSelected: 'تم اختيار الملف'
  },
  en: {
    back: 'Back',
    verification: 'Account Verification',
    verificationRequired: 'You must verify your account to accept requests',
    policeRecord: 'Police Clearance Certificate',
    policeRecordDesc: 'Please upload a clear copy of your police clearance certificate',
    uploadDocument: 'Upload Document',
    changeDocument: 'Change Document',
    nationalId: 'National ID',
    nationalIdDesc: 'Photo of National ID (both sides)',
    uploadFront: 'Upload Front Side',
    uploadBack: 'Upload Back Side',
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
    requirement1: 'Clear photo of police clearance certificate',
    requirement2: 'National ID photo (both sides)',
    requirement3: 'Documents must be valid',
    requirement4: 'Photos must be clear and readable',
    note: 'Note',
    noteText: 'Review process takes 24-48 hours',
    cannotAcceptRequests: 'You cannot accept requests until your account is verified',
    alreadyUploaded: 'Already Uploaded',
    fileSelected: 'File Selected'
  }
};

interface SitterVerificationProps {
  language: Language;
  onBack: () => void;
}

export default function SitterVerification({ language, onBack }: SitterVerificationProps) {
  const { user } = useAuthStore();
  const [policeRecordFile, setPoliceRecordFile] = useState<File | null>(null);
  const [nationalIdFrontFile, setNationalIdFrontFile] = useState<File | null>(null);
  const [nationalIdBackFile, setNationalIdBackFile] = useState<File | null>(null);

  // Track existing uploads from DB
  const [existingDocs, setExistingDocs] = useState<{
    policeRecord?: string;
    nationalIdFront?: string;
    nationalIdBack?: string;
  }>({});

  const [verificationStatus, setVerificationStatus] = useState<'not_submitted' | 'pending' | 'approved' | 'rejected'>('not_submitted');
  const [rejectionReason] = useState('');
  // const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = translations[language];

  useEffect(() => {
    if (user?.id) {
      loadVerificationRequests();
    }
  }, [user?.id]);

  const loadVerificationRequests = async () => {
    try {
      if (!user?.id) return;
      // setIsLoading(true);
      const requests = await sitterService.getVerificationRequests(user.id);

      const newExistingDocs: typeof existingDocs = {};
      let maxStatus = 'not_submitted';

      requests.forEach(req => {
        if (req.document_type === 'police_record') newExistingDocs.policeRecord = req.document_url;
        if (req.document_type === 'national_id_front') newExistingDocs.nationalIdFront = req.document_url;
        if (req.document_type === 'national_id_back') newExistingDocs.nationalIdBack = req.document_url;

        // Simple status logic: if any rejected -> rejected, else if any pending -> pending, else approved
        if (req.status === 'rejected') {
          maxStatus = 'rejected';
          // Would need to store rejection reason somewhere in DB if we want to show it
        } else if (req.status === 'pending' && maxStatus !== 'rejected') {
          maxStatus = 'pending';
        } else if (req.status === 'approved' && maxStatus !== 'rejected' && maxStatus !== 'pending') {
          maxStatus = 'approved';
        }
      });

      setExistingDocs(newExistingDocs);
      // If we have at least one doc and it's pending/approved, reflect that. 
      // If no docs, it stays not_submitted.
      if (requests.length > 0) {
        setVerificationStatus(maxStatus as any);
      }

    } catch (error) {
      console.error(error);
      toast.error('Failed to load verification status');
    } finally {
      // setIsLoading(false);
    }
  };

  const handlePoliceRecordUpload = (e: React.ChangeEvent<any>) => {
    if (e.target.files && e.target.files[0]) {
      setPoliceRecordFile(e.target.files[0]);
    }
  };

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

  const handleSubmit = async () => {
    // Check if we have files OR existing urls for all 3 required docs
    const hasPoliceRecord = policeRecordFile || existingDocs.policeRecord;
    const hasFrontId = nationalIdFrontFile || existingDocs.nationalIdFront;
    const hasBackId = nationalIdBackFile || existingDocs.nationalIdBack;

    if (!hasPoliceRecord || !hasFrontId || !hasBackId) {
      toast.error(language === 'ar' ? 'يرجى رفع جميع المستندات المطلوبة' : 'Please upload all required documents');
      return;
    }

    try {
      if (!user?.id) return;
      setIsSubmitting(true);

      // Upload files if new ones selected
      if (policeRecordFile) {
        const url = await sitterService.uploadVerificationDocument(user.id, policeRecordFile, 'police_record');
        await sitterService.submitVerificationRequest(user.id, 'police_record', url);
        setExistingDocs(prev => ({ ...prev, policeRecord: url }));
        setPoliceRecordFile(null); // Clear file selection
      }

      if (nationalIdFrontFile) {
        const url = await sitterService.uploadVerificationDocument(user.id, nationalIdFrontFile, 'national_id_front');
        await sitterService.submitVerificationRequest(user.id, 'national_id_front', url);
        setExistingDocs(prev => ({ ...prev, nationalIdFront: url }));
        setNationalIdFrontFile(null);
      }

      if (nationalIdBackFile) {
        const url = await sitterService.uploadVerificationDocument(user.id, nationalIdBackFile, 'national_id_back');
        await sitterService.submitVerificationRequest(user.id, 'national_id_back', url);
        setExistingDocs(prev => ({ ...prev, nationalIdBack: url }));
        setNationalIdBackFile(null);
      }

      setVerificationStatus('pending');
      toast.success(language === 'ar' ? 'تم إرسال طلب التوثيق بنجاح' : 'Verification request submitted successfully');
    } catch (error) {
      console.error(error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء الرفع' : 'Error uploading documents');
    } finally {
      setIsSubmitting(false);
    }
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

  // Helper to render upload state
  const renderUploadState = (
    file: File | null,
    existingUrl: string | undefined,
    label: string,
    id: string,
    _onChange: (e: React.ChangeEvent<any>) => void
  ) => {
    if (file) {
      // New file selected
      return (
        <View className="space-y-3">
          <FileText className="size-10 mx-auto text-blue-500" />
          <View>
            <Text className="text-xs">{file.name}</Text>
            <Text className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</Text>
          </View>
          <Label htmlFor={id} className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <Text>{t.changeDocument}</Text>
            </Button>
          </Label>
        </View>
      );
    } else if (existingUrl) {
      // Already uploaded
      return (
        <View className="space-y-3">
          <Check className="size-10 mx-auto text-green-500" />
          <View>
            <Text className="text-sm font-medium text-green-600">{t.alreadyUploaded}</Text>
          </View>
          <Label htmlFor={id} className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <Text>{t.changeDocument}</Text>
            </Button>
          </Label>
        </View>
      );
    } else {
      // Nothing selected
      return (
        <View className="space-y-3">
          <Upload className="size-10 mx-auto text-gray-400" />
          <Label htmlFor={id} className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <Text>{label}</Text>
            </Button>
          </Label>
        </View>
      );
    }
  };

  const isDocumentsComplete = (policeRecordFile || existingDocs.policeRecord) &&
    (nationalIdFrontFile || existingDocs.nationalIdFront) &&
    (nationalIdBackFile || existingDocs.nationalIdBack);

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
              {t.cannotAcceptRequests}
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

        {/* Requirements */}
        <Card className="p-6">
          <View className="flex items-start gap-3 mb-4">
            <Shield className="w-6 h-6 text-[#FB5E7A] mt-1" />
            <View>
              <Text className="text-lg mb-2">{t.requirements}</Text>
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
            </View>
          </View>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{t.note}:</strong> {t.noteText}
            </AlertDescription>
          </Alert>
        </Card>

        {/* Police Record Upload */}
        <Card className="p-6">
          <View className="space-y-4">
            <View className="flex items-center gap-3 mb-4">
              <View className="w-12 h-12 rounded-full bg-[#FB5E7A]/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#FB5E7A]" />
              </View>
              <View className="flex-1">
                <Text className="text-lg">{t.policeRecord}</Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">{t.policeRecordDesc}</Text>
              </View>
              {(policeRecordFile || existingDocs.policeRecord) && <Check className="size-6 text-green-500" />}
            </View>

            <View className="border-2 border-dashed rounded-lg p-6 text-center">
              {renderUploadState(policeRecordFile, existingDocs.policeRecord, t.uploadDocument, 'police-record-upload', handlePoliceRecordUpload)}
              <Input
                id="police-record-upload"
                type="file"
                accept="image/*,application/pdf"
                onChange={handlePoliceRecordUpload}
                className="hidden"
              />
            </View>
          </View>
        </Card>

        {/* National ID Upload */}
        <Card className="p-6">
          <View className="space-y-4">
            <View className="flex items-center gap-3 mb-4">
              <View className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </View>
              <View className="flex-1">
                <Text className="text-lg">{t.nationalId}</Text>
                <Text className="text-sm text-gray-600 dark:text-gray-400">{t.nationalIdDesc}</Text>
              </View>
              {(nationalIdFrontFile || existingDocs.nationalIdFront) && (nationalIdBackFile || existingDocs.nationalIdBack) && <Check className="size-6 text-green-500" />}
            </View>

            <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Front Side */}
              <View className="border-2 border-dashed rounded-lg p-4 text-center">
                {renderUploadState(nationalIdFrontFile, existingDocs.nationalIdFront, t.uploadFront, 'national-id-front', handleNationalIdFrontUpload)}
                <Input
                  id="national-id-front"
                  type="file"
                  accept="image/*"
                  onChange={handleNationalIdFrontUpload}
                  className="hidden"
                />
              </View>

              {/* Back Side */}
              <View className="border-2 border-dashed rounded-lg p-4 text-center">
                {renderUploadState(nationalIdBackFile, existingDocs.nationalIdBack, t.uploadBack, 'national-id-back', handleNationalIdBackUpload)}
                <Input
                  id="national-id-back"
                  type="file"
                  accept="image/*"
                  onChange={handleNationalIdBackUpload}
                  className="hidden"
                />
              </View>
            </View>
          </View>
        </Card>

        {/* Submit Button */}
        {verificationStatus !== 'approved' && (
          <Button
            onPress={handleSubmit}
            disabled={!isDocumentsComplete || isSubmitting || (verificationStatus === 'pending' && !policeRecordFile && !nationalIdFrontFile && !nationalIdBackFile)}
            className="w-full bg-[#FB5E7A] hover:bg-[#e5536e] disabled:opacity-50"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t.verificationPending}
              </>
            ) : (
              verificationStatus === 'rejected' ? t.resubmit : t.submit
            )}
          </Button>
        )}
      </View>
    </View>
  );
}
