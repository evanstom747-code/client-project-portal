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

export default function StaffDashboard() {
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
        <h1 className="text-xl font-semibold text-gray-800">My projects</h1>
        <p className="text-sm text-gray-400 mt-0.5">Welcome back, {user?.name} — here's your workload</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Assigned', value: stats.total, icon: '📁', bg: '#e8f0fe' },
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

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl text-center py-20">
          <p className="text-4xl mb-3">📂</p>
          <p className="text-gray-400 text-sm">No projects assigned yet.</p>
          <p className="text-gray-300 text-xs mt-1">Contact your admin to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <div key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-gray-200 transition cursor-pointer">

              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-50">
                    {projectIcons[i % projectIcons.length]}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800 leading-tight">{p.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Client: {p.client_name}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${statusBadge[p.status] || 'bg-gray-100 text-gray-600'}`}>
                  {p.status?.replace('_', ' ')}
                </span>
              </div>

              {/* Description */}
              {p.description && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">{p.description}</p>
              )}

              {/* Progress */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span className="font-medium">{p.progress || 0}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${p.progress || 0}%`,
                      background: p.progress >= 100 ? '#43a047' : p.progress >= 50 ? '#1a3a6b' : '#fb8c00'
                    }} />
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                {p.deadline ? (
                  <span className="text-xs text-gray-400">
                    📅 {new Date(p.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                ) : (
                  <span className="text-xs text-gray-300">No deadline</span>
                )}
                <span className="text-xs text-blue-600 font-medium">View details →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}