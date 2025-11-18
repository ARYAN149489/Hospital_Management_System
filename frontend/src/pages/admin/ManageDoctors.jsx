// frontend/src/pages/admin/ManageDoctors.jsx
import { useState, useEffect } from 'react';
import { UserCheck, Search, Filter, Eye, Trash2, Ban, UnlockKeyhole, Plus } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    gender: 'male',
    specialization: '',
    medicalLicenseNumber: '',
    yearsOfExperience: '',
    consultationFee: '',
    degree: '',
    institution: '',
    year: '',
    bio: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchQuery, statusFilter]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // Add timestamp to prevent caching
      const response = await api.get(`/admin/doctors?_t=${Date.now()}`);
      setDoctors(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = [...doctors];

    // Status filter - only for blocked/active
    if (statusFilter === 'blocked') {
      filtered = filtered.filter(doc => doc.isBlocked === true);
    } else if (statusFilter === 'active') {
      filtered = filtered.filter(doc => doc.isBlocked === false || doc.isBlocked === undefined);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) => {
          const userName = doc.user?.firstName && doc.user?.lastName 
            ? `${doc.user.firstName} ${doc.user.lastName}` 
            : '';
          const qualifications = doc.qualifications?.map(q => q.degree).join(' ') || '';
          
          return userName.toLowerCase().includes(query) ||
            doc.user?.email?.toLowerCase().includes(query) ||
            doc.specialization?.toLowerCase().includes(query) ||
            qualifications.toLowerCase().includes(query);
        }
      );
    }

    setFilteredDoctors(filtered);
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      await api.post('/admin/doctors/create', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender,
        specialization: formData.specialization,
        medicalLicenseNumber: formData.medicalLicenseNumber,
        yearsOfExperience: parseInt(formData.yearsOfExperience),
        consultationFee: parseInt(formData.consultationFee),
        qualifications: [{
          degree: formData.degree,
          institution: formData.institution,
          year: parseInt(formData.year)
        }],
        bio: formData.bio
      });
      toast.success('Doctor created successfully');
      setShowCreateModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        gender: 'male',
        specialization: '',
        medicalLicenseNumber: '',
        yearsOfExperience: '',
        consultationFee: '',
        degree: '',
        institution: '',
        year: '',
        bio: ''
      });
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create doctor');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (doctorId) => {
    if (!window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/doctors/${doctorId}`);
      toast.success('Doctor deleted successfully');
      fetchDoctors();
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error('Failed to delete doctor');
    }
  };

  const handleBlock = async (doctorId) => {
    const blockReason = window.prompt('Please provide a reason for blocking this doctor (minimum 10 characters):');
    
    if (!blockReason) {
      return; // User cancelled
    }

    if (blockReason.trim().length < 10) {
      toast.error('Block reason must be at least 10 characters');
      return;
    }

    try {
      const response = await api.post(`/admin/doctors/${doctorId}/block`, {
        reason: blockReason.trim()
      });
      toast.success(response.data.message || 'Doctor blocked successfully');
      
      // Update the local state immediately to reflect the change
      setDoctors(prevDoctors => 
        prevDoctors.map(doc => 
          doc._id === doctorId 
            ? { ...doc, isBlocked: true, blockReason: blockReason.trim(), blockedAt: new Date() }
            : doc
        )
      );
      
      // Also fetch fresh data from server to ensure consistency
      await fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to block doctor');
    }
  };

  const handleUnblock = async (doctorId) => {
    if (!window.confirm('Are you sure you want to unblock this doctor?')) {
      return;
    }

    try {
      const response = await api.post(`/admin/doctors/${doctorId}/unblock`);
      toast.success(response.data.message || 'Doctor unblocked successfully');
      
      // Update the local state immediately to reflect the change
      setDoctors(prevDoctors => 
        prevDoctors.map(doc => 
          doc._id === doctorId 
            ? { ...doc, isBlocked: false, blockReason: null, blockedAt: null, blockedBy: null }
            : doc
        )
      );
      
      // Also fetch fresh data from server to ensure consistency
      await fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to unblock doctor');
    }
  };

  const handleViewDetails = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailsModal(true);
  };

  const getStatusCount = (status) => {
    if (status === 'all') return doctors.length;
    if (status === 'approved') return doctors.filter(d => d.approvalStatus === 'approved').length;
    return doctors.filter(d => d.approvalStatus === 'pending').length;
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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <UserCheck className="w-8 h-8 mr-3 text-blue-600" />
              Manage Doctors
            </h1>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Doctor
            </Button>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({doctors.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                statusFilter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active ({doctors.filter(d => !d.isBlocked).length})
            </button>
            <button
              onClick={() => setStatusFilter('blocked')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                statusFilter === 'blocked'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Blocked ({doctors.filter(d => d.isBlocked).length})
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, specialization, or qualification..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Doctors List */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 ${
                  doctor.approvalStatus === 'pending' ? 'border-2 border-amber-200' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {doctor.profileImage ? (
                      <img
                        src={doctor.profileImage}
                        alt={`Dr. ${doctor.user?.firstName} ${doctor.user?.lastName}`}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-8 h-8 text-white" />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                        </h3>
                        {doctor.isBlocked && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center space-x-1">
                            <Ban className="w-3 h-3" />
                            <span>Blocked</span>
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Specialization:</span> {doctor.specialization}
                        </div>
                        <div>
                          <span className="font-medium">Qualifications:</span> {
                            doctor.qualifications && doctor.qualifications.length > 0
                              ? doctor.qualifications.map(q => q.degree).join(', ')
                              : 'N/A'
                          }
                        </div>
                        <div>
                          <span className="font-medium">Experience:</span> {doctor.yearsOfExperience || 0} years
                        </div>
                        <div>
                          <span className="font-medium">Fee:</span> ₹{doctor.consultationFee}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {doctor.user?.email}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {doctor.user?.phone}
                        </div>
                      </div>

                      {doctor.bio && (
                        <p className="text-sm text-gray-700 mb-2">
                          {doctor.bio.length > 150
                            ? `${doctor.bio.substring(0, 150)}...`
                            : doctor.bio}
                        </p>
                      )}

                      <p className="text-xs text-gray-500">
                        Registered: {formatDate(doctor.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(doctor)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>

                    {doctor.isBlocked ? (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleUnblock(doctor._id)}
                      >
                        <UnlockKeyhole className="w-4 h-4 mr-2" />
                        Unblock
                      </Button>
                    ) : (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleBlock(doctor._id)}
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Block
                      </Button>
                    )}
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(doctor._id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <UserCheck className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Doctors Found</h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No doctors registered yet'}
            </p>
          </div>
        )}

        {/* Details Modal */}
        {selectedDoctor && (
          <Modal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title={`Dr. ${selectedDoctor.user?.firstName} ${selectedDoctor.user?.lastName}'s Details`}
            size="lg"
          >
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="flex justify-center">
                {selectedDoctor.profileImage ? (
                  <img
                    src={selectedDoctor.profileImage}
                    alt={`Dr. ${selectedDoctor.user?.firstName} ${selectedDoctor.user?.lastName}`}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <UserCheck className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>

              {/* Personal Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Full Name</p>
                    <p className="text-gray-900 font-medium">
                      Dr. {selectedDoctor.user?.firstName} {selectedDoctor.user?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{selectedDoctor.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">{selectedDoctor.user?.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Gender</p>
                    <p className="text-gray-900 font-medium capitalize">{selectedDoctor.user?.gender || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Professional Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Specialization</p>
                    <p className="text-gray-900 font-medium">{selectedDoctor.specialization}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Doctor ID</p>
                    <p className="text-gray-900 font-medium">{selectedDoctor.doctorId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Medical License</p>
                    <p className="text-gray-900 font-medium">{selectedDoctor.medicalLicenseNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Experience</p>
                    <p className="text-gray-900 font-medium">{selectedDoctor.yearsOfExperience || 0} years</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Consultation Fee</p>
                    <p className="text-gray-900 font-medium">₹{selectedDoctor.consultationFee}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Consultation Duration</p>
                    <p className="text-gray-900 font-medium">{selectedDoctor.consultationDuration} minutes</p>
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              {selectedDoctor.qualifications && selectedDoctor.qualifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Qualifications</h4>
                  <div className="space-y-2">
                    {selectedDoctor.qualifications.map((qual, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg text-sm">
                        <p className="font-medium text-gray-900">{qual.degree}</p>
                        <p className="text-gray-600">{qual.institution}</p>
                        <p className="text-gray-500 text-xs">Year: {qual.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {selectedDoctor.languages && selectedDoctor.languages.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Languages</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.languages.map((lang, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {selectedDoctor.bio && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Bio</h4>
                  <p className="text-sm text-gray-700">{selectedDoctor.bio}</p>
                </div>
              )}

              {/* Status */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Approval Status</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedDoctor.approvalStatus === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : selectedDoctor.approvalStatus === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {selectedDoctor.approvalStatus === 'approved' ? 'Approved' : 
                   selectedDoctor.approvalStatus === 'pending' ? 'Pending Approval' : 'Rejected'}
                </span>
                {selectedDoctor.rejectionReason && (
                  <p className="text-sm text-red-600 mt-2">
                    <span className="font-medium">Rejection Reason:</span> {selectedDoctor.rejectionReason}
                  </p>
                )}
              </div>

              {/* Block Status */}
              {selectedDoctor.isBlocked && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Ban className="w-5 h-5 text-red-600" />
                    <h4 className="text-sm font-semibold text-red-900">Doctor is Currently Blocked</h4>
                  </div>
                  {selectedDoctor.blockReason && (
                    <p className="text-sm text-red-700 mb-2">
                      <span className="font-medium">Reason:</span> {selectedDoctor.blockReason}
                    </p>
                  )}
                  {selectedDoctor.blockedAt && (
                    <p className="text-xs text-red-600">
                      Blocked on: {formatDate(selectedDoctor.blockedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* Create Doctor Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => !creating && setShowCreateModal(false)}
          title="Create New Doctor"
          size="lg"
        >
          <form onSubmit={handleCreateDoctor} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="doctor@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Professional Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cardiology"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Medical License Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.medicalLicenseNumber}
                    onChange={(e) => setFormData({...formData, medicalLicenseNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MED123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Fee (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({...formData, consultationFee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1500"
                  />
                </div>
              </div>
            </div>

            {/* Qualification */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Qualification</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Degree *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.degree}
                    onChange={(e) => setFormData({...formData, degree: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MBBS"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.institution}
                    onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="AIIMS Delhi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year *
                  </label>
                  <input
                    type="number"
                    required
                    min="1950"
                    max={new Date().getFullYear()}
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2010"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description about the doctor..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create Doctor'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ManageDoctors;