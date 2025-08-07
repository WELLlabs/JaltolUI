import { usePostHog } from 'posthog-js/react';

// Event names for consistency
export const POSTHOG_EVENTS = {
  // Authentication events
  USER_LOGIN: 'user_login',
  USER_REGISTER: 'user_register',
  USER_LOGOUT: 'user_logout',
  
  // Map and navigation events
  MAP_VIEWED: 'map_viewed',
  MAP_INTERACTION: 'map_interaction',
  DISTRICT_SELECTED: 'district_selected',
  VILLAGE_SELECTED: 'village_selected',
  STATE_SELECTED: 'state_selected',
  
  // Data analysis events
  IMPACT_ASSESSMENT_STARTED: 'impact_assessment_started',
  IMPACT_ASSESSMENT_COMPLETED: 'impact_assessment_completed',
  VILLAGE_COMPARISON_STARTED: 'village_comparison_started',
  VILLAGE_COMPARISON_COMPLETED: 'village_comparison_completed',
  
  // Data export and sharing events
  DATA_DOWNLOADED: 'data_downloaded',
  PROJECT_SAVED: 'project_saved',
  PROJECT_SHARED: 'project_shared',
  
  // Feature usage events
  METHODOLOGY_VIEWED: 'methodology_viewed',
  API_DOCUMENTATION_VIEWED: 'api_documentation_viewed',
  PRICING_VIEWED: 'pricing_viewed',
  
  // User journey events
  PAGE_VIEWED: 'page_viewed',
  FEATURE_ACCESSED: 'feature_accessed',
};

// Event properties interfaces
export const createEventProperties = {
  // Authentication events
  userLogin: (method) => ({
    login_method: method, // 'google', 'email', etc.
    timestamp: new Date().toISOString(),
  }),

  userRegister: (method) => ({
    registration_method: method,
    timestamp: new Date().toISOString(),
  }),

  userLogout: () => ({
    timestamp: new Date().toISOString(),
  }),

  // Map and navigation events
  mapViewed: (mapType, filters = {}) => ({
    map_type: mapType, // 'land_cover', 'intervention', 'comparison', etc.
    filters_applied: filters,
    timestamp: new Date().toISOString(),
  }),

  mapInteraction: (interactionType, details = {}) => ({
    interaction_type: interactionType, // 'zoom', 'pan', 'click', 'layer_toggle', etc.
    interaction_details: details,
    timestamp: new Date().toISOString(),
  }),

  locationSelected: (locationType, locationData) => ({
    location_type: locationType, // 'state', 'district', 'village'
    location_name: locationData.name,
    location_id: locationData.id,
    timestamp: new Date().toISOString(),
  }),

  // Data analysis events
  impactAssessmentStarted: (parameters = {}) => ({
    assessment_parameters: parameters,
    timestamp: new Date().toISOString(),
  }),

  impactAssessmentCompleted: (results = {}) => ({
    assessment_results: results,
    timestamp: new Date().toISOString(),
  }),

  villageComparisonStarted: (comparisonType, villages = []) => ({
    comparison_type: comparisonType, // 'land_cover', 'intervention_impact', etc.
    villages_count: villages.length,
    villages_data: villages.map(v => ({ id: v.id, name: v.name })),
    timestamp: new Date().toISOString(),
  }),

  villageComparisonCompleted: (comparisonResults = {}) => ({
    comparison_results: comparisonResults,
    timestamp: new Date().toISOString(),
  }),

  // Data export and sharing events
  dataDownloaded: (dataType, format, filters = {}) => ({
    data_type: dataType, // 'land_cover', 'intervention_data', 'comparison_results', etc.
    download_format: format, // 'csv', 'json', 'pdf', etc.
    filters_applied: filters,
    timestamp: new Date().toISOString(),
  }),

  projectSaved: (projectData = {}) => ({
    project_name: projectData.name,
    project_type: projectData.type,
    project_data: projectData,
    timestamp: new Date().toISOString(),
  }),

  projectShared: (shareMethod, projectData = {}) => ({
    share_method: shareMethod, // 'link', 'email', 'social', etc.
    project_name: projectData.name,
    project_type: projectData.type,
    timestamp: new Date().toISOString(),
  }),

  // Feature usage events
  pageViewed: (pageName, pageData = {}) => ({
    page_name: pageName,
    page_data: pageData,
    timestamp: new Date().toISOString(),
  }),

  featureAccessed: (featureName, featureData = {}) => ({
    feature_name: featureName,
    feature_data: featureData,
    timestamp: new Date().toISOString(),
  }),
};

// Hook for PostHog event tracking
export const usePostHogEvents = () => {
  const posthog = usePostHog();

  const trackEvent = (eventName, eventData = {}) => {
    if (!posthog) {
      console.warn('🎯 [POSTHOG EVENTS] PostHog not available for event:', eventName);
      return;
    }

    // Debug: Check if PostHog is opted in
    const isOptedIn = posthog.has_opted_out_capturing ? !posthog.has_opted_out_capturing() : true;
    console.log('🎯 [POSTHOG EVENTS] PostHog opted in status:', isOptedIn);
    console.log('🎯 [POSTHOG EVENTS] Current distinct ID:', posthog.get_distinct_id());

    console.log('🎯 [POSTHOG EVENTS] Tracking event:', eventName, eventData);
    posthog.capture(eventName, eventData);
    
    // Force immediate sending
    setTimeout(() => {
      if (posthog.flush) {
        posthog.flush();
      }
    }, 100);
  };

  // Authentication tracking methods
  const trackUserLogin = (method) => {
    trackEvent(POSTHOG_EVENTS.USER_LOGIN, createEventProperties.userLogin(method));
  };

  const trackUserRegister = (method) => {
    trackEvent(POSTHOG_EVENTS.USER_REGISTER, createEventProperties.userRegister(method));
  };

  const trackUserLogout = () => {
    trackEvent(POSTHOG_EVENTS.USER_LOGOUT, createEventProperties.userLogout());
  };

  // Map and navigation tracking methods
  const trackMapViewed = (mapType, filters = {}) => {
    trackEvent(POSTHOG_EVENTS.MAP_VIEWED, createEventProperties.mapViewed(mapType, filters));
  };

  const trackMapInteraction = (interactionType, details = {}) => {
    trackEvent(POSTHOG_EVENTS.MAP_INTERACTION, createEventProperties.mapInteraction(interactionType, details));
  };

  const trackLocationSelected = (locationType, locationData) => {
    trackEvent(POSTHOG_EVENTS.DISTRICT_SELECTED, createEventProperties.locationSelected(locationType, locationData));
  };

  // Data analysis tracking methods
  const trackImpactAssessmentStarted = (parameters = {}) => {
    trackEvent(POSTHOG_EVENTS.IMPACT_ASSESSMENT_STARTED, createEventProperties.impactAssessmentStarted(parameters));
  };

  const trackImpactAssessmentCompleted = (results = {}) => {
    trackEvent(POSTHOG_EVENTS.IMPACT_ASSESSMENT_COMPLETED, createEventProperties.impactAssessmentCompleted(results));
  };

  const trackVillageComparisonStarted = (comparisonType, villages = []) => {
    trackEvent(POSTHOG_EVENTS.VILLAGE_COMPARISON_STARTED, createEventProperties.villageComparisonStarted(comparisonType, villages));
  };

  const trackVillageComparisonCompleted = (comparisonResults = {}) => {
    trackEvent(POSTHOG_EVENTS.VILLAGE_COMPARISON_COMPLETED, createEventProperties.villageComparisonCompleted(comparisonResults));
  };

  // Data export and sharing tracking methods
  const trackDataDownloaded = (dataType, format, filters = {}) => {
    trackEvent(POSTHOG_EVENTS.DATA_DOWNLOADED, createEventProperties.dataDownloaded(dataType, format, filters));
  };

  const trackProjectSaved = (projectData = {}) => {
    trackEvent(POSTHOG_EVENTS.PROJECT_SAVED, createEventProperties.projectSaved(projectData));
  };

  const trackProjectShared = (shareMethod, projectData = {}) => {
    trackEvent(POSTHOG_EVENTS.PROJECT_SHARED, createEventProperties.projectShared(shareMethod, projectData));
  };

  // Feature usage tracking methods
  const trackPageViewed = (pageName, pageData = {}) => {
    trackEvent(POSTHOG_EVENTS.PAGE_VIEWED, createEventProperties.pageViewed(pageName, pageData));
  };

  const trackFeatureAccessed = (featureName, featureData = {}) => {
    trackEvent(POSTHOG_EVENTS.FEATURE_ACCESSED, createEventProperties.featureAccessed(featureName, featureData));
  };

  return {
    // Generic tracking method
    trackEvent,
    
    // Authentication methods
    trackUserLogin,
    trackUserRegister,
    trackUserLogout,
    
    // Map and navigation methods
    trackMapViewed,
    trackMapInteraction,
    trackLocationSelected,
    
    // Data analysis methods
    trackImpactAssessmentStarted,
    trackImpactAssessmentCompleted,
    trackVillageComparisonStarted,
    trackVillageComparisonCompleted,
    
    // Data export and sharing methods
    trackDataDownloaded,
    trackProjectSaved,
    trackProjectShared,
    
    // Feature usage methods
    trackPageViewed,
    trackFeatureAccessed,
  };
}; 