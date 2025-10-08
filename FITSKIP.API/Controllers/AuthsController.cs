using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthsController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserService _userService;

    public AuthsController(IAuthService authService, IUserService userService)
    {
        _authService = authService;
        _userService = userService;
    }

    /// <summary>
    /// Đăng nhập hệ thống
    /// </summary>
    /// <param name="request">Thông tin đăng nhập</param>
    /// <returns>JWT token và thông tin user</returns>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Đã có lỗi xảy ra trong quá trình đăng nhập", details = ex.Message });
        }
    }

    /// <summary>
    /// Đăng xuất hệ thống
    /// </summary>
    /// <returns>Kết quả đăng xuất</returns>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        try
        {
            // For logout, we can be more flexible - either with or without token
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                var result = await _authService.LogoutAsync(userId);
                if (!result)
                {
                    return BadRequest(new { message = "Không thể đăng xuất từ server" });
                }
            }

            // Return success regardless - client-side token cleanup is the main thing for JWT
            return Ok(new { message = "Đăng xuất thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Đã có lỗi xảy ra trong quá trình đăng xuất", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy thông tin user hiện tại từ token
    /// </summary>
    /// <returns>Thông tin user</returns>
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            // Debug: Log all claims
            Console.WriteLine("=== DEBUG: All Claims ===");
            foreach (var claim in User.Claims)
            {
                Console.WriteLine($"Type: {claim.Type}, Value: {claim.Value}");
            }
            Console.WriteLine("=== END DEBUG ===");

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Token không chứa thông tin user hợp lệ" });
            }
            // Load full user from database to get current flags like EmailConfirmed/PhoneNumberConfirmed and IsActive
            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return Unauthorized(new { message = "Không thể tìm thấy người dùng từ token" });
            }

            // Check if user account is still active
            if (!user.IsActive)
            {
                return Unauthorized(new { message = "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên." });
            }

            return Ok(new
            {
                id = user.Id,
                userName = user.UserName,
                email = user.Email,
                fullName = user.FullName,
                employeeCode = user.EmployeeCode,
                isActive = user.IsActive,
                emailConfirmed = user.EmailConfirmed,
                phoneNumber = user.PhoneNumber,
                phoneNumberConfirmed = user.PhoneNumberConfirmed,
                roles = roles
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetCurrentUser Error: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return BadRequest(new { message = "Không thể lấy thông tin user", details = ex.Message });
        }
    }

    /// <summary>
    /// Gửi OTP đặt lại mật khẩu qua email
    /// </summary>
    [HttpPost("forgot-password/send-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> SendForgotPasswordOtp([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            var ok = await _authService.SendForgotPasswordOtpAsync(request);
            return Ok(new { success = ok });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Không thể gửi OTP", details = ex.Message });
        }
    }

    /// <summary>
    /// Xác thực OTP
    /// </summary>
    [HttpPost("forgot-password/verify-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        var ok = await _authService.VerifyOtpAsync(request);
        if (!ok) return BadRequest(new { success = false, message = "OTP không hợp lệ hoặc đã hết hạn" });
        return Ok(new { success = true });
    }

    /// <summary>
    /// Đặt lại mật khẩu bằng OTP
    /// </summary>
    [HttpPost("forgot-password/reset")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPasswordWithOtp([FromBody] ResetPasswordWithOtpRequest request)
    {
        var ok = await _authService.ResetPasswordWithOtpAsync(request);
        if (!ok) return BadRequest(new { success = false, message = "OTP không hợp lệ hoặc thao tác thất bại" });
        return Ok(new { success = true });
    }

    /// <summary>
    /// Đổi mật khẩu khi đã đăng nhập
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        try
        {
            // Validate model state first
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors });
            }

            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, message = "Không thể xác định user từ token. Vui lòng đăng nhập lại." });
            }

            var result = await _authService.ChangePasswordAsync(userId, request);

            if (result)
            {
                return Ok(new { success = true, message = "Đổi mật khẩu thành công" });
            }
            else
            {
                return BadRequest(new { success = false, message = "Đổi mật khẩu thất bại. Vui lòng thử lại." });
            }
        }
        catch (UnauthorizedAccessException ex)
        {
            // Return 400 BadRequest with specific error message for wrong current password
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Đã có lỗi xảy ra trong quá trình đổi mật khẩu", details = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật thông tin profile người dùng
    /// </summary>
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, message = "Không thể xác định user từ token" });
            }

            var result = await _userService.UpdateProfileAsync(userId, request);

            if (result != null)
            {
                // Return updated user info (excluding sensitive data)
                return Ok(new
                {
                    success = true,
                    message = "Cập nhật thông tin thành công",
                    user = new
                    {
                        id = result.Id,
                        userName = result.UserName,
                        email = result.Email,
                        emailConfirmed = result.EmailConfirmed,
                        fullName = result.FullName,
                        phoneNumber = result.PhoneNumber,
                        phoneNumberConfirmed = result.PhoneNumberConfirmed,
                        employeeCode = result.EmployeeCode
                    }
                });
            }
            else
            {
                return BadRequest(new { success = false, message = "Cập nhật thông tin thất bại" });
            }
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Đã có lỗi xảy ra trong quá trình cập nhật thông tin", details = ex.Message });
        }
    }
}