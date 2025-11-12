using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces
{
    public interface IMaintenanceTemplateService
    {
        // Template Management
        Task<IEnumerable<MaintenanceTemplateDTO>> GetAllTemplatesAsync();
        Task<MaintenanceTemplateDTO?> GetTemplateByIdAsync(int templateId);
        Task<IEnumerable<MaintenanceTemplateDTO>> GetTemplatesByStageIdAsync(int stageId);
        Task<MaintenanceTemplateDTO> CreateTemplateAsync(CreateMaintenanceTemplateRequest request, string userId);
        Task<MaintenanceTemplateDTO> UpdateTemplateAsync(int templateId, UpdateMaintenanceTemplateRequest request, string userId);
        Task DeleteTemplateAsync(int templateId);

        // Template Items Management
        Task<MaintenanceTemplateItemDTO> AddChecklistItemToTemplateAsync(int templateId, CreateTemplateItemRequest request);
    }
}
