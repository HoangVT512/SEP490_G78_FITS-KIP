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
    private readonly RoleManager<IdentityRole> _roleManager;

    public AuthService(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IJwtTokenService jwtTokenService,
        IEmailService emailService,
        IMemoryCache memoryCache,
        IConfiguration configuration,
        RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtTokenService = jwtTokenService;
        _emailService = emailService;
        _memoryCache = memoryCache;
        _configuration = configuration;
        _roleManager = roleManager;
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        // Find user by email or employee code
        var user = await FindUserByEmailOrEmployeeCodeAsync(request.EmailOrEmployeeCode);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Thông tin đăng nhập không chính xác");
        }

        // Check if user account is active
        if (!user.IsActive)
        {
            throw new UnauthorizedAccessException("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.");
        }

        // Check password
        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: false);

        if (!result.Succeeded)
        {
            throw new UnauthorizedAccessException("Thông tin đăng nhập không chính xác");
        }

        // Get user role from RoleId
        var roleName = user.RoleId != null
            ? (await _roleManager.FindByIdAsync(user.RoleId))?.Name
            : null;
        var roles = roleName != null ? new List<string> { roleName } : new List<string>();

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
                PhoneNumber = user.PhoneNumber,
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                TwoFactorEnabled = user.TwoFactorEnabled,
                LockoutEnd = user.LockoutEnd?.DateTime,
                LockoutEnabled = user.LockoutEnabled,
                AccessFailedCount = user.AccessFailedCount,
                IsActive = user.IsActive,
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

        // Check if email is verified
        if (!user.EmailConfirmed)
        {
            throw new UnauthorizedAccessException("Email của bạn chưa được xác thực. Vui lòng liên hệ với ban quản lý để được hỗ trợ hoặc thử cách đăng nhập khác.");
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
                throw new UnauthorizedAccessException("Không tìm thấy người dùng");
            }

            // Verify current password
            var isCurrentPasswordValid = await _userManager.CheckPasswordAsync(user, request.CurrentPassword);
            if (!isCurrentPasswordValid)
            {
                throw new UnauthorizedAccessException("Mật khẩu hiện tại không chính xác");
            }

            // Change password
            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);

            if (!result.Succeeded)
            {
                // Get error messages from Identity
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Không thể đổi mật khẩu: {errors}");
            }

            return true;
        }
        catch (UnauthorizedAccessException)
        {
            throw; // Re-throw to preserve the specific error message
        }
        catch (InvalidOperationException)
        {
            throw; // Re-throw validation errors from Identity
        }
        catch (Exception ex)
        {
            Console.WriteLine($"ChangePassword Error: {ex.Message}");
            throw new Exception("Đã có lỗi xảy ra khi đổi mật khẩu", ex);
        }
    }

    public async Task<bool> SendEmailVerificationAsync(string userId)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null || string.IsNullOrWhiteSpace(user.Email))
            {
                return false;
            }

            // Check if already verified
            if (user.EmailConfirmed)
            {
                return false;
            }

            // Generate email confirmation token
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);

            // Encode token for URL
            var encodedToken = Uri.EscapeDataString(token);

            // Get frontend URL from configuration
            var frontendUrl = _configuration["Frontend:Url"] ?? "http://localhost:3000";
            var verificationLink = $"{frontendUrl}/verify-email?userId={userId}&token={encodedToken}";

            // Send email
            var subject = "Xác thực địa chỉ Email";
            var html = $@"
<html>
<body>
    <h2>Xác thực địa chỉ Email</h2>
    <p>Xin chào {user.FullName ?? user.UserName},</p>
    <p>Vui lòng click vào link bên dưới để xác thực địa chỉ email của bạn:</p>
    <p><a href='{verificationLink}' style='display:inline-block;padding:10px 20px;background-color:#1890ff;color:white;text-decoration:none;border-radius:4px;'>Xác thực Email</a></p>
    <p>Hoặc copy link sau vào trình duyệt:</p>
    <p>{verificationLink}</p>
    <p>Nếu bạn không yêu cầu xác thực này, vui lòng bỏ qua email này.</p>
</body>
</html>";

            await _emailService.SendEmailAsync(user.Email, subject, html, "Xác thực Email");
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"SendEmailVerification Error: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> VerifyEmailAsync(string userId, string token)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return false;
            }

            var result = await _userManager.ConfirmEmailAsync(user, token);
            return result.Succeeded;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"VerifyEmail Error: {ex.Message}");
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