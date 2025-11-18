// frontend/src/components/patient/MedicalRecordCard.jsx
import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  User,
  Download,
  Eye,
  File,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { formatDate, formatFileSize } from '../../utils/helpers';

const MedicalRecordCard = ({ record, onView, onDownload }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const {
    _id,
    recordId,
    title,
    category,
    date,
    doctor,
    hospital,
    description,
    files = [],
    createdAt,
  } = record;

  // Category colors
  const categoryColors = {
    'lab-report': 'bg-blue-100 text-blue-800',
    'prescription': 'bg-green-100 text-green-800',
    'medical-report': 'bg-purple-100 text-purple-800',
    'scan': 'bg-orange-100 text-orange-800',
    'xray': 'bg-red-100 text-red-800',
    'other': 'bg-gray-100 text-gray-800',
  };

  const categoryColor = categoryColors[category] || categoryColors['other'];

  const handleViewDetails = () => {
    setShowDetailsModal(true);
    if (onView) {
      onView(record);
    }
  };

  const handleDownload = (file) => {
    if (onDownload) {
      onDownload(file);
    } else {
      // Default download
      window.open(file.url, '_blank');
    }
  };

  const handleViewImage = (file) => {
    setShowImageModal(true);
  };

  const isImageFile = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const isPdfFile = (filename) => {
    return filename?.toLowerCase().endsWith('.pdf');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                {title}
              </h3>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColor}`}>
                  {category ? category.replace(/-|_/g, ' ').toUpperCase() : 'OTHER'}
                </span>
                <span className="text-sm text-gray-500">{formatDate(date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor & Hospital Info */}
        {(doctor || hospital) && (
          <div className="mb-4 pb-4 border-b space-y-2">
            {doctor && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Dr. {doctor.name} - {doctor.specialization}</span>
              </div>
            )}
            {hospital && (
              <div className="flex items-center text-sm text-gray-600">
                <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>{hospital}</span>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          </div>
        )}

        {/* Files Count */}
        {files.length > 0 && (
          <div className="mb-4 bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <File className="w-4 h-4 mr-2" />
                <span>{files.length} file(s) attached</span>
              </div>
              <span className="text-xs text-gray-500">
                {formatFileSize(files.reduce((acc, f) => acc + (f.size || 0), 0))}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={handleViewDetails}
            className="flex-1"
          >
            View Details
          </Button>
          {files.length > 0 && (
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={() => handleDownload(files[0])}
              className="flex-1"
            >
              Download
            </Button>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Medical Record Details"
        size="lg"
      >
        <div className="space-y-6">
          {/* Header Info */}
          <div className="pb-6 border-b">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${categoryColor}`}>
                  {category.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Record ID</p>
                <p className="font-medium text-gray-900">{recordId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{formatDate(date)}</p>
              </div>
            </div>
          </div>

          {/* Doctor & Hospital */}
          {(doctor || hospital) && (
            <div className="pb-6 border-b">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">PROVIDER INFORMATION</h3>
              <div className="space-y-3">
                {doctor && (
                  <div className="flex items-center space-x-3">
                    {doctor.profileImage ? (
                      <img
                        src={doctor.profileImage}
                        alt={doctor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {doctor.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Dr. {doctor.name}</p>
                      <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    </div>
                  </div>
                )}
                {hospital && (
                  <div>
                    <p className="text-sm text-gray-500">Hospital/Clinic</p>
                    <p className="font-medium text-gray-900">{hospital}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="pb-6 border-b">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">DESCRIPTION</h3>
              <p className="text-gray-900 whitespace-pre-line">{description}</p>
            </div>
          )}

          {/* Attached Files */}
          {files.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">ATTACHED FILES</h3>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {isImageFile(file.name) ? (
                          <ImageIcon className="w-8 h-8 text-blue-500" />
                        ) : isPdfFile(file.name) ? (
                          <FileText className="w-8 h-8 text-red-500" />
                        ) : (
                          <File className="w-8 h-8 text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)} • {file.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {isImageFile(file.name) && (
                        <button
                          onClick={() => handleViewImage(file)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View Image"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                        title="Open in new tab"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-6 border-t text-sm text-gray-500">
            <p>Uploaded on: {formatDate(createdAt || date)}</p>
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      {showImageModal && files.length > 0 && (
        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          title="Image Preview"
          size="xl"
        >
          <div className="space-y-4">
            {files.filter(f => isImageFile(f.name)).map((file, index) => (
              <div key={index} className="text-center">
                <img
                  src={file.url}
                  alt={file.name}
                  className="max-w-full h-auto rounded-lg mx-auto"
                />
                <p className="text-sm text-gray-600 mt-2">{file.name}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
};

export default MedicalRecordCard;