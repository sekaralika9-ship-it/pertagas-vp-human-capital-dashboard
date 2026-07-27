import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import LoadingState from '../components/common/LoadingState';

export default function ProtectedRoute() {
  const { user, loading, configured } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingState fullPage label="Checking your session…" />;
  if (!configured || !user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
