using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Domain.DTO
{
    public class UpdateReplacementHistoryRequest
    {
        public int? EquipmentId { get; set; }

        public int? IncidentId { get; set; } // Add IncidentId field

        public int? WorkOrderId { get; set; } // Add WorkOrderId field

        [Required(ErrorMessage = "ID phụ tùng là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "ID phụ tùng phải lớn hơn 0")]
        public int PartId { get; set; }

        [Required(ErrorMessage = "Số lượng là bắt buộc")]
        [Range(1, 10000, ErrorMessage = "Số lượng phải từ 1 đến 10.000")]
        public int Quantity { get; set; }

        [Required(ErrorMessage = "Ngày thay thế là bắt buộc")]
        public DateTime ReplacedDate { get; set; }

        [Required(ErrorMessage = "Người thay thế là bắt buộc")]
        [StringLength(450, ErrorMessage = "ID người thay thế không được vượt quá 450 ký tự")]
        public string ReplacedBy { get; set; } = null!;

        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        [StringLength(50, ErrorMessage = "Trạng thái không được vượt quá 50 ký tự")]
        public string Status { get; set; } = null!;

        [StringLength(500, ErrorMessage = "Ghi chú không được vượt quá 500 ký tự")]
        public string? Remarks { get; set; }

        /// <summary>
        /// Số lượng thực tế đã sử dụng
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "Số lượng thực tế sử dụng phải lớn hơn hoặc bằng 0")]
        public int? ActualQuantityUsed { get; set; }

        /// <summary>
        /// Số lượng thừa cần trả lại kho
        /// </summary>
        [Range(0, int.MaxValue, ErrorMessage = "Số lượng cần trả lại phải lớn hơn hoặc bằng 0")]
        public int? QuantityToReturn { get; set; }

        /// <summary>
        /// Ngày trả lại linh kiện thừa vào kho
        /// </summary>
        public DateTime? ReturnedDate { get; set; }

        /// <summary>
        /// Người xác nhận việc trả lại (thường là nhân viên kho)
        /// </summary>
        public string? ReturnConfirmedBy { get; set; }
    }
}
