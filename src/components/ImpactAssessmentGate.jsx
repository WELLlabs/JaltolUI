import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ImpactAssessmentGate = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, redirect to impact assessment app
    if (isAuthenticated && user) {
      navigate('/impact-assessment/app', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSkip = () => {
    // For now, just redirect to impact assessment app even if not authenticated
    // This allows users to try the features without signing in
    navigate('/impact-assessment/app', { replace: true });
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated, this component will redirect, so we don't show anything
  if (isAuthenticated) {
    return null;
  }

  // Show the friendly gatekeeper page
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto text-center bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100">
        {/* Fun header with emojis */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-2xl font-bold text-blue-700 bg-clip-text mb-3">
            Welcome to Jaltol! 
          </h2>
          <hr className="border-gray-200 mb-3" />
        </div>

        {/* Main message */}
        <div className="mb-6 space-y-3">
          <h2 className="text-lg md:text-base font-semibold text-gray-800 mb-3">
            Are you a registered Jaltol user? 
          </h2>

          <p className="text-sm md:text-sm text-gray-600 leading-relaxed mb-4">
            <strong>If yes:</strong> Sign in to access the complete set of features and save your work!
          </p>

          <p className="text-sm md:text-sm text-gray-600 leading-relaxed mb-6">
            <strong>If not:</strong> Register with us! We'll email you first about new features, datasets, and exciting updates. 
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleSignIn}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm"
            >
              Sign In
            </button>
            <button
              onClick={handleRegister}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm"
            >
              Register
            </button>
          </div>
        </div>

        {/* Skip option */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={handleSkip}
            className="bg-transparent text-black hover:text-gray-700 text-sm underline underline-offset-4 transition-colors duration-200 font-medium"
          >
            Skip for now → Try Impact Assessment
          </button>
        </div>

      </div>
    </div>
  );
};

export default ImpactAssessmentGate;
