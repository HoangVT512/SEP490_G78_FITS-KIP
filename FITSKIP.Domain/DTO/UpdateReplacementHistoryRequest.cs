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

        public int PartId { get; set; }

        public int Quantity { get; set; }

        public DateTime ReplacedDate { get; set; }

        public string ReplacedBy { get; set; } = null!;

        public string Status { get; set; } = null!;

        public string? Remarks { get; set; }
    }
}
