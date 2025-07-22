// Constants that should match the backend BHUVAN_LULC_STATES
export const BHUVAN_LULC_STATES = [
  'andhra pradesh', 
  'chhattisgarh', 
  'gujarat',
  'jharkhand', 
  'karnataka', 
  'maharashtra', 
  'punjab', 
  'rajasthan', 
  'tamil nadu', 
  'uttar pradesh'
];

// Helper function to check if a state uses Bhuvan LULC data
export const isBhuvanLulcState = (stateName) => {
  if (!stateName) return false;
  return BHUVAN_LULC_STATES.includes(stateName.toLowerCase());
}; 