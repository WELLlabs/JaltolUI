import { useState, useEffect, useRef } from 'react';
import LandCoverChangeChart from '../components/LandCoverChangeChart';
import SelectDistrict from '../components/SelectDistrict';
import SelectState from '../components/SelectState';
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
import SaveProjectModal from '../components/SaveProjectModal';

import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useLocation } from 'react-router-dom';
import ShareableLink from '../components/ShareableLink';
import { useAuth } from '../context/AuthContext';
import { saveProjectFromAssessment } from '../services/api';
import { uploadCustomPolygon } from '../services/api';
import {
  selectedStateAtom,
  stateOptionsAtom,
  selectedDistrictAtom,
  districtOptionsAtom,
  selectedSubdistrictAtom,
  subdistrictOptionsAtom,
  selectedVillageAtom,
  villageOptionsAtom,
  landCoverChartDataAtom,
  interventionChartDataAtom,
  compareVillagesClickedAtom,
  selectedControlVillageAtom,
  customPolygonDataAtom,
  showPolygonDataAtom,
  circlesSummaryAtom,
  interventionStartYearAtom,
  interventionEndYearAtom
} from '../recoil/selectAtoms';
import { getSubdistricts, getVillages, getStates, getDistricts } from '../services/api'; // Import API calls
import Footer from '../components/Footer';



const ImpactAssessmentPage = () => {
  const scrollTargetRef = useRef(null);
  const districtMapRef = useRef(null);
  const interventionMapRef = useRef(null);
  const compareMapRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();

  const [selectedDistrict, setSelectedDistrict] = useRecoilState(selectedDistrictAtom);
  const [selectedSubdistrict, setSelectedSubdistrict] = useRecoilState(selectedSubdistrictAtom);
  const [selectedVillage, setSelectedVillage] = useRecoilState(selectedVillageAtom);
  const [stateOptions, setStateOptions] = useRecoilState(stateOptionsAtom);
  const [districtOptions, setDistrictOptions] = useRecoilState(districtOptionsAtom);
  const [subdistrictOptions, setSubdistrictOptions] = useRecoilState(subdistrictOptionsAtom);
  const [villageOptions, setVillageOptions] = useRecoilState(villageOptionsAtom);
  const [loadingChartData] = useState(false);
  const landCoverChartData = useRecoilValue(landCoverChartDataAtom);
  const interventionChartData = useRecoilValue(interventionChartDataAtom);
  const compareVillagesClicked = useRecoilValue(compareVillagesClickedAtom);
  const [selectedState, setSelectedState] = useRecoilState(selectedStateAtom);

  // const [selectedControlSubdistrict, setSelectedControlSubdistrict] = useRecoilState(selectedControlSubdistrictAtom);
  const [selectedControlVillage, setSelectedControlVillage] = useRecoilState(selectedControlVillageAtom);

  // Intervention Period State
  const [interventionStartYear, setInterventionStartYear] = useRecoilState(interventionStartYearAtom);
  const [interventionEndYear, setInterventionEndYear] = useRecoilState(interventionEndYearAtom);
  const [availableYears, setAvailableYears] = useState([]);

  // Save Project Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  const { isAuthenticated } = useAuth();
  const [uploadedGeoJSON, setUploadedGeoJSON] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const setCustomPolygonData = useSetRecoilState(customPolygonDataAtom);
  const setShowPolygonData = useSetRecoilState(showPolygonDataAtom);
  const setCirclesSummary = useSetRecoilState(circlesSummaryAtom);



  // Handle Save Project functionality
  const handleSaveProject = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search);
      return;
    }
    setShowSaveModal(true);
  };

  const handleSaveModalClose = () => {
    setShowSaveModal(false);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleProjectSave = async (projectData) => {
    try {
      setSaving(true);
      setSaveError(null);

      // Validate that we have minimum required selections
      if (!selectedVillage) {
        throw new Error('Please select a village before saving the project.');
      }

      // Helper function to convert village ID to proper format
      const parseVillageId = (id) => {
        if (!id || id === '') return null;
        const parsed = parseInt(id);
        return isNaN(parsed) ? null : parsed;
      };

      // Helper function to convert year to proper format
      const parseYear = (year) => {
        if (!year || year === '') return null;
        const parsed = parseInt(year);
        return isNaN(parsed) ? null : parsed;
      };

      // Prepare project data with current selections
      const saveData = {
        ...projectData,
        state: selectedState?.label || selectedState,
        district: selectedDistrict?.label || '',
        subdistrict: selectedSubdistrict?.label || '',
        village: selectedVillage?.villageName || selectedVillage?.label || '',
        village_id: parseVillageId(selectedVillage?.villageId),
        
        // Control village data
        control_state: selectedState?.label || selectedState, // Assume same state for control village
        control_district: selectedDistrict?.label || '',
        control_subdistrict: selectedSubdistrict?.label || '',
        control_village: selectedControlVillage?.villageName || selectedControlVillage?.label || '',
        control_village_id: parseVillageId(selectedControlVillage?.villageId),
        
        // Parse year fields properly
        intervention_start_year: parseYear(projectData.intervention_start_year),
        intervention_end_year: parseYear(projectData.intervention_end_year),
        
        project_type: 'village'
      };

      console.log('Sending project data:', saveData); // Debug log

      const response = await saveProjectFromAssessment(saveData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to save project');
      }
      
      return response;
    } catch (error) {
      console.error('Error saving project:', error);
      throw error; // Re-throw the error to be caught by the SaveProjectModal
    } finally {
      setSaving(false);
    }
  };

  // Prepare current project data for the modal
  const getCurrentProjectData = () => {
    // Helper function to convert village ID to proper format
    const parseVillageId = (id) => {
      if (!id || id === '') return null;
      const parsed = parseInt(id);
      return isNaN(parsed) ? null : parsed;
    };

    return {
      state: selectedState?.label || selectedState,
      district: selectedDistrict?.label || '',
      subdistrict: selectedSubdistrict?.label || '',
      village: selectedVillage?.villageName || selectedVillage?.label || '',
      village_id: parseVillageId(selectedVillage?.villageId),
      control_state: selectedState?.label || selectedState,
      control_district: selectedDistrict?.label || '',
      control_subdistrict: selectedSubdistrict?.label || '',
      control_village: selectedControlVillage?.villageName || selectedControlVillage?.label || '',
      control_village_id: parseVillageId(selectedControlVillage?.villageId),
      intervention_start_year: null, // Default to null for new projects
      intervention_end_year: null
    };
  };

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
        
        // 1. Find and set state
        if (stateParam) {
          console.log("Finding and setting state:", stateParam);
          const stateOption = stateOptions.find(
            option => option.label.toLowerCase() === stateParam.toLowerCase()
          );
          
          if (stateOption) {
            setSelectedState(stateOption);
            console.log("State set to:", stateOption.label);
            
            // Wait for state to be set and districts to load
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Load districts for this state
            const districts = await getDistricts(stateOption.value);
            const districtsList = districts.map(district => ({
              value: district.id,
              label: district.display_name || district.name
            })).sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label
            setDistrictOptions(districtsList);
            
            // Wait for districts to load
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 2. Find and set district
            if (districtParam) {
              console.log("Finding and setting district:", districtParam);
              const districtOption = districtsList.find(
                option => option.label.toLowerCase() === districtParam.toLowerCase()
              );
          
          if (districtOption) {
            setSelectedDistrict(districtOption);
            console.log("District set to:", districtOption.label);
            
            // Fetch subdistricts for this district
            if (districtOption.value) {
              // Wait longer for the state to update
              console.log("Waiting for district state to update before fetching subdistricts...");
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              try {
                console.log("Fetching subdistricts for district ID:", districtOption.value);
                const subdistricts = await getSubdistricts(districtOption.value);
                const subdistrictsList = subdistricts.map(item => ({
                  value: item.id,
                  label: item.display_name || item.name, // Use display_name (e.g., "Dhar Kalan - 00200") if available
                  name: item.name,
                  subdistrict_id: item.subdistrict_id
                })).sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label
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
                      const sortedVillageOptions = villages.map(village => {
                        console.log("Processing village:", village);  // Debug each village
                        return { 
                          value: village.id, 
                          label: village.display_name || village.name, // Use display_name (with ID) or fallback to name
                          villageName: village.name, 
                          villageId: village.village_id,
                          total_population: village.total_population,
                          sc_population: village.sc_population,
                          st_population: village.st_population
                        };
                      }).sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label
                      setVillageOptions(sortedVillageOptions);
                      console.log("Village options set with", sortedVillageOptions.length, "items");
                      
                      // Find and set village
                      if (villageParam && sortedVillageOptions.length > 0) {
                        // Wait longer for villages to be set
                        console.log("Waiting for villages to load...");
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        
                        console.log("Finding village:", villageParam);
                        const villageOption = sortedVillageOptions.find(
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
          } else {
            console.warn("State not found:", stateParam);
          }
        }
      } catch (error) {
        console.error('Error processing shared link:', error);
      }
    };
    
    loadData();
  }, [location.search, stateOptions, districtOptions]);

  useEffect(() => {
    if (selectedDistrict?.value) {
      // Fetch subdistricts from API using district.value (the district ID)
      getSubdistricts(selectedDistrict.value)
        .then(subdistricts => {
          setSubdistrictOptions(
            subdistricts.map(subdistrict => ({ 
              value: subdistrict.id, 
              label: subdistrict.display_name || subdistrict.name, // Use display_name (e.g., "Dhar Kalan - 00200") if available
              name: subdistrict.name,
              subdistrict_id: subdistrict.subdistrict_id
            })).sort((a, b) => a.label.localeCompare(b.label)) // Sort alphabetically by label
          );
          setSelectedSubdistrict(null); // Reset subdistrict when district changes
          setVillageOptions([]); // Also reset villages
        })
        .catch(error => {
          console.error("Error fetching subdistricts:", error);
        });
    } else {
      setSubdistrictOptions([]);
      setSelectedSubdistrict(null);
      setVillageOptions([]);
      setSelectedVillage(null);
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
                villageId: village.village_id,
                total_population: village.total_population,
                sc_population: village.sc_population,
                st_population: village.st_population
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

  // Handle state change
  const handleStateChange = option => {
    // Clear any existing zoom lock state when selection changes
    sessionStorage.removeItem('zoomLocked');
    sessionStorage.removeItem('villageBounds');
    
    setSelectedState(option);
    // Reset all dependent selections when state changes
    setSelectedDistrict(null);
    setSelectedSubdistrict(null);
    setSelectedVillage(null);
    setSubdistrictOptions([]);
    setVillageOptions([]);
  };

  // Handle district change
  const handleDistrictChange = option => {
    // Clear any existing zoom lock state when selection changes
    sessionStorage.removeItem('zoomLocked');
    sessionStorage.removeItem('villageBounds');
    
    setSelectedDistrict(option); // Update selected district
    setSelectedSubdistrict(null); // Reset subdistrict when district changes
    setSelectedVillage(null); // Reset village when district changes
    setSubdistrictOptions([]); // Clear subdistrict options
    setVillageOptions([]); // Clear village options
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

    setIsUploading(true);
    setUploadError(null);
    
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
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const processUploadedGeoJSON = async (geojsonData) => {
    try {
      if (!selectedState || !selectedDistrict || !selectedSubdistrict || !selectedVillage || !selectedControlVillage) {
        setUploadError('Missing required parameters. Please select all fields.');
        setIsUploading(false);
        return;
      }

      // Get current year from the URL or use default
      const year = (new URLSearchParams(location.search).get('year')) || '2022';

      // Call the backend API to process the GeoJSON
      const result = await uploadCustomPolygon(
        selectedState,
        selectedDistrict.label,
        selectedSubdistrict.label,
        selectedVillage.label,
        selectedControlVillage.label,
        selectedControlVillage.value,
        year,
        geojsonData
      );

      console.log('Polygon processing result:', result);
      
      // Update the circles summary atom with the circles data for the map
      setCirclesSummary(result.circles);
      
      // Transform data for our components
      const processedData = {
        // Original GeoJSON
        polygon: geojsonData,
        // Stats for charts - now contains data for multiple years
        interventionStats: result.interventionStats,
        controlStats: result.controlStats,
        // Keep the rest of the metadata
        intervention: result.intervention,
        control: result.control,
        selectedYear: result.selectedYear
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

  

  // Load states on component mount
  useEffect(() => {
    const loadStates = async () => {
      try {
        const states = await getStates();
        const statesList = states.map(state => ({
          value: state.id,
          label: state.display_name || state.name,
          name: state.name,
          state_id: state.state_id
        })).sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label
        setStateOptions(statesList);
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };

    loadStates();
  }, []);

  // Load districts when state changes
  useEffect(() => {
    if (selectedState?.value) {
      const loadDistricts = async () => {
        try {
          const districts = await getDistricts(selectedState.value);
          const districtsList = districts.map(district => ({
            value: district.id,
            label: district.display_name || district.name,
            name: district.name,
            district_id: district.district_id
          })).sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label
          setDistrictOptions(districtsList);
          
          // Reset dependent selections
          setSelectedDistrict(null);
          setSubdistrictOptions([]);
          setSelectedSubdistrict(null);
          setVillageOptions([]);
          setSelectedVillage(null);
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      };

      loadDistricts();
    } else {
      setDistrictOptions([]);
      setSelectedDistrict(null);
      setSubdistrictOptions([]);
      setSelectedSubdistrict(null);
      setVillageOptions([]);
      setSelectedVillage(null);
    }
  }, [selectedState]);

  // Update available years when chart data changes
  useEffect(() => {
    if (landCoverChartData && landCoverChartData.labels && landCoverChartData.labels.length > 0) {
      const years = landCoverChartData.labels.map(year => ({
        value: year,
        label: year
      })).sort((a, b) => parseInt(a.value) - parseInt(b.value));
      setAvailableYears(years);
      // Reset intervention years when data changes
      setInterventionStartYear(null);
      setInterventionEndYear(null);
    }
  }, [landCoverChartData]);

  // Validate intervention years
  const handleStartYearChange = (selectedOption) => {
    setInterventionStartYear(selectedOption);
    // If end year is selected and is less than or equal to start year, reset it
    if (interventionEndYear && parseInt(interventionEndYear.value) <= parseInt(selectedOption.value)) {
      setInterventionEndYear(null);
    }
  };

  const handleEndYearChange = (selectedOption) => {
    setInterventionEndYear(selectedOption);
  };

  // Get filtered end year options (only years greater than start year)
  const getEndYearOptions = () => {
    if (!interventionStartYear) return [];
    return availableYears.filter(year => parseInt(year.value) > parseInt(interventionStartYear.value));
  };

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
                <SelectState
                  options={stateOptions}
                  onChange={handleStateChange}
                  value={selectedState}
                  placeholder="Select State..."
                />
              </div>
              <div className="mb-4 text-black max-w-xs">
                <SelectDistrict
                  key={selectedState?.value || 'no-state'} // Force re-render when state changes
                  options={districtOptions}
                  onChange={handleDistrictChange}
                  value={selectedDistrict}
                  placeholder="Select District..."
                  isDisabled={!selectedState}
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
              <div className="space-y-3">
                <ShareableLink
                  state={selectedState?.label || selectedState}
                  district={selectedDistrict}
                  subdistrict={selectedSubdistrict}
                  village={selectedVillage}
                />
                
                {/* Save Button - Show when district is selected */}
                {selectedDistrict && (
                  <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-green-800 mb-1">Save this assessment</h3>
                        <p className="text-xs text-green-600">
                          {selectedVillage 
                            ? "Save your current selections as a project" 
                            : "Complete village selection to save project"
                          }
                        </p>
                      </div>
                      <button
                        onClick={handleSaveProject}
                        disabled={!selectedVillage || !isAuthenticated}
                        className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all duration-200 flex items-center gap-2 shadow-sm ${
                          selectedVillage && isAuthenticated
                            ? 'bg-green-600 hover:bg-green-700 cursor-pointer' 
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Save
                      </button>
                    </div>
                    {!isAuthenticated && (
                      <p className="text-xs text-green-600 mt-2 italic">
                        Login required to save projects
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedVillage && (
            <VillageDetails
              selectedState={selectedState?.label || selectedState}
              selectedDistrict={selectedDistrict}
              selectedVillage={selectedVillage}
            />
          )}

          <div className="mb-2">
            <h2 className="text-xl font-semibold mb-1">Land Cover Change</h2>
            
            {/* Intervention Period Selection */}
            {selectedVillage && availableYears.length > 0 && (
              <div className="mb-3 p-3 bg-white rounded border border-gray-200">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium text-gray-800 whitespace-nowrap">Select Intervention Period:</span>
                  
                  <span className="text-sm text-gray-700 whitespace-nowrap">Start Year</span>
                  <select
                    value={interventionStartYear?.value || ''}
                    onChange={(e) => handleStartYearChange(availableYears.find(year => year.value === e.target.value))}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                  >
                    <option value="">Select</option>
                    {availableYears.map(year => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                  
                  <span className="text-sm text-gray-700 whitespace-nowrap">End Year</span>
                  <select
                    value={interventionEndYear?.value || ''}
                    onChange={(e) => handleEndYearChange(availableYears.find(year => year.value === e.target.value))}
                    disabled={!interventionStartYear}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-black disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500"
                  >
                    <option value="">Select</option>
                    {getEndYearOptions().map(year => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                  
                  {interventionStartYear && interventionEndYear && (
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                      ({interventionStartYear.label}-{interventionEndYear.label})
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="w-full bg-gray-200 h-70 rounded shadow-inner flex items-center justify-center">
              {selectedState && selectedDistrict && selectedSubdistrict && selectedVillage ? (
                loadingChartData ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <LandCoverChangeChart 
                    interventionStartYear={interventionStartYear?.value}
                    interventionEndYear={interventionEndYear?.value}
                  />
                )
              ) : (
                <p>Select all fields to see the chart</p>
              )}
            </div>
            {!loadingChartData && landCoverChartData.labels.length > 0 && (
              <DownloadCSVButton
                data={landCoverChartData}
                filename="land_cover_chart_data.csv"
                disabled={!isAuthenticated}
                isAuthenticated={isAuthenticated}
              />
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="bg-gray-200 rounded shadow-lg h-screen flex items-center justify-center mb-8 m-5">
            <DistrictMap
              selectedState={selectedState?.label || selectedState}
              selectedDistrict={selectedDistrict}
              selectedSubdistrict={selectedSubdistrict}
              selectedVillage={selectedVillage}
              scrollRef={scrollTargetRef}
              districtMapRef={districtMapRef}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>
      </div>

      {compareVillagesClicked && (
        <>
          <div ref={scrollTargetRef} className="flex flex-col h-full w-full lg:flex-row gap-6 mb-12">
            <div className="flex-1 bg-blue-100 rounded-lg shadow-lg p-5 ml-3 min-h-[700px] flex flex-col justify-start">
              <div className="flex flex-col lg:flex-row gap-6 ml-3 z-[9000]">
                <h2 className="text-l font-semibold text-gray-700 mt-2 mb-2">Intervention Village</h2>
                <div className="flex flex-col lg:flex-row gap-4 mb-4 z-[9001]">
                  <SelectState
                    key={selectedState?.value}
                    options={stateOptions}
                    onChange={handleStateChange}
                    value={selectedState}
                  />
                  <SelectDistrict
                    key={selectedState?.value || 'no-state'} // Force re-render when state changes
                    options={districtOptions}
                    onChange={handleDistrictChange}
                    value={selectedDistrict}
                    isDisabled={!selectedState}
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
                      className={`font-bold py-2 px-4 rounded ${
                        isAuthenticated && selectedVillage && !isUploading
                          ? 'bg-blue-500 hover:bg-blue-700 text-white cursor-pointer'
                          : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      }`}
                      disabled={!selectedVillage || isUploading || !isAuthenticated}
                    >
                      {isUploading ? 'Processing...' : 'Polygon'}
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
                    {!isAuthenticated && (
                      <div className="text-gray-500 text-xs mt-1">Login required</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Map Container with Full Height */}
              <div className="flex-1 bg-gray-200 z-[100] rounded shadow-lg min-h-[500px] h-full flex items-center justify-center">
                <InterventionMap
                  selectedState={selectedState?.label || selectedState}
                  selectedDistrict={selectedDistrict}
                  selectedSubdistrict={selectedSubdistrict}
                  selectedVillage={selectedVillage}
                  interventionMapRef={interventionMapRef}
                  uploadedGeoJSON={uploadedGeoJSON}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>

            <div className="flex-1 bg-blue-100 rounded-lg shadow-lg p-5 ml-3 min-h-[700px] flex flex-col justify-start">
              <div className="flex flex-col lg:flex-row gap-6 ml-3 z-[9000]">
                <h2 className="text-l font-semibold text-gray-700 mt-2 mb-2">Control Village</h2>
                <div className="flex flex-col lg:flex-row gap-4 mb-4 z-[9001]">
                   <SelectVillage2
                  options={villageOptions}
                  onChange={handleControlVillageChange}
                  placeholder="Select Control Village..."
                  value={selectedControlVillage}
                />
                
                {/* Save Project Button */}
                {selectedVillage && (
                  <div className="flex items-center">
                    <button
                      onClick={handleSaveProject}
                      disabled={!selectedVillage || !isAuthenticated}
                      className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-all duration-200 flex items-center gap-2 shadow-sm ${
                        selectedVillage && isAuthenticated
                          ? 'bg-green-600 hover:bg-green-700 cursor-pointer' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                      title={!isAuthenticated ? "Login required to save project" : "Save current comparison as a project"}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Save Project
                    </button>
                  </div>
                )}
                </div>
                
                {!isAuthenticated && selectedVillage && (
                  <div className="ml-3 mb-2">
                    <p className="text-xs text-gray-600 italic">
                      Login required to save projects
                    </p>
                  </div>
                )}
              </div>

              {/* Map Container with Full Height */}
              <div className="flex-1 bg-gray-200 z-[100] rounded shadow-lg min-h-[500px] h-full flex items-center justify-center">
              <CompareMap
                  selectedState={selectedState?.label || selectedState}
                  selectedDistrict={selectedDistrict}
                  selectedSubdistrict={selectedSubdistrict}
                  selectedVillage={selectedVillage}
                  compareMapRef={compareMapRef}
                />
              </div>
            </div>
          </div>

          {/* Container with extra margin to ensure spacing */}
          <div className="mt-24">
            {/* Intervention Period Selection for Comparison Chart */}
            {selectedVillage && availableYears.length > 0 && (
              <div className="mb-3 p-3 bg-white rounded border border-gray-200 mx-5">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium text-gray-800 whitespace-nowrap">Select Intervention Period:</span>
                  
                  <span className="text-sm text-gray-700 whitespace-nowrap">Start Year</span>
                  <select
                    value={interventionStartYear?.value || ''}
                    onChange={(e) => handleStartYearChange(availableYears.find(year => year.value === e.target.value))}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
                  >
                    <option value="">Select</option>
                    {availableYears.map(year => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                  
                  <span className="text-sm text-gray-700 whitespace-nowrap">End Year</span>
                  <select
                    value={interventionEndYear?.value || ''}
                    onChange={(e) => handleEndYearChange(availableYears.find(year => year.value === e.target.value))}
                    disabled={!interventionStartYear}
                    className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-black disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-500"
                  >
                    <option value="">Select</option>
                    {getEndYearOptions().map(year => (
                      <option key={year.value} value={year.value}>
                        {year.label}
                      </option>
                    ))}
                  </select>
                  
                  {interventionStartYear && interventionEndYear && (
                    <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                      ({interventionStartYear.label}-{interventionEndYear.label})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Chart Section */}
            <div className="bg-white rounded shadow-inner flex items-center justify-center p-5 mb-5">
              {selectedState && selectedDistrict && selectedSubdistrict && selectedVillage ? (
                loadingChartData ? (
                  <div className="items-center justify-center">
                    <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <InterventionCompareChart 
                    interventionStartYear={interventionStartYear?.value} 
                    interventionEndYear={interventionEndYear?.value} 
                  />
                )
              ) : (
                <p>Select all fields to see the chart</p>
              )}
            </div>
            
            {/* Position CSV download button with proper spacing */}
            <div className="mb-10 pb-4 flex justify-center">
              {!loadingChartData && interventionChartData.labels.length > 0 && (
                <DownloadCSVButton
                  data={interventionChartData}
                  filename="intervention_chart_data.csv"
                  disabled={!isAuthenticated}
                  isAuthenticated={isAuthenticated}
                />
              )}
            </div>
          </div>
        </>
      )}
      
      {/* Save Project Modal */}
      <SaveProjectModal
        isOpen={showSaveModal}
        onClose={handleSaveModalClose}
        onSave={handleProjectSave}
        projectData={getCurrentProjectData()}
        isLoading={saving}
        mapRefs={{
          districtMap: districtMapRef,
          interventionMap: interventionMapRef,
          compareMap: compareMapRef
        }}
        selectedVillage={selectedVillage}
        compareMode={compareVillagesClicked}
      />
      
      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg z-[10001] max-w-sm">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong className="font-semibold">Success!</strong>
              <p className="text-sm">Project saved successfully.</p>
            </div>
          </div>
        </div>
      )}
      
      {saveError && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg z-[10001] max-w-sm">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-2 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <strong className="font-semibold">Error!</strong>
              <p className="text-sm">{saveError}</p>
            </div>
            <button
              onClick={() => setSaveError(null)}
              className="ml-2 text-red-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ImpactAssessmentPage;