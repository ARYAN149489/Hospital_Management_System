// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import NotificationCenter from './components/common/NotificationCenter';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import FindDoctors from './pages/patient/FindDoctors';
import BookAppointment from './pages/patient/BookAppointment';
import Appointments from './pages/patient/Appointments';
import Prescriptions from './pages/patient/Prescriptions';
import LabTests from './pages/patient/LabTests';
import BookLabTest from './pages/patient/BookLabTest';
import PatientProfile from './pages/patient/Profile';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import MySchedule from './pages/doctor/MySchedule';
import MyPatients from './pages/doctor/MyPatients';
import PatientHistory from './pages/doctor/PatientHistory';
import DoctorAppointments from './pages/doctor/Appointments';
import CreatePrescription from './pages/doctor/CreatePrescription';
import DoctorPrescriptions from './pages/doctor/Prescriptions';
import Leave from './pages/doctor/Leave';
import DoctorProfile from './pages/doctor/Profile';
import DoctorSettings from './pages/doctor/Settings';
import ViewPrescription from './pages/doctor/ViewPrescription';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManagePatients from './pages/admin/ManagePatients';
import PatientDetails from './pages/admin/PatientDetails';
import ManageAppointments from './pages/admin/ManageAppointments';
import ManageDepartments from './pages/admin/ManageDepartments';
import ManageLeave from './pages/admin/ManageLeave';
import ManageLabTests from './pages/admin/ManageLabTests';
import Analytics from './pages/admin/Analytics';

// Private Route Component
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasGoogleConfig = googleClientId && googleClientId !== 'your_google_client_id_here.apps.googleusercontent.com';

  const AppContent = () => (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <NotificationCenter />
          
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Patient Routes */}
              <Route
                path="/patient/dashboard"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <PatientDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/find-doctors"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <FindDoctors />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/book-appointment/:doctorId?"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <BookAppointment />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/appointments"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <Appointments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/prescriptions"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <Prescriptions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/lab-tests"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <LabTests />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/book-lab-test"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <BookLabTest />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient/profile"
                element={
                  <PrivateRoute allowedRoles={['patient']}>
                    <PatientProfile />
                  </PrivateRoute>
                }
              />

              {/* Doctor Routes */}
              <Route
                path="/doctor/dashboard"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/schedule"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <MySchedule />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/my-patients"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <MyPatients />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/patient-history/:patientId"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <PatientHistory />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/appointments"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorAppointments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/prescriptions/create/:appointmentId?"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <CreatePrescription />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/prescriptions"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorPrescriptions />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/prescriptions/:id"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <ViewPrescription />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/leave"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <Leave />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/profile"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/doctor/settings"
                element={
                  <PrivateRoute allowedRoles={['doctor']}>
                    <DoctorSettings />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/doctors"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <ManageDoctors />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/patients"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <ManagePatients />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/patients/:id"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <PatientDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/appointments"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <ManageAppointments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <ManageDepartments />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/leave"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <ManageLeave />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/lab-tests"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <ManageLabTests />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <Analytics />
                  </PrivateRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
          containerStyle={{
            top: 80,
        }}
      />
    </AuthProvider>
  </Router>
  );

  return hasGoogleConfig ? (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AppContent />
    </GoogleOAuthProvider>
  ) : (
    <AppContent />
  );
}export default App;