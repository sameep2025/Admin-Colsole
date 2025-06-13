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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manage Social Handles</h2>
          <p className="mt-2 text-gray-600">Configure social media integration and handles</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Social Handle
        </button>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-2xl p-6">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-pink-600 mr-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-pink-800">Feature Coming Soon</h3>
            <p className="text-pink-700">Social media integration and handle management functionality is under development. This will include automatic posting, engagement tracking, and multi-platform management.</p>
          </div>
        </div>
      </div>

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
              <p className="text-sm font-medium opacity-90">Connected Accounts</p>
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
              <p className="text-2xl font-bold">{socialHandles.reduce((acc, h) => acc + h.followers, 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Engagement Rate</p>
              <p className="text-2xl font-bold">4.2%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Handles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {socialHandles.map((handle) => (
          <div key={handle.id} className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{handle.platform}</h3>
                  <p className="text-sm text-gray-600">{handle.handle}</p>
                </div>
              </div>
              <span className={`badge ${handle.active ? 'badge-visible' : 'badge-hidden'}`}>
                {handle.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Followers:</span>
                <span className="font-medium text-purple-600">{handle.followers.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">URL:</span>
                <a href={handle.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800 truncate">
                  View Profile
                </a>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-purple-100">
              <div className="flex space-x-2">
                <button className="flex-1 btn-secondary text-sm">
                  Edit
                </button>
                <button className="flex-1 btn-primary text-sm">
                  Sync
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Placeholder */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Social Handle</h3>
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
              <p className="text-gray-600">Social handle management form will be available soon.</p>
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

export default SocialHandles;
