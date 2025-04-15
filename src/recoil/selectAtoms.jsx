// src/recoil/atoms/selectAtoms.js
import { atom } from 'recoil';

export const selectedStateAtom = atom({
  key: 'selectedState', // unique ID (with respect to other atoms/selectors)
  default: '', // default value (aka initial value)
});

export const selectedDistrictAtom = atom({
  key: 'selectedDistrict',
  default: null, // Provide a valid default value
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

export const groundwaterDataAtom = atom({
  key: 'groundwaterData',
  default: { years: [], minValues: [], maxValues: [] },
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