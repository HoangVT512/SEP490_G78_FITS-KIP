namespace FITSKIP.Application.Interfaces
{
    public interface ISmsService
    {
        Task<bool> SendSmsAsync(string phoneNumber, string message);
        Task<bool> SendVerificationCodeAsync(string phoneNumber);
        Task<bool> VerifyCodeAsync(string phoneNumber, string code);
    }
}