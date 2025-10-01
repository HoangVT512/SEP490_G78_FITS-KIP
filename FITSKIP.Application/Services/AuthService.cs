using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;

namespace FITSKIP.Application.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IEmailService _emailService;
    private readonly IMemoryCache _memoryCache;
    private readonly IConfiguration _configuration;

    public AuthService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IJwtTokenService jwtTokenService,
        IEmailService emailService,
        IMemoryCache memoryCache,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtTokenService = jwtTokenService;
        _emailService = emailService;
        _memoryCache = memoryCache;
        _configuration = configuration;
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

    public async Task<bool> SendForgotPasswordOtpAsync(ForgotPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return false;

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            // Do not reveal whether email exists
            return true;
        }

        var otp = GenerateOtp();
        var ttlMinutes = int.TryParse(_configuration["Otp:ExpireMinutes"], out var m) ? m : 10;
        var cacheKey = GetOtpCacheKey(request.Email);
        _memoryCache.Set(cacheKey, otp, TimeSpan.FromMinutes(ttlMinutes));

        var subject = "Mã OTP đặt lại mật khẩu";
        var html = $@"<p>Xin chào {user.FullName ?? user.UserName},</p>
<p>Mã OTP đặt lại mật khẩu của bạn là: <strong style='font-size:20px'>{otp}</strong></p>
<p>Mã sẽ hết hạn sau {ttlMinutes} phút. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>";

        await _emailService.SendEmailAsync(request.Email, subject, html, $"OTP: {otp}");
        return true;
    }

    public Task<bool> VerifyOtpAsync(VerifyOtpRequest request)
    {
        var cacheKey = GetOtpCacheKey(request.Email);
        if (_memoryCache.TryGetValue<string>(cacheKey, out var stored) && string.Equals(stored, request.Otp, StringComparison.Ordinal))
        {
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public async Task<bool> ResetPasswordWithOtpAsync(ResetPasswordWithOtpRequest request)
    {
        var cacheKey = GetOtpCacheKey(request.Email);
        if (!_memoryCache.TryGetValue<string>(cacheKey, out var stored) || !string.Equals(stored, request.Otp, StringComparison.Ordinal))
        {
            return false;
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            return false;
        }

        // Use Identity reset token to change password securely
        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, resetToken, request.NewPassword);
        if (result.Succeeded)
        {
            _memoryCache.Remove(cacheKey);
            return true;
        }
        return false;
    }

    public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordRequest request)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            // Verify current password
            var isCurrentPasswordValid = await _userManager.CheckPasswordAsync(user, request.CurrentPassword);
            if (!isCurrentPasswordValid)
            {
                throw new UnauthorizedAccessException("Mật khẩu hiện tại không chính xác");
            }

            // Change password
            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            return result.Succeeded;
        }
        catch (UnauthorizedAccessException)
        {
            throw; // Re-throw to preserve the specific error message
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ChangePassword Error: {ex.Message}");
            return false;
        }
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

    private static string GenerateOtp()
    {
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }

    private static string GetOtpCacheKey(string email) => $"otp:reset:{email.ToLowerInvariant()}";
}