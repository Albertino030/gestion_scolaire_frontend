// src/api/suivi_formation.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'https://gestion-scolaire-backend-is34.onrender.com';

// Fonctions spécifiques pour le suivi formation
export const getAnneesSortie = async () => {
  try {
    const response = await axios.get(`${API_URL}/suivi/annees-sortie`);
    return response.data;
  } catch (error) {
    console.error("Erreur chargement années sortie:", error);
    throw error;
  }
};

export const getSuiviTableau = async (id_annee_sortie = null) => {
  try {
    const url = id_annee_sortie 
      ? `${API_URL}/suivi/tableau?id_annee_sortie=${id_annee_sortie}`
      : `${API_URL}/suivi/tableau`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Erreur chargement tableau suivi:", error);
    throw error;
  }
};

export const getSuiviListe = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.id_annee_sortie) params.append('id_annee_sortie', filters.id_annee_sortie);
    if (filters.annee_suivi) params.append('annee_suivi', filters.annee_suivi);
    if (filters.type_suivi) params.append('type_suivi', filters.type_suivi);
    
    const response = await axios.get(`${API_URL}/suivi/?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Erreur chargement liste suivi:", error);
    throw error;
  }
};

export const postSuivi = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/suivi/`, data);
    return response.data;
  } catch (error) {
    console.error("Erreur ajout suivi:", error);
    throw error;
  }
};

export const putSuivi = async (matricule, id_annee_sortie, annee_suivi, data) => {
  try {
    const response = await axios.put(`${API_URL}/suivi/${matricule}/${id_annee_sortie}/${annee_suivi}`, data);
    return response.data;
  } catch (error) {
    console.error("Erreur modification suivi:", error);
    throw error;
  }
};

export const deleteSuivi = async (suivi_id) => {
  try {
    const response = await axios.delete(`${API_URL}/suivi/${suivi_id}`);
    return response.data;
  } catch (error) {
    console.error("Erreur suppression suivi:", error);
    throw error;
  }
};

// Fonctions génériques (garder pour compatibilité)
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

export default {
  getApi,
  postApi,
  putApi,
  deleteApi,
  getAnneesSortie,
  getSuiviTableau,
  getSuiviListe,
  postSuivi,
  putSuivi,
  deleteSuivi
};