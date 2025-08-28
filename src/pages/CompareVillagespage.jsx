// src/pages/CompareVillagespage.jsx
import { useState, useEffect } from 'react';
// import LandCoverChangeChart from '../components/LandCoverChangeChart';
import SelectDistrict2 from '../components/SelectDistrict2';
import SelectVillage2 from '../components/SelectVillage2';
import DistrictMap from '../components/DistrictMap';
import CompareMap from '../components/CompareMap';

const CompareVillagesPage = () => {
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

  

  const [selectedDistrict, setSelectedDistrict] = useState('Karauli');
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [villageOptions, setVillageOptions] = useState([]);

  // Function to handle changes in the district dropdown
  useEffect(() => {
    // Automatically load villages for the default selected district "Karauli"
    const villages = villagesByDistrict[selectedDistrict.toLowerCase()];
    const villageOptions = villages.map(village => ({
      value: village.toLowerCase(),
      label: village
    })).sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label
    setVillageOptions(villageOptions);
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleDistrictChange = (option) => {
    setSelectedDistrict(option.value);
    setSelectedVillage(null); // Reset the selected village
    const villages = villagesByDistrict[option.value.toLowerCase()];
    const villageOptions = villages.map(village => ({
      value: village.toLowerCase(),
      label: village
    })).sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label
    setVillageOptions(villageOptions);
  };

  const handleVillageChange = (option) => {
    setSelectedVillage(option);
  };


  return (
    <div className="font-sans bg-white h-screen w-screen overflow-x-hidden">
      {/* Content Section */}
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
            <DistrictMap
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
    </div>
  );
};

export default CompareVillagesPage;
