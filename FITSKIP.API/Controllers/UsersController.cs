using Microsoft.AspNetCore.Mvc;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.Entities;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<User>>> Get(CancellationToken cancellationToken)
    {
        var users = await _userService.GetUsersAsync(cancellationToken);
        return Ok(users);
    }
}


