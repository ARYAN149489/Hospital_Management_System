// frontend/src/pages/doctor/MyPatients.jsx
import { useState, useEffect } from 'react';
import { Users, Search, Filter, FileText, Calendar } from 'lucide-react';
import PatientCard from '../../components/doctor/PatientCard';
import Loader from '../../components/common/Loader';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MyPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchQuery, filterBy, patients]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/doctor/patients');
      
      // Transform the data to match the expected format
      const transformedPatients = (response.data.data || []).map(patient => ({
        ...patient,
        name: patient.user?.firstName && patient.user?.lastName 
          ? `${patient.user.firstName} ${patient.user.lastName}`
          : patient.user?.fullName || patient.name || 'Unknown Patient',
        email: patient.user?.email || patient.email || '',
        phone: patient.user?.phone || patient.phone || '',
        dateOfBirth: patient.user?.dateOfBirth || patient.dateOfBirth,
        gender: patient.user?.gender || patient.gender,
        address: patient.user?.address ? 
          [
            patient.user.address.street,
            patient.user.address.city,
            patient.user.address.state,
            patient.user.address.pincode,
            patient.user.address.country
          ].filter(Boolean).join(', ')
          : '',
        // Transform allergies from objects to strings
        allergies: patient.allergies?.map(a => typeof a === 'string' ? a : a.name) || [],
        // Transform current medications from objects to strings
        currentMedications: patient.currentMedications?.map(m => 
          typeof m === 'string' ? m : `${m.name} - ${m.dosage || ''} ${m.frequency || ''}`.trim()
        ) || [],
        // Rename chronicDiseases to match component expectations
        medicalHistory: patient.chronicDiseases?.map(d => 
          typeof d === 'string' ? d : d.name
        ) || []
      }));
      
      setPatients(transformedPatients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    let filtered = [...patients];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          patient.name?.toLowerCase().includes(query) ||
          patient.email?.toLowerCase().includes(query) ||
          patient.phone?.includes(query)
      );
    }

    // Additional filters
    if (filterBy === 'recent') {
      // Sort by most recent appointments
      filtered.sort((a, b) => {
        const aDate = new Date(a.lastVisit || 0);
        const bDate = new Date(b.lastVisit || 0);
        return bDate - aDate;
      });
    } else if (filterBy === 'chronic') {
      // Filter patients with chronic conditions
      filtered = filtered.filter(
        (patient) => patient.medicalHistory && patient.medicalHistory.length > 0
      );
    } else if (filterBy === 'allergies') {
      // Filter patients with allergies
      filtered = filtered.filter(
        (patient) => patient.allergies && patient.allergies.length > 0
      );
    }

    setFilteredPatients(filtered);
  };

  const handleViewHistory = (patient) => {
    navigate(`/doctor/patient-history/${patient._id}`);
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
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                My Patients
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and view your patient records
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{filteredPatients.length}</p>
              <p className="text-sm text-gray-600">Total Patients</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="sm:w-64">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Patients</option>
                  <option value="recent">Recent Visits</option>
                  <option value="chronic">Chronic Conditions</option>
                  <option value="allergies">With Allergies</option>
                </select>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  viewMode === 'card'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Card
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Patients List */}
        {filteredPatients.length > 0 ? (
          <div
            className={
              viewMode === 'card'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredPatients.map((patient) => (
              <PatientCard
                key={patient._id}
                patient={patient}
                onViewHistory={handleViewHistory}
                variant={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Found</h3>
            <p className="text-gray-600">
              {searchQuery || filterBy !== 'all'
                ? 'Try adjusting your search or filters'
                : 'You haven\'t seen any patients yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPatients;