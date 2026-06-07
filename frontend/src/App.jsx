import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Navbar from './components/common/Navbar';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '12px',
              border: '1px solid var(--outline-var)',
              boxShadow: '0 8px 24px rgba(0,16,62,0.12)',
            },
            success: { iconTheme: { primary: 'var(--secondary)', secondary: 'white' } },
            error: { iconTheme: { primary: 'var(--error)', secondary: 'white' } },
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/login" element={<><Navbar /><Login /></>} />
          <Route path="/signup" element={<><Navbar /><Signup /></>} />

          {/* Patient routes */}
          <Route path="/patient/dashboard" element={
            <PrivateRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </PrivateRoute>
          } />

          {/* Doctor routes */}
          <Route path="/doctor/dashboard" element={
            <PrivateRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </PrivateRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          } />

          {/* Redirects */}
          <Route path="/patient" element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="/doctor" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
