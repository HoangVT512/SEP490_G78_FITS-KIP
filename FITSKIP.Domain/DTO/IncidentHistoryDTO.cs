using System.ComponentModel.DataAnnotations;

namespace FITSKIP.Domain.DTO
{
    public class IncidentHistoryDTO
    {
        public int IncidentId { get; set; }
        public int EquipmentId { get; set; }
        public string? EquipmentName { get; set; }
        public string? EquipmentCode { get; set; }
        public string? LineName { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public decimal? Duration { get; set; }
        public int? TypeId { get; set; }
        public string? TypeName { get; set; }
        public string? Reason { get; set; }
        public string? Solution { get; set; }
        public string? Issue { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class CreateIncidentRequest
    {
        [Required(ErrorMessage = "Equipment ID is required")]
        public int EquipmentId { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int? TypeId { get; set; }

        [Required(ErrorMessage = "Issue is required")]
        [MaxLength(500, ErrorMessage = "Issue cannot exceed 500 characters")]
        public string? Issue { get; set; }

        [MaxLength(500, ErrorMessage = "Reason cannot exceed 500 characters")]
        public string? Reason { get; set; }

        [MaxLength(500, ErrorMessage = "Solution cannot exceed 500 characters")]
        public string? Solution { get; set; }

        public string? ReportedByUserId { get; set; }
    }

    public class UpdateIncidentRequest
    {
        [Required(ErrorMessage = "Equipment ID is required")]
        public int EquipmentId { get; set; }

        [Required(ErrorMessage = "Start time is required")]
        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        [Required(ErrorMessage = "Type ID is required")]
        public int TypeId { get; set; }

        [MaxLength(500, ErrorMessage = "Issue cannot exceed 500 characters")]
        public string? Issue { get; set; }

        [MaxLength(500, ErrorMessage = "Reason cannot exceed 500 characters")]
        public string? Reason { get; set; }

        [MaxLength(500, ErrorMessage = "Solution cannot exceed 500 characters")]
        public string? Solution { get; set; }
    }

    public class DowntimeStatsDTO
    {
        public string Period { get; set; } = string.Empty;
        public decimal TotalDowntime { get; set; }
        public int TotalIncidents { get; set; }
        public List<DowntimeByLineDTO> DowntimeByLines { get; set; } = new();
        public List<IncidentByStopTypeDTO> IncidentsByStopType { get; set; } = new();
        public List<DowntimeByShiftDTO> DowntimeByShifts { get; set; } = new();
    }

    public class DowntimeByLineDTO
    {
        public int LineId { get; set; }
        public string LineName { get; set; } = string.Empty;
        public decimal TotalDowntime { get; set; }
        public int IncidentCount { get; set; }
    }

    public class IncidentByStopTypeDTO
    {
        public int TypeId { get; set; }
        public string TypeName { get; set; } = string.Empty;
        public int IncidentCount { get; set; }
        public decimal TotalDowntime { get; set; }
    }

    public class DowntimeByShiftDTO
    {
        public int ShiftId { get; set; }
        public string ShiftName { get; set; } = string.Empty;
        public decimal TotalDowntime { get; set; }
        public int IncidentCount { get; set; }
    }
}