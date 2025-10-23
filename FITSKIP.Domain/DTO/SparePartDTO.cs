using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Domain.DTO
{
    public class SparePartDTO
    {
        public int PartId { get; set; }

        public string PartNumber { get; set; } = null!;

        public string PartName { get; set; } = null!;

        public string? PartType { get; set; }

        public string? Material { get; set; }

        public string? Specifications { get; set; }

        public string? Supplier { get; set; }

        public decimal? PurchasePrice { get; set; }

        public int Quantity { get; set; }

        public int MinQuantity { get; set; }

        public string? Location { get; set; }

        public string? Warehouse { get; set; }

        public string? UoM { get; set; }

        public string? ReplacementCycle { get; set; }

        public DateTime? DateAdded { get; set; }

        public string? Status { get; set; }

        public string? DocumentUrl { get; set; }

        public bool IsActive { get; set; }

        public int? TotalPurchaseRequest { get; set; }
        public int? TotalReplacementHistory { get; set; }
    }
}
