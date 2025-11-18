// frontend/src/components/doctor/DoctorAppointmentCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  MessageSquare,
  Pill
} from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';
import { APPOINTMENT_STATUS } from '../../utils/constants';

const DoctorAppointmentCard = ({ appointment, onStatusUpdate, onViewDetails }) => {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');

  const {
    _id,
    patient,
    appointmentDate,
    appointmentTime,
    appointmentType,
    status,
    symptoms,
    reasonForVisit,
    notes: existingNotes,
    prescription,
  } = appointment;

  // For backward compatibility
  const patientId = patient;
  const date = appointmentDate;
  const timeSlot = appointmentTime;
  const type = appointmentType;

  const statusColors = getStatusColor(status);

  const handleAction = (action) => {
    setActionType(action);
    setShowConfirmModal(true);
  };

  const confirmAction = () => {
    const newStatus = actionType === 'confirm' 
      ? APPOINTMENT_STATUS.CONFIRMED 
      : APPOINTMENT_STATUS.CANCELLED;

    if (onStatusUpdate) {
      onStatusUpdate(_id, newStatus, notes);
    }
    setShowConfirmModal(false);
    setNotes('');
  };

  const handleComplete = () => {
    if (onStatusUpdate) {
      onStatusUpdate(_id, APPOINTMENT_STATUS.COMPLETED);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(appointment);
    }
  };

  const handleCreatePrescription = () => {
    navigate(`/doctor/prescriptions/create/${_id}`);
  };

  // Check if appointment time has passed
  const isAppointmentTimePassed = () => {
    const appointmentDateTime = new Date(date);
    const [hours, minutes] = timeSlot.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    return new Date() > appointmentDateTime;
  };

  const canCreatePrescription = (status === APPOINTMENT_STATUS.COMPLETED || 
    (status === APPOINTMENT_STATUS.CONFIRMED && isAppointmentTimePassed())) && 
    !prescription;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            {patientId?.profileImage ? (
              <img
                src={patientId.profileImage}
                alt={patientId.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {patientId?.user?.firstName && patientId?.user?.lastName 
                  ? `${patientId.user.firstName} ${patientId.user.lastName}`
                  : patientId?.user?.fullName || 'Unknown Patient'}
              </h3>
              <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{patientId?.user?.phone || patientId?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors}`}>
            {status}
          </span>
        </div>

        {/* Appointment Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-700">
            <Calendar className="w-4 h-4 mr-3 text-blue-600" />
            <span className="text-sm">{formatDate(date)}</span>
          </div>
          
          <div className="flex items-center text-gray-700">
            <Clock className="w-4 h-4 mr-3 text-blue-600" />
            <span className="text-sm">{timeSlot}</span>
          </div>

          <div className="flex items-center text-gray-700">
            <MapPin className="w-4 h-4 mr-3 text-blue-600" />
            <span className="text-sm">In-Person Consultation</span>
          </div>
        </div>

        {/* Symptoms */}
        {symptoms && (
          <div className="mb-4 p-3 bg-amber-50 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-amber-600 mr-2 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-amber-800 font-medium mb-1">Symptoms</p>
                <p className="text-sm text-amber-900">{symptoms}</p>
              </div>
            </div>
          </div>
        )}

        {/* Existing Notes */}
        {existingNotes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <MessageSquare className="w-4 h-4 text-gray-600 mr-2 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 font-medium mb-1">Notes</p>
                <p className="text-sm text-gray-700">{existingNotes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions based on status */}
        <div className="flex space-x-2">
          {status === APPOINTMENT_STATUS.PENDING && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleAction('confirm')}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleAction('cancel')}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          )}

          {status === APPOINTMENT_STATUS.CONFIRMED && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={handleComplete}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Details
              </Button>
            </>
          )}

          {(status === APPOINTMENT_STATUS.COMPLETED || status === APPOINTMENT_STATUS.CANCELLED) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewDetails}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Details
            </Button>
          )}

          {/* Create Prescription Button - Shows after appointment time has passed */}
          {canCreatePrescription && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCreatePrescription}
              className="w-full mt-2"
            >
              <Pill className="w-4 h-4 mr-2" />
              Create Prescription
            </Button>
          )}

          {/* Show if prescription exists */}
          {prescription && (
            <Button
              variant="success"
              size="sm"
              onClick={() => navigate(`/doctor/prescriptions/${prescription}`)}
              className="w-full mt-2"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Prescription
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setNotes('');
        }}
        title={`${actionType === 'confirm' ? 'Confirm' : 'Cancel'} Appointment`}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to {actionType === 'confirm' ? 'confirm' : 'cancel'} this appointment with{' '}
            <span className="font-semibold">
              {patientId?.user?.firstName && patientId?.user?.lastName 
                ? `${patientId.user.firstName} ${patientId.user.lastName}`
                : patientId?.user?.fullName || 'this patient'}
            </span>?
          </p>

          {actionType === 'cancel' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter reason for cancellation..."
              />
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmModal(false);
                setNotes('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'confirm' ? 'success' : 'danger'}
              onClick={confirmAction}
              className="flex-1"
            >
              {actionType === 'confirm' ? 'Confirm Appointment' : 'Cancel Appointment'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DoctorAppointmentCard;