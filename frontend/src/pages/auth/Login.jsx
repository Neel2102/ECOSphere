import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth/login.css';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Organization Admin' },
  { value: 'manager', label: 'Department Admin' },
  { value: 'employee', label: 'Employee' },
];

function Login() {
  const navigate = useNavigate();
  const { startSession } = useAuth();

  const [form, setForm] = useState({ role: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError('');
  };

  const validate = () => {
    const next = {};
    if (!form.role) next.role = 'Please select your role.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.password) next.password = 'Password is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const session = await authService.login(form.email, form.password, form.role);
      startSession(session);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.code === 'NOT_VERIFIED') {
        navigate('/verify-email', { state: { email: form.email, autoResend: true } });
        return;
      }
      setServerError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your workspace"
      footer={
        <span>
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </span>
      }
    >
      <form className="auth-form login-form" onSubmit={handleSubmit} noValidate>
        {serverError && <div className="auth-alert auth-alert--error">{serverError}</div>}

        <Select
          label="Role"
          placeholder="Select your role"
          options={ROLE_OPTIONS}
          value={form.role}
          onChange={(value) => setField('role', value)}
          error={errors.role}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={(event) => setField('email', event.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(event) => setField('password', event.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        <div className="auth-form__row login-form__links">
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Log in
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Login;
