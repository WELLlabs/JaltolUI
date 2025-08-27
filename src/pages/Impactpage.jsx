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
import { usePostHogEvents } from '../utils/posthogEvents';



const ImpactAssessmentPage = () => {
  const scrollTargetRef = useRef(null);
  const districtMapRef = useRef(null);
  const interventionMapRef = useRef(null);
  const compareMapRef = useRef(null);
  const fileInputRef = useRef(null);
  const location = useLocation();
  const { trackImpactAssessmentVisited } = usePostHogEvents();

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
  const [isLoadingFromUrl, setIsLoadingFromUrl] = useState(false);
  const [urlProjectLoaded, setUrlProjectLoaded] = useState(false);
  
  const { isAuthenticated } = useAuth();
  const [uploadedGeoJSON, setUploadedGeoJSON] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const setCustomPolygonData = useSetRecoilState(customPolygonDataAtom);
  const setShowPolygonData = useSetRecoilState(showPolygonDataAtom);
  const setCirclesSummary = useSetRecoilState(circlesSummaryAtom);

  // Track page visit with source URL
  useEffect(() => {
    const sourceUrl = document.referrer || null;
    trackImpactAssessmentVisited(sourceUrl);
  }, []);

  // Clear all state when navigating away from impact assessment page
  useEffect(() => {
    return () => {
      // Clear all selections when component unmounts (user navigates away)
      setSelectedState(null);
      setSelectedDistrict(null);
      setSelectedSubdistrict(null);
      setSelectedVillage(null);
      setSelectedControlVillage(null);
      setStateOptions([]);
      setDistrictOptions([]);
      setSubdistrictOptions([]);
      setVillageOptions([]);
      setUrlProjectLoaded(false);
      
      // Clear session storage
      sessionStorage.removeItem('zoomLocked');
      sessionStorage.removeItem('villageBounds');
      
      console.log('🧹 Cleared all selections on navigation away from impact assessment');
    };
  }, []); // Empty dependency array means this runs only on unmount



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

  // Load saved project from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Get URL parameters and decode them properly
    const stateParam = decodeURIComponent(params.get('state') || '');
    const districtParam = decodeURIComponent(params.get('district') || '');
    const subdistrictParam = decodeURIComponent(params.get('subdistrict') || '');
    const villageParam = decodeURIComponent(params.get('village') || '');
    const projectId = params.get('projectId');
    
    // Only proceed if we have parameters and state options are loaded
    if (!stateParam || !stateOptions || stateOptions.length === 0) {
      return;
    }
    
    // Don't reload if we already successfully loaded this project
    const currentProjectKey = `${stateParam}-${districtParam}-${subdistrictParam}-${villageParam}`;
    if (urlProjectLoaded === currentProjectKey) {
      console.log('Project already loaded, skipping...');
      return;
    }
    
    console.log('Loading saved project from URL:', { 
      stateParam, 
      districtParam, 
      subdistrictParam, 
      villageParam, 
      projectId 
    });
    
    const loadProject = async () => {
      try {
        setIsLoadingFromUrl(true);
        console.log('🚀 Starting URL project loading...');
        
        // 1. Find and set state
        console.log('Available states:', stateOptions.map(s => s.label));
        const stateOption = stateOptions.find(s => 
          s.label.toLowerCase().trim() === stateParam.toLowerCase().trim()
        );
        
        if (!stateOption) {
          console.error('State not found:', stateParam);
          console.log('Available state options:', stateOptions);
          return;
        }
        
        console.log('✅ State found and setting:', stateOption);
            setSelectedState(stateOption);
            
        // Wait a bit for state to be set
        await new Promise(resolve => setTimeout(resolve, 100));
            
        // 2. Load and set district if provided
        if (districtParam) {
          console.log('Loading districts for state ID:', stateOption.value);
            const districts = await getDistricts(stateOption.value);
          console.log('Districts loaded:', districts.length, districts);
          
          const districtsList = districts.map(d => ({
            value: d.id,
            label: d.display_name || d.name,
            name: d.name,
            district_id: d.district_id
          }));
            setDistrictOptions(districtsList);
            
          console.log('Looking for district:', districtParam);
          console.log('Available districts:', districtsList.map(d => d.label));
          
          // Try multiple matching strategies for district names
          let districtOption = null;
          
          // Strategy 1: Exact match
          districtOption = districtsList.find(d => 
            d.label.toLowerCase().trim() === districtParam.toLowerCase().trim() ||
            d.name.toLowerCase().trim() === districtParam.toLowerCase().trim()
          );
          
          // Strategy 2: If no exact match, try matching without suffix (e.g., "Adilabad, AP" -> "Adilabad")
          if (!districtOption && districtParam.includes(',')) {
            const districtBaseName = districtParam.split(',')[0].trim();
            console.log('Trying district base name:', districtBaseName);
            districtOption = districtsList.find(d => 
              d.label.toLowerCase().trim() === districtBaseName.toLowerCase().trim() ||
              d.name.toLowerCase().trim() === districtBaseName.toLowerCase().trim()
            );
          }
          
          // Strategy 3: If still no match, try finding districts that start with the parameter
          if (!districtOption) {
            console.log('Trying partial match for district');
            districtOption = districtsList.find(d => 
              d.label.toLowerCase().startsWith(districtParam.toLowerCase().trim()) ||
              d.name.toLowerCase().startsWith(districtParam.toLowerCase().trim()) ||
              districtParam.toLowerCase().startsWith(d.label.toLowerCase().trim()) ||
              districtParam.toLowerCase().startsWith(d.name.toLowerCase().trim())
            );
          }
          
          if (districtOption) {
            console.log('✅ District found and setting:', districtOption);
            setSelectedDistrict(districtOption);
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // 3. Load and set subdistrict if provided
            if (subdistrictParam) {
              console.log('Loading subdistricts for district ID:', districtOption.value);
                const subdistricts = await getSubdistricts(districtOption.value);
              console.log('Subdistricts loaded:', subdistricts.length, subdistricts);
              
              const subdistrictsList = subdistricts.map(s => ({
                value: s.id,
                label: s.display_name || s.name,
                name: s.name,
                subdistrict_id: s.subdistrict_id
              }));
                setSubdistrictOptions(subdistrictsList);
              
                             console.log('Looking for subdistrict:', subdistrictParam);
               console.log('Available subdistricts:', subdistrictsList.map(s => s.label));
               
               // Try multiple matching strategies for subdistrict names
               let subdistrictOption = null;
               
               // Strategy 1: Exact match
               subdistrictOption = subdistrictsList.find(s => 
                 s.label.toLowerCase().trim() === subdistrictParam.toLowerCase().trim() ||
                 s.name.toLowerCase().trim() === subdistrictParam.toLowerCase().trim()
               );
               
               // Strategy 2: If no exact match, try matching without suffix
               if (!subdistrictOption && subdistrictParam.includes(',')) {
                 const subdistrictBaseName = subdistrictParam.split(',')[0].trim();
                 console.log('Trying subdistrict base name:', subdistrictBaseName);
                 subdistrictOption = subdistrictsList.find(s => 
                   s.label.toLowerCase().trim() === subdistrictBaseName.toLowerCase().trim() ||
                   s.name.toLowerCase().trim() === subdistrictBaseName.toLowerCase().trim()
                 );
               }
               
               // Strategy 3: If still no match, try partial matching
               if (!subdistrictOption) {
                 console.log('Trying partial match for subdistrict');
                 subdistrictOption = subdistrictsList.find(s => 
                   s.label.toLowerCase().includes(subdistrictParam.toLowerCase().trim()) ||
                   s.name.toLowerCase().includes(subdistrictParam.toLowerCase().trim()) ||
                   subdistrictParam.toLowerCase().includes(s.label.toLowerCase().trim()) ||
                   subdistrictParam.toLowerCase().includes(s.name.toLowerCase().trim())
                 );
               }
                  
                  if (subdistrictOption) {
                console.log('✅ Subdistrict found and setting:', subdistrictOption);
                    setSelectedSubdistrict(subdistrictOption);
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // 4. Load and set village if provided
                if (villageParam) {
                  console.log('Loading villages for subdistrict ID:', subdistrictOption.value);
                      const villages = await getVillages(subdistrictOption.value);
                  console.log('Villages loaded:', villages.length, villages);
                  
                  const villagesList = villages.map(v => ({
                    value: v.id,
                    label: v.display_name || v.name,
                    villageName: v.name,
                    villageId: v.village_id,
                    total_population: v.total_population,
                    sc_population: v.sc_population,
                    st_population: v.st_population
                  }));
                  setVillageOptions(villagesList);
                  
                                     console.log('Looking for village:', villageParam);
                   console.log('Available villages:', villagesList.map(v => v.label));
                   
                   // Try multiple matching strategies for village names
                   let villageOption = null;
                   
                   // Strategy 1: Exact match
                   villageOption = villagesList.find(v => 
                     v.label.toLowerCase().trim() === villageParam.toLowerCase().trim() ||
                     v.villageName.toLowerCase().trim() === villageParam.toLowerCase().trim()
                   );
                   
                   // Strategy 2: If no exact match, try matching without suffix
                   if (!villageOption && villageParam.includes(',')) {
                     const villageBaseName = villageParam.split(',')[0].trim();
                     console.log('Trying village base name:', villageBaseName);
                     villageOption = villagesList.find(v => 
                       v.label.toLowerCase().trim() === villageBaseName.toLowerCase().trim() ||
                       v.villageName.toLowerCase().trim() === villageBaseName.toLowerCase().trim()
                     );
                   }
                   
                   // Strategy 3: If still no match, try matching by extracting name from display format
                   if (!villageOption && villageParam.includes('-')) {
                     const villageNamePart = villageParam.split('-')[0].trim();
                     console.log('Trying village name part:', villageNamePart);
                     villageOption = villagesList.find(v => 
                       v.label.toLowerCase().includes(villageNamePart.toLowerCase()) ||
                       v.villageName.toLowerCase().trim() === villageNamePart.toLowerCase().trim()
                     );
                   }
                   
                   // Strategy 4: If still no match, try partial matching
                   if (!villageOption) {
                     console.log('Trying partial match for village');
                     villageOption = villagesList.find(v => 
                       v.label.toLowerCase().includes(villageParam.toLowerCase().trim()) ||
                       v.villageName.toLowerCase().includes(villageParam.toLowerCase().trim()) ||
                       villageParam.toLowerCase().includes(v.villageName.toLowerCase().trim())
                     );
                   }
                        
                        if (villageOption) {
                    console.log('✅ Village found and setting:', villageOption);
                          setSelectedVillage(villageOption);
                        } else {
                    console.error('❌ Village not found:', villageParam);
                    console.log('Available village names:', villagesList.map(v => ({ label: v.label, name: v.villageName })));
                        }
                } else {
                  console.log('No village parameter provided');
                      }
              } else {
                console.error('❌ Subdistrict not found:', subdistrictParam);
                console.log('Available subdistrict names:', subdistrictsList.map(s => ({ label: s.label, name: s.name })));
                    }
                  } else {
              console.log('No subdistrict parameter provided');
            }
          } else {
            console.error('❌ District not found:', districtParam);
            console.log('Available district names:', districtsList.map(d => ({ label: d.label, name: d.name })));
            }
          } else {
          console.log('No district parameter provided');
          }
        
        console.log('✅ Project loading completed');
        // Mark this project as successfully loaded
        setUrlProjectLoaded(currentProjectKey);
        
        // Wait a bit before allowing other useEffects to run
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error('❌ Error loading project from URL:', error);
      } finally {
        setIsLoadingFromUrl(false);
        console.log('🏁 URL project loading finished');
      }
    };
    
    // Run the loading function
    loadProject();
  }, [stateOptions, location.search]);

  useEffect(() => {
    // Don't auto-load if we're currently loading from URL or just finished loading
    if (isLoadingFromUrl || urlProjectLoaded) {
      console.log('⏸️ Skipping district auto-load - URL loading in progress or completed');
      return;
    }
    
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
  }, [selectedDistrict, isLoadingFromUrl, urlProjectLoaded]);

  // Fetch villages based on selected subdistrict
  useEffect(() => {
    // Don't auto-load if we're currently loading from URL or just finished loading
    if (isLoadingFromUrl || urlProjectLoaded) {
      console.log('⏸️ Skipping village auto-load - URL loading in progress or completed');
      return;
    }
    
    if (selectedSubdistrict && selectedSubdistrict.value) {
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
              if (import.meta.env.DEV && villages.length <= 5) {
                console.log("Processing village:", village.name);  // Only log if few villages to prevent spam
              }
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
          console.log(`Village options set with ${sortedVillageOptions.length} items`);
          setSelectedVillage(null);
        })
        .catch(error => {
          console.error("Error fetching villages:", error);
        });
    } else {
      setVillageOptions([]);
    }
  }, [selectedSubdistrict, isLoadingFromUrl, urlProjectLoaded]);

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
    
    // Reset URL project loaded flag to allow normal useEffect behavior
    setUrlProjectLoaded(false);
    
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
    
    // Reset URL project loaded flag to allow normal useEffect behavior
    setUrlProjectLoaded(false);
    
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
    
    // Reset URL project loaded flag to allow normal useEffect behavior
    setUrlProjectLoaded(false);
    
    // Log the change to make sure it's being called
    console.log("Subdistrict selected:", option);

    // Store the full subdistrict object as-is (don't modify the label)
    setSelectedSubdistrict(option);
    // Reset the selected village and village options when a new subdistrict is selected
    setSelectedVillage(null);
    setVillageOptions([]);
  };

  // Update the handleVillageChange function
  const handleVillageChange = (option) => {
    // Clear any existing zoom lock state when selection changes
    sessionStorage.removeItem('zoomLocked');
    sessionStorage.removeItem('villageBounds');
    
    // Reset URL project loaded flag to allow normal useEffect behavior
    setUrlProjectLoaded(false);
    
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
      const year = (new URLSearchParams(location.search).get('year')) || '2023';

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
        console.log('State options loaded:', statesList.length, 'states');
      } catch (error) {
        console.error('Error fetching states:', error);
      }
    };

    // Simple state loading on mount

    loadStates();
  }, []);



  // Load districts when state changes
  useEffect(() => {
    // Don't auto-load if we're currently loading from URL or just finished loading
    if (isLoadingFromUrl || urlProjectLoaded) {
      console.log('⏸️ Skipping state auto-load - URL loading in progress or completed');
      return;
    }
    
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
  }, [selectedState, isLoadingFromUrl, urlProjectLoaded]);

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