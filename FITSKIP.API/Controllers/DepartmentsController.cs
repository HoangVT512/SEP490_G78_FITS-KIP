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

        public DepartmentsController(IUserService userService, IDepartmentService departmentService, UserManager<User> userManager)
        {
            _userService = userService;
            this.departmentService = departmentService;
            this.userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments(CancellationToken cancellationToken)
        {
            var departments = await _userService.GetDepartmentsAsync(cancellationToken);
            return Ok(departments);
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
            var validationError = await ValidateManagerAsync(request.ManagerId);
            if (validationError != null) return BadRequest(new { message = validationError });
            var created = await departmentService.CreateAsync(request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = created.DepartmentId }, created);
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<DepartmentDTO>> Update(int id, [FromBody] UpdateDepartmentRequest request, CancellationToken cancellationToken)
        {
            var validationError = await ValidateManagerAsync(request.ManagerId);
            if (validationError != null) return BadRequest(new { message = validationError });
            var updated = await departmentService.UpdateAsync(id, request, cancellationToken);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        private async Task<string?> ValidateManagerAsync(string? managerId)
        {
            if (string.IsNullOrWhiteSpace(managerId)) return "ManagerId là bắt buộc.";
            var user = await userManager.FindByIdAsync(managerId);
            if (user == null) return "Manager không tồn tại.";
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