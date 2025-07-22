import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { get_village_details } from '../services/api';

const VillageDetails = ({ selectedState, selectedDistrict, selectedVillage }) => {
  const [population, setPopulation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedVillage?.villageId) {
      setLoading(true);
      
      get_village_details(selectedVillage.villageId)
        .then(data => {
          console.log("Village details received:", data);
          setPopulation(data.total_population);
        })
        .catch(error => {
          console.error('Error fetching village details:', error);
          setPopulation(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setPopulation(null);
    }
  }, [selectedVillage]);

  return (
    <div className=" text-neutral-800">
      <h2 className="text-lg font-semibold mb-2">Village Details</h2>
      <div className="flex justify-between">
        <div>
          <p><strong>Name:</strong> {selectedVillage?.label || 'Unknown'}</p>
          <p><strong>District:</strong> {selectedDistrict?.label || 'Unknown'}</p>
        </div>
        <div>
          <p><strong>Population:</strong> {
            loading ? 'Loading...' : 
            population !== null ? population.toLocaleString() : 'Not available'
          }</p>
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
  selectedVillage: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string,
    villageId: PropTypes.string
  }),
};

export default VillageDetails;
