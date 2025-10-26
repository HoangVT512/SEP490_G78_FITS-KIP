using FITSKIP.Domain.Entities;

namespace FITSKIP.Domain.Interfaces
{
    public interface IMaintenancePlanRepository
    {
        Task<IEnumerable<MaintenancePlan>> GetAllAsync();
        Task<MaintenancePlan?> GetByIdAsync(int planId);
        Task<IEnumerable<MaintenancePlan>> GetByEquipmentIdAsync(int equipmentId);
        Task<IEnumerable<MaintenancePlan>> GetByAssignedUserAsync(string userId);
        Task<IEnumerable<MaintenancePlan>> GetActiveAsync();
        Task<IEnumerable<MaintenancePlan>> GetOverdueAsync();
        Task<IEnumerable<MaintenancePlan>> GetDueWithinDaysAsync(int days);
        Task<IEnumerable<MaintenancePlan>> GetByStatusAsync(string status);
        Task<MaintenancePlan> CreateAsync(MaintenancePlan plan);
        Task UpdateAsync(MaintenancePlan plan);
        Task DeleteAsync(int planId);
        Task<bool> ExistsAsync(int planId);
    }

    public interface IMaintenanceChecklistItemRepository
    {
        Task<IEnumerable<MaintenanceChecklistItem>> GetAllAsync();
        Task<MaintenanceChecklistItem?> GetByIdAsync(int checklistId);
        Task<IEnumerable<MaintenanceChecklistItem>> GetByPlanIdAsync(int planId);
        Task<MaintenanceChecklistItem> CreateAsync(MaintenanceChecklistItem item);
        Task UpdateAsync(MaintenanceChecklistItem item);
        Task DeleteAsync(int checklistId);
        Task DeleteByPlanIdAsync(int planId);
        Task<bool> ExistsAsync(int checklistId);
        Task<int> GetCompletedCountByPlanIdAsync(int planId);
        Task<int> GetTotalCountByPlanIdAsync(int planId);
    }
}
