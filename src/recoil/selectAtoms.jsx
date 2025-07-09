// src/recoil/atoms/selectAtoms.js
import { atom } from 'recoil';

export const selectedStateAtom = atom({
  key: 'selectedState', // unique ID (with respect to other atoms/selectors)
  default: null, // default value (aka initial value)
});

export const stateOptionsAtom = atom({
  key: 'stateOptions',
  default: [],
});

export const selectedDistrictAtom = atom({
  key: 'selectedDistrict',
  default: null, // Provide a valid default value
});

export const districtOptionsAtom = atom({
  key: 'districtOptions',
  default: [],
});

export const selectedSubdistrictAtom = atom({
  key: 'selectedSubdistrict',
  default: { value: '', label: '' },  // Ensure proper default initialization
});

export const selectedVillageAtom = atom({
  key: 'selectedVillage',
  default: { value: '', label: '' }, // Match the structure used in SelectSubdistrict
});

export const villageOptionsAtom = atom({
  key: 'villageOptions',
  default: [],
});

export const landCoverChartDataAtom = atom({
  key: 'landCoverChartData',
  default: { labels: [], datasets: [] },
});

export const interventionChartDataAtom = atom({
  key: 'interventionChartData',
  default: { labels: [], datasets: [] },
});

export const subdistrictOptionsAtom = atom({
  key: 'subdistrictOptions',  // Unique ID with respect to other atoms/selectors
  default: [],  // Default value (initial state)
});

export const compareVillagesClickedAtom = atom({
  key: 'compareVillagesClicked',
  default: false,
});

export const selectedControlSubdistrictAtom = atom({
  key: 'selectedControlSubdistrict',
  default: { value: '', label: '' },  // Ensure proper default initialization
});

export const selectedControlVillageAtom = atom({
  key: 'selectedControlVillage',
  default: { value: '', label: '' }, // Match the structure used in SelectSubdistrict
});

// Add these atoms to your existing selectAtoms.jsx file

export const customPolygonDataAtom = atom({
  key: 'customPolygonData',
  default: null, // Will contain the GeoJSON data
});

export const generatedCirclesDataAtom = atom({
  key: 'generatedCirclesData',
  default: null, // Will contain circles generated for the control village
});

export const circlesSummaryAtom = atom({
  key: 'circlesSummary',
  default: null, // Will contain the simplified circles data from the API response
});

export const polygonChartDataAtom = atom({
  key: 'polygonChartData',
  default: { labels: [], datasets: [] },
});

export const showPolygonDataAtom = atom({
  key: 'showPolygonData',
  default: false, // Toggle between village (false) and polygon (true) data
});

export const interventionStartYearAtom = atom({
  key: 'interventionStartYear',
  default: null, // Will contain the intervention start year
});

export const interventionEndYearAtom = atom({
  key: 'interventionEndYear',
  default: null, // Will contain the intervention end year
});