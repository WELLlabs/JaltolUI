// src/components/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isAuthenticated, user, logout, userPlan } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const getCurrentPlanDisplay = () => {
    if (userPlan && userPlan.plan) {
      return userPlan.plan.display_name;
    }
    return 'Basic'; // Default plan
  };

  const getPlanBadgeColor = () => {
    if (!userPlan || !userPlan.plan) return 'bg-gray-100 text-gray-800';
    
    switch (userPlan.plan.name) {
      case 'pro':
        return 'bg-blue-100 text-blue-800';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-primary text-primary-foreground py-2 px-4 w-full">
      <div className="flex justify-between items-center w-full">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="text-primary-foreground hover:text-warning text-2xl font-bold font-heading">
            Jaltol
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {/* Navigation Links */}
          <Link to="/" className="text-xl text-primary-foreground hover:text-warning">Home</Link>
          <Link to="/impact-assessment" className="text-xl text-primary-foreground hover:text-warning">Assess Impact</Link>
          <Link to="/maps-page" className="text-xl text-primary-foreground hover:text-warning">Maps</Link>
          <Link to="/methodology" className="text-xl text-primary-foreground hover:text-warning">Methodology</Link>
          
          {/* My Projects link - only show when authenticated */}
          {isAuthenticated && (
            <Link to="/my-projects" className="text-xl text-primary-foreground hover:text-warning">My Projects</Link>
          )}
          
          {/* Pricing link - show for everyone */}
          <Link to="/pricing" className="text-xl text-primary-foreground hover:text-warning">Pricing</Link>
          
          {/* Authentication Section */}
          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 bg-surface text-gray-800 hover:bg-surface-variant focus:outline-none px-3 py-2 rounded-lg border border-outline shadow-sm transition-colors"
              >
                <div className="flex items-center space-x-2">
                  {/* User Avatar */}
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* User Info */}
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPlanBadgeColor()}`}>
                        {getCurrentPlanDisplay()}
                      </span>
                    </div>
                  </div>
                  {/* Dropdown Arrow */}
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 text-gray-600 ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-surface rounded-md shadow-lg py-1 z-50 border border-outline">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-outline">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                        </div>
                        <div className="text-xs text-gray-600">{user.email}</div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPlanBadgeColor()}`}>
                            {getCurrentPlanDisplay()} Plan
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <Link
                    to="/my-projects"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-surface-variant hover:text-warning transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    My Projects
                  </Link>
                  <Link
                    to="/pricing"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-surface-variant hover:text-warning transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Pricing & Plans
                  </Link>
                  <Link
                    to="/profile-setup"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-surface-variant hover:text-warning transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Profile Settings
                  </Link>
                  <div className="border-t border-outline"></div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-surface-variant hover:text-warning transition-colors bg-surface border-0"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-primary-foreground hover:text-warning px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-surface text-primary hover:bg-surface-variant hover:text-warning px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-primary-foreground hover:opacity-80 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden mt-4 space-y-2">
          <Link to="/" className="block text-primary-foreground hover:text-warning py-2">Home</Link>
          <Link to="/impact-assessment" className="block text-primary-foreground hover:text-warning py-2">Assess Impact</Link>
          <Link to="/maps-page" className="block text-primary-foreground hover:text-warning py-2">Maps</Link>
          <Link to="/methodology" className="block text-primary-foreground hover:text-warning py-2">Methodology</Link>
          
          {isAuthenticated && (
            <Link to="/my-projects" className="block text-primary-foreground hover:text-warning py-2">My Projects</Link>
          )}
          
          <Link to="/pricing" className="block text-primary-foreground hover:text-warning py-2">Pricing</Link>
          
          {isAuthenticated && user ? (
            <>
              <div className="border-t border-white/30 pt-2 mt-2">
                <div className="flex items-center space-x-3 py-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {user.first_name ? user.first_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-primary-foreground text-sm font-medium">
                      {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPlanBadgeColor()}`}>
                      {getCurrentPlanDisplay()}
                    </span>
                  </div>
                </div>
              </div>
              <Link to="/profile-setup" className="block text-primary-foreground hover:text-warning py-2">Profile Settings</Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-primary-foreground hover:text-warning py-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="border-t border-white/30 pt-2 mt-2 space-y-2">
              <Link to="/login" className="block text-primary-foreground hover:text-warning py-2">Sign In</Link>
              <Link to="/register" className="block text-primary-foreground hover:text-warning py-2">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;