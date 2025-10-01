using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace FITSKIP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RolesController : ControllerBase
    {
        private readonly IRoleService roleService;

        public RolesController(IRoleService roleService)
        {
            this.roleService = roleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await roleService.GetRolesAsync();
            if (roles == null)
            {
                throw new Exception("No roles found");
            }
            var response = new List<RoleDTO>();
            foreach (var role in roles)
            {
                response.Add(new RoleDTO
                {
                    Id = role.Id,
                    Name = role.Name,
                    NormalizedName = role.NormalizedName,
                    ConcurrencyStamp = role.ConcurrencyStamp
                });
            }
            return Ok(response);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetRoleById(string id)
        {
            var role = await roleService.GetRoleByIdAsync(id);
            if (role == null)
            {
                return NotFound();
            }
            var response = new RoleDTO
            {
                Id = role.Id,
                Name = role.Name,
                NormalizedName = role.NormalizedName,
                ConcurrencyStamp = role.ConcurrencyStamp
            };
            return Ok(response);
        }
        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            var role = await roleService.DeleteRoleAsync(id);
            if (role == null)
            {
                return NotFound();
            }
            var response = new RoleDTO
            {
                Id = role.Id,
                Name = role.Name,
                NormalizedName = role.NormalizedName,
                ConcurrencyStamp = role.ConcurrencyStamp
            };
            return Ok(response);
        }
        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            var role = new IdentityRole
            {
                Id = request.Id,
                Name = request.Name,
                NormalizedName = request.NormalizedName,
                ConcurrencyStamp = request.ConcurrencyStamp
            };
            var createdRole = await roleService.CreateRoleAsync(role);
            var response = new RoleDTO
            {
                Id = createdRole.Id,
                Name = createdRole.Name,
                NormalizedName = createdRole.NormalizedName,
                ConcurrencyStamp = createdRole.ConcurrencyStamp
            };
            return Ok(response);
        }
        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> UpdateRole([FromRoute] Guid id, [FromBody] UpdateRoleRequest request)
        {
            var role = new IdentityRole
            {
                Id = id.ToString(),
                Name = request.Name,
                NormalizedName = request.NormalizedName
            };
            var updatedRole = await roleService.UpdateRoleAsync(role);
            if (updatedRole == null)
            {
                return NotFound();
            }
            var response = new RoleDTO
            {
                Id = updatedRole.Id,
                Name = updatedRole.Name,
                NormalizedName = updatedRole.NormalizedName,
                ConcurrencyStamp = updatedRole.ConcurrencyStamp
            };
            return Ok(response);
        }
    }
}