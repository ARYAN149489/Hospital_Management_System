// frontend/src/pages/patient/Prescriptions.jsx
import { useState, useEffect } from 'react';
import { FileText, Search, Calendar } from 'lucide-react';
import PrescriptionCard from '../../components/patient/PrescriptionCard';
import PrescriptionView from '../../components/patient/PrescriptionView';
import Button from '../../components/common/Button';
import Loader, { CardLoader } from '../../components/common/Loader';
import { EmptyStateCard } from '../../components/common/Card';
import { patientAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [loadingPrescription, setLoadingPrescription] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const response = await patientAPI.getPrescriptions();
      
      if (response.success) {
        setPrescriptions(response.data || []);
      } else {
        toast.error(response.message || 'Failed to fetch prescriptions');
      }
    } catch (error) {
      console.error('Fetch prescriptions error:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (prescription) => {
    try {
      // Generate and download PDF
      toast.success('Downloading prescription...');
      // Implement download logic here
      window.print();
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download prescription');
    }
  };

  const handleViewPrescription = async (prescription) => {
    setLoadingPrescription(true);
    try {
      const prescriptionId = prescription?._id || prescription;
      if (!prescriptionId) {
        toast.error('Prescription ID not found');
        return;
      }
      
      const response = await patientAPI.getPrescriptionById(prescriptionId);
      if (response.success) {
        setSelectedPrescription(response.data);
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

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch = 
      !searchQuery ||
      prescription.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.prescriptionId?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDate = 
      !filterDate ||
      prescription.date?.startsWith(filterDate);

    return matchesSearch && matchesDate;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterDate('');
  };

  const hasActiveFilters = searchQuery || filterDate;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">My Prescriptions</h1>
          <p className="text-blue-100 text-lg">
            View and download your medical prescriptions
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by doctor, diagnosis, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Filter by date"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && filteredPrescriptions.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredPrescriptions.length}</span>{' '}
              {filteredPrescriptions.length === 1 ? 'prescription' : 'prescriptions'}
              {hasActiveFilters && ' matching your criteria'}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardLoader count={4} />
          </div>
        )}

        {/* Prescriptions Grid */}
        {!loading && filteredPrescriptions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPrescriptions.map((prescription) => (
              <PrescriptionCard
                key={prescription._id}
                prescription={prescription}
                onDownload={handleDownload}
                onView={() => handleViewPrescription(prescription)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPrescriptions.length === 0 && !hasActiveFilters && (
          <EmptyStateCard
            icon={FileText}
            title="No Prescriptions Yet"
            message="You don't have any prescriptions yet. Prescriptions from your appointments will appear here."
          />
        )}

        {/* No Results Found */}
        {!loading && filteredPrescriptions.length === 0 && hasActiveFilters && (
          <EmptyStateCard
            icon={Search}
            title="No Prescriptions Found"
            message="No prescriptions match your search criteria. Try adjusting your filters."
            action={
              <Button variant="primary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            }
          />
        )}
      </div>

      {/* Prescription Detail Modal */}
      {showPrescriptionModal && selectedPrescription && (
        <PrescriptionView
          prescription={selectedPrescription}
          onClose={() => {
            setShowPrescriptionModal(false);
            setSelectedPrescription(null);
          }}
        />
      )}
    </div>
  );
};

export default Prescriptions;