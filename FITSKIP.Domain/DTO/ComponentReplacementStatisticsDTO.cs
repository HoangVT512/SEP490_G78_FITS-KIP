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
        
        // Định mức/Chu kỳ thay thế
        public string? ReplacementCycle { get; set; } // Ví dụ: "50000 PCS", "12 Tháng"
        public int? LimitValue { get; set; } // Giá trị số của định mức (50000, 12)
        public string? LimitUnit { get; set; } // Đơn vị (PCS, Tháng, Năm)
        
        // Thống kê sử dụng
        public int TotalQuantityUsed { get; set; } // Tổng số lượng đã sử dụng
        public int ReplacementCount { get; set; } // Số lần thay thế
        public DateTime? LastReplacementDate { get; set; } // Ngày thay gần nhất
        
        // Tính toán phần trăm
        public decimal? UsagePercentage { get; set; } // % sử dụng so với định mức
        
        // Trạng thái
        public string Status { get; set; } = "safe"; // safe, warning, critical
        public string StatusColor { get; set; } = "#2980b9"; // Màu hiển thị
    }
}
