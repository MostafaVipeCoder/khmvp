import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Upload, Check, X, FileText, AlertCircle, Shield, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import type { Language } from '../../App'
import { useAuthStore } from '../../stores/useAuthStore'
import { verificationService } from '../../services/verification'
import { toast } from 'sonner'

const translations = {
  ar: {
    back: 'رجوع',
    verification: 'توثيق الحساب',
    verificationRequired: 'يجب توثيق حسابك لطلب الخالات',
    national_id: 'البطاقة الشخصية',
    national_idDesc: 'صورة من البطاقة الشخصية (الوجهين)',
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
    cannotMakeRequests: 'لا يمكنك طلب الخالات حتى يتم توثيق حسابك',
    whyVerification: 'لماذا نحتاج التوثيق؟',
    reason1: 'لضمان سلامة الخالات',
    reason2: 'لحماية بياناتك الشخصية',
    reason3: 'لتوفير خدمة موثوقة وآمنة',
    alreadyUploaded: 'تم الرفع',
    fileSelected: 'تم اختيار الملف'
  },
  en: {
    back: 'Back',
    verification: 'Account Verification',
    verificationRequired: 'You must verify your account to request sitters',
    national_id: 'National ID',
    national_idDesc: 'Photo of National ID (both sides)',
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
    cannotMakeRequests: 'You cannot request sitters until your account is verified',
    whyVerification: 'Why do we need verification?',
    reason1: 'To ensure sitter safety',
    reason2: 'To protect your personal information',
    reason3: 'To provide reliable and secure service',
    alreadyUploaded: 'Already Uploaded',
    fileSelected: 'File Selected'
  }
}

interface ClientVerificationProps {
  language: Language
  onBack: () => void
}

export default function ClientVerification({ language, onBack }: ClientVerificationProps) {
  const { user } = useAuthStore()
  const [nationalIdFrontFile, setNationalIdFrontFile] = useState<File | null>(null)
  const [nationalIdBackFile, setNationalIdBackFile] = useState<File | null>(null)

  const [existingDocs, setExistingDocs] = useState<{
    national_id_front?: string
    national_id_back?: string
  }>({})

  const [verificationStatus, setVerificationStatus] = useState<'not_submitted' | 'pending' | 'approved' | 'rejected'>('not_submitted')
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const t = translations[language]

  useEffect(() => {
    if (user?.id) {
      loadVerificationRequests()
    }
  }, [user?.id])

  const loadVerificationRequests = async () => {
    try {
      if (!user?.id) return
      const requests = await verificationService.getUserRequests(user.id)

      const newExistingDocs: typeof existingDocs = {}
      let maxStatus = 'not_submitted'
      let rejectReason = ''

      requests.forEach(req => {
        if (req.document_type === 'national_id_front') newExistingDocs.national_id_front = req.document_url
        if (req.document_type === 'national_id_back') newExistingDocs.national_id_back = req.document_url

        if (req.status === 'rejected') {
          maxStatus = 'rejected'
          if (req.rejection_reason) rejectReason = req.rejection_reason
        } else if (req.status === 'pending' && maxStatus !== 'rejected') {
          maxStatus = 'pending'
        } else if (req.status === 'approved' && maxStatus !== 'rejected' && maxStatus !== 'pending') {
          maxStatus = 'approved'
        }
      })

      setExistingDocs(newExistingDocs)
      setRejectionReason(rejectReason)
      if (requests.length > 0) {
        setVerificationStatus(maxStatus as any)
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to load verification status')
    }
  }

  const handleNationalIdFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNationalIdFrontFile(e.target.files[0])
    }
  }

  const handleNationalIdBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNationalIdBackFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    const hasFrontId = nationalIdFrontFile || existingDocs.national_id_front
    const hasBackId = nationalIdBackFile || existingDocs.national_id_back

    if (!hasFrontId || !hasBackId) {
      toast.error(language === 'ar' ? 'يرجى رفع صورتي البطاقة (الوجهين)' : 'Please upload both sides of your ID')
      return
    }

    try {
      if (!user?.id) return
      setIsSubmitting(true)

      if (nationalIdFrontFile) {
        const url = await verificationService.uploadDocument(user.id, nationalIdFrontFile, 'national_id_front')
        await verificationService.submitRequest(user.id, 'national_id_front', url)
        setExistingDocs(prev => ({ ...prev, national_id_front: url }))
        setNationalIdFrontFile(null)
      }

      if (nationalIdBackFile) {
        const url = await verificationService.uploadDocument(user.id, nationalIdBackFile, 'national_id_back')
        await verificationService.submitRequest(user.id, 'national_id_back', url)
        setExistingDocs(prev => ({ ...prev, national_id_back: url }))
        setNationalIdBackFile(null)
      }

      // Reload requests to ensure we have the latest data
      await loadVerificationRequests();
      
      setRejectionReason('')
      toast.success(language === 'ar' ? 'تم إرسال طلب التوثيق بنجاح' : 'Verification request submitted successfully')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || (language === 'ar' ? 'حدث خطأ أثناء الرفع' : 'Error uploading documents'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'pending':
        return <Badge className="bg-yellow-500">{t.pending}</Badge>
      case 'approved':
        return <Badge className="bg-green-500">{t.approved}</Badge>
      case 'rejected':
        return <Badge className="bg-red-500">{t.rejected}</Badge>
      default:
        return <Badge variant="outline">{t.notUploaded}</Badge>
    }
  }

  const renderUploadState = (
    file: File | null,
    existingUrl: string | undefined,
    label: string,
    id: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ) => {
    if (file) {
      return (
        <div className="space-y-3">
          <FileText className="size-12 mx-auto text-blue-500" />
          <div>
            <p className="text-sm">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
          </div>
          <Label htmlFor={id} className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>{t.changeDocument}</span>
            </Button>
          </Label>
        </div>
      )
    } else if (existingUrl) {
      return (
        <div className="space-y-3">
          <Check className="size-12 mx-auto text-green-500" />
          <div>
            <p className="text-sm font-medium text-green-600">{t.alreadyUploaded}</p>
          </div>
          <Label htmlFor={id} className="cursor-pointer">
            <Button variant="outline" size="sm" asChild>
              <span>{t.changeDocument}</span>
            </Button>
          </Label>
        </div>
      )
    } else {
      return (
        <div className="space-y-3">
          <Upload className="size-12 mx-auto text-gray-400" />
          <Label htmlFor={id} className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>{label}</span>
            </Button>
          </Label>
        </div>
      )
    }
  }

  const isDocumentsComplete = (nationalIdFrontFile || existingDocs.national_id_front) &&
    (nationalIdBackFile || existingDocs.national_id_back)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="ghost" className="p-2">
              {language === 'ar' ? <ArrowRight className="size-5" /> : <ArrowLeft className="size-5" />}
            </Button>
            <div className="flex-1">
              <h1 className="text-xl">{t.verification}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.verificationRequired}</p>
            </div>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {verificationStatus === 'not_submitted' && (
          <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              {t.cannotMakeRequests}
            </AlertDescription>
          </Alert>
        )}

        {verificationStatus === 'pending' && (
          <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-900/30">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              {t.verificationPending}
            </AlertDescription>
          </Alert>
        )}

        {verificationStatus === 'approved' && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-900/30">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {t.verificationApproved}
            </AlertDescription>
          </Alert>
        )}

        {verificationStatus === 'rejected' && (
          <Alert className="border-red-500 bg-red-50 dark:bg-red-900/30">
            <X className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <div>{t.verificationRejected}</div>
              {rejectionReason && (
                <div className="mt-2 text-sm">
                  <strong>{t.rejectionReason}:</strong> {rejectionReason}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-6 bg-[#FB5E7A]/5 border-[#FB5E7A]/20">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-[#FB5E7A] mt-1 shrink-0" />
            <div>
              <h2 className="text-lg mb-3">{t.whyVerification}</h2>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-[#FB5E7A] mt-0.5 shrink-0" />
                  <span>{t.reason1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-[#FB5E7A] mt-0.5 shrink-0" />
                  <span>{t.reason2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="size-4 text-[#FB5E7A] mt-0.5 shrink-0" />
                  <span>{t.reason3}</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg mb-4">{t.requirements}</h2>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
              <span>{t.requirement1}</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
              <span>{t.requirement2}</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
              <span>{t.requirement3}</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="size-4 text-green-500 mt-0.5 shrink-0" />
              <span>{t.requirement4}</span>
            </li>
          </ul>

          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>{t.note}:</strong> {t.noteText}
            </AlertDescription>
          </Alert>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#FB5E7A]/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#FB5E7A]" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg">{t.national_id}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.national_idDesc}</p>
              </div>
              {isDocumentsComplete && <Check className="size-6 text-green-500" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {renderUploadState(nationalIdFrontFile, existingDocs.national_id_front, t.uploadFront, 'national-id-front', handleNationalIdFrontUpload)}
                <Input
                  id="national-id-front"
                  type="file"
                  accept="image/*"
                  onChange={handleNationalIdFrontUpload}
                  className="hidden"
                />
              </div>

              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {renderUploadState(nationalIdBackFile, existingDocs.national_id_back, t.uploadBack, 'national-id-back', handleNationalIdBackUpload)}
                <Input
                  id="national-id-back"
                  type="file"
                  accept="image/*"
                  onChange={handleNationalIdBackUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </Card>

        {verificationStatus !== 'approved' && (
          <Button
            onClick={handleSubmit}
            disabled={!isDocumentsComplete || isSubmitting || (verificationStatus === 'pending' && !nationalIdFrontFile && !nationalIdBackFile)}
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
      </div>
    </div>
  )
}
