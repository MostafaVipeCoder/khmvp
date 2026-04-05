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

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify'>(() => {
    const savedMode = sessionStorage.getItem('auth_redirect_mode');
    if (savedMode === 'signup') {
      sessionStorage.removeItem('auth_redirect_mode');
      return 'signup';
    }
    return 'login';
  });

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
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFD1DA] to-[#FB5E7A]">
        <Card className="max-w-md w-full p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#FB5E7A]" />
            </div>
            <h2 className="text-[#FB5E7A] text-2xl font-bold">{authT.verificationTitle}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {authT.verificationDesc.replace('{email}', email)}
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex justify-center gap-1 sm:gap-3" dir="ltr">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-8 h-10 sm:w-12 sm:h-14 text-center text-lg sm:text-2xl font-bold border-2 border-[#FB5E7A] rounded-lg focus:ring-2 focus:ring-[#FB5E7A] focus:outline-none bg-white dark:bg-gray-800"
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FB5E7A] hover:bg-[#e5536e] h-12 text-lg"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : authT.verifyButton}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-[#FB5E7A]"
                onClick={handleResend}
                disabled={loading}
              >
                {authT.resendOtp}
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-500"
              onClick={() => setMode('signup')}
            >
              {commonT.back}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  if (mode === 'forgot') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFD1DA] to-[#FB5E7A]">
        <Card className="max-w-md w-full p-8 space-y-6">
          <Button
            variant="ghost"
            onClick={() => setMode('login')}
            className="text-[#FB5E7A]"
          >
            {language === 'ar' ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
            {commonT.back}
          </Button>

          <div className="text-center space-y-2">
            <h2 className="text-[#FB5E7A] text-xl font-bold">{authT.resetPassword}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {authT.resetDescription}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">{authT.email}</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#FB5E7A]"
              />
            </div>

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
              onClick={() => setMode('login')}
            >
              {authT.backToLogin}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FFD1DA] to-[#FB5E7A]">
      <Card className="max-w-md w-full p-8 space-y-6">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-[#FB5E7A]"
          >
            {language === 'ar' ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
            {commonT.back}
          </Button>
        )}

        {mode === 'signup' && (
          <div className="space-y-4">
            <Label className="text-center block text-gray-700 dark:text-gray-300 mb-2">
              {authT.chooseRole}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={userType === 'client' ? 'default' : 'outline'}
                className={`h-auto py-3 px-2 flex flex-col gap-1 transition-all ${userType === 'client'
                  ? 'bg-[#FB5E7A] hover:bg-[#e5536e] text-white shadow-md'
                  : 'border-[#FB5E7A] text-[#FB5E7A] hover:bg-pink-50'
                  }`}
                onClick={() => setUserType('client')}
              >
                <span className="font-bold text-sm">{authT.roleClient}</span>
              </Button>
              <Button
                type="button"
                variant={userType === 'sitter' ? 'default' : 'outline'}
                className={`h-auto py-3 px-2 flex flex-col gap-1 transition-all ${userType === 'sitter'
                  ? 'bg-[#FB5E7A] hover:bg-[#e5536e] text-white shadow-md'
                  : 'border-[#FB5E7A] text-[#FB5E7A] hover:bg-pink-50'
                  }`}
                onClick={() => setUserType('sitter')}
              >
                <span className="font-bold text-sm">{authT.roleSitter}</span>
              </Button>
            </div>
          </div>
        )}

        <h2 className="text-center text-2xl font-bold text-[#FB5E7A]">
          {mode === 'login' ? authT.login : authT.signup}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="fullName">{authT.fullName}</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="border-[#FB5E7A]"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{authT.emailOrPhone}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-[#FB5E7A]"
            />
          </div>

          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="phone">{authT.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="border-[#FB5E7A]"
                />
              </div>

              {userType === 'client' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="motherJob">{authT.motherJob}</Label>
                    <Input
                      id="motherJob"
                      type="text"
                      value={motherJob}
                      onChange={(e) => setMotherJob(e.target.value)}
                      required
                      className="border-[#FB5E7A]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fatherJob">{authT.fatherJob}</Label>
                    <Input
                      id="fatherJob"
                      type="text"
                      value={fatherJob}
                      onChange={(e) => setFatherJob(e.target.value)}
                      required
                      className="border-[#FB5E7A]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="defaultAddress">{authT.defaultAddress}</Label>
                    <Input
                      id="defaultAddress"
                      type="text"
                      value={defaultAddress}
                      onChange={(e) => setDefaultAddress(e.target.value)}
                      required
                      className="border-[#FB5E7A]"
                      placeholder={authT.addressPlaceholder}
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">{authT.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-[#FB5E7A]"
            />
          </div>

          {mode === 'signup' && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{authT.confirmPassword}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-[#FB5E7A]"
              />
            </div>
          )}

          {mode === 'login' && (
            <Button
              type="button"
              variant="link"
              className="text-[#FB5E7A] p-0 h-auto"
              onClick={() => setMode('forgot')}
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
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {commonT.loading}
              </div>
            ) : mode === 'login' ? authT.loginButton : authT.signupButton}
          </Button>
        </form>

        <div className="text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {mode === 'login' ? authT.noAccount : authT.haveAccount}{' '}
          </span>
          <Button
            variant="link"
            className="text-[#FB5E7A] p-0 h-auto"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? authT.switchToSignup : authT.switchToLogin}
          </Button>
        </div>
      </Card>
    </div>
  );
}
