import apiRequest from "./api";

export const dashboardService = {
  // Lấy thống kê tổng quan
  getStatistics: async () => {
    try {
      const response = await apiRequest("/admin/dashboard/statistics", {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching dashboard statistics:", error);
      throw error;
    }
  },

  // Lấy danh sách người dùng mới
  getRecentUsers: async (limit = 10) => {
    try {
      const response = await apiRequest(
        `/admin/dashboard/recent-users?limit=${limit}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("Error fetching recent users:", error);
      throw error;
    }
  },
};
