import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../hooks/useAuth';

export default function StaffRoute() {
  const { role } = useAuth();
  if (!['admin', 'editor'].includes(role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
