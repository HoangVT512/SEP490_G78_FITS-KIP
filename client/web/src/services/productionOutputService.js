import apiRequest from './api';
import dayjs from 'dayjs'; // ✅ THÊM DÒNG NÀY

const productionOutputService = {
  // Get production outputs by line and date
  getByLineAndDate: async (lineId, date) => {
    try {
      // Handle both Date object and string date
      let dateObj;
      if (typeof date === 'string') {
        // Parse string date (assuming YYYY-MM-DD format)
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        // Assume it's a dayjs object or similar
        dateObj = new Date(date);
      }
      // Format date to DD/MM/YYYY
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      const url = `/ProductionOutputs/line/${lineId}/date?date=${encodeURIComponent(formattedDate)}`;
      const data = await apiRequest(url);
      return data;
    } catch (error) {
      console.error('Lỗi lấy dữ liệu sản lượng:', error);
      throw error;
    }
  },

  // Create new production output
  create: async (productionOutputData) => {
    try {
      // Validate required fields before sending
      if (!productionOutputData.lineId || !productionOutputData.date || !productionOutputData.shiftId || !productionOutputData.slotTime) {
        throw new Error('Thiếu dữ liệu bắt buộc: lineId, date, shiftId, hoặc slotTime');
      }

      // Ensure numeric values are actually numbers
      const payload = {
        lineId: parseInt(productionOutputData.lineId),
        date: dayjs(productionOutputData.date).format('YYYY-MM-DD'), // ✅ Sử dụng dayjs để format
        shiftId: parseInt(productionOutputData.shiftId),
        slotTime: productionOutputData.slotTime,
        loadingTime: productionOutputData.loadingTime !== null && productionOutputData.loadingTime !== undefined ? parseInt(productionOutputData.loadingTime) : null,
        targetAmount: productionOutputData.targetAmount ? parseInt(productionOutputData.targetAmount) : null,
        resultAmount: productionOutputData.resultAmount ? parseInt(productionOutputData.resultAmount) : null,
      };

      console.log('CREATE payload:', payload);

      const data = await apiRequest('/ProductionOutputs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    } catch (error) {
      console.error('Lỗi tạo sản lượng:', error);
      throw error;
    }
  },

  // Update production output
  update: async (id, productionOutputData) => {
    try {
      const url = `/ProductionOutputs/${id}`;

      // For UPDATE, only send the fields that can be modified
      const payload = {
        loadingTime: productionOutputData.loadingTime !== null && productionOutputData.loadingTime !== undefined ? parseInt(productionOutputData.loadingTime) : null,
        targetAmount: productionOutputData.targetAmount ? parseInt(productionOutputData.targetAmount) : null,
        resultAmount: productionOutputData.resultAmount ? parseInt(productionOutputData.resultAmount) : null,
      };

      console.log('UPDATE ID:', id, 'payload:', payload);

      const data = await apiRequest(url, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return data;
    } catch (error) {
      console.error('Lỗi cập nhật sản lượng:', error);
      throw error;
    }
  },

  // Delete production output
  delete: async (id) => {
    try {
      const url = `/ProductionOutputs/${id}`;
      await apiRequest(url, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Lỗi xóa sản lượng:', error);
      throw error;
    }
  },

  // Get available slot times
  getAvailableSlotTimes: async (requestData) => {
    try {
      const data = await apiRequest('/ProductionOutputs/available-slots', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });
      return data;
    } catch (error) {
      console.error('Lỗi lấy khoảng thời gian khả dụng:', error);
      throw error;
    }
  },

  // Calculate OEE
  calculateOEE: async (requestData) => {
    try {
      // Validate data before sending
      if (!requestData.lineId || !requestData.date || !requestData.shiftId || !requestData.slotTime) {
        throw new Error('Thiếu dữ liệu bắt buộc cho tính OEE');
      }

      const payload = {
        lineId: parseInt(requestData.lineId),
        date: requestData.date,
        shiftId: parseInt(requestData.shiftId),
        slotTime: requestData.slotTime,
        targetAmount: requestData.targetAmount ? parseInt(requestData.targetAmount) : null,
        resultAmount: requestData.resultAmount ? parseInt(requestData.resultAmount) : null,
      };

      const data = await apiRequest('/ProductionOutputs/calculate-oee', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    } catch (error) {
      console.error('Lỗi tính toán OEE:', error);
      throw error;
    }
  },

  // Reload production outputs after create/update
  reloadProductionOutputs: async (lineId, date) => {
    try {
      const formattedDate = dayjs(date, 'DD/MM/YYYY').format('YYYY-MM-DD');
      const response = await productionOutputService.getByLineAndDate(lineId, formattedDate);
      return response?.data || [];
    } catch (error) {
      console.error('Lỗi reload dữ liệu sản lượng:', error);
      throw error;
    }
  },
};

export default productionOutputService;