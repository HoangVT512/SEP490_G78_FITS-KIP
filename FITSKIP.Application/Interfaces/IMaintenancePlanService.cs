using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces
{
    public interface IMaintenancePlanService
    {
        // Plan Management
        Task<IEnumerable<MaintenancePlanDTO>> GetAllPlansAsync();
        Task<MaintenancePlanDTO?> GetPlanByIdAsync(int planId);
        Task<IEnumerable<MaintenancePlanDTO>> GetPlansByEquipmentIdAsync(int equipmentId);
        Task<IEnumerable<MaintenancePlanDTO>> GetActivePlansAsync();
        Task<IEnumerable<MaintenancePlanDTO>> GetOverduePlansAsync();
        Task<IEnumerable<MaintenancePlanDTO>> GetPlansDueWithinDaysAsync(int days);
        Task<MaintenancePlanDTO> CreatePlanAsync(CreateMaintenancePlanRequest request, string userId);
        Task<MaintenancePlanDTO> UpdatePlanAsync(int planId, UpdateMaintenancePlanRequest request);
        Task DeletePlanAsync(int planId);

        // Statistics
        Task<IEnumerable<MaintenancePlanDTO>> GetUpcomingMaintenanceAsync(int days = 7);
    }
}
