// frontend/src/components/patient/PrescriptionView.jsx
import { FileText, Calendar, User, Pill, Activity, Download, X } from 'lucide-react';
import Button from '../common/Button';
import { formatDate, formatDateTime } from '../../utils/helpers';

const PrescriptionView = ({ prescription, onClose }) => {
  if (!prescription) return null;

  // Helper to get doctor name
  const getDoctorName = () => {
    if (prescription.doctor?.name) {
      return prescription.doctor.name;
    }
    if (prescription.doctor?.user?.firstName && prescription.doctor?.user?.lastName) {
      return `${prescription.doctor.user.firstName} ${prescription.doctor.user.lastName}`;
    }
    return 'N/A';
  };

  // Helper to get patient name
  const getPatientName = () => {
    if (prescription.patient?.name) {
      return prescription.patient.name;
    }
    if (prescription.patient?.user?.firstName && prescription.patient?.user?.lastName) {
      return `${prescription.patient.user.firstName} ${prescription.patient.user.lastName}`;
    }
    return 'N/A';
  };

  const handleDownload = () => {
    // Create a print-friendly version
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('prescription-print-content');
    
    if (printWindow && printContent) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Prescription - ${prescription.prescriptionId}</title>
            <style>
              @page { margin: 20mm; }
              body { 
                font-family: Arial, sans-serif; 
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .header { 
                text-align: center; 
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
                margin-bottom: 20px;
              }
              .header h1 { color: #2563eb; margin: 0; }
              .header p { color: #666; margin: 5px 0; }
              .section { margin: 20px 0; }
              .section-title { 
                font-size: 18px; 
                font-weight: bold; 
                color: #2563eb;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 5px;
                margin-bottom: 10px;
              }
              .info-grid { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 15px;
                margin: 15px 0;
              }
              .info-item { margin: 5px 0; }
              .info-label { font-weight: bold; color: #555; }
              .medication-item {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 15px;
                margin: 10px 0;
                background: #f9fafb;
              }
              .medication-name { 
                font-size: 16px; 
                font-weight: bold; 
                color: #1f2937;
              }
              .footer {
                margin-top: 40px;
                border-top: 2px solid #e5e7eb;
                padding-top: 15px;
                text-align: center;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-white" />
                <div>
                  <h3 className="text-2xl font-bold text-white">Prescription</h3>
                  <p className="text-blue-100 text-sm">ID: {prescription.prescriptionId}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
            {/* Patient & Doctor Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Patient Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Patient Information
                </h4>
                <p className="text-gray-900 font-medium">{getPatientName()}</p>
                {prescription.patient?.phone && (
                  <p className="text-gray-600 text-sm">{prescription.patient.phone}</p>
                )}
                {prescription.patient?.user?.phone && !prescription.patient?.phone && (
                  <p className="text-gray-600 text-sm">{prescription.patient.user.phone}</p>
                )}
                {prescription.patient?.email && (
                  <p className="text-gray-600 text-sm">{prescription.patient.email}</p>
                )}
                {prescription.patient?.user?.email && !prescription.patient?.email && (
                  <p className="text-gray-600 text-sm">{prescription.patient.user.email}</p>
                )}
              </div>

              {/* Doctor Info */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Doctor Information
                </h4>
                <p className="text-gray-900 font-medium">Dr. {getDoctorName()}</p>
                {prescription.doctor?.specialization && (
                  <p className="text-gray-600 text-sm">{prescription.doctor.specialization}</p>
                )}
                {(prescription.doctor?.medicalLicenseNumber || prescription.doctor?.licenseNumber) && (
                  <p className="text-gray-600 text-sm">License: {prescription.doctor.medicalLicenseNumber || prescription.doctor.licenseNumber}</p>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-700">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="font-medium">Prescription Date:</span>
                </div>
                <span className="text-gray-900 font-semibold">
                  {formatDate(prescription.prescriptionDate || prescription.date)}
                </span>
              </div>
            </div>

            {/* Diagnosis */}
            {prescription.diagnosis && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-red-500" />
                  Diagnosis
                </h4>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-gray-800">{prescription.diagnosis}</p>
                </div>
              </div>
            )}

            {/* Chief Complaints */}
            {prescription.chiefComplaints && prescription.chiefComplaints.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Chief Complaints</h4>
                <ul className="list-disc list-inside bg-gray-50 rounded-lg p-4 space-y-1">
                  {prescription.chiefComplaints.map((complaint, index) => (
                    <li key={index} className="text-gray-700">{complaint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Vital Signs */}
            {prescription.vitalSigns && Object.keys(prescription.vitalSigns).length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Vital Signs</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {prescription.vitalSigns.bloodPressure && prescription.vitalSigns.bloodPressure.systolic && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Blood Pressure</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {prescription.vitalSigns.bloodPressure.systolic}/{prescription.vitalSigns.bloodPressure.diastolic}
                      </p>
                    </div>
                  )}
                  {prescription.vitalSigns.temperature && prescription.vitalSigns.temperature.value && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Temperature</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {prescription.vitalSigns.temperature.value}°{prescription.vitalSigns.temperature.unit === 'celsius' ? 'C' : 'F'}
                      </p>
                    </div>
                  )}
                  {prescription.vitalSigns.pulse && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Pulse</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {prescription.vitalSigns.pulse} bpm
                      </p>
                    </div>
                  )}
                  {prescription.vitalSigns.oxygenSaturation && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">SpO2</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {prescription.vitalSigns.oxygenSaturation}%
                      </p>
                    </div>
                  )}
                  {prescription.vitalSigns.weight && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Weight</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {prescription.vitalSigns.weight} kg
                      </p>
                    </div>
                  )}
                  {prescription.vitalSigns.height && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Height</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {prescription.vitalSigns.height} cm
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Medications */}
            {prescription.medications && prescription.medications.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Pill className="w-5 h-5 mr-2 text-green-500" />
                  Medications
                </h4>
                <div className="space-y-3">
                  {prescription.medications.map((medication, index) => (
                    <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">{medication.name}</h5>
                        {medication.genericName && (
                          <span className="text-sm text-gray-600">({medication.genericName})</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Dosage:</span>
                          <p className="font-medium text-gray-900">{medication.dosage}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Frequency:</span>
                          <p className="font-medium text-gray-900">{medication.frequency}</p>
                        </div>
                        {medication.duration && (
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <p className="font-medium text-gray-900">
                              {typeof medication.duration === 'object' 
                                ? `${medication.duration.value} ${medication.duration.unit}`
                                : medication.duration
                              }
                            </p>
                          </div>
                        )}
                        {medication.route && (
                          <div>
                            <span className="text-gray-600">Route:</span>
                            <p className="font-medium text-gray-900 capitalize">{medication.route}</p>
                          </div>
                        )}
                      </div>
                      {medication.timing && (
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-medium">Timing:</span> {medication.timing}
                        </p>
                      )}
                      {medication.instructions && (
                        <p className="text-sm text-gray-700 mt-2">
                          <span className="font-medium">Instructions:</span> {medication.instructions}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lab Tests */}
            {prescription.labTests && prescription.labTests.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommended Lab Tests</h4>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {prescription.labTests.map((test, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2"></span>
                        <div>
                          <p className="font-medium text-gray-900">{test.testName || test}</p>
                          {test.reason && <p className="text-sm text-gray-600">{test.reason}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* General Instructions */}
            {prescription.generalInstructions && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">General Instructions</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{prescription.generalInstructions}</p>
                </div>
              </div>
            )}

            {/* Dietary Advice */}
            {prescription.dietaryAdvice && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Dietary Advice</h4>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-gray-700">{prescription.dietaryAdvice}</p>
                </div>
              </div>
            )}

            {/* Follow-up */}
            {prescription.followUp && prescription.followUp.required && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Follow-up</h4>
                <div className="bg-indigo-50 rounded-lg p-4">
                  {prescription.followUp.after && prescription.followUp.after.value && (
                    <p className="text-gray-700">
                      Follow-up required after {prescription.followUp.after.value} {prescription.followUp.after.unit || 'days'}
                    </p>
                  )}
                  {!prescription.followUp.after && (
                    <p className="text-gray-700">Follow-up required</p>
                  )}
                  {prescription.followUp.reason && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Reason:</span> {prescription.followUp.reason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Doctor's Notes */}
            {prescription.doctorNotes && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Doctor's Notes</h4>
                <div className="bg-gray-50 rounded-lg p-4 italic">
                  <p className="text-gray-700">{prescription.doctorNotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
            <p className="text-sm text-gray-600">
              Valid until: {prescription.validUntil ? formatDate(prescription.validUntil) : 'N/A'}
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={handleDownload} className="flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Print-Only Content */}
      <div id="prescription-print-content" style={{ display: 'none' }}>
        <div className="header">
          <h1>Medical Prescription</h1>
          <p>ID: {prescription.prescriptionId}</p>
          <p>{formatDateTime(prescription.prescriptionDate || prescription.createdAt)}</p>
        </div>

        <div className="section">
          <div className="section-title">Patient Information</div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Name:</span> {getPatientName()}
            </div>
            <div className="info-item">
              <span className="info-label">Age:</span> {prescription.patient?.age || prescription.patient?.user?.age || 'N/A'}
            </div>
            <div className="info-item">
              <span className="info-label">Gender:</span> {prescription.patient?.gender || prescription.patient?.user?.gender || 'N/A'}
            </div>
            <div className="info-item">
              <span className="info-label">Contact:</span> {prescription.patient?.phone || prescription.patient?.user?.phone || 'N/A'}
            </div>
          </div>
        </div>

        <div className="section">
          <div className="section-title">Doctor Information</div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Name:</span> Dr. {getDoctorName()}
            </div>
            <div className="info-item">
              <span className="info-label">Specialization:</span> {prescription.doctor?.specialization || 'N/A'}
            </div>
            <div className="info-item">
              <span className="info-label">Contact:</span> {prescription.doctor?.phone || prescription.doctor?.user?.phone || 'N/A'}
            </div>
          </div>
        </div>

        {prescription.diagnosis && (
          <div className="section">
            <div className="section-title">Diagnosis</div>
            <p>{prescription.diagnosis}</p>
          </div>
        )}

        {prescription.medications && prescription.medications.length > 0 && (
          <div className="section">
            <div className="section-title">Medications</div>
            {prescription.medications.map((med, index) => (
              <div className="medication-item" key={index}>
                <div className="medication-name">{index + 1}. {med.name}</div>
                <div className="info-item">
                  <span className="info-label">Dosage:</span> {med.dosage}
                </div>
                <div className="info-item">
                  <span className="info-label">Frequency:</span> {med.frequency}
                </div>
                <div className="info-item">
                  <span className="info-label">Duration:</span> {
                    typeof med.duration === 'object' && med.duration?.value
                      ? `${med.duration.value} ${med.duration.unit || 'days'}`
                      : med.duration || 'N/A'
                  }
                </div>
                {med.instructions && (
                  <div className="info-item">
                    <span className="info-label">Instructions:</span> {med.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {prescription.labTests && prescription.labTests.length > 0 && (
          <div className="section">
            <div className="section-title">Recommended Lab Tests</div>
            <ul>
              {prescription.labTests.map((test, index) => (
                <li key={index}>{test.testName || test}</li>
              ))}
            </ul>
          </div>
        )}

        {prescription.generalInstructions && (
          <div className="section">
            <div className="section-title">General Instructions</div>
            <p>{prescription.generalInstructions}</p>
          </div>
        )}

        {prescription.dietaryAdvice && (
          <div className="section">
            <div className="section-title">Dietary Advice</div>
            <p>{prescription.dietaryAdvice}</p>
          </div>
        )}

        {prescription.followUp && prescription.followUp.required && (
          <div className="section">
            <div className="section-title">Follow-up</div>
            {prescription.followUp.after && prescription.followUp.after.value && (
              <p>Follow-up required after {prescription.followUp.after.value} {prescription.followUp.after.unit || 'days'}</p>
            )}
            {prescription.followUp.reason && (
              <p><span className="info-label">Reason:</span> {prescription.followUp.reason}</p>
            )}
          </div>
        )}

        <div className="footer">
          <p>This is a computer-generated prescription</p>
          <p>Valid until: {prescription.validUntil ? formatDate(prescription.validUntil) : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionView;
