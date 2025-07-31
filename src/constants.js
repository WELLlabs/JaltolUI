// Constants that should match the backend BHUVAN_LULC_STATES
export const BHUVAN_LULC_STATES = [
  'andhra pradesh', 
  'bihar',
  'chhattisgarh', 
  'gujarat',
  'haryana',
  'himachal pradesh',
  'jharkhand', 
  'karnataka', 
  'kerala',
  'madhya pradesh',
  'maharashtra', 
  'odisha',
  'punjab', 
  'rajasthan', 
  'tamil nadu', 
  'uttarakhand',
  'uttar pradesh',
  'west bengal'
];

// Helper function to check if a state uses Bhuvan LULC data
export const isBhuvanLulcState = (stateName) => {
  if (!stateName) return false;
  return BHUVAN_LULC_STATES.includes(stateName.toLowerCase());
}; 