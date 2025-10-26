using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces
{
    public interface IMaintenanceService
    {
        // Maintenance Plan Management
        Task<IEnumerable<MaintenancePlanDTO>> GetAllPlansAsync();
        Task<MaintenancePlanDTO?> GetPlanByIdAsync(int planId);
        Task<IEnumerable<MaintenancePlanDTO>> GetPlansByEquipmentIdAsync(int equipmentId);
        Task<IEnumerable<MaintenancePlanDTO>> GetActivePlansAsync();
        Task<IEnumerable<MaintenancePlanDTO>> GetOverduePlansAsync();
        Task<IEnumerable<MaintenancePlanDTO>> GetPlansDueWithinDaysAsync(int days);
        Task<MaintenancePlanDTO> CreatePlanAsync(CreateMaintenancePlanRequest request);
        Task<MaintenancePlanDTO> UpdatePlanAsync(int planId, UpdateMaintenancePlanRequest request);
        Task DeletePlanAsync(int planId);
        
        // Work Order Management (for Technical Manager)
        Task<IEnumerable<MaintenanceRequestDTO>> GetPendingRequestsAsync();
        Task<MaintenancePlanDTO> ApproveRequestAsync(int planId, ApproveMaintenanceRequest request);
        Task RejectRequestAsync(int planId, RejectMaintenanceRequest request);
        Task<MaintenancePlanDTO> AssignTechnicianAsync(int planId, AssignMaintenanceTechnicianRequest request);
        
        // Work Order for Technician
        Task<IEnumerable<WorkOrderDTO>> GetWorkOrdersByTechnicianAsync(string technicianId);
        Task<WorkOrderDTO?> GetWorkOrderByIdAsync(int planId);
        Task<MaintenancePlanDTO> CompleteMaintenanceAsync(int planId, CompleteMaintenanceRequest request, string userId);
        
        // Checklist Management
        Task<IEnumerable<MaintenanceChecklistItemDTO>> GetChecklistItemsByPlanIdAsync(int planId);
        Task<MaintenanceChecklistItemDTO> UpdateChecklistItemAsync(int checklistId, UpdateChecklistItemRequest request);
        
        // Statistics & Reports
        Task<MaintenanceStatsDTO> GetMaintenanceStatsAsync();
        Task<IEnumerable<MaintenanceHistoryDTO>> GetMaintenanceHistoryAsync(int? equipmentId = null);
        
        // Auto-generation (System)
        Task GenerateMaintenancePlansAsync();
        Task UpdateOverduePlansAsync();
    }
}
