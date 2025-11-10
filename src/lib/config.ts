// Configuration file for King's Lab
// Update these values to match your environment

export const config = {
  // Node.js + Express API Base URL
  // ⚠️ IMPORTANT: Make sure your Node.js backend is running!
  // Start it with: cd backend && npm run dev
  //
  // Common values:
  // Development: "http://localhost:5000/api"
  // Production:  "https://api.kingslab.ai/api"
  apiBaseUrl: "http://localhost:5000/api",
  
  // Enable mock data fallback when API is unavailable
  // Set to false in production to see real errors
  useMockFallback: false,
  
  // Site information (used as fallback)
  siteName: "King's Lab",
  siteTagline: "Advancing Artificial Intelligence",
  
  // API request timeout (in milliseconds)
  apiTimeout: 10000,
};
