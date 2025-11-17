using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces
{
    public interface IMaintenanceWorkOrderService
    {
        // Work Order Management
        Task<IEnumerable<MaintenanceWorkOrderDTO>> GetAllWorkOrdersAsync();
        Task<MaintenanceWorkOrderDTO?> GetWorkOrderByIdAsync(int workOrderId);
        Task<IEnumerable<MaintenanceWorkOrderDTO>> GetWorkOrdersByPlanIdAsync(int planId);
        Task<IEnumerable<MaintenanceWorkOrderDTO>> GetWorkOrdersByTechnicianAsync(string technicianId);
        Task<IEnumerable<MaintenanceWorkOrderDTO>> GetPendingWorkOrdersAsync();
        Task<MaintenanceWorkOrderDTO> CreateWorkOrderAsync(CreateMaintenanceWorkOrderRequest request, string userId);
        Task<MaintenanceWorkOrderDTO> UpdateWorkOrderAsync(int workOrderId, UpdateMaintenanceWorkOrderRequest request, string userId);
        Task DeleteWorkOrderAsync(int workOrderId);

        // Work Order Operations
        Task<MaintenanceWorkOrderDTO> AssignTechniciansAsync(int workOrderId, string? electricalTechId, string? mechanicalTechId);
        Task<MaintenanceWorkOrderDTO> StartWorkOrderAsync(int workOrderId, string technicianId);
        Task<MaintenanceWorkOrderDTO> CompleteWorkOrderAsync(int workOrderId, CompleteWorkOrderRequest request, string technicianId);
        Task<MaintenanceWorkOrderDTO> CloseWorkOrderAsync(int workOrderId, string closedBy, string? notes = null);
        Task<MaintenanceWorkOrderDTO> CancelWorkOrderAsync(int workOrderId, string reason);
        Task<MaintenanceWorkOrderDTO> PostponeWorkOrderAsync(int workOrderId, PostponeWorkOrderRequest request, string userId);

        // Checklist Management
        Task<MaintenanceChecklistItemDTO> UpdateChecklistItemAsync(int checklistId, UpdateChecklistItemRequest request, string technicianId);
        Task<MaintenanceChecklistItemDTO> AddChecklistItemAsync(int workOrderId, CreateChecklistItemRequest request);
        Task DeleteChecklistItemAsync(int checklistId);

        // Statistics
        Task<MaintenanceStatisticsDTO> GetStatisticsAsync();

        // Technician Management
        Task<IEnumerable<TechnicianDTO>> GetAllTechniciansAsync();
        Task<IEnumerable<TechnicianDTO>> GetMechanicalTechniciansAsync();
        Task<IEnumerable<TechnicianDTO>> GetElectricalTechniciansAsync();
        Task<IEnumerable<TechnicianWorkloadDTO>> GetTechniciansWorkloadByDateAsync(DateTime date);

        // Background Tasks
        Task GenerateWorkOrdersForDuePlansAsync();
        Task UpdateOverdueStatusAsync();
        Task SendMaintenanceRemindersAsync();
    }
}
