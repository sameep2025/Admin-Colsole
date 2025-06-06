import React, { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Categories from "./components/Categories";
import CategoryVisibility from "./components/CategoryVisibility";
import CategoryModels from "./components/CategoryModels";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Navigation = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'categories', label: 'Manage Categories', icon: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z' },
    { id: 'visibility', label: 'Manage Category Visibility', icon: 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z' },
    { id: 'models', label: 'Manage Category Models', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' }
  ];

  return (
    <nav className="bg-white border-b border-purple-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Category Manager
              </h1>
            </div>
          </div>
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item ${activeTab === item.id ? 'nav-item-active' : 'nav-item-inactive'}`}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('categories');

  const renderContent = () => {
    switch (activeTab) {
      case 'categories':
        return <Categories API={API} />;
      case 'visibility':
        return <CategoryVisibility API={API} />;
      case 'models':
        return <CategoryModels API={API} />;
      default:
        return <Categories API={API} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
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
