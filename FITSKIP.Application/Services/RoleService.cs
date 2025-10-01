using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Application.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository roleRepository;

        public RoleService(IRoleRepository roleRepository)
        {
            this.roleRepository = roleRepository;
        }
        public Task<IdentityRole> CreateRoleAsync(IdentityRole role, CancellationToken cancellationToken = default)=> roleRepository.CreateRoleAsync(role, cancellationToken);

        public Task<IdentityRole?> DeleteRoleAsync(string id, CancellationToken cancellationToken = default) => roleRepository.DeleteRoleAsync(id, cancellationToken);

        public Task<IdentityRole?> GetRoleByIdAsync(string id, CancellationToken cancellationToken = default)=> roleRepository.GetRoleByIdAsync(id, cancellationToken);

        public Task<IReadOnlyList<IdentityRole>> GetRolesAsync(CancellationToken cancellationToken = default)=> roleRepository.GetRolesAsync(cancellationToken);

        public Task<IdentityRole?> UpdateRoleAsync(IdentityRole role, CancellationToken cancellationToken = default)=> roleRepository.UpdateRoleAsync(role, cancellationToken);
    }
}
