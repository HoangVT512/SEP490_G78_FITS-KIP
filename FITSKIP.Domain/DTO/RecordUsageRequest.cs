using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Domain.DTO
{
    public class RecordUsageRequest
    {
        /// <summary>
        /// Số lượng thực tế đã sử dụng
        /// </summary>
        public int ActualQuantityUsed { get; set; }

        /// <summary>
        /// Trạng thái sau khi ghi nhận
        /// "Chờ trả lại" nếu có thừa
        /// "Hoàn thành" nếu không thừa
        /// </summary>
        public string Status { get; set; } = null!;
    }
}
