// frontend/src/components/doctor/PrescriptionForm.jsx
import { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import Button from '../common/Button';
import { validatePrescription } from '../../utils/validators';

const PrescriptionForm = ({ patientId, patientName, appointmentId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    diagnosis: '',
    medications: [
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ],
    labTests: '',
    advice: '',
    followUpDate: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate patientId on component mount
  if (!patientId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold">Error: Patient ID is missing</p>
        <p className="text-red-600 text-sm mt-2">Cannot create prescription without a valid patient ID.</p>
        <p className="text-red-600 text-sm">Please go back and select an appointment again.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...formData.medications];
    newMedications[index] = {
      ...newMedications[index],
      [field]: value,
    };
    setFormData(prev => ({
      ...prev,
      medications: newMedications,
    }));
    // Clear medication error
    if (errors[`medications.${index}.${field}`]) {
      setErrors(prev => ({ ...prev, [`medications.${index}.${field}`]: '' }));
    }
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        },
      ],
    }));
  };

  const removeMedication = (index) => {
    if (formData.medications.length > 1) {
      setFormData(prev => ({
        ...prev,
        medications: prev.medications.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Log submission data for debugging
    console.log('=== PRESCRIPTION FORM SUBMIT ===');
    console.log('Patient ID:', patientId);
    console.log('Patient Name:', patientName);
    console.log('Appointment ID:', appointmentId);
    console.log('Form Data:', formData);
    console.log('================================');

    // Validate form
    const validation = validatePrescription(formData);
    if (!validation.isValid) {
      console.log('❌ Form validation failed:', validation.errors);
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Transform medications duration from string to object format
      const transformedMedications = formData.medications.map(med => {
        // Parse duration string (e.g., "7 days" or "2 weeks")
        let durationObj = { value: 0, unit: 'days' };
        if (med.duration && med.duration.trim()) {
          const parts = med.duration.trim().toLowerCase().split(' ');
          const value = parseInt(parts[0]);
          let unit = parts[1] || 'days';
          
          // Normalize unit to singular form for backend validation
          if (unit === 'day' || unit === 'days') unit = 'days';
          else if (unit === 'week' || unit === 'weeks') unit = 'weeks';
          else if (unit === 'month' || unit === 'months') unit = 'months';
          else unit = 'days'; // default
          
          durationObj = { value: isNaN(value) ? 0 : value, unit };
        }

        return {
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: durationObj,
          instructions: med.instructions || '',
        };
      });

      // Transform lab tests from string to array format
      let transformedLabTests = [];
      if (formData.labTests && formData.labTests.trim()) {
        // Split by comma or newline to get multiple tests
        const testNames = formData.labTests.split(/[,\n]+/).map(t => t.trim()).filter(t => t);
        transformedLabTests = testNames.map(testName => ({
          testName,
          reason: '',
          urgent: false
        }));
      }

      // Transform follow-up date to follow-up object if provided
      let transformedFollowUp = undefined;
      if (formData.followUpDate) {
        const followUpDate = new Date(formData.followUpDate);
        const today = new Date();
        const diffTime = followUpDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        transformedFollowUp = {
          required: true,
          after: {
            value: Math.max(1, diffDays),
            unit: 'days'
          },
          reason: ''
        };
      }

      const prescriptionData = {
        patientId,
        appointmentId,
        diagnosis: formData.diagnosis,
        medications: transformedMedications,
        labTests: transformedLabTests,
        generalInstructions: formData.advice || '',
        followUp: transformedFollowUp,
      };

      console.log('📤 Sending transformed prescription data:', JSON.stringify(prescriptionData, null, 2));
      await onSubmit(prescriptionData);
    } catch (error) {
      console.error('Error submitting prescription:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Patient Information</h3>
        <p className="text-gray-700">{patientName}</p>
        <p className="text-sm text-gray-600">Patient ID: {patientId}</p>
      </div>

      {/* Diagnosis */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Diagnosis <span className="text-red-500">*</span>
        </label>
        <textarea
          name="diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.diagnosis ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter diagnosis..."
        />
        {errors.diagnosis && (
          <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>
        )}
      </div>

      {/* Medications */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Medications <span className="text-red-500">*</span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMedication}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Medication
          </Button>
        </div>

        <div className="space-y-4">
          {formData.medications.map((medication, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Medication {index + 1}
                </h4>
                {formData.medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Medicine Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    value={medication.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                      errors[`medications.${index}.name`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Paracetamol 500mg"
                  />
                  {errors[`medications.${index}.name`] && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors[`medications.${index}.name`]}
                    </p>
                  )}
                </div>

                {/* Dosage */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={medication.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="e.g., 1 tablet"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <input
                    type="text"
                    value={medication.frequency}
                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="e.g., 3 times a day"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={medication.duration}
                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="e.g., 7 days"
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <input
                    type="text"
                    value={medication.instructions}
                    onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="e.g., After meals"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lab Tests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Lab Tests (Optional)
        </label>
        <textarea
          name="labTests"
          value={formData.labTests}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter recommended lab tests (comma-separated)..."
        />
      </div>

      {/* Advice */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Medical Advice
        </label>
        <textarea
          name="advice"
          value={formData.advice}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter medical advice and recommendations..."
        />
      </div>

      {/* Follow-up Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Follow-up Date (Optional)
        </label>
        <input
          type="date"
          name="followUpDate"
          value={formData.followUpDate}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Prescription
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default PrescriptionForm;