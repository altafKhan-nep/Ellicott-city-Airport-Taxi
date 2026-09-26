import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, ArrowRight, User, Car, UserCog, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import PasswordField from '../components/auth/PasswordField.jsx';
import SocialLoginButtons from '../components/auth/SocialLoginButtons.jsx';

const DEMO_ACCOUNTS = [
  { label: 'Passenger', email: 'passenger@ellicot.com', password: 'pass123', icon: User },
  { label: 'Driver', email: 'alex@ellicot.com', password: 'driver123', icon: Car },
  { label: 'Admin', email: 'admin@ellicot.com', password: 'admin123', icon: UserCog },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({
    identifier: '',
    password: '',
    rememberMe: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => {
    const value = k === 'rememberMe' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: value }));
    if (error) setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.identifier.trim() || !form.password) {
      setError('Enter your email or phone number and password.');
      return;
    }
    setLoading(true);
    try {
      const loggedIn = await login(form);
      navigate(
        loggedIn.role === 'driver'
          ? '/driver'
          : loggedIn.role === 'admin'
            ? '/admin'
            : from,
        { replace: true },
      );
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (acct) => {
    setForm({ identifier: acct.email, password: acct.password, rememberMe: true });
    setError('');
  };

  return (
    <AuthLayout
      eyebrow="Member access"
      title="Airport runs and rides across"
      highlight="Maryland, DC & VA"
      subtitle="Sign in to book a transfer, track your driver live and manage every trip in one place."
      footer={
        <>
          New to Ellicott City Airport Taxi?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <h2 className="font-display text-2xl font-bold tracking-tight">Sign in</h2>
      <p className="mt-1.5 text-sm text-muted">
        Use your email address or phone number.
      </p>

      <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
        <Input
          label="Email or phone number"
          type="text"
          required
          autoComplete="username"
          icon={<Mail className="h-4 w-4" />}
          placeholder="you@example.com or (410) 365-5556"
          value={form.identifier}
          onChange={set('identifier')}
        />

        <div>
          <PasswordField
            label="Password"
            required
            value={form.password}
            onChange={set('password')}
          />
          <div className="-mt-1 text-right">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-brand-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.rememberMe}
            onChange={set('rememberMe')}
            className="h-4 w-4 rounded border-accent-300 accent-brand-600"
          />
          Keep me signed in for 30 days
        </label>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? 'Signing in…' : 'Sign in'}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <SocialLoginButtons />

      <div className="mt-7 border-t border-accent-200 pt-5">
        <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted">
          <Sparkles className="h-3.5 w-3.5 text-gold-500" />
          Try a demo account
        </p>
        <div className="grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map(({ label, icon: Icon, ...acct }) => (
            <button
              key={label}
              type="button"
              onClick={() => quickFill(acct)}
              className="group flex flex-col items-center gap-1.5 rounded-2xl border border-accent-200 bg-surface px-2 py-3 text-xs font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 hover:shadow-md"
            >
              <Icon className="h-4 w-4 text-brand-600" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}
