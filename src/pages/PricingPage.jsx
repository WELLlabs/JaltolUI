import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PricingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/pricing');
    }
  }, [isAuthenticated, navigate]);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      duration: 'Forever',
      features: [
        'Access to basic maps',
        'View up to 5 villages per month',
        'Basic rainfall data',
        'Community support',
      ],
      limitations: [
        'Limited API calls',
        // 'No data export',
        'No priority support'
      ],
      current: true
    },
    // {
    //   id: 'professional',
    //   name: 'Professional',
    //   price: 999,
    //   duration: 'per month',
    //   features: [
    //     'Unlimited village access',
    //     'Advanced LULC analysis',
    //     'Historical data (2000-present)',
    //     'Data export (CSV, JSON)',
    //     'API access (1000 calls/day)',
    //     'Email support',
    //     'Custom polygon analysis'
    //   ],
    //   limitations: [],
    //   recommended: true
    // },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      duration: 'Contact us',
      features: [
        'Everything in Professional',
        'Unlimited API calls',
        'Custom integrations',
        'Dedicated support',
        'Training sessions',
        'White-label options',
        'SLA guarantee',
        'Custom data sources'
      ],
      limitations: []
    }
  ];

  const handleSelectPlan = async (planId) => {
    if (planId === 'free') {
      // User is already on free plan
      return;
    }

    if (planId === 'enterprise') {
      // Redirect to contact form
      window.location.href = 'mailto:welllabs.jaltol@ifmr.ac.in?subject=Enterprise Plan Inquiry';
      return;
    }

    setIsLoading(true);
    setSelectedPlan(planId);
    
    // TODO: Integrate with payment gateway
    setTimeout(() => {
      setIsLoading(false);
      alert('Payment integration coming soon! For now, please contact us at welllabs.jaltol@ifmr.ac.in');
    }, 1000);
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
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
              Get access to advanced features and unlock the full potential of Jaltol
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-lg shadow-lg bg-white overflow-hidden ${
                  plan.recommended ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
                    Recommended
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-6">
                    {typeof plan.price === 'number' ? (
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">
                          ₹{plan.price}
                        </span>
                        <span className="ml-2 text-gray-600">
                          {plan.duration}
                        </span>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Features included:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
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
                  {plan.limitations.length > 0 && (
                    <div className="mb-6">
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="flex items-start">
                            <svg
                              className="h-5 w-5 text-red-500 mr-2 flex-shrink-0"
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
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={plan.current || isLoading}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                      plan.current
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : plan.recommended
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-800 text-white hover:bg-gray-900'
                    }`}
                  >
                    {plan.current
                      ? 'Current Plan'
                      : isLoading && selectedPlan === plan.id
                      ? 'Processing...'
                      : plan.id === 'enterprise'
                      ? 'Contact Sales'
                      : 'Get Started'}
                  </button>
                </div>
              </div>
            ))}
          </div>

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
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-gray-600">
                  We accept all major credit cards, debit cards, and UPI payments. For enterprise plans, we also support bank transfers.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Is there a trial period?
                </h3>
                <p className="text-gray-600">
                  Yes, Professional plan comes with a 14-day free trial. No credit card required.
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