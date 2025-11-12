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

    
    public string IntervalType { get; set; } = null!;

    
    public int IntervalValue { get; set; }

    public DateTime StartDate { get; set; }

    
    public DateTime NextDueDate { get; set; }

    
    public DateTime? PostponedDueDate { get; set; }

   
    public int ReminderDaysBefore { get; set; } = 3;

    
    public string? CreatedBy { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public bool IsActive { get; set; } = true;

    
    public string Status { get; set; } = "Pending";

    
    public string? PostponedReason { get; set; }

    
    public DateTime? PostponedDate { get; set; }

    
    public virtual Equipment? Equipment { get; set; }
    public virtual MaintenanceTemplate? Template { get; set; }
    public virtual User? CreatedByUser { get; set; }
    public virtual ICollection<MaintenanceWorkOrder> WorkOrders { get; set; } = new List<MaintenanceWorkOrder>();
    
    
    public virtual ICollection<MaintenancePlanAssignment> Assignments { get; set; } = new List<MaintenancePlanAssignment>();

    [Obsolete("Use WorkOrders instead")]
    public virtual ICollection<MaintenanceChecklistItem> ChecklistItems { get; set; } = new List<MaintenanceChecklistItem>();
}
