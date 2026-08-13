import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Button } from '../components/ui/Button.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form);
      navigate(user.role === 'driver' ? '/driver' : user.role === 'admin' ? '/admin' : from, {
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quick = [
    { label: 'Passenger', email: 'passenger@ridetaxi.com', password: 'pass123' },
    { label: 'Driver', email: 'alex@ridetaxi.com', password: 'driver123' },
    { label: 'Admin', email: 'admin@ridetaxi.com', password: 'admin123' },
  ];

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in to book and manage your rides.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Sign in
          </Button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Quick demo accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            {quick.map((q) => (
              <button
                key={q.label}
                onClick={() => setForm({ email: q.email, password: q.password })}
                className="rounded-lg border border-slate-200 px-2 py-2 text-xs font-medium transition-colors hover:border-brand-400 hover:text-brand-700"
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          New to RideTaxi?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}