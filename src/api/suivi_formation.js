// src/api/suivi_formation.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const getApi = async (endpoint) => {
  try {
    const response = await axios.get(`${API_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`GET ${endpoint} error:`, error);
    throw error;
  }
};

export const postApi = async (endpoint, data) => {
  try {
    const response = await axios.post(`${API_URL}${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error(`POST ${endpoint} error:`, error);
    throw error;
  }
};

export const putApi = async (endpoint, data) => {
  try {
    const response = await axios.put(`${API_URL}${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error(`PUT ${endpoint} error:`, error);
    throw error;
  }
};

export const deleteApi = async (endpoint) => {
  try {
    const response = await axios.delete(`${API_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`DELETE ${endpoint} error:`, error);
    throw error;
  }
};

// Export par défaut
export default {
  getApi,
  postApi,
  putApi,
  deleteApi
};