using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
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
        private readonly IUserRepository userRepository;

        public RoleService(IRoleRepository roleRepository, IUserRepository userRepository)
        {
            this.roleRepository = roleRepository;
            this.userRepository = userRepository;
        }
        public Task<IdentityRole> CreateRoleAsync(IdentityRole role, CancellationToken cancellationToken = default) => roleRepository.CreateRoleAsync(role, cancellationToken);

        public Task<IdentityRole?> DeleteRoleAsync(string id, CancellationToken cancellationToken = default) => roleRepository.DeleteRoleAsync(id, cancellationToken);

        public Task<IdentityRole?> GetRoleByIdAsync(string id, CancellationToken cancellationToken = default) => roleRepository.GetRoleByIdAsync(id, cancellationToken);

        public Task<IReadOnlyList<IdentityRole>> GetRolesAsync(CancellationToken cancellationToken = default) => roleRepository.GetRolesAsync(cancellationToken);

        public Task<IdentityRole?> UpdateRoleAsync(IdentityRole role, CancellationToken cancellationToken = default) => roleRepository.UpdateRoleAsync(role, cancellationToken);

        public async Task<IReadOnlyList<RoleDTO>> GetRolesWithUserCountAsync(CancellationToken cancellationToken = default)
        {
            var roles = await roleRepository.GetRolesAsync(cancellationToken);
            var roleDTOs = new List<RoleDTO>();

            foreach (var role in roles)
            {
                var userCount = 0;
                if (!string.IsNullOrEmpty(role.Name))
                {
                    var users = await userRepository.GetUsersByRoleAsync(role.Name, cancellationToken);
                    userCount = users.Count;
                }

                roleDTOs.Add(new RoleDTO
                {
                    Id = role.Id,
                    Name = role.Name,
                    NormalizedName = role.NormalizedName,
                    ConcurrencyStamp = role.ConcurrencyStamp,
                    UserCount = userCount
                });
            }

            return roleDTOs;
        }
    }
}
