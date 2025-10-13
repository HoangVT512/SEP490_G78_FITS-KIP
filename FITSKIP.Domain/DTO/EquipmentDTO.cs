namespace FITSKIP.Domain.DTO;

public class EquipmentDTO
{
    public int EquipmentId { get; set; }
    public string EquipmentCode { get; set; } = string.Empty;
    public string EquipmentName { get; set; } = string.Empty;
    public DateOnly? DateUse { get; set; }
    public string? Origin { get; set; }
    public int? Yom { get; set; }
    public string? Qrcode { get; set; }
    public int? StageId { get; set; }
    public string? StageName { get; set; }
    public int? LineId { get; set; }
    public string? LineName { get; set; }
    public bool IsActive { get; set; }

    public static EquipmentDTO FromEntity(Domain.Entities.Equipment equipment)
    {
        return new EquipmentDTO
        {
            EquipmentId = equipment.EquipmentId,
            EquipmentCode = equipment.EquipmentCode ?? string.Empty,
            EquipmentName = equipment.EquipmentName ?? string.Empty,
            DateUse = equipment.DateUse,
            Origin = equipment.Origin,
            Yom = equipment.Yom,
            Qrcode = equipment.Qrcode,
            StageId = equipment.StageId,
            StageName = equipment.Stage?.StageName,
            LineId = equipment.Stage?.LineId,
            LineName = equipment.Stage?.Line?.LineName,
            IsActive = equipment.IsActive
        };
    }
}

