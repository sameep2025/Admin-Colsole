import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategorySignupLevels = ({ API, onBack }) => {
  const [signupLevels, setSignupLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Placeholder data for demonstration
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setSignupLevels([
        {
          id: '1',
          name: 'Basic Signup',
          level: 1,
          requirements: ['Email', 'Password'],
          permissions: ['View Categories', 'Basic Access'],
          verification_required: false,
          auto_approve: true,
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Premium Member',
          level: 2,
          requirements: ['Email', 'Password', 'Phone Number', 'Address'],
          permissions: ['Full Access', 'Premium Features', 'Priority Support'],
          verification_required: true,
          auto_approve: false,
          active: true,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Business Account',
          level: 3,
          requirements: ['Business Email', 'Company Details', 'Tax ID', 'Business License'],
          permissions: ['Business Features', 'API Access', 'Bulk Operations'],
          verification_required: true,
          auto_approve: false,
          active: true,
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
          <h2 className="text-3xl font-bold text-gray-900">Manage Category Signup Levels</h2>
          <p className="mt-2 text-gray-600">Define signup requirements and access levels for categories</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Signup Level
        </button>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-6">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-teal-600 mr-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-teal-800">Feature Coming Soon</h3>
            <p className="text-teal-700">Category signup level management functionality is under development. This will include user registration workflows, access control, and permission management.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stats-card stats-card-total">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v4h2v-7.5c0-.83.67-1.5 1.5-1.5S12 9.67 12 10.5v7.5h2V10c0-2.21-1.79-4-4-4s-4 1.79-4 4v8H4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Signup Levels</p>
              <p className="text-2xl font-bold">{signupLevels.length}</p>
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
              <p className="text-sm font-medium opacity-90">Active Levels</p>
              <p className="text-2xl font-bold">{signupLevels.filter(l => l.active).length}</p>
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
              <p className="text-sm font-medium opacity-90">Auto Approved</p>
              <p className="text-2xl font-bold">{signupLevels.filter(l => l.auto_approve).length}</p>
            </div>
          </div>
        </div>

        <div className="stats-card stats-card-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium opacity-90">Verification Required</p>
              <p className="text-2xl font-bold">{signupLevels.filter(l => l.verification_required).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Signup Levels Table */}
      <div className="table-container">
        <div className="table-header">
          <h3 className="text-lg font-semibold text-gray-900">Signup Levels Overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-purple-100">
            <thead className="bg-purple-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Requirements</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Verification</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purple-50">
              {signupLevels.map((level) => (
                <tr key={level.id} className="table-row">
                  <td className="table-cell">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold">
                      {level.level}
                    </span>
                  </td>
                  <td className="table-cell font-medium">{level.name}</td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {level.requirements.slice(0, 2).map((req, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                          {req}
                        </span>
                      ))}
                      {level.requirements.length > 2 && (
                        <span className="text-xs text-gray-500">+{level.requirements.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex flex-wrap gap-1">
                      {level.permissions.slice(0, 2).map((perm, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                          {perm}
                        </span>
                      ))}
                      {level.permissions.length > 2 && (
                        <span className="text-xs text-gray-500">+{level.permissions.length - 2} more</span>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="space-y-1">
                      <span className={`badge ${level.verification_required ? 'badge-private' : 'badge-visible'}`}>
                        {level.verification_required ? 'Required' : 'Not Required'}
                      </span>
                      <span className={`badge ${level.auto_approve ? 'badge-visible' : 'badge-hidden'}`}>
                        {level.auto_approve ? 'Auto Approve' : 'Manual Review'}
                      </span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${level.active ? 'badge-visible' : 'badge-hidden'}`}>
                      {level.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workflow Diagram */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Signup Workflow</h3>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <span className="text-sm text-gray-600">Registration</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-yellow-600 font-bold">2</span>
            </div>
            <span className="text-sm text-gray-600">Verification</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-green-600 font-bold">3</span>
            </div>
            <span className="text-sm text-gray-600">Access Granted</span>
          </div>
        </div>
      </div>

      {/* Modal Placeholder */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add Signup Level</h3>
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
              <p className="text-gray-600">Signup level configuration form will be available soon.</p>
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

export default CategorySignupLevels;
