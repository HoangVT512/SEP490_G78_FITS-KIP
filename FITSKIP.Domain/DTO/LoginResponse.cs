namespace FITSKIP.Domain.DTO;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expiration { get; set; }
    public UserDTO User { get; set; } = null!;
}