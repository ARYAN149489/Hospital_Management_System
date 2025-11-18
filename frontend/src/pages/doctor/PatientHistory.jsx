// frontend/src/pages/doctor/PatientHistory.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Calendar,
  Phone,
  Mail,
  Heart,
  Droplet,
  Activity,
  AlertTriangle,
  Pill,
  FileText,
  Clock,
  ArrowLeft
} from 'lucide-react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate, calculateAge } from '../../utils/helpers';

const PatientHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/doctor/patients/${patientId}`);
      setPatientData(response.data.data);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast.error('Failed to load patient details');
      navigate('/doctor/my-patients');
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

  if (!patientData) {
    return null;
  }

  const { patient, appointments, prescriptions } = patientData;
  const patientName = patient.user?.firstName && patient.user?.lastName
    ? `${patient.user.firstName} ${patient.user.lastName}`
    : 'Unknown Patient';
  const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/doctor/my-patients')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {patientName}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {age} years
                  </span>
                  <span className="flex items-center">
                    <Activity className="w-4 h-4 mr-1" />
                    {patient.gender || 'N/A'}
                  </span>
                  <span className="flex items-center">
                    <Droplet className="w-4 h-4 mr-1" />
                    {patient.bloodGroup || 'N/A'}
                  </span>
                  <span className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {patient.user?.phone || 'N/A'}
                  </span>
                  <span className="flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    {patient.user?.email || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Medical Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Allergies */}
            {patient.allergies && patient.allergies.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                  Allergies
                </h2>
                <div className="space-y-2">
                  {patient.allergies.map((allergy, index) => (
                    <div
                      key={index}
                      className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm"
                    >
                      {allergy}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Chronic Conditions */}
            {patient.chronicConditions && patient.chronicConditions.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-orange-500" />
                  Chronic Conditions
                </h2>
                <div className="space-y-2">
                  {patient.chronicConditions.map((condition, index) => (
                    <div
                      key={index}
                      className="bg-orange-50 text-orange-700 px-3 py-2 rounded-lg text-sm"
                    >
                      {condition}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Medications */}
            {patient.currentMedications && patient.currentMedications.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Pill className="w-5 h-5 mr-2 text-blue-500" />
                  Current Medications
                </h2>
                <div className="space-y-2">
                  {patient.currentMedications.map((medication, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm"
                    >
                      {medication}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointments History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
                Appointment History ({appointments?.length || 0})
              </h2>
              {appointments && appointments.length > 0 ? (
                <div className="space-y-3">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : appointment.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </div>
                      {appointment.symptoms && (
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Symptoms:</strong> {appointment.symptoms}
                        </p>
                      )}
                      {appointment.diagnosis && (
                        <p className="text-sm text-gray-700 mb-1">
                          <strong>Diagnosis:</strong> {appointment.diagnosis}
                        </p>
                      )}
                      {appointment.notes && (
                        <p className="text-sm text-gray-600">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No appointment history</p>
              )}
            </div>

            {/* Prescriptions History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-500" />
                Prescriptions ({prescriptions?.length || 0})
              </h2>
              {prescriptions && prescriptions.length > 0 ? (
                <div className="space-y-3">
                  {prescriptions.map((prescription) => (
                    <div
                      key={prescription._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-600">
                          {formatDate(prescription.prescriptionDate)}
                        </div>
                      </div>
                      {prescription.medications && prescription.medications.length > 0 && (
                        <div className="space-y-2">
                          {prescription.medications.map((med, index) => (
                            <div key={index} className="bg-purple-50 p-3 rounded-lg">
                              <p className="text-sm font-medium text-purple-900">
                                {med.name} - {med.dosage}
                              </p>
                              <p className="text-xs text-purple-700">
                                {med.frequency} for {med.duration}
                              </p>
                              {med.instructions && (
                                <p className="text-xs text-purple-600 mt-1">
                                  {med.instructions}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {prescription.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Notes:</strong> {prescription.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No prescriptions</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
