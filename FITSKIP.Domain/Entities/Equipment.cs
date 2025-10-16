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

    public string? Issue { get; set; }

    public int? StageId { get; set; }

    public bool IsActive { get; set; } = true;

    public virtual Stage? Stage { get; set; }
}
