using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace FITSKIP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DepartmentsController : ControllerBase
    {
        private readonly IUserService _userService;

        public DepartmentsController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments(CancellationToken cancellationToken)
        {
            var departments = await _userService.GetDepartmentsAsync(cancellationToken);
            return Ok(departments);
        }
    }
}