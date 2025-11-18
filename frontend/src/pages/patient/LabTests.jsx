// frontend/src/pages/patient/LabTests.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Search, Filter, Plus } from 'lucide-react';
import LabTestCard from '../../components/patient/LabTestCard';
import Button from '../../components/common/Button';
import Loader, { CardLoader } from '../../components/common/Loader';
import { EmptyStateCard } from '../../components/common/Card';
import { patientAPI } from '../../services/api';
import { LAB_TEST_STATUS } from '../../utils/constants';
import toast from 'react-hot-toast';

const LabTests = () => {
  const navigate = useNavigate();
  const [labTests, setLabTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLabTests();
  }, []);

  const fetchLabTests = async () => {
    setLoading(true);
    try {
      const response = await patientAPI.getLabTests();
      
      if (response.success) {
        setLabTests(response.data || []);
      } else {
        toast.error(response.message || 'Failed to fetch lab tests');
      }
    } catch (error) {
      toast.error('Failed to load lab tests');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { 
      id: 'all', 
      label: 'All Tests',
      count: labTests.length 
    },
    { 
      id: 'pending', 
      label: 'Pending',
      count: labTests.filter(t => 
        t.status === 'booked' || 
        t.status === 'sample_collected' ||
        t.status === 'processing'
      ).length 
    },
    { 
      id: 'completed', 
      label: 'Completed',
      count: labTests.filter(t => t.status === 'report_ready' || t.status === 'completed').length 
    },
  ];

  const getFilteredTests = () => {
    let filtered = labTests;

    // Filter by tab
    if (activeTab === 'pending') {
      filtered = filtered.filter(t => 
        t.status === 'booked' || 
        t.status === 'sample_collected' ||
        t.status === 'processing'
      );
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(t => t.status === 'report_ready' || t.status === 'completed');
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.testName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.labTestId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.doctor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.labName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredLabTests = getFilteredTests();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Lab Tests</h1>
              <p className="text-blue-100 text-lg">
                View your lab test results and reports
              </p>
            </div>
            <button
              onClick={() => navigate('/patient/book-lab-test')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow-lg hover:shadow-xl hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              <span>Book Lab Test</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by test name, ID, or doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {searchQuery && (
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition
                    ${activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                  {!loading && (
                    <span className={`
                      ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
                      ${activeTab === tab.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Results Count */}
        {!loading && filteredLabTests.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredLabTests.length}</span>{' '}
              {filteredLabTests.length === 1 ? 'test' : 'tests'}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardLoader count={4} />
          </div>
        )}

        {/* Lab Tests Grid */}
        {!loading && filteredLabTests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredLabTests.map((labTest) => (
              <LabTestCard
                key={labTest._id}
                labTest={labTest}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredLabTests.length === 0 && !searchQuery && (
          <EmptyStateCard
            icon={FlaskConical}
            title={
              activeTab === 'all'
                ? 'No Lab Tests Yet'
                : activeTab === 'pending'
                ? 'No Pending Tests'
                : 'No Completed Tests'
            }
            message={
              activeTab === 'all'
                ? 'You don\'t have any lab tests yet. Tests ordered by your doctor will appear here.'
                : activeTab === 'pending'
                ? 'You don\'t have any pending lab tests at the moment.'
                : 'You don\'t have any completed lab tests yet.'
            }
          />
        )}

        {/* No Results Found */}
        {!loading && filteredLabTests.length === 0 && searchQuery && (
          <EmptyStateCard
            icon={Search}
            title="No Tests Found"
            message="No lab tests match your search. Try different keywords."
            action={
              <Button variant="primary" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default LabTests;