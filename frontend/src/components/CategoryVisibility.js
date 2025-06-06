import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryVisibility = ({ API }) => {
  const [visibilitySettings, setVisibilitySettings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    visibility_status: 'visible',
    start_date: '',
    end_date: '',
    rules: {}
  });

  useEffect(() => {
    fetchVisibilitySettings();
    fetchCategories();
  }, []);

  const fetchVisibilitySettings = async () => {
    try {
      const response = await axios.get(`${API}/category-visibility`);
      setVisibilitySettings(response.data);
    } catch (error) {
      console.error('Error fetching visibility settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      };

      if (editingSetting) {
        await axios.put(`${API}/category-visibility/${editingSetting.id}`, submitData);
      } else {
        await axios.post(`${API}/category-visibility`, submitData);
      }
      
      setShowModal(false);
      setEditingSetting(null);
      setFormData({
        category_id: '',
        visibility_status: 'visible',
        start_date: '',
        end_date: '',
        rules: {}
      });
      fetchVisibilitySettings();
    } catch (error) {
      console.error('Error saving visibility setting:', error);
    }
  };

  const handleEdit = (setting) => {
    setEditingSetting(setting);
    setFormData({
      category_id: setting.category_id,
      visibility_status: setting.visibility_status,
      start_date: setting.start_date ? new Date(setting.start_date).toISOString().split('T')[0] : '',
      end_date: setting.end_date ? new Date(setting.end_date).toISOString().split('T')[0] : '',
      rules: setting.rules || {}
    });
    setShowModal(true);
  };

  const handleDelete = async (settingId) => {
    if (window.confirm('Are you sure you want to delete this visibility setting?')) {
      try {
        await axios.delete(`${API}/category-visibility/${settingId}`);
        fetchVisibilitySettings();
      } catch (error) {
        console.error('Error deleting visibility setting:', error);
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  const getStatusBadge = (status) => {
    const badges = {
      visible: 'badge-visible',
      hidden: 'badge-hidden',
      private: 'badge-private',
      public: 'badge-public'
    };
    return `badge ${badges[status] || 'badge-visible'}`;
  };

  const handleBulkVisibilityUpdate = async (status) => {
    const selectedCategories = categories.filter(c => 
      document.getElementById(`category-${c.id}`)?.checked
    );

    if (selectedCategories.length === 0) {
      alert('Please select at least one category');
      return;
    }

    try {
      await Promise.all(selectedCategories.map(category =>
        axios.put(`${API}/categories/${category.id}`, {
          visibility_status: status
        })
      ));
      
      fetchCategories();
      fetchVisibilitySettings();
      // Uncheck all checkboxes
      selectedCategories.forEach(c => {
        const checkbox = document.getElementById(`category-${c.id}`);
        if (checkbox) checkbox.checked = false;
      });
    } catch (error) {
      console.error('Error updating bulk visibility:', error);
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
          <h2 className="text-3xl font-bold text-gray-900">Manage Category Visibility</h2>
          <p className="mt-2 text-gray-600">Control when and how categories are displayed</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Visibility Rule
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
              <p className="text-sm font-medium opacity-90">Total Rules</p>
              <p className="text-2xl font-bold">{visibilitySettings.length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-completed">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Public/Visible</p>
              <p className="text-2xl font-bold">{categories.filter(c => c.visibility_status === 'visible' || c.visibility_status === 'public').length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Hidden/Private</p>
              <p className="text-2xl font-bold">{categories.filter(c => c.visibility_status === 'hidden' || c.visibility_status === 'private').length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-pending">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Scheduled</p>
              <p className="text-2xl font-bold">{visibilitySettings.filter(s => s.start_date || s.end_date).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bulk Visibility Actions</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleBulkVisibilityUpdate('visible')}
              className="btn-success"
            >
              Make Visible
            </button>
            <button
              onClick={() => handleBulkVisibilityUpdate('hidden')}
              className="btn-danger"
            >
              Hide Selected
            </button>
            <button
              onClick={() => handleBulkVisibilityUpdate('private')}
              className="btn-secondary"
            >
              Make Private
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-3 p-3 border border-purple-100 rounded-lg">
              <input
                type="checkbox"
                id={`category-${category.id}`}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor={`category-${category.id}`} className="flex-1 cursor-pointer">
                <span className="font-medium text-gray-900">{category.name}</span>
                <span className={`ml-2 ${getStatusBadge(category.visibility_status)}`}>
                  {category.visibility_status}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Visibility Rules Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="text-lg font-semibold text-gray-900">Visibility Rules</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-100">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purple-50">
              {visibilitySettings.map((setting) => (
                <tr key={setting.id} className="table-row">
                  <td className="table-cell font-medium">{getCategoryName(setting.category_id)}</td>
                  <td className="table-cell">
                    <span className={getStatusBadge(setting.visibility_status)}>
                      {setting.visibility_status}
                    </span>
                  </td>
                  <td className="table-cell">
                    {setting.start_date ? new Date(setting.start_date).toLocaleDateString() : 'No start date'}
                  </td>
                  <td className="table-cell">
                    {setting.end_date ? new Date(setting.end_date).toLocaleDateString() : 'No end date'}
                  </td>
                  <td className="table-cell text-gray-600">
                    {new Date(setting.created_at).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(setting)}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(setting.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibilitySettings.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    No visibility rules found. Create your first rule to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingSetting ? 'Edit Visibility Rule' : 'Add New Visibility Rule'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility Status *</label>
                <select
                  value={formData.visibility_status}
                  onChange={(e) => setFormData({ ...formData, visibility_status: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="form-input"
                  />
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
                  {editingSetting ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryVisibility;
