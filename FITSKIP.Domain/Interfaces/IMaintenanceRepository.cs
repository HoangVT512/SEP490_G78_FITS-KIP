using FITSKIP.Domain.Entities;

namespace FITSKIP.Domain.Interfaces
{
    // ===== MAINTENANCE TEMPLATE REPOSITORY =====
    
    public interface IMaintenanceTemplateRepository
    {
        Task<IEnumerable<MaintenanceTemplate>> GetAllAsync();
        Task<MaintenanceTemplate?> GetByIdAsync(int templateId);
        Task<IEnumerable<MaintenanceTemplate>> GetByStageIdAsync(int stageId);
        Task<MaintenanceTemplate> CreateAsync(MaintenanceTemplate template);
        Task UpdateAsync(MaintenanceTemplate template);
        Task DeleteAsync(int templateId);
        Task<bool> ExistsAsync(int templateId);
    }

    public interface IMaintenanceTemplateItemRepository
    {
        Task<IEnumerable<MaintenanceTemplateItem>> GetByTemplateIdAsync(int templateId);
        Task<MaintenanceTemplateItem> CreateAsync(MaintenanceTemplateItem item);
        Task UpdateAsync(MaintenanceTemplateItem item);
        Task DeleteAsync(int itemId);
        Task DeleteByTemplateIdAsync(int templateId);
    }

    // ===== MAINTENANCE PLAN REPOSITORY =====
    
    public interface IMaintenancePlanRepository
    {
        Task<IEnumerable<MaintenancePlan>> GetAllAsync();
        Task<MaintenancePlan?> GetByIdAsync(int planId);
        Task<IEnumerable<MaintenancePlan>> GetByEquipmentIdAsync(int equipmentId);
        Task<IEnumerable<MaintenancePlan>> GetActiveAsync();
        Task<IEnumerable<MaintenancePlan>> GetDueWithinDaysAsync(int days);
        Task<IEnumerable<MaintenancePlan>> GetByStatusAsync(string status);
        Task<MaintenancePlan> CreateAsync(MaintenancePlan plan);
        Task UpdateAsync(MaintenancePlan plan);
        Task DeleteAsync(int planId);
        Task<bool> ExistsAsync(int planId);
    }

    // ===== MAINTENANCE WORK ORDER REPOSITORY =====
    
    public interface IMaintenanceWorkOrderRepository
    {
        Task<IEnumerable<MaintenanceWorkOrder>> GetAllAsync();
        Task<MaintenanceWorkOrder?> GetByIdAsync(int workOrderId);
        Task<IEnumerable<MaintenanceWorkOrder>> GetByPlanIdAsync(int planId);
        Task<IEnumerable<MaintenanceWorkOrder>> GetByTechnicianAsync(string technicianId);
        Task<IEnumerable<MaintenanceWorkOrder>> GetByStatusAsync(string status);
        Task<IEnumerable<MaintenanceWorkOrder>> GetPendingAsync();
        Task<IEnumerable<MaintenanceWorkOrder>> GetOverdueAsync();
        Task<MaintenanceWorkOrder> CreateAsync(MaintenanceWorkOrder workOrder);
        Task UpdateAsync(MaintenanceWorkOrder workOrder);
        Task DeleteAsync(int workOrderId);
        Task<bool> ExistsAsync(int workOrderId);
        Task<string> GenerateWorkOrderCodeAsync();
    }

    // ===== MAINTENANCE CHECKLIST ITEM REPOSITORY =====
    
    public interface IMaintenanceChecklistItemRepository
    {
        Task<IEnumerable<MaintenanceChecklistItem>> GetAllAsync();
        Task<MaintenanceChecklistItem?> GetByIdAsync(int checklistId);
        Task<IEnumerable<MaintenanceChecklistItem>> GetByWorkOrderIdAsync(int workOrderId);
        Task<MaintenanceChecklistItem> CreateAsync(MaintenanceChecklistItem item);
        Task UpdateAsync(MaintenanceChecklistItem item);
        Task DeleteAsync(int checklistId);
        Task DeleteByWorkOrderIdAsync(int workOrderId);
        Task<bool> ExistsAsync(int checklistId);
        Task<int> GetCompletedCountByWorkOrderIdAsync(int workOrderId);
        Task<int> GetTotalCountByWorkOrderIdAsync(int workOrderId);
    }
}
