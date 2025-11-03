import apiRequest from './api';

export const replacementStatisticsService = {
  /**
   * Lấy thống kê linh kiện tiêu hao
   * @param {Object} params - Query parameters
   * @param {number} params.lineId - Filter by line
   * @param {number} params.stageId - Filter by stage
   * @param {string} params.status - Filter by status (safe, warning, critical)
   */
  getStatistics: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.lineId) queryParams.append('lineId', params.lineId);
      if (params.stageId) queryParams.append('stageId', params.stageId);
      if (params.status) queryParams.append('status', params.status);

      const queryString = queryParams.toString();
      const url = `/ReplacementStatistics${queryString ? `?${queryString}` : ''}`;
      
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      console.error('Error fetching replacement statistics:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách dây chuyền có dữ liệu
   */
  getLinesWithData: async () => {
    try {
      const data = await apiRequest('/ReplacementStatistics/lines');
      return data;
    } catch (error) {
      console.error('Error fetching lines:', error);
      throw error;
    }
  },

  /**
   * Lấy tổng hợp số lượng theo trạng thái
   * @param {number} lineId - Optional line ID filter
   */
  getSummary: async (lineId = null) => {
    try {
      const url = lineId 
        ? `/ReplacementStatistics/summary?lineId=${lineId}`
        : '/ReplacementStatistics/summary';
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      throw error;
    }
  }
};
