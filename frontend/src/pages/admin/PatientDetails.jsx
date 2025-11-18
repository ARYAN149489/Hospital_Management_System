// frontend/src/pages/admin/PatientDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Activity,
  FileText,
  Pill,
  TestTube,
  AlertCircle,
  Edit,
  Trash2,
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch patient details
      const response = await api.get(`/admin/patients/${id}`);
      if (response.data.success) {
        setPatient(response.data.data);
        
        // Fetch patient appointments
        try {
          const appointmentsResponse = await api.get(`/admin/patients/${id}/appointments?limit=10`);
          if (appointmentsResponse.data.success) {
            setAppointments(appointmentsResponse.data.data || []);
          }
        } catch (error) {
          console.error('Error fetching appointments:', error);
          setAppointments([]);
        }

        // Fetch patient prescriptions
        try {
          const prescriptionsResponse = await api.get(`/admin/patients/${id}/prescriptions?limit=10`);
          if (prescriptionsResponse.data.success) {
            setPrescriptions(prescriptionsResponse.data.data || []);
          }
        } catch (error) {
          console.error('Error fetching prescriptions:', error);
          setPrescriptions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast.error('Failed to load patient details');
      navigate('/admin/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePatient = async () => {
    if (!window.confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/patients/${id}`);
      toast.success('Patient deleted successfully');
      navigate('/admin/patients');
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = !patient.user.isActive;
      await api.patch(`/admin/users/${patient.user._id}/status`, {
        isActive: newStatus,
      });
      toast.success(`Patient ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchPatientDetails();
    } catch (error) {
      console.error('Error updating patient status:', error);
      toast.error('Failed to update patient status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Not Found</h2>
          <Button onClick={() => navigate('/admin/patients')}>Back to Patients</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate('/admin/patients')}
            className="mb-4"
          >
            Back to Patients
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Details</h1>
              <p className="text-gray-600 mt-1">View and manage patient information</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={patient.user.isActive ? 'outline' : 'primary'}
                onClick={handleToggleStatus}
              >
                {patient.user.isActive ? 'Deactivate' : 'Activate'}
              </Button>
              <Button variant="danger" icon={Trash2} onClick={handleDeletePatient}>
                Delete Patient
              </Button>
            </div>
          </div>
        </div>

        {/* Patient Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Personal Information */}
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-2xl">
                  {patient.user?.firstName?.charAt(0)}
                  {patient.user?.lastName?.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {patient.user?.firstName} {patient.user?.lastName}
                </h2>
                <p className="text-gray-600">Patient ID: {patient._id.slice(-8)}</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                    patient.user?.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {patient.user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">{patient.user?.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900">{patient.user?.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium text-gray-900">
                    {patient.user?.dateOfBirth ? formatDate(patient.user.dateOfBirth) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {patient.user?.gender || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Blood Group</p>
                  <p className="font-medium text-gray-900">{patient.bloodGroup || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Registered On</p>
                  <p className="font-medium text-gray-900">{formatDate(patient.createdAt)}</p>
                </div>
              </div>
            </div>

            {patient.user?.address && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-900">
                      {patient.user.address.street && `${patient.user.address.street}, `}
                      {patient.user.address.city && `${patient.user.address.city}, `}
                      {patient.user.address.state && `${patient.user.address.state} `}
                      {patient.user.address.pincode && `- ${patient.user.address.pincode}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Medical Information */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
            
            {patient.allergies && patient.allergies.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Allergies</p>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patient.chronicConditions && patient.chronicConditions.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Chronic Conditions</p>
                <div className="flex flex-wrap gap-2">
                  {patient.chronicConditions.map((condition, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patient.emergencyContact && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Emergency Contact</p>
                <p className="font-medium text-gray-900">{patient.emergencyContact.name}</p>
                <p className="text-sm text-gray-600">{patient.emergencyContact.relation}</p>
                <p className="text-sm text-gray-600">{patient.emergencyContact.phone}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Appointments</p>
                <p className="text-3xl font-bold mt-1">{appointments.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Prescriptions</p>
                <p className="text-3xl font-bold mt-1">{prescriptions.length}</p>
              </div>
              <Pill className="w-10 h-10 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Medical Records</p>
                <p className="text-3xl font-bold mt-1">{medicalRecords.length}</p>
              </div>
              <FileText className="w-10 h-10 text-purple-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Lab Tests</p>
                <p className="text-3xl font-bold mt-1">0</p>
              </div>
              <TestTube className="w-10 h-10 text-amber-200" />
            </div>
          </Card>
        </div>

        {/* Recent Appointments */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
          {appointments.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No appointments found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date & Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Doctor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.slice(0, 5).map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {appointment.doctor?.user
                          ? `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 capitalize">
                        {appointment.type}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            appointment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : appointment.status === 'scheduled'
                              ? 'bg-blue-100 text-blue-800'
                              : appointment.status === 'cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Recent Prescriptions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Prescriptions</h3>
          {prescriptions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No prescriptions found</p>
          ) : (
            <div className="space-y-4">
              {prescriptions.slice(0, 5).map((prescription) => (
                <div
                  key={prescription._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {prescription.doctor?.user
                          ? `Dr. ${prescription.doctor.user.firstName} ${prescription.doctor.user.lastName}`
                          : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(prescription.prescriptionDate)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      {prescription.medications?.length || 0} medication(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default PatientDetails;
