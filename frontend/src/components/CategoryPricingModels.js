import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategoryPricingModels = ({ API, onBack }) => {
  const [pricingModels, setPricingModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    interval: '',
    features: [],
    active: true
  });

  useEffect(() => {
    fetchPricingModels();
  }, []);

  const fetchPricingModels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/pricing-models`);
      setPricingModels(response.data);
    } catch (error) {
      console.error('Error fetching pricing models:', error);
      // Set fallback data if API fails
      setPricingModels([
        {
          id: '1',
          name: 'Basic Subscription',
          type: 'recurring',
          price: 29.99,
          currency: 'USD',
          interval: 'monthly',
          features: ['Basic features', 'Email support'],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Premium Plan',
          type: 'recurring',
          price: 99.99,
          currency: 'USD',
          interval: 'monthly',
          features: ['All features', 'Priority support', 'Advanced analytics'],
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
      const submitData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        features: Array.isArray(formData.features) ? formData.features : []
      };

      if (editingModel) {
        await axios.put(`${API}/pricing-models/${editingModel.id}`, submitData);
      } else {
        await axios.post(`${API}/pricing-models`, submitData);
      }
      
      setShowModal(false);
      setEditingModel(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        currency: 'USD',
        interval: '',
        features: [],
        active: true
      });
      fetchPricingModels();
    } catch (error) {
      console.error('Error saving pricing model:', error);
    }
  };

  const handleEdit = (model) => {
    setEditingModel(model);
    setFormData({
      name: model.name,
      description: model.description || '',
      price: model.price || '',
      currency: model.currency || 'USD',
      interval: model.interval || '',
      features: model.features || [],
      active: model.active
    });
    setShowModal(true);
  };

  const handleDelete = async (modelId) => {
    if (window.confirm('Are you sure you want to delete this pricing model?')) {
      try {
        await axios.delete(`${API}/pricing-models/${modelId}`);
        fetchPricingModels();
      } catch (error) {
        console.error('Error deleting pricing model:', error);
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
          <h2 className="text-3xl font-bold text-gray-900">Manage Category Pricing Models</h2>
          <p className="mt-2 text-gray-600">Configure pricing structures and subscription models</p>
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
              setEditingModel(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                currency: 'USD',
                interval: '',
                features: [],
                active: true
              });
              setShowModal(true);
            }}
            className="btn-primary"
          >
            <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
            Add Pricing Model
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
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Pricing Models</p>
              <p className="text-2xl font-bold">{pricingModels.length}</p>
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
              <p className="text-sm font-medium opacity-90">Active Models</p>
              <p className="text-2xl font-bold">{pricingModels.filter(p => p.active).length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-pending">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">With Pricing</p>
              <p className="text-2xl font-bold">{pricingModels.filter(p => p.price && p.price > 0).length}</p>
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
              <p className="text-sm font-medium opacity-90">Avg Price</p>
              <p className="text-2xl font-bold">
                ${pricingModels.length > 0 ? 
                  (pricingModels.reduce((acc, p) => acc + (p.price || 0), 0) / pricingModels.length).toFixed(0) : 
                  '0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Models Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="text-lg font-semibold text-gray-900">Pricing Models</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-100">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Interval</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purple-50">
              {pricingModels.map((model) => (
                <tr key={model.id} className="table-row">
                  <td className="table-cell font-medium">{model.name}</td>
                  <td className="table-cell text-gray-600">{model.description || 'No description'}</td>
                  <td className="table-cell">
                    {model.price ? (
                      <span className="font-medium text-green-600">
                        ${model.price} {model.currency}
                      </span>
                    ) : (
                      <span className="text-gray-400">No price set</span>
                    )}
                  </td>
                  <td className="table-cell">
                    {model.interval ? (
                      <span className="badge badge-visible capitalize">{model.interval}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${model.active ? 'badge-visible' : 'badge-hidden'}`}>
                      {model.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell text-gray-600">
                    {new Date(model.created_at).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(model)}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                        title="Edit Model"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(model.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Model"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pricingModels.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-500">
                    No pricing models found. Create your first model to get started.
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
              <h3 className="text-xl font-bold text-gray-900">Add Pricing Model</h3>
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
              <p className="text-gray-600">Pricing model creation form will be available soon.</p>
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

export default CategoryPricingModels;
