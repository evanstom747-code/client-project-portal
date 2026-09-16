import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => location.pathname.startsWith(path)
    ? 'text-white font-medium border-b-2 border-white pb-0.5'
    : 'text-blue-200 hover:text-white transition';

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <nav style={{ background: '#1a3a6b' }} className="px-6 h-14 flex items-center justify-between shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <span className="text-white text-sm">💼</span>
          </div>
          <span className="text-white font-semibold text-base">ClientPortal</span>
        </Link>

        <div className="h-5 w-px bg-blue-500"></div>

        <div className="flex items-center gap-5 text-sm">
          {user?.role === 'admin' && (
            <>
              <Link to="/admin" className={isActive('/admin')}>Projects</Link>
              <Link to="/users" className={isActive('/users')}>Users</Link>
            </>
          )}
          {user?.role === 'staff' && (
            <Link to="/staff" className={isActive('/staff')}>My projects</Link>
          )}
          {user?.role === 'client' && (
            <Link to="/client" className={isActive('/client')}>My projects</Link>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>
            {initials}
          </div>
          <div>
            <p className="text-white text-xs font-medium leading-tight">{user?.name}</p>
            <p className="text-blue-300 text-xs capitalize leading-tight">{user?.role}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="bg-white text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:bg-blue-50"
          style={{ color: '#1a3a6b' }}>
          Logout
        </button>
      </div>
    </nav>
  );
}