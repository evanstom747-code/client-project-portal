import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const statusBadge = {
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
};

const projectIcons = ['🌐', '📱', '🎮', '📊', '🛒', '🏗️', '🎯', '💼', '🔧', '📡'];

export default function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [clients, setClients] = useState([]);
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', client_id: '', deadline: '', staff_ids: [], status: 'active' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [p, c, s] = await Promise.all([
        api.get('/projects'),
        api.get('/users/role/client'),
        api.get('/users/role/staff'),
      ]);
      setProjects(p.data);
      setFiltered(p.data);
      setClients(c.data);
      setStaff(s.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(projects.filter(p =>
      p.title.toLowerCase().includes(q) || p.client_name?.toLowerCase().includes(q)
    ));
  }, [search, projects]);

  const openCreate = () => {
    setEditProject(null);
    setForm({ title: '', description: '', client_id: '', deadline: '', staff_ids: [], status: 'active' });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProject(p);
    setForm({ title: p.title, description: p.description || '', client_id: p.client_id, deadline: p.deadline?.split('T')[0] || '', staff_ids: [], status: p.status });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editProject) await api.put(`/projects/${editProject.id}`, form);
      else await api.post('/projects', form);
      setShowModal(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    await api.delete(`/projects/${id}`);
    load();
  };

  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    clients: [...new Set(projects.map(p => p.client_id))].length,
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
    </div>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Projects</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage and track all client projects</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg transition hover:opacity-90"
          style={{ background: '#1a3a6b' }}>
          <span className="text-base leading-none">+</span> New project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total projects', value: stats.total, icon: '📁', sub: 'All time', bg: '#e8f0fe' },
          { label: 'Active', value: stats.active, icon: '▶️', sub: 'In progress', bg: '#e8f5e9' },
          { label: 'Completed', value: stats.completed, icon: '✅', sub: 'This month', bg: '#e3f2fd' },
          { label: 'Clients', value: stats.clients, icon: '👥', sub: 'Active accounts', bg: '#fff8e1' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-3" style={{ background: s.bg }}>
              {s.icon}
            </div>
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-2xl font-semibold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Projects Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">All projects</span>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="border-none bg-transparent text-sm text-gray-700 outline-none w-40 placeholder-gray-400"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📂</p>
            <p className="text-sm">{search ? 'No projects match your search' : 'No projects yet. Create your first one!'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition">
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 bg-gray-50">
                  {projectIcons[i % projectIcons.length]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-800 truncate">{p.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge[p.status] || 'bg-gray-100 text-gray-600'}`}>
                      {p.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Client: {p.client_name}</p>
                </div>

                {/* Progress */}
                <div className="w-40 flex-shrink-0">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{p.progress || 0}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${p.progress || 0}%`,
                        background: p.progress >= 100 ? '#43a047' : p.progress >= 50 ? '#1a3a6b' : '#fb8c00'
                      }}
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div className="text-xs text-gray-400 w-24 text-right flex-shrink-0">
                  {p.deadline ? (
                    <span>📅 {new Date(p.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  ) : (
                    <span className="text-gray-300">No deadline</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => navigate(`/projects/${p.id}`)}
                    className="text-xs border border-gray-200 rounded-md px-2.5 py-1 text-gray-600 hover:bg-gray-50 transition">
                    View
                  </button>
                  <button onClick={() => openEdit(p)}
                    className="text-xs border border-gray-200 rounded-md px-2.5 py-1 text-gray-600 hover:bg-gray-50 transition">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p.id)}
                    className="text-xs border border-red-100 rounded-md px-2.5 py-1 text-red-500 hover:bg-red-50 transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">
                {editProject ? 'Edit project' : 'New project'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Project title *</label>
                <input required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="e.g. Website Redesign" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea rows={3} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
                  placeholder="Brief description of the project..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Client *</label>
                  <select required value={form.client_id}
                    onChange={e => setForm({ ...form, client_id: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    <option value="">Select client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Deadline</label>
                  <input type="date" value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" />
                </div>
              </div>

              {editProject && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                  <select value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50">
                    {['active', 'on_hold', 'completed', 'cancelled'].map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Assign staff</label>
                <div className="border border-gray-200 rounded-lg p-2 max-h-32 overflow-y-auto bg-gray-50 space-y-1">
                  {staff.length === 0 ? (
                    <p className="text-xs text-gray-400 p-1">No staff members found</p>
                  ) : staff.map(s => (
                    <label key={s.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-white p-1.5 rounded transition">
                      <input type="checkbox"
                        checked={form.staff_ids.includes(s.id)}
                        onChange={e => setForm({
                          ...form,
                          staff_ids: e.target.checked
                            ? [...form.staff_ids, s.id]
                            : form.staff_ids.filter(id => id !== s.id)
                        })} />
                      <span>{s.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 text-white py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60 hover:opacity-90"
                  style={{ background: '#1a3a6b' }}>
                  {saving ? 'Saving...' : editProject ? 'Save changes' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
