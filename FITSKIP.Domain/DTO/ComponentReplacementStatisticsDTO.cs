using System;

namespace FITSKIP.Domain.DTO
{
    /// <summary>
    /// DTO for component replacement statistics
    /// Thống kê linh kiện tiêu hao theo công đoạn và dây chuyền
    /// </summary>
    public class ComponentReplacementStatisticsDTO
    {
        public int PartId { get; set; }
        public string PartNumber { get; set; } = null!;
        public string PartName { get; set; } = null!;
        public string? PartType { get; set; }

        // Thông tin dây chuyền và công đoạn
        public int? LineId { get; set; }
        public string? LineName { get; set; }
        public int? StageId { get; set; }
        public string? StageName { get; set; }

        // Thiết bị sử dụng linh kiện này nhiều nhất
        public int? EquipmentId { get; set; }
        public string? EquipmentCode { get; set; }
        public string? EquipmentName { get; set; }

        // Thống kê sử dụng
        public int TotalQuantityUsed { get; set; } // Tổng số lượng đã sử dụng
        public int ReplacementCount { get; set; } // Số lần thay thế
        public DateTime? LastReplacementDate { get; set; } // Ngày thay gần nhất
    }
}
