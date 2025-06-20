// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center py-4 px-10 bg-jaltol-blue relative">
      <div className="text-3xl font-bold text-white">
        <Link to="/">Jaltol</Link>
      </div>
      
      {/* Mobile menu button */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="md:hidden text-white hover:text-gray-300 focus:outline-none"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {showMobileMenu ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-8">
        {/* Navigation Links */}
        <Link to="/" className="text-xl text-white hover:text-gray-300">Home</Link>
        <Link to="/impact-assessment" className="text-xl text-white hover:text-gray-300">Assess Impact</Link>
        <Link to="/maps-page" className="text-xl text-white hover:text-gray-300">Maps</Link>
        <Link to="/methodology" className="text-xl text-white hover:text-gray-300">Methodology</Link>
        
        {/* My Projects link - only show when authenticated */}
        {isAuthenticated && (
          <Link to="/my-projects" className="text-xl text-white hover:text-gray-300">My Projects</Link>
        )}
        
        {/* Pricing link - only show when authenticated */}
        {/* {isAuthenticated && (
          <Link to="/pricing" className="text-xl text-white hover:text-gray-300">Pricing</Link>
        )} */}
        
        {/* Authentication Section */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-white hover:text-gray-300 focus:outline-none bg-transparent hover:bg-white/10 px-3 py-2 rounded-md transition-colors"
            >
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-jaltol-blue font-semibold text-sm">
                  {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                </span>
              </div>
              <span className="text-xl">
                {user?.first_name || user?.username || 'User'}
              </span>
              <svg 
                className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[10002] border border-gray-200">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200 bg-white">
                  <div className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</div>
                  <div className="text-gray-600">{user?.email}</div>
                </div>
                
                <Link
                  to="/my-projects"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors bg-white"
                  onClick={() => setShowUserMenu(false)}
                >
                  My Projects
                </Link>
                
                <Link
                  to="/profile-setup"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors bg-white"
                  onClick={() => setShowUserMenu(false)}
                >
                  Profile Settings
                </Link>
                
                {/* <Link
                  to="/pricing"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors bg-white"
                  onClick={() => setShowUserMenu(false)}
                >
                  Pricing Plans
                </Link> */}
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors bg-white"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-xl text-white hover:text-gray-300"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-white text-jaltol-blue px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <div className="absolute top-16 left-0 right-0 bg-jaltol-blue shadow-lg z-50 md:hidden">
          <div className="flex flex-col p-4 space-y-4">
            <Link 
              to="/" 
              className="text-xl text-white hover:text-gray-300"
              onClick={() => setShowMobileMenu(false)}
            >
              Home
            </Link>
            <Link 
              to="/impact-assessment" 
              className="text-xl text-white hover:text-gray-300"
              onClick={() => setShowMobileMenu(false)}
            >
              Assess Impact
            </Link>
            <Link 
              to="/maps-page" 
              className="text-xl text-white hover:text-gray-300"
              onClick={() => setShowMobileMenu(false)}
            >
              Maps
            </Link>
            <Link 
              to="/methodology" 
              className="text-xl text-white hover:text-gray-300"
              onClick={() => setShowMobileMenu(false)}
            >
              Methodology
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/my-projects" 
                  className="text-xl text-white hover:text-gray-300"
                  onClick={() => setShowMobileMenu(false)}
                >
                  My Projects
                </Link>
                {/* <Link 
                  to="/pricing" 
                  className="text-xl text-white hover:text-gray-300"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Pricing
                </Link> */}
                <Link 
                  to="/profile-setup" 
                  className="text-xl text-white hover:text-gray-300"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Profile Settings
                </Link>
              </>
            )}
            
            <div className="border-t border-gray-600 pt-4">
              {isAuthenticated ? (
                <>
                  <div className="text-white mb-2">
                    <div className="font-medium">{user?.first_name} {user?.last_name}</div>
                    <div className="text-sm text-gray-300">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowMobileMenu(false);
                    }}
                    className="text-xl text-white hover:text-gray-300"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-4">
                  <Link 
                    to="/login" 
                    className="text-xl text-white hover:text-gray-300"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-white text-jaltol-blue px-4 py-2 rounded-md hover:bg-gray-100 transition-colors text-center"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;