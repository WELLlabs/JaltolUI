import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center py-4 px-10 bg-jaltol-blue">
      <div className="text-3xl font-bold text-white">
        <Link to="/">Jaltol</Link>
      </div>
      
      <div className="flex items-center space-x-8">
        {/* Navigation Links */}
        <Link to="/" className="text-xl text-white hover:text-gray-300">Home</Link>
        <Link to="/impact-assessment" className="text-xl text-white hover:text-gray-300">Assess Impact</Link>
        <Link to="/maps-page" className="text-xl text-white hover:text-gray-300">Maps</Link>
        <Link to="/methodology" className="text-xl text-white hover:text-gray-300">Methodology</Link>
        
        {/* Authentication Section */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-white hover:text-gray-300 focus:outline-none"
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
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-medium">{user?.first_name} {user?.last_name}</div>
                  <div className="text-gray-500">{user?.email}</div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
    </nav>
  );
};

export default Navbar;