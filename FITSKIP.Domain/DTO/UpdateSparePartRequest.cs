using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Domain.DTO
{
    public class UpdateSparePartRequest
    {
        public string PartNumber { get; set; } = null!;

        public string PartName { get; set; } = null!;

        public int Quantity { get; set; }

        public string? Location { get; set; }

        public string? Status { get; set; }
    }
}
