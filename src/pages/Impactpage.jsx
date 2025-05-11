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
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useLocation } from 'react-router-dom';
import ShareableLink from '../components/ShareableLink';
import { uploadCustomPolygon } from '../services/api';
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
  customPolygonDataAtom,
  showPolygonDataAtom
} from '../recoil/selectAtoms';
import { getSubdistricts, getVillages } from '../services/api'; // Import API calls
import Footer from '../components/Footer';



const ImpactAssessmentPage = () => {
  const scrollTargetRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();

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
  const [uploadedGeoJSON, setUploadedGeoJSON] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const setCustomPolygonData = useSetRecoilState(customPolygonDataAtom);
  const setShowPolygonData = useSetRecoilState(showPolygonDataAtom);

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

  // Add this effect to load from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isSharedLink = params.get('shared') === 'true';
    
    if (!isSharedLink) return;
    
    // Extract parameters
    const stateParam = params.get('state');
    const districtParam = params.get('district');
    const subdistrictParam = params.get('subdistrict');
    const villageParam = params.get('village');
    
    console.log('Loading from shared link parameters:', 
      { state: stateParam, district: districtParam, subdistrict: subdistrictParam, village: villageParam });
    
    // We need to load these sequentially due to dependencies
    const loadData = async () => {
      try {
        // Initial delay before starting the loading process
        console.log("Starting shared link loading with initial delay...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 1. Set state
        if (stateParam) {
          console.log("Setting state:", stateParam);
          setSelectedState(stateParam);
          // Add delay after setting state
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 2. Find and set district
        if (districtParam) {
          console.log("Finding and setting district:", districtParam);
          const districtOption = districtOptions.find(
            option => option.label.toLowerCase() === districtParam.toLowerCase()
          );
          
          if (districtOption) {
            setSelectedDistrict(districtOption);
            console.log("District set to:", districtOption.label);
            
            // Fetch subdistricts for this district
            const districtId = getDistrictIdByName(districtOption.label);
            if (districtId) {
              // Wait longer for the state to update
              console.log("Waiting for district state to update before fetching subdistricts...");
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              try {
                console.log("Fetching subdistricts for district ID:", districtId);
                const subdistricts = await getSubdistricts(districtId);
                const subdistrictsList = subdistricts.map(item => ({
                  value: item.id,
                  label: item.name
                }));
                setSubdistrictOptions(subdistrictsList);
                console.log("Subdistrict options set with", subdistrictsList.length, "items");
                
                // 3. Find and set subdistrict
                if (subdistrictParam && subdistrictsList.length > 0) {
                  // Wait longer for options to be set
                  console.log("Waiting for subdistricts to load...");
                  await new Promise(resolve => setTimeout(resolve, 3000));
                  
                  console.log("Finding subdistrict:", subdistrictParam);
                  const subdistrictOption = subdistrictsList.find(
                    option => option.label.toLowerCase() === subdistrictParam.toLowerCase()
                  );
                  
                  if (subdistrictOption) {
                    console.log("Setting subdistrict to:", subdistrictOption.label);
                    setSelectedSubdistrict(subdistrictOption);
                    
                    // 4. Fetch and set village
                    console.log("Waiting before fetching villages...");
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    
                    try {
                      console.log("Fetching villages for subdistrict ID:", subdistrictOption.value);
                      const villages = await getVillages(subdistrictOption.value);
                      const villagesList = villages.map(item => ({
                        value: item.id,
                        label: item.display_name || item.name,
                        villageName: item.name,
                        villageId: item.village_id
                      }));
                      setVillageOptions(villagesList);
                      console.log("Village options set with", villagesList.length, "items");
                      
                      // Find and set village
                      if (villageParam && villagesList.length > 0) {
                        // Wait longer for villages to be set
                        console.log("Waiting for villages to load...");
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        
                        console.log("Finding village:", villageParam);
                        const villageOption = villagesList.find(
                          option => option.label.toLowerCase() === villageParam.toLowerCase()
                        );
                        
                        if (villageOption) {
                          console.log("Setting village to:", villageOption.label);
                          setSelectedVillage(villageOption);
                          
                          // Final delay to ensure map loads properly
                          console.log("Final delay before map updates...");
                          await new Promise(resolve => setTimeout(resolve, 4000));
                          console.log("Shared link loading process complete.");
                        } else {
                          console.warn("Village not found:", villageParam);
                        }
                      }
                    } catch (error) {
                      console.error('Error fetching villages:', error);
                    }
                  } else {
                    console.warn("Subdistrict not found:", subdistrictParam);
                  }
                }
              } catch (error) {
                console.error('Error fetching subdistricts:', error);
              }
            }
          } else {
            console.warn("District not found:", districtParam);
          }
        }
      } catch (error) {
        console.error('Error processing shared link:', error);
      }
    };
    
    loadData();
  }, [location.search]);

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
          
          const sortedVillageOptions = villages.map(village => {
              console.log("Processing village:", village);  // Debug each village
              return { 
                value: village.id, 
                label: village.display_name || village.name, // Use display_name (with ID) or fallback to name
                villageName: village.name, 
                villageId: village.village_id 
              };
            }).sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label
          
          setVillageOptions(sortedVillageOptions);
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
    // Clear any existing zoom lock state when selection changes
    sessionStorage.removeItem('zoomLocked');
    sessionStorage.removeItem('villageBounds');
    
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
    // Clear any existing zoom lock state when selection changes
    sessionStorage.removeItem('zoomLocked');
    sessionStorage.removeItem('villageBounds');
    
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
    // Clear any existing zoom lock state when selection changes
    sessionStorage.removeItem('zoomLocked');
    sessionStorage.removeItem('villageBounds');
    
    console.log("Village selected:", option);
    setSelectedVillage(option); // Store the entire option object with all properties
  };

  const handleControlVillageChange = (option) => {
    console.log("Control Village selected:", option);
    setSelectedControlVillage(option);
  };

  // GeoJSON upload handlers
  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const geojsonData = JSON.parse(e.target.result);
        setUploadedGeoJSON(geojsonData);
        
        // Send to backend for processing
        processUploadedGeoJSON(geojsonData);
      } catch (error) {
        console.error('Error parsing GeoJSON file:', error);
        setUploadError('Invalid GeoJSON file. Please upload a valid file.');
      }
    };
    reader.readAsText(file);
  };

  const processUploadedGeoJSON = async (geojsonData) => {
    if (!selectedState || !selectedDistrict || !selectedSubdistrict || !selectedVillage) {
      setUploadError('Please select all village details before uploading a polygon.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Get current year from the URL or use default
      const year = (new URLSearchParams(location.search).get('year')) || '2022';
      
      // Log the parameters being sent
      console.log("Sending params:", {
        state: selectedState,
        district: selectedDistrict?.label,
        subdistrict: selectedSubdistrict?.label,
        village: selectedVillage?.label,
        controlVillage: selectedControlVillage?.label || '',
        year: year
      });
      
      // Make sure we're sending all required parameters
      if (!selectedState || !selectedDistrict?.label || !selectedSubdistrict?.label || 
          !selectedVillage?.label || !year) {
        setUploadError('Missing required parameters. Please select all fields.');
        setIsUploading(false);
        return;
      }

      // Call the backend API to process the GeoJSON
      const result = await uploadCustomPolygon(
        selectedState,
        selectedDistrict.label,
        selectedSubdistrict.label,
        selectedVillage.label,
        selectedControlVillage?.label || '',
        selectedControlVillage?.value || '',
        year,
        geojsonData
      );

      console.log('Polygon processing result:', result);
      
      // Transform data for our components
      const processedData = {
        // Original GeoJSON
        polygon: geojsonData,
        // Circles generated for control village
        circles: result.control.circles || { type: 'FeatureCollection', features: [] },
        // Stats for charts
        interventionStats: {
          single_crop: result.intervention.crop_stats?.single_crop || 0,
          double_crop: result.intervention.crop_stats?.double_crop || 0,
          tree_cover: result.intervention.crop_stats?.tree_cover || 0,
        },
        controlStats: {
          single_crop: result.control.crop_stats?.single_crop || 0,
          double_crop: result.control.crop_stats?.double_crop || 0,
          tree_cover: result.control.crop_stats?.tree_cover || 0,
        }
      };
      
      // Update state with processed data
      setCustomPolygonData(processedData);
      
      // Switch to polygon data view in chart
      setShowPolygonData(true);
      
      setIsUploading(false);
    } catch (error) {
      console.error('Error processing GeoJSON:', error);
      setUploadError('Error processing your GeoJSON. Please try again.');
      setIsUploading(false);
    }
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
          <div className="flex flex-col lg:flex-row gap-6 mb-4">
            <div className="lg:w-1/2">
              <div className="mb-4 text-black max-w-xs">
                <SelectDistrict
                  options={districtOptions}
                  onChange={handleDistrictChange}
                  value={selectedDistrict}
                  placeholder="Select District..."
                />
              </div>
              <div className="mb-4 max-w-xs">
                <SelectSubdistrict
                  key={selectedDistrict?.value || 'no-district'}
                  options={subdistrictOptions}
                  onChange={handleSubdistrictChange}
                  placeholder="Select Subdistrict..."
                  isDisabled={!selectedDistrict}
                  value={selectedSubdistrict || null}
                />
              </div>
              <div className="mb-4 max-w-xs">
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
            <div className="lg:w-1/2">
              <div className="h-auto" style={{ maxHeight: '180px' }}>
                <ShareableLink
                  state={selectedState}
                  district={selectedDistrict}
                  subdistrict={selectedSubdistrict}
                  village={selectedVillage}
                />
              </div>
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
                  {/* GeoJSON Upload Button */}
                  <div className="z-[9999]">
                    <button 
                      onClick={handleUploadButtonClick}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      disabled={!selectedVillage || isUploading}
                    >
                      {isUploading ? 'Processing...' : 'Upload GeoJSON'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.geojson"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    {uploadError && (
                      <div className="text-red-500 text-sm mt-1">{uploadError}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Map Container with Full Height */}
              <div className="flex-1 bg-gray-200 z-[0] rounded shadow-lg min-h-[500px] h-full flex items-center justify-center">
                <InterventionMap
                  selectedState={selectedState}
                  selectedDistrict={selectedDistrict}
                  selectedSubdistrict={selectedSubdistrict}
                  selectedVillage={selectedVillage}
                  uploadedGeoJSON={uploadedGeoJSON}
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