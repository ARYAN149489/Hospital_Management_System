// frontend/src/pages/admin/Analytics.jsx
import { useState, useEffect } from 'react';
import { TrendingUp, Users, UserCheck, Calendar, DollarSign, Activity, Download } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/helpers';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    overview: {
      totalRevenue: 0,
      totalAppointments: 0,
      totalPatients: 0,
      totalDoctors: 0,
      avgConsultationFee: 0,
      completionRate: 0,
    },
    appointmentTrends: [],
    revenueTrends: [],
    topDoctors: [],
    topSpecializations: [],
    patientGrowth: [],
    appointmentsByStatus: {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    },
  });
  const [dateRange, setDateRange] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/analytics?range=${dateRange}`);
      setAnalytics(response.data.data || analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await api.get(`/admin/analytics/export?range=${dateRange}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${dateRange}-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-8 h-8 mr-3 text-blue-600" />
                Analytics & Reports
              </h1>
              <p className="text-gray-600 mt-1">
                View comprehensive insights and performance metrics
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Date Range Selector */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>

              {/* Export Button */}
              <Button variant="primary" onClick={handleExportReport}>
                <Download className="w-5 h-5 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card variant="stats" className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">
                  {formatCurrency(analytics.overview.totalRevenue)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-green-200" />
            </div>
          </Card>

          <Card variant="stats" className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Appointments</p>
                <p className="text-3xl font-bold mt-2">{analytics.overview.totalAppointments}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-200" />
            </div>
          </Card>

          <Card variant="stats" className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Completion Rate</p>
                <p className="text-3xl font-bold mt-2">{analytics.overview.completionRate}%</p>
              </div>
              <Activity className="w-12 h-12 text-purple-200" />
            </div>
          </Card>

          <Card variant="stats" className="bg-white border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.overview.totalPatients}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </Card>

          <Card variant="stats" className="bg-white border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Doctors</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {analytics.overview.totalDoctors}
                </p>
              </div>
              <UserCheck className="w-12 h-12 text-green-500" />
            </div>
          </Card>

          <Card variant="stats" className="bg-white border-2 border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg. Consultation Fee</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(analytics.overview.avgConsultationFee)}
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Appointments by Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Appointments by Status</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Completed</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics.appointmentsByStatus.completed}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{
                      width: `${
                        (analytics.appointmentsByStatus.completed /
                          analytics.overview.totalAppointments) *
                          100 || 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Confirmed</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics.appointmentsByStatus.confirmed}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{
                      width: `${
                        (analytics.appointmentsByStatus.confirmed /
                          analytics.overview.totalAppointments) *
                          100 || 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Pending</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics.appointmentsByStatus.pending}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-amber-500 h-3 rounded-full"
                    style={{
                      width: `${
                        (analytics.appointmentsByStatus.pending /
                          analytics.overview.totalAppointments) *
                          100 || 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Cancelled</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {analytics.appointmentsByStatus.cancelled}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-red-500 h-3 rounded-full"
                    style={{
                      width: `${
                        (analytics.appointmentsByStatus.cancelled /
                          analytics.overview.totalAppointments) *
                          100 || 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Specializations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Specializations</h3>
            {analytics.topSpecializations && analytics.topSpecializations.length > 0 ? (
              <div className="space-y-4">
                {analytics.topSpecializations.slice(0, 5).map((spec, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">{spec.name}</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {spec.count} appointments
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-500 h-3 rounded-full"
                        style={{
                          width: `${
                            (spec.count / analytics.topSpecializations[0].count) * 100 || 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data available</p>
            )}
          </div>
        </div>

        {/* Top Doctors */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Doctors</h3>
          {analytics.topDoctors && analytics.topDoctors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.topDoctors.slice(0, 10).map((doctor, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span
                            className={`text-sm font-bold ${
                              index === 0
                                ? 'text-yellow-600'
                                : index === 1
                                ? 'text-gray-600'
                                : index === 2
                                ? 'text-amber-700'
                                : 'text-gray-900'
                            }`}
                          >
                            #{index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {doctor.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">{doctor.specialization}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doctor.totalAppointments}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          {formatCurrency(doctor.totalRevenue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900">{doctor.rating || 4.5}</span>
                          <span className="text-yellow-400 ml-1">★</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">📊 Analytics Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="mb-2">
                • Total revenue generated: {formatCurrency(analytics.overview.totalRevenue)}
              </p>
              <p className="mb-2">
                • {analytics.overview.totalAppointments} appointments completed successfully
              </p>
              <p>• {analytics.overview.totalPatients} active patients in the system</p>
            </div>
            <div>
              <p className="mb-2">
                • {analytics.overview.totalDoctors} doctors providing healthcare services
              </p>
              <p className="mb-2">
                • {analytics.overview.completionRate}% appointment completion rate
              </p>
              <p>
                • Average consultation fee: {formatCurrency(analytics.overview.avgConsultationFee)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;