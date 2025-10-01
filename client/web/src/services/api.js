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

  // List of public endpoints that don't require authentication
  const publicEndpoints = [
    "/Auths/login",
    "/Auths/forgot-password/send-otp",
    "/Auths/forgot-password/verify-otp",
    "/Auths/forgot-password/reset",
  ];

  // Check if user is logged in for protected endpoints
  const isPublicEndpoint = publicEndpoints.some((publicPath) =>
    endpoint.includes(publicPath)
  );

  if (!token && !isPublicEndpoint) {
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
      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        // Check if it's due to inactive account
        const isInactiveAccount =
          responseData &&
          (responseData.message?.includes("vô hiệu hóa") ||
            responseData.message?.includes("inactive"));

        const isLoginPage = window.location.pathname.includes("/login");

        console.log("401 Error Debug:", {
          isInactiveAccount,
          isLoginPage,
          message: responseData?.message,
        });

        // Only clear and redirect if NOT on login page OR if it's not an inactive account error
        // If on login page and inactive account, let the login form handle the error display
        if (!isLoginPage || !isInactiveAccount) {
          // Clear auth data
          localStorage.removeItem("token");
          localStorage.removeItem("tokenExpiration");
          localStorage.removeItem("currentUser");

          // Redirect if not on login page
          if (!isLoginPage) {
            if (isInactiveAccount) {
              window.location.href = "/login?inactive=true";
            } else {
              window.location.href = "/login";
            }
          }
        }

        // Always throw error with message from server
        throw new Error(
          responseData.message ||
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        );
      }

      // Parse error message from server response
      let errorMessage = `HTTP error! status: ${response.status}`;

      if (responseData && typeof responseData === "object") {
        // If server returns structured error response with validation errors
        if (responseData.errors) {
          // Extract validation error messages
          const validationErrors = Object.values(responseData.errors).flat();
          errorMessage = validationErrors.join(", ");
        } else {
          errorMessage =
            responseData.message ||
            responseData.title ||
            responseData.error ||
            errorMessage;
        }
      } else if (typeof responseData === "string") {
        errorMessage = responseData || errorMessage;
      }

      console.error(`API Error Details:`, {
        status: response.status,
        responseData,
        errorMessage,
      });
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

export default apiRequest;
