using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

/// <summary>
/// Kế hoạch bảo trì định kỳ cho từng máy
/// TechManager tạo chu kỳ, hệ thống tự động nhắc khi đến hạn
/// </summary>
public partial class MaintenancePlan
{
    public int PlanId { get; set; }

    public int? EquipmentId { get; set; }

    /// <summary>
    /// FK: Template checklist theo công đoạn
    /// </summary>
    public int? TemplateId { get; set; }

    /// <summary>
    /// Loại chu kỳ: 'Hours', 'Days', 'Months', 'Minutes' (để test)
    /// </summary>
    public string IntervalType { get; set; } = null!;

    /// <summary>
    /// Giá trị chu kỳ: VD 30 (ngày), 100 (giờ), 1 (tháng)
    /// </summary>
    public int IntervalValue { get; set; }

    public DateTime StartDate { get; set; }

    /// <summary>
    /// Ngày bảo trì tiếp theo - Hệ thống sẽ nhắc TechManager
    /// </summary>
    public DateTime NextDueDate { get; set; }

    /// <summary>
    /// Ngày đến hạn SAU KHI hoãn (nếu có). Nếu null thì dùng NextDueDate.
    /// </summary>
    public DateTime? PostponedDueDate { get; set; }

    /// <summary>
    /// Kỹ thuật viên điện được assign (có EmployeeCode)
    /// </summary>
    public string? AssignedToElectrical { get; set; }

    /// <summary>
    /// Kỹ thuật viên cơ được assign (có EmployeeCode)
    /// </summary>
    public string? AssignedToMechanical { get; set; }

    /// <summary>
    /// TechManager tạo plan
    /// </summary>
    public string? CreatedBy { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Trạng thái: 'Pending', 'InProgress', 'Completed', 'Overdue'
    /// </summary>
    public string Status { get; set; } = "Pending";

    /// <summary>
    /// Lý do hoãn bảo trì (nếu có)
    /// </summary>
    public string? PostponedReason { get; set; }

    /// <summary>
    /// Ngày hoãn bảo trì (nếu có)
    /// </summary>
    public DateTime? PostponedDate { get; set; }

    // Navigation properties
    public virtual Equipment? Equipment { get; set; }
    public virtual MaintenanceTemplate? Template { get; set; }
    public virtual User? ElectricalTechnician { get; set; }
    public virtual User? MechanicalTechnician { get; set; }
    public virtual User? CreatedByUser { get; set; }
    public virtual ICollection<MaintenanceWorkOrder> WorkOrders { get; set; } = new List<MaintenanceWorkOrder>();
    
    /// <summary>
    /// Danh sách kỹ thuật viên được phân công (hỗ trợ nhiều người)
    /// </summary>
    public virtual ICollection<MaintenancePlanAssignment> Assignments { get; set; } = new List<MaintenancePlanAssignment>();

    // Backward compatibility - deprecated
    [Obsolete("Use AssignedToElectrical and AssignedToMechanical instead")]
    public string? AssignedTo { get; set; }
    
    [Obsolete("Use AssignedToElectrical and AssignedToMechanical instead")]
    public virtual User? AssignedToUser { get; set; }
    
    [Obsolete("Use WorkOrders instead")]
    public virtual ICollection<MaintenanceChecklistItem> ChecklistItems { get; set; } = new List<MaintenanceChecklistItem>();
}
