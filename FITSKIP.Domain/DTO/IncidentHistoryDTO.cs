using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace FITSKIP.Domain.DTO
{
    public class IncidentHistoryDTO
    {
        public int IncidentId { get; set; }
        public int EquipmentId { get; set; }
        public string? EquipmentName { get; set; }
        public string? EquipmentCode { get; set; }
        public int? LineId { get; set; }
        public string? LineName { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public decimal? Duration { get; set; }
        public int? TypeId { get; set; }
        public string? TypeName { get; set; }
        public string? Reason { get; set; }
        public string? Solution { get; set; }
        public string? Issue { get; set; }
        public string? ImageUrl { get; set; }
        public List<string>? ImageUrls { get; set; } // Multiple image URLs
        public DateTime CreatedDate { get; set; }
        public bool IsTechSupport { get; set; }
    }

    public class CreateIncidentRequest
    {
        [Range(1, int.MaxValue, ErrorMessage = "ID thiết bị phải là số nguyên dương")]
        public int? EquipmentId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "ID dây chuyền phải là số nguyên dương")]
        public int? LineId { get; set; }

        [DataType(DataType.DateTime, ErrorMessage = "Thời gian bắt đầu không đúng định dạng")]
        public DateTime? StartTime { get; set; }

        [DataType(DataType.DateTime, ErrorMessage = "Thời gian kết thúc không đúng định dạng")]
        public DateTime? EndTime { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Thời lượng phải là số dương")]
        public decimal? Duration { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "ID loại dừng phải lớn hơn 0")]
        public int? TypeId { get; set; }

        [MaxLength(500, ErrorMessage = "Mô tả vấn đề không được vượt quá 500 ký tự")]
        public string? Issue { get; set; } // Optional - có thể null

        [MaxLength(500, ErrorMessage = "Nguyên nhân không được vượt quá 500 ký tự")]
        public string? Reason { get; set; } // Optional - có thể null

        [MaxLength(500, ErrorMessage = "Giải pháp không được vượt quá 500 ký tự")]
        public string? Solution { get; set; } // Optional - có thể null

        [Required(ErrorMessage = "ID người báo cáo là bắt buộc")]
        [StringLength(450, ErrorMessage = "ID người báo cáo không được vượt quá 450 ký tự")]
        public string? ReportedByUserId { get; set; }

        public bool IsTechSupport { get; set; } = false;

        // File upload properties - will be handled separately in controller
        public string? ImageUrl { get; set; } // Single image URL (backward compatibility)
        public List<string>? ImageUrls { get; set; } // Multiple image URLs (up to 5)
        public IFormFile? ImageFile { get; set; } // File to upload
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
        [Range(1, int.MaxValue, ErrorMessage = "ID thiết bị phải là số nguyên dương")]
        public int? EquipmentId { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "ID dây chuyền phải là số nguyên dương")]
        public int? LineId { get; set; }

        [Required(ErrorMessage = "Thời gian bắt đầu là bắt buộc")]
        [DataType(DataType.DateTime, ErrorMessage = "Thời gian bắt đầu không đúng định dạng")]
        public DateTime StartTime { get; set; }

        [DataType(DataType.DateTime, ErrorMessage = "Thời gian kết thúc không đúng định dạng")]
        public DateTime? EndTime { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Thời lượng phải là số dương")]
        public decimal? Duration { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "ID loại dừng phải là số nguyên dương")]
        public int? TypeId { get; set; }

        [MaxLength(500, ErrorMessage = "Mô tả vấn đề không được vượt quá 500 ký tự")]
        public string? Issue { get; set; }

        [MaxLength(500, ErrorMessage = "Nguyên nhân không được vượt quá 500 ký tự")]
        public string? Reason { get; set; } // Optional - có thể null

        [MaxLength(500, ErrorMessage = "Giải pháp không được vượt quá 500 ký tự")]
        public string? Solution { get; set; } // Optional - có thể null

        [MaxLength(50, ErrorMessage = "Trạng thái không được vượt quá 50 ký tự")]
        public string? Status { get; set; }

        [Required(ErrorMessage = "ID người báo cáo là bắt buộc")]
        [StringLength(450, ErrorMessage = "ID người báo cáo không được vượt quá 450 ký tự")]
        public string? ReportedByUserId { get; set; }

        public bool IsTechSupport { get; set; } = false;

        // File upload properties - will be handled separately in controller
        public string? ImageUrl { get; set; } // Single image URL (backward compatibility)
        public List<string>? ImageUrls { get; set; } // Multiple image URLs (up to 5)
        public IFormFile? ImageFile { get; set; } // File to upload
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