import apiRequest from "./api";

export const stageService = {
  async getStages() {
    try {
      const response = await apiRequest("/Stages");
      return response;
    } catch (error) {
      console.error("Get stages error:", error);
      throw error;
    }
  },

  getActiveStages: async () => {
    try {
      const response = await apiRequest("/Stages/active");
      return response;
    } catch (error) {
      console.error("Get active stages error:", error);
      throw new Error(
        error.message || "Lấy danh sách công đoạn đang hoạt động thất bại"
      );
    }
  },

  async getStage(id) {
    try {
      return await apiRequest(`/Stages/${id}`);
    } catch (error) {
      console.error("Get stage error:", error);
      throw error;
    }
  },

  async createStage(stageData) {
    try {
      return await apiRequest("/Stages", {
        method: "POST",
        body: JSON.stringify(stageData),
      });
    } catch (error) {
      console.error("Create stage error:", error);
      // Throw lại error message từ API để UI có thể hiển thị
      throw new Error(error.message || "Tạo giai đoạn thất bại");
    }
  },

  async updateStage(id, stageData) {
    try {
      return await apiRequest(`/Stages/${id}`, {
        method: "PUT",
        body: JSON.stringify(stageData),
      });
    } catch (error) {
      console.error("Update stage error:", error);
      // Throw lại error message từ API để UI có thể hiển thị
      throw new Error(error.message || "Cập nhật giai đoạn thất bại");
    }
  },

  async toggleStageStatus(id) {
    try {
      return await apiRequest(`/Stages/${id}/toggle-status`, {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Toggle stage status error:", error);
      throw error;
    }
  },

  async getStagesByLine(lineId) {
    try {
      return await apiRequest(`/Stages/line/${lineId}`);
    } catch (error) {
      console.error("Get stages by line error:", error);
      throw error;
    }
  },
};
