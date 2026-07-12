import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import authService from '../../services/authService';
import '../../styles/auth/forgot-password.css';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await authService.forgotPassword(email);
      navigate('/verify-otp', { state: { email } });
    } catch (requestError) {
      setError(requestError.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="We'll email you a code to reset it"
      footer={
        <span>
          Remembered it? <Link to="/login">Back to login</Link>
        </span>
      }
    >
      <form className="auth-form forgot-password" onSubmit={handleSubmit} noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError('');
          }}
          error={error}
          autoComplete="email"
        />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Send reset code
        </Button>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;
