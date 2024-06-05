// src/pages/ImpactAssessmentPage.jsx
import { useState, useEffect, useRef } from 'react';
import LandCoverChangeChart from '../components/LandCoverChangeChart';
import SelectDistrict from '../components/SelectDistrict';
import Navbar from '../components/Navbar';
import SelectVillage from '../components/SelectVillage';
import DistrictMap from '../components/DistrictMap';
import SelectDistrict2 from '../components/SelectDistrict2';
import SelectVillage2 from '../components/SelectVillage2';
import SelectSubdistrict from '../components/SelectSubdistrict';
import CompareMap from '../components/CompareMap';
import InterventionMap from '../components/InterventionMap';
import InterventionCompareChart from '../components/InterventionCompareChart';
import VillageDetails from '../components/VillageDetails';
import DownloadCSVButton from '../components/DownloadCSVButton';

const ImpactAssessmentPage = () => {
  const districtDisplayNames = {
    'karauli': 'Karauli, RJ',
  };

  const subdistrictByDistrict = {
    'karauli' : ['Todabhim']
  }

  const villagesBySubDistrict = {
    'todabhim': ['anatpura', 'bhanakpura', 'bhaiseena', 'tudawali', 'nisoora'],
  };

  const selectedState = 'Rajasthan'; // Hardcoded for now
  // const selectedSubdistrict = 'todabhim'; // Hardcoded for now

  const scrollTargetRef = useRef(null);

  const [selectedDistrict, setSelectedDistrict] = useState({ value: 'karauli', label: 'Karauli, RJ' });
  const [selectedVillage, setSelectedVillage] = useState('');
  const [villageOptions, setVillageOptions] = useState([]);
  const [loadingChartData, setLoadingChartData] = useState(false); // Correctly declare and use this state
  const [landCoverChartData, setLandCoverChartData] = useState({ labels: [], datasets: [] });
  const [interventionChartData, setInterventionChartData] = useState({ labels: [], datasets: [] });
  // Initialize states for subdistrict and its options
  const [selectedSubdistrict, setSelectedSubdistrict] = useState(null);
  const [subdistrictOptions, setSubdistrictOptions] = useState([]);
  const [district_name, setDistrictName] = useState(null)

  useEffect(() => {
    console.log(selectedDistrict.value)
    if (selectedDistrict) {
      console.log("new district:",district_name)
      const subdistricts = subdistrictByDistrict[selectedDistrict.value] || [];
      setSubdistrictOptions(subdistricts.map(subdistrict => ({ value: subdistrict.toLowerCase(), label: subdistrict })));
      setSelectedSubdistrict(null);  // Reset subdistrict when district changes
      setVillageOptions([]);  // Also reset villages
    }
  }, [selectedDistrict]);

  useEffect(() => {
    console.log("Selected Subdistrict:", selectedSubdistrict);
    if (selectedSubdistrict) {
        console.log("Fetching villages for:", selectedSubdistrict);
        const villages = villagesBySubDistrict[selectedSubdistrict] || [];
        console.log("Villages found:", villages);
        setVillageOptions(villages.map(village => ({ value: village.toLowerCase(), label: village })));
        setSelectedVillage(null);
    } else {
        setVillageOptions([]);
    }
}, [selectedSubdistrict]);


  const handleDistrictChange = option => {
    setSelectedDistrict(option);
    setDistrictName(selectedDistrict.value)
  };

  const handleSubdistrictChange = option => {
    console.log("Subdistrict selected:", option);
    setSelectedSubdistrict(option); // Ensure option is the full object, not just the value
};


  const handleVillageChange = option => {
    setSelectedVillage(option);
  };

  const options = Object.keys(districtDisplayNames).map(key => ({
    value: key,  // Ensure this key corresponds to the actual keys in `districtDisplayNames`
    label: districtDisplayNames[key]
  }));
  
  console.log("Options in Parent before passing to SelectDistrict:", options);

  const handleLandCoverDataChange = data => {
    setLandCoverChartData(data);
    setLoadingChartData(false);
  };

  const handleInterventionDataChange = data => {
    setInterventionChartData(data);
    setLoadingChartData(false);
  };

  return (
    <div className="font-sans bg-white h-screen w-screen overflow-x-hidden">
      <Navbar />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-white p-6 rounded">
          <div className="container text-left mb-8 text-neutral-800">
            <h1 className="text-5xl font-bold mb-2">Impact Assessment</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-4 text-black">
            <SelectDistrict
                options={Object.keys(districtDisplayNames).map(key => ({ value: key, label: districtDisplayNames[key] }))}
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
                value={selectedSubdistrict}
              />
            </div>
            <div className="mb-4">
            <SelectVillage
  options={villageOptions}
  onChange={handleVillageChange}
  placeholder="Select Village..."
  isDisabled={!selectedSubdistrict || villageOptions.length === 0} // Disable if no subdistrict is selected or no villages are available
  value={villageOptions.find(option => option.value === selectedVillage?.value)}
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
              {selectedState && selectedDistrict.value && selectedSubdistrict && selectedVillage ? (
                loadingChartData ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <LandCoverChangeChart
                    stateName={selectedState}
                    districtName={selectedDistrict}
                    subdistrictName={selectedSubdistrict}
                    villageName={selectedVillage}
                    onDataChange={handleLandCoverDataChange}
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

      <div className="flex flex-col lg:flex-row gap-6 ml-10">
        <div className="mb-4">
          <SelectDistrict2
            options={Object.keys(districtDisplayNames).map(key => ({ value: key, label: districtDisplayNames[key] }))}
            onChange={handleDistrictChange}
            value={selectedDistrict}
          />
        </div>

        <div>
          <SelectVillage2
            options={villageOptions}
            onChange={handleVillageChange}
            placeholder="Select Village..."
            isDisabled={!selectedDistrict}
            value={villageOptions.find(option => option.value === selectedVillage?.value)}
          />
        </div>
      </div>

      <div className="flex flex-col h-full w-full lg:flex-row gap-6 mb-8" ref={scrollTargetRef}>
        <div className="flex-1">
          <div className="bg-gray-200 rounded shadow-lg h-full flex items-center justify-center mb-8 m-5">
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

      <div className="bg-gray-200 h-80 rounded shadow-inner flex items-center justify-center p-5">
        {selectedState && selectedDistrict && selectedSubdistrict && selectedVillage ? (
          loadingChartData ? (
            <div className="items-center justify-center">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <InterventionCompareChart
              stateName={selectedState}
              districtName={selectedDistrict}
              subdistrictName={selectedSubdistrict}
              villageName={selectedVillage}
              onDataChange={handleInterventionDataChange}
            />
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
    </div>
  );
};

export default ImpactAssessmentPage;
