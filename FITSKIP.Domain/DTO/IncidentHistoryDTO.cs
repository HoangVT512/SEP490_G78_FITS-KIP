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
        public bool IsTechSupport { get; set; }
    }

    public class CreateIncidentRequest
    {
        [Required(ErrorMessage = "Equipment ID is required")]
        public int EquipmentId { get; set; }

        public DateTime? StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int? TypeId { get; set; }

        [MaxLength(500, ErrorMessage = "Vấn đề không vượt quá 500 ký tự")]
        public string? Issue { get; set; } // Optional - có thể null

        [MaxLength(500, ErrorMessage = "Lý do không vượt quá 500 ký tự")]
        public string? Reason { get; set; } // Optional - có thể null

        [MaxLength(500, ErrorMessage = "Giải pháp không vượt quá 500 ký tự")]
        public string? Solution { get; set; } // Optional - có thể null

        public string? ReportedByUserId { get; set; }

        public bool IsTechSupport { get; set; } = false;
    }

    public class CreateBulkIncidentRequest
    {
        [Required(ErrorMessage = "Danh sách sự cố là bắt buộc")]
        [MinLength(1, ErrorMessage = "Phải có ít nhất 1 sự cố")]
        public List<CreateIncidentRequest> Incidents { get; set; } = new();
    }

    public class BulkIncidentResponse
    {
        public int TotalRequested { get; set; }
        public int SuccessCount { get; set; }
        public int FailureCount { get; set; }
        public List<IncidentHistoryDTO> SuccessfulIncidents { get; set; } = new();
        public List<BulkIncidentError> Errors { get; set; } = new();
    }

    public class BulkIncidentError
    {
        public int Index { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public CreateIncidentRequest? FailedRequest { get; set; }
    }

    public class UpdateIncidentRequest
    {
        [Required(ErrorMessage = "ID thiết bị là bắt buộc")]
        public int EquipmentId { get; set; }

        [Required(ErrorMessage = "Thời gian bắt đầu là bắt buộc")]
        public DateTime StartTime { get; set; }

        public DateTime? EndTime { get; set; }

        public int? TypeId { get; set; }

        [MaxLength(500, ErrorMessage = "Vấn đề không vượt quá 500 ký tự")]
        public string? Issue { get; set; }

        [MaxLength(500, ErrorMessage = "Lý do không vượt quá 500 ký tự")]
        public string? Reason { get; set; } // Optional - có thể null

        [MaxLength(500, ErrorMessage = "Giải pháp không vượt quá 500 ký tự")]
        public string? Solution { get; set; } // Optional - có thể null

        [MaxLength(50, ErrorMessage = "Trạng thái không vượt quá 50 ký tự")]
        public string? Status { get; set; }

        public string? ReportedByUserId { get; set; }

        public bool IsTechSupport { get; set; } = false;
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

    public class AssignTechnicianRequest
    {
        [Required(ErrorMessage = "ID kỹ thuật viên là bắt buộc")]
        public string TechnicianId { get; set; } = string.Empty;

        public bool UpdateStatus { get; set; } = false;
    }
}