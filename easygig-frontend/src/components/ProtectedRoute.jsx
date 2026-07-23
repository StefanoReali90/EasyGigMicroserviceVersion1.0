import { useAuthStore } from '../store/authStore';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const { user, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) {
    return null; // Il caricamento è gestito in App.jsx
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
