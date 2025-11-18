// frontend/src/pages/admin/ManageLabTests.jsx
import { useState, useEffect } from 'react';
import { FlaskConical, Search, Filter, Eye, Upload, Clock, CheckCircle, XCircle } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/helpers';

const ManageLabTests = () => {
  const [labTests, setLabTests] = useState([]);
  const [filteredLabTests, setFilteredLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLabTest, setSelectedLabTest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resultFormData, setResultFormData] = useState({
    reportFile: '',
    remarks: '',
    testResults: [{ parameter: '', value: '', unit: '', referenceRange: '', status: 'normal' }]
  });

  useEffect(() => {
    fetchLabTests();
  }, []);

  useEffect(() => {
    filterLabTests();
  }, [labTests, searchQuery, statusFilter]);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllLabTests({ _t: Date.now() });
      if (response.success) {
        setLabTests(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load lab tests:', error);
      toast.error('Failed to load lab tests');
    } finally {
      setLoading(false);
    }
  };

  const filterLabTests = () => {
    let filtered = [...labTests];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(test => test.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (test) => {
          const patientName = test.patient?.user?.firstName && test.patient?.user?.lastName
            ? `${test.patient.user.firstName} ${test.patient.user.lastName}`
            : '';
          return test.labTestId?.toLowerCase().includes(query) ||
            test.testName?.toLowerCase().includes(query) ||
            patientName.toLowerCase().includes(query) ||
            test.labName?.toLowerCase().includes(query);
        }
      );
    }

    setFilteredLabTests(filtered);
  };

  const getDaysUntilResultsReady = (scheduledDate) => {
    const scheduled = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    scheduled.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - scheduled) / (1000 * 60 * 60 * 24));
    const daysRemaining = 2 - daysDiff;
    
    return { daysDiff, daysRemaining, canUpdate: daysDiff >= 2 };
  };

  const handleViewDetails = (labTest) => {
    setSelectedLabTest(labTest);
    setShowDetailsModal(true);
  };

  const handleUploadResult = (labTest) => {
    const { canUpdate, daysRemaining } = getDaysUntilResultsReady(labTest.scheduledDate);
    
    if (!canUpdate) {
      toast.error(`Results can only be updated after 2 days. ${daysRemaining} day(s) remaining.`);
      return;
    }

    setSelectedLabTest(labTest);
    setResultFormData({
      reportFile: '',
      remarks: '',
      testResults: [{ parameter: '', value: '', unit: '', referenceRange: '', status: 'normal' }]
    });
    setShowResultModal(true);
  };

  const handleResultFormChange = (field, value) => {
    setResultFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTestResult = () => {
    setResultFormData(prev => ({
      ...prev,
      testResults: [...prev.testResults, { parameter: '', value: '', unit: '', referenceRange: '', status: 'normal' }]
    }));
  };

  const removeTestResult = (index) => {
    setResultFormData(prev => ({
      ...prev,
      testResults: prev.testResults.filter((_, i) => i !== index)
    }));
  };

  const updateTestResult = (index, field, value) => {
    setResultFormData(prev => ({
      ...prev,
      testResults: prev.testResults.map((result, i) => 
        i === index ? { ...result, [field]: value } : result
      )
    }));
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    
    // Validate test results
    const validResults = resultFormData.testResults.filter(
      result => result.parameter && result.value
    );

    if (validResults.length === 0) {
      toast.error('Please add at least one test result');
      return;
    }

    try {
      setUploading(true);
      const response = await adminAPI.updateLabTestResult(selectedLabTest._id, {
        reportFile: resultFormData.reportFile,
        remarks: resultFormData.remarks,
        testResults: validResults
      });

      if (response.success) {
        toast.success('Lab test result uploaded successfully! Patient has been notified.');
        setShowResultModal(false);
        fetchLabTests();
      } else {
        toast.error(response.message || 'Failed to upload result');
      }
    } catch (error) {
      console.error('Upload result error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload result');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusUpdate = async (labTestId, newStatus) => {
    try {
      const response = await adminAPI.updateLabTestStatus(labTestId, { status: newStatus });
      if (response.success) {
        toast.success(`Lab test status updated to ${newStatus}`);
        fetchLabTests();
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Scheduled' },
      sample_collected: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Sample Collected' },
      processing: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Processing' },
      report_ready: { bg: 'bg-green-100', text: 'text-green-800', label: 'Report Ready' },
      delivered: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Delivered' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    return status === 'paid' ? (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
        Paid
      </span>
    ) : (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
        Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FlaskConical className="w-8 h-8 text-primary-600" />
                Manage Lab Tests
              </h1>
              <p className="mt-2 text-gray-600">
                View and manage all lab test bookings and results
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold text-gray-900">{labTests.length}</p>
                </div>
                <FlaskConical className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {labTests.filter(t => t.status === 'scheduled').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Processing</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {labTests.filter(t => ['sample_collected', 'processing'].includes(t.status)).length}
                  </p>
                </div>
                <Filter className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {labTests.filter(t => ['report_ready', 'delivered'].includes(t.status)).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by ID, test name, patient name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="sample_collected">Sample Collected</option>
                <option value="processing">Processing</option>
                <option value="report_ready">Report Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lab Tests Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLabTests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No lab tests found
                    </td>
                  </tr>
                ) : (
                  filteredLabTests.map((labTest) => {
                    const { canUpdate, daysRemaining } = getDaysUntilResultsReady(labTest.scheduledDate);
                    const patientName = labTest.patient?.user 
                      ? `${labTest.patient.user.firstName} ${labTest.patient.user.lastName}`
                      : 'N/A';

                    return (
                      <tr key={labTest._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-primary-600">
                            {labTest.labTestId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{patientName}</div>
                          <div className="text-sm text-gray-500">{labTest.patient?.user?.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{labTest.testName}</div>
                          <div className="text-sm text-gray-500">{labTest.category}</div>
                          <div className="text-sm text-gray-500">{labTest.labName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(labTest.scheduledDate)}
                          </div>
                          <div className="text-sm text-gray-500">{labTest.scheduledTime}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(labTest.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentBadge(labTest.paymentStatus)}
                          <div className="text-sm text-gray-900 mt-1">₹{labTest.amount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {canUpdate ? (
                            <span className="flex items-center text-sm text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Ready to upload
                            </span>
                          ) : (
                            <span className="flex items-center text-sm text-orange-600">
                              <Clock className="w-4 h-4 mr-1" />
                              {daysRemaining} day(s) remaining
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetails(labTest)}
                              className="text-primary-600 hover:text-primary-900"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleUploadResult(labTest)}
                              disabled={!canUpdate || labTest.status === 'report_ready' || labTest.status === 'delivered'}
                              className={`${
                                canUpdate && labTest.status !== 'report_ready' && labTest.status !== 'delivered'
                                  ? 'text-green-600 hover:text-green-900'
                                  : 'text-gray-400 cursor-not-allowed'
                              }`}
                              title={canUpdate ? 'Upload Result' : `Wait ${daysRemaining} more day(s)`}
                            >
                              <Upload className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Lab Test Details"
        size="large"
      >
        {selectedLabTest && (
          <div className="space-y-6">
            {/* Test Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Test ID</label>
                  <p className="text-gray-900">{selectedLabTest.labTestId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Test Name</label>
                  <p className="text-gray-900">{selectedLabTest.testName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="text-gray-900">{selectedLabTest.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedLabTest.status)}</div>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Patient Name</label>
                  <p className="text-gray-900">
                    {selectedLabTest.patient?.user 
                      ? `${selectedLabTest.patient.user.firstName} ${selectedLabTest.patient.user.lastName}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Contact</label>
                  <p className="text-gray-900">{selectedLabTest.patient?.user?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedLabTest.patient?.user?.email || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Lab and Schedule Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lab & Schedule</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Lab Name</label>
                  <p className="text-gray-900">{selectedLabTest.labName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Test Type</label>
                  <p className="text-gray-900 capitalize">{selectedLabTest.testType?.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Scheduled Date</label>
                  <p className="text-gray-900">{formatDate(selectedLabTest.scheduledDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Scheduled Time</label>
                  <p className="text-gray-900">{selectedLabTest.scheduledTime}</p>
                </div>
              </div>
            </div>

            {/* Home Collection Address */}
            {selectedLabTest.testType === 'home_collection' && selectedLabTest.homeCollectionAddress && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Address</h3>
                <p className="text-gray-900">
                  {selectedLabTest.homeCollectionAddress.street}, {selectedLabTest.homeCollectionAddress.city}<br />
                  {selectedLabTest.homeCollectionAddress.state} - {selectedLabTest.homeCollectionAddress.zipCode}<br />
                  Landmark: {selectedLabTest.homeCollectionAddress.landmark || 'N/A'}
                </p>
              </div>
            )}

            {/* Test Requirements */}
            {(selectedLabTest.fastingRequired || selectedLabTest.preparationInstructions) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Requirements</h3>
                <div className="space-y-2">
                  {selectedLabTest.fastingRequired && (
                    <p className="text-gray-900">
                      <span className="font-medium">Fasting Required:</span> Yes
                    </p>
                  )}
                  {selectedLabTest.preparationInstructions && (
                    <div>
                      <span className="font-medium text-gray-900">Preparation Instructions:</span>
                      <p className="text-gray-700 mt-1">{selectedLabTest.preparationInstructions}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount</label>
                  <p className="text-gray-900 text-xl font-semibold">₹{selectedLabTest.amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Payment Status</label>
                  <div className="mt-1">{getPaymentBadge(selectedLabTest.paymentStatus)}</div>
                </div>
              </div>
            </div>

            {/* Test Results */}
            {selectedLabTest.testResults && selectedLabTest.testResults.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedLabTest.testResults.map((result, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">{result.parameter}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-semibold">{result.value}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{result.unit}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{result.referenceRange}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              result.status === 'normal' ? 'bg-green-100 text-green-800' :
                              result.status === 'abnormal' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {result.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {selectedLabTest.remarks && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700">Remarks</label>
                    <p className="text-gray-900 mt-1">{selectedLabTest.remarks}</p>
                  </div>
                )}
              </div>
            )}

            {/* Status Update Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
              <div className="flex gap-2 flex-wrap">
                {['scheduled', 'sample_collected', 'processing', 'delivered', 'cancelled'].map((status) => (
                  <Button
                    key={status}
                    variant={selectedLabTest.status === status ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => handleStatusUpdate(selectedLabTest._id, status)}
                    disabled={selectedLabTest.status === status}
                  >
                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Result Modal */}
      <Modal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        title="Upload Lab Test Result"
        size="large"
      >
        <form onSubmit={handleSubmitResult} className="space-y-6">
          {/* Report File URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report File URL (Optional)
            </label>
            <input
              type="url"
              value={resultFormData.reportFile}
              onChange={(e) => handleResultFormChange('reportFile', e.target.value)}
              placeholder="https://example.com/report.pdf"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Enter URL to the uploaded report file</p>
          </div>

          {/* Test Results */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Results *
            </label>
            {resultFormData.testResults.map((result, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Parameter *</label>
                    <input
                      type="text"
                      value={result.parameter}
                      onChange={(e) => updateTestResult(index, 'parameter', e.target.value)}
                      placeholder="e.g., Hemoglobin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Value *</label>
                    <input
                      type="text"
                      value={result.value}
                      onChange={(e) => updateTestResult(index, 'value', e.target.value)}
                      placeholder="e.g., 14.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={result.unit}
                      onChange={(e) => updateTestResult(index, 'unit', e.target.value)}
                      placeholder="e.g., g/dL"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Reference Range</label>
                    <input
                      type="text"
                      value={result.referenceRange}
                      onChange={(e) => updateTestResult(index, 'referenceRange', e.target.value)}
                      placeholder="e.g., 12-16"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={result.status}
                      onChange={(e) => updateTestResult(index, 'status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="normal">Normal</option>
                      <option value="abnormal">Abnormal</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    {resultFormData.testResults.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="small"
                        onClick={() => removeTestResult(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={addTestResult}
            >
              + Add Another Parameter
            </Button>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks (Optional)
            </label>
            <textarea
              value={resultFormData.remarks}
              onChange={(e) => handleResultFormChange('remarks', e.target.value)}
              rows={4}
              placeholder="Any additional notes or recommendations..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowResultModal(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={uploading}
            >
              Upload Result
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageLabTests;
