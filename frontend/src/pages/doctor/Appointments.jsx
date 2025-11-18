// frontend/src/pages/doctor/Appointments.jsx
import { useState, useEffect } from 'react';
import { Calendar, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import DoctorAppointmentCard from '../../components/doctor/DoctorAppointmentCard';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';
import { APPOINTMENT_STATUS } from '../../utils/constants';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, searchQuery]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/doctor/appointments?date=${selectedDate}`);
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(apt => {
        const patientName = apt.patient?.user?.firstName && apt.patient?.user?.lastName
          ? `${apt.patient.user.firstName} ${apt.patient.user.lastName}`.toLowerCase()
          : apt.patient?.user?.fullName?.toLowerCase() || '';
        const patientPhone = apt.patient?.user?.phone || apt.patient?.phone || '';
        const symptomsText = Array.isArray(apt.symptoms) 
          ? apt.symptoms.join(' ').toLowerCase()
          : (apt.symptoms || '').toLowerCase();
        const reasonText = (apt.reasonForVisit || '').toLowerCase();
        
        return patientName.includes(query) ||
               patientPhone.includes(query) ||
               symptomsText.includes(query) ||
               reasonText.includes(query);
      });
    }

    setFilteredAppointments(filtered);
  };

  const handleDateChange = (direction) => {
    const currentDate = new Date(selectedDate);
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const handleStatusUpdate = async (appointmentId, newStatus, notes) => {
    try {
      await api.patch(`/doctor/appointments/${appointmentId}/status`, {
        status: newStatus,
        notes: notes,
      });
      toast.success('Appointment updated successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
    }
  };

  const getStatusCount = (status) => {
    if (status === 'all') return appointments.length;
    return appointments.filter(apt => apt.status === status).length;
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
            <Calendar className="w-8 h-8 mr-3 text-blue-600" />
            My Appointments
          </h1>

          {/* Date Navigator */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateChange('prev')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              >
                Today
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateChange('next')}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({getStatusCount('all')})
            </button>
            <button
              onClick={() => setStatusFilter(APPOINTMENT_STATUS.PENDING)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                statusFilter === APPOINTMENT_STATUS.PENDING
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({getStatusCount(APPOINTMENT_STATUS.PENDING)})
            </button>
            <button
              onClick={() => setStatusFilter(APPOINTMENT_STATUS.CONFIRMED)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                statusFilter === APPOINTMENT_STATUS.CONFIRMED
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed ({getStatusCount(APPOINTMENT_STATUS.CONFIRMED)})
            </button>
            <button
              onClick={() => setStatusFilter(APPOINTMENT_STATUS.COMPLETED)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                statusFilter === APPOINTMENT_STATUS.COMPLETED
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({getStatusCount(APPOINTMENT_STATUS.COMPLETED)})
            </button>
            <button
              onClick={() => setStatusFilter(APPOINTMENT_STATUS.CANCELLED)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                statusFilter === APPOINTMENT_STATUS.CANCELLED
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled ({getStatusCount(APPOINTMENT_STATUS.CANCELLED)})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, phone, or symptoms..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <DoctorAppointmentCard
                key={appointment._id}
                appointment={appointment}
                onStatusUpdate={handleStatusUpdate}
                onViewDetails={(apt) => console.log('View details:', apt)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Appointments Found
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : `No appointments scheduled for ${formatDate(selectedDate)}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;