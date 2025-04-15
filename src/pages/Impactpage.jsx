import { useState, useEffect, useRef } from 'react';
import LandCoverChangeChart from '../components/LandCoverChangeChart';
import SelectDistrict from '../components/SelectDistrict';
import Navbar from '../components/Navbar';
import SelectVillage from '../components/SelectVillage';
import SelectVillage2 from '../components/SelectVillage2';
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
  compareVillagesClickedAtom,
  selectedControlVillageAtom,
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

  // const [selectedControlSubdistrict, setSelectedControlSubdistrict] = useRecoilState(selectedControlSubdistrictAtom);
  const [selectedControlVillage, setSelectedControlVillage] = useRecoilState(selectedControlVillageAtom);

  const districtIdMap = {
    'Karauli, RJ': 1,
    'Adilabad, AP': 2,
    'Raichur, KA': 3,
    'Chitrakoot, UP': 4,
    'Nashik, MH': 5,
    'Aurangabad, MH': 7,
    'Saraikela Kharsawan, JH': 6,
  };

  const getDistrictIdByName = (districtName) => districtIdMap[districtName] || null;

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
          console.log("API Response - Villages:", villages); // Debug the raw API response
          
          setVillageOptions(
            villages.map(village => {
              console.log("Processing village:", village);  // Debug each village
              return { 
                value: village.id, 
                label: village.display_name || village.name, // Use display_name (with ID) or fallback to name
                villageName: village.name, 
                villageId: village.village_id 
              };
            })
          );
          console.log("Set village options completed");
          setSelectedVillage(null);
        })
        .catch(error => {
          console.error("Error fetching villages:", error);
        });
    } else {
      setVillageOptions([]);
    }
  }, [selectedSubdistrict]);

  useEffect(() => {
    if (compareVillagesClicked) {
      setTimeout(() => {
        if (scrollTargetRef.current) {
          scrollTargetRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Add delay to ensure rendering is complete
    }
  }, [compareVillagesClicked]);

  // Handle district change and set state accordingly
  const handleDistrictChange = option => {
    setSelectedDistrict(option); // Update selected district
    setSelectedSubdistrict(null); // Reset subdistrict when district changes
    setSelectedVillage(null); // Reset village when district changes
    setSubdistrictOptions([]); // Clear subdistrict options
    setVillageOptions([]); // Clear village options
  
    const state = districtToStateMap[option?.value]; // Get corresponding state
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

  // Update the handleVillageChange function
  const handleVillageChange = (option) => {
    console.log("Village selected:", option);
    setSelectedVillage(option); // Store the entire option object with all properties
  };

  const handleControlVillageChange = (option) => {
    console.log("Control Village selected:", option);
    setSelectedControlVillage(option);
  };

  

  // Prepare district options from districtDisplayNames
  const districtOptions = Object.keys(districtDisplayNames).map(key => {
    // Asset mapping for display purposes only
    const districtAssetMap = {
      'Karauli, RJ': 'IndiaSAT LULC',
      'Adilabad, AP': 'IndiaSAT LULC',
      'Raichur, KA': 'IndiaSAT LULC',
      'Chitrakoot, UP': 'Bhuvan LULC',
      'Nashik, MH': 'Bhuvan LULC',
      'Aurangabad, MH': 'Bhuvan LULC',
      'Saraikela Kharsawan, JH': 'Bhuvan LULC'
    };

    const districtName = districtDisplayNames[key];
    
    // Use districtName directly to look up in districtAssetMap
    return {
      value: key,
      label: districtName,
      asset: districtAssetMap[districtName] || 'Default Asset' 
    };
  });

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
                placeholder="Select District..."
              />
            </div>
            <div className="mb-4">
              <SelectSubdistrict
                key={selectedDistrict?.value || 'no-district'}
                options={subdistrictOptions}
                onChange={handleSubdistrictChange}
                placeholder="Select Subdistrict..."
                isDisabled={!selectedDistrict}
                value={selectedSubdistrict || null}
              />
            </div>
            <div className="mb-4">
              <SelectVillage
                key={selectedSubdistrict?.value || 'no-subdistrict'}
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
          <div ref={scrollTargetRef} className="flex flex-col h-full w-full lg:flex-row gap-6 mb-12">
            <div className="flex-1 bg-blue-100 rounded-lg shadow-lg p-5 ml-3 min-h-[700px] flex flex-col justify-start">
              <div className="flex flex-col lg:flex-row gap-6 ml-3 z-[9900]">
                <h2 className="text-l font-semibold text-gray-700 mt-2 mb-2">Intervention Village</h2>
                <div className="flex flex-col lg:flex-row gap-4 mb-4 z-[9999]">
                  <SelectDistrict
                    key={selectedDistrict?.value}
                    options={districtOptions}
                    onChange={handleDistrictChange}
                    value={selectedDistrict}
                  />
                  <SelectSubdistrict
                    key={`subdistrict-${selectedSubdistrict?.value || 'none'}`}
                    options={subdistrictOptions}
                    onChange={handleSubdistrictChange}
                    placeholder="Select Subdistrict..."
                    isDisabled={!selectedDistrict}
                    value={selectedSubdistrict}
                  />
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

              {/* Map Container with Full Height */}
              <div className="flex-1 bg-gray-200 z-[0] rounded shadow-lg min-h-[500px] h-full flex items-center justify-center">
                <InterventionMap
                  selectedState={selectedState}
                  selectedDistrict={selectedDistrict}
                  selectedSubdistrict={selectedSubdistrict}
                  selectedVillage={selectedVillage}
                />
              </div>
            </div>

            <div className="flex-1 bg-blue-100 rounded-lg shadow-lg p-5 ml-3 min-h-[700px] flex flex-col justify-start">
              <div className="flex flex-col lg:flex-row gap-6 ml-3 z-[9900]">
                <h2 className="text-l font-semibold text-gray-700 mt-2 mb-2">Control Village</h2>
                <div className="flex flex-col lg:flex-row gap-4 mb-4 z-[9999]">
                  {/* <SelectDistrict
                    key={selectedDistrict?.value}
                    options={districtOptions}
                    onChange={handleDistrictChange}
                    value={selectedDistrict}
                  />
                  <SelectSubdistrict
                    key={`subdistrict-${selectedSubdistrict?.value || 'none'}`}
                    options={subdistrictOptions}
                    onChange={handleSubdistrictChange}
                    placeholder="Select Subdistrict..."
                    isDisabled={!selectedDistrict}
                    value={selectedSubdistrict}
                  /> */}
                   <SelectVillage2
                  options={villageOptions}
                  onChange={handleControlVillageChange}
                  placeholder="Select Control Village..."
                  value={selectedControlVillage}
                />
                </div>
              </div>

              {/* Map Container with Full Height */}
              <div className="flex-1 bg-gray-200 z-[0] rounded shadow-lg min-h-[500px] h-full flex items-center justify-center">
              <CompareMap
                  selectedState={selectedState}
                  selectedDistrict={selectedDistrict}
                  selectedSubdistrict={selectedSubdistrict}
                  selectedVillage={selectedVillage}
                />
              </div>
            </div>
          </div>

          {/* Chart Section */}
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