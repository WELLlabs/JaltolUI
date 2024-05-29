import { useState, useEffect } from 'react';
import { get_boundary_data, get_lulc_raster } from '../services/api';

const useFetchData = (selectedState, selectedDistrict, selectedSubdistrict, selectedVillage, selectedYear) => {
  const [boundaryData, setBoundaryData] = useState(null);
  const [lulcTilesUrl, setLulcTilesUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedDistrict && selectedState) {
      setIsLoading(true);

      const districtValue = selectedDistrict.value;
      Promise.all([
        get_boundary_data(selectedState, districtValue, selectedSubdistrict, selectedVillage),
        get_lulc_raster(selectedState, districtValue, selectedSubdistrict, selectedVillage, selectedYear)
      ])
      .then(([boundaryData, lulcData]) => {
        setBoundaryData(boundaryData);
        setLulcTilesUrl(lulcData.tiles_url);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      });
    } else {
      setBoundaryData(null);
      setLulcTilesUrl(null);
    }
  }, [selectedState, selectedDistrict, selectedSubdistrict, selectedVillage, selectedYear]);

  return { boundaryData, lulcTilesUrl, isLoading };
};

export default useFetchData;
