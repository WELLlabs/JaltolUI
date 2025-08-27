import { useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import {
  selectedStateAtom,
  stateOptionsAtom,
  selectedDistrictAtom,
  districtOptionsAtom,
  selectedSubdistrictAtom,
  subdistrictOptionsAtom,
  selectedVillageAtom,
  villageOptionsAtom,
} from '../recoil/selectAtoms';
import { getStates, getDistricts, getSubdistricts, getVillages } from '../services/api';

export const useLocationSelectors = (onSelectionChange) => {
  const [selectedState, setSelectedState] = useRecoilState(selectedStateAtom);
  const [selectedDistrict, setSelectedDistrict] = useRecoilState(selectedDistrictAtom);
  const [selectedSubdistrict, setSelectedSubdistrict] = useRecoilState(selectedSubdistrictAtom);
  const [selectedVillage, setSelectedVillage] = useRecoilState(selectedVillageAtom);

  const [stateOptions, setStateOptions] = useRecoilState(stateOptionsAtom);
  const [districtOptions, setDistrictOptions] = useRecoilState(districtOptionsAtom);
  const [subdistrictOptions, setSubdistrictOptions] = useRecoilState(subdistrictOptionsAtom);
  const [villageOptions, setVillageOptions] = useRecoilState(villageOptionsAtom);

  // Load states on mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const states = await getStates();
        const options = states
          .map(s => ({ value: s.id, label: s.display_name || s.name, name: s.name, state_id: s.state_id }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setStateOptions(options);
      } catch (e) {
        console.error('Failed to load states', e);
      }
    };
    if (!stateOptions || stateOptions.length === 0) loadStates();
  }, [setStateOptions, stateOptions]);

  // Load districts when state changes
  useEffect(() => {
    const load = async () => {
      try {
        if (!selectedState?.value) {
          setDistrictOptions([]);
          setSelectedDistrict(null);
          setSubdistrictOptions([]);
          setSelectedSubdistrict(null);
          setVillageOptions([]);
          setSelectedVillage(null);
          return;
        }
        const districts = await getDistricts(selectedState.value);
        const options = districts
          .map(d => ({ value: d.id, label: d.display_name || d.name, name: d.name, district_id: d.district_id }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setDistrictOptions(options);
        setSelectedDistrict(null);
        setSubdistrictOptions([]);
        setSelectedSubdistrict(null);
        setVillageOptions([]);
        setSelectedVillage(null);
      } catch (e) {
        console.error('Failed to load districts', e);
      }
    };
    load();
  }, [selectedState, setDistrictOptions, setSelectedDistrict, setSubdistrictOptions, setSelectedSubdistrict, setVillageOptions, setSelectedVillage]);

  // Load subdistricts when district changes
  useEffect(() => {
    const load = async () => {
      try {
        if (!selectedDistrict?.value) {
          setSubdistrictOptions([]);
          setSelectedSubdistrict(null);
          setVillageOptions([]);
          setSelectedVillage(null);
          return;
        }
        const subdistricts = await getSubdistricts(selectedDistrict.value);
        const options = subdistricts
          .map(s => ({ value: s.id, label: s.display_name || s.name, name: s.name, subdistrict_id: s.subdistrict_id }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setSubdistrictOptions(options);
        setSelectedSubdistrict(null);
        setVillageOptions([]);
        setSelectedVillage(null);
      } catch (e) {
        console.error('Failed to load subdistricts', e);
      }
    };
    load();
  }, [selectedDistrict, setSubdistrictOptions, setSelectedSubdistrict, setVillageOptions, setSelectedVillage]);

  // Load villages when subdistrict changes
  useEffect(() => {
    const load = async () => {
      try {
        if (!selectedSubdistrict?.value) {
          setVillageOptions([]);
          setSelectedVillage(null);
          return;
        }
        const villages = await getVillages(selectedSubdistrict.value);
        const options = villages
          .map(v => ({
            value: v.id,
            label: v.display_name || v.name,
            villageName: v.name,
            villageId: v.village_id,
            total_population: v.total_population,
            sc_population: v.sc_population,
            st_population: v.st_population,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setVillageOptions(options);
        setSelectedVillage(null);
      } catch (e) {
        console.error('Failed to load villages', e);
      }
    };
    load();
  }, [selectedSubdistrict, setVillageOptions, setSelectedVillage]);

  const handleStateChange = (option) => {
    // Immediately reset dependent selections/options so UI shows placeholders
    setSelectedState(option);
    setSelectedDistrict(null);
    setDistrictOptions([]);
    setSelectedSubdistrict(null);
    setSubdistrictOptions([]);
    setSelectedVillage(null);
    setVillageOptions([]);
    if (onSelectionChange) onSelectionChange('state', option);
  };
  const handleDistrictChange = (option) => {
    // Immediately reset dependent selections/options so UI shows placeholders
    setSelectedDistrict(option);
    setSelectedSubdistrict(null);
    setSubdistrictOptions([]);
    setSelectedVillage(null);
    setVillageOptions([]);
    if (onSelectionChange) onSelectionChange('district', option);
  };
  const handleSubdistrictChange = (option) => {
    // Immediately reset dependent selections/options so UI shows placeholders
    setSelectedSubdistrict(option);
    setSelectedVillage(null);
    setVillageOptions([]);
    if (onSelectionChange) onSelectionChange('subdistrict', option);
  };
  const handleVillageChange = (option) => {
    setSelectedVillage(option);
  };

  return {
    selectedState,
    selectedDistrict,
    selectedSubdistrict,
    selectedVillage,
    stateOptions,
    districtOptions,
    subdistrictOptions,
    villageOptions,
    handleStateChange,
    handleDistrictChange,
    handleSubdistrictChange,
    handleVillageChange,
  };
};



