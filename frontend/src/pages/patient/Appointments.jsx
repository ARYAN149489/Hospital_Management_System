// frontend/src/pages/patient/Appointments.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Filter } from 'lucide-react';
import AppointmentCard from '../../components/patient/AppointmentCard';
import RescheduleModal from '../../components/patient/RescheduleModal';
import Button from '../../components/common/Button';
import Loader, { CardLoader } from '../../components/common/Loader';
import { EmptyStateCard } from '../../components/common/Card';
import { appointmentAPI } from '../../services/api';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

const Appointments = () => {
  const navigate = useNavigate();
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'completed', 'cancelled'
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Always fetch ALL appointments without status filter
      const response = await appointmentAPI.getMyAppointments({});
      
      if (response.success) {
        setAllAppointments(response.data || []);
      } else {
        toast.error(response.message || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Fetch appointments error:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId, reason) => {
    try {
      const response = await appointmentAPI.cancel(appointmentId, reason);
      
      if (response.success) {
        toast.success('Appointment cancelled successfully');
        fetchAppointments(); // Refresh list
      } else {
        toast.error(response.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('Cancel appointment error:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  const handleRescheduleAppointment = (appointment) => {
    // Open reschedule modal
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSuccess = () => {
    // Refresh appointments list after successful reschedule
    fetchAppointments();
  };

  const tabs = [
    { 
      id: 'all', 
      label: 'All Appointments', 
      count: allAppointments.length 
    },
    { 
      id: 'upcoming', 
      label: 'Upcoming',
      count: allAppointments.filter(a => 
        a.status === 'scheduled' || 
        a.status === 'confirmed'
      ).length 
    },
    { 
      id: 'completed', 
      label: 'Completed',
      count: allAppointments.filter(a => a.status === 'completed').length 
    },
    { 
      id: 'cancelled', 
      label: 'Cancelled',
      count: allAppointments.filter(a => a.status === 'cancelled').length 
    },
  ];

  const getFilteredAppointments = () => {
    if (activeTab === 'all') return allAppointments;
    if (activeTab === 'upcoming') {
      return allAppointments.filter(a => 
        a.status === 'scheduled' || 
        a.status === 'confirmed'
      );
    }
    if (activeTab === 'completed') {
      return allAppointments.filter(a => a.status === 'completed');
    }
    if (activeTab === 'cancelled') {
      return allAppointments.filter(a => a.status === 'cancelled');
    }
    return allAppointments;
  };

  const filteredAppointments = getFilteredAppointments();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">My Appointments</h1>
              <p className="text-blue-100 text-lg">
                View and manage your appointments
              </p>
            </div>
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() => navigate('/patient/find-doctors')}
              className="hidden md:flex"
            >
              Book New Appointment
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Book Button */}
        <div className="md:hidden mb-6">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/patient/find-doctors')}
            fullWidth
          >
            Book New Appointment
          </Button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                  {!loading && (
                    <span className={`
                      ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
                      ${activeTab === tab.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            <CardLoader count={3} />
          </div>
        )}

        {/* Appointments List */}
        {!loading && filteredAppointments.length > 0 && (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                onCancel={handleCancelAppointment}
                onReschedule={handleRescheduleAppointment}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredAppointments.length === 0 && (
          <EmptyStateCard
            icon={Calendar}
            title={
              activeTab === 'all'
                ? 'No Appointments Yet'
                : activeTab === 'upcoming'
                ? 'No Upcoming Appointments'
                : activeTab === 'completed'
                ? 'No Completed Appointments'
                : 'No Cancelled Appointments'
            }
            message={
              activeTab === 'all'
                ? 'You haven\'t booked any appointments yet. Find a doctor and book your first appointment.'
                : activeTab === 'upcoming'
                ? 'You don\'t have any upcoming appointments scheduled.'
                : activeTab === 'completed'
                ? 'You don\'t have any completed appointments yet.'
                : 'You don\'t have any cancelled appointments.'
            }
            action={
              (activeTab === 'all' || activeTab === 'upcoming') ? (
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => navigate('/patient/find-doctors')}
                >
                  Book an Appointment
                </Button>
              ) : null
            }
          />
        )}
      </div>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        appointment={selectedAppointment}
        onSuccess={handleRescheduleSuccess}
      />
    </div>
  );
};

export default Appointments;