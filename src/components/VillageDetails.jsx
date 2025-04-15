import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { get_boundary_data } from '../services/api';

const VillageDetails = ({ selectedState, selectedDistrict, selectedSubdistrict, selectedVillage }) => {
  const [population, setPopulation] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    if (selectedDistrict?.value && selectedState && selectedVillage?.label) {
      const districtValue = selectedDistrict.value;

      get_boundary_data(selectedState, districtValue, selectedSubdistrict, selectedVillage.label)
        .then(data => {
          console.log("Boundary data received:", data);

          const villageName = selectedVillage.label.toLowerCase().trim();
          // First try to match by name
          const villageFeature = data.features.find(feature => 
            feature.properties.village_na?.toLowerCase().trim() === villageName
          );

          console.log("Attempting to find village:", selectedVillage.label, "in data:", data.features.map(f => f.properties.village_na));
          
          if (villageFeature) {
            console.log("Village feature found:", villageFeature);
            
            // Check multiple possible population field names
            let populationValue = null;
            
            // Log all properties to help debug
            setDebugInfo(JSON.stringify(villageFeature.properties));
            
            // Try various field names used for population across different states
            if (villageFeature.properties.tot_p !== undefined) {
              populationValue = villageFeature.properties.tot_p;
            } else if (villageFeature.properties.pc11_pca_t_p !== undefined) {
              populationValue = villageFeature.properties.pc11_pca_t_p;
            } else if (villageFeature.properties.population !== undefined) {
              populationValue = villageFeature.properties.population;
            } else if (villageFeature.properties.pc11_tv_p !== undefined) {
              populationValue = villageFeature.properties.pc11_tv_p;
            }
            
            setPopulation(populationValue);
          } else {
            // If we couldn't find by name, try to find by village ID if available
            if (selectedVillage.villageId) {
              const villageById = data.features.find(feature => 
                feature.properties.pc11_tv_id?.toString() === selectedVillage.villageId.toString()
              );
              
              if (villageById) {
                console.log("Village feature found by ID:", villageById);
                
                // Try various field names for population
                let populationValue = null;
                setDebugInfo(JSON.stringify(villageById.properties));
                
                if (villageById.properties.tot_p !== undefined) {
                  populationValue = villageById.properties.tot_p;
                } else if (villageById.properties.pc11_pca_t_p !== undefined) {
                  populationValue = villageById.properties.pc11_pca_t_p;
                } else if (villageById.properties.population !== undefined) {
                  populationValue = villageById.properties.population;
                } else if (villageById.properties.pc11_tv_p !== undefined) {
                  populationValue = villageById.properties.pc11_tv_p;
                }
                
                setPopulation(populationValue);
              } else {
                console.log("No village feature found by ID for:", selectedVillage.villageId);
                setPopulation(null);
              }
            } else {
              console.log("No village feature found for:", selectedVillage.label);
              setPopulation(null);
            }
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
    value: PropTypes.string,
    villageId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
};

export default VillageDetails;
