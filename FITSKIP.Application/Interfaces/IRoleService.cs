using FITSKIP.Domain.DTO;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Application.Interfaces
{
    public interface IRoleService
    {
        Task<IReadOnlyList<IdentityRole>> GetRolesAsync(CancellationToken cancellationToken = default);
        Task<IReadOnlyList<RoleDTO>> GetRolesWithUserCountAsync(CancellationToken cancellationToken = default);
        Task<IdentityRole> CreateRoleAsync(IdentityRole role, CancellationToken cancellationToken = default);
        Task<IdentityRole?> UpdateRoleAsync(IdentityRole role, CancellationToken cancellationToken = default);
        Task<IdentityRole?> GetRoleByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<IdentityRole?> DeleteRoleAsync(string id, CancellationToken cancellationToken = default);
    }
}
