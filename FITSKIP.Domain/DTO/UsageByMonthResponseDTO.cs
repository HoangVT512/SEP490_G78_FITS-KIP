using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Domain.DTO
{
    public class UsageByMonthResponseDTO
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public int TotalQuantity { get; set; }
        public List<PartUsageDetailDTO> Parts { get; set; } = new List<PartUsageDetailDTO>();
    }
}
