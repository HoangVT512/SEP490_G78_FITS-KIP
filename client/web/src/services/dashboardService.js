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

  // Lấy thống kê downtime theo tháng và dây chuyền
  getDowntimeStats: async (month, year, lineId = null) => {
    try {
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
      });
      if (lineId) {
        params.append("lineId", lineId.toString());
      }

      const response = await apiRequest(`/dashboard/downtime-stats?${params.toString()}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching downtime stats:", error);
      throw error;
    }
  },

  // Lấy thống kê downtime theo ngày
  getDailyDowntimeStats: async (month, year, lineId = null, date = null) => {
    try {
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
      });
      if (lineId) {
        params.append("lineId", lineId.toString());
      }
      if (date) {
        params.append("date", date);
      }

      const response = await apiRequest(`/dashboard/daily-downtime-stats?${params.toString()}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error fetching daily downtime stats:", error);
      throw error;
    }
  },

  // Lấy OEE stats cho tất cả lines theo ngày
  getOEEStatsByDate: async (date) => {
    try {
      // date format: yyyy-MM-dd or dd/MM/yyyy
      const formattedDate = date.includes('/') 
        ? date.split('/').reverse().join('-') 
        : date;
      
      const [year, month, day] = formattedDate.split('-');
      const dateParam = `${day}/${month}/${year}`;
      
      const response = await apiRequest(
        `/dashboard/daily-downtime-stats?month=${month}&year=${year}&date=${encodeURIComponent(dateParam)}`,
        { method: "GET" }
      );
      return response;
    } catch (error) {
      console.error("Error fetching OEE stats by date:", error);
      throw error;
    }
  },
};
