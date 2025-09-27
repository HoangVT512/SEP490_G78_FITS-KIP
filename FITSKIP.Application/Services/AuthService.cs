using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace FITSKIP.Application.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        // Find user by email or employee code
        var user = await FindUserByEmailOrEmployeeCodeAsync(request.EmailOrEmployeeCode);
        
        if (user == null)
        {
            throw new UnauthorizedAccessException("Thông tin đăng nhập không chính xác");
        }

        // Check password
        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);
        
        if (!result.Succeeded)
        {
            throw new UnauthorizedAccessException("Thông tin đăng nhập không chính xác");
        }

        // Get user roles
        var roles = await _userManager.GetRolesAsync(user);

        // Generate JWT token
        var token = await _jwtTokenService.GenerateTokenAsync(user, roles);

        return new LoginResponse
        {
            Token = token,
            Expiration = DateTime.UtcNow.AddHours(1), // Should match JWT settings
            User = new UserDTO
            {
                Id = user.Id,
                UserName = user.UserName,
                Email = user.Email,
                FullName = user.FullName,
                EmployeeCode = user.EmployeeCode,
                Position = user.Position,
                Gender = user.Gender,
                PhoneNumber = user.PhoneNumber,
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                TwoFactorEnabled = user.TwoFactorEnabled,
                LockoutEnd = user.LockoutEnd?.DateTime,
                LockoutEnabled = user.LockoutEnabled,
                AccessFailedCount = user.AccessFailedCount,
                Roles = roles.ToList()
            }
        };
    }

    public async Task<bool> LogoutAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user != null)
        {
            await _signInManager.SignOutAsync();
            return true;
        }
        return false;
    }

    private async Task<User?> FindUserByEmailOrEmployeeCodeAsync(string emailOrEmployeeCode)
    {
        // First try to find by email
        var user = await _userManager.FindByEmailAsync(emailOrEmployeeCode);
        
        if (user != null)
            return user;

        // If not found by email, try to find by employee code
        var users = _userManager.Users.Where(u => u.EmployeeCode == emailOrEmployeeCode);
        return users.FirstOrDefault();
    }
}