import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import Popup from '../../components/common/Popup/Popup';
import authService from '../../services/authService';
import '../../styles/auth/reset-password.css';

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, resetToken } = location.state || {};

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!email || !resetToken) return <Navigate to="/forgot-password" replace />;

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError('');
  };

  const validate = () => {
    const next = {};
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      next.password = 'At least 8 characters, with a letter and a number.';
    }
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await authService.resetPassword({ email, resetToken, ...form });
      setDone(true);
    } catch (error) {
      setServerError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle={`for ${email}`}
      footer={
        <span>
          Remembered it? <Link to="/login">Back to login</Link>
        </span>
      }
    >
      <form className="auth-form reset-password" onSubmit={handleSubmit} noValidate>
        {serverError && <div className="auth-alert auth-alert--error">{serverError}</div>}

        <Input
          label="New password"
          type="password"
          placeholder="Create a new password"
          value={form.password}
          onChange={(event) => setField('password', event.target.value)}
          error={errors.password}
          autoComplete="new-password"
        />
        <Input
          label="Confirm new password"
          type="password"
          placeholder="Repeat the new password"
          value={form.confirmPassword}
          onChange={(event) => setField('confirmPassword', event.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Reset password
        </Button>
      </form>

      <Popup
        open={done}
        variant="info"
        icon="check"
        title="Password updated"
        message="Your password has been changed. Log in with the new one."
        confirmLabel="Go to login"
        onConfirm={() => navigate('/login', { replace: true })}
      />
    </AuthLayout>
  );
}

export default ResetPassword;
