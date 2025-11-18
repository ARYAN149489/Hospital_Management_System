// frontend/src/pages/doctor/MySchedule.jsx
import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  X, 
  Check,
  AlertCircle,
  Umbrella,
  Ban,
  CalendarOff
} from 'lucide-react';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const MySchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showBlockSlotModal, setShowBlockSlotModal] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'casual_leave',
    reason: '',
    isHalfDay: false,
    halfDayType: 'first_half'
  });

  const [blockSlotForm, setBlockSlotForm] = useState({
    day: '',
    startTime: '',
    endTime: '',
    reason: ''
  });

  useEffect(() => {
    fetchSchedule();
    fetchLeaveRequests();
    fetchBlockedSlots();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.get('/doctor/schedule');
      setSchedule(response.data.data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get('/leaves/my-leaves');
      setLeaveRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const fetchBlockedSlots = async () => {
    try {
      const response = await api.get('/doctor/blocked-slots');
      setBlockedSlots(response.data.data || []);
    } catch (error) {
      console.error('Error fetching blocked slots:', error);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    if (new Date(leaveForm.startDate) > new Date(leaveForm.endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      // Calculate total days
      const start = new Date(leaveForm.startDate);
      const end = new Date(leaveForm.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const totalDays = leaveForm.isHalfDay ? 0.5 : diffDays;

      await api.post('/leaves', { ...leaveForm, totalDays });
      toast.success('Leave request submitted successfully! Awaiting admin approval.');
      setShowLeaveModal(false);
      setLeaveForm({
        startDate: '',
        endDate: '',
        leaveType: 'casual_leave',
        reason: '',
        isHalfDay: false,
        halfDayType: 'first_half'
      });
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error submitting leave:', error);
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleBlockSlot = async (e) => {
    e.preventDefault();
    
    if (!blockSlotForm.day || !blockSlotForm.startTime || !blockSlotForm.endTime) {
      toast.error('Please fill all required fields');
      return;
    }

    if (blockSlotForm.startTime >= blockSlotForm.endTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      await api.post('/doctor/block-slot', blockSlotForm);
      toast.success('Time slot blocked successfully');
      setShowBlockSlotModal(false);
      setBlockSlotForm({
        day: '',
        startTime: '',
        endTime: '',
        reason: ''
      });
      fetchBlockedSlots();
    } catch (error) {
      console.error('Error blocking slot:', error);
      toast.error(error.response?.data?.message || 'Failed to block time slot');
    }
  };

  const handleUnblockSlot = async (slotId) => {
    try {
      await api.delete(`/doctor/blocked-slots/${slotId}`);
      toast.success('Time slot unblocked successfully');
      fetchBlockedSlots();
    } catch (error) {
      console.error('Error unblocking slot:', error);
      toast.error('Failed to unblock time slot');
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      await api.delete(`/leaves/${leaveId}`);
      toast.success('Leave request cancelled');
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error cancelling leave:', error);
      toast.error('Failed to cancel leave request');
    }
  };

  const toggleDayAvailability = async (dayIndex) => {
    const day = schedule[dayIndex];
    const newAvailability = !day.isAvailable;

    try {
      const updatedSchedule = [...schedule];
      updatedSchedule[dayIndex] = {
        ...day,
        isAvailable: newAvailability
      };

      await api.put('/doctor/schedule', { availability: updatedSchedule });
      setSchedule(updatedSchedule);
      toast.success(`${day.day} marked as ${newAvailability ? 'available' : 'unavailable'}`);
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-700', icon: Check, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-700', icon: X, text: 'Rejected' },
      cancelled: { color: 'bg-gray-100 text-gray-700', icon: Ban, text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Calendar className="w-8 h-8 mr-3 text-indigo-600" />
                Manage Schedule
              </h1>
              <p className="text-gray-600 mt-1">View and manage your availability, blocked slots, and leave requests</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowBlockSlotModal(true)}
              >
                <CalendarOff className="w-4 h-4 mr-2" />
                Block Time Slot
              </Button>
              <Button
                variant="primary"
                onClick={() => setShowLeaveModal(true)}
              >
                <Umbrella className="w-4 h-4 mr-2" />
                Request Leave
              </Button>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Availability</h2>
          <div className="space-y-3">
            {schedule.map((day, index) => (
              <div
                key={day._id || index}
                className={`border rounded-lg p-4 transition-all ${
                  day.isAvailable ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-32">
                      <h3 className="font-semibold text-gray-900 capitalize">{day.day}</h3>
                    </div>
                    
                    {day.isAvailable && day.slots && day.slots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {day.slots.map((slot, slotIndex) => (
                          <span
                            key={slotIndex}
                            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                          >
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">No slots available</span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleDayAvailability(index)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                      day.isAvailable
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {day.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blocked Slots */}
        {blockedSlots.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarOff className="w-5 h-5 mr-2 text-orange-600" />
              Blocked Time Slots
            </h2>
            <div className="space-y-3">
              {blockedSlots.map((slot) => (
                <div
                  key={slot._id}
                  className="border border-orange-200 bg-orange-50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {slot.day} - {formatTime(slot.startTime)} to {formatTime(slot.endTime)}
                    </p>
                    {slot.reason && (
                      <p className="text-sm text-gray-600 mt-1">Reason: {slot.reason}</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblockSlot(slot._id)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leave Requests */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Umbrella className="w-5 h-5 mr-2 text-indigo-600" />
            Leave Requests
          </h2>
          {leaveRequests.length > 0 ? (
            <div className="space-y-3">
              {leaveRequests.map((leave) => (
                <div
                  key={leave._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusBadge(leave.status)}
                        <span className="text-sm text-gray-500 capitalize">
                          {leave.leaveType.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        {leave.isHalfDay && ` (${leave.halfDayType === 'first_half' ? 'First Half' : 'Second Half'})`}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Reason:</strong> {leave.reason}
                      </p>
                      {leave.status === 'rejected' && leave.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {leave.rejectionReason}
                        </div>
                      )}
                      {leave.status === 'approved' && leave.approvalComments && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                          <strong>Admin Comments:</strong> {leave.approvalComments}
                        </div>
                      )}
                    </div>
                    {leave.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelLeave(leave._id)}
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Umbrella className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No leave requests</p>
            </div>
          )}
        </div>

        {/* Leave Request Modal */}
        <Modal
          isOpen={showLeaveModal}
          onClose={() => setShowLeaveModal(false)}
          title="Request Leave"
          size="lg"
        >
          <form onSubmit={handleLeaveSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  min={leaveForm.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type *
              </label>
              <select
                value={leaveForm.leaveType}
                onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="casual_leave">Casual Leave</option>
                <option value="sick_leave">Sick Leave</option>
                <option value="vacation">Vacation</option>
                <option value="emergency">Emergency</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={leaveForm.isHalfDay}
                  onChange={(e) => setLeaveForm({ ...leaveForm, isHalfDay: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Half Day Leave</span>
              </label>
            </div>

            {leaveForm.isHalfDay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Half Day Type
                </label>
                <select
                  value={leaveForm.halfDayType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, halfDayType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="first_half">First Half (Morning)</option>
                  <option value="second_half">Second Half (Afternoon)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason *
              </label>
              <textarea
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                rows={3}
                placeholder="Please provide a reason for your leave request..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
                minLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 10 characters</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Your leave request will be sent to the admin for approval. You'll be notified once it's reviewed.
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLeaveModal(false)}
                fullWidth
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" fullWidth>
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>

        {/* Block Slot Modal */}
        <Modal
          isOpen={showBlockSlotModal}
          onClose={() => setShowBlockSlotModal(false)}
          title="Block Time Slot"
          size="md"
        >
          <form onSubmit={handleBlockSlot} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day *
              </label>
              <select
                value={blockSlotForm.day}
                onChange={(e) => setBlockSlotForm({ ...blockSlotForm, day: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select a day</option>
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day} value={day} className="capitalize">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={blockSlotForm.startTime}
                  onChange={(e) => setBlockSlotForm({ ...blockSlotForm, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time *
                </label>
                <input
                  type="time"
                  value={blockSlotForm.endTime}
                  onChange={(e) => setBlockSlotForm({ ...blockSlotForm, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason (Optional)
              </label>
              <input
                type="text"
                value={blockSlotForm.reason}
                onChange={(e) => setBlockSlotForm({ ...blockSlotForm, reason: e.target.value })}
                placeholder="e.g., Personal meeting, Hospital rounds"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowBlockSlotModal(false)}
                fullWidth
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" fullWidth>
                Block Slot
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default MySchedule;