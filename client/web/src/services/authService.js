import apiRequest from "./api";

export const authService = {
  // Login with email or employee code
  login: async (emailOrEmployeeCode, password, rememberMe = false) => {
    try {
      const response = await apiRequest("/Auth/login", {
        method: "POST",
        body: JSON.stringify({
          emailOrEmployeeCode,
          password,
          rememberMe,
        }),
      });

      if (response.token) {
        // Store token and user info in localStorage (persists after reload)
        localStorage.setItem("token", response.token);
        localStorage.setItem("tokenExpiration", response.expiration);
        localStorage.setItem("currentUser", JSON.stringify(response.user));

        return response;
      }

      throw new Error("Invalid response from server");
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || "Đăng nhập thất bại");
    }
  },

  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await apiRequest("/Auth/logout", {
          method: "POST",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
  // Always clear local storage
  localStorage.removeItem("token");
  localStorage.removeItem("tokenExpiration");
  localStorage.removeItem("currentUser");
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      return await apiRequest("/Auth/me");
    } catch (error) {
      console.error("Get current user error:", error);
      // If token is invalid, clear storage
      authService.clearAuthData();
      throw error;
    }
  },

  // Check if user is logged in
  isLoggedIn: () => {
  const token = localStorage.getItem("token");
  const expiration = localStorage.getItem("tokenExpiration");

    if (!token || !expiration) {
      return false;
    }

    // Check if token is expired
    const now = new Date();
    const expirationDate = new Date(expiration);

    if (now >= expirationDate) {
      authService.clearAuthData();
      return false;
    }

    return true;
  },

  // Get stored user
  getStoredUser: () => {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
  },

  // Get stored token
  getToken: () => {
  return localStorage.getItem("token");
  },

  // Clear authentication data
  clearAuthData: () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tokenExpiration");
  localStorage.removeItem("currentUser");
  },

  // Check if user has admin role
  isAdmin: () => {
    const user = authService.getStoredUser();
    if (!user || !authService.isLoggedIn()) {
      return false;
    }

    // Check if user has admin role
    return (
      user.roles &&
      (user.roles.includes("Quản trị viên") || user.roles.includes("QUANTRI"))
    );
  },

  // Get user roles
  getUserRoles: () => {
    const user = authService.getStoredUser();
    return user?.roles || [];
  },

  // Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await apiRequest("/Auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      return response;
    } catch (error) {
      console.error("Change password error:", error);
      
      // Try to parse error response if it's a 400 Bad Request
      if (error.message.includes("HTTP error! status: 400")) {
        // The error might contain more specific information
        throw new Error("Mật khẩu hiện tại không chính xác");
      }
      
      throw new Error(error.message || "Đổi mật khẩu thất bại");
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiRequest("/Auth/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      // Update stored user data if successful
      if (response.success && response.user) {
        const currentUser = authService.getStoredUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...response.user };
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        }
      }

      return response;
    } catch (error) {
      console.error("Update profile error:", error);
      throw new Error(error.message || "Cập nhật thông tin thất bại");
    }
  },
};

export default authService;
