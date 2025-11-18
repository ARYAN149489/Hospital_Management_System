// frontend/src/pages/doctor/CreatePrescription.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import PrescriptionForm from '../../components/doctor/PrescriptionForm';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const CreatePrescription = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails();
    } else {
      setLoading(false);
    }
  }, [appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/doctor/appointments/${appointmentId}`);
      const appointmentData = response.data.data;
      
      // Check if appointment time has passed
      const appointmentDateTime = new Date(appointmentData.appointmentDate);
      const [hours, minutes] = appointmentData.appointmentTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
      
      if (new Date() < appointmentDateTime) {
        toast.error('Prescription can only be created after the appointment time has passed');
        navigate('/doctor/appointments');
        return;
      }
      
      setAppointment(appointmentData);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      toast.error('Failed to load appointment details');
      navigate('/doctor/appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (prescriptionData) => {
    try {
      console.log('📝 Submitting prescription with data:', JSON.stringify(prescriptionData, null, 2));
      console.log('Appointment data:', appointment);
      console.log('Patient ID:', appointment?.patient?._id);
      
      const response = await api.post('/doctor/prescriptions', prescriptionData);
      
      toast.success('Prescription created successfully!');
      
      // Navigate back to appointments
      navigate('/doctor/appointments', { 
        state: { 
          message: 'Prescription created successfully',
          prescriptionId: response.data.data?._id 
        } 
      });
    } catch (error) {
      console.error('❌ Error creating prescription:', error);
      console.error('Error response:', error.response?.data);
      
      // Display detailed validation errors if available
      if (error.response?.data?.validationErrors) {
        const validationErrors = error.response.data.validationErrors;
        console.error('Validation errors:', validationErrors);
        
        // Show each validation error
        Object.keys(validationErrors).forEach(field => {
          toast.error(`${field}: ${validationErrors[field]}`);
        });
      } else {
        toast.error(error.response?.data?.message || 'Failed to create prescription');
      }
      
      throw error;
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      if (appointmentId) {
        navigate(`/doctor/appointments`);
      } else {
        navigate('/doctor/dashboard');
      }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-blue-600" />
              Create Prescription
            </h1>
            <p className="text-gray-600 mt-1">
              Fill in the prescription details for your patient
            </p>

            {/* Appointment Details */}
            {appointment && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Appointment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2 text-blue-600" />
                    <span>
                      {appointment.patient?.user?.firstName && appointment.patient?.user?.lastName 
                        ? `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`
                        : appointment.patient?.user?.fullName || 'Unknown Patient'}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{formatDate(appointment.appointmentDate)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{appointment.appointmentTime}</span>
                  </div>
                </div>
                {appointment.reasonForVisit && (
                  <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200">
                    <p className="text-xs font-medium text-amber-800 mb-1">Reason for Visit</p>
                    <p className="text-sm text-amber-900">{appointment.reasonForVisit}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Prescription Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {appointment ? (
            <PrescriptionForm
              patientId={
                appointment.patient?._id || 
                appointment.patient || 
                appointment.patientId?._id || 
                appointment.patientId
              }
              patientName={
                appointment.patient?.user?.firstName && appointment.patient?.user?.lastName 
                  ? `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`
                  : appointment.patient?.user?.fullName || 
                    appointment.patient?.name ||
                    'Unknown Patient'
              }
              appointmentId={appointmentId}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Appointment Selected
              </h3>
              <p className="text-gray-600 mb-4">
                Please select an appointment to create a prescription
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/doctor/appointments')}
              >
                Go to Appointments
              </Button>
            </div>
          )}
        </div>

        {/* Information Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            📋 Prescription Guidelines
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ensure all medication details are accurate and complete</li>
            <li>• Include clear dosage instructions and duration</li>
            <li>• Specify any dietary restrictions or timing (before/after meals)</li>
            <li>• Add follow-up date if continued monitoring is needed</li>
            <li>• Review patient allergies before prescribing medications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatePrescription;