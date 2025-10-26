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
        public int PartID { get; set; }
        public int Quantity { get; set; }
        public DateTime ReplacedDate { get; set; }
        public string ReplacedBy { get; set; }
        public string Status { get; set; }
        public string Remarks { get; set; }

        
        public string EquipmentName { get; set; }
        public string EquipmentCode { get; set; }
        public string PartName { get; set; }
        public string PartNumber { get; set; }
        public string ReplacedByUserName { get; set; } = null!;
        public string? ReplacedByEmail { get; set; }
    }
}
