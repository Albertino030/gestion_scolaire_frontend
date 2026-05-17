const API_URL = import.meta.env.VITE_API_URL || 'https://gestion-scolaire-backend-is34.onrender.com';

// Stockage du token
export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Fonction de login
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erreur de connexion');
    }

    const data = await response.json();
    
    // Stocker le token et l'utilisateur
    setAuthToken(data.access_token);
    setUser(data.user);
    
    return data;
  } catch (error) {
    console.error('Erreur login:', error);
    throw error;
  }
};

// Fonction de vérification du token
export const verifyToken = async () => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      removeAuthToken();
      return false;
    }

    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error('Erreur vérification token:', error);
    removeAuthToken();
    return false;
  }
};

// Récupérer le profil
export const getProfile = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Non authentifié');

  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erreur récupération profil');
    }

    const user = await response.json();
    setUser(user);
    return user;
  } catch (error) {
    console.error('Erreur profil:', error);
    throw error;
  }
};

// Changer le mot de passe
export const changePassword = async (currentPassword, newPassword) => {
  const token = getAuthToken();
  if (!token) throw new Error('Non authentifié');

  try {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Erreur changement mot de passe');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur changement mot de passe:', error);
    throw error;
  }
};

// Déconnexion
export const logout = () => {
  removeAuthToken();
  window.location.href = '/login';
};