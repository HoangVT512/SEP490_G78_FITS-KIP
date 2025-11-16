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
        /// Import Template Items (Các bước kiểm tra) từ Excel vào template có sẵn
        /// </summary>
        Task<List<CreateTemplateItemRequest>> ImportTemplateItemsFromExcelAsync(Stream fileStream);
        
        /// <summary>
        /// Tạo file Excel mẫu cho Template Items (Các bước kiểm tra)
        /// </summary>
        byte[] GenerateTemplateItemsExcelTemplate();
    }
}