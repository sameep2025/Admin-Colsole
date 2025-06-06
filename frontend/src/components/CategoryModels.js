import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryModels = ({ API }) => {
  const [categoryModels, setCategoryModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fields: []
  });
  const [newField, setNewField] = useState({
    name: '',
    type: 'text',
    required: false,
    default_value: ''
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

  useEffect(() => {
    fetchCategoryModels();
  }, []);

  const fetchCategoryModels = async () => {
    try {
      const response = await axios.get(`${API}/category-models`);
      setCategoryModels(response.data);
    } catch (error) {
      console.error('Error fetching category models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingModel) {
        await axios.put(`${API}/category-models/${editingModel.id}`, formData);
      } else {
        await axios.post(`${API}/category-models`, formData);
      }
      
      setShowModal(false);
      setEditingModel(null);
      setFormData({
        name: '',
        description: '',
        fields: []
      });
      fetchCategoryModels();
    } catch (error) {
      console.error('Error saving category model:', error);
    }
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      description: model.description || '',
      fields: model.fields || []
    });
    setShowModal(true);
  };

  const handleDelete = async (modelId) => {
    if (window.confirm('Are you sure you want to delete this category model?')) {
      try {
        await axios.delete(`${API}/category-models/${modelId}`);
        fetchCategoryModels();
      } catch (error) {
        console.error('Error deleting category model:', error);
      }
    }
  };

  const addField = () => {
    if (newField.name.trim()) {
      setFormData({
        ...formData,
        fields: [...formData.fields, { ...newField }]
      });
      setNewField({
        name: '',
        type: 'text',
        required: false,
        default_value: ''
      });
    }
  };

  const removeField = (index) => {
    const updatedFields = formData.fields.filter((_, i) => i !== index);
    setFormData({ ...formData, fields: updatedFields });
  };

  const duplicateModel = async (model) => {
    try {
      const duplicatedModel = {
        name: `${model.name} (Copy)`,
        description: model.description,
        fields: model.fields
      };
      await axios.post(`${API}/category-models`, duplicatedModel);
      fetchCategoryModels();
    } catch (error) {
      console.error('Error duplicating model:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manage Category Models</h2>
          <p className="mt-2 text-gray-600">Define data structures and templates for your categories</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Model
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stats-card stats-card-total">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Total Models</p>
              <p className="text-2xl font-bold">{categoryModels.length}</p>
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
              <p className="text-sm font-medium opacity-90">With Fields</p>
              <p className="text-2xl font-bold">{categoryModels.filter(m => m.fields && m.fields.length > 0).length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-pending">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Total Fields</p>
              <p className="text-2xl font-bold">{categoryModels.reduce((acc, model) => acc + (model.fields ? model.fields.length : 0), 0)}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Required Fields</p>
              <p className="text-2xl font-bold">{categoryModels.reduce((acc, model) => acc + (model.fields ? model.fields.filter(f => f.required).length : 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryModels.map((model) => (
          <div key={model.id} className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{model.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{model.description || 'No description'}</p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => duplicateModel(model)}
                  className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                  title="Duplicate Model"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleEdit(model)}
                  className="text-purple-600 hover:text-purple-800 transition-colors p-1"
                  title="Edit Model"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(model.id)}
                  className="text-red-600 hover:text-red-800 transition-colors p-1"
                  title="Delete Model"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Fields:</span>
                <span className="font-medium text-purple-600">{model.fields ? model.fields.length : 0}</span>
              </div>
              
              {model.fields && model.fields.length > 0 ? (
                <div className="space-y-1">
                  {model.fields.slice(0, 3).map((field, index) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-purple-50 rounded-lg p-2">
                      <span className="font-medium text-gray-700">{field.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {field.type}
                        </span>
                        {field.required && (
                          <span className="text-red-500" title="Required">*</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {model.fields.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{model.fields.length - 3} more fields
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500 italic text-center py-2">
                  No fields defined
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-purple-100">
              <div className="text-xs text-gray-500">
                Created: {new Date(model.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}

        {categoryModels.length === 0 && (
          <div className="col-span-full text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No category models</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new category model.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingModel ? 'Edit Category Model' : 'Add New Category Model'}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Fields Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Fields</label>
                
                {/* Add New Field */}
                <div className="bg-purple-50 rounded-xl p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Add New Field</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Field Name"
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                        className="form-input text-sm"
                      />
                    </div>
                    
                    <div>
                      <select
                        value={newField.type}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                        className="form-select text-sm"
                      >
                        {fieldTypes.map((type) => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        placeholder="Default Value"
                        value={newField.default_value}
                        onChange={(e) => setNewField({ ...newField, default_value: e.target.value })}
                        className="form-input text-sm"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newField.required}
                          onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Required</span>
                      </label>
                    </div>
                    
                    <div>
                      <button
                        type="button"
                        onClick={addField}
                        className="w-full btn-primary text-sm"
                      >
                        Add Field
                      </button>
                    </div>
                  </div>
                </div>

                {/* Existing Fields */}
                {formData.fields.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Current Fields</h4>
                    {formData.fields.map((field, index) => (
                      <div key={index} className="flex items-center justify-between bg-white border border-purple-200 rounded-lg p-3">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-gray-900">{field.name}</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {field.type}
                          </span>
                          {field.required && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                              Required
                            </span>
                          )}
                          {field.default_value && (
                            <span className="text-sm text-gray-600">
                              Default: {field.default_value}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                  {editingModel ? 'Update Model' : 'Create Model'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryModels;
