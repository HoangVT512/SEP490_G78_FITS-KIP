import apiRequest from "./api";

// API Base URL
const API_URL =
  process.env.REACT_APP_API_BASE_URL || "https://localhost:7003/api";

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
        // Department and lines from API
        department: user.departmentName || null,
        departmentId: user.departmentId,
        lineIds: user.lineIds || [],
        // Store all roles as array
        roles: user.roles || [],
        // Keep single role for backward compatibility
        role: user.roles && user.roles.length > 0 ? user.roles[0] : "User",
        status: user.isActive ? "active" : "inactive",
        emailConfirmed: user.emailConfirmed || false,
        phoneConfirmed: user.phoneNumberConfirmed || false,
        lastLoginDate: new Date().toISOString(),
        createdDate: new Date().toISOString(),
        avatar: null,
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
  // importUsersFromExcel: async (formData) => {
  //   try {
  //     const token = localStorage.getItem("token");
  //     const response = await fetch(`${API_URL}/Users/import-excel`, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         // Don't set Content-Type for FormData, browser will set it with boundary
  //       },
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(
  //         errorData.message || "Không thể import người dùng từ Excel."
  //       );
  //     }

  //     return await response.json();
  //   } catch (error) {
  //     console.error("Error importing users:", error);
  //     throw error;
  //   }
  // },

  importUsersFromExcel: async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/Users/import-excel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type for FormData!
        },
        body: formData,
      });

      if (!response.ok) {
        // Only try to read the body once
        let errorMessage = "Không thể import người dùng từ Excel.";
        let errorText = "";
        try {
          errorText = await response.text();
          // Try to parse as JSON if possible
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch {
            if (errorText) errorMessage = errorText;
          }
        } catch {
          // If even text fails, use default
        }
        throw new Error(errorMessage);
      }

      // Only parse JSON if response is OK
      return await response.json();
    } catch (error) {
      console.error("Error importing users:", error);
      throw error;
    }
  },

  // Download Excel template
  downloadTemplate: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/Users/download-template`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể tải file mẫu");
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "user-template.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading template:", error);
      throw error;
    }
  },

  // Export users to Excel
  exportUsersToExcel: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/Users/export-excel`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Không thể xuất file Excel");
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting users:", error);
      throw error;
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

  // Get active team leads by line
  getActiveTeamLeadsByLine: async (lineId) => {
    try {
      const response = await apiRequest(`/Users/active-team-leads/${lineId}`);
      return response;
    } catch (error) {
      console.error("Lấy team lead theo line lỗi:", error);
      throw error;
    }
  },

  // Reset user password to default (123456)
  resetPassword: async (id) => {
    try {
      return await apiRequest(`/Users/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    } catch (error) {
      console.error("Error resetting user password:", error);
      throw new Error("Không thể đặt lại mật khẩu người dùng.");
    }
  },

  // Get user lines by user ID
  getUserLines: async (userId) => {
    try {
      return await apiRequest(`/Users/${userId}/lines`);
    } catch (error) {
      console.error("Lỗi tải danh sách dây chuyền của người dùng:", error);
      throw new Error("Không thể tải danh sách dây chuyền của người dùng.");
    }
  },
};

export default userService;
