// frontend/src/pages/doctor/Leave.jsx
import { useState, useEffect } from 'react';
import { Calendar, Plus, Eye, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';
import { LEAVE_STATUS } from '../../utils/constants';

const Leave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'sick',
  });
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/doctor/leave');
      setLeaves(response.data.data || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();

    // Validate dates
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      await api.post('/doctor/leave', formData);
      toast.success('Leave request submitted successfully');
      setShowRequestModal(false);
      setFormData({
        startDate: '',
        endDate: '',
        reason: '',
        type: 'sick',
      });
      fetchLeaves();
    } catch (error) {
      console.error('Error submitting leave:', error);
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      await api.delete(`/doctor/leave/${leaveId}`);
      toast.success('Leave request cancelled successfully');
      fetchLeaves();
    } catch (error) {
      console.error('Error cancelling leave:', error);
      toast.error('Failed to cancel leave request');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case LEAVE_STATUS.APPROVED:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case LEAVE_STATUS.REJECTED:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case LEAVE_STATUS.PENDING:
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case LEAVE_STATUS.APPROVED:
        return 'bg-green-100 text-green-700';
      case LEAVE_STATUS.REJECTED:
        return 'bg-red-100 text-red-700';
      case LEAVE_STATUS.PENDING:
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredLeaves = filterStatus === 'all' 
    ? leaves 
    : leaves.filter(leave => leave.status === filterStatus);

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
                <Calendar className="w-8 h-8 mr-3 text-blue-600" />
                Leave Management
              </h1>
              <p className="text-gray-600 mt-1">
                Request and manage your leave applications
              </p>
            </div>
            <Button variant="primary" onClick={() => setShowRequestModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Request Leave
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({leaves.length})
            </button>
            <button
              onClick={() => setFilterStatus(LEAVE_STATUS.PENDING)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filterStatus === LEAVE_STATUS.PENDING
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({leaves.filter(l => l.status === LEAVE_STATUS.PENDING).length})
            </button>
            <button
              onClick={() => setFilterStatus(LEAVE_STATUS.APPROVED)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filterStatus === LEAVE_STATUS.APPROVED
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({leaves.filter(l => l.status === LEAVE_STATUS.APPROVED).length})
            </button>
            <button
              onClick={() => setFilterStatus(LEAVE_STATUS.REJECTED)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filterStatus === LEAVE_STATUS.REJECTED
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({leaves.filter(l => l.status === LEAVE_STATUS.REJECTED).length})
            </button>
          </div>
        </div>

        {/* Leaves List */}
        {filteredLeaves.length > 0 ? (
          <div className="space-y-4">
            {filteredLeaves.map((leave) => (
              <div
                key={leave._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getStatusIcon(leave.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                        {leave.type} Leave
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="text-base font-semibold text-gray-900">
                          {formatDate(leave.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="text-base font-semibold text-gray-900">
                          {formatDate(leave.endDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Reason:</p>
                      <p className="text-sm text-gray-900">{leave.reason}</p>
                    </div>

                    {leave.adminNote && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Admin Note:</p>
                        <p className="text-sm text-gray-900">{leave.adminNote}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {leave.status === LEAVE_STATUS.PENDING && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelLeave(leave._id)}
                      className="ml-4 text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Cancel Request
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Leave Requests
            </h3>
            <p className="text-gray-600 mb-4">
              {filterStatus === 'all'
                ? 'You haven\'t submitted any leave requests yet'
                : `No ${filterStatus} leave requests`}
            </p>
            {filterStatus === 'all' && (
              <Button variant="primary" onClick={() => setShowRequestModal(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Request Leave
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Request Leave Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        title="Request Leave"
      >
        <form onSubmit={handleSubmitLeave} className="space-y-4">
          {/* Leave Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="emergency">Emergency Leave</option>
              <option value="vacation">Vacation</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please provide a reason for your leave request..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRequestModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Submit Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leave;