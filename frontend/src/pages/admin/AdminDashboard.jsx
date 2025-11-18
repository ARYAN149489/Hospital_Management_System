// frontend/src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Calendar,
  Activity,
  Building2,
  CalendarClock,
  FlaskConical,
} from 'lucide-react';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    pendingLeaves: 0,
    todayAppointments: 0,
    activeDepartments: 0,
  });
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    responseTime: '45ms',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch admin stats
      const statsResponse = await api.get('/admin/stats');
      const dashboardData = statsResponse.data.data || {};
      
      // Transform nested structure to flat structure expected by UI
      const transformedStats = {
        totalPatients: dashboardData.statistics?.users?.patients || 0,
        totalDoctors: dashboardData.statistics?.users?.doctors || 0,
        totalAppointments: dashboardData.statistics?.appointments?.total || 0,
        pendingLeaves: dashboardData.statistics?.leaves?.pending || 0,
        todayAppointments: dashboardData.statistics?.appointments?.today || 0,
        activeDepartments: dashboardData.statistics?.departments?.total || 0,
      };
      
      setStats(transformedStats);

      // Fetch system health
      const healthResponse = await api.get('/admin/system-health');
      setSystemHealth(healthResponse.data.data || systemHealth);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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
            Admin Dashboard 👨‍💼
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage your healthcare platform
          </p>
        </div>

        {/* Stats Grid - Row 1: Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card variant="stats" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:shadow-xl transition" onClick={() => navigate('/admin/patients')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold mt-2">{stats.totalPatients}</p>
                <p className="text-blue-100 text-xs mt-2">Click to manage</p>
              </div>
              <Users className="w-12 h-12 text-blue-200" />
            </div>
          </Card>

          <Card variant="stats" className="bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:shadow-xl transition" onClick={() => navigate('/admin/doctors')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Doctors</p>
                <p className="text-3xl font-bold mt-2">{stats.totalDoctors}</p>
                <p className="text-green-100 text-xs mt-2">Click to manage</p>
              </div>
              <UserCheck className="w-12 h-12 text-green-200" />
            </div>
          </Card>

          <Card variant="stats" className="bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer hover:shadow-xl transition" onClick={() => navigate('/admin/appointments')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Appointments</p>
                <p className="text-3xl font-bold mt-2">{stats.totalAppointments}</p>
                <p className="text-purple-100 text-xs mt-2">Click to view all</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-200" />
            </div>
          </Card>

          <Card variant="stats" className="bg-gradient-to-br from-amber-500 to-amber-600 text-white cursor-pointer hover:shadow-xl transition" onClick={() => navigate('/admin/leave')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Pending Leaves</p>
                <p className="text-3xl font-bold mt-2">{stats.pendingLeaves}</p>
                <p className="text-amber-100 text-xs mt-2">Leave requests to review</p>
              </div>
              <CalendarClock className="w-12 h-12 text-amber-200" />
            </div>
          </Card>
        </div>

        {/* Stats Grid - Row 2: Today's Appointments and Departments */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            variant="stats" 
            className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white cursor-pointer hover:shadow-xl transition"
            onClick={() => navigate('/admin/appointments')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-100 text-sm font-medium">Today's Appointments</p>
                <p className="text-3xl font-bold mt-2">{stats.todayAppointments}</p>
                <p className="text-cyan-100 text-xs mt-2">Click to view all</p>
              </div>
              <Calendar className="w-12 h-12 text-cyan-200" />
            </div>
          </Card>

          <Card 
            variant="stats" 
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white cursor-pointer hover:shadow-xl transition"
            onClick={() => navigate('/admin/departments')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium">Departments</p>
                <p className="text-3xl font-bold mt-2">{stats.activeDepartments}</p>
                <p className="text-indigo-100 text-xs mt-2">Click to manage</p>
              </div>
              <Building2 className="w-12 h-12 text-indigo-200" />
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/doctors')}
              >
                <UserCheck className="w-5 h-5 mr-3" />
                Manage Doctors
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/patients')}
              >
                <Users className="w-5 h-5 mr-3" />
                Manage Patients
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/departments')}
              >
                <Building2 className="w-5 h-5 mr-3" />
                Manage Departments
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/appointments')}
              >
                <Calendar className="w-5 h-5 mr-3" />
                View Appointments
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/leave')}
              >
                <CalendarClock className="w-5 h-5 mr-3" />
                Leave Requests
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate('/admin/lab-tests')}
              >
                <FlaskConical className="w-5 h-5 mr-3" />
                Lab Tests
              </Button>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              System Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium capitalize">
                  {systemHealth.status}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Uptime</span>
                <span className="text-sm font-semibold text-gray-900">
                  {systemHealth.uptime}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Response Time</span>
                <span className="text-sm font-semibold text-gray-900">
                  {systemHealth.responseTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;