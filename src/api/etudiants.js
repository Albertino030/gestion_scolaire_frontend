import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || 'https://gestion-scolaire-backend-is34.onrender.com';

// GET
export const getEtudiants = () => axios.get(API_URL)

// POST (CORRIGÉ)
export const addEtudiant = (data) =>
  axios.post(API_URL, data)

// DELETE
export const deleteEtudiant = (id) =>
  axios.delete(`${API_URL}/${id}`)