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

  async getById(id) {
    const res = await apiRequest(
      `/ReplacementHistories/${encodeURIComponent(id)}`,
      { method: "GET" }
    );
    return res?.data || res;
  },

  async getByEquipmentId(equipmentId) {
    const res = await apiRequest(
      `/ReplacementHistories/equipment/${encodeURIComponent(equipmentId)}`,
      { method: "GET" }
    );
    return res?.data || res;
  },

  async getByIncidentId(incidentId) {
    const res = await apiRequest(
      `/ReplacementHistories/incident/${encodeURIComponent(incidentId)}`,
      { method: "GET" }
    );
    return res?.data || res;
  },
  async getByStatus(status) {
    const res = await apiRequest(
      `/ReplacementHistories/status/${encodeURIComponent(status)}`,
      { method: "GET" }
    );
    return res?.data || res;
  },

  async update(id, payload) {
    const res = await apiRequest(
      `/ReplacementHistories/${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return res;
  },

  async recordActualUsage(id, payload) {
    const res = await apiRequest(
      `/ReplacementHistories/${encodeURIComponent(id)}/record-usage`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return res;
  },

  async batchRecordActualUsage(payload) {
    const res = await apiRequest(
      `/ReplacementHistories/batch-record-usage`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return res?.data || res;
  },

  async confirmReturn(id, payload) {
    const res = await apiRequest(
      `/ReplacementHistories/${encodeURIComponent(id)}/confirm-return`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
    return res;
  },
};

export default replacementHistoryService;
