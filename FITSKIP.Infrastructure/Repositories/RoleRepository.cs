using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Infrastructure.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly FitskipDbContext db;

        public RoleRepository(FitskipDbContext db)
        {
            this.db = db;
        }

        public async Task<IdentityRole> CreateRoleAsync(IdentityRole role, CancellationToken cancellationToken = default)
        {
            var existingRole = await db.Roles.FirstOrDefaultAsync(r => r.Name == role.Name);
            if (existingRole != null)
            {
                throw new ArgumentException("Role with the same name already exists.");
            }
            await db.Roles.AddAsync(role, cancellationToken);
            await db.SaveChangesAsync(cancellationToken);
            return role;
        }

        public async Task<IdentityRole?> DeleteRoleAsync(string id, CancellationToken cancellationToken = default)
        {
            var existingRole = await db.Roles.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
            if (existingRole == null)
            {
                throw new ArgumentException("A role with the same id does not exist.");
            }
            db.Roles.Remove(existingRole);
            db.SaveChangesAsync(cancellationToken);
            return existingRole;
        }

        public async Task<IdentityRole?> GetRoleByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var existingRole = await db.Roles.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
            if (existingRole == null)
            {
                throw new ArgumentException("A role with the same id does not exist.");
            }
            return existingRole;
        }

        public async Task<IReadOnlyList<IdentityRole>> GetRolesAsync(CancellationToken cancellationToken = default)
        {
            var roles =await db.Roles.ToListAsync(cancellationToken);
            return roles;
        }

        public async Task<IdentityRole?> UpdateRoleAsync(IdentityRole role, CancellationToken cancellationToken = default)
        {
            var existingRole = await db.Roles.FirstOrDefaultAsync(r => r.Id == role.Id, cancellationToken);
            if (existingRole == null)
            {
                throw new ArgumentException("A role with the same id does not exist.");
            }
            db.Roles.Entry(existingRole).CurrentValues.SetValues(role);
            db.SaveChangesAsync(cancellationToken);
            return existingRole;
        }
    }
}
