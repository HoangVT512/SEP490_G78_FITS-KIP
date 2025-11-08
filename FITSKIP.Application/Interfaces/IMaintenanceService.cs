using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces
{
    public interface IMaintenanceService
    {
        // ===== MAINTENANCE TEMPLATE MANAGEMENT =====
        
        /// <summary>
        /// Lấy tất cả templates
        /// </summary>
        Task<IEnumerable<MaintenanceTemplateDTO>> GetAllTemplatesAsync();
        
        /// <summary>
        /// Lấy template theo ID
        /// </summary>
        Task<MaintenanceTemplateDTO?> GetTemplateByIdAsync(int templateId);
        
        /// <summary>
        /// Lấy templates theo Stage (công đoạn)
        /// </summary>
        Task<IEnumerable<MaintenanceTemplateDTO>> GetTemplatesByStageIdAsync(int stageId);
        
        /// <summary>
        /// Tạo template mới (TechManager)
        /// </summary>
        Task<MaintenanceTemplateDTO> CreateTemplateAsync(CreateMaintenanceTemplateRequest request, string userId);
        
        /// <summary>
        /// Cập nhật template (TechManager)
        /// </summary>
        Task<MaintenanceTemplateDTO> UpdateTemplateAsync(int templateId, UpdateMaintenanceTemplateRequest request, string userId);
        
        /// <summary>
        /// Xóa template (TechManager)
        /// </summary>
        Task DeleteTemplateAsync(int templateId);

        // ===== MAINTENANCE PLAN MANAGEMENT =====
        
        /// <summary>
        /// Lấy tất cả plans
        /// </summary>
        Task<IEnumerable<MaintenancePlanDTO>> GetAllPlansAsync();
        
        /// <summary>
        /// Lấy plan theo ID
        /// </summary>
        Task<MaintenancePlanDTO?> GetPlanByIdAsync(int planId);
        
        /// <summary>
        /// Lấy plans theo Equipment
        /// </summary>
        Task<IEnumerable<MaintenancePlanDTO>> GetPlansByEquipmentIdAsync(int equipmentId);
        
        /// <summary>
        /// Lấy plans đang active
        /// </summary>
        Task<IEnumerable<MaintenancePlanDTO>> GetActivePlansAsync();
        
        /// <summary>
        /// Lấy plans quá hạn
        /// </summary>
        Task<IEnumerable<MaintenancePlanDTO>> GetOverduePlansAsync();
        
        /// <summary>
        /// Lấy plans sắp đến hạn (trong X ngày)
        /// </summary>
        Task<IEnumerable<MaintenancePlanDTO>> GetPlansDueWithinDaysAsync(int days);
        
        /// <summary>
        /// Tạo plan mới (TechManager)
        /// </summary>
        Task<MaintenancePlanDTO> CreatePlanAsync(CreateMaintenancePlanRequest request, string userId);
        
        /// <summary>
        /// Cập nhật plan (TechManager)
        /// </summary>
        Task<MaintenancePlanDTO> UpdatePlanAsync(int planId, UpdateMaintenancePlanRequest request);
        
        /// <summary>
        /// Xóa plan
        /// </summary>
        Task DeletePlanAsync(int planId);

        /// <summary>
        /// Hoãn bảo trì - cập nhật NextDueDate (TechManager)
        /// </summary>
        Task<MaintenancePlanDTO> PostponeMaintenancePlanAsync(int planId, PostponeMaintenancePlanRequest request, string userId);

        /// <summary>
        /// Assign nhiều technicians vào maintenance plan (TechManager)
        /// </summary>
        Task<MaintenancePlanDTO> AssignMultipleTechniciansAsync(int planId, AssignMultipleTechniciansRequest request, string userId);
        
        /// <summary>
        /// Xóa một technician assignment khỏi plan (TechManager)
        /// </summary>
        Task RemoveTechnicianAssignmentAsync(int assignmentId);
        
        /// <summary>
        /// Lấy danh sách plans sắp đến hạn chưa assign technician (cần thông báo TechManager)
        /// </summary>
        Task<IEnumerable<MaintenancePlanDTO>> GetUnassignedPlansNeedingAttentionAsync(int daysBeforeDue = 3);

        // ===== WORK ORDER MANAGEMENT =====
        
        /// <summary>
        /// Lấy tất cả work orders
        /// </summary>
        Task<IEnumerable<MaintenanceWorkOrderDTO>> GetAllWorkOrdersAsync();
        
        /// <summary>
        /// Lấy work order theo ID
        /// </summary>
        Task<MaintenanceWorkOrderDTO?> GetWorkOrderByIdAsync(int workOrderId);
        
        /// <summary>
        /// Lấy work orders theo Plan
        /// </summary>
        Task<IEnumerable<MaintenanceWorkOrderDTO>> GetWorkOrdersByPlanIdAsync(int planId);
        
        /// <summary>
        /// Lấy work orders của technician (Cơ hoặc Điện)
        /// </summary>
        Task<IEnumerable<MaintenanceWorkOrderDTO>> GetWorkOrdersByTechnicianAsync(string technicianId);
        
        /// <summary>
        /// Lấy work orders pending (chờ TechManager assign)
        /// </summary>
        Task<IEnumerable<MaintenanceWorkOrderDTO>> GetPendingWorkOrdersAsync();
        
        /// <summary>
        /// Tạo work order từ plan (TechManager hoặc tự động khi đến hạn)
        /// </summary>
        Task<MaintenanceWorkOrderDTO> CreateWorkOrderAsync(CreateMaintenanceWorkOrderRequest request, string userId);
        
        /// <summary>
        /// Cập nhật work order - TechManager có thể sửa checklist
        /// </summary>
        Task<MaintenanceWorkOrderDTO> UpdateWorkOrderAsync(int workOrderId, UpdateMaintenanceWorkOrderRequest request, string userId);
        
        /// <summary>
        /// Assign technicians (TechManager)
        /// </summary>
        Task<MaintenanceWorkOrderDTO> AssignTechniciansAsync(int workOrderId, string? electricalTechId, string? mechanicalTechId);
        
        /// <summary>
        /// Bắt đầu work order (Technician)
        /// </summary>
        Task<MaintenanceWorkOrderDTO> StartWorkOrderAsync(int workOrderId, string technicianId);
        
        /// <summary>
        /// Hoàn thành work order (Technician)
        /// </summary>
        Task<MaintenanceWorkOrderDTO> CompleteWorkOrderAsync(int workOrderId, CompleteWorkOrderRequest request, string technicianId);
        
        /// <summary>
        /// Hủy work order (TechManager)
        /// </summary>
        Task<MaintenanceWorkOrderDTO> CancelWorkOrderAsync(int workOrderId, string reason);
        
        /// <summary>
        /// Xóa work order
        /// </summary>
        Task DeleteWorkOrderAsync(int workOrderId);

        // ===== CHECKLIST ITEM MANAGEMENT =====
        
        /// <summary>
        /// Cập nhật checklist item (Technician check/uncheck)
        /// </summary>
        Task<MaintenanceChecklistItemDTO> UpdateChecklistItemAsync(int checklistId, UpdateChecklistItemRequest request, string technicianId);
        
        /// <summary>
        /// Thêm checklist item vào work order (TechManager)
        /// </summary>
        Task<MaintenanceChecklistItemDTO> AddChecklistItemAsync(int workOrderId, CreateChecklistItemRequest request);
        
        /// <summary>
        /// Xóa checklist item (TechManager)
        /// </summary>
        Task DeleteChecklistItemAsync(int checklistId);

        // ===== STATISTICS & REPORTS =====
        
        /// <summary>
        /// Lấy thống kê tổng quan
        /// </summary>
        Task<MaintenanceStatisticsDTO> GetStatisticsAsync();
        
        /// <summary>
        /// Lấy danh sách bảo trì sắp đến hạn
        /// </summary>
        Task<IEnumerable<MaintenancePlanDTO>> GetUpcomingMaintenanceAsync(int days = 7);

        // ===== TECHNICIAN MANAGEMENT =====
        
        /// <summary>
        /// Lấy danh sách TẤT CẢ kỹ thuật viên
        /// </summary>
        Task<IEnumerable<TechnicianDTO>> GetAllTechniciansAsync();
        
        /// <summary>
        /// Lấy danh sách kỹ thuật viên cơ
        /// </summary>
        Task<IEnumerable<TechnicianDTO>> GetMechanicalTechniciansAsync();
        
        /// <summary>
        /// Lấy danh sách kỹ thuật viên điện
        /// </summary>
        Task<IEnumerable<TechnicianDTO>> GetElectricalTechniciansAsync();
        
        /// <summary>
        /// Đếm số công việc đã giao cho các KTV trong một ngày cụ thể
        /// </summary>
        Task<IEnumerable<TechnicianWorkloadDTO>> GetTechniciansWorkloadByDateAsync(DateTime date);

        // ===== BACKGROUND TASKS =====
        
        /// <summary>
        /// Tạo work orders tự động cho plans đến hạn
        /// </summary>
        Task GenerateWorkOrdersForDuePlansAsync();
        
        /// <summary>
        /// Cập nhật trạng thái overdue cho plans và work orders
        /// </summary>
        Task UpdateOverdueStatusAsync();
        
        /// <summary>
        /// Gửi thông báo nhắc nhở cho TechManager về plans sắp đến hạn
        /// </summary>
        Task SendMaintenanceRemindersAsync();
        
        // ===== EXCEL IMPORT/EXPORT =====
        
        /// <summary>
        /// Import maintenance templates từ Excel file
        /// </summary>
        Task<List<CreateMaintenanceTemplateRequest>> ImportTemplatesFromExcelAsync(Stream fileStream);
        
        /// <summary>
        /// Generate Excel template file cho maintenance templates
        /// </summary>
        byte[] GenerateTemplateExcelTemplate();
    }
}
