// frontend/src/pages/doctor/ViewPrescription.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, FileText, Calendar, User, Phone, Mail, Stethoscope, Pill, Activity } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const ViewPrescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescription();
  }, [id]);

  const fetchPrescription = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/prescriptions/${id}`);
      setPrescription(response.data.data);
    } catch (error) {
      console.error('Error fetching prescription:', error);
      toast.error('Failed to load prescription');
      navigate('/doctor/prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/prescriptions/${id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${prescription.prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Prescription downloaded successfully');
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error('Failed to download prescription');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Prescription not found</p>
          <Button onClick={() => navigate('/doctor/prescriptions')} className="mt-4">
            Back to Prescriptions
          </Button>
        </div>
      </div>
    );
  }

  const patient = prescription.patient;
  const patientName = patient?.user 
    ? `${patient.user.firstName} ${patient.user.lastName}`
    : 'Unknown Patient';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Actions */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/doctor/prescriptions')}
            icon={ArrowLeft}
          >
            Back to Prescriptions
          </Button>
        </div>

        {/* Prescription Document */}
        <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none print:p-0">
          {/* Header */}
          <div className="border-b-2 border-blue-600 pb-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-blue-600 mb-2">Medical Prescription</h1>
                <p className="text-gray-600">MediCare Plus Hospital</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Prescription ID</p>
                <p className="text-lg font-semibold text-gray-900">{prescription.prescriptionId}</p>
                <p className="text-sm text-gray-600 mt-2">{formatDate(prescription.prescriptionDate || prescription.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Patient Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{patientName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Age</p>
                <p className="font-medium text-gray-900">
                  {patient?.user?.dateOfBirth 
                    ? `${new Date().getFullYear() - new Date(patient.user.dateOfBirth).getFullYear()} years`
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-medium text-gray-900">{patient?.user?.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Blood Group</p>
                <p className="font-medium text-gray-900">{patient?.bloodGroup || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {patient?.user?.phone || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {patient?.user?.email || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Chief Complaints */}
          {prescription.chiefComplaints && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Chief Complaints
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-800">{prescription.chiefComplaints}</p>
              </div>
            </div>
          )}

          {/* Diagnosis */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-blue-600" />
              Diagnosis
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-gray-800">{prescription.diagnosis}</p>
            </div>
          </div>

          {/* Vital Signs */}
          {prescription.vitalSigns && Object.keys(prescription.vitalSigns).length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Vital Signs</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {prescription.vitalSigns.bloodPressure && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Blood Pressure</p>
                    <p className="font-medium text-gray-900">
                      {typeof prescription.vitalSigns.bloodPressure === 'object'
                        ? `${prescription.vitalSigns.bloodPressure.systolic}/${prescription.vitalSigns.bloodPressure.diastolic}`
                        : prescription.vitalSigns.bloodPressure
                      }
                    </p>
                  </div>
                )}
                {prescription.vitalSigns.heartRate && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Heart Rate</p>
                    <p className="font-medium text-gray-900">{prescription.vitalSigns.heartRate} bpm</p>
                  </div>
                )}
                {prescription.vitalSigns.temperature && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Temperature</p>
                    <p className="font-medium text-gray-900">
                      {typeof prescription.vitalSigns.temperature === 'object'
                        ? `${prescription.vitalSigns.temperature.value}°${prescription.vitalSigns.temperature.unit === 'celsius' ? 'C' : 'F'}`
                        : `${prescription.vitalSigns.temperature}°F`
                      }
                    </p>
                  </div>
                )}
                {prescription.vitalSigns.weight && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Weight</p>
                    <p className="font-medium text-gray-900">{prescription.vitalSigns.weight} kg</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medications */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Pill className="w-5 h-5 mr-2 text-blue-600" />
              Prescribed Medications
            </h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {prescription.medications?.map((med, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{med.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{med.dosage}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{med.frequency}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {typeof med.duration === 'object' 
                          ? `${med.duration.value} ${med.duration.unit}`
                          : med.duration
                        }
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{med.instructions || 'As directed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lab Tests */}
          {prescription.labTests && prescription.labTests.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Recommended Lab Tests</h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <ul className="list-disc list-inside space-y-2">
                  {prescription.labTests.map((test, index) => (
                    <li key={index} className="text-gray-800">{test}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Advice */}
          {prescription.advice && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Medical Advice</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">{prescription.advice}</p>
              </div>
            </div>
          )}

          {/* Dietary Advice */}
          {prescription.dietaryAdvice && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Dietary Advice</h2>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">{prescription.dietaryAdvice}</p>
              </div>
            </div>
          )}

          {/* Follow-up */}
          {prescription.followUp && (prescription.followUp.required || typeof prescription.followUp === 'string') && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Follow-up
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {typeof prescription.followUp === 'string' ? (
                  <p className="text-gray-800">{prescription.followUp}</p>
                ) : (
                  <>
                    {prescription.followUp.after && prescription.followUp.after.value && (
                      <p className="text-gray-800">
                        Follow-up required after {prescription.followUp.after.value} {prescription.followUp.after.unit || 'days'}
                      </p>
                    )}
                    {prescription.followUp.reason && (
                      <p className="text-gray-600 mt-2 text-sm">
                        Reason: {prescription.followUp.reason}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t-2 border-gray-200 pt-6 mt-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Prescribed by</p>
                <p className="font-semibold text-gray-900">
                  Dr. {prescription.doctor?.user?.firstName} {prescription.doctor?.user?.lastName}
                </p>
                <p className="text-sm text-gray-600">{prescription.doctor?.specialization}</p>
                <p className="text-sm text-gray-600">License: {prescription.doctor?.licenseNumber || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Validity Notice */}
          {prescription.validUntil && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Note:</strong> This prescription is valid until {formatDate(prescription.validUntil)}
              </p>
            </div>
          )}
        </div>

        {/* Print Styles - Removed style tag as it's not needed */}
      </div>
    </div>
  );
};

export default ViewPrescription;
