// Define the structure of the QR data
export interface QRVerificationData {
  bookingId: string;
  clientId: string;
  sitterId: string;
  expiresAt: string; // ISO string
  signature: string;
}

// Environment variable for HMAC secret (in production, store this in .env!)
const HMAC_SECRET = import.meta.env.VITE_QR_HMAC_SECRET || 'dev-secret-change-me-in-production';
const QR_EXPIRATION_MINUTES = 60; // 1 hour validity

/**
 * Converts a string to an ArrayBuffer for Web Crypto API
 */
const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

/**
 * Converts an ArrayBuffer to a hex string
 */
const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Creates an HMAC-SHA256 signature using Web Crypto API
 */
const createHMACSignature = async (payload: string, secret: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const payloadData = encoder.encode(payload);

  // Import the secret key
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the payload
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    payloadData
  );

  return arrayBufferToHex(signatureBuffer);
};

export const qrService = {
  /**
   * Generates secure QR data with HMAC signature and expiration
   * @param bookingId The ID of the booking
   * @param clientId The ID of the client
   * @param sitterId The ID of the sitter
   * @returns Encoded string to be used in QR code
   */
  generateQRData: async (bookingId: string, clientId: string, sitterId: string): Promise<string> => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + QR_EXPIRATION_MINUTES * 60000); // 60 minutes from now

    // Create payload without signature first
    const payload: Omit<QRVerificationData, 'signature'> = {
      bookingId,
      clientId,
      sitterId,
      expiresAt: expiresAt.toISOString(),
    };

    // Create HMAC signature to prevent tampering
    const payloadString = JSON.stringify(payload);
    const signature = await createHMACSignature(payloadString, HMAC_SECRET);

    // Combine payload and signature
    const qrData: QRVerificationData = {
      ...payload,
      signature,
    };

    // Encode as base64 to make it QR-friendly
    return btoa(JSON.stringify(qrData));
  },

  /**
   * Verifies QR code data
   * @param encodedQRData The base64 encoded QR data
   * @param currentUserId The current user's ID (client or sitter)
   * @param userRole The role of the current user (client or sitter)
   * @returns Object with success status and data/error
   */
  verifyQRData: async (
    encodedQRData: string,
    currentUserId: string,
    userRole: 'client' | 'sitter'
  ): Promise<{
    success: boolean;
    data?: Omit<QRVerificationData, 'signature'>;
    error?: string;
  }> => {
    try {
      // Decode the QR data
      const qrDataString = atob(encodedQRData);
      const qrData: QRVerificationData = JSON.parse(qrDataString);

      // 1. Check expiration
      const now = new Date();
      const expiresAt = new Date(qrData.expiresAt);
      if (now > expiresAt) {
        return {
          success: false,
          error: 'انتهت صلاحية رمز QR. الرجاء إعادة إنشائه.',
        };
      }

      // 2. Verify signature to prevent tampering
      const payload: Omit<QRVerificationData, 'signature'> = {
        bookingId: qrData.bookingId,
        clientId: qrData.clientId,
        sitterId: qrData.sitterId,
        expiresAt: qrData.expiresAt,
      };
      const payloadString = JSON.stringify(payload);
      const expectedSignature = await createHMACSignature(payloadString, HMAC_SECRET);

      if (qrData.signature !== expectedSignature) {
        return {
          success: false,
          error: 'رمز QR غير صالح أو تم التلاعب به.',
        };
      }

      // 3. Verify current user is part of this booking
      if (userRole === 'client' && qrData.clientId !== currentUserId) {
        return {
          success: false,
          error: 'هذا الحجز لا ينتمي لك.',
        };
      }

      if (userRole === 'sitter' && qrData.sitterId !== currentUserId) {
        return {
          success: false,
          error: 'هذا الحجز لا ينتمي لك.',
        };
      }

      // All checks passed!
      return {
        success: true,
        data: payload,
      };
    } catch (error) {
      console.error('QR verification error:', error);
      return {
        success: false,
        error: 'حدث خطأ أثناء التحقق من رمز QR. الرجاء المحاولة مرة أخرى.',
      };
    }
  },
};

