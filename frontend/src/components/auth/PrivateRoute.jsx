import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleRedirect = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
};

export default function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const redirect = roleRedirect[user?.role] || '/';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
