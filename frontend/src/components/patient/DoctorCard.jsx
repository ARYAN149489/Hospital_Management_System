// frontend/src/components/patient/DoctorCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  Award,
  Stethoscope,
  DollarSign,
  Phone,
  Mail
} from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { formatCurrency } from '../../utils/helpers';

const DoctorCard = ({ doctor, onBook, variant = 'grid' }) => {
  const navigate = useNavigate();
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const {
    _id,
    userId,
    name,
    specialization,
    qualification,
    experience,
    consultationFee,
    rating = 4.5,
    totalReviews = 0,
    availableSlots = [],
    profileImage,
    about,
    address,
    phone,
    email,
  } = doctor;

  const handleBookAppointment = () => {
    if (onBook) {
      onBook(doctor);
    } else {
      navigate(`/patient/book-appointment/${_id}`);
    }
  };

  const handleViewProfile = () => {
    setShowDetailsModal(true);
  };

  // Grid variant (default - card layout)
  if (variant === 'grid') {
    return (
      <>
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          {/* Doctor Image */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-500">
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold">
                {name?.charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Rating Badge */}
            <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center space-x-1 shadow-lg">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-semibold text-gray-900">{rating}</span>
              <span className="text-gray-500 text-sm">({totalReviews})</span>
            </div>
          </div>

          {/* Doctor Info */}
          <div className="p-5">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
            <div className="flex items-center text-blue-600 mb-3">
              <Stethoscope className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">{specialization}</span>
            </div>

            {/* Qualification & Experience */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-gray-600 text-sm">
                <Award className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{qualification}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{experience} years experience</span>
              </div>
            </div>

            {/* Consultation Fee */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <span className="text-gray-600 text-sm">Consultation Fee</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(consultationFee)}
              </span>
            </div>

            {/* Available Today Badge */}
            {availableSlots.length > 0 && (
              <div className="mb-4">
                <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Available Today
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewProfile}
                className="flex-1"
              >
                View Profile
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBookAppointment}
                icon={Calendar}
                className="flex-1"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>

        {/* Details Modal */}
        <DoctorDetailsModal
          doctor={doctor}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onBook={handleBookAppointment}
        />
      </>
    );
  }

  // List variant (row layout)
  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5">
        <div className="flex items-start space-x-4">
          {/* Doctor Image */}
          <div className="flex-shrink-0">
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                {name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Doctor Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{name}</h3>
                <div className="flex items-center text-blue-600 mb-2">
                  <Stethoscope className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{specialization}</span>
                </div>
              </div>
              
              {/* Rating */}
              <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="font-semibold text-gray-900">{rating}</span>
                <span className="text-gray-500 text-sm">({totalReviews})</span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center text-gray-600 text-sm">
                <Award className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{qualification}</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{experience} years exp.</span>
              </div>
              <div className="flex items-center text-gray-600 text-sm">
                <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="font-semibold text-green-600">
                  {formatCurrency(consultationFee)}
                </span>
              </div>
              {availableSlots.length > 0 && (
                <div className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                    Available Today
                  </span>
                </div>
              )}
            </div>

            {/* About */}
            {about && (
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {about}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewProfile}
              >
                View Details
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBookAppointment}
                icon={Calendar}
              >
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <DoctorDetailsModal
        doctor={doctor}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onBook={handleBookAppointment}
      />
    </>
  );
};

// Doctor Details Modal Component
const DoctorDetailsModal = ({ doctor, isOpen, onClose, onBook }) => {
  const {
    name,
    specialization,
    qualification,
    experience,
    consultationFee,
    rating = 4.5,
    totalReviews = 0,
    profileImage,
    about,
    address,
    phone,
    email,
  } = doctor;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Doctor Profile"
      size="lg"
      footer={
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={onBook} icon={Calendar}>
            Book Appointment
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start space-x-4">
          {profileImage ? (
            <img
              src={profileImage}
              alt={name}
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {name?.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
            <div className="flex items-center text-blue-600 mb-2">
              <Stethoscope className="w-5 h-5 mr-2" />
              <span className="font-medium">{specialization}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-yellow-500 fill-current" />
              <span className="font-semibold text-gray-900">{rating}</span>
              <span className="text-gray-500 text-sm">({totalReviews} reviews)</span>
            </div>
          </div>
        </div>

        {/* About */}
        {about && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">About</h4>
            <p className="text-gray-600">{about}</p>
          </div>
        )}

        {/* Qualifications */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Qualification</h4>
            <div className="flex items-center text-gray-600">
              <Award className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{qualification}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{experience} years</span>
            </div>
          </div>
        </div>

        {/* Consultation Fee */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Consultation Fee</h4>
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-green-600" />
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(consultationFee)}
            </span>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
          <div className="space-y-2">
            {address && (
              <div className="flex items-start text-gray-600">
                <MapPin className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
            )}
            {phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{phone}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{email}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DoctorCard;