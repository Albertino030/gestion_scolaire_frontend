const API_URL = import.meta.env.VITE_API_URL || 'https://gestion-scolaire-backend-is34.onrender.com';

// GET
export const getPresences = async () => {
  const res = await fetch(API_URL)
  return await res.json()
}

// POST
export const addPresence = async (data) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  return await res.json()
}

// DELETE
export const deletePresence = async (id) => {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  })
}