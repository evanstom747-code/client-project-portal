import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ProjectDetail from './pages/ProjectDetail';
import Users from './pages/Users';
import Navbar from './components/common/Navbar';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
}

function DashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin" />;
  if (user?.role === 'staff') return <Navigate to="/staff" />;
  return <Navigate to="/client" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 py-6">
                  <Routes>
                    <Route path="/dashboard" element={<DashboardRedirect />} />
                    <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/staff" element={<ProtectedRoute roles={['admin', 'staff']}><StaffDashboard /></ProtectedRoute>} />
                    <Route path="/client" element={<ProtectedRoute roles={['client']}><ClientDashboard /></ProtectedRoute>} />
                    <Route path="/projects/:id" element={<ProjectDetail />} />
                    <Route path="/users" element={<ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
