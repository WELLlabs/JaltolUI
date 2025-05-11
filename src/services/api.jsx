import axios from 'axios';

const API_URL = 'https://app.jaltol.app/api'; // Your Django app URL
// const API_URL = 'http://127.0.0.1:8000/api';  // Your Django app URL

// Updated get_boundary_data function to accept villageId as a parameter
export const get_boundary_data = (stateName, districtName, subdistrictName = '', villageName = '', villageId = '') => {
  // Parameters to include in the request
  const params = {
    state_name: stateName,
    district_name: districtName
  };
  
  // Add subdistrict if provided
  if (subdistrictName) {
    params.subdistrict_name = subdistrictName;
  }
  
  // Add village name if provided
  if (villageName) {
    params.village_name = villageName;
    
    // If a specific village ID is provided, use it
    if (villageId) {
      params.village_id = villageId;
    }
    // Otherwise, check if village name contains ID in format "name - id"
    else if (villageName.includes(' - ')) {
      const parts = villageName.split(' - ');
      if (parts.length > 1) {
        params.village_id = parts[1];
      }
    }
  }
  
  return axios.get(`${API_URL}/get_boundary_data/`, { params })
    .then(response => response.data);
};

export const get_lulc_raster = (stateName, districtName, subdistrictName, villageName, year) => {
  return axios.get(`${API_URL}/get_lulc_raster/`, {
    params: {
      state_name: stateName,
      district_name: districtName,
      subdistrict_name: subdistrictName,
      village_name: villageName,
      year: year,
    }
  }).then(response => response.data);
};

export const get_area_change = (stateName, districtName, subdistrictName, villageName) => {
  return axios.get(`${API_URL}/get_area_change/`, {
    params: {
      state_name: stateName,
      district_name: districtName,
      subdistrict_name: subdistrictName,
      village_name: villageName,
    }
  }).then(response => response.data);
};

export const get_control_village = (stateName, districtName, subdistrictName, villageName) => {
  return axios.get(`${API_URL}/get_control_village/`, {
    params: {
      state_name: stateName,
      district_name: districtName,
      subdistrict_name: subdistrictName,
      village_name: villageName,
    }
  }).then(response => response.data);
};

export const get_rainfall_data = (stateName, districtName, subdistrictName, villageName) => {
  return axios.get(`${API_URL}/get_rainfall_data/`, {
    params: {
      state_name: stateName,
      district_name: districtName,
      subdistrict_name: subdistrictName,
      village_name: villageName,
    }
  }).then(response => response.data);
};

export const getSubdistricts = (districtId) => {
  return axios.get(`${API_URL}/subdistricts/${districtId}/`)
    .then(response => response.data)
    .catch(error => {
      console.error("Error fetching subdistricts:", error);
      throw error;
    });
};

export const getVillages = (subdistrictId) => {
  return axios.get(`${API_URL}/villages/${subdistrictId}/`)
    .then(response => response.data)
    .catch(error => {
      console.error("Error fetching villages:", error);
      throw error;
    });
};


export const uploadCustomPolygon = (
  stateName,
  districtName,
  subdistrictName,
  villageName,
  controlVillageName,
  controlVillageId,
  year,
  geojsonData
) => {
  // Create FormData to handle the file upload
  const formData = new FormData();
  formData.append('state_name', stateName);
  formData.append('district_name', districtName);
  formData.append('subdistrict_name', subdistrictName);
  formData.append('village_name', villageName);
  formData.append('year', year);
  
  // Add control village data if provided
  if (controlVillageName) {
    formData.append('control_village_name', controlVillageName);
  }
  if (controlVillageId) {
    formData.append('control_village_id', controlVillageId);
  }
  
  // Convert GeoJSON to string and append
  formData.append('geojson', JSON.stringify(geojsonData));

  return axios.post(`${API_URL}/custom_polygon_comparison/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(response => {
    // Process the response data
    const responseData = response.data;
    
    // Extract the crop stats by year for both intervention and control
    const interventionStats = responseData.intervention.crop_stats;
    const controlStats = responseData.control.crop_stats;
    
    // Add circles data to the response
    const circlesData = responseData.circles_summary;
    
    return {
      intervention: responseData.intervention,
      control: responseData.control,
      interventionStats: interventionStats,
      controlStats: controlStats,
      polygon: responseData.polygon,
      circles: circlesData,
      selectedYear: responseData.selected_year
    };
  });
};