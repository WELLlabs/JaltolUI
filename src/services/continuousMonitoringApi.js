import axios from 'axios';
import { getAuthHeaders } from './api';

const API_URL = import.meta.env.VITE_API_URL;

// Create a new Continuous Monitoring Project
export const createCMProject = (projectData) => {
  const url = `${API_URL}/cm/projects/`;
  console.log('Calling createCMProject:', url);
  return axios.post(url, projectData, {
    headers: getAuthHeaders()
  })
  .then(response => response.data);
};

// Upload a dataset (CSV) to a project
export const uploadDataset = (projectId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const url = `${API_URL}/cm/projects/${projectId}/upload_dataset/`;
  console.log('Calling uploadDataset:', url);

  return axios.post(url, formData, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'multipart/form-data',
    }
  })
  .then(response => response.data);
};

// Trigger AI analysis for a dataset
export const analyzeDataset = (datasetId) => {
  return axios.post(`${API_URL}/cm/datasets/${datasetId}/analyze/`, {}, {
    headers: getAuthHeaders()
  })
  .then(response => response.data);
};

// Confirm mapping and trigger ingestion
export const confirmIngestion = (datasetId) => {
  return axios.post(`${API_URL}/cm/datasets/${datasetId}/confirm/`, {}, {
    headers: getAuthHeaders()
  })
  .then(response => response.data);
};

// Get all CM projects
export const getCMProjects = () => {
  return axios.get(`${API_URL}/cm/projects/`, {
    headers: getAuthHeaders()
  })
  .then(response => response.data);
};

// Get a specific CM project
export const getCMProject = (projectId) => {
  return axios.get(`${API_URL}/cm/projects/${projectId}/`, {
    headers: getAuthHeaders()
  })
  .then(response => response.data);
};

// Get all datasets for the authenticated user
export const getDatasets = () => {
  return axios.get(`${API_URL}/cm/datasets/`, {
    headers: getAuthHeaders()
  })
  .then(response => response.data);
};

// Get a specific dataset
export const getDataset = (datasetId) => {
  return axios.get(`${API_URL}/cm/datasets/${datasetId}/`, {
    headers: getAuthHeaders()
  })
  .then(response => response.data);
};

// Delete a dataset
export const deleteDataset = (datasetId) => {
  return axios.delete(`${API_URL}/cm/datasets/${datasetId}/`, {
    headers: getAuthHeaders()
  })
  .then(response => response.data);
};

// Download a dataset CSV file (proxied through backend to avoid CORS)
export const downloadDataset = (datasetId) => {
  return axios.get(`${API_URL}/cm/datasets/${datasetId}/download/`, {
    headers: getAuthHeaders(),
    responseType: 'text'
  })
  .then(response => response.data);
};