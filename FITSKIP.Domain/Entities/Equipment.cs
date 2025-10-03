using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class Equipment
{
    public int EquipmentId { get; set; }

    public string? EquipmentCode { get; set; }

    public string? EquipmentName { get; set; }

    public DateOnly? DateUse { get; set; }

    public string? Origin { get; set; }

    public int? Yom { get; set; }

    public string? Qrcode { get; set; }

    public string? IdCode { get; set; }

    public int? StageId { get; set; }

    public string? Issue { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual Stage? Stage { get; set; }

    public virtual ICollection<IncidentHistory> IncidentHistories { get; set; } = new List<IncidentHistory>();

    public virtual ICollection<MaintenancePlan> MaintenancePlans { get; set; } = new List<MaintenancePlan>();

    public virtual ICollection<ReplacementHistory> ReplacementHistories { get; set; } = new List<ReplacementHistory>();
}
