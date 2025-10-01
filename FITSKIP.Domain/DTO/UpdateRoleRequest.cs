using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Domain.DTO
{
    public class UpdateRoleRequest
    {
        public string Name { get; set; } = null!;
        public string NormalizedName { get; set; } = null!;
    }
}
