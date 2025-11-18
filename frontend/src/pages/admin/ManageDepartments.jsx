// frontend/src/pages/admin/ManageDepartments.jsx
import { useState, useEffect } from 'react';
import { Building2, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headOfDepartment: '',
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/departments');
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    setEditingDepartment(null);
    setFormData({
      name: '',
      description: '',
      headOfDepartment: '',
    });
    setShowAddModal(true);
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      headOfDepartment: department.headOfDepartment || '',
    });
    setShowAddModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingDepartment) {
        await api.put(`/admin/departments/${editingDepartment._id}`, formData);
        toast.success('Department updated successfully');
      } else {
        await api.post('/admin/departments', formData);
        toast.success('Department added successfully');
      }

      setShowAddModal(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast.error(error.response?.data?.message || 'Failed to save department');
    }
  };

  const handleDelete = async (departmentId) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      await api.delete(`/admin/departments/${departmentId}`);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader type="spinner" size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Building2 className="w-8 h-8 mr-3 text-blue-600" />
                Manage Departments
              </h1>
              <p className="text-gray-600 mt-1">
                Add, edit, or remove hospital departments
              </p>
            </div>
            <Button variant="primary" onClick={handleAdd}>
              <Plus className="w-5 h-5 mr-2" />
              Add Department
            </Button>
          </div>
        </div>

        {/* Departments Grid */}
        {departments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((department) => (
              <div
                key={department._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(department)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(department._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {department.name}
                </h3>

                {department.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {department.description.length > 100
                      ? `${department.description.substring(0, 100)}...`
                      : department.description}
                  </p>
                )}

                {department.headOfDepartment && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Head of Department</p>
                    <p className="text-sm font-medium text-gray-900">
                      {department.headOfDepartment}
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>Active</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    Open
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Departments Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first department to organize your hospital
            </p>
            <Button variant="primary" onClick={handleAdd}>
              <Plus className="w-5 h-5 mr-2" />
              Add Department
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingDepartment ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Department Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Cardiology, Orthopedics"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the department..."
            />
          </div>

          {/* Head of Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Head of Department
            </label>
            <input
              type="text"
              name="headOfDepartment"
              value={formData.headOfDepartment}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Dr. John Smith"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {editingDepartment ? 'Update' : 'Add'} Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageDepartments;