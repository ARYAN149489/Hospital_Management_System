// frontend/src/components/patient/LabTestCard.jsx
import { useState } from 'react';
import { 
  FlaskConical, 
  Calendar, 
  Clock,
  User,
  MapPin,
  Eye,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { formatDate, formatTime, getStatusColor } from '../../utils/helpers';
import { LAB_TEST_STATUS } from '../../utils/constants';

const LabTestCard = ({ labTest, onViewResult, onDownloadResult }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const {
    _id,
    labTestId,
    testName,
    testCategory,
    testType,
    prescribedBy,
    doctor,
    status,
    bookingDate,
    scheduledDate,
    scheduledTime,
    labName,
    labAddress,
    fastingRequired,
    preparationInstructions,
    specialInstructions,
    results,
    remarks,
    report,
    payment
  } = labTest;

  // Status configurations
  const statusConfig = {
    'booked': {
      icon: AlertCircle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      label: 'Booked',
    },
    'sample_collected': {
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Sample Collected',
    },
    'processing': {
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      label: 'Processing',
    },
    'report_ready': {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Report Ready',
    },
    'completed': {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Completed',
    },
    'cancelled': {
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: 'Cancelled',
    },
  };

  const currentStatus = statusConfig[status] || statusConfig['booked'];
  const StatusIcon = currentStatus.icon;

  const handleViewResult = () => {
    setShowDetailsModal(true);
    if (onViewResult) {
      onViewResult(labTest);
    }
  };

  const isCompleted = status === 'report_ready' || status === 'completed';
  const reportFile = report?.url;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
              <FlaskConical className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{testName}</h3>
              {testCategory && (
                <p className="text-sm text-gray-500 mb-2">{testCategory}</p>
              )}
              {labTestId && (
                <p className="text-xs text-gray-500">Test ID: {labTestId}</p>
              )}
            </div>
          </div>
          
          {/* Status Badge */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {currentStatus.label}
          </span>
        </div>

        {/* Test Details */}
        <div className="space-y-3 mb-4 pb-4 border-b">
          {/* Ordered By */}
          {doctor && doctor.name && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>Prescribed by Dr. {doctor.name}</span>
            </div>
          )}

          {/* Lab */}
          {labName && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{labName}</span>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-1">Booked Date</p>
              <div className="flex items-center text-gray-900 font-medium">
                <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                <span>{formatDate(bookingDate)}</span>
              </div>
            </div>
            
            <div>
              <p className="text-gray-500 text-xs mb-1">Scheduled Date</p>
              <div className="flex items-center text-gray-900 font-medium">
                <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                <span>{formatDate(scheduledDate)}</span>
              </div>
            </div>
            
            {report && report.uploadedAt && isCompleted && (
              <div className="col-span-2">
                <p className="text-gray-500 text-xs mb-1">Report Ready</p>
                <div className="flex items-center text-green-600 font-medium">
                  <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{formatDate(report.uploadedAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        {(preparationInstructions || fastingRequired) && !isCompleted && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            {fastingRequired && (
              <p className="text-sm text-yellow-800 font-semibold mb-1">
                ⚠️ Fasting Required
              </p>
            )}
            {preparationInstructions && (
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Instructions: </span>
                {preparationInstructions}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleViewResult();
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          {isCompleted && reportFile && (
            <a
              href={reportFile}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View Report
            </a>
          )}
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Lab Test Details"
        size="lg"
        footer={
          isCompleted && reportFile ? (
            <div className="flex justify-end">
              <a
                href={reportFile}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Eye className="w-5 h-5" />
                View Report
              </a>
            </div>
          ) : null
        }
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="pb-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{testName}</h2>
                {testCategory && (
                  <p className="text-gray-600">{testCategory}</p>
                )}
              </div>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${currentStatus.bgColor} ${currentStatus.color}`}>
                <StatusIcon className="w-4 h-4 mr-1" />
                {currentStatus.label}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Test ID</p>
                <p className="font-medium text-gray-900">{labTestId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Booked Date</p>
                <p className="font-medium text-gray-900">{formatDate(bookingDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Scheduled Date</p>
                <p className="font-medium text-gray-900">{formatDate(scheduledDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Scheduled Time</p>
                <p className="font-medium text-gray-900">{scheduledTime}</p>
              </div>
            </div>
          </div>

          {/* Doctor & Lab Info */}
          <div className="pb-6 border-b">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">PROVIDER INFORMATION</h3>
            <div className="space-y-4">
              {doctor && doctor.name && (
                <div>
                  <p className="text-sm text-gray-500">Prescribed by</p>
                  <p className="font-medium text-gray-900">Dr. {doctor.name}</p>
                  {doctor.specialization && (
                    <p className="text-sm text-gray-500">{doctor.specialization}</p>
                  )}
                </div>
              )}
              {labName && (
                <div>
                  <p className="text-sm text-gray-500">Laboratory</p>
                  <p className="font-medium text-gray-900">{labName}</p>
                  {labAddress && (
                    <p className="text-sm text-gray-600">{labAddress}</p>
                  )}
                </div>
              )}
              {testType && (
                <div>
                  <p className="text-sm text-gray-500">Test Type</p>
                  <p className="font-medium text-gray-900 capitalize">{testType.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="pb-6 border-b">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">TIMELINE</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Test Booked</p>
                  <p className="text-sm text-gray-500">{formatDate(bookingDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Scheduled For</p>
                  <p className="text-sm text-gray-500">{formatDate(scheduledDate)} at {scheduledTime}</p>
                </div>
              </div>
              
              {report && report.uploadedAt && isCompleted && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Report Ready</p>
                    <p className="text-sm text-gray-500">{formatDate(report.uploadedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          {payment && (
            <div className="pb-6 border-b">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">PAYMENT INFORMATION</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-gray-900">₹{payment.amount || payment.finalAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className={`font-medium ${payment.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {payment.status?.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {(preparationInstructions || specialInstructions || fastingRequired) && (
            <div className="pb-6 border-b">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">INSTRUCTIONS</h3>
              <div className="space-y-2">
                {fastingRequired && (
                  <p className="text-gray-900 font-medium">⚠️ Fasting Required</p>
                )}
                {preparationInstructions && (
                  <div>
                    <p className="text-sm text-gray-500">Preparation:</p>
                    <p className="text-gray-900 whitespace-pre-line">{preparationInstructions}</p>
                  </div>
                )}
                {specialInstructions && (
                  <div>
                    <p className="text-sm text-gray-500">Special Instructions:</p>
                    <p className="text-gray-900 whitespace-pre-line">{specialInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results */}
          {isCompleted && results && results.length > 0 && (
            <div className="pb-6 border-b">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">TEST RESULTS</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="border-b border-green-200 last:border-0 pb-2 last:pb-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900">{result.parameter}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          result.status === 'normal' ? 'bg-green-100 text-green-800' :
                          result.status === 'abnormal' || result.status === 'high' || result.status === 'low' ? 'bg-red-100 text-red-800' :
                          result.status === 'critical' ? 'bg-red-200 text-red-900' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {result.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          <span className="font-semibold">{result.value}</span> {result.unit}
                        </span>
                        {result.normalRange && (
                          <span className="text-gray-500">
                            Normal: {result.normalRange}
                          </span>
                        )}
                      </div>
                      {result.notes && (
                        <p className="text-xs text-gray-600 mt-1">{result.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Remarks */}
          {remarks && (
            <div className="pb-6 border-b">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">REMARKS</h3>
              <p className="text-gray-900 whitespace-pre-line">{remarks}</p>
            </div>
          )}

          {/* Report File */}
          {isCompleted && reportFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FlaskConical className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">Lab Report Available</p>
                    <p className="text-sm text-blue-700">Click to view the full report</p>
                  </div>
                </div>
                <a
                  href={reportFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Report
                </a>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default LabTestCard;