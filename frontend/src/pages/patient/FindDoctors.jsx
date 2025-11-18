// frontend/src/pages/patient/FindDoctors.jsx
import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star,
  Grid3x3,
  List,
  SlidersHorizontal
} from 'lucide-react';
import DoctorCard from '../../components/patient/DoctorCard';
import Button from '../../components/common/Button';
import Loader, { CardLoader } from '../../components/common/Loader';
import { EmptyStateCard } from '../../components/common/Card';
import { doctorAPI } from '../../services/api';
import { SPECIALIZATIONS } from '../../utils/constants';
import toast from 'react-hot-toast';

const FindDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [sortBy, setSortBy] = useState('rating'); // 'rating', 'experience', 'fee-low', 'fee-high'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDoctors();
  }, [currentPage, selectedSpecialization, selectedExperience, selectedRating, sortBy]);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const filters = {
        page: currentPage,
        limit: 12,
        search: searchQuery,
        specialization: selectedSpecialization,
        minExperience: selectedExperience,
        minRating: selectedRating,
        sortBy: sortBy,
      };

      const response = await doctorAPI.getAll(filters);
      
      if (response.success) {
        setDoctors(response.data);
        setTotalPages(response.pages || 1);
      } else {
        toast.error(response.message || 'Failed to fetch doctors');
      }
    } catch (error) {
      console.error('Fetch doctors error:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchDoctors();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialization('');
    setSelectedExperience('');
    setSelectedRating('');
    setSortBy('rating');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || selectedSpecialization || selectedExperience || selectedRating;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Find Doctors</h1>
          <p className="text-blue-100 text-lg">
            Search for specialists and book appointments with top-rated doctors
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filters Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <Button
              variant="outline"
              icon={SlidersHorizontal}
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              Filters
            </Button>

            {/* Search Button */}
            <Button
              variant="primary"
              icon={Search}
              onClick={handleSearch}
            >
              Search
            </Button>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filters (Desktop always visible, Mobile toggle) */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 ${showFilters || window.innerWidth >= 768 ? '' : 'hidden'}`}>
            {/* Specialization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialization
              </label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Specializations</option>
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience
              </label>
              <select
                value={selectedExperience}
                onChange={(e) => setSelectedExperience(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any Experience</option>
                <option value="5">5+ years</option>
                <option value="10">10+ years</option>
                <option value="15">15+ years</option>
                <option value="20">20+ years</option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="fee-low">Lowest Fee</option>
                <option value="fee-high">Highest Fee</option>
              </select>
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
                Clear all filters
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && doctors.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              Found <span className="font-semibold">{doctors.length}</span> doctors
              {hasActiveFilters && ' matching your criteria'}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }`}>
            <CardLoader count={6} />
          </div>
        )}

        {/* Doctors List */}
        {!loading && doctors.length > 0 && (
          <div className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }`}>
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor._id}
                doctor={doctor}
                variant={viewMode}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && doctors.length === 0 && (
          <EmptyStateCard
            icon={Search}
            title="No Doctors Found"
            message={
              hasActiveFilters
                ? 'No doctors match your search criteria. Try adjusting your filters.'
                : 'No doctors available at the moment. Please check back later.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="primary" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              ) : null
            }
          />
        )}

        {/* Pagination */}
        {!loading && doctors.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === index + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindDoctors;