import React, { useState, useEffect } from 'react';
import { Calendar, Clock, X, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { appointmentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const RescheduleModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [reason, setReason] = useState('');

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  // Get maximum date (3 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen && appointment) {
      // Set initial date to current appointment date or tomorrow
      const currentDate = new Date(appointment.appointmentDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const initialDate = currentDate > tomorrow ? 
        currentDate.toISOString().split('T')[0] : 
        tomorrow.toISOString().split('T')[0];
      
      setSelectedDate(initialDate);
      setSelectedTime('');
      setReason('');
    }
  }, [isOpen, appointment]);

  useEffect(() => {
    if (selectedDate && appointment?.doctor?._id) {
      fetchAvailableSlots();
    }
  }, [selectedDate, appointment?.doctor?._id]);

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await appointmentAPI.getAvailableSlots(
        appointment.doctor._id,
        selectedDate
      );

      if (response.success) {
        // Backend returns { data: { slots: [...] } }
        const slots = response.data?.slots || [];
        
        // Filter only available slots and extract time strings
        const availableTimes = slots
          .filter(slot => slot.available)
          .map(slot => slot.time);
        
        setAvailableSlots(availableTimes);
      } else {
        toast.error('Failed to fetch available slots');
        setAvailableSlots([]);
      }
    } catch (error) {
      console.error('Fetch slots error:', error);
      toast.error('Failed to load available slots');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time');
      return;
    }

    if (!reason.trim() || reason.trim().length < 10) {
      toast.error('Please provide a reason for rescheduling (min 10 characters)');
      return;
    }

    setRescheduling(true);
    try {
      const response = await appointmentAPI.reschedule(appointment._id, {
        newDate: selectedDate,
        newTime: selectedTime,
        reason: reason.trim()
      });

      if (response.success) {
        toast.success('Appointment rescheduled successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || 'Failed to reschedule appointment');
      }
    } catch (error) {
      console.error('Reschedule error:', error);
      toast.error('Failed to reschedule appointment');
    } finally {
      setRescheduling(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setSelectedTime(''); // Reset selected time when date changes
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Appointment"
      size="lg"
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={rescheduling}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleReschedule}
            loading={rescheduling}
            disabled={!selectedDate || !selectedTime || reason.trim().length < 10 || rescheduling}
          >
            {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Current Appointment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Current Appointment</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p><span className="font-medium">Doctor:</span> Dr. {appointment.doctor?.name}</p>
            <p><span className="font-medium">Date:</span> {formatDate(appointment.appointmentDate)}</p>
            <p><span className="font-medium">Time:</span> {appointment.appointmentTime}</p>
          </div>
        </div>

        {/* Select New Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Select New Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={today}
            max={maxDateStr}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {selectedDate && (
            <p className="text-xs text-gray-500 mt-1">
              {formatDate(selectedDate)}
            </p>
          )}
        </div>

        {/* Available Time Slots */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Select New Time Slot
          </label>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading available slots...</span>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No available slots for this date</p>
              <p className="text-sm text-gray-500 mt-1">Please select a different date</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedTime === slot
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                    }
                  `}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reason for Rescheduling */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Rescheduling <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-2">
              ({reason.trim().length}/10 min characters)
            </span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Please provide a reason for rescheduling (minimum 10 characters)..."
            minLength={10}
          />
          {reason.trim().length > 0 && reason.trim().length < 10 && (
            <p className="text-xs text-red-500 mt-1">
              Please enter at least 10 characters
            </p>
          )}
        </div>

        {/* Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-green-900 mb-2">New Appointment Details</h4>
            <div className="space-y-1 text-sm text-green-800">
              <p><span className="font-medium">Date:</span> {formatDate(selectedDate)}</p>
              <p><span className="font-medium">Time:</span> {selectedTime}</p>
              <p><span className="font-medium">Doctor:</span> Dr. {appointment.doctor?.name}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default RescheduleModal;
