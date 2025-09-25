namespace FITSKIP.Domain.DTO
{
    public class CreateUserRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? Gender { get; set; }
        public string? EmployeeCode { get; set; }
        public string? Position { get; set; }
        public string? PhoneNumber { get; set; }
        public string[]? RoleIds { get; set; }
    }
}