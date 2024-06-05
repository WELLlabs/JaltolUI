import axios from 'axios';

const API_URL = 'https://app.jaltol.app/api'; // Your Django app URL
//const API_URL = 'http://127.0.0.1:8000/api';  // Your Django app URL

export const get_boundary_data = (stateName, districtName) => {
  return axios.get(`${API_URL}/get_boundary_data/`, {
    params: {
      state_name: stateName,
      district_name: districtName,
    }
  }).then(response => response.data);
};

export const get_lulc_raster = (stateName, districtName,subdistrictName, villageName, year) => {
  return axios.get(`${API_URL}/get_lulc_raster/`, {
    params: {
      state_name: stateName,
      district_name: districtName,
      subdistrict_name: subdistrictName,
      village_name: villageName,
      year: year
    }
  }).then(response => response.data);
};

export const get_area_change = (stateName, districtName, subdistrictName, villageName) => {
  return axios.get(`${API_URL}/get_area_change/`, {
    params: {
      state_name: stateName,
      district_name: districtName,
      subdistrict_name: subdistrictName,
      village_name: villageName
    }
  }).then(response => response.data);
};

export const get_control_village = (stateName, districtName, subdistrictName, villageName) => {
  return axios.get(`${API_URL}/get_control_village/`, {
    params: {
      state_name: stateName,
      district_name: districtName,
      subdistrict_name: subdistrictName,
      village_name: villageName
    }
  }).then(response => response.data);
};

export const get_rainfall_data = (stateName, districtName, subdistrictName, villageName) => { // Add more parameters as needed
  return axios.get(`${API_URL}/get_rainfall_data/`, {
    params: {
      state_name: stateName,
      district_name: districtName,
      subdistrict_name: subdistrictName,
      village_name: villageName
    }
  }).then(response => response.data);
};