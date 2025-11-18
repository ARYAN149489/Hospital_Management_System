// frontend/src/pages/patient/BookLabTest.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Calendar, Clock, MapPin, Home, Building2, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { patientAPI } from '../../services/api';
import toast from 'react-hot-toast';

const BookLabTest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    testName: '',
    testCategory: '',
    scheduledDate: '',
    scheduledTime: '',
    testType: 'hospital',
    fastingRequired: false,
    preparationInstructions: '',
    specialInstructions: '',
    amount: ''
  });

  const [collectionAddress, setCollectionAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  const HOME_COLLECTION_FEE = 200; // Additional fee for home collection

  const testCategories = [
    'Blood Test',
    'Urine Test',
    'Stool Test',
    'Imaging',
    'Biopsy',
    'Culture Test',
    'Genetic Test',
    'Allergy Test',
    'COVID-19 Test',
    'Other'
  ];

  // Test prices mapping
  const testPrices = {
    'Complete Blood Count (CBC)': 500,
    'Blood Sugar': 300,
    'Lipid Profile': 800,
    'Liver Function Test': 900,
    'Kidney Function Test': 850,
    'Thyroid Profile': 700,
    'Routine Urine Test': 200,
    'Urine Culture': 600,
    'Urine Protein': 400,
    'X-Ray': 500,
    'CT Scan': 3500,
    'MRI': 6000,
    'Ultrasound': 1200,
    'RT-PCR': 800,
    'Rapid Antigen Test': 300,
    'Antibody Test': 600
  };

  const commonTests = {
    'Blood Test': ['Complete Blood Count (CBC)', 'Blood Sugar', 'Lipid Profile', 'Liver Function Test', 'Kidney Function Test', 'Thyroid Profile'],
    'Urine Test': ['Routine Urine Test', 'Urine Culture', 'Urine Protein'],
    'Imaging': ['X-Ray', 'CT Scan', 'MRI', 'Ultrasound'],
    'COVID-19 Test': ['RT-PCR', 'Rapid Antigen Test', 'Antibody Test']
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If test name changed, auto-populate amount
    if (name === 'testName' && testPrices[value]) {
      const basePrice = testPrices[value];
      const totalPrice = formData.testType === 'home_collection' 
        ? basePrice + HOME_COLLECTION_FEE 
        : basePrice;
      
      setFormData(prev => ({
        ...prev,
        testName: value,
        amount: totalPrice
      }));
    } else if (name === 'testCategory') {
      // Reset test name and amount when category changes
      setFormData(prev => ({
        ...prev,
        testCategory: value,
        testName: '',
        amount: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle test type change and update amount
  const handleTestTypeChange = (testType) => {
    const baseAmount = formData.testName && testPrices[formData.testName] 
      ? testPrices[formData.testName] 
      : parseFloat(formData.amount) || 0;
    
    const newAmount = testType === 'home_collection' 
      ? (testPrices[formData.testName] || baseAmount) + HOME_COLLECTION_FEE
      : (testPrices[formData.testName] || baseAmount);

    setFormData(prev => ({
      ...prev,
      testType,
      amount: newAmount || prev.amount
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setCollectionAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.testName || !formData.testCategory || 
        !formData.scheduledDate || !formData.scheduledTime || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate time is between 9 AM and 5 PM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(formData.scheduledTime)) {
      toast.error('Invalid time format');
      return;
    }
    
    const [hours, minutes] = formData.scheduledTime.split(':').map(Number);
    if (hours < 9 || hours >= 17) {
      toast.error('Lab test bookings are only available between 9 AM (09:00) and 5 PM (17:00)');
      return;
    }

    // Validate date is not in past
    const selectedDate = new Date(formData.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Scheduled date cannot be in the past');
      return;
    }

    // Validate home collection address if needed
    if (formData.testType === 'home_collection') {
      if (!collectionAddress.street || !collectionAddress.city || !collectionAddress.state || !collectionAddress.pincode) {
        toast.error('Please provide complete collection address for home collection');
        return;
      }
    }

    try {
      setLoading(true);
      
      const bookingData = {
        ...formData,
        ...(formData.testType === 'home_collection' && { collectionAddress })
      };

      const response = await patientAPI.bookLabTest(bookingData);
      
      if (response.success) {
        toast.success('Lab test booked successfully!');
        navigate('/patient/lab-tests');
      } else {
        toast.error(response.message || 'Failed to book lab test');
      }
    } catch (error) {
      console.error('Book lab test error:', error);
      toast.error(error.response?.data?.message || 'Failed to book lab test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Book Lab Test</h1>
          <p className="text-blue-100 text-lg">
            Schedule your diagnostic tests with ease
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Test Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FlaskConical className="w-6 h-6 mr-2 text-blue-600" />
                Test Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="testCategory"
                    value={formData.testCategory}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {testCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Name <span className="text-red-500">*</span>
                  </label>
                  {formData.testCategory && commonTests[formData.testCategory] ? (
                    <select
                      name="testName"
                      value={formData.testName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Test</option>
                      {commonTests[formData.testCategory].map(test => (
                        <option key={test} value={test}>
                          {test} - ₹{testPrices[test] || 'N/A'}
                        </option>
                      ))}
                      <option value="custom">Other (Enter Custom)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="testName"
                      value={formData.testName}
                      onChange={handleChange}
                      placeholder="Enter test name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>

                {/* Show amount field only for custom tests or when no price is available */}
                {(formData.testName === 'custom' || (formData.testName && !testPrices[formData.testName])) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="Enter amount"
                      min="0"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {/* Display total amount */}
                {formData.amount && (
                  <div className="md:col-span-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Total Amount:</span>
                        <span className="text-2xl font-bold text-blue-600">₹{formData.amount}</span>
                      </div>
                      {formData.testType === 'home_collection' && testPrices[formData.testName] && (
                        <div className="mt-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Test Cost:</span>
                            <span>₹{testPrices[formData.testName]}</span>
                          </div>
                          <div className="flex justify-between text-green-600">
                            <span>Home Collection Fee:</span>
                            <span>₹{HOME_COLLECTION_FEE}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="fastingRequired"
                    name="fastingRequired"
                    checked={formData.fastingRequired}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="fastingRequired" className="ml-2 text-sm text-gray-700">
                    Fasting Required
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Schedule & Collection */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-blue-600" />
                Schedule & Collection
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheduled Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                    min="09:00"
                    max="17:00"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Available time: 9:00 AM to 5:00 PM
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Test Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'hospital', icon: Building2, label: 'Hospital Lab Test', desc: 'Visit hospital for test' },
                    { value: 'home_collection', icon: Home, label: 'Home Collection', desc: `Sample collected at home (+₹${HOME_COLLECTION_FEE})` }
                  ].map(option => (
                    <div
                      key={option.value}
                      onClick={() => handleTestTypeChange(option.value)}
                      className={`
                        p-6 border-2 rounded-lg cursor-pointer transition-all
                        ${formData.testType === option.value
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-300 hover:border-blue-300 hover:shadow'
                        }
                      `}
                    >
                      <div className="flex items-center mb-3">
                        <option.icon className={`w-8 h-8 ${formData.testType === option.value ? 'text-blue-600' : 'text-gray-400'}`} />
                        <p className={`ml-3 text-lg font-semibold ${formData.testType === option.value ? 'text-blue-600' : 'text-gray-700'}`}>
                          {option.label}
                        </p>
                      </div>
                      <p className={`text-sm ${formData.testType === option.value ? 'text-blue-600' : 'text-gray-500'}`}>
                        {option.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Home Collection Address */}
              {formData.testType === 'home_collection' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={collectionAddress.street}
                        onChange={handleAddressChange}
                        placeholder="Enter street address"
                        required={formData.testType === 'home_collection'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={collectionAddress.city}
                        onChange={handleAddressChange}
                        placeholder="Enter city"
                        required={formData.testType === 'home_collection'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={collectionAddress.state}
                        onChange={handleAddressChange}
                        placeholder="Enter state"
                        required={formData.testType === 'home_collection'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        value={collectionAddress.pincode}
                        onChange={handleAddressChange}
                        placeholder="Enter pincode"
                        required={formData.testType === 'home_collection'}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Landmark
                      </label>
                      <input
                        type="text"
                        name="landmark"
                        value={collectionAddress.landmark}
                        onChange={handleAddressChange}
                        placeholder="Enter landmark"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Additional Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="w-6 h-6 mr-2 text-blue-600" />
                Additional Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preparation Instructions
                  </label>
                  <textarea
                    name="preparationInstructions"
                    value={formData.preparationInstructions}
                    onChange={handleChange}
                    rows="3"
                    placeholder="E.g., Fast for 8-12 hours before test"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any special requirements or notes"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/patient/lab-tests')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Book Lab Test
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookLabTest;
