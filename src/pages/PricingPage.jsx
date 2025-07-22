import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PricingPage = () => {
  const { 
    isAuthenticated, 
    availablePlans, 
    userPlan, 
    handleSelectPlan,
    handleChangePlan,
    loading,
    refreshPlanData
  } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pricing');
    }
  }, [isAuthenticated, navigate]);

  // Plan data is automatically loaded by AuthContext when user is authenticated

  const getCurrentPlanName = () => {
    if (userPlan && userPlan.plan) {
      return userPlan.plan.name;
    }
    return null;
  };

  const formatPrice = (plan) => {
    if (plan.price === null) {
      return 'Contact Sales';
    }
    if (plan.price === 0) {
      return 'Free';
    }
    return `₹${plan.price}`;
  };

  const formatDuration = (plan) => {
    if (plan.duration_days === null) {
      return plan.name === 'basic' ? 'Forever' : 'Custom';
    }
    if (plan.duration_days === 30) {
      return 'per month';
    }
    if (plan.duration_days === 365) {
      return 'per year';
    }
    return `${plan.duration_days} days`;
  };

  // Reorder plans: Basic, Pro, Enterprise
  const getOrderedPlans = () => {
    const planOrder = ['basic', 'pro', 'enterprise'];
    return planOrder.map(planName => 
      availablePlans.find(plan => plan.name === planName)
    ).filter(Boolean);
  };

  const getPlanButtonText = (plan) => {
    const currentPlan = getCurrentPlanName();
    
    if (currentPlan === plan.name) {
      return 'Current Plan';
    }
    
    if (plan.name === 'enterprise') {
      return 'Contact Sales';
    }
    
    if (currentPlan && currentPlan !== 'basic' && plan.name === 'basic') {
      return 'Downgrade';
    }
    
    if (currentPlan) {
      return 'Upgrade';
    }
    
    return 'Select Plan';
  };

  const isPlanCurrent = (plan) => {
    return getCurrentPlanName() === plan.name;
  };

  const handleSelectPlanClick = async (plan) => {
    if (isPlanCurrent(plan)) {
      return; // Already on this plan
    }

    if (plan.name === 'enterprise') {
      // Redirect to contact form for enterprise
      window.location.href = 'mailto:welllabs.jaltol@ifmr.ac.in?subject=Enterprise Plan Inquiry&body=Hello, I am interested in the Enterprise plan. Please provide more details.';
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(plan.id);
    setError(null);
    setMessage(null);

    try {
      let result;
      const currentPlan = getCurrentPlanName();
      
      if (currentPlan) {
        // User has a plan, so change it
        result = await handleChangePlan(plan.id);
      } else {
        // User doesn't have a plan, so select one
        result = await handleSelectPlan(plan.id);
      }

      if (result.success) {
        setMessage(result.message);
        // Refresh plan data
        await refreshPlanData();
      } else {
        setError(result.error || 'Failed to update plan');
      }
    } catch (err) {
      console.error('Plan selection error:', err);
      setError('An error occurred while updating your plan');
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen w-screen overflow-x-hidden bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pricing information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Pricing Plans
            </h1>
            <p className="text-xl text-gray-600">
              Choose the perfect plan for your watershed management needs
            </p>
            {userPlan && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800">
                  Current Plan: <span className="font-semibold">{userPlan.plan.display_name}</span>
                  {userPlan.plan.name !== 'basic' && userPlan.end_date && (
                    <span className="ml-2 text-sm">
                      (Active until {new Date(userPlan.end_date).toLocaleDateString()})
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Success/Error Messages */}
          {message && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">{message}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Plans Grid */}
          {getOrderedPlans().length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {getOrderedPlans().map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-lg shadow-lg bg-white overflow-hidden ${
                    plan.name === 'pro' ? 'ring-2 ring-blue-500' : ''
                  } ${
                    isPlanCurrent(plan) ? 'ring-2 ring-green-500 bg-green-50' : ''
                  }`}
                >
                  {plan.name === 'pro' && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
                      Recommended
                    </div>
                  )}

                  {isPlanCurrent(plan) && (
                    <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-sm font-medium">
                      Current Plan
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.display_name}
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          {formatPrice(plan)}
                        </span>
                        {plan.price > 0 && (
                          <span className="ml-2 text-gray-600">
                            {formatDuration(plan)}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-gray-600 mb-6">{plan.description}</p>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Features included:
                      </h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <svg
                              className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limitations */}
                    {plan.limitations && plan.limitations.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Limitations:
                        </h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start">
                              <svg
                                className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                              <span className="text-sm text-gray-500">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSelectPlanClick(plan)}
                      disabled={isPlanCurrent(plan) || (isProcessing && selectedPlan === plan.id)}
                      className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                        isPlanCurrent(plan)
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : plan.name === 'basic'
                          ? 'bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-400'
                          : plan.name === 'pro'
                          ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400'
                      }`}
                    >
                      {isProcessing && selectedPlan === plan.id ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        getPlanButtonText(plan)
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading plans...</p>
            </div>
          )}

          {/* FAQ Section */}
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Can I change plans later?
                </h3>
                <p className="text-gray-600">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be applied immediately, and billing will be adjusted accordingly.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  What happens to my data when I change plans?
                </h3>
                <p className="text-gray-600">
                  All your projects and data are preserved when you change plans. However, access to certain features may be limited based on your new plan.
                </p>
              </div>
              
                              <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    How does the API limit work?
                  </h3>
                  <p className="text-gray-600">
                    API limits reset daily. Basic plan has 50 calls per day, Pro plan has unlimited calls. You&apos;ll receive notifications when approaching your limits.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    What&apos;s included in Enterprise support?
                  </h3>
                  <p className="text-gray-600">
                    Enterprise plan includes dedicated support team, custom integrations, training sessions, SLA guarantees, and white-label options. Contact us for details.
                  </p>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PricingPage; 