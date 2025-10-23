using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class IncidentHistory
{
    public int IncidentId { get; set; }

    public int? EquipmentId { get; set; }

    public int? LineId { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public decimal? Duration { get; set; }

    public int? TypeId { get; set; }

    public string? Reason { get; set; }

    public string? Solution { get; set; }

    public string? Issue { get; set; }

    public string? ImageUrl { get; set; }

    public string? Status { get; set; } = "Chờ xử lý"; // Trạng thái: Chờ xử lý, Đang xử lý, Hoàn thành, Hủy

    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;

    public string? ReportedByUserId { get; set; }

    public string? AssignedTo { get; set; }

    public bool IsTechSupport { get; set; } = false;

    public virtual Equipment? Equipment { get; set; }

    public virtual Line? Line { get; set; }

    public virtual StopType? Type { get; set; }

    public virtual User? ReportedByUser { get; set; }

    public virtual ICollection<IncidentShift> IncidentShifts { get; set; } = new List<IncidentShift>();
}
