namespace FITSKIP.Domain.DTO
{
    public class CreateUserRequest
    {
        public string UserName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? FullName { get; set; }
        public string? EmployeeCode { get; set; }
        public string? PhoneNumber { get; set; }
        public string[]? RoleIds { get; set; }
        public int? DepartmentId { get; set; } // Optional: assign as manager of this department
        public int[]? LineIds { get; set; } // Optional: assign to these lines
    }
}