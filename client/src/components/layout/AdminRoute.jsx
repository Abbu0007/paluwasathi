import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

export default function AdminRoute() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size={40} />
      </div>
    );
  }

  if (!token) return <Navigate to="/login" replace />;
  if (!user || user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}