import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Categories from "./components/Categories";
import CategoryVisibility from "./components/CategoryVisibility";
import CategoryModels from "./components/CategoryModels";
import CategoryPricingModels from "./components/CategoryPricingModels";
import SocialHandles from "./components/SocialHandles";
import DisplayTypes from "./components/DisplayTypes";
import CategorySignupLevels from "./components/CategorySignupLevels";
import BusinessFields from "./components/BusinessFields";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomeScreen = ({ setActiveSection }) => {
  const sections = [
    {
      id: 'categories',
      title: 'Manage Categories',
      description: 'Create, edit, and organize your categories',
      icon: 'M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z',
      color: 'from-purple-500 to-indigo-600',
      status: 'active'
    },
    {
      id: 'visibility',
      title: 'Manage Category Visibility',
      description: 'Control when and how categories are displayed',
      icon: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z',
      color: 'from-blue-500 to-cyan-600',
      status: 'active'
    },
    {
      id: 'models',
      title: 'Manage Category Models',
      description: 'Define data structures and templates',
      icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      color: 'from-green-500 to-emerald-600',
      status: 'active'
    },
    {
      id: 'pricing',
      title: 'Manage Category Pricing Models',
      description: 'Set up pricing structures for categories',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z',
      color: 'from-yellow-500 to-orange-600',
      status: 'new'
    },
    {
      id: 'social',
      title: 'Manage Social Handles',
      description: 'Configure social media integration',
      icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
      color: 'from-pink-500 to-rose-600',
      status: 'new'
    },
    {
      id: 'display',
      title: 'Manage Display Types',
      description: 'Configure how content is displayed',
      icon: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z',
      color: 'from-indigo-500 to-purple-600',
      status: 'new'
    },
    {
      id: 'signup',
      title: 'Manage Category Signup Levels',
      description: 'Define signup requirements and levels',
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
      color: 'from-teal-500 to-cyan-600',
      status: 'new'
    },
    {
      id: 'business',
      title: 'Manage Business Fields',
      description: 'Configure business-specific data fields',
      icon: 'M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm6 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z',
      color: 'from-gray-500 to-gray-700',
      status: 'new'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Category Management Hub
            </h1>
            <p className="mt-2 text-xl text-gray-600">
              Comprehensive category and business management platform
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stats-card stats-card-total">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium opacity-90">Total Modules</p>
                <p className="text-2xl font-bold">8</p>
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
                <p className="text-sm font-medium opacity-90">Active Modules</p>
                <p className="text-2xl font-bold">3</p>
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
                <p className="text-sm font-medium opacity-90">New Features</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => setActiveSection(section.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${section.color}`}>
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d={section.icon} />
                  </svg>
                </div>
                {section.status === 'new' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    New
                  </span>
                )}
                {section.status === 'active' && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Active
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {section.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                {section.description}
              </p>
              
              <button className="w-full btn-primary text-sm">
                <span>Open Module</span>
                <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setActiveSection('categories')}
              className="btn-secondary text-sm"
            >
              Add New Category
            </button>
            <button 
              onClick={() => setActiveSection('models')}
              className="btn-secondary text-sm"
            >
              Create Model
            </button>
            <button 
              onClick={() => setActiveSection('visibility')}
              className="btn-secondary text-sm"
            >
              Manage Visibility
            </button>
            <button 
              onClick={() => setActiveSection('pricing')}
              className="btn-secondary text-sm"
            >
              Set Up Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('home');

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomeScreen setActiveSection={setActiveSection} />;
      case 'categories':
        return <Categories API={API} onBack={() => setActiveSection('home')} />;
      case 'visibility':
        return <CategoryVisibility API={API} onBack={() => setActiveSection('home')} />;
      case 'models':
        return <CategoryModels API={API} onBack={() => setActiveSection('home')} />;
      case 'pricing':
        return <CategoryPricingModels API={API} onBack={() => setActiveSection('home')} />;
      case 'social':
        return <SocialHandles API={API} onBack={() => setActiveSection('home')} />;
      case 'display':
        return <DisplayTypes API={API} onBack={() => setActiveSection('home')} />;
      case 'signup':
        return <CategorySignupLevels API={API} onBack={() => setActiveSection('home')} />;
      case 'business':
        return <BusinessFields API={API} onBack={() => setActiveSection('home')} />;
      default:
        return <HomeScreen setActiveSection={setActiveSection} />;
    }
  };

  if (activeSection === 'home') {
    return renderContent();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setActiveSection('home')}
                className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Category Management Hub
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
