// src/recoil/atoms/selectAtoms.js
import { atom } from 'recoil';

export const selectedStateAtom = atom({
  key: 'selectedState', // unique ID (with respect to other atoms/selectors)
  default: 'Rajasthan', // default value (aka initial value)
});

export const selectedDistrictAtom = atom({
    key: 'selectedDistrict',
    default: { value: 'karauli', label: 'Karauli, RJ' }, // Provide a valid default value
  });

export const selectedVillageAtom = atom({
  key: 'selectedVillage',
  default: '',
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