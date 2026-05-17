import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || 'https://gestion-scolaire-backend-is34.onrender.com';

export const getPaiements = async (id_annee = null) => {
  const url = id_annee ? `${API_URL}/?id_annee=${id_annee}` : `${API_URL}/`
  const res = await axios.get(url)
  return res.data
}

export const addPaiement = async (data) => {
  const res = await axios.post(`${API_URL}/`, data)
  return res.data
}

export const genererPaiements = async (matricule, id_niveau) => {
  const res = await axios.post(`${API_URL}/generer/${matricule}/${id_niveau}`)
  return res.data
}

// NOUVELLE FONCTION - Mise à jour d'un paiement
export const updatePaiement = async (matricule, typeFrais, mois, data) => {
  let url = `${API_URL}/${matricule}/${typeFrais}`
  if (mois) {
    url += `?mois=${mois}`
  }
  const res = await axios.put(url, data)
  return res.data
}