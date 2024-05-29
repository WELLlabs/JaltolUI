import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { get_boundary_data } from '../services/api';

const VillageDetails = ({ selectedState, selectedDistrict, selectedSubdistrict, selectedVillage }) => {
  const [population, setPopulation] = useState(null);

  useEffect(() => {
    if (selectedDistrict && selectedState && selectedVillage) {
      const districtValue = selectedDistrict.value;
      // Fetch the boundary data using the selected district
      get_boundary_data(selectedState, districtValue, selectedSubdistrict, selectedVillage)
        .then(data => {
          console.log("Boundary data received:", data);
          // Normalize data if necessary or ensure exact match conditions are checked
          const villageFeature = data.features.find(feature => feature.properties.village_na.toLowerCase().trim() === selectedVillage.toLowerCase().trim());
          console.log("Attempting to find village:", selectedVillage, "in data:", data.features.map(f => f.properties.village_na));
          if (villageFeature) {
            console.log("Village feature found:", villageFeature);
            setPopulation(villageFeature.properties.tot_p); // Assuming 'tot_p' is the population property
          } else {
            console.log("No village feature found for:", selectedVillage);
            setPopulation(null);
          }
        })
        .catch(error => {
          console.error('Error fetching the GeoJSON data:', error);
        });
    } else {
      setPopulation(null);
    }
  }, [selectedState, selectedDistrict, selectedSubdistrict, selectedVillage]);

  return (
    <div className="mb-4 text-neutral-800">
      <h2 className="text-lg font-semibold mb-2">Village Details</h2>
      <div className="flex justify-between">
        <div>
          <p><strong>Name:</strong> {selectedVillage}</p>
          <p><strong>District:</strong> {selectedDistrict.label}</p>
        </div>
        <div>
          <p><strong>Population:</strong> {population !== null ? population : 'N/A'}</p>
          <p><strong>State:</strong> {selectedState}</p>
        </div>
      </div>
    </div>
  );
};

VillageDetails.propTypes = {
  selectedState: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.object.isRequired,
  selectedSubdistrict: PropTypes.string,
  selectedVillage: PropTypes.string,
};

export default VillageDetails;
