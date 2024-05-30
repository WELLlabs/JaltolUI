// src/pages/ImpactAssessmentPage.jsx
import { useState, useEffect, useRef } from 'react';
import LandCoverChangeChart from '../components/LandCoverChangeChart';
import SelectDistrict from '../components/SelectDistrict';
import Navbar from '../components/Navbar';
import SelectVillage from '../components/SelectVillage';
import DistrictMap from '../components/DistrictMap';
import SelectDistrict2 from '../components/SelectDistrict2';
import SelectVillage2 from '../components/SelectVillage2';
import CompareMap from '../components/CompareMap';
import InterventionMap from '../components/InterventionMap';
import InterventionCompareChart from '../components/InterventionCompareChart';
import VillageDetails from '../components/VillageDetails';

const ImpactAssessmentPage = () => {
  const districtDisplayNames = {
    // 'anantapur': 'Anantapur, AP',
    // 'dhamtari': 'Dhamtari, CG',
    // 'uttar bastar kanker': 'Kanker, CG',
    'karauli': 'Karauli, RJ',
    // 'koppal': 'Koppal, KA',
    // 'thane': 'Palghar, MH',
    // 'raichur': 'Raichur, KA',
  };

  const villagesByDistrict = {
    'karauli': [
      'anatpura', 'bhanakpura', 'bhaiseena', 'tudawali', 'nisoora'
    ],
    'dhamtari': [
      'li', 'agur', 'Amar', 'Ana', 'Atmakur',
      'Bale', 'Beluguppa', 'Bommanhmasamudram',
      'Bukkapatnam', 'Bukkaraya Saram', 'Chennepalle', 'Chir',
    ],
  };

  const selectedState = 'Rajasthan'; // Hardcoded for now
  const selectedSubdistrict = 'todabhim'; // Hardcoded for now

  const scrollTargetRef = useRef(null);

  const [selectedDistrict, setSelectedDistrict] = useState({ value: 'karauli', label: 'Karauli, RJ' });
  const [selectedVillage, setSelectedVillage] = useState('');
  const [villageOptions, setVillageOptions] = useState([]);
  const [loadingChartData, setLoadingChartData] = useState(false);

  // Function to handle changes in the district dropdown
  useEffect(() => {
    // Load villages for the initially selected district
    const villages = villagesByDistrict[selectedDistrict.value];
    const options = villages.map(village => ({ value: village.toLowerCase(), label: village }));
    setVillageOptions(options);
  }, [selectedDistrict]); // Empty dependency array ensures this runs only once on mount

  const handleDistrictChange = option => {
    setSelectedDistrict(option);
    setSelectedVillage(null); // Reset the selected village
    // Update villages based on the selected district
    const villages = villagesByDistrict[option.value];
    const options = villages.map(village => ({ value: village.toLowerCase(), label: village }));
    setVillageOptions(options);
  };

  const handleVillageChange = option => {
    setSelectedVillage(option);
  };


  return (
    <div className="font-sans bg-white h-screen w-screen overflow-x-hidden">
      <Navbar />
      {/* Content Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="flex-1 bg-white p-6 rounded ">
          <div className="container text-left mb-8 text-neutral-800 ">
            <h1 className="text-5xl font-bold mb-2">Impact Assessment</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
          </div>
          {/* Dropdown Section */}
          <div className="w-full max-w-xs">
            <div className="mb-6 text-black"> {/* Add margin to the bottom of the district select */}
              <SelectDistrict
                options={Object.keys(districtDisplayNames).map(key => ({ value: key, label: districtDisplayNames[key] }))}
                onChange={handleDistrictChange}
                value={selectedDistrict} // Make sure selectedDistrict is an object { value: 'karauli', label: 'Karauli, RJ' }
              />
            </div>
            <div className="mb-6"> {/* Add margin to the bottom of the village select if needed */}
              <SelectVillage
                options={villageOptions}
                onChange={handleVillageChange}
                placeholder="Select Village..."
                isDisabled={!selectedDistrict}
                value={villageOptions.find(option => option.value === selectedVillage?.value)}
              />
            </div>
          </div>

          {/* Village Details */}
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
            <div className="w-full bg-gray-200 h-80 rounded shadow-inner flex items-center justify-center">
              {selectedState && selectedDistrict && selectedSubdistrict && selectedVillage ? (
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
                    onChartDataLoaded={() => setLoadingChartData(false)} // Call this when data is loaded
                  />
                )
              ) : (
                <p>Select all fields to see the chart</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex-1">
          {/* Map Display Section */}
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
        {/* Left Column */}

        {/* Map Display Section */}
        <div className=" mb-4"> {/* Add margin to the bottom of the district select */}
          <SelectDistrict2
            options={Object.keys(districtDisplayNames).map(key => ({ value: key, label: districtDisplayNames[key] }))}
            onChange={handleDistrictChange}
            value={selectedDistrict} 
          />
        </div>



        {/* Right Column */}

        {/* Map Display Section */}
        <div > {/* Add margin to the bottom of the village select if needed */}
        <SelectVillage2
            options={villageOptions}
            onChange={handleVillageChange}
            placeholder="Select Village..."
            isDisabled={!selectedDistrict}
            value={selectedVillage}
          />
        </div>
      </div>
      <div className="flex flex-col h-full w-full lg:flex-row gap-6 mb-8" ref={scrollTargetRef} >
        {/* Left Column */}
        <div className="flex-1">
          {/* Map Display Section */}
          <div className="bg-gray-200 rounded shadow-lg h-full flex items-center justify-center mb-8 m-5">
            <InterventionMap
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              selectedSubdistrict={selectedSubdistrict}
              selectedVillage={selectedVillage}
            />
          </div>


        </div>

        {/* Right Column */}
        
          {selectedVillage && (
            <div className="flex-1">
            {/* Map Display Section */}
            <div className="bg-gray-200 rounded shadow-lg h-full flex items-center justify-center mb-8 m-5">
              <CompareMap
                selectedState={selectedState}
                selectedDistrict={selectedDistrict}
                selectedSubdistrict={selectedSubdistrict}
                selectedVillage={selectedVillage}
              />
            </div>
            
        </div>
          )}

      </div>

      <div className=" bg-gray-200 h-64 rounded shadow-inner flex items-center justify-center p-10">
        {selectedState && selectedDistrict && selectedSubdistrict && selectedVillage ? (
          loadingChartData ? (
            <div className=" items-center justify-center">
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
              onChartDataLoaded={() => setLoadingChartData(false)} // Call this when data is loaded
            />
          )
        ) : (
          <p>Select all fields to see the chart</p>
        )}
      </div>
    </div>


  );
};

export default ImpactAssessmentPage;
