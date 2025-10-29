import apiRequest from "./api";

export const replacementHistoryService = {
  async create(payload) {
    const res = await apiRequest(`/ReplacementHistories`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  },

  async getAll() {
    const res = await apiRequest(`/ReplacementHistories`, { method: "GET" });
    return res?.data || res;
  },
  async getByEquipmentId(equipmentId) {
    const res = await apiRequest(
      `/ReplacementHistories/equipment/${encodeURIComponent(equipmentId)}`,
      { method: "GET" }
    );
    return res?.data || res;
  },
};

export default replacementHistoryService;
