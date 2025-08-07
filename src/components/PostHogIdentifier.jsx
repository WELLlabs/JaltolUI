import { useEffect, useRef } from 'react';
import { usePostHog } from 'posthog-js/react';
import { useAuth } from '../context/AuthContext';

export const PostHogIdentifier = () => {
  const posthog = usePostHog();
  const { user } = useAuth();
  const hasIdentified = useRef(false);

  useEffect(() => {
    if (posthog && user && !hasIdentified.current) {
      console.log('🆔 [POSTHOG_ID] Starting user identification...');
      console.log('🆔 [POSTHOG_ID] User data:', user);
      
      // Identify user with Jaltol user data
      const userId = user.id || user.email || user.sub;
      console.log('🆔 [POSTHOG_ID] Identifying user with ID:', userId);
      
      posthog.identify(userId, {
        email: user.email,
        name: user.name || user.given_name + ' ' + user.family_name,
        first_name: user.given_name || user.name?.split(' ')[0],
        last_name: user.family_name || user.name?.split(' ').slice(1).join(' '),
        user_id: userId,
        platform: 'jaltol_webapp',
        source: 'web_application',
        registration_date: user.created_at || new Date().toISOString(),
        // Add any additional user properties from your auth context
        ...(user.organization && { organization: user.organization }),
        ...(user.role && { role: user.role }),
        ...(user.subscription && { subscription: user.subscription }),
      });
      
      hasIdentified.current = true;
      
      // Verify identification worked
      setTimeout(() => {
        const newId = posthog.get_distinct_id();
        console.log('🆔 [POSTHOG_ID] Verification - New distinct ID:', newId);
        console.log('🆔 [POSTHOG_ID] Identification successful?', newId === userId);
        
        if (newId !== userId) {
          console.error('🆔 [POSTHOG_ID] IDENTIFICATION FAILED - Still using random ID!');
          console.error('🆔 [POSTHOG_ID] Expected:', userId, 'Got:', newId);
        } else {
          console.log('🆔 [POSTHOG_ID] Identification successful! Events should now work in real-time.');
          
          // Test event to verify real-time sending
          console.log('🆔 [POSTHOG_ID] Testing real-time event...');
          posthog.capture('jaltol_user_identification_test', {
            user_id: userId,
            test_type: 'jaltol_identification',
            timestamp: new Date().toISOString()
          });
        }
      }, 100);
    }
  }, [posthog, user]);

  return null; // This component doesn't render anything
}; 