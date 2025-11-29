import apiRequest from "./api";

export const incidentService = {
  async getAll() {
    const res = await apiRequest("/Incidents", { method: "GET" });
    return res?.data || res;
  },

  async getAssignedToMe() {
    const res = await apiRequest("/Incidents/assigned-to-me", {
      method: "GET",
    });
    return res?.data || res;
  },

  async getIncidentsByLineAndDate(lineId, date) {
    try {
      // date should be in DD/MM/YYYY format
      const url = `/Incidents/line/${lineId}/date?date=${encodeURIComponent(
        date
      )}`;
      const data = await apiRequest(url);
      return data?.data || [];
    } catch (error) {
      console.error("Lỗi lấy những sự cố theo dây chuyền và ngày:", error);
      throw error;
    }
  },

  async getActiveIncidentsByLine(lineId) {
    try {
      const url = `/Incidents/line/${lineId}/active-incidents`;
      const data = await apiRequest(url);
      return data?.data || [];
    } catch (error) {
      console.error("Lỗi lấy sự cố đang hoạt động theo dây chuyền:", error);
      throw error;
    }
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
      body: JSON.stringify({ Incidents: incidents }), // Backend expects capital 'Incidents'
    });
    return res?.data || res;
  },

  async update(id, payload) {
    console.log("=== incidentService.update DEBUG ===");
    console.log("ID:", id);
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.log(
      "Payload types:",
      Object.entries(payload).map(([k, v]) => `${k}: ${typeof v} = ${v}`)
    );

    try {
      const res = await apiRequest(`/Incidents/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      console.log("Update response:", res);
      return res?.data || res;
    } catch (error) {
      console.error("=== incidentService.update ERROR ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      throw error;
    }
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
    const res = await apiRequest(
      `/Incidents/${encodeURIComponent(incidentId)}/shifts`,
      {
        method: "GET",
      }
    );
    return res?.data || res;
  },

  async assignTechnician(incidentId, technicianId, updateStatus = false) {
    const res = await apiRequest(
      `/Incidents/${encodeURIComponent(incidentId)}/assign-technician`,
      {
        method: "PUT",
        body: JSON.stringify({ technicianId, updateStatus }),
      }
    );
    return res?.data || res;
  },

  async getIncidentsByUserLines(userId) {
    const res = await apiRequest(
      `/Incidents/user/${encodeURIComponent(userId)}/lines`,
      {
        method: "GET",
      }
    );
    return res?.data || res;
  },

  async uploadImage(imageFile) {
    const formData = new FormData();
    formData.append("imageFile", imageFile);

    const res = await apiRequest("/Incidents/upload-image", {
      method: "POST",
      body: formData,
      isFormData: true, // Flag to skip JSON Content-Type header
    });
    // Backend returns {imageUrl: "..."}, extract the URL string
    const data = res?.data || res;
    return data?.imageUrl || data;
  },

  async getTechSupportPendingIncidents(date = null) {
    const params = date ? `?date=${encodeURIComponent(date)}` : "";
    const res = await apiRequest(`/Incidents/tech-support-pending${params}`, {
      method: "GET",
    });
    return res;
  },

  async checkHasSpareParts(incidentId) {
    const res = await apiRequest(
      `/Incidents/${encodeURIComponent(incidentId)}/spare-parts-status`,
      {
        method: "GET",
      }
    );
    return res?.data || { hasPendingRequests: false, hasReturnRequests: false };
  },
};
