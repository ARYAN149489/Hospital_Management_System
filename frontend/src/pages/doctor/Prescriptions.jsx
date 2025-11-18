// frontend/src/pages/doctor/Prescriptions.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Download, Eye, Plus } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const Prescriptions = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, searchQuery]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/doctor/prescriptions');
      setPrescriptions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const filterPrescriptions = () => {
    let filtered = [...prescriptions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (prescription) => {
          const patientName = prescription.patient?.user?.firstName && prescription.patient?.user?.lastName
            ? `${prescription.patient.user.firstName} ${prescription.patient.user.lastName}`.toLowerCase()
            : prescription.patientId?.name?.toLowerCase() || '';
          
          return patientName.includes(query) ||
            prescription.prescriptionId?.toLowerCase().includes(query) ||
            prescription.diagnosis?.toLowerCase().includes(query);
        }
      );
    }

    setFilteredPrescriptions(filtered);
  };

  const handleDownloadPrescription = async (prescriptionId) => {
    try {
      const response = await api.get(`/doctor/prescriptions/${prescriptionId}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Prescription downloaded successfully');
    } catch (error) {
      console.error('Error downloading prescription:', error);
      toast.error('Failed to download prescription');
    }
  };

  const handleViewPrescription = (prescriptionId) => {
    navigate(`/doctor/prescriptions/${prescriptionId}`);
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="w-8 h-8 mr-3 text-blue-600" />
                My Prescriptions
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage all prescriptions you've created
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/doctor/prescriptions/create')}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Prescription
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name, prescription ID, or diagnosis..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Prescriptions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {prescriptions.length}
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {prescriptions.filter(p => {
                    const date = new Date(p.createdAt);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && 
                           date.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <FileText className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">This Week</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {prescriptions.filter(p => {
                    const date = new Date(p.createdAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return date >= weekAgo;
                  }).length}
                </p>
              </div>
              <FileText className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        {filteredPrescriptions.length > 0 ? (
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => (
              <div
                key={prescription._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {prescription.patient?.user?.firstName && prescription.patient?.user?.lastName
                            ? `${prescription.patient.user.firstName} ${prescription.patient.user.lastName}`
                            : prescription.patientId?.name || 'Unknown Patient'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Prescription ID: {prescription.prescriptionId}
                        </p>
                        {prescription.patient?.user?.phone && (
                          <p className="text-xs text-gray-500 mt-1">
                            📞 {prescription.patient.user.phone}
                          </p>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {formatDate(prescription.prescriptionDate || prescription.createdAt)}
                      </span>
                    </div>

                    {/* Diagnosis */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Diagnosis:</p>
                      <p className="text-sm text-gray-900">{prescription.diagnosis}</p>
                    </div>

                    {/* Medications */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Medications ({prescription.medications?.length || 0}):
                      </p>
                      <div className="space-y-2">
                        {prescription.medications?.slice(0, 2).map((med, index) => {
                          // Handle duration display
                          let durationText = '';
                          if (med.duration) {
                            if (typeof med.duration === 'string') {
                              durationText = med.duration;
                            } else if (typeof med.duration === 'object') {
                              // If duration is an object, try to display value and unit
                              durationText = `${med.duration.value || ''} ${med.duration.unit || ''}`.trim();
                            }
                          }
                          return (
                            <div key={index} className="flex items-start text-sm text-gray-700">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2"></span>
                              <span>
                                <strong>{med.name}</strong> - {med.dosage}, {med.frequency}
                                {durationText && ` for ${durationText}`}
                              </span>
                            </div>
                          );
                        })}
                        {prescription.medications?.length > 2 && (
                          <p className="text-xs text-gray-500 ml-4">
                            +{prescription.medications.length - 2} more medications
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Follow-up */}
                    {prescription.followUpDate && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Follow-up:</span>{' '}
                        {formatDate(prescription.followUpDate)}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPrescription(prescription._id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {/* Download button removed */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Prescriptions Found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'You haven\'t created any prescriptions yet'}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                onClick={() => navigate('/doctor/prescriptions/create')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Prescription
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;