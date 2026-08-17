import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: '#f0f4f8' }}>
      <div className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-xl flex" style={{ minHeight: '520px' }}>

        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-between p-10 w-5/12" style={{ background: '#1a3a6b' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <span className="text-white text-lg">💼</span>
            </div>
            <span className="text-white font-semibold text-lg">ClientPortal</span>
          </div>
          <div>
            <h1 className="text-white text-2xl font-semibold leading-snug mb-3">
              Join the platform today
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Create your account and start managing projects with clarity and transparency.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {[
              { icon: '🔒', text: 'Secure JWT-based authentication' },
              { icon: '👤', text: 'Role-based access control' },
              { icon: '📊', text: 'Real-time project dashboards' },
              { icon: '📧', text: 'Automated email notifications' },
            ].map((f, i) => (
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
            <h2 className="text-xl font-semibold text-gray-800">Create account</h2>
            <p className="text-sm text-gray-400 mt-1">Fill in your details to get started</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Full name', type: 'text', placeholder: 'John Doe', icon: '👤' },
              { key: 'email', label: 'Email', type: 'email', placeholder: 'you@company.com', icon: '✉️' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 characters', icon: '🔒' },
            ].map(({ key, label, type, placeholder, icon }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{icon}</span>
                  <input type={type} required value={form[key]} placeholder={placeholder}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50" />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'client', label: 'Client', icon: '🏢' },
                  { value: 'staff', label: 'Staff', icon: '👷' },
                  { value: 'admin', label: 'Admin', icon: '⚙️' },
                ].map(r => (
                  <button type="button" key={r.value}
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition ${
                      form.role === r.value
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-gray-50'
                    }`}>
                    <span className="text-lg">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition disabled:opacity-60 hover:opacity-90 mt-1"
              style={{ background: '#1a3a6b' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}