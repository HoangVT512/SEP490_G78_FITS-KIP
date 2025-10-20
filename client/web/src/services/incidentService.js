import apiRequest from "./api";

export const incidentService = {
  async getAll() {
    const res = await apiRequest("/Incidents", { method: "GET" });
    return res?.data || res;
  },

  async getById(id) {
    const res = await apiRequest(`/Incidents/${encodeURIComponent(id)}`, {
      method: "GET",
    });
    return res?.data || res;
  },

  async create(payload) {
    const res = await apiRequest("/Incidents", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res?.data || res;
  },

  async createBulk(incidents) {
    const res = await apiRequest("/Incidents/bulk", {
      method: "POST",
      body: JSON.stringify({ incidents }),
    });
    return res?.data || res;
  },

  async update(id, payload) {
    const res = await apiRequest(`/Incidents/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res?.data || res;
  },

  async delete(id) {
    const res = await apiRequest(`/Incidents/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    return res?.data || res;
  },

  async getDowntimeStats(query) {
    // query: { period, startDate, endDate, lineId }
    const params = new URLSearchParams();
    if (query?.period) params.set("period", query.period);
    if (query?.startDate) params.set("startDate", query.startDate);
    if (query?.endDate) params.set("endDate", query.endDate);
    if (query?.lineId) params.set("lineId", query.lineId);
    const res = await apiRequest(
      `/Incidents/downtime-stats?${params.toString()}`,
      { method: "GET" }
    );
    return res?.data || res;
  },

  async getIncidentShifts(incidentId) {
    const res = await apiRequest(`/Incidents/${encodeURIComponent(incidentId)}/shifts`, {
      method: "GET",
    });
    return res?.data || res;
  },
};
