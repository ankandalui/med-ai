// API Configuration - Updated for local development
export const API_CONFIG = {
  BASE_URL: "http://localhost:5000", // Always use local Flask API

  ENDPOINTS: {
    HEALTH: "/api/health",
    PREDICT: "/api/predict",
    CLASSES: "/api/classes",
    STORAGE_STATS: "/api/storage/stats",
  },
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
