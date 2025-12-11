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

        public DateTime? ReplacedDate { get; set; }

        public string? ReplacedBy { get; set; }

        public string? Status { get; set; }

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
