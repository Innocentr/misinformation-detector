import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Attach token automatically
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Global error handling Security
API.interceptors.response.use(
  (response) => {
    // If the request succeeds, just pass it through
    return response;
  },
  (error) => {
    // Check if the error is 401 (Unauthorized) or 403 (Forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Session expired or unauthorized. Logging out...");
      
      // 1. Wipe the invalid token
      localStorage.removeItem("token");
      
      // 2. Force a redirect to the login page.
    
      window.location.href = "/";
    }
    
    // Always reject the promise so the component can catch the error if it wants to
    return Promise.reject(error);
  }
);

export default API;