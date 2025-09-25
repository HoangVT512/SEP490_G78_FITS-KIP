using FITSKIP.Application.Interfaces;
using FITSKIP.Application.Services;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService userService;

    public UsersController(IUserService userService)
    {
        this.userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<User>>> Get(CancellationToken cancellationToken)
    {
        var users = await userService.GetUsersAsync(cancellationToken);
        return Ok(users);
    }
    // GET: https://localhost:7003/api/Users/{fullName}
    [HttpGet]
    [Route("{fullName}")]
    public async Task<IActionResult> GetUserByFullName(string fullName, CancellationToken cancellationToken)
    {
        var user = await userService.GetByUsernameAsync(fullName, cancellationToken);
        var response = new UserDTO
        {
            Id = user.Id,
            UserName = user.UserName,
            NormalizedUserName = user.NormalizedUserName,
            NormalizedEmail = user.NormalizedEmail,
            Email = user.Email,
            EmailConfirmed = user.EmailConfirmed,
            PasswordHash = user.PasswordHash,
            SecurityStamp = user.SecurityStamp,
            ConcurrencyStamp = user.ConcurrencyStamp,
            PhoneNumber = user.PhoneNumber,
            PhoneNumberConfirmed = user.PhoneNumberConfirmed,
            TwoFactorEnabled = user.TwoFactorEnabled,
            LockoutEnd = user.LockoutEnd,
            LockoutEnabled = user.LockoutEnabled,
            AccessFailedCount = user.AccessFailedCount,
            FullName = user.FullName,
            Gender = user.Gender,
            EmployeeCode = user.EmployeeCode,
            Position = user.Position,
        };
        return Ok(response);
    }
    // DELETE: https://localhost:7003/api/Users/{id}
    [HttpDelete]
    [Route("{id}")]
    public async Task<IActionResult> DeleteUser(string id, CancellationToken cancellationToken)
    {
        var user = await userService.DeleteUserAsync(id, cancellationToken);
        if (user == null)
        {
            return NotFound();
        }
        var response = new UserDTO
        {
            UserName = user.UserName,
            NormalizedUserName = user.NormalizedUserName,
            NormalizedEmail = user.NormalizedEmail,
            Email = user.Email,
            EmailConfirmed = user.EmailConfirmed,
            PasswordHash = user.PasswordHash,
            SecurityStamp = user.SecurityStamp,
            ConcurrencyStamp = user.ConcurrencyStamp,
            PhoneNumber = user.PhoneNumber,
            PhoneNumberConfirmed = user.PhoneNumberConfirmed,
            TwoFactorEnabled = user.TwoFactorEnabled,
            LockoutEnd = user.LockoutEnd,
            LockoutEnabled = user.LockoutEnabled,
            AccessFailedCount = user.AccessFailedCount,
            FullName = user.FullName,
            Gender = user.Gender,
            EmployeeCode = user.EmployeeCode,
            Position = user.Position,
        };
        return Ok(response);
    }
    // PUT: https://localhost:7003/api/Users/{id}
    [HttpPut]
    [Route("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UserDTO user, CancellationToken cancellationToken)
    {
        var updatedUser = new User
        {
            UserName = user.UserName,
            NormalizedUserName = user.NormalizedUserName,
            NormalizedEmail = user.NormalizedEmail,
            Email = user.Email,
            EmailConfirmed = user.EmailConfirmed,
            PasswordHash = user.PasswordHash,
            SecurityStamp = user.SecurityStamp,
            ConcurrencyStamp = user.ConcurrencyStamp,
            PhoneNumber = user.PhoneNumber,
            PhoneNumberConfirmed = user.PhoneNumberConfirmed,
            TwoFactorEnabled = user.TwoFactorEnabled,
            LockoutEnd = user.LockoutEnd,
            LockoutEnabled = user.LockoutEnabled,
            AccessFailedCount = user.AccessFailedCount,
            FullName = user.FullName,
            Gender = user.Gender,
            EmployeeCode = user.EmployeeCode,
            Position = user.Position,
        };
        updatedUser = await userService.UpdateUserAsync(updatedUser, cancellationToken);
        var response = new UserDTO
        {
            Id = updatedUser.Id,
            UserName = updatedUser.UserName,
            NormalizedUserName = updatedUser.NormalizedUserName,
            NormalizedEmail = updatedUser.NormalizedEmail,
            Email = updatedUser.Email,
            EmailConfirmed = updatedUser.EmailConfirmed,
            PasswordHash = updatedUser.PasswordHash,
            SecurityStamp = updatedUser.SecurityStamp,
            ConcurrencyStamp = updatedUser.ConcurrencyStamp,
            PhoneNumber = updatedUser.PhoneNumber,
            PhoneNumberConfirmed = updatedUser.PhoneNumberConfirmed,
            TwoFactorEnabled = updatedUser.TwoFactorEnabled,
            LockoutEnd = updatedUser.LockoutEnd,
            LockoutEnabled = updatedUser.LockoutEnabled,
            AccessFailedCount = updatedUser.AccessFailedCount,
            FullName = updatedUser.FullName,
            Gender = updatedUser.Gender,
            EmployeeCode = updatedUser.EmployeeCode,
            Position = updatedUser.Position,
        };
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<UserDTO>> CreateUser([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            // Basic validation
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.UserName))
            {
                return BadRequest("Email and UserName are required fields.");
            }

            // Hash password for demo purposes
            var passwordHash = !string.IsNullOrEmpty(request.Password) ?
                Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(request.Password)) :
                null;

            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                UserName = request.UserName,
                NormalizedUserName = request.UserName.ToUpperInvariant(),
                Email = request.Email,
                NormalizedEmail = request.Email.ToUpperInvariant(),
                FullName = request.FullName,
                Gender = request.Gender,
                EmployeeCode = request.EmployeeCode,
                Position = request.Position,
                PhoneNumber = request.PhoneNumber,
                EmailConfirmed = true,
                LockoutEnabled = true,
                PasswordHash = passwordHash,
                SecurityStamp = Guid.NewGuid().ToString(),
                ConcurrencyStamp = Guid.NewGuid().ToString()
            };

            var createdUser = await userService.CreateUserAsync(user, cancellationToken);

            var response = new UserDTO
            {
                Id = createdUser.Id,
                UserName = createdUser.UserName,
                Email = createdUser.Email,
                FullName = createdUser.FullName,
                Gender = createdUser.Gender,
                EmployeeCode = createdUser.EmployeeCode,
                Position = createdUser.Position,
                PhoneNumber = createdUser.PhoneNumber,
                EmailConfirmed = createdUser.EmailConfirmed,
                LockoutEnabled = createdUser.LockoutEnabled
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}



