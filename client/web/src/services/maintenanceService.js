import apiRequest from "./api";

// ===== MAINTENANCE TEMPLATE MANAGEMENT =====

// Get all templates
export const getAllTemplates = async () => {
  return apiRequest("/maintenance/templates", { method: "GET" });
};

// Get template by ID
export const getTemplateById = async (templateId) => {
  return apiRequest(`/maintenance/templates/${templateId}`, { method: "GET" });
};

// Get templates by stage
export const getTemplatesByStage = async (stageId) => {
  return apiRequest(`/maintenance/templates/stage/${stageId}`, { method: "GET" });
};

// Create template
export const createTemplate = async (templateData) => {
  return apiRequest("/maintenance/templates", {
    method: "POST",
    body: JSON.stringify(templateData),
  });
};

// Update template
export const updateTemplate = async (templateId, templateData) => {
  return apiRequest(`/maintenance/templates/${templateId}`, {
    method: "PUT",
    body: JSON.stringify(templateData),
  });
};

// Delete template
export const deleteTemplate = async (templateId) => {
  return apiRequest(`/maintenance/templates/${templateId}`, {
    method: "DELETE",
  });
};

// ===== MAINTENANCE PLAN MANAGEMENT =====

// Get all maintenance plans
export const getAllMaintenancePlans = async () => {
  return apiRequest("/maintenance/plans", { method: "GET" });
};

// Get maintenance plan by ID
export const getMaintenancePlanById = async (planId) => {
  return apiRequest(`/maintenance/plans/${planId}`, { method: "GET" });
};

// Get maintenance plans by equipment ID
export const getMaintenancePlansByEquipment = async (equipmentId) => {
  return apiRequest(`/maintenance/plans/equipment/${equipmentId}`, {
    method: "GET",
  });
};

// Get active maintenance plans
export const getActivePlans = async () => {
  return apiRequest("/maintenance/plans/active", { method: "GET" });
};

// Get overdue maintenance plans
export const getOverduePlans = async () => {
  return apiRequest("/maintenance/plans/overdue", { method: "GET" });
};

// Get maintenance plans due within specified days
export const getPlansDueWithinDays = async (days) => {
  return apiRequest(`/maintenance/plans/due-within/${days}`, {
    method: "GET",
  });
};

// Create new maintenance plan
export const createMaintenancePlan = async (planData) => {
  return apiRequest("/maintenance/plans", {
    method: "POST",
    body: JSON.stringify(planData),
  });
};

// Update maintenance plan
export const updateMaintenancePlan = async (planId, planData) => {
  return apiRequest(`/maintenance/plans/${planId}`, {
    method: "PUT",
    body: JSON.stringify(planData),
  });
};

// Delete maintenance plan
export const deleteMaintenancePlan = async (planId) => {
  return apiRequest(`/maintenance/plans/${planId}`, {
    method: "DELETE",
  });
};

// Postpone maintenance plan (Hoãn bảo trì)
export const postponeMaintenancePlan = async (planId, postponeData) => {
  return apiRequest(`/maintenance/plans/${planId}/postpone`, {
    method: "POST",
    body: JSON.stringify(postponeData),
  });
};

// Assign multiple technicians to a maintenance plan
export const assignMultipleTechnicians = async (planId, techniciansData) => {
  return apiRequest(`/maintenance/plans/${planId}/assign-multiple`, {
    method: "POST",
    body: JSON.stringify(techniciansData),
  });
};

// Remove technician assignment from plan
export const removeTechnicianAssignment = async (assignmentId) => {
  return apiRequest(`/maintenance/plans/assignments/${assignmentId}`, {
    method: "DELETE",
  });
};

// Get unassigned plans needing attention
export const getUnassignedPlans = async (daysBeforeDue = 3) => {
  return apiRequest(`/maintenance/plans/unassigned?daysBeforeDue=${daysBeforeDue}`, {
    method: "GET",
  });
};

// ===== WORK ORDER MANAGEMENT =====

// Get all work orders
export const getAllWorkOrders = async () => {
  return apiRequest("/maintenance/work-orders", { method: "GET" });
};

// Get work order by ID
export const getWorkOrderById = async (workOrderId) => {
  return apiRequest(`/maintenance/work-orders/${workOrderId}`, { method: "GET" });
};

// Get work orders by plan ID
export const getWorkOrdersByPlan = async (planId) => {
  return apiRequest(`/maintenance/work-orders/plan/${planId}`, { method: "GET" });
};

// Get my work orders (for Technician)
export const getMyWorkOrders = async () => {
  return apiRequest("/maintenance/work-orders/my", { method: "GET" });
};

// Get work orders by technician ID (for managers)
export const getWorkOrdersByTechnician = async (technicianId) => {
  return apiRequest(`/maintenance/work-orders/technician/${technicianId}`, {
    method: "GET",
  });
};

// Get pending work orders
export const getPendingWorkOrders = async () => {
  return apiRequest("/maintenance/work-orders/pending", { method: "GET" });
};

// Create work order
export const createWorkOrder = async (workOrderData) => {
  return apiRequest("/maintenance/work-orders", {
    method: "POST",
    body: JSON.stringify(workOrderData),
  });
};

// Update work order
export const updateWorkOrder = async (workOrderId, workOrderData) => {
  return apiRequest(`/maintenance/work-orders/${workOrderId}`, {
    method: "PUT",
    body: JSON.stringify(workOrderData),
  });
};

// Assign technicians to work order
export const assignTechnicians = async (workOrderId, technicianData) => {
  return apiRequest(`/maintenance/work-orders/${workOrderId}/assign`, {
    method: "POST",
    body: JSON.stringify(technicianData),
  });
};

// Start work order (Technician)
export const startWorkOrder = async (workOrderId) => {
  return apiRequest(`/maintenance/work-orders/${workOrderId}/start`, {
    method: "POST",
  });
};

// Complete work order (Technician)
export const completeWorkOrder = async (workOrderId, completionData) => {
  return apiRequest(`/maintenance/work-orders/${workOrderId}/complete`, {
    method: "POST",
    body: JSON.stringify(completionData),
  });
};

// Cancel work order
export const cancelWorkOrder = async (workOrderId, reason) => {
  return apiRequest(`/maintenance/work-orders/${workOrderId}/cancel`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
};

// Delete work order
export const deleteWorkOrder = async (workOrderId) => {
  return apiRequest(`/maintenance/work-orders/${workOrderId}`, {
    method: "DELETE",
  });
};

// ===== CHECKLIST MANAGEMENT =====

// Update checklist item
export const updateChecklistItem = async (checklistId, itemData) => {
  return apiRequest(`/maintenance/checklist/${checklistId}`, {
    method: "PUT",
    body: JSON.stringify(itemData),
  });
};

// Add checklist item to work order
export const addChecklistItem = async (workOrderId, itemData) => {
  return apiRequest(`/maintenance/work-orders/${workOrderId}/checklist`, {
    method: "POST",
    body: JSON.stringify(itemData),
  });
};

// Delete checklist item
export const deleteChecklistItem = async (checklistId) => {
  return apiRequest(`/maintenance/checklist/${checklistId}`, {
    method: "DELETE",
  });
};

// ===== TECHNICIAN MANAGEMENT =====

// Get ALL technicians (không phân biệt cơ khí hay điện)
export const getAllTechnicians = async () => {
  return apiRequest("/maintenance/technicians", { method: "GET" });
};

// Get mechanical technicians
export const getMechanicalTechnicians = async () => {
  return apiRequest("/maintenance/technicians/mechanical", { method: "GET" });
};

// Get electrical technicians
export const getElectricalTechnicians = async () => {
  return apiRequest("/maintenance/technicians/electrical", { method: "GET" });
};

// Get technicians workload by date
export const getTechniciansWorkloadByDate = async (date) => {
  // Format date to YYYY-MM-DD
  const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
  return apiRequest(`/maintenance/technicians/workload?date=${dateStr}`, { method: "GET" });
};

// ===== STATISTICS & REPORTS =====

// Get maintenance statistics
export const getMaintenanceStats = async () => {
  return apiRequest("/maintenance/statistics", { method: "GET" });
};

// Get upcoming maintenance
export const getUpcomingMaintenance = async (days = 7) => {
  return apiRequest(`/maintenance/upcoming?days=${days}`, { method: "GET" });
};

// ===== LEGACY SUPPORT (for backward compatibility) =====

// Get pending requests (deprecated - use getPendingWorkOrders)
export const getPendingRequests = async () => {
  return getPendingWorkOrders();
};

// Approve maintenance request (deprecated)
export const approveMaintenanceRequest = async (planId, approvalData) => {
  // Convert to assign technicians
  return assignTechnicians(planId, approvalData);
};

// Reject maintenance request (deprecated)
export const rejectMaintenanceRequest = async (planId, rejectionData) => {
  // Convert to cancel work order
  return cancelWorkOrder(planId, rejectionData.rejectionReason);
};

// Assign technician (deprecated - use assignTechnicians)
export const assignTechnician = async (planId, technicianData) => {
  return assignTechnicians(planId, technicianData);
};

// Complete maintenance (deprecated - use completeWorkOrder)
export const completeMaintenance = async (planId, completionData) => {
  return completeWorkOrder(planId, completionData);
};

// Get checklist items (deprecated)
export const getChecklistItems = async (planId) => {
  const workOrder = await getWorkOrderById(planId);
  return { data: workOrder?.data?.checklistItems || [] };
};

// Get maintenance history (deprecated - use getAllWorkOrders with filter)
export const getMaintenanceHistory = async (equipmentId = null) => {
  const response = await getAllWorkOrders();
  if (equipmentId) {
    const filtered = response.data?.filter(wo => wo.equipmentId === equipmentId && wo.status === 'Completed');
    return { data: filtered };
  }
  const completed = response.data?.filter(wo => wo.status === 'Completed');
  return { data: completed };
};
