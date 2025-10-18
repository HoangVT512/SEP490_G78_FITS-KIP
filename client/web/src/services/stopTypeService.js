import apiRequest from "./api";

export const stopTypeService = {
  // Get all stop types using the centralized api helper (uses REACT_APP_API_BASE_URL or https://localhost:7003/api)
  getStopTypes: async () => {
    try {
      const res = await apiRequest("/Incidents/stop-types", { method: "GET" });
      return Array.isArray(res) ? res : res?.data || [];
    } catch (error) {
      console.error("Error fetching stop types:", error);
      throw error;
    }
  },

  // Get a single stop type by id
  getStopTypeById: async (id) => {
    try {
      const res = await apiRequest(`/Incidents/stop-types/${id}`, {
        method: "GET",
      });
      return res?.data || res;
    } catch (error) {
      console.error("Error fetching stop type:", error);
      throw error;
    }
  },
};

export default stopTypeService;
