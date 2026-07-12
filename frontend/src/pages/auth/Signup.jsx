import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import Button from '../../components/common/Button/Button';
import authService from '../../services/authService';
import '../../styles/auth/signup.css';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Organization Admin' },
  { value: 'manager', label: 'Department Manager' },
  { value: 'employee', label: 'Employee' },
];

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '',
  });
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
    if (form.fullName.trim().length < 2) next.fullName = 'Enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (form.password.length < 8 || !/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      next.password = 'At least 8 characters, with a letter and a number.';
    }
    if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords do not match.';
    if (!/^[0-9]{10}$/.test(form.phone)) next.phone = 'Enter a 10-digit phone number.';
    if (!form.role) next.role = 'Please select a role.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await authService.signup(form);
      navigate('/verify-email', { state: { email: form.email } });
    } catch (error) {
      setServerError(error.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join your team's workspace in a minute"
      wide
      footer={
        <span>
          Already have an account? <Link to="/login">Log in</Link>
        </span>
      }
    >
      <form className="auth-form signup-form" onSubmit={handleSubmit} noValidate>
        {serverError && <div className="auth-alert auth-alert--error">{serverError}</div>}

        <div className="signup-form__grid">
          <Input
            label="Full name"
            placeholder="Jane Cooper"
            value={form.fullName}
            onChange={(event) => setField('fullName', event.target.value)}
            error={errors.fullName}
            autoComplete="name"
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
            placeholder="Create a password"
            value={form.password}
            onChange={(event) => setField('password', event.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat the password"
            value={form.confirmPassword}
            onChange={(event) => setField('confirmPassword', event.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <Input
            label="Phone number"
            type="tel"
            prefix="+91"
            placeholder="10-digit number"
            maxLength={10}
            value={form.phone}
            onChange={(event) => setField('phone', event.target.value.replace(/\D/g, ''))}
            error={errors.phone}
            autoComplete="tel-national"
          />
          <Select
            label="Role"
            placeholder="Select a role"
            options={ROLE_OPTIONS}
            value={form.role}
            onChange={(value) => setField('role', value)}
            error={errors.role}
          />
        </div>

        <Button type="submit" size="lg" fullWidth loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Signup;
