import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BusinessFields = ({ API, onBack }) => {
  const [businessFields, setBusinessFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview'); // 'overview', 'manage', 'add'
  const [showModal, setShowModal] = useState(false);
  const [showSimpleModal, setShowSimpleModal] = useState(false); // For simple Add New Business Fields
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'text',
    required: false,
    category: 'general',
    order: 0,
    validation: {},
    options: [],
    active: true
  });
  const [simpleFormData, setSimpleFormData] = useState({
    name: '',
    selectedField: ''
  });

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Boolean' },
    { value: 'date', label: 'Date' },
    { value: 'email', label: 'Email' },
    { value: 'url', label: 'URL' },
    { value: 'textarea', label: 'Textarea' }
  ];

  const fieldCategories = [
    { value: 'general', label: 'General' },
    { value: 'basic_info', label: 'Basic Information' },
    { value: 'legal_info', label: 'Legal Information' },
    { value: 'financial_info', label: 'Financial Information' },
    { value: 'contact_info', label: 'Contact Information' }
  ];

  useEffect(() => {
    fetchBusinessFields();
  }, []);

  const fetchBusinessFields = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/business-fields`);
      setBusinessFields(response.data);
    } catch (error) {
      console.error('Error fetching business fields:', error);
      // Set fallback data if API fails
      setBusinessFields([
        {
          id: '1',
          name: 'Company Name',
          type: 'text',
          required: true,
          category: 'basic_info',
          order: 1,
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Business Registration Number',
          type: 'text',
          required: true,
          category: 'legal_info',
          order: 2,
          active: true,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingField) {
        await axios.put(`${API}/business-fields/${editingField.id}`, formData);
      } else {
        await axios.post(`${API}/business-fields`, formData);
      }
      
      setShowModal(false);
      setEditingField(null);
      setFormData({
        name: '',
        type: 'text',
        required: false,
        category: 'general',
        order: 0,
        validation: {},
        options: [],
        active: true
      });
      fetchBusinessFields();
    } catch (error) {
      console.error('Error saving business field:', error);
    }
  };

  const handleSimpleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Find the selected field to copy its properties
      const selectedField = businessFields.find(field => field.id === simpleFormData.selectedField);
      if (!selectedField) {
        alert('Please select a field template');
        return;
      }

      // Create new field based on selected field template but with new name
      const newFieldData = {
        name: simpleFormData.name,
        type: selectedField.type,
        required: selectedField.required,
        category: selectedField.category,
        order: businessFields.length + 1,
        validation: selectedField.validation || {},
        options: selectedField.options || [],
        active: true
      };

      await axios.post(`${API}/business-fields`, newFieldData);
      
      setShowSimpleModal(false);
      setSimpleFormData({
        name: '',
        selectedField: ''
      });
      fetchBusinessFields();
    } catch (error) {
      console.error('Error saving business field:', error);
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      type: field.type,
      required: field.required,
      category: field.category,
      order: field.order,
      validation: field.validation || {},
      options: field.options || [],
      active: field.active
    });
    setShowModal(true);
  };

  const handleDelete = async (fieldId) => {
    if (window.confirm('Are you sure you want to delete this business field?')) {
      try {
        await axios.delete(`${API}/business-fields/${fieldId}`);
        fetchBusinessFields();
      } catch (error) {
        console.error('Error deleting business field:', error);
      }
    }
  };

  const getCategoryColor = (categoryId) => {
    const colors = {
      'general': 'gray',
      'basic_info': 'blue',
      'legal_info': 'purple',
      'financial_info': 'green',
      'contact_info': 'orange'
    };
    return colors[categoryId] || 'gray';
  };

  const getCategoryName = (categoryId) => {
    const category = fieldCategories.find(cat => cat.value === categoryId);
    return category ? category.label : categoryId;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manage Business Fields</h2>
          <p className="mt-2 text-gray-600">Configure business-specific data fields and validation rules</p>
        </div>
        <div className="flex space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="btn-secondary"
            >
              <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
              Back to Home
            </button>
          )}
          <button
            onClick={() => setActiveView('manage')}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
            </svg>
            Manage Fields
          </button>
          <button
            onClick={() => {
              setSimpleFormData({
                name: '',
                selectedField: businessFields.length > 0 ? businessFields[0].id : ''
              });
              setShowSimpleModal(true);
            }}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Add new Business Fields
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stats-card stats-card-total">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Total Fields</p>
              <p className="text-2xl font-bold">{businessFields.length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-completed">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Active Fields</p>
              <p className="text-2xl font-bold">{businessFields.filter(f => f.active).length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-pending">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Required Fields</p>
              <p className="text-2xl font-bold">{businessFields.filter(f => f.required).length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Categories</p>
              <p className="text-2xl font-bold">{[...new Set(businessFields.map(f => f.category))].length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fields by Category */}
      <div className="space-y-6">
        {fieldCategories.map((category) => {
          const categoryFields = businessFields.filter(field => field.category === category.value);
          if (categoryFields.length === 0) return null;
          
          return (
            <div key={category.value} className="bg-white rounded-2xl shadow-lg border border-purple-100">
              <div className={`px-6 py-4 border-b border-purple-100 bg-gradient-to-r from-${getCategoryColor(category.value)}-50 to-${getCategoryColor(category.value)}-100`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold text-${getCategoryColor(category.value)}-800`}>{category.label}</h3>
                  <span className="badge badge-visible">
                    {categoryFields.length} fields
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryFields.map((field) => (
                    <div key={field.id} className="border border-purple-100 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{field.name}</h4>
                        <div className="flex space-x-2">
                          {field.required && (
                            <span className="badge badge-private">Required</span>
                          )}
                          <span className={`badge ${field.active ? 'badge-visible' : 'badge-hidden'}`}>
                            {field.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className={`px-2 py-1 bg-${getCategoryColor(category.value)}-100 text-${getCategoryColor(category.value)}-700 rounded text-xs`}>
                            {field.type}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Order:</span>
                          <span className="font-medium">{field.order}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-3">
                        <button
                          onClick={() => handleEdit(field)}
                          className="text-purple-600 hover:text-purple-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(field.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderManageFields = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manage Fields</h2>
          <p className="mt-2 text-gray-600">View, edit, and manage all business fields</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setActiveView('overview')}
            className="btn-secondary"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
            Back to Overview
          </button>
          <button
            onClick={() => {
              setEditingField(null);
              setFormData({
                name: '',
                type: 'text',
                required: false,
                category: 'general',
                order: businessFields.length + 1,
                validation: {},
                options: [],
                active: true
              });
              setShowModal(true);
            }}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Add new field
          </button>
        </div>
      </div>

      {/* Fields Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="text-lg font-semibold text-gray-900">All Business Fields</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-100">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Field Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Required</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purple-50">
              {businessFields.map((field) => (
                <tr key={field.id} className="table-row">
                  <td className="table-cell">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-sm">
                      {field.order}
                    </span>
                  </td>
                  <td className="table-cell font-medium">{field.name}</td>
                  <td className="table-cell">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                      {field.type}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 bg-${getCategoryColor(field.category)}-100 text-${getCategoryColor(field.category)}-700 rounded text-xs`}>
                      {getCategoryName(field.category)}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${field.required ? 'badge-private' : 'badge-visible'}`}>
                      {field.required ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${field.active ? 'badge-visible' : 'badge-hidden'}`}>
                      {field.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(field)}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                        title="Edit Field"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(field.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Field"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {businessFields.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    No business fields found. Create your first field to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeView === 'overview' && renderOverview()}
      {activeView === 'manage' && renderManageFields()}

      {/* Modal for Add/Edit Field */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingField ? 'Edit Business Field' : 'Add New Field'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-select"
                  >
                    {fieldTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-select"
                  >
                    {fieldCategories.map((category) => (
                      <option key={category.value} value={category.value}>{category.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="form-input"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.required}
                      onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Required Field</span>
                  </label>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingField ? 'Update Field' : 'Create Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simple Modal for Add New Business Fields */}
      {showSimpleModal && (
        <div className="modal-overlay" onClick={() => setShowSimpleModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Business Field</h3>
              <button
                onClick={() => setShowSimpleModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {businessFields.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No existing fields</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You need to create some fields first using "Manage Fields" → "Add new field"
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setShowSimpleModal(false);
                      setActiveView('manage');
                    }}
                    className="btn-primary"
                  >
                    Go to Manage Fields
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSimpleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field Name *
                  </label>
                  <input
                    type="text"
                    value={simpleFormData.name}
                    onChange={(e) => setSimpleFormData({ ...simpleFormData, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter field name"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter a unique name for your new business field
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Field Template *
                  </label>
                  <select
                    value={simpleFormData.selectedField}
                    onChange={(e) => setSimpleFormData({ ...simpleFormData, selectedField: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="">Choose a field template...</option>
                    {businessFields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name} ({field.type} - {getCategoryName(field.category)})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    Select an existing field to use as a template (type, category, and settings will be copied)
                  </p>
                </div>

                {/* Preview selected field */}
                {simpleFormData.selectedField && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-purple-900 mb-2">Template Preview:</h4>
                    {(() => {
                      const selectedField = businessFields.find(f => f.id === simpleFormData.selectedField);
                      return selectedField ? (
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-purple-700">Type:</span>
                            <span className="font-medium text-purple-900">{selectedField.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-700">Category:</span>
                            <span className="font-medium text-purple-900">{getCategoryName(selectedField.category)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-purple-700">Required:</span>
                            <span className="font-medium text-purple-900">{selectedField.required ? 'Yes' : 'No'}</span>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowSimpleModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Field
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessFields;
