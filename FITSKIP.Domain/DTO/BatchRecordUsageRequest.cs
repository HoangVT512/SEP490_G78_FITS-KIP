using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Domain.DTO
{
    public class BatchRecordUsageRequest
    {
        /// <summary>
        /// Danh sách các replacement cần ghi nhận số lượng sử dụng
        /// </summary>
        public List<ReplacementUsageItem> Items { get; set; } = new List<ReplacementUsageItem>();
    }

    public class ReplacementUsageItem
    {
        /// <summary>
        /// ID của replacement history
        /// </summary>
        public int ReplacementId { get; set; }

        /// <summary>
        /// Số lượng thực tế đã sử dụng
        /// </summary>
        public int ActualQuantityUsed { get; set; }

        /// <summary>
        /// Ghi chú (tùy chọn)
        /// </summary>
        public string? Remarks { get; set; }
    }
}