// Base API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://localhost:7003/api";

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get token from localStorage (consistent with authService)
  const token = localStorage.getItem("token");
  
  // Debug: Log token status with more details
  console.log('API Request Debug:', {
    endpoint,
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
    url
  });

  // Check if user is logged in
  if (!token && endpoint !== '/Auth/login') {
    console.error('No token found for protected endpoint:', endpoint);
    throw new Error('Authentication required');
  }

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
  };

  // Debug: Log the actual headers being sent
  console.log('Request headers:', config.headers);

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

export default apiRequest;
