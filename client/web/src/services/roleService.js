import { apiRequest } from "./api";

export const roleService = {
  // Get all roles
  getRoles: async () => {
    try {
      const response = await apiRequest("/roles", {
        method: "GET",
      });

      // Transform data for frontend
      return response.map((role) => ({
        id: role.id,
        name: role.name,
        normalizedName: role.normalizedName,
        description: role.description || "",
        status: role.isActive ? "active" : "inactive",
        isSystemRole: role.isSystemRole || false,
        userCount: role.userCount || 0,
        permissions: role.permissions || [],
        createdDate: role.createdDate,
        updatedDate: role.updatedDate,
        createdBy: role.createdBy,
        priority: role.priority || 4,
      }));
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw new Error("Không thể tải danh sách vai trò");
    }
  },

  // Get role by ID
  getRoleById: async (id) => {
    try {
      const response = await apiRequest(`/roles/${id}`, {
        method: "GET",
      });

      return {
        id: response.id,
        name: response.name,
        normalizedName: response.normalizedName,
        description: response.description || "",
        status: response.isActive ? "active" : "inactive",
        isSystemRole: response.isSystemRole || false,
        userCount: response.userCount || 0,
        permissions: response.permissions || [],
        createdDate: response.createdDate,
        updatedDate: response.updatedDate,
        createdBy: response.createdBy,
        priority: response.priority || 4,
      };
    } catch (error) {
      console.error("Error fetching role:", error);
      throw new Error("Không thể tải thông tin vai trò");
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const payload = {
        name: roleData.name,
        description: roleData.description,
        isActive: roleData.status === "active",
        permissions: roleData.permissions || [],
      };

      const response = await apiRequest("/roles", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return {
        id: response.id,
        name: response.name,
        normalizedName: response.normalizedName,
        description: response.description || "",
        status: response.isActive ? "active" : "inactive",
        isSystemRole: response.isSystemRole || false,
        userCount: response.userCount || 0,
        permissions: response.permissions || [],
        createdDate: response.createdDate,
        updatedDate: response.updatedDate,
        createdBy: response.createdBy,
        priority: response.priority || 4,
      };
    } catch (error) {
      console.error("Error creating role:", error);
      throw new Error("Không thể tạo vai trò mới");
    }
  },

  // Update existing role
  updateRole: async (id, roleData) => {
    try {
      const payload = {
        name: roleData.name,
        description: roleData.description,
        isActive: roleData.status === "active",
        permissions: roleData.permissions || [],
      };

      const response = await apiRequest(`/roles/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      return {
        id: response.id,
        name: response.name,
        normalizedName: response.normalizedName,
        description: response.description || "",
        status: response.isActive ? "active" : "inactive",
        isSystemRole: response.isSystemRole || false,
        userCount: response.userCount || 0,
        permissions: response.permissions || [],
        createdDate: response.createdDate,
        updatedDate: response.updatedDate,
        createdBy: response.createdBy,
        priority: response.priority || 4,
      };
    } catch (error) {
      console.error("Error updating role:", error);
      throw new Error("Không thể cập nhật vai trò");
    }
  },

  // Delete role
  deleteRole: async (id) => {
    try {
      await apiRequest(`/roles/${id}`, {
        method: "DELETE",
      });
      return { success: true };
    } catch (error) {
      console.error("Error deleting role:", error);
      throw new Error("Không thể xóa vai trò");
    }
  },

  // Update role permissions
  updateRolePermissions: async (id, permissions) => {
    try {
      const response = await apiRequest(`/roles/${id}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ permissions }),
      });

      return {
        id: response.id,
        name: response.name,
        normalizedName: response.normalizedName,
        description: response.description || "",
        status: response.isActive ? "active" : "inactive",
        isSystemRole: response.isSystemRole || false,
        userCount: response.userCount || 0,
        permissions: response.permissions || [],
        createdDate: response.createdDate,
        updatedDate: response.updatedDate,
        createdBy: response.createdBy,
        priority: response.priority || 4,
      };
    } catch (error) {
      console.error("Error updating role permissions:", error);
      throw new Error("Không thể cập nhật quyền vai trò");
    }
  },

  // Toggle role status
  toggleRoleStatus: async (id) => {
    try {
      const response = await apiRequest(`/roles/${id}/toggle-status`, {
        method: "PATCH",
      });

      return {
        id: response.id,
        name: response.name,
        normalizedName: response.normalizedName,
        description: response.description || "",
        status: response.isActive ? "active" : "inactive",
        isSystemRole: response.isSystemRole || false,
        userCount: response.userCount || 0,
        permissions: response.permissions || [],
        createdDate: response.createdDate,
        updatedDate: response.updatedDate,
        createdBy: response.createdBy,
        priority: response.priority || 4,
      };
    } catch (error) {
      console.error("Error toggling role status:", error);
      throw new Error("Không thể thay đổi trạng thái vai trò");
    }
  },

  // Get users by role
  getUsersByRole: async (roleId) => {
    try {
      const response = await apiRequest(`/roles/${roleId}/users`, {
        method: "GET",
      });

      return response.map((user) => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        employeeCode: user.employeeCode,
        department: user.department,
        position: user.position,
        status: user.isActive ? "active" : "inactive",
      }));
    } catch (error) {
      console.error("Error fetching users by role:", error);
      throw new Error("Không thể tải danh sách người dùng theo vai trò");
    }
  },

  // Assign role to users
  assignRoleToUsers: async (roleId, userIds) => {
    try {
      const response = await apiRequest(`/roles/${roleId}/assign`, {
        method: "POST",
        body: JSON.stringify({ userIds }),
      });

      return response;
    } catch (error) {
      console.error("Error assigning role to users:", error);
      throw new Error("Không thể gán vai trò cho người dùng");
    }
  },

  // Remove role from users
  removeRoleFromUsers: async (roleId, userIds) => {
    try {
      const response = await apiRequest(`/roles/${roleId}/remove`, {
        method: "POST",
        body: JSON.stringify({ userIds }),
      });

      return response;
    } catch (error) {
      console.error("Error removing role from users:", error);
      throw new Error("Không thể gỡ vai trò khỏi người dùng");
    }
  },

  // Get available permissions
  getAvailablePermissions: async () => {
    try {
      const response = await apiRequest("/permissions", {
        method: "GET",
      });

      return response;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      throw new Error("Không thể tải danh sách quyền");
    }
  },
};
