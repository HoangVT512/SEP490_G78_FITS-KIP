using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Domain.DTO
{
    /// <summary>
    /// DTO for requesting spare parts from maintenance work order
    /// Sent by technician when they need spare parts for a maintenance task
    /// </summary>
    public class MaintenanceSparePartRequestDto
    {
        /// <summary>
        /// ID của phiếu giao việc bảo trì
        /// </summary>
        [Required]
        public int WorkOrderId { get; set; }

        /// <summary>
        /// ID của người yêu cầu (kỹ thuật viên)
        /// </summary>
        [Required]
        public string RequestedBy { get; set; } = null!;

        /// <summary>
        /// Danh sách các linh kiện yêu cầu
        /// </summary>
        [Required]
        [MinLength(1, ErrorMessage = "Phải có ít nhất 1 linh kiện trong yêu cầu")]
        public List<SparePartRequestItemDto> Items { get; set; } = new List<SparePartRequestItemDto>();

        /// <summary>
        /// Ngày yêu cầu
        /// </summary>
        public DateTime RequestDate { get; set; } = DateTime.Now;

        /// <summary>
        /// Ghi chú bổ sung (tùy chọn)
        /// </summary>
        public string? Notes { get; set; }
    }

    /// <summary>
    /// Chi tiết một linh kiện trong yêu cầu
    /// </summary>
    public class SparePartRequestItemDto
    {
        /// <summary>
        /// Tên linh kiện
        /// </summary>
        [Required]
        public string PartName { get; set; } = null!;

        /// <summary>
        /// Số lượng cần
        /// </summary>
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải > 0")]
        public int Quantity { get; set; }
    }
}
