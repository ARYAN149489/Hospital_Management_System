// frontend/src/components/doctor/PatientCard.jsx
import { useState } from 'react';
import { 
  User, 
  Calendar, 
  Phone, 
  Mail,
  MapPin,
  FileText,
  Heart,
  Droplet,
  Activity,
  Eye
} from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { formatDate, calculateAge } from '../../utils/helpers';

const PatientCard = ({ patient, onViewHistory, variant = 'card' }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const {
    _id,
    userId,
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    bloodGroup,
    address,
    emergencyContact,
    medicalHistory,
    allergies,
    currentMedications,
    profileImage,
  } = patient;

  const age = dateOfBirth ? calculateAge(dateOfBirth) : 'N/A';

  const handleViewHistory = () => {
    if (onViewHistory) {
      onViewHistory(patient);
    }
  };

  // Card variant
  if (variant === 'card') {
    return (
      <>
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5">
          {/* Header */}
          <div className="flex items-start space-x-4 mb-4">
            {profileImage ? (
              <img
                src={profileImage}
                alt={name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {age} years
                </span>
                <span className="flex items-center">
                  <Activity className="w-4 h-4 mr-1" />
                  {gender}
                </span>
                <span className="flex items-center">
                  <Droplet className="w-4 h-4 mr-1" />
                  {bloodGroup || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              {phone}
            </div>
            <div className="flex items-center text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              {email}
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {allergies && allergies.length > 0 && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-xs text-red-600 font-medium mb-1">Allergies</p>
                <p className="text-sm text-red-700">{allergies.join(', ')}</p>
              </div>
            )}
            
            {currentMedications && currentMedications.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-600 font-medium mb-1">Current Medications</p>
                <p className="text-sm text-blue-700">{currentMedications.length} active</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetailsModal(true)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleViewHistory}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Medical History
            </Button>
          </div>
        </div>

        {/* Details Modal */}
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title={`${name}'s Details`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Full Name</p>
                  <p className="text-gray-900 font-medium">{name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date of Birth</p>
                  <p className="text-gray-900 font-medium">
                    {dateOfBirth ? formatDate(dateOfBirth) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Gender</p>
                  <p className="text-gray-900 font-medium">{gender}</p>
                </div>
                <div>
                  <p className="text-gray-500">Blood Group</p>
                  <p className="text-gray-900 font-medium">{bloodGroup || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {phone}
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {email}
                </div>
                {address && (
                  <div className="flex items-start text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-1" />
                    <span>{address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            {emergencyContact && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Emergency Contact</h4>
                <div className="bg-red-50 p-4 rounded-lg text-sm">
                  <p className="text-gray-900 font-medium">{emergencyContact.name}</p>
                  <p className="text-gray-600">{emergencyContact.relationship}</p>
                  <p className="text-gray-600 mt-1">{emergencyContact.phone}</p>
                </div>
              </div>
            )}

            {/* Medical Information */}
            {allergies && allergies.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Allergies</h4>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentMedications && currentMedications.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Current Medications</h4>
                <div className="space-y-2">
                  {currentMedications.map((medication, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm">
                      <p className="text-gray-900 font-medium">{medication}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      </>
    );
  }

  // List variant
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center space-x-4">
        {profileImage ? (
          <img
            src={profileImage}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">{name}</h3>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
            <span>{age} years</span>
            <span>•</span>
            <span>{gender}</span>
            <span>•</span>
            <span>{bloodGroup || 'N/A'}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetailsModal(true)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleViewHistory}
          >
            <FileText className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`${name}'s Details`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Personal Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Full Name</p>
                <p className="text-gray-900 font-medium">{name}</p>
              </div>
              <div>
                <p className="text-gray-500">Date of Birth</p>
                <p className="text-gray-900 font-medium">
                  {dateOfBirth ? formatDate(dateOfBirth) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Gender</p>
                <p className="text-gray-900 font-medium">{gender}</p>
              </div>
              <div>
                <p className="text-gray-500">Blood Group</p>
                <p className="text-gray-900 font-medium">{bloodGroup || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {phone}
              </div>
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {email}
              </div>
              {address && (
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 mt-1" />
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Emergency Contact */}
          {emergencyContact && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Emergency Contact</h4>
              <div className="bg-red-50 p-4 rounded-lg text-sm">
                <p className="text-gray-900 font-medium">{emergencyContact.name}</p>
                <p className="text-gray-600">{emergencyContact.relationship}</p>
                <p className="text-gray-600 mt-1">{emergencyContact.phone}</p>
              </div>
            </div>
          )}

          {/* Medical Information */}
          {allergies && allergies.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Allergies</h4>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          )}

          {currentMedications && currentMedications.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Current Medications</h4>
              <div className="space-y-2">
                {currentMedications.map((medication, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="text-gray-900 font-medium">{medication}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default PatientCard;