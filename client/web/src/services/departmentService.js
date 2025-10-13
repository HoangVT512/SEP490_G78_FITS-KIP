import apiRequest from "./api";

export const departmentService = {
  // Get all departments
  async getDepartments() {
    try {
      const response = await apiRequest("/Departments");
      return response;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw new Error(error.message || "Không thể tải danh sách phòng ban. Vui lòng thử lại sau.");
    }
  },

  // Get all active departments
  async getActiveDepartments() {
    try {
      const response = await apiRequest("/Departments/active");
      return response.data || response;
    } catch (error) {
      console.error("Error fetching active departments:", error);
      throw new Error(error.message || "Không thể tải danh sách phòng ban hoạt động. Vui lòng thử lại sau.");
    }
  },

  // Get department by ID
  async getDepartmentById(id) {
    try {
      const response = await apiRequest(`/Departments/${id}`);
      return response;
    } catch (error) {
      console.error("Error fetching department:", error);
      throw new Error(error.message || "Không thể tải thông tin phòng ban.");
    }
  },

  // Create new department
  async createDepartment(departmentData) {
    try {
      return await apiRequest("/Departments", {
        method: "POST",
        body: JSON.stringify(departmentData),
      });
    } catch (error) {
      console.error("Error creating department:", error);
      throw new Error(error.message || "Không thể tạo phòng ban mới.");
    }
  },

  // Update department
  async updateDepartment(id, departmentData) {
    try {
      return await apiRequest(`/Departments/${id}`, {
        method: "PUT",
        body: JSON.stringify(departmentData),
      });
    } catch (error) {
      console.error("Error updating department:", error);
      throw new Error(error.message || "Không thể cập nhật thông tin phòng ban.");
    }
  },

  // Delete department
  async deleteDepartment(id) {
    try {
      return await apiRequest(`/Departments/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting department:", error);
      throw new Error(error.message || "Không thể xóa phòng ban.");
    }
  },

  // Get department statistics
  async getDepartmentStats() {
    try {
      const response = await apiRequest("/Departments/statistics");
      return response;
    } catch (error) {
      console.error("Error fetching department statistics:", error);
      throw new Error(error.message || "Không thể tải thống kê phòng ban.");
    }
  },
};

export default departmentService;
