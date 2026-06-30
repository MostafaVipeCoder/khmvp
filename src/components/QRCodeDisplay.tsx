import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Loader2, RefreshCw } from 'lucide-react';
import { qrService } from '../services/qr';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

interface QRCodeDisplayProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  clientId: string;
  sitterId: string;
  language: 'ar' | 'en';
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  isOpen,
  onClose,
  bookingId,
  clientId,
  sitterId,
  language,
}) => {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateQR = async () => {
    try {
      setIsLoading(true);
      const qrData = await qrService.generateQRData(bookingId, clientId, sitterId);
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
      });
      setQrUrl(url);
    } catch (error) {
      console.error('Failed to generate QR:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      generateQR();
    }
  }, [isOpen, bookingId, clientId, sitterId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {language === 'ar' ? 'تأكيد هوية الخالة' : 'Verify Sitter Identity'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {language === 'ar'
              ? 'الخاص بالخالة QR وجهي الكاميرا لنحو كود'
              : 'Point your camera at the sitter\'s QR code to verify'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {isLoading ? (
            <Loader2 className="w-20 h-20 animate-spin text-[#FB5E7A]" />
          ) : qrUrl ? (
            <>
              <div className="bg-white p-4 rounded-xl border-2 border-[#FB5E7A]">
                <img src={qrUrl} alt="QR Code" className="w-64 h-64" />
              </div>
              <Button
                onClick={generateQR}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {language === 'ar' ? 'إعادة إنشاء الرمز' : 'Regenerate QR Code'}
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDisplay;
