import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button/Button';
import OtpInput from '../../components/common/OtpInput/OtpInput';
import authService from '../../services/authService';
import '../../styles/auth/otp-verification.css';

const RESEND_COOLDOWN_SECONDS = 60;

// Password-reset OTP entry (step 2 of the forgot-password flow).
function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!email) return <Navigate to="/forgot-password" replace />;

  const handleVerify = async (event) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { resetToken } = await authService.verifyResetOtp(email, otp);
      navigate('/reset-password', { state: { email, resetToken } });
    } catch (verifyError) {
      setError(verifyError.message);
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      await authService.forgotPassword(email);
      setInfo('A new code is on its way to your inbox.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (resendError) {
      setError(resendError.message);
    }
  };

  return (
    <AuthLayout
      title="Check your inbox"
      subtitle="Enter the reset code we emailed you"
      footer={
        <span>
          Remembered it? <Link to="/login">Back to login</Link>
        </span>
      }
    >
      <form className="auth-form otp-verification" onSubmit={handleVerify} noValidate>
        <p className="otp-verification__text">
          A 6-digit reset code was sent to <span className="auth-email-highlight">{email}</span>.
        </p>

        {info && <div className="auth-alert auth-alert--success">{info}</div>}

        <OtpInput value={otp} onChange={setOtp} error={error} disabled={submitting} />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Verify code
        </Button>

        <p className="otp-verification__resend">
          Didn&apos;t get the code?{' '}
          {cooldown > 0 ? (
            <span className="u-text-soft">Resend in {cooldown}s</span>
          ) : (
            <button type="button" className="otp-verification__resend-btn" onClick={handleResend}>
              Resend code
            </button>
          )}
        </p>
      </form>
    </AuthLayout>
  );
}

export default OtpVerification;
