// src/api/Dashboard.js
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/stats`);
    return response.data;
  } catch (error) {
    console.error("Erreur chargement dashboard:", error);
    return null;
  }
};

export const getEtudiantsStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/etudiants`);
    return response.data;
  } catch (error) {
    console.error("Erreur chargement stats étudiants:", error);
    return null;
  }
};

export const getPaiementsStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/paiements`);
    return response.data;
  } catch (error) {
    console.error("Erreur chargement stats paiements:", error);
    return null;
  }
};

export const getPresenceStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/presence`);
    return response.data;
  } catch (error) {
    console.error("Erreur chargement stats présence:", error);
    return null;
  }
};

export const getExamensStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/examens`);
    return response.data;
  } catch (error) {
    console.error("Erreur chargement stats examens:", error);
    return null;
  }
};

export const getSuiviStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/suivi`);
    return response.data;
  } catch (error) {
    console.error("Erreur chargement stats suivi:", error);
    return null;
  }
};

export const getRepartitionNiveaux = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/repartition/niveaux`);
    return response.data;
  } catch (error) {
    console.error("Erreur chargement répartition niveaux:", error);
    return [];
  }
};

export const getRepartitionFilieres = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/repartition/filieres`);
    return response.data;
  } catch (error) {
    console.error("Erreur chargement répartition filières:", error);
    return [];
  }
};

export const getEvolutionMensuelle = async (limit = 12) => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/evolution?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Erreur chargement évolution:", error);
    return [];
  }
};

export const getDashboardComplet = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard/stats`);
    return response.data;
  } catch (error) {
    console.error("Erreur chargement dashboard complet:", error);
    return null;
  }
};

export default {
  getDashboardStats,
  getEtudiantsStats,
  getPaiementsStats,
  getPresenceStats,
  getExamensStats,
  getSuiviStats,
  getRepartitionNiveaux,
  getRepartitionFilieres,
  getEvolutionMensuelle,
  getDashboardComplet
};