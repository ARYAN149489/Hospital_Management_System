// frontend/src/pages/doctor/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  FileText, 
  Clock,
  TrendingUp,
  Activity,
  Plus,
  ArrowRight
} from 'lucide-react';
import { StatsCard } from '../../components/common/Card';
import Button from '../../components/common/Button';
import DoctorAppointmentCard from '../../components/doctor/DoctorAppointmentCard';
import Loader, { CardLoader, FullPageLoader } from '../../components/common/Loader';
import { doctorAPI, appointmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setAppointmentsLoading(true);
    
    try {
      // Fetch dashboard data (includes stats and today's appointments)
      const dashboardResponse = await doctorAPI.getDashboard();
      
      if (dashboardResponse.success) {
        const dashboardData = dashboardResponse.data;
        
        // Set stats from the statistics object
        setStats(dashboardData.statistics);
        
        // Set today's appointments from todaysAppointments array
        setTodayAppointments(dashboardData.todaysAppointments || []);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setAppointmentsLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      const response = await appointmentAPI.update(appointmentId, { status: newStatus });
      
      if (response.success) {
        toast.success(`Appointment ${newStatus}`);
        fetchDashboardData(); // Refresh data
      } else {
        toast.error(response.message || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update appointment status');
    }
  };

  if (loading) {
    return <FullPageLoader message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, Dr. {user?.firstName} {user?.lastName}!
              </h1>
              <p className="text-blue-100 text-lg">
                {formatDate(new Date())}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3">
                <p className="text-sm text-blue-100">You have</p>
                <p className="text-3xl font-bold">{todayAppointments.length}</p>
                <p className="text-sm text-blue-100">appointments today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Patients"
            value={stats?.totalPatients || 0}
            icon={Users}
            color="blue"
            trend="up"
            trendValue="+12% from last month"
            onClick={() => navigate('/doctor/my-patients')}
          />
          
          <StatsCard
            title="Today's Appointments"
            value={stats?.todaysAppointmentsCount || 0}
            icon={Calendar}
            color="purple"
            onClick={() => navigate('/doctor/appointments')}
          />
          
          <StatsCard
            title="Completed"
            value={stats?.completedAppointments || 0}
            icon={FileText}
            color="green"
          />
          
          <StatsCard
            title="This Month"
            value={stats?.monthlyAppointments || 0}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
                <Button
                  variant="outline"
                  size="sm"
                  icon={ArrowRight}
                  onClick={() => navigate('/doctor/appointments')}
                >
                  View All
                </Button>
              </div>

              {appointmentsLoading ? (
                <div className="space-y-4">
                  <CardLoader count={3} />
                </div>
              ) : todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.slice(0, 5).map((appointment) => (
                    <DoctorAppointmentCard
                      key={appointment._id}
                      appointment={appointment}
                      onUpdateStatus={handleUpdateStatus}
                      onCreatePrescription={(apt) => navigate(`/doctor/create-prescription/${apt._id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  icon={Calendar}
                  onClick={() => navigate('/doctor/appointments')}
                  fullWidth
                >
                  View Appointments
                </Button>
                <Button
                  variant="outline"
                  icon={Users}
                  onClick={() => navigate('/doctor/my-patients')}
                  fullWidth
                >
                  View Patients
                </Button>
                <Button
                  variant="outline"
                  icon={FileText}
                  onClick={() => navigate('/doctor/prescriptions')}
                  fullWidth
                >
                  Prescriptions
                </Button>
                <Button
                  variant="outline"
                  icon={Clock}
                  onClick={() => navigate('/doctor/schedule')}
                  fullWidth
                >
                  Manage Schedule
                </Button>
              </div>
            </div>

            {/* This Week Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">This Week</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Appointments</p>
                      <p className="text-lg font-bold text-gray-900">{stats?.weekAppointments || 0}</p>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Prescriptions</p>
                      <p className="text-lg font-bold text-gray-900">{stats?.weekPrescriptions || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">New Patients</p>
                      <p className="text-lg font-bold text-gray-900">{stats?.weekNewPatients || 0}</p>
                    </div>
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
              </div>
            </div>

            {/* Upcoming Leave */}
            {stats?.upcomingLeave && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Activity className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">Upcoming Leave</h3>
                    <p className="text-sm text-yellow-800">
                      {formatDate(stats.upcomingLeave.startDate)} - {formatDate(stats.upcomingLeave.endDate)}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">{stats.upcomingLeave.reason}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;