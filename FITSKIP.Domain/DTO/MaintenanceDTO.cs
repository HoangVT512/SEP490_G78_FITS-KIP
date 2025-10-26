using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO
{
    // ===== Maintenance Plan DTOs =====
    public class MaintenancePlanDTO
    {
        public int PlanId { get; set; }
        public int? EquipmentId { get; set; }
        public string? EquipmentName { get; set; }
        public string? EquipmentCode { get; set; }
        public string? LineName { get; set; }
        public string? StageName { get; set; }
        public string IntervalType { get; set; } = string.Empty; // 'Hours', 'Days', 'UsageCycles'
        public int IntervalValue { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly NextDueDate { get; set; }
        public string? AssignedTo { get; set; }
        public string? AssignedToName { get; set; }
        public bool IsActive { get; set; }
        public string Status { get; set; } = "Pending"; // Pending, InProgress, Completed, Overdue
        public int? DaysUntilDue { get; set; }
        public bool IsOverdue { get; set; }
        public List<MaintenanceChecklistItemDTO> ChecklistItems { get; set; } = new();
    }

    public class CreateMaintenancePlanRequest
    {
        [Required(ErrorMessage = "Equipment ID là bắt buộc")]
        public int EquipmentId { get; set; }

        [Required(ErrorMessage = "Loại chu kỳ là bắt buộc")]
        [RegularExpression("^(Hours|Days|UsageCycles)$", ErrorMessage = "Loại chu kỳ phải là Hours, Days hoặc UsageCycles")]
        public string IntervalType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Giá trị chu kỳ là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Giá trị chu kỳ phải lớn hơn 0")]
        public int IntervalValue { get; set; }

        [Required(ErrorMessage = "Ngày bắt đầu là bắt buộc")]
        public DateOnly StartDate { get; set; }

        public string? AssignedTo { get; set; }

        public List<string> ChecklistSteps { get; set; } = new();
    }

    public class UpdateMaintenancePlanRequest
    {
        [Required(ErrorMessage = "Equipment ID là bắt buộc")]
        public int EquipmentId { get; set; }

        [Required(ErrorMessage = "Loại chu kỳ là bắt buộc")]
        [RegularExpression("^(Hours|Days|UsageCycles)$", ErrorMessage = "Loại chu kỳ phải là Hours, Days hoặc UsageCycles")]
        public string IntervalType { get; set; } = string.Empty;

        [Required(ErrorMessage = "Giá trị chu kỳ là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Giá trị chu kỳ phải lớn hơn 0")]
        public int IntervalValue { get; set; }

        public DateOnly? NextDueDate { get; set; }

        public string? AssignedTo { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class AssignMaintenanceTechnicianRequest
    {
        [Required(ErrorMessage = "ID kỹ thuật viên là bắt buộc")]
        public string TechnicianId { get; set; } = string.Empty;
    }

    // ===== Maintenance Checklist DTOs =====
    public class MaintenanceChecklistItemDTO
    {
        public int ChecklistId { get; set; }
        public int PlanId { get; set; }
        public string StepName { get; set; } = string.Empty;
        public bool? IsChecked { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateChecklistItemRequest
    {
        public bool IsChecked { get; set; }
        public string? Notes { get; set; }
    }

    public class CompleteMaintenanceRequest
    {
        [Required(ErrorMessage = "Danh sách checklist items là bắt buộc")]
        public List<ChecklistItemCompletion> ChecklistItems { get; set; } = new();

        [MaxLength(1000, ErrorMessage = "Ghi chú tổng quan không vượt quá 1000 ký tự")]
        public string? OverallNotes { get; set; }
    }

    public class ChecklistItemCompletion
    {
        [Required(ErrorMessage = "Checklist ID là bắt buộc")]
        public int ChecklistId { get; set; }

        [Required(ErrorMessage = "Trạng thái hoàn thành là bắt buộc")]
        public bool IsChecked { get; set; }

        [MaxLength(500, ErrorMessage = "Ghi chú không vượt quá 500 ký tự")]
        public string? Notes { get; set; }
    }

    // ===== Work Order DTOs =====
    public class WorkOrderDTO
    {
        public int PlanId { get; set; }
        public string? EquipmentName { get; set; }
        public string? EquipmentCode { get; set; }
        public string? LineName { get; set; }
        public string? StageName { get; set; }
        public DateOnly DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public bool IsOverdue { get; set; }
        public int? DaysUntilDue { get; set; }
        public List<MaintenanceChecklistItemDTO> ChecklistItems { get; set; } = new();
        public string? AssignedToName { get; set; }
    }

    // ===== Statistics DTOs =====
    public class MaintenanceStatsDTO
    {
        public int TotalPlans { get; set; }
        public int ActivePlans { get; set; }
        public int PendingPlans { get; set; }
        public int InProgressPlans { get; set; }
        public int CompletedPlans { get; set; }
        public int OverduePlans { get; set; }
        public int DueThisWeek { get; set; }
        public int DueThisMonth { get; set; }
        public decimal CompletionRate { get; set; }
    }

    public class MaintenanceHistoryDTO
    {
        public int PlanId { get; set; }
        public string? EquipmentName { get; set; }
        public string? EquipmentCode { get; set; }
        public DateOnly CompletedDate { get; set; }
        public string? CompletedBy { get; set; }
        public string? CompletedByName { get; set; }
        public List<MaintenanceChecklistItemDTO> ChecklistItems { get; set; } = new();
        public string? OverallNotes { get; set; }
    }

    // ===== Request/Response for Manager =====
    public class MaintenanceRequestDTO
    {
        public int PlanId { get; set; }
        public string? EquipmentName { get; set; }
        public string? EquipmentCode { get; set; }
        public DateOnly RequestDate { get; set; }
        public DateOnly DueDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? RequestedBy { get; set; }
        public string? RequestedByName { get; set; }
    }

    public class ApproveMaintenanceRequest
    {
        public string? AssignedTo { get; set; }
        public DateOnly? ScheduledDate { get; set; }
        public string? ApprovalNotes { get; set; }
    }

    public class RejectMaintenanceRequest
    {
        [Required(ErrorMessage = "Lý do từ chối là bắt buộc")]
        [MaxLength(500, ErrorMessage = "Lý do không vượt quá 500 ký tự")]
        public string RejectionReason { get; set; } = string.Empty;
    }
}
