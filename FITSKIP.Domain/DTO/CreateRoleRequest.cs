using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Domain.DTO
{
    public class CreateRoleRequest
    {
        public string Id { get; set; }
        public string Name { get; set; } = null!;
        public string NormalizedName { get; set; } = null!;
        public string ConcurrencyStamp { get; set; }
    }
}
