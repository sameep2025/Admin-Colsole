import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DisplayTypes = ({ API, onBack }) => {
  const [displayTypes, setDisplayTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type_category: '',
    properties: {},
    responsive: true,
    active: true
  });

  useEffect(() => {
    fetchDisplayTypes();
  }, []);

  const fetchDisplayTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/display-types`);
      setDisplayTypes(response.data);
    } catch (error) {
      console.error('Error fetching display types:', error);
      // Set fallback data if API fails
      setDisplayTypes([
        {
          id: '1',
          name: 'Grid Layout',
          type_category: 'grid',
          responsive: true,
          properties: {
            spacing: 'medium',
            alignment: 'center',
            animation: 'fade'
          },
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'List View',
          type_category: 'list',
          responsive: true,
          properties: {
            spacing: 'compact',
            alignment: 'left',
            animation: 'slide'
          },
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
      if (editingType) {
        await axios.put(`${API}/display-types/${editingType.id}`, formData);
      } else {
        await axios.post(`${API}/display-types`, formData);
      }
      
      setShowModal(false);
      setEditingType(null);
      setFormData({
        name: '',
        description: '',
        type_category: '',
        properties: {},
        responsive: true,
        active: true
      });
      fetchDisplayTypes();
    } catch (error) {
      console.error('Error saving display type:', error);
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      type_category: type.type_category || '',
      properties: type.properties || {},
      responsive: type.responsive,
      active: type.active
    });
    setShowModal(true);
  };

  const handleDelete = async (typeId) => {
    if (window.confirm('Are you sure you want to delete this display type?')) {
      try {
        await axios.delete(`${API}/display-types/${typeId}`);
        fetchDisplayTypes();
      } catch (error) {
        console.error('Error deleting display type:', error);
      }
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manage Display Types</h2>
          <p className="mt-2 text-gray-600">Configure how content and categories are displayed</p>
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
            onClick={() => {
              setEditingType(null);
              setFormData({
                name: '',
                description: '',
                type_category: '',
                properties: {},
                responsive: true,
                active: true
              });
              setShowModal(true);
            }}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Add Display Type
          </button>
        </div>
      </div>

      {/* Remove Coming Soon Notice */}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stats-card stats-card-total">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Display Types</p>
              <p className="text-2xl font-bold">{displayTypes.length}</p>
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
              <p className="text-sm font-medium opacity-90">Active Types</p>
              <p className="text-2xl font-bold">{displayTypes.filter(d => d.active).length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-pending">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Responsive</p>
              <p className="text-2xl font-bold">{displayTypes.filter(d => d.responsive).length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">With Properties</p>
              <p className="text-2xl font-bold">{displayTypes.filter(d => d.properties && Object.keys(d.properties).length > 0).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Display Types Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="text-lg font-semibold text-gray-900">Display Types</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-100">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Responsive</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purple-50">
              {displayTypes.map((type) => (
                <tr key={type.id} className="table-row">
                  <td className="table-cell font-medium">{type.name}</td>
                  <td className="table-cell text-gray-600">{type.description || 'No description'}</td>
                  <td className="table-cell">
                    {type.type_category ? (
                      <span className="badge badge-visible capitalize">{type.type_category}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${type.responsive ? 'badge-visible' : 'badge-hidden'}`}>
                      {type.responsive ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${type.active ? 'badge-visible' : 'badge-hidden'}`}>
                      {type.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell text-gray-600">
                    {new Date(type.created_at).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(type)}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                        title="Edit Type"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(type.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Type"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {displayTypes.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    No display types found. Create your first display type to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Placeholder */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Display Type</h3>
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
              <p className="text-gray-600">Display type configuration form will be available soon.</p>
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

export default DisplayTypes;
