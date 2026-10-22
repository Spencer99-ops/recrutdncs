// Configuration de l'API pour RECRUTDNCS
const API_CONFIG = {
  // URL de l'API en production (Neon Functions)
  BASE_URL: 'https://br-raspy-base-b4dx6n7v-api.compute.c-6.us-east-2.aws.neon.tech/',
  
  // URL locale pour le développement (changer si nécessaire)
  LOCAL_URL: 'http://localhost:3000/',
  
  // Utiliser l'URL de production par défaut
  get API_URL() {
    return this.BASE_URL;
  }
};

// Fonction helper pour les requêtes API
async function apiFetch(endpoint, options = {}) {
  const url = API_CONFIG.API_URL + endpoint;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  // Ajouter le token d'authentification si disponible
  const token = localStorage.getItem('token');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur de requête API');
    }
    
    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
}

// Exporter pour utilisation dans les autres fichiers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_CONFIG, apiFetch };
}
