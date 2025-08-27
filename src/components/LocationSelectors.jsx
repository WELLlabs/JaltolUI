import SelectState from './SelectState';
import SelectDistrict from './SelectDistrict';
import SelectSubdistrict from './SelectSubdistrict';
import SelectVillage from './SelectVillage';
import { useLocationSelectors } from '../hooks/useLocationSelectors';

const LocationSelectors = () => {
  const {
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
  } = useLocationSelectors();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="max-w-xs">
        <SelectState options={stateOptions} onChange={handleStateChange} value={selectedState} placeholder="Select State..." />
      </div>
      <div className="max-w-xs">
        <SelectDistrict options={districtOptions} onChange={handleDistrictChange} value={selectedDistrict || null} isDisabled={!selectedState} placeholder="District..." />
      </div>
      <div className="max-w-xs">
        <SelectSubdistrict options={subdistrictOptions} onChange={handleSubdistrictChange} value={selectedSubdistrict || null} isDisabled={!selectedDistrict} placeholder="Subdistrict..." />
      </div>
      <div className="max-w-xs">
        <SelectVillage options={villageOptions} onChange={handleVillageChange} value={selectedVillage || null} isDisabled={!selectedSubdistrict} placeholder="Village..." />
      </div>
    </div>
  );
};

export default LocationSelectors;


