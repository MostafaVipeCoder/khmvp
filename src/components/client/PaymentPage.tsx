import { View, Text } from '../../tw';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, CreditCard, Smartphone, DollarSign, Check, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Alert, AlertDescription } from '../ui/alert';
import { useTranslation } from '../../hooks/useTranslation';

interface PaymentPageProps {
  bookingData: {
    sitterName: string;
    service: string;
    date: string;
    duration: number;
    amount: number;
  };
  onBack: () => void;
  onPaymentSuccess: () => void;
}

export default function PaymentPage({ bookingData, onBack, onPaymentSuccess }: PaymentPageProps) {
  const { t, language } = useTranslation();
  const paymentT = t.client.paymentPage;

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'instapay' | 'vodafone' | 'fawry'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [fawryCode, setFawryCode] = useState('');

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Phone number for mobile wallets
  const [phoneNumber, setPhoneNumber] = useState('');

  const platformFee = bookingData.amount * 0.1; // 10% platform fee
  const finalAmount = bookingData.amount + platformFee;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts: string[] = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handlePayment = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (paymentMethod === 'instapay' || paymentMethod === 'vodafone') {
      setShowVerification(true);
      setIsProcessing(false);
    } else if (paymentMethod === 'fawry') {
      // Generate Fawry code
      const code = 'FW' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setFawryCode(code);
      setIsProcessing(false);
    } else {
      // Card payment
      setIsProcessing(false);
      onPaymentSuccess();
    }
  };

  const handleVerification = async () => {
    setIsProcessing(true);

    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsProcessing(false);
    onPaymentSuccess();
  };

  const sendVerificationCode = async () => {
    setIsProcessing(true);

    // Simulate sending code
    await new Promise(resolve => setTimeout(resolve, 1000));

    setShowVerification(true);
    setIsProcessing(false);
    alert(paymentT.verificationCodeSent);
  };

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
              <Text className="text-xl">{paymentT.payment}</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Booking Summary */}
        <Card className="p-6">
          <Text className="text-lg mb-4">{paymentT.bookingSummary}</Text>
          <View className="space-y-3">
            <View className="flex justify-between">
              <Text className="text-gray-600 dark:text-gray-400">{paymentT.sitter}</Text>
              <Text>{bookingData.sitterName}</Text>
            </View>
            <View className="flex justify-between">
              <Text className="text-gray-600 dark:text-gray-400">{paymentT.service}</Text>
              <Text>{bookingData.service}</Text>
            </View>
            <View className="flex justify-between">
              <Text className="text-gray-600 dark:text-gray-400">{paymentT.date}</Text>
              <Text>{bookingData.date}</Text>
            </View>
            <View className="flex justify-between">
              <Text className="text-gray-600 dark:text-gray-400">{paymentT.duration}</Text>
              <Text>{bookingData.duration} {paymentT.hours}</Text>
            </View>
            <View className="border-t pt-3 mt-3">
              <View className="flex justify-between mb-2">
                <Text className="text-gray-600 dark:text-gray-400">{paymentT.totalAmount}</Text>
                <Text>{bookingData.amount} {paymentT.egp}</Text>
              </View>
              <View className="flex justify-between mb-2">
                <Text className="text-gray-600 dark:text-gray-400">{paymentT.platformFee}</Text>
                <Text>{platformFee.toFixed(2)} {paymentT.egp}</Text>
              </View>
              <View className="flex justify-between text-lg border-t pt-2 mt-2">
                <Text>{paymentT.finalAmount}</Text>
                <Text className="text-[#FB5E7A]">{finalAmount.toFixed(2)} {paymentT.egp}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Secure Payment Badge */}
        <View className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Lock className="size-4" />
          <Text>{paymentT.securePayment}</Text>
        </View>

        {/* Payment Method Selection */}
        <Card className="p-6">
          <Text className="text-lg mb-4">{paymentT.selectPaymentMethod}</Text>
          <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
            <View className="space-y-3">
              {/* Credit Card */}
              <View className="flex items-center space-x-2 rtl:space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="card" id="payment-card" />
                <Label htmlFor="payment-card" className="flex-1 cursor-pointer flex items-center gap-3">
                  <CreditCard className="size-5 text-blue-500" />
                  <Text>{paymentT.creditCard}</Text>
                </Label>
              </View>

              {/* InstaPay */}
              <View className="flex items-center space-x-2 rtl:space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="instapay" id="payment-instapay" />
                <Label htmlFor="payment-instapay" className="flex-1 cursor-pointer flex items-center gap-3">
                  <Smartphone className="size-5 text-purple-500" />
                  <Text>{paymentT.instaPay}</Text>
                </Label>
              </View>

              {/* Vodafone Cash */}
              <View className="flex items-center space-x-2 rtl:space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="vodafone" id="payment-vodafone" />
                <Label htmlFor="payment-vodafone" className="flex-1 cursor-pointer flex items-center gap-3">
                  <Smartphone className="size-5 text-red-500" />
                  <Text>{paymentT.vodafoneCash}</Text>
                </Label>
              </View>

              {/* Fawry */}
              <View className="flex items-center space-x-2 rtl:space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="fawry" id="payment-fawry" />
                <Label htmlFor="payment-fawry" className="flex-1 cursor-pointer flex items-center gap-3">
                  <DollarSign className="size-5 text-orange-500" />
                  <Text>{paymentT.fawry}</Text>
                </Label>
              </View>
            </View>
          </RadioGroup>
        </Card>

        {/* Payment Details */}
        {!fawryCode && (
          <Card className="p-6">
            {paymentMethod === 'card' && !showVerification && (
              <View className="space-y-4">
                <View>
                  <Label>{paymentT.cardNumber}</Label>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="mt-2"
                  />
                </View>
                <View>
                  <Label>{paymentT.cardName}</Label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="mt-2"
                  />
                </View>
                <View className="grid grid-cols-2 gap-4">
                  <View>
                    <Label>{paymentT.expiryDate}</Label>
                    <Input
                      type="text"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                      className="mt-2"
                    />
                  </View>
                  <View>
                    <Label>{paymentT.cvv}</Label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      maxLength={3}
                      className="mt-2"
                    />
                  </View>
                </View>
              </View>
            )}

            {(paymentMethod === 'instapay' || paymentMethod === 'vodafone') && !showVerification && (
              <View className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {paymentMethod === 'instapay' ? paymentT.instaPayInstructions : paymentT.vodafoneCashInstructions}
                  </AlertDescription>
                </Alert>
                <View>
                  <Label>{paymentT.phoneNumber}</Label>
                  <Input
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-2"
                  />
                </View>
                <Button
                  onPress={sendVerificationCode}
                  disabled={!phoneNumber || isProcessing}
                  variant="outline"
                  className="w-full"
                >
                  {paymentT.verifyPhone}
                </Button>
              </View>
            )}

            {showVerification && (
              <View className="space-y-4">
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-500">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {paymentT.verificationCodeSentMsg} {phoneNumber}
                  </AlertDescription>
                </Alert>
                <View>
                  <Label>{paymentT.verificationCode}</Label>
                  <Input
                    type="text"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    className="mt-2"
                  />
                </View>
                <Button
                  onPress={handleVerification}
                  disabled={!verificationCode || isProcessing}
                  className="w-full bg-[#FB5E7A] hover:bg-[#e5536e]"
                >
                  {isProcessing ? paymentT.processingPayment : paymentT.confirm}
                </Button>
                <Button
                  onPress={sendVerificationCode}
                  variant="ghost"
                  className="w-full"
                >
                  {paymentT.resendCode}
                </Button>
              </View>
            )}

            {paymentMethod === 'fawry' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {paymentT.fawryInstructions}
                </AlertDescription>
              </Alert>
            )}
          </Card>
        )}

        {/* Fawry Code Display */}
        {fawryCode && (
          <Card className="p-6 text-center">
            <View className="space-y-4">
              <View className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto">
                <DollarSign className="w-8 h-8 text-orange-500" />
              </View>
              <Text className="text-lg">{paymentT.fawryCode}</Text>
              <View className="text-3xl font-mono tracking-wider bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                {fawryCode}
              </View>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                {paymentT.fawryInstructions}
              </Text>
            </View>
          </Card>
        )}

        {/* Pay Button */}
        {!showVerification && !fawryCode && (
          <Button
            onPress={handlePayment}
            disabled={isProcessing}
            className="w-full bg-[#FB5E7A] hover:bg-[#e5536e]"
            size="lg"
          >
            {isProcessing ? paymentT.processingPayment : `${paymentT.payNow} - ${finalAmount.toFixed(2)} ${paymentT.egp}`}
          </Button>
        )}
      </View>
    </View>
  );
}
