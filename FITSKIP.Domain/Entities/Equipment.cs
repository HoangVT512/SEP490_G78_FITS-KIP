using System;
using System.Collections.Generic;

namespace FITSKIP.Infrastructure.DbContexts;

public partial class Equipment
{
    public int EquipmentId { get; set; }

    public string? EquipmentCode { get; set; }

    public string? EquipmentName { get; set; }

    public DateOnly? DateUse { get; set; }

    public string? Origin { get; set; }

    public int? Yom { get; set; }

    public string? Qrcode { get; set; }

    public int? StageId { get; set; }

    public string? Issue { get; set; }

    public string? IdCode { get; set; }

    public int? LineId { get; set; }

    public bool IsActive { get; set; }

    public virtual ICollection<ErrorHistory> ErrorHistories { get; set; } = new List<ErrorHistory>();

    public virtual Line? Line { get; set; }

    public virtual Stage? Stage { get; set; }
}
