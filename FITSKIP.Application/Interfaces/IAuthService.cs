using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;

namespace FITSKIP.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<bool> LogoutAsync(string userId);
}