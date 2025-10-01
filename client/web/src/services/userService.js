import apiRequest from "./api";

// User service functions
export const userService = {
  // Get all users
  getUsers: async () => {
    try {
      const users = await apiRequest("/Users");

      // Transform API response to match frontend format
      return users.map((user) => ({
        id: user.id,
        fullName: user.fullName || "N/A",
        employeeCode: user.employeeCode || "N/A",
        email: user.email || "N/A",
        phoneNumber: user.phoneNumber || "N/A",
        userName: user.userName || "N/A",
        // Default values for properties not in API
        department: "N/A",
        position: user.position || "N/A",
        // Get first role from roles array, default to "User" if no roles
        role: user.roles && user.roles.length > 0 ? user.roles[0] : "User",
        status: user.isActive ? "active" : "inactive",
        emailConfirmed: user.emailConfirmed || false,
        phoneConfirmed: user.phoneNumberConfirmed || false,
        lastLoginDate: new Date().toISOString(),
        createdDate: new Date().toISOString(),
        avatar: null,
        gender: user.gender || "N/A",
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error(
        "Không thể tải danh sách người dùng. Vui lòng thử lại sau."
      );
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      return await apiRequest(`/Users/${id}`);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new Error("Không thể tải thông tin người dùng.");
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      return await apiRequest("/Users", {
        method: "POST",
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Không thể tạo người dùng mới.");
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      return await apiRequest(`/Users/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      });
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Không thể cập nhật thông tin người dùng.");
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      return await apiRequest(`/Users/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("Không thể xóa người dùng.");
    }
  },

  // Import users from Excel
  importUsers: async (usersData) => {
    try {
      return await apiRequest("/Users/import", {
        method: "POST",
        body: JSON.stringify(usersData),
      });
    } catch (error) {
      console.error("Error importing users:", error);
      throw new Error("Không thể import người dùng từ Excel.");
    }
  },

  // Get managers for department dropdown
  getManagers: async () => {
    try {
      const managers = await apiRequest("/Users/managers");
      return managers.map((manager) => ({
        value: manager.id,
        label: manager.fullName || manager.userName,
        id: manager.id,
        fullName: manager.fullName,
        employeeCode: manager.employeeCode,
      }));
    } catch (error) {
      console.error("Error fetching managers:", error);
      throw new Error("Không thể lấy danh sách quản lý.");
    }
  },
};

export default userService;
