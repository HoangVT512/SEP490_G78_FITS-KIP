using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Domain.DTO
{
    public class ReplacementHistoryDTO
    {
        public int ReplacementID { get; set; }
        public int? EquipmentID { get; set; }
        public int? IncidentId { get; set; } // Add IncidentId field
        public int? WorkOrderId { get; set; } // Add WorkOrderId field
        public int PartID { get; set; }
        public int Quantity { get; set; }
        public DateTime ReplacedDate { get; set; }
        public string ReplacedBy { get; set; }
        public string Status { get; set; }
        public string Remarks { get; set; }

        /// <summary>
        /// Số lượng thực tế sử dụng
        /// </summary>
        public int? ActualQuantityUsed { get; set; }

        /// <summary>
        /// Số lượng thừa cần trả lại
        /// </summary>
        public int? QuantityToReturn { get; set; }

        /// <summary>
        /// Ngày trả lại
        /// </summary>
        public DateTime? ReturnedDate { get; set; }

        /// <summary>
        /// Người xác nhận trả lại (nhân viên kho)
        /// </summary>
        public string? ReturnConfirmedBy { get; set; }

        /// <summary>
        /// Ghi chú về trả lại
        /// </summary>
        public string? ReturnRemarks { get; set; }

        public string EquipmentName { get; set; }
        public string EquipmentCode { get; set; }
        public string PartName { get; set; }
        public string PartNumber { get; set; }
        public string ReplacedByUserName { get; set; } = null!;
        public string? ReplacedByEmail { get; set; }
    }
}
