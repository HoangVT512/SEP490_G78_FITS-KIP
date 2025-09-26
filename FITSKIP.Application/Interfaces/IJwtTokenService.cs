using FITSKIP.Domain.Entities;

namespace FITSKIP.Application.Interfaces;

public interface IJwtTokenService
{
    Task<string> GenerateTokenAsync(User user, IList<string> roles);
    string? GetUserIdFromToken(string token);
}