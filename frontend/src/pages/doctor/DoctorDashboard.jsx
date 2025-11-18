// frontend/src/pages/doctor/DoctorDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  FileText,
  Clock,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
} from 'lucide-react';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import DoctorAppointmentCard from '../../components/doctor/DoctorAppointmentCard';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    totalPrescriptions: 0,
    pendingAppointments: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await api.get('/doctor/stats');
      setStats(statsResponse.data.data || {});

      // Fetch today's appointments
      const today = new Date().toISOString().split('T')[0];
      const appointmentsResponse = await api.get(`/doctor/appointments?date=${today}`);
      setTodayAppointments(appointmentsResponse.data.data || []);

      // Fetch recent activity
      const activityResponse = await api.get('/doctor/recent-activity');
      setRecentActivity(activityResponse.data.data || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentUpdate = async (appointmentId, newStatus, notes) => {
    try {
      await api.patch(`/doctor/appointments/${appointmentId}/status`, {
        status: newStatus,
        notes: notes,
      });
      toast.success('Appointment updated successfully');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, Dr. {JSON.parse(localStorage.getItem('user'))?.name?.split(' ')[0] || 'Doctor'}! 👨‍⚕️
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your practice today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="stats" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold mt-2">{stats.totalPatients}</p>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
          </Card>

          <Card variant="stats" className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Today's Appointments</p>
                <p className="text-3xl font-bold mt-2">{stats.todayAppointments}</p>
              </div>
              <Calendar className="w-12 h-12 text-green-200" />
            </div>
          </Card>

          <Card variant="stats" className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Prescriptions</p>
                <p className="text-3xl font-bold mt-2">{stats.totalPrescriptions}</p>
              </div>
              <FileText className="w-12 h-12 text-purple-200" />
            </div>
          </Card>

          <Card variant="stats" className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold mt-2">{stats.pendingAppointments}</p>
              </div>
              <Clock className="w-12 h-12 text-amber-200" />
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                  Today's Appointments
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/doctor/appointments')}
                >
                  View All
                </Button>
              </div>

              {todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.slice(0, 4).map((appointment) => (
                    <DoctorAppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                      onStatusUpdate={handleAppointmentUpdate}
                      onViewDetails={(apt) => navigate(`/doctor/appointments/${apt._id}`)}
                    />
                  ))}
                  
                  {todayAppointments.length > 4 && (
                    <div className="text-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/doctor/appointments')}
                      >
                        View {todayAppointments.length - 4} More Appointments
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Appointments Today
                  </h3>
                  <p className="text-gray-600">
                    You're all caught up! Enjoy your day.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/doctor/my-patients')}
                >
                  <Users className="w-5 h-5 mr-3" />
                  View Patients
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/doctor/schedule')}
                >
                  <Clock className="w-5 h-5 mr-3" />
                  Manage Schedule
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/doctor/prescriptions/create')}
                >
                  <FileText className="w-5 h-5 mr-3" />
                  Create Prescription
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/doctor/leave')}
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  Request Leave
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Recent Activity
              </h3>
              
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'appointment' ? 'bg-blue-100' :
                        activity.type === 'prescription' ? 'bg-green-100' :
                        'bg-purple-100'
                      }`}>
                        {activity.type === 'appointment' && <Calendar className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'prescription' && <FileText className="w-4 h-4 text-green-600" />}
                        {activity.type === 'patient' && <Users className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                This Month
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Completed</span>
                  <span className="text-sm font-semibold text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {stats.completedThisMonth || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Cancelled</span>
                  <span className="text-sm font-semibold text-red-600 flex items-center">
                    <XCircle className="w-4 h-4 mr-1" />
                    {stats.cancelledThisMonth || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">No-shows</span>
                  <span className="text-sm font-semibold text-amber-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {stats.noShowsThisMonth || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;