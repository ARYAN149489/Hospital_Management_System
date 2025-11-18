import React, { useState, useEffect } from 'react';
import { 
  Heart, Calendar, MessageSquare, FileText, Activity, User, Bell, 
  Search, Clock, MapPin, Phone, Mail, Download, Plus, ChevronRight,
  Stethoscope, Pill, TestTube, LogOut, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { patientAPI } from '../../services/api';
import toast from 'react-hot-toast';
import FindDoctors from './FindDoctors';
import Appointments from './Appointments';
import Prescriptions from './Prescriptions';
import LabTests from './LabTests';
import Chatbot from './Chatbot';
import Profile from './Profile';

export default function PatientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Reset to dashboard when navigating to /patient/dashboard or when search params change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const section = searchParams.get('section');
    
    if (location.pathname === '/patient/dashboard') {
      if (section) {
        setActiveSection(section);
      } else {
        setActiveSection('dashboard');
      }
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (activeSection === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeSection]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Use real data from API or fallback to empty arrays
  const upcomingAppointments = dashboardData?.upcomingAppointments || [];
  const recentPrescriptions = dashboardData?.recentPrescriptions || [];
  const statistics = dashboardData?.statistics || {
    upcomingAppointmentsCount: 0,
    prescriptionsCount: 0,
    pendingLabTestsCount: 0
  };

  const healthMetrics = [
    { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'normal', icon: Activity },
    { label: 'Heart Rate', value: '72', unit: 'bpm', status: 'normal', icon: Heart },
    { label: 'BMI', value: '24.5', unit: 'kg/m²', status: 'normal', icon: Activity },
    { label: 'Temperature', value: '98.6', unit: '°F', status: 'normal', icon: Activity }
  ];

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'appointments', name: 'Appointments', icon: Calendar },
    { id: 'doctors', name: 'Find Doctors', icon: Stethoscope },
    { id: 'prescriptions', name: 'Prescriptions', icon: Pill },
    { id: 'lab-tests', name: 'Lab Tests', icon: TestTube },
    { id: 'chatbot', name: 'AI Assistant', icon: MessageSquare },
    { id: 'profile', name: 'Profile', icon: User }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.firstName || 'Patient'}! 👋</h1>
        <p className="text-blue-100 mb-6">Here's your health overview for today</p>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{statistics.upcomingAppointmentsCount}</div>
                  <div className="text-sm text-blue-100">Upcoming Appointments</div>
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{statistics.prescriptionsCount}</div>
                  <div className="text-sm text-blue-100">Active Prescriptions</div>
                </div>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center">
                  <TestTube className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{statistics.pendingLabTestsCount}</div>
                  <div className="text-sm text-blue-100">Pending Test Results</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { icon: Calendar, label: 'Book Appointment', color: 'from-blue-500 to-blue-600', action: 'doctors' },
          { icon: MessageSquare, label: 'Chat with AI', color: 'from-purple-500 to-purple-600', action: 'chatbot' },
          { icon: TestTube, label: 'Book Lab Test', color: 'from-green-500 to-green-600', action: 'lab-tests' }
        ].map((action, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSection(action.action)}
            className={`p-6 bg-gradient-to-br ${action.color} rounded-xl text-white hover:shadow-lg transition-all transform hover:scale-105`}
          >
            <action.icon className="w-8 h-8 mx-auto mb-3" />
            <div className="text-sm font-medium">{action.label}</div>
          </button>
        ))}
      </div>

      {/* Health Metrics */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Health Metrics</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {healthMetrics.map((metric, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <metric.icon className="w-8 h-8 text-blue-600" />
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  {metric.status}
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className="text-sm text-gray-500">{metric.label}</div>
              <div className="text-xs text-gray-400 mt-1">{metric.unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
          <button 
            onClick={() => setActiveSection('appointments')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No upcoming appointments</p>
            <button 
              onClick={() => setActiveSection('doctors')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Book Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => {
              const doctorName = appointment.doctor?.name || 
                                 `Dr. ${appointment.doctor?.user?.firstName || ''} ${appointment.doctor?.user?.lastName || ''}`.trim();
              const specialty = appointment.doctor?.specialization || 'General Physician';
              const appointmentDate = appointment.appointmentDate ? 
                new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'N/A';
              const appointmentTime = appointment.appointmentTime || 'N/A';
              const appointmentType = appointment.appointmentType || 'in-person';
              
              return (
                <div key={appointment._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {doctorName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{doctorName}</h3>
                        <p className="text-sm text-gray-600 mb-3 capitalize">{specialty}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{appointmentDate}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{appointmentTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span className="capitalize">{appointmentType}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                        appointment.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {appointment.status}
                      </span>
                      <button 
                        onClick={() => setActiveSection('appointments')}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Prescriptions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Prescriptions</h2>
          <button 
            onClick={() => setActiveSection('prescriptions')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : recentPrescriptions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Pill className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No prescriptions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentPrescriptions.map((prescription) => {
              const doctorName = prescription.doctor?.name || 
                                 `Dr. ${prescription.doctor?.user?.firstName || ''} ${prescription.doctor?.user?.lastName || ''}`.trim();
              const prescriptionDate = prescription.prescriptionDate ? 
                new Date(prescription.prescriptionDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                }) : 'N/A';
              const medications = prescription.medications || [];
              const diagnosis = prescription.diagnosis || 'General consultation';
              
              return (
                <div key={prescription._id} className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{doctorName}</h3>
                      <p className="text-sm text-gray-600">{prescriptionDate}</p>
                    </div>
                    <button 
                      onClick={() => setActiveSection('prescriptions')}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>View</span>
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Diagnosis: {diagnosis}</div>
                    {medications.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Medications:</span>
                        <ul className="mt-2 space-y-1">
                          {medications.slice(0, 3).map((med, idx) => (
                            <li key={idx} className="flex items-center space-x-2">
                              <Pill className="w-4 h-4 text-gray-400" />
                              <span>{med.name || med} {med.dosage ? `- ${med.dosage}` : ''}</span>
                            </li>
                          ))}
                          {medications.length > 3 && (
                            <li className="text-blue-600 text-xs">
                              +{medications.length - 3} more medications
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-40">
        <div className="px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                MediCare Plus
              </span>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors, appointments, prescriptions..."
                  className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.firstName?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-gray-500">Patient</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out pt-16 lg:pt-0`}>
          <div className="h-full overflow-y-auto py-6">
            <nav className="px-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="px-4 mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <MessageSquare className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">Chat with our AI assistant for instant support</p>
                <button 
                  onClick={() => setActiveSection('chatbot')}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  Start Chat
                </button>
              </div>
            </div>

            <div className="px-4 mt-4">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {activeSection === 'dashboard' && renderDashboard()}
            {activeSection === 'appointments' && <Appointments />}
            {activeSection === 'doctors' && <FindDoctors />}
            {activeSection === 'prescriptions' && <Prescriptions />}
            {activeSection === 'lab-tests' && <LabTests />}
            {activeSection === 'chatbot' && <Chatbot />}
            {activeSection === 'profile' && <Profile />}
          </div>
        </main>
      </div>
    </div>
  );
}