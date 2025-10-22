using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;

namespace FITSKIP.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<MobileLoginResponse> MobileLoginAsync(MobileLoginRequest request);
    Task<bool> LogoutAsync(string userId);
    Task<bool> SendForgotPasswordOtpAsync(ForgotPasswordRequest request);
    Task<bool> VerifyOtpAsync(VerifyOtpRequest request);
    Task<bool> ResetPasswordWithOtpAsync(ResetPasswordWithOtpRequest request);
    Task<bool> ChangePasswordAsync(string userId, ChangePasswordRequest request);
    Task<bool> SendEmailVerificationAsync(string userId);
    Task<bool> VerifyEmailAsync(string userId, string token);
}