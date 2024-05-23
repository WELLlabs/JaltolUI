// src/pages/ImpactAssessmentPage.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
        <div className="flex-1 bg-white p-6 rounded shadow-lg">
          <div className="container text-left mb-8 text-neutral-800 ">
            <h1 className="text-5xl font-bold mb-2">Impact Assessment</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
          </div>
          {/* Dropdown Section */}
          <div className="w-full max-w-xs">
            <div className="mb-4 text-black"> {/* Add margin to the bottom of the district select */}
              <SelectDistrict
                options={Object.keys(districtDisplayNames).map(key => ({ value: key, label: districtDisplayNames[key] }))}
                onChange={handleDistrictChange}
                value={selectedDistrict} // Make sure selectedDistrict is an object { value: 'karauli', label: 'Karauli, RJ' }
              />
            </div>
            <div className="mb-4"> {/* Add margin to the bottom of the village select if needed */}
              <SelectVillage
                options={villageOptions}
                onChange={handleVillageChange}
                placeholder="Select Village..."
                isDisabled={!selectedDistrict}
                value={villageOptions.find(option => option.value === selectedVillage)}
              />
            </div>
          </div>

          {/* Village Details */}
          <div className="mb-4 text-neutral-800">
            <h2 className="text-lg font-semibold mb-2">Village Details</h2>
            <div className="flex justify-between">
              <div>
                <p><strong>Name:</strong> Sariarukh</p>
                <p><strong>District:</strong> Dhamtari</p>
              </div>
              <div>
                <p><strong>Population:</strong> 192</p>
                <p><strong>State:</strong> Chhattisgarh</p>
              </div>
            </div>
          </div>


          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Land Cover Change</h2>
            <div className="w-full bg-gray-200 h-64 rounded shadow-inner flex items-center justify-center">
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
          <div className="bg-gray-200 rounded shadow-lg h-full flex items-center justify-center mb-8 m-5">

            <DistrictMap
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
              selectedSubdistrict={selectedSubdistrict}
              selectedVillage={selectedVillage}
            />
          </div>
        </div>
      </div>

      {/* Compare Villages Button */}
      <div className="text-center mt-8">
        <Link to="/compare-villages" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded block text-center no-underline">
          COMPARE SIMILAR VILLAGES
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 p-8">
        {/* Left Column */}

          {/* Map Display Section */}
          <div className=" mb-4"> {/* Add margin to the bottom of the district select */}
              <SelectDistrict2
                options={districtDisplayNames}
                onChange={handleDistrictChange}
                placeholder="Karauli, RJ "
                value={selectedDistrict ? { value: selectedDistrict, label: districtDisplayNames[selectedDistrict] } : ''}
              />
            </div>



        {/* Right Column */}

          {/* Map Display Section */}
          <div className="mb-4"> {/* Add margin to the bottom of the village select if needed */}
              <SelectVillage2
                options={villageOptions}
                onChange={handleVillageChange}
                placeholder="Select Village..."
                isDisabled={!selectedDistrict}
                value={villageOptions.find(option => option.value === selectedVillage)}
              />
            </div>
      </div>
      <div className="flex flex-col h-full w-full lg:flex-row gap-6 p-8">
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
