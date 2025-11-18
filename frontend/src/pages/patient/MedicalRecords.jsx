// frontend/src/pages/patient/MedicalRecords.jsx
import { useState, useEffect } from 'react';
import { FileText, Search, Upload, Plus } from 'lucide-react';
import MedicalRecordCard from '../../components/patient/MedicalRecordCard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loader, { CardLoader } from '../../components/common/Loader';
import { EmptyStateCard } from '../../components/common/Card';
import { patientAPI } from '../../services/api';
import useForm from '../../hooks/useForm';
import toast from 'react-hot-toast';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'lab-report', label: 'Lab Report' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'medical-report', label: 'Medical Report' },
    { value: 'scan', label: 'Scan' },
    { value: 'xray', label: 'X-Ray' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    setLoading(true);
    try {
      const response = await patientAPI.getMedicalRecords();
      
      if (response.success) {
        setRecords(response.data || []);
      } else {
        toast.error(response.message || 'Failed to fetch medical records');
      }
    } catch (error) {
      console.error('Fetch records error:', error);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadRecord = async (formValues) => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', formValues.title);
      formData.append('category', formValues.category);
      formData.append('date', formValues.date);
      if (formValues.description) {
        formData.append('description', formValues.description);
      }
      if (formValues.hospital) {
        formData.append('hospital', formValues.hospital);
      }

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await patientAPI.uploadDocument(formData);

      if (response.success) {
        toast.success('Medical record uploaded successfully');
        setShowUploadModal(false);
        resetUploadForm();
        setSelectedFiles([]);
        fetchMedicalRecords();
      } else {
        toast.error(response.message || 'Failed to upload record');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload medical record');
    }
  };

  const { 
    values, 
    errors, 
    handleChange, 
    handleSubmit, 
    isSubmitting,
    resetForm: resetUploadForm 
  } = useForm(
    {
      title: '',
      category: 'other',
      date: new Date().toISOString().split('T')[0],
      description: '',
      hospital: '',
    },
    handleUploadRecord,
    {
      title: {
        required: true,
        minLength: 3,
        message: 'Title is required (minimum 3 characters)',
      },
      category: {
        required: true,
        message: 'Please select a category',
      },
      date: {
        required: true,
        message: 'Date is required',
      },
    }
  );

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleDownload = (file) => {
    window.open(file.url, '_blank');
  };

  // Filter records
  const filteredRecords = records.filter((record) => {
    const matchesSearch = 
      !searchQuery ||
      record.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = 
      !selectedCategory ||
      record.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  const hasActiveFilters = searchQuery || selectedCategory;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">Medical Records</h1>
              <p className="text-blue-100 text-lg">
                Access and manage your health records
              </p>
            </div>
            <Button
              variant="secondary"
              icon={Plus}
              onClick={() => setShowUploadModal(true)}
              className="hidden md:flex"
            >
              Upload Record
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Upload Button */}
        <div className="md:hidden mb-6">
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowUploadModal(true)}
            fullWidth
          >
            Upload Record
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, description, or doctor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
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
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && filteredRecords.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredRecords.length}</span>{' '}
              {filteredRecords.length === 1 ? 'record' : 'records'}
              {hasActiveFilters && ' matching your criteria'}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardLoader count={6} />
          </div>
        )}

        {/* Records Grid */}
        {!loading && filteredRecords.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecords.map((record) => (
              <MedicalRecordCard
                key={record._id}
                record={record}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRecords.length === 0 && !hasActiveFilters && (
          <EmptyStateCard
            icon={FileText}
            title="No Medical Records Yet"
            message="You don't have any medical records yet. Upload your first record to keep track of your health history."
            action={
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setShowUploadModal(true)}
              >
                Upload First Record
              </Button>
            }
          />
        )}

        {/* No Results Found */}
        {!loading && filteredRecords.length === 0 && hasActiveFilters && (
          <EmptyStateCard
            icon={Search}
            title="No Records Found"
            message="No medical records match your search criteria. Try adjusting your filters."
            action={
              <Button variant="primary" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            }
          />
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          resetUploadForm();
          setSelectedFiles([]);
        }}
        title="Upload Medical Record"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={values.title}
                onChange={handleChange}
                placeholder="e.g., Blood Test Report, X-Ray..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={values.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                {categories.slice(1).map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={values.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Hospital */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital/Clinic (Optional)
              </label>
              <input
                type="text"
                name="hospital"
                value={values.hospital}
                onChange={handleChange}
                placeholder="e.g., MediCare Hospital"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={values.description}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes about this record..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Files <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, PNG, JPG (Max 10MB each)
                  </p>
                </label>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Selected files ({selectedFiles.length}):
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUploadModal(false);
                resetUploadForm();
                setSelectedFiles([]);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={selectedFiles.length === 0 || isSubmitting}
            >
              {isSubmitting ? 'Uploading...' : 'Upload Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MedicalRecords;