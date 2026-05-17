const API_URL = import.meta.env.VITE_API_URL || 'https://gestion-scolaire-backend-is34.onrender.com';
// =========================
// GET ALL ANNÉES
// =========================
export async function getAnnees() {
  const res = await fetch(`${API_URL}/`)
  return await res.json()
}

// =========================
// GET ANNÉE ACTIVE
// =========================
export async function getAnneeActive() {
  const res = await fetch(`${API_URL}/active`)
  return await res.json()
}

// =========================
// AJOUT ANNÉE
// =========================
export async function addAnnee(data) {
  const res = await fetch(`${API_URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  return await res.json()
}

// =========================
// ACTIVER ANNÉE
// =========================
export async function activerAnnee(id) {
  const res = await fetch(`${API_URL}/activer/${id}`, {
    method: "PUT"
  })

  return await res.json()
}

// =========================
// UPDATE ANNÉE
// =========================
export async function updateAnnee(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })

  return await res.json()
}

// =========================
// DELETE ANNÉE
// =========================
export async function deleteAnnee(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  })

  return await res.json()
}