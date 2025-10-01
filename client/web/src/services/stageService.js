import apiRequest from './api';

export const stageService = {
  async getStages() {
    try {
      return await apiRequest('/stages');
    } catch (error) {
      console.error('Get stages error:', error);
      throw error;
    }
  },

  async getStage(id) {
    try {
      return await apiRequest(`/stages/${id}`);
    } catch (error) {
      console.error('Get stage error:', error);
      throw error;
    }
  },

  async createStage(stageData) {
    try {
      return await apiRequest('/stages', {
        method: 'POST',
        body: JSON.stringify(stageData),
      });
    } catch (error) {
      console.error('Create stage error:', error);
      throw error;
    }
  },

  async updateStage(id, stageData) {
    try {
      return await apiRequest(`/stages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(stageData),
      });
    } catch (error) {
      console.error('Update stage error:', error);
      throw error;
    }
  },

  async deleteStage(id) {
    try {
      return await apiRequest(`/stages/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete stage error:', error);
      throw error;
    }
  },

  async getStagesByLine(lineId) {
    try {
      return await apiRequest(`/stages/line/${lineId}`);
    } catch (error) {
      console.error('Get stages by line error:', error);
      throw error;
    }
  },
};
