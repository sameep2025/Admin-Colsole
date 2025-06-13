import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SocialHandles = ({ API, onBack }) => {
  const [socialHandles, setSocialHandles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingHandle, setEditingHandle] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    icon_image: '',
    url: '',
    handle: '',
    followers: 0,
    active: true
  });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchSocialHandles();
  }, []);

  const fetchSocialHandles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/social-handles`);
      setSocialHandles(response.data);
    } catch (error) {
      console.error('Error fetching social handles:', error);
      // Set fallback data if API fails
      setSocialHandles([
        {
          id: '1',
          name: 'Instagram',
          handle: '@company_official',
          url: 'https://instagram.com/company_official',
          followers: 15420,
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Twitter',
          handle: '@company',
          url: 'https://twitter.com/company',
          followers: 8930,
          active: true,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setFormData({ ...formData, icon_image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check for duplicates
      const duplicate = socialHandles.find(
        handle => handle.name.toLowerCase() === formData.name.toLowerCase() && 
        (!editingHandle || handle.id !== editingHandle.id)
      );
      
      if (duplicate) {
        alert('A social handle with this name already exists!');
        return;
      }

      if (editingHandle) {
        await axios.put(`${API}/social-handles/${editingHandle.id}`, formData);
      } else {
        await axios.post(`${API}/social-handles`, formData);
      }
      
      setShowModal(false);
      setEditingHandle(null);
      setFormData({
        name: '',
        icon_image: '',
        url: '',
        handle: '',
        followers: 0,
        active: true
      });
      setImagePreview('');
      fetchSocialHandles();
    } catch (error) {
      console.error('Error saving social handle:', error);
      if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      }
    }
  };

  const handleEdit = (handle) => {
    setEditingHandle(handle);
    setFormData({
      name: handle.name,
      icon_image: handle.icon_image || '',
      url: handle.url || '',
      handle: handle.handle || '',
      followers: handle.followers || 0,
      active: handle.active
    });
    setImagePreview(handle.icon_image || '');
    setShowModal(true);
  };

  const handleDelete = async (handleId) => {
    if (window.confirm('Are you sure you want to delete this social handle?')) {
      try {
        await axios.delete(`${API}/social-handles/${handleId}`);
        fetchSocialHandles();
      } catch (error) {
        console.error('Error deleting social handle:', error);
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
          <h2 className="text-3xl font-bold text-gray-900">Manage Social Handles</h2>
          <p className="mt-2 text-gray-600">Configure social media integration and handles</p>
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
              setEditingHandle(null);
              setFormData({
                name: '',
                icon_image: '',
                url: '',
                handle: '',
                followers: 0,
                active: true
              });
              setImagePreview('');
              setShowModal(true);
            }}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Add New Handle
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
                <path d="M16 4l-4 4V6a8 8 0 0 0-8 8c0 .2 0 .4.02.6l-2.02-.6C2 13.8 2 13.9 2 14c0 5.5 4.5 10 10 10s10-4.5 10-10c0-2.3-.8-4.4-2.1-6.1L16 4zm-6 14c-4.4 0-8-3.6-8-8 0-.7.1-1.4.3-2l2.7.8V11c0 2.8 2.2 5 5 5h2v2c-1.1 0-2 .9-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Total Handles</p>
              <p className="text-2xl font-bold">{socialHandles.length}</p>
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
              <p className="text-sm font-medium opacity-90">Active Handles</p>
              <p className="text-2xl font-bold">{socialHandles.filter(h => h.active).length}</p>
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
              <p className="text-sm font-medium opacity-90">Total Followers</p>
              <p className="text-2xl font-bold">{socialHandles.reduce((acc, h) => acc + (h.followers || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">With Icons</p>
              <p className="text-2xl font-bold">{socialHandles.filter(h => h.icon_image).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Handles Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="text-lg font-semibold text-gray-900">Social Handles</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-100">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Icon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Handle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Followers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purple-50">
              {socialHandles.map((handle) => (
                <tr key={handle.id} className="table-row">
                  <td className="table-cell">
                    {handle.icon_image ? (
                      <img 
                        src={handle.icon_image} 
                        alt={handle.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="table-cell font-medium">{handle.name}</td>
                  <td className="table-cell text-gray-600">{handle.handle || '-'}</td>
                  <td className="table-cell">
                    {handle.url ? (
                      <a href={handle.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 truncate max-w-32 block">
                        View Profile
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className="font-medium text-purple-600">
                      {(handle.followers || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${handle.active ? 'badge-visible' : 'badge-hidden'}`}>
                      {handle.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell text-gray-600">
                    {new Date(handle.created_at).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(handle)}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                        title="Edit Handle"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(handle.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Handle"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {socialHandles.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-500">
                    No social handles found. Create your first handle to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit Social Handle */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingHandle ? 'Edit Social Handle' : 'Add New Social Handle'}
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
              {/* Field 1: Text Input for Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Platform Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Instagram, Twitter, LinkedIn"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter the name of the social media platform
                </p>
              </div>

              {/* Field 2: Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Icon *
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-purple-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="mb-4">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="mx-auto h-24 w-24 rounded-lg object-cover border border-gray-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData({ ...formData, icon_image: '' });
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                      >
                        <span>{imagePreview ? 'Change image' : 'Upload a file'}</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageUpload}
                          required={!editingHandle && !formData.icon_image}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Upload an icon image for the social media platform
                </p>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Handle (Optional)</label>
                  <input
                    type="text"
                    value={formData.handle}
                    onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                    className="form-input"
                    placeholder="@username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Followers (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.followers}
                    onChange={(e) => setFormData({ ...formData, followers: parseInt(e.target.value) || 0 })}
                    className="form-input"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Profile URL (Optional)</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="form-input"
                  placeholder="https://..."
                />
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

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingHandle ? 'Update Handle' : 'Create Handle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialHandles;
