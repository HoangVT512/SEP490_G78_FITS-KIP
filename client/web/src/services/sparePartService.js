import apiRequest from "./api";

export const sparePartService = {
  async getAll() {
    const res = await apiRequest(`/SpareParts`, { method: "GET" });
    return res?.data || res;
  },

  async getById(id) {
    const res = await apiRequest(`/SpareParts/${id}`, { method: "GET" });
    return res?.data || res;
  },

  async create(payload) {
    const res = await apiRequest(`/SpareParts`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res?.data || res;
  },

  async update(id, payload) {
    const res = await apiRequest(`/SpareParts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res?.data || res;
  },

  async delete(id) {
    const res = await apiRequest(`/SpareParts/${id}`, { method: "DELETE" });
    return res?.data || res;
  },

  async getTop5MostUsed() {
    const res = await apiRequest(`/SpareParts/top5-most-used`, {
      method: "GET",
    });
    return res?.data || res;
  },

  async getUsageWeekly(week, year) {
    const res = await apiRequest(
      `/SpareParts/usage/weekly?week=${week}&year=${year}`,
      { method: "GET" }
    );
    return res?.data || res;
  },

  async getUsageMonthly(month, year) {
    const res = await apiRequest(
      `/SpareParts/usage/monthly?month=${month}&year=${year}`,
      { method: "GET" }
    );
    return res?.data || res;
  },

  async getUsageCurrentWeek() {
    const res = await apiRequest(`/SpareParts/usage/current-week`, {
      method: "GET",
    });
    return res?.data || res;
  },

  async getUsageCurrentMonth() {
    const res = await apiRequest(`/SpareParts/usage/current-month`, {
      method: "GET",
    });
    return res?.data || res;
  },
};
