// frontend/src/components/patient/AppointmentCard.jsx
import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical
} from 'lucide-react';
import Button from '../common/Button';
import Modal, { ConfirmModal } from '../common/Modal';
import PrescriptionView from './PrescriptionView';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';
import { APPOINTMENT_STATUS } from '../../utils/constants';
import { patientAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AppointmentCard = ({ appointment, onCancel, onReschedule, onViewDetails }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState(null);
  const [loadingPrescription, setLoadingPrescription] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  const {
    _id,
    appointmentId,
    doctor,
    appointmentDate,
    appointmentTime,
    appointmentType = 'in-person',
    status,
    reasonForVisit,
    symptoms,
    notes,
    prescription,
  } = appointment;

  // For backward compatibility
  const date = appointmentDate;
  const time = appointmentTime;
  const reason = reasonForVisit;

  // Status configurations
  const statusConfig = {
    [APPOINTMENT_STATUS.PENDING]: {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      label: 'Pending',
    },
    [APPOINTMENT_STATUS.CONFIRMED]: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Confirmed',
    },
    [APPOINTMENT_STATUS.COMPLETED]: {
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Completed',
    },
    [APPOINTMENT_STATUS.CANCELLED]: {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Cancelled',
    },
  };

  const currentStatus = statusConfig[status] || statusConfig[APPOINTMENT_STATUS.PENDING];
  const StatusIcon = currentStatus.icon;

  const handleCancelAppointment = async () => {
    const trimmedReason = cancelReason.trim();
    
    if (!trimmedReason) {
      return;
    }
    
    if (trimmedReason.length < 10) {
      return;
    }

    setIsCancelling(true);
    try {
      if (onCancel) {
        await onCancel(_id, trimmedReason);
      }
      setShowCancelModal(false);
      setCancelReason('');
    } catch (error) {
      console.error('Cancel error:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleViewPrescription = async () => {
    setLoadingPrescription(true);
    try {
      const prescriptionId = prescription?._id || prescription;
      if (!prescriptionId) {
        toast.error('Prescription ID not found');
        return;
      }
      
      const response = await patientAPI.getPrescriptionById(prescriptionId);
      if (response.success) {
        setPrescriptionData(response.data);
        setShowPrescriptionModal(true);
      } else {
        toast.error(response.message || 'Failed to load prescription');
      }
    } catch (error) {
      console.error('Error loading prescription:', error);
      toast.error('Failed to load prescription details');
    } finally {
      setLoadingPrescription(false);
    }
  };

  const handleReschedule = () => {
    setShowMenu(false);
    if (onReschedule) {
      onReschedule(appointment);
    }
  };

  const handleViewDetails = () => {
    setShowMenu(false);
    setShowDetailsModal(true);
    if (onViewDetails) {
      onViewDetails(appointment);
    }
  };

  const canCancel = status === APPOINTMENT_STATUS.PENDING || status === APPOINTMENT_STATUS.CONFIRMED;
  const canReschedule = status === APPOINTMENT_STATUS.PENDING || status === APPOINTMENT_STATUS.CONFIRMED;
  
  // Check if doctor was removed
  const isDoctorRemoved = !doctor || doctor.name === 'Doctor Removed' || !doctor._id;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 relative">
        {/* Status Badge */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {currentStatus.label}
          </span>
          
          {/* Menu Button - Disabled if doctor is removed */}
          {(canCancel || canReschedule) && !isDoctorRemoved && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-full transition"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10">
                  <button
                    onClick={handleViewDetails}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                  >
                    View Details
                  </button>
                  {canReschedule && (
                    <button
                      onClick={handleReschedule}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition"
                    >
                      Reschedule
                    </button>
                  )}
                  {canCancel && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowCancelModal(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Doctor Info */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="flex-shrink-0">
            {isDoctorRemoved ? (
              <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xl font-bold">
                <User className="w-8 h-8" />
              </div>
            ) : doctor?.profileImage ? (
              <img
                src={doctor.profileImage}
                alt={doctor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                {doctor?.name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 pr-20">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {isDoctorRemoved ? (
                <span className="text-gray-500">Doctor Removed</span>
              ) : (
                `Dr. ${doctor?.name}`
              )}
            </h3>
            <p className="text-sm text-blue-600 mb-2">
              {isDoctorRemoved ? 'Doctor no longer available' : doctor?.specialization}
            </p>
            {appointmentId && (
              <p className="text-xs text-gray-500">ID: {appointmentId}</p>
            )}
            {isDoctorRemoved && status === APPOINTMENT_STATUS.CANCELLED && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ This appointment was cancelled because the doctor was removed from the system
              </p>
            )}
          </div>
        </div>

        {/* Appointment Details */}
        <div className="space-y-3 mb-4">
          {/* Date & Time */}
          <div className="flex items-center text-gray-700">
            <Calendar className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
            <span className="font-medium">{formatDate(date)}</span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <Clock className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
            <span className="font-medium">{time}</span>
          </div>

          {/* Appointment Type */}
          <div className="flex items-center text-gray-700">
            <MapPin className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
            <span className="capitalize">In-Person Consultation</span>
          </div>

          {/* Reason */}
          {reason && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Reason: </span>
                {reason}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {status === APPOINTMENT_STATUS.CONFIRMED && (
          <div className="flex space-x-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleViewDetails} className="flex-1">
              View Details
            </Button>
          </div>
        )}

        {status === APPOINTMENT_STATUS.COMPLETED && prescription && (
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              fullWidth
              onClick={handleViewPrescription}
              disabled={loadingPrescription}
            >
              {loadingPrescription ? 'Loading...' : 'View Prescription'}
            </Button>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Appointment"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelAppointment}
              loading={isCancelling}
              disabled={!cancelReason.trim() || cancelReason.trim().length < 10 || isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to cancel your appointment with Dr. {doctor?.name}?
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for cancellation <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 ml-2">
                ({cancelReason.trim().length}/10 min characters)
              </span>
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please provide a reason for cancellation (minimum 10 characters)..."
              minLength={10}
            />
            {cancelReason.trim().length > 0 && cancelReason.trim().length < 10 && (
              <p className="text-xs text-red-500 mt-1">
                Please enter at least 10 characters
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Appointment Details"
        size="lg"
      >
        <div className="space-y-6">
          {/* Doctor Info */}
          <div className="flex items-center space-x-4 pb-6 border-b">
            {doctor?.profileImage ? (
              <img
                src={doctor.profileImage}
                alt={doctor.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {doctor?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900">Dr. {doctor?.name}</h3>
              <p className="text-blue-600">{doctor?.specialization}</p>
              {doctor?.qualification && (
                <p className="text-sm text-gray-500 mt-1">{doctor.qualification}</p>
              )}
            </div>
          </div>

          {/* Appointment Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Appointment ID</h4>
              <p className="font-medium text-gray-900">{appointmentId}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                {currentStatus.label}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Date</h4>
              <p className="font-medium text-gray-900">{formatDate(date)}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Time</h4>
              <p className="font-medium text-gray-900">{time}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Type</h4>
              <p className="font-medium text-gray-900 capitalize">{appointmentType}</p>
            </div>
          </div>

          {/* Reason & Symptoms */}
          {(reason || symptoms) && (
            <div className="space-y-4 pt-6 border-t">
              {reason && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Reason for Visit</h4>
                  <p className="text-gray-900">{reason}</p>
                </div>
              )}
              {symptoms && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Symptoms</h4>
                  <p className="text-gray-900">{symptoms}</p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div className="pt-6 border-t">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Notes</h4>
              <p className="text-gray-900">{notes}</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Prescription Modal */}
      {showPrescriptionModal && prescriptionData && (
        <PrescriptionView
          prescription={prescriptionData}
          onClose={() => setShowPrescriptionModal(false)}
        />
      )}
    </>
  );
};

export default AppointmentCard;