import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RequireOSPAdmin({ children }) {
  const { user } = useAuth();

  if (user?.brandId !== 3) {
    return <Navigate to="/" replace />;
  }

  return children;
}