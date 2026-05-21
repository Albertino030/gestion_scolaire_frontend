import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'https://gestion-scolaire-backend-is34.onrender.com';

export const getPaiements = async (id_annee = null) => {
  // ✅ CORRECTION : Ajouter /paiements/
  const url = id_annee 
    ? `${API_URL}/paiements/?id_annee=${id_annee}` 
    : `${API_URL}/paiements/`
  const res = await axios.get(url)
  return res.data
}

export const addPaiement = async (data) => {
  // ✅ CORRECTION : Ajouter /paiements/
  const res = await axios.post(`${API_URL}/paiements/`, data)
  return res.data
}

export const genererPaiements = async (matricule, id_niveau) => {
  // ✅ CORRECTION : Ajouter /paiements/
  const res = await axios.post(`${API_URL}/paiements/generer/${matricule}/${id_niveau}`)
  return res.data
}

export const updatePaiement = async (matricule, typeFrais, mois, data) => {
  // ✅ CORRECTION : Ajouter /paiements/
  let url = `${API_URL}/paiements/${matricule}/${typeFrais}`
  if (mois) {
    url += `?mois=${mois}`
  }
  const res = await axios.put(url, data)
  return res.data
}