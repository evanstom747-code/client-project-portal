import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const statusBadge = {
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

const projectIcons = ['🌐', '📱', '🎮', '📊', '🛒', '🏗️', '🎯', '💼', '🔧', '📡'];

export default function ClientDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/projects').then(r => { setProjects(r.data); setLoading(false); });
  }, []);

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    avgProgress: projects.length
      ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length)
      : 0,
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Welcome, {user?.name} 👋</h1>
        <p className="text-sm text-gray-400 mt-0.5">Here's an overview of your active projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total projects', value: stats.total, icon: '📁', bg: '#e8f0fe' },
          { label: 'Active', value: stats.active, icon: '▶️', bg: '#e8f5e9' },
          { label: 'Completed', value: stats.completed, icon: '✅', bg: '#e3f2fd' },
          { label: 'Avg progress', value: `${stats.avgProgress}%`, icon: '📈', bg: '#fff8e1' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-3" style={{ background: s.bg }}>
              {s.icon}
            </div>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-gray-800">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Projects */}
      {projects.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl text-center py-20">
          <p className="text-4xl mb-3">📂</p>
          <p className="text-gray-400 text-sm">No active projects found.</p>
          <p className="text-gray-300 text-xs mt-1">Contact your project manager to get started.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((p, i) => (
            <div key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-gray-200 transition cursor-pointer">

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl bg-gray-50">
                    {projectIcons[i % projectIcons.length]}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">{p.title}</h3>
                    {p.deadline && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        📅 Due {new Date(p.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusBadge[p.status] || 'bg-gray-100 text-gray-600'}`}>
                  {p.status?.replace('_', ' ')}
                </span>
              </div>

              {p.description && (
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{p.description}</p>
              )}

              {/* Big Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 font-medium">Overall progress</span>
                  <span className="font-semibold text-gray-800">{p.progress || 0}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${p.progress || 0}%`,
                      background: p.progress >= 100 ? '#43a047' : p.progress >= 50 ? '#1a3a6b' : '#fb8c00'
                    }} />
                </div>
                <p className="text-xs text-blue-600 font-medium mt-3 text-right">
                  Click to view milestones and files →
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}