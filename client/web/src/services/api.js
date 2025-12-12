// Base API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:7003/api";

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get token from localStorage
  const token = localStorage.getItem("token");

  // Set default headers
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // Only add Content-Type for non-FormData requests
  if (!options.isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const defaultOptions = {
    headers,
  };

  const config = {
    ...defaultOptions,
    ...options,
  };

  // Remove isFormData flag from config before sending
  delete config.isFormData;

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Try to parse error response as JSON
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        // If can't parse JSON, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (textError) {
          // Keep default error message
        }
      }
      throw new Error(errorMessage);
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
