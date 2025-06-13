import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DisplayTypes = ({ API, onBack }) => {
  const [displayTypes, setDisplayTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Placeholder data for demonstration
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setDisplayTypes([
        {
          id: '1',
          name: 'Grid Layout',
          type: 'grid',
          columns: 3,
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
          type: 'list',
          columns: 1,
          responsive: true,
          properties: {
            spacing: 'compact',
            alignment: 'left',
            animation: 'slide'
          },
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Card Carousel',
          type: 'carousel',
          columns: 4,
          responsive: true,
          properties: {
            spacing: 'large',
            alignment: 'center',
            animation: 'carousel',
            autoplay: true
          },
          active: false,
          created_at: new Date().toISOString()
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

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
          <h2 className="text-3xl font-bold text-gray-900">Manage Display Types</h2>
          <p className="mt-2 text-gray-600">Configure how content and categories are displayed</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Display Type
        </button>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-indigo-600 mr-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-indigo-800">Feature Coming Soon</h3>
            <p className="text-indigo-700">Display type management functionality is under development. This will include layout templates, responsive design options, and custom display configurations.</p>
          </div>
        </div>
      </div>

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
              <p className="text-sm font-medium opacity-90">Active Layouts</p>
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
              <p className="text-sm font-medium opacity-90">Responsive Types</p>
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
              <p className="text-sm font-medium opacity-90">Custom Layouts</p>
              <p className="text-2xl font-bold">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Display Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayTypes.map((display) => (
          <div key={display.id} className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">{display.name}</h3>
                  <p className="text-sm text-gray-600">{display.type}</p>
                </div>
              </div>
              <span className={`badge ${display.active ? 'badge-visible' : 'badge-hidden'}`}>
                {display.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Columns:</span>
                <span className="font-medium text-purple-600">{display.columns}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Responsive:</span>
                <span className={`badge ${display.responsive ? 'badge-visible' : 'badge-hidden'}`}>
                  {display.responsive ? 'Yes' : 'No'}
                </span>
              </div>

              <div className="pt-2">
                <span className="text-sm text-gray-600 mb-2 block">Properties:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-xs bg-purple-50 rounded p-2">
                    <span className="font-medium text-purple-700">Spacing:</span>
                    <span className="text-gray-600 ml-1">{display.properties.spacing}</span>
                  </div>
                  <div className="text-xs bg-purple-50 rounded p-2">
                    <span className="font-medium text-purple-700">Align:</span>
                    <span className="text-gray-600 ml-1">{display.properties.alignment}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-purple-100">
              <div className="flex space-x-2">
                <button className="flex-1 btn-secondary text-sm">
                  Edit
                </button>
                <button className="flex-1 btn-primary text-sm">
                  Preview
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Layout Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 text-center">
            <div className="bg-purple-100 rounded-lg h-20 mb-3"></div>
            <p className="text-sm text-gray-600">Grid Layout Preview</p>
          </div>
          <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 text-center">
            <div className="bg-purple-100 rounded-lg h-20 mb-3"></div>
            <p className="text-sm text-gray-600">List Layout Preview</p>
          </div>
          <div className="border-2 border-dashed border-purple-200 rounded-lg p-4 text-center">
            <div className="bg-purple-100 rounded-lg h-20 mb-3"></div>
            <p className="text-sm text-gray-600">Carousel Preview</p>
          </div>
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
