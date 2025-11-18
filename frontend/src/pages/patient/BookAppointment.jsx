// frontend/src/pages/patient/BookAppointment.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Clock,
  MapPin,
  User,
  FileText,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import Button from '../../components/common/Button';
import Loader, { FullPageLoader } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { doctorAPI, appointmentAPI } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { TIME_SLOTS } from '../../utils/constants';
import useForm from '../../hooks/useForm';
import { validateName } from '../../utils/validators';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);

  // Form states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('in-person');

  useEffect(() => {
    fetchDoctorDetails();
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  // Validate date selection
  const handleDateChange = (e) => {
    const selected = e.target.value;
    const selectedDate = new Date(selected);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Cannot select a past date. Please choose today or a future date.');
      setSelectedDate('');
      setSelectedTime('');
      return;
    }
    
    setSelectedDate(selected);
    setSelectedTime(''); // Reset time when date changes
  };

  const fetchDoctorDetails = async () => {
    setLoading(true);
    try {
      const response = await doctorAPI.getById(doctorId);
      if (response.success) {
        setDoctor(response.data);
      } else {
        toast.error('Failed to load doctor details');
        navigate('/patient/find-doctors');
      }
    } catch (error) {
      console.error('Fetch doctor error:', error);
      toast.error('Failed to load doctor details');
      navigate('/patient/find-doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const response = await appointmentAPI.getAvailableSlots(doctorId, selectedDate);
      if (response.success && response.data) {
        // Extract only available time slots from the response
        const slots = response.data.slots || [];
        const availableTimes = slots
          .filter(slot => slot.available)
          .map(slot => slot.time);
        setAvailableSlots(availableTimes);
      } else {
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

  const handleBooking = async (formValues) => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    if (!selectedTime) {
      toast.error('Please select a time slot');
      return;
    }

    // Validate that the selected date/time is not in the past
    const selectedDateTime = new Date(`${selectedDate}T${selectedTime}`);
    const now = new Date();
    
    if (selectedDateTime < now) {
      toast.error('Cannot book appointment for past date/time. Please select a future time slot.');
      return;
    }

    try {
      const bookingData = {
        doctorId: doctorId,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        reason: formValues.reason,
        symptoms: formValues.symptoms ? formValues.symptoms.split(',').map(s => s.trim()) : [],
        notes: formValues.notes,
      };

      const response = await appointmentAPI.create(bookingData);

      if (response.success) {
        setBookedAppointment(response.data);
        setShowSuccessModal(true);
        toast.success('Appointment booked successfully!');
      } else {
        toast.error(response.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Failed to book appointment');
    }
  };

  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm(
    {
      reason: '',
      symptoms: '',
      notes: '',
    },
    handleBooking,
    {
      reason: {
        required: true,
        minLength: 10,
        message: 'Please provide a reason (minimum 10 characters)',
      },
    }
  );

  // Get minimum and maximum dates for date picker
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days in advance
    return maxDate.toISOString().split('T')[0];
  };

  if (loading) {
    return <FullPageLoader message="Loading doctor details..." />;
  }

  if (!doctor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Book Appointment</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Doctor Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              {/* Doctor Card */}
              <div className="text-center mb-6">
                {doctor.profileImage ? (
                  <img
                    src={doctor.profileImage}
                    alt={doctor.name}
                    className="w-24 h-24 rounded-full mx-auto object-cover mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mx-auto text-white text-3xl font-bold mb-4">
                    {doctor.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Dr. {doctor.name}
                </h2>
                <p className="text-blue-600 mb-2">{doctor.specialization}</p>
                <p className="text-sm text-gray-600">{doctor.qualification}</p>
              </div>

              {/* Quick Info */}
              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3 text-blue-600" />
                  <span>{doctor.experience} years experience</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                  <span>{doctor.address || 'MediCare Hospital'}</span>
                </div>
              </div>

              {/* Consultation Fee */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Consultation Fee</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(doctor.consultationFee)}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
              {/* Step 1: Appointment Type */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  1. Select Appointment Type
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <button
                    type="button"
                    onClick={() => setAppointmentType('in-person')}
                    className={`p-4 border-2 rounded-lg transition ${
                      appointmentType === 'in-person'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <MapPin className={`w-8 h-8 mx-auto mb-2 ${
                      appointmentType === 'in-person' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <p className="font-semibold">In-Person Visit</p>
                    <p className="text-sm text-gray-500">Visit the clinic for consultation</p>
                  </button>
                </div>
              </div>

              {/* Step 2: Select Date */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  2. Select Date
                </h3>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    min={getMinDate()}
                    max={getMaxDate()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                {selectedDate && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {formatDate(selectedDate)}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Please select today or a future date for your appointment.
                </p>
              </div>

              {/* Step 3: Select Time Slot */}
              {selectedDate && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    3. Select Time Slot
                  </h3>
                  {loadingSlots ? (
                    <div className="flex justify-center py-8">
                      <Loader type="spinner" size="lg" />
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 px-3 rounded-lg border-2 transition font-medium text-sm ${
                            selectedTime === slot
                              ? 'border-blue-600 bg-blue-600 text-white'
                              : 'border-gray-200 hover:border-blue-300 text-gray-700'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No available slots for this date. Please select another date.
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Appointment Details */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  4. Appointment Details
                </h3>
                
                {/* Reason */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="reason"
                    value={values.reason}
                    onChange={handleChange}
                    placeholder="e.g., Regular checkup, Chest pain, Fever..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
                  )}
                </div>

                {/* Symptoms */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Symptoms (Optional)
                  </label>
                  <textarea
                    name="symptoms"
                    value={values.symptoms}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe your symptoms in detail..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={values.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any other information the doctor should know..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Summary */}
              {selectedDate && selectedTime && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="font-medium">Dr. {doctor.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(selectedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium capitalize">{appointmentType}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="text-gray-600">Consultation Fee:</span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(doctor.consultationFee)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={!selectedDate || !selectedTime || isSubmitting}
              >
                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/patient/appointments');
        }}
        title="Appointment Booked Successfully!"
        size="md"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Your appointment is confirmed!
          </h3>
          
          {bookedAppointment && (
            <div className="bg-gray-50 rounded-lg p-4 my-6 text-left">
              <p className="text-sm text-gray-600 mb-3">Appointment Details:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Appointment ID:</span>
                  <span className="font-medium">{bookedAppointment.appointmentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">
                    {formatDate(bookedAppointment.date)} at {bookedAppointment.time}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <p className="text-gray-600 mb-6">
            A confirmation email has been sent to your registered email address.
          </p>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/patient/dashboard');
              }}
              className="flex-1"
            >
              Go to Dashboard
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/patient/appointments');
              }}
              className="flex-1"
            >
              View Appointments
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookAppointment;