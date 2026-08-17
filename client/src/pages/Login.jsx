import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const demoAccounts = [
  { name: 'Admin User', role: 'admin', email: 'admin@portal.com', password: 'admin123', initials: 'AD', color: 'bg-blue-100 text-blue-800' },
  { name: 'Jane Staff', role: 'staff', email: 'staff@portal.com', password: 'staff123', initials: 'ST', color: 'bg-green-100 text-green-800' },
  { name: 'Acme Corp', role: 'client', email: 'client@portal.com', password: 'client123', initials: 'CL', color: 'bg-amber-100 text-amber-800' },
];

const features = [
  { icon: '📊', text: 'Real-time project progress tracking' },
  { icon: '👥', text: 'Role-based access for staff and clients' },
  { icon: '📁', text: 'Deliverable uploads and notifications' },
  { icon: '🚩', text: 'Milestone and task management' },
];

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/client');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const loginAs = async (account) => {
    setLoading(true);
    setError('');
    try {
      const user = await login(account.email, account.password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/client');
    } catch (err) {
      setError('Demo login failed. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-xl flex" style={{ minHeight: '560px' }}>

        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-between p-10 w-5/12" style={{ background: '#1a3a6b' }}>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <span className="text-white text-lg">💼</span>
            </div>
            <span className="text-white font-semibold text-lg">ClientPortal</span>
          </div>

          {/* Hero */}
          <div>
            <h1 className="text-white text-2xl font-semibold leading-snug mb-3">
              Manage your client projects with clarity
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              A single platform for your team and clients to track progress, milestones, and deliverables.
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-base">{f.icon}</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✉️</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60"
              style={{ background: '#1a3a6b' }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs text-gray-400">or sign in as demo user</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          {/* Demo Pills */}
          <div className="flex flex-col gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.role}
                onClick={() => loginAs(acc)}
                disabled={loading}
                className="flex items-center justify-between w-full border border-gray-200 rounded-lg px-3 py-2.5 hover:border-gray-400 hover:bg-gray-50 transition disabled:opacity-50 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${acc.color}`}>
                    {acc.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{acc.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{acc.role}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{acc.email}</span>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
