// frontend/src/components/patient/PrescriptionCard.jsx
import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  User,
  Pill,
  Clock,
  Download,
  Eye,
  Printer
} from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { formatDate, formatDateTime } from '../../utils/helpers';

const PrescriptionCard = ({ prescription, onDownload, onView }) => {
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const {
    _id,
    prescriptionId,
    doctor,
    date,
    diagnosis,
    medicines = [],
    medications = [],
    tests = [],
    labTests = [],
    advice,
    followUpDate,
    createdAt,
    prescriptionDate,
  } = prescription;

  // Use medications if medicines is empty (for compatibility)
  const medicineList = medicines.length > 0 ? medicines : medications;
  const testList = tests.length > 0 ? tests : labTests;
  const displayDate = date || prescriptionDate || createdAt;

  const handleDownload = () => {
    if (onDownload) {
      onDownload(prescription);
    } else {
      // Default download logic
      window.print();
    }
  };

  const handleViewDetails = () => {
    if (onView) {
      onView(prescription);
    } else {
      setShowDetailsModal(true);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 pb-4 border-b">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Prescription
              </h3>
              <p className="text-sm text-gray-500">ID: {prescriptionId}</p>
            </div>
          </div>
          <span className="text-sm text-gray-500">{formatDate(displayDate)}</span>
        </div>

        {/* Doctor Info */}
        <div className="mb-4 pb-4 border-b">
          <div className="flex items-center space-x-3">
            {doctor?.profileImage ? (
              <img
                src={doctor.profileImage}
                alt={doctor.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {doctor?.name?.charAt(0)?.toUpperCase() || 'D'}
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">Dr. {doctor?.name || 'N/A'}</p>
              <p className="text-sm text-gray-500">{doctor?.specialization || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Diagnosis */}
        {diagnosis && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Diagnosis</h4>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{diagnosis}</p>
          </div>
        )}

        {/* Medicines Count */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Pill className="w-4 h-4 mr-2" />
              <span>{medicineList.length} Medicine(s) prescribed</span>
            </div>
            {testList.length > 0 && (
              <div className="flex items-center text-gray-600">
                <FileText className="w-4 h-4 mr-2" />
                <span>{testList.length} Test(s) recommended</span>
              </div>
            )}
          </div>
        </div>

        {/* Follow-up Date */}
        {followUpDate && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center text-yellow-800">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">
                Follow-up on: {formatDate(followUpDate)}
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
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleDownload}
            className="flex-1"
          >
            Download
          </Button>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Prescription Details"
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              icon={Printer}
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button
              variant="primary"
              icon={Download}
              onClick={handleDownload}
            >
              Download PDF
            </Button>
          </div>
        }
      >
        <div className="space-y-6" id="prescription-content">
          {/* Header */}
          <div className="text-center pb-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Medical Prescription</h2>
            <p className="text-sm text-gray-500">ID: {prescriptionId}</p>
            <p className="text-sm text-gray-500">Date: {formatDateTime(date)}</p>
          </div>

          {/* Doctor Information */}
          <div className="pb-6 border-b">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">PRESCRIBED BY</h3>
            <div className="flex items-center space-x-4">
              {doctor?.profileImage ? (
                <img
                  src={doctor.profileImage}
                  alt={doctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                  {doctor?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 text-lg">Dr. {doctor?.name}</p>
                <p className="text-blue-600">{doctor?.specialization}</p>
                {doctor?.qualification && (
                  <p className="text-sm text-gray-500">{doctor.qualification}</p>
                )}
                {doctor?.licenseNumber && (
                  <p className="text-sm text-gray-500">License: {doctor.licenseNumber}</p>
                )}
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          {diagnosis && (
            <div className="pb-6 border-b">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">DIAGNOSIS</h3>
              <p className="text-gray-900 text-base">{diagnosis}</p>
            </div>
          )}

          {/* Medicines */}
          {medicines.length > 0 && (
            <div className="pb-6 border-b">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">MEDICATIONS</h3>
              <div className="space-y-4">
                {medicines.map((medicine, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {index + 1}. {medicine.name}
                        </h4>
                        <p className="text-sm text-gray-600">{medicine.dosage}</p>
                      </div>
                      {medicine.duration && (
                        <span className="text-sm font-medium text-blue-600 ml-4">
                          {typeof medicine.duration === 'object' && medicine.duration?.value
                            ? `${medicine.duration.value} ${medicine.duration.unit || 'days'}`
                            : medicine.duration
                          }
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                      {medicine.frequency && (
                        <div>
                          <span className="text-gray-500">Frequency:</span>
                          <p className="font-medium text-gray-900">{medicine.frequency}</p>
                        </div>
                      )}
                      {medicine.timing && (
                        <div>
                          <span className="text-gray-500">Timing:</span>
                          <p className="font-medium text-gray-900 capitalize">{medicine.timing}</p>
                        </div>
                      )}
                      {medicine.quantity && (
                        <div>
                          <span className="text-gray-500">Quantity:</span>
                          <p className="font-medium text-gray-900">{medicine.quantity}</p>
                        </div>
                      )}
                    </div>
                    {medicine.instructions && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Instructions:</span> {medicine.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tests */}
          {tests.length > 0 && (
            <div className="pb-6 border-b">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">RECOMMENDED TESTS</h3>
              <ul className="space-y-2">
                {tests.map((test, index) => (
                  <li key={index} className="flex items-center text-gray-900">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <span>{test}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Advice */}
          {advice && (
            <div className="pb-6 border-b">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">DOCTOR'S ADVICE</h3>
              <p className="text-gray-900 whitespace-pre-line">{advice}</p>
            </div>
          )}

          {/* Follow-up */}
          {followUpDate && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-semibold text-yellow-900">Follow-up Required</p>
                  <p className="text-sm text-yellow-700">
                    Please schedule a follow-up appointment on or before {formatDate(followUpDate)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="pt-6 border-t text-center text-sm text-gray-500">
            <p>This is a digitally generated prescription from MediCare Plus</p>
            <p className="mt-1">Generated on: {formatDateTime(createdAt || date)}</p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PrescriptionCard;