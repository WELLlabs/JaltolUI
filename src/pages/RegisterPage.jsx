import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { register, googleLogin, error, isAuthenticated, clearError, googleClientId } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (!formData.password_confirm) {
      errors.password_confirm = 'Password confirmation is required';
    } else if (formData.password !== formData.password_confirm) {
      errors.password_confirm = 'Passwords do not match';
    }
    
    if (!acceptTerms) {
      errors.terms = 'You must accept the terms and conditions';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed', formErrors);
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      console.log('Calling register with data:', formData);
      const result = await register(formData);
      console.log('Register result:', result);
      
      if (result.success) {
        // Redirect to profile setup after successful registration
        navigate('/profile-setup');
      } else {
        console.error('Registration failed:', result.error);
        
        // Check if we have field-specific errors from the API
        if (result.details) {
          const apiErrors = {};
          
          // Map API errors to form fields
          if (result.details.username) {
            apiErrors.username = result.details.username[0];
          }
          if (result.details.email) {
            apiErrors.email = result.details.email[0];
          }
          if (result.details.password) {
            apiErrors.password = result.details.password[0];
          }
          if (result.details.password_confirm) {
            apiErrors.password_confirm = result.details.password_confirm[0]; 
          }
          
          // Update the form errors state with API errors
          if (Object.keys(apiErrors).length > 0) {
            setFormErrors(apiErrors);
          }
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('Google sign up success:', credentialResponse);
    setIsLoading(true);
    clearError();

    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        // Always redirect to profile setup after Google sign up
        navigate('/profile-setup');
      }
    } catch (error) {
      console.error('Google sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google sign up failed');
    setFormErrors({ google: 'Google sign up failed. Please try again.' });
  };

  return (
    <div className="h-screen w-screen overflow-x-hidden bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Create your account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Or{' '}
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  sign in to your existing account
                </Link>
              </p>
            </div>

            {/* Google Sign Up Button */}
            <div className="mt-6">
              {googleClientId ? (
                <div className="w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    text="signup_with"
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    width={384}
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 cursor-not-allowed"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Loading Google Sign Up...
                </button>
              )}
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
                </div>
              </div>
            </div>
            
            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* First Name and Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                        formErrors.first_name ? 'border-red-300' : 'border-gray-300'
                      } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white`}
                      placeholder="First Name"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                    {formErrors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.first_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                        formErrors.last_name ? 'border-red-300' : 'border-gray-300'
                      } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white`}
                      placeholder="Last Name"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                    {formErrors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.last_name}</p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                      formErrors.username ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white`}
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                  />
                  {formErrors.username && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                      formErrors.email ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white`}
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                      formErrors.password ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white`}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    required
                    className={`mt-1 appearance-none relative block w-full px-3 py-2 border ${
                      formErrors.password_confirm ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white`}
                    placeholder="Confirm Password"
                    value={formData.password_confirm}
                    onChange={handleChange}
                  />
                  {formErrors.password_confirm && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.password_confirm}</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-center">
                  <input
                    id="accept-terms"
                    name="accept-terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                  />
                  <label htmlFor="accept-terms" className="ml-2 block text-sm text-gray-900">
                    I accept the Terms and Conditions and Privacy Policy
                  </label>
                </div>
                {formErrors.terms && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.terms}</p>
                )}
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {formErrors.google && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{formErrors.google}</div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RegisterPage;