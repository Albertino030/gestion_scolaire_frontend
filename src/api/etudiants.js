import axios from "axios"

const API_URL = "http://127.0.0.1:8000/etudiants"

// GET
export const getEtudiants = () => axios.get(API_URL)

// POST (CORRIGÉ)
export const addEtudiant = (data) =>
  axios.post(API_URL, data)

// DELETE
export const deleteEtudiant = (id) =>
  axios.delete(`${API_URL}/${id}`)