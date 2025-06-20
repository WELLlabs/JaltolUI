// src/pages/ProfileSetupPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProfileSetupPage = () => {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    organization: '',
    bio: '',
    phone: '',
    designation: '',
    use_case: '',
    interests: []
  });
  const [errors, setErrors] = useState({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/profile-setup');
    }
  }, [isAuthenticated, navigate]);

  // Pre-fill form if user already has some data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        organization: user.organization || '',
        bio: user.bio || ''
      }));
    }
  }, [user]);

  const interestOptions = [
    'Watershed Management',
    'Agricultural Analysis',
    'Climate Impact Assessment',
    'Research & Development',
    'Government Projects',
    'NGO Work',
    'Academic Research',
    'Commercial Agriculture'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization is required';
    }
    
    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }
    
    if (!formData.use_case.trim()) {
      newErrors.use_case = 'Please tell us how you plan to use Jaltol';
    }
    
    if (formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one area of interest';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update user profile
      const result = await updateProfile({
        organization: formData.organization,
        // Store additional data in bio field as JSON for now
        // In production, you'd want to add these fields to the Member model
        bio: JSON.stringify({
          bio: formData.bio,
          phone: formData.phone,
          designation: formData.designation,
          use_case: formData.use_case,
          interests: formData.interests
        })
      });
      
      if (result.success) {
        // Redirect to pricing page after successful profile setup
        navigate('/my-projects');
      } else {
        setErrors({ submit: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/my-projects');
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Complete Your Profile
              </h1>
              <p className="text-gray-600">
                Help us understand how you&apos;ll use Jaltol to provide you with the best experience
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Organization */}
              <div>
                <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization *
                </label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  value={formData.organization}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 ${
                    errors.organization ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Your organization name"
                />
                {errors.organization && (
                  <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
                )}
              </div>

              {/* Designation */}
              <div>
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                  Designation *
                </label>
                <input
                  id="designation"
                  name="designation"
                  type="text"
                  value={formData.designation}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 ${
                    errors.designation ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Your role/designation"
                />
                {errors.designation && (
                  <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="+91 9999999999"
                />
              </div>

              {/* Use Case */}
              <div>
                <label htmlFor="use_case" className="block text-sm font-medium text-gray-700 mb-1">
                  How do you plan to use Jaltol? *
                </label>
                <textarea
                  id="use_case"
                  name="use_case"
                  rows={4}
                  value={formData.use_case}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-500 ${
                    errors.use_case ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Please describe your use case..."
                />
                {errors.use_case && (
                  <p className="mt-1 text-sm text-red-600">{errors.use_case}</p>
                )}
              </div>

              {/* Areas of Interest */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Areas of Interest *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {interestOptions.map((interest) => (
                    <label
                      key={interest}
                      className={`flex items-center space-x-3 cursor-pointer p-3 rounded-md border transition-colors ${
                        formData.interests.includes(interest)
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200'
                      }`}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(interest)}
                          onChange={() => handleInterestToggle(interest)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          formData.interests.includes(interest)
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300'
                        }`}>
                          {formData.interests.includes(interest) && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium">{interest}</span>
                    </label>
                  ))}
                </div>
                {errors.interests && (
                  <p className="mt-2 text-sm text-red-600">{errors.interests}</p>
                )}
              </div>

              {/* Error message */}
              {errors.submit && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors bg-white border border-gray-300"
                >
                  Skip for now
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    isLoading
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? 'Saving...' : 'Complete Setup'}
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

export default ProfileSetupPage;