// Mock API service for Line Group Management
// This will be replaced with actual API calls later

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// Mock data
const mockLineGroups = [
  {
    id: 1,
    groupLineName: "Nhóm sản xuất chính",
    roomId: 1,
    roomName: "Phòng sản xuất A",
    status: "active",
    efficiency: 85,
    targetOutput: 1000,
    actualOutput: 850,
    lineCount: 4,
    operatingHours: 16,
    maintenanceStatus: "good",
    lastMaintenance: "2024-01-15T00:00:00Z",
    nextMaintenance: "2024-02-15T00:00:00Z",
    supervisor: "Nguyễn Văn Quản",
    shift: "Ca 1",
    createdDate: "2024-01-01T00:00:00Z",
    lines: [
      { id: 1, name: "Dây chuyền 1", status: "running", efficiency: 90 },
      { id: 2, name: "Dây chuyền 2", status: "running", efficiency: 85 },
      { id: 3, name: "Dây chuyền 3", status: "maintenance", efficiency: 0 },
      { id: 4, name: "Dây chuyền 4", status: "stopped", efficiency: 80 },
    ],
  },
  {
    id: 2,
    groupLineName: "Nhóm lắp ráp tự động",
    roomId: 3,
    roomName: "Phòng lắp ráp",
    status: "active",
    efficiency: 92,
    targetOutput: 800,
    actualOutput: 736,
    lineCount: 3,
    operatingHours: 12,
    maintenanceStatus: "excellent",
    lastMaintenance: "2024-01-10T00:00:00Z",
    nextMaintenance: "2024-02-10T00:00:00Z",
    supervisor: "Trần Thị Linh",
    shift: "Ca 2",
    createdDate: "2024-01-01T00:00:00Z",
    lines: [
      {
        id: 5,
        name: "Dây chuyền lắp ráp A",
        status: "running",
        efficiency: 95,
      },
      {
        id: 6,
        name: "Dây chuyền lắp ráp B",
        status: "running",
        efficiency: 90,
      },
      { id: 7, name: "Dây chuyền đóng gói", status: "running", efficiency: 91 },
    ],
  },
  {
    id: 3,
    groupLineName: "Nhóm kiểm tra chất lượng",
    roomId: 4,
    roomName: "Phòng kiểm tra chất lượng",
    status: "maintenance",
    efficiency: 0,
    targetOutput: 500,
    actualOutput: 0,
    lineCount: 2,
    operatingHours: 0,
    maintenanceStatus: "maintenance",
    lastMaintenance: "2024-01-20T00:00:00Z",
    nextMaintenance: "2024-01-25T00:00:00Z",
    supervisor: "Lê Văn Kiểm",
    shift: "Ca 1",
    createdDate: "2024-01-01T00:00:00Z",
    lines: [
      { id: 8, name: "Dây chuyền QC1", status: "maintenance", efficiency: 0 },
      { id: 9, name: "Dây chuyền QC2", status: "maintenance", efficiency: 0 },
    ],
  },
];

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class LineGroupService {
  // Get all line groups
  async getAllLineGroups() {
    try {
      await delay(800); // Simulate network delay

      // In real implementation:
      // const response = await fetch(`${BASE_URL}/linegroups`);
      // const data = await response.json();
      // return data;

      return {
        success: true,
        data: mockLineGroups,
        total: mockLineGroups.length,
      };
    } catch (error) {
      console.error("Error fetching line groups:", error);
      throw new Error("Không thể tải danh sách nhóm dây chuyền");
    }
  }

  // Get line group by ID
  async getLineGroupById(id) {
    try {
      await delay(300);

      // In real implementation:
      // const response = await fetch(`${BASE_URL}/linegroups/${id}`);
      // const data = await response.json();
      // return data;

      const lineGroup = mockLineGroups.find((lg) => lg.id === parseInt(id));
      if (!lineGroup) {
        throw new Error("Không tìm thấy nhóm dây chuyền");
      }

      return {
        success: true,
        data: lineGroup,
      };
    } catch (error) {
      console.error("Error fetching line group:", error);
      throw new Error("Không thể tải thông tin nhóm dây chuyền");
    }
  }

  // Create new line group
  async createLineGroup(lineGroupData) {
    try {
      await delay(1000);

      // In real implementation:
      // const response = await fetch(`${BASE_URL}/linegroups`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(lineGroupData)
      // });
      // const data = await response.json();
      // return data;

      const newLineGroup = {
        id: Math.max(...mockLineGroups.map((lg) => lg.id)) + 1,
        ...lineGroupData,
        createdDate: new Date().toISOString(),
        actualOutput: 0,
        efficiency: 0,
        lineCount: 0,
        maintenanceStatus: "good",
        lastMaintenance: new Date().toISOString(),
        nextMaintenance: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days later
        lines: [],
      };

      mockLineGroups.push(newLineGroup);

      return {
        success: true,
        data: newLineGroup,
        message: "Tạo nhóm dây chuyền thành công",
      };
    } catch (error) {
      console.error("Error creating line group:", error);
      throw new Error("Không thể tạo nhóm dây chuyền mới");
    }
  }

  // Update line group
  async updateLineGroup(id, lineGroupData) {
    try {
      await delay(800);

      // In real implementation:
      // const response = await fetch(`${BASE_URL}/linegroups/${id}`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(lineGroupData)
      // });
      // const data = await response.json();
      // return data;

      const index = mockLineGroups.findIndex((lg) => lg.id === parseInt(id));
      if (index === -1) {
        throw new Error("Không tìm thấy nhóm dây chuyền");
      }

      mockLineGroups[index] = {
        ...mockLineGroups[index],
        ...lineGroupData,
        id: parseInt(id), // Preserve the original ID
      };

      return {
        success: true,
        data: mockLineGroups[index],
        message: "Cập nhật nhóm dây chuyền thành công",
      };
    } catch (error) {
      console.error("Error updating line group:", error);
      throw new Error("Không thể cập nhật thông tin nhóm dây chuyền");
    }
  }

  // Delete line group
  async deleteLineGroup(id) {
    try {
      await delay(500);

      // In real implementation:
      // const response = await fetch(`${BASE_URL}/linegroups/${id}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();
      // return data;

      const index = mockLineGroups.findIndex((lg) => lg.id === parseInt(id));
      if (index === -1) {
        throw new Error("Không tìm thấy nhóm dây chuyền");
      }

      mockLineGroups.splice(index, 1);

      return {
        success: true,
        message: "Xóa nhóm dây chuyền thành công",
      };
    } catch (error) {
      console.error("Error deleting line group:", error);
      throw new Error("Không thể xóa nhóm dây chuyền");
    }
  }

  // Update line group status
  async updateLineGroupStatus(id, status) {
    try {
      await delay(300);

      // In real implementation:
      // const response = await fetch(`${BASE_URL}/linegroups/${id}/status`, {
      //   method: 'PATCH',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify({ status })
      // });
      // const data = await response.json();
      // return data;

      const index = mockLineGroups.findIndex((lg) => lg.id === parseInt(id));
      if (index === -1) {
        throw new Error("Không tìm thấy nhóm dây chuyền");
      }

      mockLineGroups[index].status = status;

      // Update related properties based on status
      if (status === "active") {
        mockLineGroups[index].operatingHours =
          mockLineGroups[index].operatingHours || 8;
        mockLineGroups[index].efficiency = Math.random() * 30 + 70; // 70-100%
      } else if (status === "stopped" || status === "maintenance") {
        mockLineGroups[index].operatingHours = 0;
        mockLineGroups[index].efficiency = 0;
        mockLineGroups[index].actualOutput = 0;
      }

      return {
        success: true,
        data: mockLineGroups[index],
        message: `Trạng thái nhóm dây chuyền đã được cập nhật thành ${status}`,
      };
    } catch (error) {
      console.error("Error updating line group status:", error);
      throw new Error("Không thể cập nhật trạng thái nhóm dây chuyền");
    }
  }

  // Get line groups by room
  async getLineGroupsByRoom(roomId) {
    try {
      await delay(400);

      const lineGroups = mockLineGroups.filter(
        (lg) => lg.roomId === parseInt(roomId)
      );

      return {
        success: true,
        data: lineGroups,
        total: lineGroups.length,
      };
    } catch (error) {
      console.error("Error fetching line groups by room:", error);
      throw new Error("Không thể tải danh sách nhóm dây chuyền theo phòng");
    }
  }

  // Get line group statistics
  async getLineGroupStatistics() {
    try {
      await delay(300);

      const stats = {
        total: mockLineGroups.length,
        active: mockLineGroups.filter((lg) => lg.status === "active").length,
        maintenance: mockLineGroups.filter((lg) => lg.status === "maintenance")
          .length,
        stopped: mockLineGroups.filter((lg) => lg.status === "stopped").length,
        avgEfficiency: Math.round(
          mockLineGroups.reduce((sum, lg) => sum + lg.efficiency, 0) /
            mockLineGroups.length
        ),
        totalLines: mockLineGroups.reduce((sum, lg) => sum + lg.lineCount, 0),
        totalOutput: mockLineGroups.reduce(
          (sum, lg) => sum + lg.actualOutput,
          0
        ),
        totalTarget: mockLineGroups.reduce(
          (sum, lg) => sum + lg.targetOutput,
          0
        ),
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Error fetching line group statistics:", error);
      throw new Error("Không thể tải thống kê nhóm dây chuyền");
    }
  }
}

export default new LineGroupService();
