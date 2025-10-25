using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;

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
            var roles = await roleService.GetRolesWithUserCountAsync();
            return Ok(roles);
        }

        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetRoleById(string id)
        {
            var role = await roleService.GetRoleByIdAsync(id);
            if (role == null)
            {
                return BadRequest(new { message = "Không tìm thấy vai trò với ID: " + id });
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
        // https://localhost:7003/api/roles/{id}
        [HttpDelete]
        [Route("{id}")]
        public async Task<IActionResult> DeleteRole(string id)
        {
            try
            {


                var role = await roleService.DeleteRoleAsync(id);
                if (role == null)
                {
                    ;
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
            catch(Exception ex)
            {
                return BadRequest(new { success = false, message = $"Error: {ex.Message}" });
            }
        }
        [HttpPost]
        public async Task<IActionResult> CreateRole([FromBody] CreateRoleRequest request)
        {
            try
            {
                var role = new IdentityRole
                {
                    Name = request.Name,
                    NormalizedName = request.Name.ToUpperInvariant(),
                    ConcurrencyStamp = Guid.NewGuid().ToString()
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
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> UpdateRole([FromRoute] string id, [FromBody] UpdateRoleRequest request)
        {
            // Preserve or generate a new ConcurrencyStamp to avoid null on update
            var role = new IdentityRole
            {
                Id = id,
                Name = request.Name,
                NormalizedName = request.Name.ToUpper().Replace(" ", " "),
                ConcurrencyStamp = Guid.NewGuid().ToString()
            };
            var updatedRole = await roleService.UpdateRoleAsync(role);
            if (updatedRole == null)
            {
                return BadRequest(new { message = "Không tìm thấy vai trò với ID: " + id });
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