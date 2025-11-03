using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

/// <summary>
/// Chi tiết checklist thực tế khi thực hiện bảo trì
/// Copy từ MaintenanceTemplateItem, có thể chỉnh sửa trước khi assign
/// </summary>
public partial class MaintenanceChecklistItem
{
    public int ChecklistId { get; set; }

    /// <summary>
    /// FK: Work Order (không còn dùng PlanId)
    /// </summary>
    public int WorkOrderId { get; set; }

    /// <summary>
    /// Phân loại: "Phần điện" hoặc "Phần cơ"
    /// </summary>
    public string Category { get; set; } = null!;

    /// <summary>
    /// Thứ tự bước
    /// </summary>
    public int OrderIndex { get; set; }

    /// <summary>
    /// Tên bước (có thể chỉnh sửa từ template)
    /// </summary>
    public string StepName { get; set; } = null!;

    public string? StepDescription { get; set; }

    /// <summary>
    /// Vai trò yêu cầu: "Bảo trì điện" hoặc "Bảo trì cơ"
    /// </summary>
    public string RequiredRole { get; set; } = null!;

    /// <summary>
    /// Đã check chưa
    /// </summary>
    public bool IsChecked { get; set; } = false;

    /// <summary>
    /// Người thực hiện check (UserId)
    /// </summary>
    public string? CompletedBy { get; set; }

    /// <summary>
    /// Thời gian hoàn thành
    /// </summary>
    public DateTime? CompletedDate { get; set; }

    /// <summary>
    /// Ghi chú cho bước này
    /// </summary>
    public string? Notes { get; set; }

    // Navigation properties
    public virtual MaintenanceWorkOrder WorkOrder { get; set; } = null!;
    public virtual User? CompletedByUser { get; set; }

    // Backward compatibility - deprecated
    [Obsolete("Use WorkOrderId instead")]
    public int PlanId { get; set; }
    
    [Obsolete("Use WorkOrder instead")]
    public virtual MaintenancePlan? Plan { get; set; }
}
