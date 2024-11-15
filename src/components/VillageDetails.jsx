import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { get_boundary_data } from '../services/api';

const VillageDetails = ({ selectedState, selectedDistrict, selectedSubdistrict, selectedVillage }) => {
  const [population, setPopulation] = useState(null);

  useEffect(() => {
    if (selectedDistrict?.value && selectedState && selectedVillage?.label) {
      const districtValue = selectedDistrict.value;

      get_boundary_data(selectedState, districtValue, selectedSubdistrict, selectedVillage.label)
        .then(data => {
          console.log("Boundary data received:", data);

          const villageName = selectedVillage.label.toLowerCase().trim();
          const villageFeature = data.features.find(feature => 
            feature.properties.village_na?.toLowerCase().trim() === villageName
          );

          console.log("Attempting to find village:", selectedVillage.label, "in data:", data.features.map(f => f.properties.village_na));
          
          if (villageFeature) {
            console.log("Village feature found:", villageFeature);
            setPopulation(villageFeature.properties.tot_p); // Assuming 'tot_p' is the population property
          } else {
            console.log("No village feature found for:", selectedVillage.label);
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
          <p><strong>Name:</strong> {selectedVillage?.label || 'Unknown'}</p>
          <p><strong>District:</strong> {selectedDistrict?.label || 'Unknown'}</p>
        </div>
        <div>
          <p><strong>Population:</strong> {population !== null ? population : 'Calculating...'}</p>
          <p><strong>State:</strong> {selectedState || 'Unknown'}</p>
        </div>
      </div>
    </div>
  );
};

VillageDetails.propTypes = {
  selectedState: PropTypes.string.isRequired,
  selectedDistrict: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string
  }),
  selectedSubdistrict: PropTypes.string,
  selectedVillage: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string
  }),
};

export default VillageDetails;
