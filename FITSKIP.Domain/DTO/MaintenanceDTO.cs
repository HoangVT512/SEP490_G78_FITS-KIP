using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO
{
    // ===== MAINTENANCE TEMPLATE DTOs =====
    
    /// <summary>
    /// DTO cho Maintenance Template - Checklist mẫu theo công đoạn
    /// </summary>
    public class MaintenanceTemplateDTO
    {
        public int TemplateId { get; set; }
        public int StageId { get; set; }
        public string StageName { get; set; } = string.Empty;
        public string LineName { get; set; } = string.Empty;
        public string TemplateName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? InspectionCode { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public string? CreatedByName { get; set; }
        public List<MaintenanceTemplateItemDTO> TemplateItems { get; set; } = new();
    }

    /// <summary>
    /// DTO cho từng bước trong template
    /// </summary>
    public class MaintenanceTemplateItemDTO
    {
        public int ItemId { get; set; }
        public int TemplateId { get; set; }
        public string Category { get; set; } = string.Empty; // "Mechanical", "Electrical", "General"
        public int OrderIndex { get; set; }
        public string StepName { get; set; } = string.Empty;
        public string? StepDescription { get; set; }
        public bool IsRequired { get; set; }
        public string RequiredRole { get; set; } = string.Empty; // "Mechanical", "Electrical", "Both"
        public bool IsActive { get; set; }
    }

    public class CreateMaintenanceTemplateRequest
    {
        [Required(ErrorMessage = "Stage ID là bắt buộc")]
        public int StageId { get; set; }
        
        /// <summary>
        /// Tên công đoạn - dùng cho import Excel (sẽ resolve sang StageId)
        /// </summary>
        public string? StageName { get; set; }

        [Required(ErrorMessage = "Tên template là bắt buộc")]
        [MaxLength(200, ErrorMessage = "Tên template không vượt quá 200 ký tự")]
        public string TemplateName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? InspectionCode { get; set; }

        public List<CreateTemplateItemRequest> TemplateItems { get; set; } = new();
    }

    public class UpdateMaintenanceTemplateRequest
    {
        [Required]
        [MaxLength(200)]
        public string TemplateName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? InspectionCode { get; set; }

        public bool IsActive { get; set; }

        public List<CreateTemplateItemRequest> TemplateItems { get; set; } = new();
    }

    public class CreateTemplateItemRequest
    {
        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        public int OrderIndex { get; set; }

        [Required]
        [MaxLength(500)]
        public string StepName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? StepDescription { get; set; }

        public bool IsRequired { get; set; } = true;

        [Required]
        [MaxLength(50)]
        public string RequiredRole { get; set; } = string.Empty;
    }

    // ===== MAINTENANCE PLAN DTOs =====
    
    /// <summary>
    /// DTO cho Maintenance Plan - Kế hoạch bảo trì định kỳ
    /// </summary>
    public class MaintenancePlanDTO
    {
        public int PlanId { get; set; }
        public int? EquipmentId { get; set; }
        public string? EquipmentName { get; set; }
        public string? EquipmentCode { get; set; }
        public int? TemplateId { get; set; }
        public string? TemplateName { get; set; }
        public string? StageName { get; set; }
        public string? LineName { get; set; }
        
        // Chu kỳ bảo trì
        public string IntervalType { get; set; } = string.Empty; // 'Minutes', 'Hours', 'Days', 'Months'
        public int IntervalValue { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime NextDueDate { get; set; }
        
        // Assignment - Danh sách kỹ thuật viên được phân công
        public List<AssignedTechnicianDTO> AssignedTechnicians { get; set; } = new();
        
        // Backward compatibility
        public string? AssignedToElectrical { get; set; }
        public string? ElectricalTechnicianName { get; set; }
        public string? ElectricalEmployeeCode { get; set; }
        
        public string? AssignedToMechanical { get; set; }
        public string? MechanicalTechnicianName { get; set; }
        public string? MechanicalEmployeeCode { get; set; }
        
        // Status
        public bool IsActive { get; set; }
        public string Status { get; set; } = string.Empty; // 'Pending', 'InProgress', 'Completed', 'Overdue'
        public DateTime CreatedDate { get; set; }
        public string? CreatedByName { get; set; }
        
        // Tính toán
        public int DaysUntilDue { get; set; }
        public bool IsOverdue { get; set; }
        
        // Work orders
        public int TotalWorkOrders { get; set; }
        public int CompletedWorkOrders { get; set; }
        public bool HasActiveWorkOrder { get; set; }
        
        // Postpone info
        public DateTime? PostponedDueDate { get; set; }
        public string? PostponedReason { get; set; }
        public DateTime? PostponedDate { get; set; }
    }
    
    /// <summary>
    /// DTO cho kỹ thuật viên được phân công
    /// </summary>
    public class AssignedTechnicianDTO
    {
        public int AssignmentId { get; set; }
        public string TechnicianId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;
        public string TechnicianType { get; set; } = string.Empty; // 'Electrical' or 'Mechanical'
        public DateTime AssignedDate { get; set; }
        public string? AssignedByName { get; set; }
    }

    public class CreateMaintenancePlanRequest
    {
        [Required(ErrorMessage = "Equipment ID là bắt buộc")]
        public int EquipmentId { get; set; }

        public int? TemplateId { get; set; }

        [Required(ErrorMessage = "Loại chu kỳ là bắt buộc")]
        [RegularExpression("^(Minutes|Hours|Days|Months)$", ErrorMessage = "Loại chu kỳ phải là Minutes, Hours, Days hoặc Months")]
        public string IntervalType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Giá trị chu kỳ là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Giá trị chu kỳ phải lớn hơn 0")]
        public int IntervalValue { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu là bắt buộc")]
        public DateTime StartDate { get; set; }

        public string? AssignedToElectrical { get; set; }
        public string? AssignedToMechanical { get; set; }
        
        // ✅ THÊM: Properties để lưu tạm các code khi import Excel (sẽ resolve sang ID sau)
        /// <summary>
        /// Mã thiết bị - dùng cho import Excel (sẽ resolve sang EquipmentId)
        /// </summary>
        public string? EquipmentCode { get; set; }
        
        /// <summary>
        /// Mã template - dùng cho import Excel (sẽ resolve sang TemplateId)
        /// </summary>
        public string? TemplateCode { get; set; }
        
        /// <summary>
        /// Mã nhân viên KTV Điện - dùng cho import Excel (sẽ resolve sang AssignedToElectrical)
        /// </summary>
        public string? ElectricalTechCode { get; set; }
        
        /// <summary>
        /// Mã nhân viên KTV Cơ - dùng cho import Excel (sẽ resolve sang AssignedToMechanical)
        /// </summary>
        public string? MechanicalTechCode { get; set; }
    }

    public class UpdateMaintenancePlanRequest
    {
        public int? TemplateId { get; set; }

        [Required]
        [RegularExpression("^(Minutes|Hours|Days|Months)$")]
        public string IntervalType { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue)]
        public int IntervalValue { get; set; }

        public DateTime? NextDueDate { get; set; }

        public string? AssignedToElectrical { get; set; }
        public string? AssignedToMechanical { get; set; }

        public bool IsActive { get; set; }
    }

    // ===== MAINTENANCE WORK ORDER DTOs =====
    
    /// <summary>
    /// DTO cho Work Order - Phiếu bảo trì cụ thể
    /// </summary>
    public class MaintenanceWorkOrderDTO
    {
        public int WorkOrderId { get; set; }
        public string WorkOrderCode { get; set; } = string.Empty;
        public int PlanId { get; set; }
        
        // ✅ THÊM: TemplateId để frontend có thể load checklist
        public int? TemplateId { get; set; }
        public string? TemplateName { get; set; }
        
        // Equipment info
        public int EquipmentId { get; set; }
        public string EquipmentName { get; set; } = string.Empty;
        public string EquipmentCode { get; set; } = string.Empty;
        public string? StageName { get; set; }
        public string? LineName { get; set; }
        
        // Dates
        public DateTime AssignedDate { get; set; }
        public DateTime ScheduledDate { get; set; } // Ngày dự định bảo trì (ngày máy dừng)
        public DateTime DueDate { get; set; }
        public DateTime? StartedDate { get; set; }
        public DateTime? CompletedDate { get; set; }
        
        // Assignment
        public string? AssignedToElectrical { get; set; }
        public string? ElectricalTechnicianName { get; set; }
        public string? ElectricalEmployeeCode { get; set; }
        
        public string? AssignedToMechanical { get; set; }
        public string? MechanicalTechnicianName { get; set; }
        public string? MechanicalEmployeeCode { get; set; }
        
        // Details
        public string Status { get; set; } = string.Empty; // 'Pending', 'InProgress', 'Completed', 'Cancelled'
        public string? Notes { get; set; }
        
        // Checklist
        public List<MaintenanceChecklistItemDTO> ChecklistItems { get; set; } = new();
        
        // Progress - Overall (cho TechManager)
        public int TotalChecklistItems { get; set; }
        public int CompletedChecklistItems { get; set; }
        public decimal CompletionPercentage { get; set; }
        
        // ✅ THÊM: Progress riêng cho từng KTV
        public int ElectricalTotalItems { get; set; }
        public int ElectricalCompletedItems { get; set; }
        public decimal ElectricalCompletionPercentage { get; set; }
        public string ElectricalStatus { get; set; } = string.Empty; // Trạng thái riêng của KTV Điện
        
        public int MechanicalTotalItems { get; set; }
        public int MechanicalCompletedItems { get; set; }
        public decimal MechanicalCompletionPercentage { get; set; }
        public string MechanicalStatus { get; set; } = string.Empty; // Trạng thái riêng của KTV Cơ
        
        // Calculated
        public int DaysUntilDue { get; set; }
        public bool IsOverdue { get; set; }
    }

    public class CreateMaintenanceWorkOrderRequest
    {
        [Required(ErrorMessage = "Plan ID là bắt buộc")]
        public int PlanId { get; set; }

        [Required(ErrorMessage = "Ngày dự định bảo trì là bắt buộc")]
        public DateTime ScheduledDate { get; set; }

        // ✅ Bỏ Required - nếu không có, backend sẽ tự set = ScheduledDate
        public DateTime? DueDate { get; set; }

        public string? AssignedToElectrical { get; set; }
        public string? AssignedToMechanical { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        /// <summary>
        /// Checklist items - TechManager có thể chỉnh sửa từ template
        /// </summary>
        public List<CreateChecklistItemRequest> ChecklistItems { get; set; } = new();
    }

    public class UpdateMaintenanceWorkOrderRequest
    {
        public DateTime? DueDate { get; set; }
        public string? AssignedToElectrical { get; set; }
        public string? AssignedToMechanical { get; set; }
        public string? Status { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }

        /// <summary>
        /// Cập nhật checklist - có thể thêm/bớt/sửa
        /// </summary>
        public List<CreateChecklistItemRequest>? ChecklistItems { get; set; }
    }

    // ===== CHECKLIST ITEM DTOs =====
    
    public class MaintenanceChecklistItemDTO
    {
        public int ChecklistId { get; set; }
        public int WorkOrderId { get; set; }
        public string Category { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public string StepName { get; set; } = string.Empty;
        public string? StepDescription { get; set; }
        public string RequiredRole { get; set; } = string.Empty;
        public bool IsChecked { get; set; }
        public string? CompletedBy { get; set; }
        public string? CompletedByName { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? Notes { get; set; }
    }

    public class CreateChecklistItemRequest
    {
        [Required]
        [MaxLength(50)]
        public string Category { get; set; } = string.Empty;

        [Required]
        public int OrderIndex { get; set; }

        [Required]
        [MaxLength(500)]
        public string StepName { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? StepDescription { get; set; }

        [Required]
        [MaxLength(50)]
        public string RequiredRole { get; set; } = string.Empty;
    }

    public class UpdateChecklistItemRequest
    {
        [Required]
        public bool IsChecked { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    public class CompleteWorkOrderRequest
    {
        [Required]
        public List<CompleteChecklistItemRequest> ChecklistItems { get; set; } = new();

        [MaxLength(1000)]
        public string? OverallNotes { get; set; }
    }

    public class CompleteChecklistItemRequest
    {
        [Required]
        public int ChecklistId { get; set; }

        [Required]
        public bool IsChecked { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    // ===== STATISTICS & DASHBOARD DTOs =====
    
    public class MaintenanceStatisticsDTO
    {
        public int TotalPlans { get; set; }
        public int ActivePlans { get; set; }
        public int TotalWorkOrders { get; set; }
        public int PendingWorkOrders { get; set; }
        public int InProgressWorkOrders { get; set; }
        public int CompletedWorkOrders { get; set; }
        public int OverdueWorkOrders { get; set; }
        public int DueThisWeek { get; set; }
        public int DueThisMonth { get; set; }
        public decimal OverallCompletionRate { get; set; }
    }

    public class UpcomingMaintenanceDTO
    {
        public int PlanId { get; set; }
        public int? EquipmentId { get; set; }
        public int? TemplateId { get; set; }
        public string? EquipmentName { get; set; }
        public string? EquipmentCode { get; set; }
        public string? LineName { get; set; }
        public string? StageName { get; set; }
        public DateTime NextDueDate { get; set; }
        public int DaysUntilDue { get; set; }
        public string? AssignedToElectrical { get; set; }
        public string? AssignedToMechanical { get; set; }
        public bool HasActiveWorkOrder { get; set; }
    }

    // ===== USER (TECHNICIAN) DTOs =====
    
    public class TechnicianDTO
    {
        public string UserId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string RoleName { get; set; } = string.Empty; // "Mechanical Technician" or "Electrical Technician"
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// DTO cho workload của technician theo ngày
    /// </summary>
    public class TechnicianWorkloadDTO
    {
        public string UserId { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string EmployeeCode { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public int WorkOrderCount { get; set; } // Số công việc đã giao trong ngày
    }

    // ===== ADDITIONAL REQUEST DTOs =====
    
    /// <summary>
    /// Request để assign technicians vào work order
    /// </summary>
    public class AssignTechniciansRequest
    {
        public string? ElectricalTechnicianId { get; set; }
        public string? MechanicalTechnicianId { get; set; }
    }
    
    /// <summary>
    /// Request để assign nhiều technicians vào maintenance plan
    /// </summary>
    public class AssignMultipleTechniciansRequest
    {
        [Required(ErrorMessage = "Danh sách kỹ thuật viên là bắt buộc")]
        public List<TechnicianAssignmentItem> Technicians { get; set; } = new();
    }
    
    /// <summary>
    /// Item trong danh sách assign technician
    /// </summary>
    public class TechnicianAssignmentItem
    {
        [Required(ErrorMessage = "Technician ID là bắt buộc")]
        public string TechnicianId { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Loại công việc là bắt buộc")]
        [RegularExpression("^(Electrical|Mechanical)$", ErrorMessage = "Loại công việc phải là Electrical hoặc Mechanical")]
        public string TechnicianType { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request để hủy work order
    /// </summary>
    public class CancelWorkOrderRequest
    {
        [Required(ErrorMessage = "Lý do hủy là bắt buộc")]
        [MaxLength(500, ErrorMessage = "Lý do hủy không vượt quá 500 ký tự")]
        public string Reason { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request để hoãn bảo trì (postpone maintenance)
    /// </summary>
    public class PostponeMaintenancePlanRequest
    {
        [Required(ErrorMessage = "Số ngày hoãn là bắt buộc")]
        [Range(1, 365, ErrorMessage = "Số ngày hoãn phải từ 1 đến 365 ngày")]
        public int PostponeDays { get; set; }

        [Required(ErrorMessage = "Lý do hoãn là bắt buộc")]
        [MaxLength(500, ErrorMessage = "Lý do hoãn không vượt quá 500 ký tự")]
        public string Reason { get; set; } = string.Empty;
    }

    /// <summary>
    /// Request để hoãn WorkOrder (postpone work order)
    /// </summary>
    public class PostponeWorkOrderRequest
    {
        [Required(ErrorMessage = "Số ngày hoãn là bắt buộc")]
        [Range(1, 365, ErrorMessage = "Số ngày hoãn phải từ 1 đến 365 ngày")]
        public int PostponeDays { get; set; }

        [Required(ErrorMessage = "Lý do hoãn là bắt buộc")]
        [MaxLength(500, ErrorMessage = "Lý do hoãn không vượt quá 500 ký tự")]
        public string Reason { get; set; } = string.Empty;
    }
}
