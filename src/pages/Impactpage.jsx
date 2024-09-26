import { useState, useEffect, useRef } from 'react';
import LandCoverChangeChart from '../components/LandCoverChangeChart';
import SelectDistrict from '../components/SelectDistrict';
import Navbar from '../components/Navbar';
import SelectVillage from '../components/SelectVillage';
import DistrictMap from '../components/DistrictMap';
import SelectSubdistrict from '../components/SelectSubdistrict';
import CompareMap from '../components/CompareMap';
import InterventionMap from '../components/InterventionMap';
import InterventionCompareChart from '../components/InterventionCompareChart';
import VillageDetails from '../components/VillageDetails';
import DownloadCSVButton from '../components/DownloadCSVButton';
import { districtDisplayNames, districtToStateMap } from '../data/locationData';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
  selectedStateAtom,
  selectedDistrictAtom,
  selectedSubdistrictAtom,
  selectedVillageAtom,
  subdistrictOptionsAtom,
  villageOptionsAtom,
  landCoverChartDataAtom,
  interventionChartDataAtom,
  compareVillagesClickedAtom
} from '../recoil/selectAtoms';
import { getSubdistricts, getVillages } from '../services/api'; // Import API calls
import Footer from '../components/Footer';

const ImpactAssessmentPage = () => {
  const scrollTargetRef = useRef(null);

  const [selectedDistrict, setSelectedDistrict] = useRecoilState(selectedDistrictAtom);
  const [selectedSubdistrict, setSelectedSubdistrict] = useRecoilState(selectedSubdistrictAtom);
  const [selectedVillage, setSelectedVillage] = useRecoilState(selectedVillageAtom);
  const [subdistrictOptions, setSubdistrictOptions] = useRecoilState(subdistrictOptionsAtom);
  const [villageOptions, setVillageOptions] = useRecoilState(villageOptionsAtom);
  const [loadingChartData] = useState(false);
  const landCoverChartData = useRecoilValue(landCoverChartDataAtom);
  const interventionChartData = useRecoilValue(interventionChartDataAtom);
  const compareVillagesClicked = useRecoilValue(compareVillagesClickedAtom);
  const [selectedState, setSelectedState] = useRecoilState(selectedStateAtom);

  // Hardcoded district IDs based on selected district name
  const getDistrictIdByName = (districtName) => {
    if (districtName === 'Karauli, RJ') {
      return 1; // Karauli district ID
    } else if (districtName === 'Adilabad, AP') {
      return 2; // Adilabad district ID
    }  else if (districtName === 'Raichur, KA') {
      return 3; // Adilabad district ID
    }
    else {
      return null; // No district selected
    }
  };

  useEffect(() => {
    if (selectedDistrict) {
      const districtId = getDistrictIdByName(selectedDistrict.label); // Get district ID based on hardcoded logic

      if (!districtId) {
        console.error("District ID is undefined");
        return;
      }

      // Fetch subdistricts from API using districtId
      getSubdistricts(districtId)
        .then(subdistricts => {
          setSubdistrictOptions(
            subdistricts.map(subdistrict => ({ value: subdistrict.id, label: subdistrict.name }))
          );
          setSelectedSubdistrict(null); // Reset subdistrict when district changes
          setVillageOptions([]); // Also reset villages
        })
        .catch(error => {
          console.error("Error fetching subdistricts:", error);
        });
    }
  }, [selectedDistrict]);

  // Fetch villages based on selected subdistrict
  useEffect(() => {
    if (selectedSubdistrict) {
      const subdistrictId = selectedSubdistrict.value;

      if (!subdistrictId) {
        console.error("Subdistrict ID is undefined");
        return;
      }

      // Fetch villages from API using subdistrictId
      getVillages(subdistrictId)
        .then(villages => {
          setVillageOptions(
            villages.map(village => ({ value: village.id, label: village.name }))
          );
          setSelectedVillage(null);
        })
        .catch(error => {
          console.error("Error fetching villages:", error);
        });
    } else {
      setVillageOptions([]);
    }
  }, [selectedSubdistrict]);

  // Handle district change and set state accordingly
  const handleDistrictChange = option => {
    setSelectedDistrict(option); // Update selected district
     // Reset subdistrict and village when a new district is selected
  setSelectedSubdistrict(null);
  setSelectedVillage(null);
  setSubdistrictOptions([]); // Clear subdistrict options
  setVillageOptions([]); // Clear village options

    const state = districtToStateMap[option.value]; // Get corresponding state
    if (state) {
      setSelectedState(state); // Update state
    }


  };

  const handleSubdistrictChange = option => {
  // Log the change to make sure it's being called
  console.log("Subdistrict selected:", option);
  
  // Store the subdistrict label (name) and still pass it as an object for consistency
  setSelectedSubdistrict({ value: option.value, label: option.label.toLowerCase() });
   // Reset the selected village and village options when a new subdistrict is selected
   setSelectedVillage(null);
   setVillageOptions([]);
};

  
  

const handleVillageChange = option => {
  console.log("Village selected new:", option);
  const village_new = option.label
  // Store the village label (name) and pass it as an object if needed
  setSelectedVillage({ village_new});
};

  

  // Prepare district options from districtDisplayNames
  const districtOptions = Object.keys(districtDisplayNames).map(key => ({
    value: key,
    label: districtDisplayNames[key],
  }));

  return (
    <div className="font-sans bg-white h-screen w-screen overflow-x-hidden">
      <Navbar />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white p-6 rounded">
          <div className="container text-left mb-8 text-neutral-800">
            <h1 className="text-5xl font-bold mb-2">Impact Assessment</h1>
            <p>Our impact assessment focuses on increased Rabi acreage as the primary indicator of watershed programme success.</p>
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-4 text-black">
              <SelectDistrict
                options={districtOptions}
                onChange={handleDistrictChange}
                value={selectedDistrict}
              />
            </div>
            <div className="mb-4">
              <SelectSubdistrict
                options={subdistrictOptions}
                onChange={handleSubdistrictChange}
                placeholder="Select Subdistrict..."
                isDisabled={!selectedDistrict}
                value={selectedSubdistrict || null }
              />
            </div>
            <div className="mb-4">
              <SelectVillage
                options={villageOptions}
                onChange={handleVillageChange}
                placeholder="Select Village..."
                isDisabled={!selectedSubdistrict}
                value={selectedVillage || null}
              />
            </div>
          </div>

          {selectedVillage && (
            <VillageDetails
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              selectedSubdistrict={selectedSubdistrict}
              selectedVillage={selectedVillage}
            />
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Land Cover Change</h2>
            <div className="w-full bg-gray-200 h-70 rounded shadow-inner flex items-center justify-center">
              {selectedState && selectedDistrict && selectedSubdistrict && selectedVillage ? (
                loadingChartData ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <LandCoverChangeChart />
                )
              ) : (
                <p>Select all fields to see the chart</p>
              )}
            </div>
            {!loadingChartData && landCoverChartData.labels.length > 0 && (
              <DownloadCSVButton
                data={landCoverChartData}
                filename="land_cover_chart_data.csv"
              />
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-gray-200 rounded shadow-lg h-screen flex items-center justify-center mb-8 m-5">
            <DistrictMap
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              selectedSubdistrict={selectedSubdistrict}
              selectedVillage={selectedVillage}
              scrollRef={scrollTargetRef}
            />
          </div>
        </div>
      </div>

      {compareVillagesClicked && (
        <>
          <div className="flex flex-col lg:flex-row gap-6 ml-10 z-[9999]">
            <div className="mb-4 text-black z-[9999]">
              <SelectDistrict
                key={selectedDistrict?.value}
                options={districtOptions}
                onChange={handleDistrictChange}
                value={selectedDistrict}
              />
            </div>
            <div className="mb-4">
              <SelectSubdistrict
                key={`subdistrict-${selectedSubdistrict?.value || 'none'}`}
                options={subdistrictOptions}
                onChange={handleSubdistrictChange}
                placeholder="Select Subdistrict..."
                isDisabled={!selectedDistrict}
                value={selectedSubdistrict}
              />
            </div>
            <div className="mb-4">
              <SelectVillage
                key={`village-${selectedVillage?.value || 'none'}`}
                options={villageOptions}
                onChange={handleVillageChange}
                placeholder="Select Village..."
                isDisabled={!selectedSubdistrict}
                value={selectedVillage}
              />
            </div>
          </div>

          <div className="flex flex-col h-full w-full lg:flex-row gap-6 mb-8" ref={scrollTargetRef}>
            <div className="flex-1">
              <div className="bg-gray-200 z-[0] rounded shadow-lg h-full flex items-center justify-center mb-8 m-5">
                <InterventionMap
                  selectedState={selectedState}
                  selectedDistrict={selectedDistrict}
                  selectedSubdistrict={selectedSubdistrict}
                  selectedVillage={selectedVillage}
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="bg-gray-200 rounded shadow-lg h-full flex items-center justify-center mb-8 m-5">
                <CompareMap
                  selectedState={selectedState}
                  selectedDistrict={selectedDistrict}
                  selectedSubdistrict={selectedSubdistrict}
                  selectedVillage={selectedVillage}
                />
              </div>
            </div>
          </div>

          <div className="bg-white h-80 rounded shadow-inner flex items-center justify-center p-5 mb-5">
            {selectedState && selectedDistrict && selectedSubdistrict && selectedVillage ? (
              loadingChartData ? (
                <div className="items-center justify-center">
                  <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <InterventionCompareChart />
              )
            ) : (
              <p>Select all fields to see the chart</p>
            )}
          </div>
          {!loadingChartData && interventionChartData.labels.length > 0 && (
            <DownloadCSVButton
              data={interventionChartData}
              filename="intervention_chart_data.csv"
            />
          )}
        </>
      )}
      <Footer />
    </div>
  );
};

export default ImpactAssessmentPage;
