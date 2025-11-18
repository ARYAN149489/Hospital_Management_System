// frontend/src/pages/admin/ManageAppointments.jsx
import { useState, useEffect } from 'react';
import { Calendar, Search, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { APPOINTMENT_STATUS } from '../../utils/constants';

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, statusFilter, searchQuery]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/appointments?date=${selectedDate}`);
      // Backend returns { success, count, total, data: [...] }
      setAppointments(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load appointments');
      setAppointments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    // Ensure appointments is an array
    if (!Array.isArray(appointments)) {
      setFilteredAppointments([]);
      return;
    }

    let filtered = [...appointments];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((apt) => apt.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.patientId?.name?.toLowerCase().includes(query) ||
          apt.doctorId?.name?.toLowerCase().includes(query) ||
          apt.symptoms?.toLowerCase().includes(query)
      );
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

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const getStatusCount = (status) => {
    if (!Array.isArray(appointments)) return 0;
    if (status === 'all') return appointments.length;
    return appointments.filter((apt) => apt.status === status).length;
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
            Manage Appointments
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
              placeholder="Search by patient name, doctor name, or symptoms..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length > 0 ? (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const statusColors = getStatusColor(appointment.status);

              return (
                <div
                  key={appointment._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {appointment.patientId?.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            with Dr. {appointment.doctorId?.name}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors}`}>
                          {appointment.status}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Date:</span> {formatDate(appointment.date)}
                        </div>
                        <div>
                          <span className="font-medium">Time:</span> {appointment.time}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span>{' '}
                          <span className="capitalize">{appointment.type}</span>
                        </div>
                        <div>
                          <span className="font-medium">Specialization:</span>{' '}
                          {appointment.doctorId?.specialization}
                        </div>
                        <div>
                          <span className="font-medium">Fee:</span> ₹{appointment.doctorId?.consultationFee}
                        </div>
                        <div>
                          <span className="font-medium">Patient Phone:</span> {appointment.patientId?.phone}
                        </div>
                      </div>

                      {/* Symptoms */}
                      {appointment.symptoms && (
                        <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Symptoms:</span> {appointment.symptoms}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {appointment.notes && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Notes:</span> {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(appointment)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Appointments Found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : `No appointments scheduled for ${formatDate(selectedDate)}`}
            </p>
          </div>
        )}

        {/* Details Modal */}
        {selectedAppointment && (
          <Modal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title="Appointment Details"
            size="lg"
          >
            <div className="space-y-6">
              {/* Status */}
              <div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>

              {/* Patient Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="text-gray-900 font-medium">{selectedAppointment.patientId?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">{selectedAppointment.patientId?.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{selectedAppointment.patientId?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Blood Group</p>
                    <p className="text-gray-900 font-medium">
                      {selectedAppointment.patientId?.bloodGroup || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Doctor Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Doctor Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="text-gray-900 font-medium">
                      Dr. {selectedAppointment.doctorId?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Specialization</p>
                    <p className="text-gray-900 font-medium">
                      {selectedAppointment.doctorId?.specialization}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">
                      {selectedAppointment.doctorId?.user?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Consultation Fee</p>
                    <p className="text-gray-900 font-medium">
                      ₹{selectedAppointment.doctorId?.consultationFee}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Appointment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="text-gray-900 font-medium">{formatDate(selectedAppointment.date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Time</p>
                    <p className="text-gray-900 font-medium">{selectedAppointment.time}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Type</p>
                    <p className="text-gray-900 font-medium capitalize">{selectedAppointment.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Booked On</p>
                    <p className="text-gray-900 font-medium">
                      {formatDate(selectedAppointment.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              {selectedAppointment.symptoms && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Symptoms</h4>
                  <p className="text-sm text-gray-700 p-3 bg-amber-50 rounded-lg">
                    {selectedAppointment.symptoms}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedAppointment.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ManageAppointments;