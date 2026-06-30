import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import { qrService } from '../services/qr';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  userRole: 'client' | 'sitter';
  language: 'ar' | 'en';
  onVerificationSuccess?: (data: any) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  isOpen,
  onClose,
  currentUserId,
  userRole,
  language,
  onVerificationSuccess,
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  useEffect(() => {
    if (isOpen && !scannerRef.current && scannerContainerRef.current) {
      // Initialize scanner
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(
        async (decodedText) => {
          await handleScan(decodedText);
        },
        (errorMessage) => {
          // Ignore non-critical errors like "No QR found"
          console.debug('QR scan error:', errorMessage);
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
      setResult(null);
    };
  }, [isOpen]);

  const handleScan = async (decodedText: string) => {
    if (isVerifying) return; // Prevent multiple scans

    try {
      setIsVerifying(true);

      // Stop scanning while we verify
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }

      // Verify the QR code
      const verificationResult = await qrService.verifyQRData(
        decodedText,
        currentUserId,
        userRole
      );

      if (verificationResult.success && verificationResult.data) {
        setResult({
          success: true,
          message:
            language === 'ar'
              ? 'تمت عملية التحقق بنجاح! هؤلاء هم الطرفان الصحيحان.'
              : 'Verification successful! This is the correct person.',
          data: verificationResult.data,
        });

        if (onVerificationSuccess) {
          onVerificationSuccess(verificationResult.data);
        }
      } else {
        setResult({
          success: false,
          message: verificationResult.error || 'فشل التحقق.',
        });
      }
    } catch (error) {
      console.error('QR scan failed:', error);
      setResult({
        success: false,
        message:
          language === 'ar'
            ? 'حدث خطأ أثناء المسح. حاول مرة أخرى.'
            : 'An error occurred while scanning. Please try again.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetScanner = () => {
    setResult(null);
    // Re-initialize scanner if container exists
    if (isOpen && scannerContainerRef.current && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(
        async (decodedText) => {
          await handleScan(decodedText);
        },
        (errorMessage) => {
          console.debug('QR scan error:', errorMessage);
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {language === 'ar' ? 'تأكيد هوية الخالة' : 'Verify Sitter Identity'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {language === 'ar'
              ? 'وجهي الكاميرا لنحو كود QR الخاص بالخالة لتأكيد بدء الخدمة'
              : 'Point your camera at the sitter\'s QR code to verify'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {/* Show loading state */}
          {isVerifying && (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-10 h-10 animate-spin text-[#FB5E7A]" />
              <p className="text-gray-600">
                {language === 'ar' ? 'جار التحقق...' : 'Verifying...'}
              </p>
            </div>
          )}

          {/* Show scan result */}
          {result && !isVerifying && (
            <div className="flex flex-col items-center gap-4 text-center">
              {result.success ? (
                <CheckCircle2 className="w-20 h-20 text-green-500" />
              ) : (
                <XCircle className="w-20 h-20 text-red-500" />
              )}

              <h3
                className={`text-xl font-bold ${
                  result.success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {result.success
                  ? language === 'ar'
                    ? 'تم التحقق بنجاح!'
                    : 'Verification Successful!'
                  : language === 'ar'
                  ? 'فشل التحقق'
                  : 'Verification Failed'}
              </h3>

              <p className="text-gray-600">{result.message}</p>

              {result.success ? (
                <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                  {language === 'ar' ? 'تمام' : 'Okay'}
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={resetScanner} variant="outline">
                    {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
                  </Button>
                  <Button onClick={onClose} variant="destructive">
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Show scanner if not verifying and no result */}
          {!isVerifying && !result && (
            <div ref={scannerContainerRef} className="w-full">
              <div id="qr-reader" className="w-full" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeScanner;
