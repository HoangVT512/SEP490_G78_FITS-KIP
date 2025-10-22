import apiRequest from "./api";

export const lineService = {
  // Lấy danh sách tất cả chuyền sản xuất
  getLines: async () => {
    try {
      const response = await apiRequest("/Lines");
      return response.data || response; // Handle both wrapped and direct responses
    } catch (error) {
      console.error("Get lines error:", error);
      throw new Error(
        error.message || "Lấy danh sách chuyền sản xuất thất bại"
      );
    }
  },

  // Lấy danh sách các dây chuyền sản xuất đang hoạt động
  getActiveLines: async () => {
    try {
      const response = await apiRequest("/Lines/active");
      return response.data || response;
    } catch (error) {
      console.error("Get active lines error:", error);
      throw new Error(
        error.message || "Lấy danh sách dây chuyền sản xuất đang hoạt động thất bại"
      );
    }
  },

  // Lấy thông tin chuyền sản xuất theo ID
  getLineById: async (id) => {
    try {
      const response = await apiRequest(`/Lines/${id}`);
      return response;
    } catch (error) {
      console.error("Get line by id error:", error);
      throw new Error(
        error.message || "Lấy thông tin chuyền sản xuất thất bại"
      );
    }
  },

  // Tạo chuyền sản xuất mới
  createLine: async (lineData) => {
    try {
      const response = await apiRequest("/Lines", {
        method: "POST",
        body: JSON.stringify(lineData),
      });
      return response;
    } catch (error) {
      console.error("Create line error:", error);
      // Throw lại error message từ API để UI có thể hiển thị
      throw new Error(error.message || "Tạo chuyền sản xuất thất bại");
    }
  },

  // Cập nhật chuyền sản xuất
  updateLine: async (id, lineData) => {
    try {
      const response = await apiRequest(`/Lines/${id}`, {
        method: "PUT",
        body: JSON.stringify(lineData),
      });
      return response;
    } catch (error) {
      console.error("Update line error:", error);
      // Throw lại error message từ API để UI có thể hiển thị
      throw new Error(error.message || "Cập nhật chuyền sản xuất thất bại");
    }
  },

  // Thay đổi trạng thái hoạt động của chuyền sản xuất
  toggleLineStatus: async (id) => {
    try {
      const response = await apiRequest(`/Lines/${id}/toggle-status`, {
        method: "PATCH",
      });
      return response;
    } catch (error) {
      console.error("Toggle line status error:", error);
      throw new Error(
        error.message || "Thay đổi trạng thái chuyền sản xuất thất bại"
      );
    }
  },

  // Lấy chuyền sản xuất theo phòng ban
  getLinesByDepartment: async (departmentId) => {
    try {
      const response = await apiRequest(`/Lines/department/${departmentId}`);
      return response;
    } catch (error) {
      console.error("Get lines by department error:", error);
      throw new Error(
        error.message || "Lấy chuyền sản xuất theo phòng ban thất bại"
      );
    }
  },

  // Lấy chuyền sản xuất mà user được phân công
  getLinesByUser: async (userId) => {
    try {
      const response = await apiRequest(`/Lines/user/${encodeURIComponent(userId)}`);
      return response.data || response;
    } catch (error) {
      console.error("Get lines by user error:", error);
      throw new Error(
        error.message || "Lấy chuyền sản xuất của user thất bại"
      );
    }
  },
};

export default lineService;
