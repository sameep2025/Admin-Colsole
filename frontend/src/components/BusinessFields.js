import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BusinessFields = ({ API, onBack }) => {
  const [businessFields, setBusinessFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Placeholder data for demonstration
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setBusinessFields([
        {
          id: '1',
          name: 'Company Name',
          type: 'text',
          required: true,
          validation: {
            min_length: 2,
            max_length: 100
          },
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
          validation: {
            pattern: '^[A-Z0-9]{8,15}$'
          },
          category: 'legal_info',
          order: 2,
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Annual Revenue',
          type: 'number',
          required: false,
          validation: {
            min: 0,
            max: 999999999
          },
          category: 'financial_info',
          order: 3,
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Business Type',
          type: 'select',
          required: true,
          options: ['Corporation', 'LLC', 'Partnership', 'Sole Proprietorship'],
          category: 'basic_info',
          order: 4,
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Website URL',
          type: 'url',
          required: false,
          validation: {
            pattern: '^https?://.*'
          },
          category: 'contact_info',
          order: 5,
          active: true,
          created_at: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const fieldCategories = [
    { id: 'basic_info', name: 'Basic Information', color: 'blue' },
    { id: 'legal_info', name: 'Legal Information', color: 'purple' },
    { id: 'financial_info', name: 'Financial Information', color: 'green' },
    { id: 'contact_info', name: 'Contact Information', color: 'orange' }
  ];

  const getFieldsByCategory = (categoryId) => {
    return businessFields.filter(field => field.category === categoryId);
  };

  const getCategoryColor = (categoryId) => {
    const category = fieldCategories.find(cat => cat.id === categoryId);
    return category ? category.color : 'gray';
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
          <h2 className="text-3xl font-bold text-gray-900">Manage Business Fields</h2>
          <p className="mt-2 text-gray-600">Configure business-specific data fields and validation rules</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Business Field
        </button>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-gray-600 mr-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Feature Coming Soon</h3>
            <p className="text-gray-700">Business field management functionality is under development. This will include custom field creation, validation rules, and business data collection forms.</p>
          </div>
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
              <p className="text-2xl font-bold">{fieldCategories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fields by Category */}
      <div className="space-y-6">
        {fieldCategories.map((category) => {
          const categoryFields = getFieldsByCategory(category.id);
          return (
            <div key={category.id} className="bg-white rounded-2xl shadow-lg border border-purple-100">
              <div className={`px-6 py-4 border-b border-purple-100 bg-gradient-to-r from-${category.color}-50 to-${category.color}-100`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold text-${category.color}-800`}>{category.name}</h3>
                  <span className={`badge badge-visible`}>
                    {categoryFields.length} fields
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {categoryFields.length > 0 ? (
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
                            <span className={`px-2 py-1 bg-${category.color}-100 text-${category.color}-700 rounded text-xs`}>
                              {field.type}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Order:</span>
                            <span className="font-medium">{field.order}</span>
                          </div>
                          
                          {field.options && (
                            <div>
                              <span className="text-gray-600">Options:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {field.options.slice(0, 3).map((option, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                    {option}
                                  </span>
                                ))}
                                {field.options.length > 3 && (
                                  <span className="text-xs text-gray-500">+{field.options.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-3">
                          <button className="text-purple-600 hover:text-purple-800 transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                            </svg>
                          </button>
                          <button className="text-red-600 hover:text-red-800 transition-colors">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No fields in this category yet.</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Placeholder */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Business Field</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
            <div className="text-center py-8">
              <p className="text-gray-600">Business field configuration form will be available soon.</p>
              <button onClick={() => setShowModal(false)} className="btn-primary mt-4">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessFields;
