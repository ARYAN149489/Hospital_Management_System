// frontend/src/pages/admin/ManageLeave.jsx
import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';
import { LEAVE_STATUS } from '../../utils/constants';

const ManageLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [leaves, statusFilter]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/leaves');
      setLeaves(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const filterLeaves = () => {
    let filtered = [...leaves];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((leave) => leave.status === statusFilter);
    }

    setFilteredLeaves(filtered);
  };

  const handleAction = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setAdminNote('');
    setShowActionModal(true);
  };

  const confirmAction = async () => {
    if (!selectedLeave) return;

    // Validate rejection reason
    if (actionType === 'reject') {
      if (!adminNote || adminNote.trim().length < 10) {
        toast.error('Rejection reason must be at least 10 characters');
        return;
      }
    }

    try {
      const requestBody = {
        status: actionType === 'approve' ? 'approved' : 'rejected',
      };

      // Only include rejectionReason if rejecting
      if (actionType === 'reject') {
        requestBody.rejectionReason = adminNote.trim();
      }

      await api.patch(`/admin/leaves/${selectedLeave._id}/approval`, requestBody);

      toast.success(`Leave request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowActionModal(false);
      setSelectedLeave(null);
      setAdminNote('');
      fetchLeaves();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || `Failed to ${actionType} leave request`;
      toast.error(errorMessage);
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
        return <Clock className="w-5 h-5 text-gray-600" />;
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

  const getStatusCount = (status) => {
    if (status === 'all') return leaves.length;
    return leaves.filter((leave) => leave.status === status).length;
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
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
                <Calendar className="w-8 h-8 mr-3 text-blue-600" />
                Manage Leave Requests
              </h1>
              <p className="text-gray-600 mt-1">
                Review and approve doctor leave applications
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-amber-600">
                {getStatusCount(LEAVE_STATUS.PENDING)}
              </p>
              <p className="text-sm text-gray-600">Pending Requests</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({getStatusCount(LEAVE_STATUS.PENDING)})
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                statusFilter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Approved ({getStatusCount(LEAVE_STATUS.APPROVED)})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                statusFilter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Rejected ({getStatusCount(LEAVE_STATUS.REJECTED)})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({getStatusCount('all')})
            </button>
          </div>
        </div>

        {/* Leave Requests List */}
        {filteredLeaves.length > 0 ? (
          <div className="space-y-4">
            {filteredLeaves.map((leave) => {
              const duration = calculateDuration(leave.startDate, leave.endDate);

              return (
                <div
                  key={leave._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-4">
                        {getStatusIcon(leave.status)}
                        <h3 className="text-lg font-semibold text-gray-900">
                          Dr. {leave.doctor?.user?.firstName} {leave.doctor?.user?.lastName}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                          {leave.status}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                          {leave.leaveType?.replace('_', ' ')} Leave
                        </span>
                      </div>

                      {/* Doctor Info */}
                      <div className="mb-4 text-sm text-gray-600">
                        <span className="font-medium">Specialization:</span>{' '}
                        {leave.doctor?.specialization}
                        <span className="mx-2">•</span>
                        <span className="font-medium">Email:</span> {leave.doctor?.user?.email}
                        <span className="mx-2">•</span>
                        <span className="font-medium">Phone:</span> {leave.doctor?.user?.phone}
                      </div>

                      {/* Leave Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs text-blue-600 font-medium mb-1">Start Date</p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatDate(leave.startDate)}
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-purple-600 font-medium mb-1">End Date</p>
                          <p className="text-base font-semibold text-gray-900">
                            {formatDate(leave.endDate)}
                          </p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-lg">
                          <p className="text-xs text-indigo-600 font-medium mb-1">Duration</p>
                          <p className="text-base font-semibold text-gray-900">
                            {duration} {duration === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Reason:</p>
                        <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">
                          {leave.reason}
                        </p>
                      </div>

                      {/* Admin Note (if exists) */}
                      {leave.adminNote && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-700 mb-1">Admin Note:</p>
                          <p className="text-sm text-blue-900">{leave.adminNote}</p>
                        </div>
                      )}

                      {/* Applied Date */}
                      <p className="text-xs text-gray-500 mt-3">
                        Applied on: {formatDate(leave.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {leave.status === LEAVE_STATUS.PENDING && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAction(leave, 'approve')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleAction(leave, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Leave Requests
            </h3>
            <p className="text-gray-600">
              {statusFilter === 'all'
                ? 'No leave requests submitted yet'
                : `No ${statusFilter} leave requests`}
            </p>
          </div>
        )}
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setAdminNote('');
        }}
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request`}
      >
        {selectedLeave && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to {actionType === 'approve' ? 'approve' : 'reject'} this leave
              request from{' '}
              <span className="font-semibold">Dr. {selectedLeave.doctor?.user?.firstName} {selectedLeave.doctor?.user?.lastName}</span>?
            </p>

            <div className="p-4 bg-gray-50 rounded-lg text-sm">
              <p>
                <span className="font-medium">Leave Type:</span>{' '}
                <span className="capitalize">{selectedLeave.leaveType?.replace('_', ' ')}</span>
              </p>
              <p>
                <span className="font-medium">Duration:</span>{' '}
                {calculateDuration(selectedLeave.startDate, selectedLeave.endDate)} days
              </p>
              <p>
                <span className="font-medium">Dates:</span> {formatDate(selectedLeave.startDate)} to{' '}
                {formatDate(selectedLeave.endDate)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {actionType === 'reject' ? 'Rejection Reason (Required - Min 10 characters)' : 'Admin Note (Optional)'}
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={actionType === 'reject' 
                  ? 'Please provide a detailed reason for rejection (minimum 10 characters)...'
                  : `Add a note for the doctor about this ${actionType}...`
                }
                required={actionType === 'reject'}
                minLength={actionType === 'reject' ? 10 : 0}
              />
              {actionType === 'reject' && adminNote && adminNote.trim().length < 10 && (
                <p className="text-red-600 text-sm mt-1">
                  Rejection reason must be at least 10 characters (current: {adminNote.trim().length})
                </p>
              )}
            </div>

            <div className="flex space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowActionModal(false);
                  setAdminNote('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'approve' ? 'success' : 'danger'}
                onClick={confirmAction}
                className="flex-1"
              >
                {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageLeave;