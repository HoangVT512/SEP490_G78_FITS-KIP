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
    private readonly ISmsService _smsService;

    public AuthsController(IAuthService authService, IUserService userService, ISmsService smsService)
    {
        _authService = authService;
        _userService = userService;
        _smsService = smsService;
    }

    /// <summary>
    /// Đăng nhập mobile app (chỉ cần mã nhân viên + dây chuyền)
    /// </summary>
    /// <param name="request">Thông tin đăng nhập mobile</param>
    /// <returns>JWT token và thông tin user + line</returns>
    [HttpPost("mobile-login")]
    [AllowAnonymous]
    public async Task<IActionResult> MobileLogin([FromBody] MobileLoginRequest request)
    {
        try
        {
            var response = await _authService.MobileLoginAsync(request);
            return Ok(new { success = true, data = response, message = "Đăng nhập thành công" });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Đã có lỗi xảy ra trong quá trình đăng nhập", details = ex.Message });
        }
    }

    /// <summary>
    /// Đăng nhập hệ thống</summary>
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

            // Get user's lines
            var userLines = user.UserLines?.Select(ul => new
            {
                userLineId = ul.UserLineId,
                lineId = ul.LineId,
                lineName = ul.Line?.LineName,
                createdAt = ul.CreatedAt
            }).ToList();

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
                departmentId = user.DepartmentId,
                roles = roles,
                userLines = userLines
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
        catch (UnauthorizedAccessException ex)
        {
            // Email not verified
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Không thể gửi OTP", details = ex.Message });
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

    /// <summary>
    /// Gửi email xác thực cho người dùng
    /// </summary>
    [HttpPost("send-email-verification")]
    [Authorize]
    public async Task<IActionResult> SendEmailVerification()
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, message = "Không thể xác định user từ token" });
            }

            var result = await _authService.SendEmailVerificationAsync(userId);

            if (result)
            {
                return Ok(new { success = true, message = "Email xác thực đã được gửi. Vui lòng kiểm tra hộp thư của bạn." });
            }
            else
            {
                return BadRequest(new { success = false, message = "Không thể gửi email xác thực. Email có thể đã được xác thực hoặc không tồn tại." });
            }
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Đã có lỗi xảy ra khi gửi email xác thực", details = ex.Message });
        }
    }

    /// <summary>
    /// Xác thực email từ link trong email
    /// </summary>
    [HttpGet("verify-email")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyEmail([FromQuery] string userId, [FromQuery] string token)
    {
        try
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
            {
                return BadRequest(new { success = false, message = "Thông tin xác thực không hợp lệ" });
            }

            var result = await _authService.VerifyEmailAsync(userId, token);

            if (result)
            {
                return Ok(new { success = true, message = "Email đã được xác thực thành công" });
            }
            else
            {
                return BadRequest(new { success = false, message = "Không thể xác thực email. Token có thể đã hết hạn hoặc không hợp lệ." });
            }
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Đã có lỗi xảy ra khi xác thực email", details = ex.Message });
        }
    }

    /// <summary>
    /// Gửi OTP qua SMS để xác thực số điện thoại (dùng cho Profile)
    /// </summary>
    [HttpPost("send-phone-verification-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> SendPhoneVerificationOtp([FromBody] SendSmsOtpRequest request)
    {
        try
        {
            // Validate phone number format
            if (!IsValidVietnamesePhoneNumber(request.PhoneNumber))
            {
                return BadRequest(new { success = false, message = "Số điện thoại không hợp lệ. Vui lòng sử dụng format +84xxxxxxxxx" });
            }

            var result = await _smsService.SendVerificationCodeAsync(request.PhoneNumber);

            if (result)
                return Ok(new { success = true, message = "Mã OTP đã được gửi qua SMS" });

            return BadRequest(new { success = false, message = "Không thể gửi SMS OTP" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Lỗi khi gửi SMS OTP", details = ex.Message });
        }
    }

    /// <summary>
    /// Gửi OTP qua SMS để đặt lại mật khẩu (Forgot Password)
    /// </summary>
    [HttpPost("forgot-password/send-sms-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> SendForgotPasswordSmsOtp([FromBody] SendSmsOtpRequest request)
    {
        try
        {
            // Validate phone number format
            if (!IsValidVietnamesePhoneNumber(request.PhoneNumber))
            {
                return BadRequest(new { success = false, message = "Số điện thoại không hợp lệ. Vui lòng sử dụng format +84xxxxxxxxx" });
            }

            // Normalize phone number (convert from +84 to 0)
            var normalizedPhone = request.PhoneNumber.StartsWith("+84") 
                ? "0" + request.PhoneNumber.Substring(3) 
                : request.PhoneNumber;

            // Check if phone number exists in database
            var user = await _userService.GetUserByPhoneAsync(normalizedPhone);
            if (user == null)
            {
                return BadRequest(new { success = false, message = "Số điện thoại không có trong hệ thống" });
            }

            // Check if phone number is verified
            if (!user.PhoneNumberConfirmed)
            {
                return BadRequest(new { success = false, message = "Số điện thoại chưa được xác thực. Liên hệ quản lý để được hỗ trợ." });
            }

            var result = await _smsService.SendVerificationCodeAsync(request.PhoneNumber);

            if (result)
                return Ok(new { success = true, message = "Mã OTP đã được gửi qua SMS" });

            return BadRequest(new { success = false, message = "Không thể gửi SMS OTP" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Lỗi khi gửi SMS OTP", details = ex.Message });
        }
    }

    /// <summary>
    /// Xác thực OTP từ SMS
    /// </summary>
    [HttpPost("forgot-password/verify-sms-otp")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifySmsOtp([FromBody] VerifySmsOtpRequest request)
    {
        try
        {
            // Validate phone number format
            if (!IsValidVietnamesePhoneNumber(request.PhoneNumber))
            {
                return BadRequest(new { success = false, message = "Số điện thoại không hợp lệ. Vui lòng sử dụng format +84xxxxxxxxx" });
            }

            var result = await _smsService.VerifyCodeAsync(request.PhoneNumber, request.Code);

            if (result)
            {
                // Normalize phone number (convert from +84 to 0)
                var normalizedPhone = request.PhoneNumber.StartsWith("+84") 
                    ? "0" + request.PhoneNumber.Substring(3) 
                    : request.PhoneNumber;

                // Update PhoneNumberConfirmed if user is logged in (for phone verification)
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                {
                    // This is a phone verification request from logged-in user
                    var user = await _userService.GetUserByIdAsync(userId);
                    if (user != null && user.PhoneNumber?.Trim() == normalizedPhone.Trim())
                    {
                        await _userService.ConfirmPhoneNumberAsync(userId);
                    }
                }

                return Ok(new { success = true, message = "Xác thực SMS OTP thành công" });
            }

            return BadRequest(new { success = false, message = "Mã OTP không hợp lệ hoặc đã hết hạn" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Lỗi khi xác thực SMS OTP", details = ex.Message });
        }
    }

    /// <summary>
    /// Reset mật khẩu sau khi verify OTP thành công qua SMS
    /// </summary>
    [HttpPost("forgot-password/reset-sms")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPasswordWithSms([FromBody] ResetPasswordWithSmsRequest request)
    {
        try
        {
            // Validate phone number format
            if (!IsValidVietnamesePhoneNumber(request.PhoneNumber))
            {
                return BadRequest(new { success = false, message = "Số điện thoại không hợp lệ. Vui lòng sử dụng format +84xxxxxxxxx" });
            }

            // Validate password
            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
            {
                return BadRequest(new { success = false, message = "Mật khẩu mới phải có ít nhất 6 ký tự" });
            }

            // Normalize phone number (convert from +84 to 0)
            var normalizedPhone = request.PhoneNumber.StartsWith("+84") 
                ? "0" + request.PhoneNumber.Substring(3) 
                : request.PhoneNumber;

            // Reset password by phone number
            var result = await _userService.ResetPasswordByPhoneAsync(normalizedPhone, request.NewPassword);

            if (result)
                return Ok(new { success = true, message = "Đặt lại mật khẩu thành công" });

            return BadRequest(new { success = false, message = "Không thể đặt lại mật khẩu. Số điện thoại không tồn tại." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Lỗi khi đặt lại mật khẩu", details = ex.Message });
        }
    }

    /// <summary>
    /// Gửi SMS thông thường
    /// </summary>
    // [HttpPost("send-sms")]
    // [AllowAnonymous]
    // public async Task<IActionResult> SendSms([FromBody] SendSmsRequest request)
    // {
    //     try
    //     {
    //         var result = await _smsService.SendSmsAsync(request.PhoneNumber, request.Message);

    //         if (result)
    //             return Ok(new { success = true, message = "SMS đã được gửi thành công" });

    //         return BadRequest(new { success = false, message = "Không thể gửi SMS" });
    //     }
    //     catch (Exception ex)
    //     {
    //         return BadRequest(new { success = false, message = "Lỗi khi gửi SMS", details = ex.Message });
    //     }
    // }

    private bool IsValidVietnamesePhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrEmpty(phoneNumber))
            return false;

        // Check if starts with +84 and has correct length
        if (phoneNumber.StartsWith("+84") && phoneNumber.Length >= 12 && phoneNumber.Length <= 13)
        {
            // Check if all characters after +84 are digits
            var numberPart = phoneNumber.Substring(3);
            return numberPart.All(char.IsDigit);
        }

        return false;
    }
}

// Request DTOs for SMS functionality
public class SendSmsOtpRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
}

public class VerifySmsOtpRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
}

public class ResetPasswordWithSmsRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class SendSmsRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}