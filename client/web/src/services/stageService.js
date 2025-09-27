// Mock API service for Stage Management
// This will be replaced with actual API calls later

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// Mock data
const mockStages = [
  {
    id: 1,
    stageName: "Chuẩn bị nguyên liệu",
    lineId: 1,
    lineName: "Dây chuyền 1",
    groupLineName: "Nhóm sản xuất chính",
    status: "active",
    performance: 92,
    equipmentCount: 3,
    errorCount: 2,
    outputToday: 450,
    targetOutput: 500,
    efficiency: 90,
    cycleTime: 120, // seconds
    lastError: "2024-01-20T14:30:00Z",
    description: "Giai đoạn chuẩn bị và kiểm tra nguyên liệu đầu vào",
    order: 1,
    isBottleneck: false,
    maintenanceStatus: "good",
    operatorCount: 2,
    qualityScore: 95,
    createdDate: "2024-01-01T00:00:00Z",
    equipment: [
      { id: 1, name: "Máy kiểm tra chất lượng", status: "running" },
      { id: 2, name: "Máy phân loại", status: "running" },
      { id: 3, name: "Cân điện tử", status: "maintenance" },
    ],
  },
  {
    id: 2,
    stageName: "Gia công sơ bộ",
    lineId: 1,
    lineName: "Dây chuyền 1",
    groupLineName: "Nhóm sản xuất chính",
    status: "active",
    performance: 88,
    equipmentCount: 4,
    errorCount: 1,
    outputToday: 420,
    targetOutput: 500,
    efficiency: 84,
    cycleTime: 180,
    lastError: "2024-01-19T09:15:00Z",
    description: "Gia công và xử lý sơ bộ sản phẩm",
    order: 2,
    isBottleneck: true,
    maintenanceStatus: "warning",
    operatorCount: 3,
    qualityScore: 88,
    createdDate: "2024-01-01T00:00:00Z",
    equipment: [
      { id: 4, name: "Máy cắt CNC", status: "running" },
      { id: 5, name: "Máy khoan", status: "running" },
      { id: 6, name: "Máy mài", status: "stopped" },
      { id: 7, name: "Máy đo 3D", status: "running" },
    ],
  },
  {
    id: 3,
    stageName: "Lắp ráp chính",
    lineId: 3,
    lineName: "Dây chuyền lắp ráp A",
    groupLineName: "Nhóm lắp ráp tự động",
    status: "active",
    performance: 95,
    equipmentCount: 5,
    errorCount: 0,
    outputToday: 380,
    targetOutput: 400,
    efficiency: 95,
    cycleTime: 200,
    lastError: "2024-01-18T16:45:00Z",
    description: "Lắp ráp các thành phần chính của sản phẩm",
    order: 1,
    isBottleneck: false,
    maintenanceStatus: "excellent",
    operatorCount: 4,
    qualityScore: 98,
    createdDate: "2024-01-01T00:00:00Z",
    equipment: [
      { id: 8, name: "Robot lắp ráp 1", status: "running" },
      { id: 9, name: "Robot lắp ráp 2", status: "running" },
      { id: 10, name: "Máy vặn vít tự động", status: "running" },
      { id: 11, name: "Máy kiểm tra lực kẹp", status: "running" },
      { id: 12, name: "Máy đóng gói", status: "running" },
    ],
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class StageService {
  // Get all stages
  async getAllStages() {
    try {
      await delay(800); // Simulate network delay

      // In real implementation:
      // const response = await fetch(`${BASE_URL}/stages`);
      // const data = await response.json();
      // return data;

      return {
        success: true,
        data: mockStages,
        total: mockStages.length,
      };
    } catch (error) {
      console.error("Error fetching stages:", error);
      throw new Error("Không thể tải danh sách giai đoạn");
    }
  }

  // Get stage by ID
  async getStageById(id) {
    try {
      await delay(300);

      // In real implementation:
      // const response = await fetch(`${BASE_URL}/stages/${id}`);
      // const data = await response.json();
      // return data;

      const stage = mockStages.find((s) => s.id === parseInt(id));
      if (!stage) {
        throw new Error("Không tìm thấy giai đoạn");
      }

      return {
        success: true,
        data: stage,
      };
    } catch (error) {
      console.error("Error fetching stage:", error);
      throw new Error("Không thể tải thông tin giai đoạn");
    }
  }

  // Get stages by line
  async getStagesByLine(lineId) {
    try {
      await delay(400);

      // In real implementation:
      // const response = await fetch(`${BASE_URL}/stages?lineId=${lineId}`);
      // const data = await response.json();
      // return data;

      const stages = mockStages.filter((s) => s.lineId === parseInt(lineId));

      return {
        success: true,
        data: stages.sort((a, b) => a.order - b.order), // Sort by order
        total: stages.length,
      };
    } catch (error) {
      console.error("Error fetching stages by line:", error);
      throw new Error("Không thể tải danh sách giai đoạn theo dây chuyền");
    }
  }

  // Create new stage
  async createStage(stageData) {
    try {
      await delay(1000);

      // In real implementation:
      // const response = await fetch(`${BASE_URL}/stages`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(stageData)
      // });
      // const data = await response.json();
      // return data;

      const newStage = {
        id: Math.max(...mockStages.map((s) => s.id)) + 1,
        ...stageData,
        createdDate: new Date().toISOString(),
        outputToday: 0,
        performance: 0,
        equipmentCount: 0,
        errorCount: 0,
        efficiency: 0,
        lastError: null,
        isBottleneck: false,
        maintenanceStatus: "good",
        qualityScore: 100,
        equipment: [],
      };

      mockStages.push(newStage);

      return {
        success: true,
        data: newStage,
        message: "Tạo giai đoạn thành công",
      };
    } catch (error) {
      console.error("Error creating stage:", error);
      throw new Error("Không thể tạo giai đoạn mới");
    }
  }

  // Update stage
  async updateStage(id, stageData) {
    try {
      await delay(800);

      // In real implementation:
      // const response = await fetch(`${BASE_URL}/stages/${id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(stageData)
      // });
      // const data = await response.json();
      // return data;

      const index = mockStages.findIndex((s) => s.id === parseInt(id));
      if (index === -1) {
        throw new Error("Không tìm thấy giai đoạn");
      }

      mockStages[index] = {
        ...mockStages[index],
        ...stageData,
        id: parseInt(id), // Preserve the original ID
      };

      return {
        success: true,
        data: mockStages[index],
        message: "Cập nhật giai đoạn thành công",
      };
    } catch (error) {
      console.error("Error updating stage:", error);
      throw new Error("Không thể cập nhật thông tin giai đoạn");
    }
  }

  // Delete stage
  async deleteStage(id) {
    try {
      await delay(500);

      // In real implementation:
      // const response = await fetch(`${BASE_URL}/stages/${id}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();
      // return data;

      const index = mockStages.findIndex((s) => s.id === parseInt(id));
      if (index === -1) {
        throw new Error("Không tìm thấy giai đoạn");
      }

      mockStages.splice(index, 1);

      return {
        success: true,
        message: "Xóa giai đoạn thành công",
      };
    } catch (error) {
      console.error("Error deleting stage:", error);
      throw new Error("Không thể xóa giai đoạn");
    }
  }

  // Update stage status
  async updateStageStatus(id, status) {
    try {
      await delay(300);

      // In real implementation:
      // const response = await fetch(`${BASE_URL}/stages/${id}/status`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ status })
      // });
      // const data = await response.json();
      // return data;

      const index = mockStages.findIndex((s) => s.id === parseInt(id));
      if (index === -1) {
        throw new Error("Không tìm thấy giai đoạn");
      }

      mockStages[index].status = status;

      // Update related properties based on status
      if (status === "active") {
        mockStages[index].performance = Math.random() * 30 + 70; // 70-100%
      } else if (status === "stopped" || status === "maintenance") {
        mockStages[index].performance = 0;
        mockStages[index].outputToday = 0;
      }

      return {
        success: true,
        data: mockStages[index],
        message: `Trạng thái giai đoạn đã được cập nhật thành ${status}`,
      };
    } catch (error) {
      console.error("Error updating stage status:", error);
      throw new Error("Không thể cập nhật trạng thái giai đoạn");
    }
  }

  // Get stage statistics
  async getStageStatistics() {
    try {
      await delay(300);

      const stats = {
        total: mockStages.length,
        active: mockStages.filter((s) => s.status === "active").length,
        maintenance: mockStages.filter((s) => s.status === "maintenance")
          .length,
        stopped: mockStages.filter((s) => s.status === "stopped").length,
        bottlenecks: mockStages.filter((s) => s.isBottleneck).length,
        avgPerformance: Math.round(
          mockStages.reduce((sum, s) => sum + s.performance, 0) /
            mockStages.length
        ),
        avgQuality: Math.round(
          mockStages.reduce((sum, s) => sum + s.qualityScore, 0) /
            mockStages.length
        ),
        totalOutput: mockStages.reduce((sum, s) => sum + s.outputToday, 0),
        totalTarget: mockStages.reduce((sum, s) => sum + s.targetOutput, 0),
        totalErrors: mockStages.reduce((sum, s) => sum + s.errorCount, 0),
        avgCycleTime: Math.round(
          mockStages.reduce((sum, s) => sum + s.cycleTime, 0) /
            mockStages.length
        ),
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching stage statistics:", error);
      throw new Error("Không thể tải thống kê giai đoạn");
    }
  }

  // Detect bottlenecks
  async detectBottlenecks() {
    try {
      await delay(500);

      // Simple bottleneck detection: stages with performance < 80% and high cycle time
      const bottlenecks = mockStages.filter(
        (s) => s.performance < 80 || s.cycleTime > 250 || s.errorCount > 3
      );

      // Mark as bottlenecks
      bottlenecks.forEach((bottleneck) => {
        const index = mockStages.findIndex((s) => s.id === bottleneck.id);
        if (index !== -1) {
          mockStages[index].isBottleneck = true;
        }
      });

      return {
        success: true,
        data: bottlenecks,
        message: `Phát hiện ${bottlenecks.length} nút thắt cổ chai`,
      };
    } catch (error) {
      console.error("Error detecting bottlenecks:", error);
      throw new Error("Không thể phát hiện nút thắt cổ chai");
    }
  }

  // Get stage equipment
  async getStageEquipment(stageId) {
    try {
      await delay(300);

      const stage = mockStages.find((s) => s.id === parseInt(stageId));
      if (!stage) {
        throw new Error("Không tìm thấy giai đoạn");
      }

      return {
        success: true,
        data: stage.equipment || [],
        total: (stage.equipment || []).length,
      };
    } catch (error) {
      console.error("Error fetching stage equipment:", error);
      throw new Error("Không thể tải danh sách thiết bị");
    }
  }

  // Update stage order
  async updateStageOrder(stageId, newOrder) {
    try {
      await delay(400);

      const index = mockStages.findIndex((s) => s.id === parseInt(stageId));
      if (index === -1) {
        throw new Error("Không tìm thấy giai đoạn");
      }

      mockStages[index].order = newOrder;

      return {
        success: true,
        data: mockStages[index],
        message: "Cập nhật thứ tự giai đoạn thành công",
      };
    } catch (error) {
      console.error("Error updating stage order:", error);
      throw new Error("Không thể cập nhật thứ tự giai đoạn");
    }
  }
}

export default new StageService();
