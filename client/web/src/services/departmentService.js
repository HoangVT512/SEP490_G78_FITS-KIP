import apiRequest from "./api";

export const departmentService = {
  async getDepartments() {
    try {
      const response = await apiRequest("/Departments");
      return response;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw new Error(
        "Không thể tải danh sách phòng ban. Vui lòng thử lại sau."
      );
    }
  },
};
