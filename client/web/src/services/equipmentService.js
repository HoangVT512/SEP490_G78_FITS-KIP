import apiRequest from "./api";

export const equipmentService = {
  async getEquipments() {
    try {
      const response = await apiRequest("/equipments");
      return response.data || response;
    } catch (error) {
      console.error("Get equipments error:", error);
      throw error;
    }
  },

  async getEquipment(id) {
    try {
      const response = await apiRequest(`/equipments/${id}`);
      return response.data || response;
    } catch (error) {
      console.error("Get equipment error:", error);
      throw error;
    }
  },

  async createEquipment(equipmentData) {
    try {
      const response = await apiRequest("/equipments", {
        method: "POST",
        body: JSON.stringify(equipmentData),
      });
      return response.data || response;
    } catch (error) {
      console.error("Create equipment error:", error);
      throw new Error(error.message || "Tạo thiết bị thất bại");
    }
  },

  async updateEquipment(id, equipmentData) {
    try {
      const response = await apiRequest(`/equipments/${id}`, {
        method: "PUT",
        body: JSON.stringify(equipmentData),
      });
      return response.data || response;
    } catch (error) {
      console.error("Update equipment error:", error);
      throw new Error(error.message || "Cập nhật thiết bị thất bại");
    }
  },

  async deleteEquipment(id) {
    try {
      const response = await apiRequest(`/equipments/${id}`, {
        method: "DELETE",
      });
      return response.data || response;
    } catch (error) {
      console.error("Delete equipment error:", error);
      throw new Error(error.message || "Xóa thiết bị thất bại");
    }
  },

  async toggleEquipmentStatus(id) {
    try {
      const response = await apiRequest(`/equipments/${id}/toggle-status`, {
        method: "PATCH",
      });
      return response.data || response;
    } catch (error) {
      console.error("Toggle equipment status error:", error);
      throw error;
    }
  },

  async getEquipmentsByStage(stageId) {
    try {
      const response = await apiRequest(`/equipments/by-stage/${stageId}`);
      return response.data || response;
    } catch (error) {
      console.error("Get equipments by stage error:", error);
      throw error;
    }
  },

  async generateQRCode(id) {
    try {
      const response = await apiRequest(`/equipments/${id}/generate-qr`, {
        method: "POST",
      });
      return response.data || response;
    } catch (error) {
      console.error("Generate QR code error:", error);
      throw new Error(error.message || "Tạo mã QR thất bại");
    }
  },
};
