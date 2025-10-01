// Base API configuration
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://localhost:7003/api";

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get token from localStorage (consistent with authService)
  const token = localStorage.getItem("token");

  // Debug: Log token status with more details
  console.log("API Request Debug:", {
    endpoint,
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    tokenPreview: token ? `${token.substring(0, 20)}...` : "null",
    url,
  });

  // Check if user is logged in
  if (!token && endpoint !== "/Auths/login") {
    console.error("No token found for protected endpoint:", endpoint);
    throw new Error("Authentication required");
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
  console.log("Request headers:", config.headers);

  try {
    const response = await fetch(url, config);

    const contentType = response.headers.get("content-type");
    let responseData;

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      // Parse error message from server response
      let errorMessage = `HTTP error! status: ${response.status}`;

      if (responseData && typeof responseData === "object") {
        // If server returns structured error response
        errorMessage =
          responseData.message || responseData.error || errorMessage;
      } else if (typeof responseData === "string") {
        errorMessage = responseData || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

export default apiRequest;
