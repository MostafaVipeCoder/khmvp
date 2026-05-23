import { View, Text } from '../tw';
import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../stores/useAuthStore';
import { toast } from 'sonner';
import { useTranslation } from '../hooks/useTranslation';

interface AuthPageProps {
  onBack?: () => void;
}

/**
 * Authentication Page Component
 * Handles user login, signup, and OTP verification flows.
 * @param props Component props
 * @param props.onBack Optional callback for back navigation
 */
export default function AuthPage({ onBack }: AuthPageProps) {
  const { t, language } = useTranslation();
  const authT = t.auth;
  const commonT = t.common;

  // Store actions for auth management
  const { signIn, signUp, verifyOTP, resendOTP, userType, setUserType } = useAuthStore();

  // React Native: sessionStorage is not available - always start with 'login'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify'>('login');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [motherJob, setMotherJob] = useState('');
  const [fatherJob, setFatherJob] = useState('');
  const [defaultAddress, setDefaultAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '', '', '']);
  const otpRefs = useRef<(any | null)[]>([]);

  // Function to handle OTP input changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 7) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: any) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (_e?: any) => {
    // e.preventDefault();
    const token = otp.join('');
    if (token.length < 8) {
      toast.error(authT.otpRequired);
      return;
    }

    setLoading(true);
    try {
      const { error } = await verifyOTP(email, token, 'signup');
      if (error) throw error;
      toast.success(commonT.success);
    } catch (error: any) {
      const isRateLimit = error.status === 429 || error.message?.toLowerCase().includes('rate limit');
      toast.error(isRateLimit ? authT.rateLimitExceeded : (error.message || commonT.error));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const { error } = await resendOTP(email, 'signup');
      if (error) throw error;
      toast.success(authT.accountCreated);
    } catch (error: any) {
      const isRateLimit = error.status === 429 || error.message?.toLowerCase().includes('rate limit');
      toast.error(isRateLimit ? authT.rateLimitExceeded : (error.message || commonT.error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    // e.preventDefault();
    if (mode === 'verify') return handleVerify(e);

    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setMode('verify');
            toast.info(authT.verificationTitle);
            return;
          }
          throw error;
        }
        toast.success(authT.loginSuccess);
      } else if (mode === 'signup') {
        if (!userType) {
          toast.error(authT.chooseRole);
          return;
        }
        if (password !== confirmPassword) {
          throw new Error(authT.passwordsNotMatch);
        }
        const { error } = await signUp(email, password, {
          full_name: fullName,
          phone,
          mother_job: motherJob,
          father_job: fatherJob,
          default_address: defaultAddress
        });
        if (error) throw error;
        setMode('verify');
        toast.success(authT.accountCreated);
      } else if (mode === 'forgot') {
        toast.info('Feature coming soon');
        setMode('login');
      }
    } catch (error: any) {
      console.error(error);
      const isRateLimit = error.status === 429 || error.message?.toLowerCase().includes('rate limit');
      toast.error(isRateLimit ? authT.rateLimitExceeded : (error.message || commonT.error));
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'verify') {
    return (
      <View className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFD1DA] to-[#FB5E7A]">
        <Card className="max-w-md w-full p-8 space-y-6">
          <View className="text-center space-y-4">
            <View className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#FB5E7A]" />
            </View>
            <Text className="text-[#FB5E7A] text-2xl font-bold">{authT.verificationTitle}</Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {authT.verificationDesc.replace('{email}', email)}
            </Text>

            <View className="flex-row justify-center space-x-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el: any) => (otpRefs.current[index] = el)}
                  keyboardType="numeric"
                  maxLength={1}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(index, val)}
                  onKeyPress={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold rounded-xl border-gray-200"
                />
              ))}
            </View>

            <Button
              onPress={handleVerify}
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-[#FB5E7A] hover:bg-[#e5536e] h-12 text-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : authT.verifyButton}
            </Button>

            <View className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-[#FB5E7A]"
                onPress={handleResend}
                disabled={loading}
              >
                {authT.resendOtp}
              </Button>
            </View>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-500"
              onPress={() => setMode('signup')}
            >
              {commonT.back}
            </Button>
          </View>
        </Card>
      </View>
    );
  }

  if (mode === 'forgot') {
    return (
      <View className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFD1DA] to-[#FB5E7A]">
        <Card className="max-w-md w-full p-8 space-y-6">
          <Button
            variant="ghost"
            onPress={() => setMode('login')}
            className="text-[#FB5E7A]"
          >
            {language === 'ar' ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
            {commonT.back}
          </Button>

          <View className="text-center space-y-2">
            <Text className="text-[#FB5E7A] text-xl font-bold">{authT.resetPassword}</Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {authT.resetDescription}
            </Text>
          </View>

          <View onSubmit={handleSubmit} className="space-y-4">
            <View className="space-y-2">
              <Label htmlFor="reset-email">{authT.email}</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChangeText={setEmail}
                required
                className="border-[#FB5E7A]"
              />
            </View>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FB5E7A] hover:bg-[#e5536e]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : authT.sendReset}
            </Button>

            <Button
              type="button"
              variant="link"
              className="w-full text-[#FB5E7A]"
              onPress={() => setMode('login')}
            >
              {authT.backToLogin}
            </Button>
          </View>
        </Card>
      </View>
    );
  }

  return (
    <View className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFD1DA] to-[#FB5E7A]">
      <Card className="max-w-md w-full p-8 space-y-6">
        {onBack && (
          <Button
            variant="ghost"
            onPress={onBack}
            className="text-[#FB5E7A]"
          >
            {language === 'ar' ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
            {commonT.back}
          </Button>
        )}

        {mode === 'signup' && (
          <View className="space-y-4">
            <Label className="text-center block text-gray-700 dark:text-gray-300 mb-2">
              {authT.chooseRole}
            </Label>
            <View className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={userType === 'client' ? 'default' : 'outline'}
                className={`h-auto py-3 px-2 flex flex-col gap-1 transition-all ${userType === 'client'
                  ? 'bg-[#FB5E7A] hover:bg-[#e5536e] text-white shadow-md'
                  : 'border-[#FB5E7A] text-[#FB5E7A] hover:bg-pink-50'
                  }`}
                onPress={() => setUserType('client')}
              >
                <Text className="font-bold text-sm">{authT.roleClient}</Text>
              </Button>
              <Button
                type="button"
                variant={userType === 'sitter' ? 'default' : 'outline'}
                className={`h-auto py-3 px-2 flex flex-col gap-1 transition-all ${userType === 'sitter'
                  ? 'bg-[#FB5E7A] hover:bg-[#e5536e] text-white shadow-md'
                  : 'border-[#FB5E7A] text-[#FB5E7A] hover:bg-pink-50'
                  }`}
                onPress={() => setUserType('sitter')}
              >
                <Text className="font-bold text-sm">{authT.roleSitter}</Text>
              </Button>
            </View>
          </View>
        )}

        <Text className="text-center text-2xl font-bold text-[#FB5E7A]">
          {mode === 'login' ? authT.login : authT.signup}
        </Text>

        <View onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <View className="space-y-2">
              <Label htmlFor="fullName">{authT.fullName}</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChangeText={setFullName}
                required
                className="border-[#FB5E7A]"
              />
            </View>
          )}

          <View className="space-y-2">
            <Label htmlFor="email">{authT.emailOrPhone}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChangeText={setEmail}
              required
              className="border-[#FB5E7A]"
            />
          </View>

          {mode === 'signup' && (
            <>
              <View className="space-y-2">
                <Label htmlFor="phone">{authT.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChangeText={setPhone}
                  required
                  className="border-[#FB5E7A]"
                />
              </View>

              {userType === 'client' && (
                <>
                  <View className="space-y-2">
                    <Label htmlFor="motherJob">{authT.motherJob}</Label>
                    <Input
                      id="motherJob"
                      type="text"
                      value={motherJob}
                      onChangeText={setMotherJob}
                      required
                      className="border-[#FB5E7A]"
                    />
                  </View>

                  <View className="space-y-2">
                    <Label htmlFor="fatherJob">{authT.fatherJob}</Label>
                    <Input
                      id="fatherJob"
                      type="text"
                      value={fatherJob}
                      onChangeText={setFatherJob}
                      required
                      className="border-[#FB5E7A]"
                    />
                  </View>

                  <View className="space-y-2">
                    <Label htmlFor="defaultAddress">{authT.defaultAddress}</Label>
                    <Input
                      id="defaultAddress"
                      type="text"
                      value={defaultAddress}
                      onChangeText={setDefaultAddress}
                      required
                      className="border-[#FB5E7A]"
                      placeholder={authT.addressPlaceholder}
                    />
                  </View>
                </>
              )}
            </>
          )}

          <View className="space-y-2">
            <Label htmlFor="password">{authT.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChangeText={setPassword}
              required
              className="border-[#FB5E7A]"
            />
          </View>

          {mode === 'signup' && (
            <View className="space-y-2">
              <Label htmlFor="confirmPassword">{authT.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                required
                className="border-[#FB5E7A]"
              />
            </View>
          )}

          {mode === 'login' && (
            <Button
              type="button"
              variant="link"
              className="text-[#FB5E7A] p-0 h-auto"
              onPress={() => setMode('forgot')}
            >
              {authT.forgotPassword}
            </Button>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FB5E7A] hover:bg-[#e5536e]"
          >
            {loading ? (
              <View className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {commonT.loading}
              </View>
            ) : mode === 'login' ? authT.loginButton : authT.signupButton}
          </Button>
        </View>

        <View className="text-center">
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {mode === 'login' ? authT.noAccount : authT.haveAccount}{' '}
          </Text>
          <Button
            variant="link"
            className="text-[#FB5E7A] p-0 h-auto"
            onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? authT.switchToSignup : authT.switchToLogin}
          </Button>
        </View>
      </Card>
    </View>
  );
}


