import apiRequest from "./api";

export const sparePartService = {
  async getAll() {
    const res = await apiRequest(`/SparePart`, { method: "GET" });
    return res?.data || res;
  },

  async getById(id) {
    const res = await apiRequest(`/SparePart/${id}`, { method: "GET" });
    return res?.data || res;
  },

  async create(payload) {
    const res = await apiRequest(`/SparePart`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res?.data || res;
  },

  async update(id, payload) {
    const res = await apiRequest(`/SparePart/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res?.data || res;
  },

  async delete(id) {
    const res = await apiRequest(`/SparePart/${id}`, { method: "DELETE" });
    return res?.data || res;
  },

  async getTop5MostUsed() {
    const res = await apiRequest(`/SparePart/top5-most-used`, {
      method: "GET",
    });
    return res?.data || res;
  },

  async getUsageWeekly(week, year) {
    const res = await apiRequest(
      `/SparePart/usage/weekly?week=${week}&year=${year}`,
      { method: "GET" }
    );
    return res?.data || res;
  },

  async getUsageMonthly(month, year) {
    const res = await apiRequest(
      `/SparePart/usage/monthly?month=${month}&year=${year}`,
      { method: "GET" }
    );
    return res?.data || res;
  },

  async getUsageCurrentWeek() {
    const res = await apiRequest(`/SparePart/usage/current-week`, {
      method: "GET",
    });
    return res?.data || res;
  },

  async getUsageCurrentMonth() {
    const res = await apiRequest(`/SparePart/usage/current-month`, {
      method: "GET",
    });
    return res?.data || res;
  },
};
