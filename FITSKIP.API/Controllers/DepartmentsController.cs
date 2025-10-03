using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;

namespace FITSKIP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IDepartmentService departmentService;
        private readonly UserManager<User> userManager;
        private readonly RoleManager<IdentityRole> roleManager;

        public DepartmentsController(IUserService userService, IDepartmentService departmentService, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userService = userService;
            this.departmentService = departmentService;
            this.userManager = userManager;
            this.roleManager = roleManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments(CancellationToken cancellationToken)
        {
            var departments = await _userService.GetDepartmentsAsync(cancellationToken);
            return Ok(departments);
        }

        [HttpGet("active")]
        public async Task<ActionResult<IEnumerable<DepartmentDTO>>> GetActiveDepartments(CancellationToken cancellationToken)
        {
            var departments = await departmentService.GetActiveAsync(cancellationToken);
            return Ok(new { success = true, data = departments });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<DepartmentDTO>> GetById(int id, CancellationToken cancellationToken)
        {
            var item = await departmentService.GetByIdAsync(id, cancellationToken);
            if (item == null) return NotFound();
            return Ok(item);
        }

        [HttpPost]
        public async Task<ActionResult<DepartmentDTO>> Create([FromBody] CreateDepartmentRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var validationError = await ValidateManagerAsync(request.ManagerId, true);
                if (validationError != null) return BadRequest(new { message = validationError });
                var created = await departmentService.CreateAsync(request, cancellationToken);
                return CreatedAtAction(nameof(GetById), new { id = created.DepartmentId }, created);
            }
            catch (InvalidOperationException ex)
            {
                // Trả về thông báo lỗi cụ thể từ service layer
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi tạo phòng ban", details = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<DepartmentDTO>> Update(int id, [FromBody] UpdateDepartmentRequest request, CancellationToken cancellationToken)
        {
            try
            {
                var validationError = await ValidateManagerAsync(request.ManagerId, false);
                if (validationError != null) return BadRequest(new { message = validationError });
                var updated = await departmentService.UpdateAsync(id, request, cancellationToken);
                if (updated == null) return NotFound();
                return Ok(updated);
            }
            catch (InvalidOperationException ex)
            {
                // Trả về thông báo lỗi cụ thể từ service layer
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi cập nhật phòng ban", details = ex.Message });
            }
        }

        private async Task<string?> ValidateManagerAsync(string? managerId, bool isRequired = true)
        {
            if (string.IsNullOrWhiteSpace(managerId))
            {
                return isRequired ? "ManagerId là bắt buộc." : null;
            }
            var user = await userManager.FindByIdAsync(managerId);
            if (user == null) return "Manager không tồn tại.";
            if (!user.IsActive) return "Manager đã bị vô hiệu hóa.";

            // Check if user has QUAN LY role
            var roleName = user.RoleId != null
                ? (await roleManager.FindByIdAsync(user.RoleId))?.Name
                : null;
            if (roleName != "Quản lý") return "Manager phải có role 'Quản lý'.";

            return null;
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            var ok = await departmentService.DeleteAsync(id, cancellationToken);
            if (!ok) return NotFound();
            return NoContent();
        }
    }
}