import { useState, useEffect } from 'react';
import api from '../utils/api';

const roleStyles = {
  admin: { badge: 'bg-purple-100 text-purple-800', avatar: 'bg-purple-100 text-purple-700' },
  staff: { badge: 'bg-blue-100 text-blue-800', avatar: 'bg-blue-100 text-blue-700' },
  client: { badge: 'bg-green-100 text-green-800', avatar: 'bg-green-100 text-green-700' },
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/users').then(r => {
    setUsers(r.data); setFiltered(r.data); setLoading(false);
  });

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let list = users;
    if (filterRole !== 'all') list = list.filter(u => u.role === filterRole);
    if (search) list = list.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [search, filterRole, users]);

  const updateRole = async (id, role) => {
    await api.put(`/users/${id}/role`, { role });
    load();
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    await api.delete(`/users/${id}`);
    load();
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    clients: users.filter(u => u.role === 'client').length,
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
        <h1 className="text-xl font-semibold text-gray-800">User management</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage roles and access for all users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total users', value: stats.total, icon: '👥', bg: '#e8f0fe' },
          { label: 'Admins', value: stats.admins, icon: '⚙️', bg: '#f3e8ff' },
          { label: 'Staff', value: stats.staff, icon: '👷', bg: '#e3f2fd' },
          { label: 'Clients', value: stats.clients, icon: '🏢', bg: '#e8f5e9' },
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

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {/* Filters */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center gap-4">
          <div className="flex gap-2">
            {['all', 'admin', 'staff', 'client'].map(r => (
              <button key={r} onClick={() => setFilterRole(r)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition ${
                  filterRole === r
                    ? 'text-white'
                    : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
                style={filterRole === r ? { background: '#1a3a6b' } : {}}>
                {r === 'all' ? 'All users' : r}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <span className="text-gray-400 text-sm">🔍</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users..."
              className="border-none bg-transparent text-sm text-gray-700 outline-none w-36 placeholder-gray-400" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">👤</p>
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(u => (
              <div key={u.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition">
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${roleStyles[u.role]?.avatar || 'bg-gray-100 text-gray-600'}`}>
                  {getInitials(u.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>

                {/* Role Badge */}
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize flex-shrink-0 ${roleStyles[u.role]?.badge || 'bg-gray-100 text-gray-600'}`}>
                  {u.role}
                </span>

                {/* Joined */}
                <span className="text-xs text-gray-400 w-24 text-right flex-shrink-0">
                  {new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select value={u.role} onChange={e => updateRole(u.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-gray-50 text-gray-700">
                    {['admin', 'staff', 'client'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button onClick={() => deleteUser(u.id)}
                    className="text-xs border border-red-100 text-red-500 rounded-lg px-2.5 py-1.5 hover:bg-red-50 transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}