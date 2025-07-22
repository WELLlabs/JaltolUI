import { useState } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';

const PlanSelectionModal = ({ isOpen, onClose }) => {
  const { 
    availablePlans, 
    handleSelectPlan
  } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

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

  const handlePlanSelect = async (plan) => {
    if (plan.name === 'enterprise') {
      // Redirect to contact form for enterprise
      window.location.href = 'mailto:welllabs.jaltol@ifmr.ac.in?subject=Enterprise Plan Inquiry&body=Hello, I am interested in the Enterprise plan. Please provide more details.';
      onClose();
      return;
    }

    setIsProcessing(true);
    setSelectedPlanId(plan.id);
    setError(null);

    try {
      const result = await handleSelectPlan(plan.id);
      
      if (result.success) {
        onClose(); // Close modal on success
      } else {
        setError(result.error || 'Failed to select plan');
      }
    } catch (err) {
      console.error('Plan selection error:', err);
      setError('An error occurred while selecting your plan');
    } finally {
      setIsProcessing(false);
      setSelectedPlanId(null);
    }
  };

  const handleSkipForNow = () => {
    // Close the modal but don't select a plan
    onClose();
  };

  if (!isOpen) return null;

  const orderedPlans = getOrderedPlans();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={handleSkipForNow}
        ></div>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Choose Your Plan
              </h3>
              <p className="mt-2 text-gray-600">
                Select a plan to get started with Jaltol&apos;s powerful watershed management tools
              </p>
            </div>
            <button
              onClick={handleSkipForNow}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Plans grid */}
          {orderedPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {orderedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
                    plan.name === 'pro' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {plan.name === 'pro' && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium rounded-bl-lg">
                      Recommended
                    </div>
                  )}

                  <div className="text-center mb-4">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {plan.display_name}
                    </h4>
                    <div className="flex items-center justify-center mb-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(plan)}
                      </span>
                      {plan.price > 0 && (
                        <span className="ml-2 text-gray-600">
                          {formatDuration(plan)}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 text-center">
                    {plan.description}
                  </p>

                  {/* Key features */}
                  <div className="mb-6">
                    <ul className="space-y-2">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <svg
                            className="h-4 w-4 text-green-500 mr-2 flex-shrink-0"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-sm text-gray-500 ml-6">
                          +{plan.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Select button */}
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    disabled={isProcessing}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      plan.name === 'basic'
                        ? 'bg-gray-800 text-white hover:bg-gray-900 disabled:bg-gray-400'
                        : plan.name === 'pro'
                        ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400'
                    }`}
                  >
                    {isProcessing && selectedPlanId === plan.id ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Selecting...
                      </span>
                    ) : plan.name === 'enterprise' ? (
                      'Contact Sales'
                    ) : (
                      'Select Plan'
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading plans...</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              You can change your plan at any time from the pricing page
            </p>
            <button
              onClick={handleSkipForNow}
              className="text-sm text-gray-600 hover:text-gray-800 underline"
              disabled={isProcessing}
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

PlanSelectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default PlanSelectionModal; 