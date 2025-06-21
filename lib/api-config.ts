// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://disease-model-dxq9.onrender.com'
    : 'http://localhost:5000',
  
  ENDPOINTS: {
    HEALTH: '/api/health',
    PREDICT: '/api/predict',
    CLASSES: '/api/classes',
    STORAGE_STATS: '/api/storage/stats',
  }
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
