using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces
{
    public interface IExcelImportService
    {
        Task<List<CreateUserRequest>> ImportUsersFromExcelAsync(Stream fileStream);
        
        /// <summary>
        /// Import Maintenance Templates từ Excel
        /// </summary>
        Task<List<CreateMaintenanceTemplateRequest>> ImportTemplatesFromExcelAsync(Stream fileStream);
        
        /// <summary>
        /// Tạo file Excel mẫu cho Maintenance Template
        /// </summary>
        byte[] GenerateTemplateExcelTemplate();
        
        /// <summary>
        /// Import Maintenance Plans (Chu kỳ bảo trì) từ Excel
        /// </summary>
        Task<List<CreateMaintenancePlanRequest>> ImportMaintenancePlansFromExcelAsync(Stream fileStream);
        
        /// <summary>
        /// Tạo file Excel mẫu cho Maintenance Plan (Chu kỳ bảo trì)
        /// </summary>
        byte[] GenerateMaintenancePlanExcelTemplate();
    }
}