using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
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
    public IActionResult GetCurrentUser()
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
            var userName = User.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
            var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
            var fullName = User.FindFirst("FullName")?.Value;
            var employeeCode = User.FindFirst("EmployeeCode")?.Value;
            var position = User.FindFirst("Position")?.Value;
            var gender = User.FindFirst("Gender")?.Value;
            var roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value).ToList();

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Token không chứa thông tin user hợp lệ" });
            }

            return Ok(new
            {
                id = userId,
                userName = userName,
                email = email,
                fullName = fullName,
                employeeCode = employeeCode,
                position = position,
                gender = gender,
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
}