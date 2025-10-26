import apiRequest from "./api";

// ===== Maintenance Plan Management =====

// Get all maintenance plans
export const getAllMaintenancePlans = async () => {
  return apiRequest("/Maintenance/plans", { method: "GET" });
};

// Get maintenance plan by ID
export const getMaintenancePlanById = async (planId) => {
  return apiRequest(`/Maintenance/plans/${planId}`, { method: "GET" });
};

// Get maintenance plans by equipment ID
export const getMaintenancePlansByEquipment = async (equipmentId) => {
  return apiRequest(`/Maintenance/plans/equipment/${equipmentId}`, {
    method: "GET",
  });
};

// Get active maintenance plans
export const getActivePlans = async () => {
  return apiRequest("/Maintenance/plans/active", { method: "GET" });
};

// Get overdue maintenance plans
export const getOverduePlans = async () => {
  return apiRequest("/Maintenance/plans/overdue", { method: "GET" });
};

// Get maintenance plans due within specified days
export const getPlansDueWithinDays = async (days) => {
  return apiRequest(`/Maintenance/plans/due-within/${days}`, {
    method: "GET",
  });
};

// Create new maintenance plan
export const createMaintenancePlan = async (planData) => {
  return apiRequest("/Maintenance/plans", {
    method: "POST",
    body: JSON.stringify(planData),
  });
};

// Update maintenance plan
export const updateMaintenancePlan = async (planId, planData) => {
  return apiRequest(`/Maintenance/plans/${planId}`, {
    method: "PUT",
    body: JSON.stringify(planData),
  });
};

// Delete maintenance plan
export const deleteMaintenancePlan = async (planId) => {
  return apiRequest(`/Maintenance/plans/${planId}`, {
    method: "DELETE",
  });
};

// ===== Work Order Management (Technical Manager) =====

// Get pending maintenance requests
export const getPendingRequests = async () => {
  return apiRequest("/Maintenance/requests/pending", { method: "GET" });
};

// Approve maintenance request
export const approveMaintenanceRequest = async (planId, approvalData) => {
  return apiRequest(`/Maintenance/requests/${planId}/approve`, {
    method: "POST",
    body: JSON.stringify(approvalData),
  });
};

// Reject maintenance request
export const rejectMaintenanceRequest = async (planId, rejectionData) => {
  return apiRequest(`/Maintenance/requests/${planId}/reject`, {
    method: "POST",
    body: JSON.stringify(rejectionData),
  });
};

// Assign technician to maintenance plan
export const assignTechnician = async (planId, technicianData) => {
  return apiRequest(`/Maintenance/plans/${planId}/assign`, {
    method: "POST",
    body: JSON.stringify(technicianData),
  });
};

// ===== Work Orders (for Technician) =====

// Get work orders for current technician
export const getMyWorkOrders = async () => {
  return apiRequest("/Maintenance/work-orders/my", { method: "GET" });
};

// Get work orders by technician ID (for managers)
export const getWorkOrdersByTechnician = async (technicianId) => {
  return apiRequest(`/Maintenance/work-orders/technician/${technicianId}`, {
    method: "GET",
  });
};

// Get work order by ID
export const getWorkOrderById = async (planId) => {
  return apiRequest(`/Maintenance/work-orders/${planId}`, { method: "GET" });
};

// Complete maintenance work order
export const completeMaintenance = async (planId, completionData) => {
  return apiRequest(`/Maintenance/work-orders/${planId}/complete`, {
    method: "POST",
    body: JSON.stringify(completionData),
  });
};

// ===== Checklist Management =====

// Get checklist items for a maintenance plan
export const getChecklistItems = async (planId) => {
  return apiRequest(`/Maintenance/plans/${planId}/checklist`, {
    method: "GET",
  });
};

// Update checklist item
export const updateChecklistItem = async (checklistId, itemData) => {
  return apiRequest(`/Maintenance/checklist/${checklistId}`, {
    method: "PUT",
    body: JSON.stringify(itemData),
  });
};

// ===== Statistics & Reports =====

// Get maintenance statistics
export const getMaintenanceStats = async () => {
  return apiRequest("/Maintenance/statistics", { method: "GET" });
};

// Get maintenance history
export const getMaintenanceHistory = async (equipmentId = null) => {
  const params = equipmentId ? `?equipmentId=${equipmentId}` : "";
  return apiRequest(`/Maintenance/history${params}`, { method: "GET" });
};
