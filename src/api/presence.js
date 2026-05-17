const API_URL = "http://127.0.0.1:8000/presence"

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