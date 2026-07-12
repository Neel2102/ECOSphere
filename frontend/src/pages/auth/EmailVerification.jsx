import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button/Button';
import OtpInput from '../../components/common/OtpInput/OtpInput';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth/email-verification.css';

const RESEND_COOLDOWN_SECONDS = 60;

// Post-signup email verification: enter the 6-digit code sent by email.
function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { startSession } = useAuth();

  const email = location.state?.email;
  const autoResend = location.state?.autoResend;

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(autoResend ? 0 : RESEND_COOLDOWN_SECONDS);
  const autoResendDone = useRef(false);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // When login redirected here for an unverified account, send a fresh code.
  useEffect(() => {
    if (!autoResend || autoResendDone.current || !email) return;
    autoResendDone.current = true;
    handleResend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!email) return <Navigate to="/signup" replace />;

  const handleVerify = async (event) => {
    event.preventDefault();
    if (otp.length !== 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const session = await authService.verifyOtp(email, otp);
      startSession(session);
      navigate('/dashboard', { replace: true });
    } catch (verifyError) {
      setError(verifyError.message);
      setSubmitting(false);
    }
  };

  async function handleResend() {
    setError('');
    setInfo('');
    try {
      await authService.resendOtp(email);
      setInfo('A new code is on its way to your inbox.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (resendError) {
      setError(resendError.message);
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="One quick step before you get started"
      footer={
        <span>
          Wrong email? <Link to="/signup">Sign up again</Link>
        </span>
      }
    >
      <form className="auth-form email-verification" onSubmit={handleVerify} noValidate>
        <p className="email-verification__text">
          We sent a 6-digit code to <span className="auth-email-highlight">{email}</span>.
          Enter it below to activate your account.
        </p>

        {info && <div className="auth-alert auth-alert--success">{info}</div>}

        <OtpInput value={otp} onChange={setOtp} error={error} disabled={submitting} />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Verify &amp; continue
        </Button>

        <p className="email-verification__resend">
          Didn&apos;t get the code?{' '}
          {cooldown > 0 ? (
            <span className="u-text-soft">Resend in {cooldown}s</span>
          ) : (
            <button type="button" className="email-verification__resend-btn" onClick={handleResend}>
              Resend code
            </button>
          )}
        </p>
      </form>
    </AuthLayout>
  );
}

export default EmailVerification;
