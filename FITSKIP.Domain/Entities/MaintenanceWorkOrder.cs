using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

/// <summary>
/// Phiếu giao việc bảo trì cụ thể
/// Được tạo khi MaintenancePlan đến hạn, TechManager review và assign technicians
/// </summary>
public partial class MaintenanceWorkOrder
{
    public int WorkOrderId { get; set; }

    public string WorkOrderCode { get; set; } = null!;

    public int PlanId { get; set; }

    public int EquipmentId { get; set; }

    public DateTime? AssignedDate { get; set; }

    /// <summary>
    /// Ngày dự định bảo trì - Ngày máy sẽ dừng để bảo trì
    /// KTV chỉ được phép Start WorkOrder từ ngày này trở đi
    /// </summary>
    public DateTime ScheduledDate { get; set; }

    public DateTime DueDate { get; set; }

    public string? AssignedToElectrical { get; set; }

    public string? AssignedToMechanical { get; set; }

    public string Status { get; set; } = "Pending";

    public DateTime? PostponedDueDate { get; set; }

    public string? PostponedReason { get; set; }

    public DateTime? PostponedDate { get; set; }

    public DateTime? StartedDate { get; set; }

    public DateTime? CompletedDate { get; set; }

    public string? Notes { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public string? UpdatedBy { get; set; }

    public DateTime? UpdatedDate { get; set; }

    // Navigation properties
    public virtual MaintenancePlan Plan { get; set; } = null!;
    public virtual Equipment Equipment { get; set; } = null!;
    public virtual User? ElectricalTechnician { get; set; }
    public virtual User? MechanicalTechnician { get; set; }
    public virtual User? CreatedByUser { get; set; }
    public virtual User? UpdatedByUser { get; set; }
    public virtual ICollection<MaintenanceChecklistItem> ChecklistItems { get; set; } = new List<MaintenanceChecklistItem>();
    public virtual ICollection<ReplacementHistory> ReplacementHistories { get; set; } = new List<ReplacementHistory>();
}
