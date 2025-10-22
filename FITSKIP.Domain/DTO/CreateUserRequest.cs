namespace FITSKIP.Domain.DTO
{
    public class CreateUserRequest
    {
        [System.Text.Json.Serialization.JsonIgnore]
        public string UserName { get; set; } = string.Empty; // Deprecated, auto-generated from EmployeeCode
        public string Email { get; set; } = string.Empty;
        [System.Text.Json.Serialization.JsonIgnore]
        public string Password { get; set; } = string.Empty; // Deprecated, default to "123456"
        public string? FullName { get; set; }
        public string? EmployeeCode { get; set; }
        public string? PhoneNumber { get; set; }
        public string[]? RoleIds { get; set; }
        public int? DepartmentId { get; set; } // Optional: assign as manager of this department
        public int[]? LineIds { get; set; } // Optional: assign to these lines
    }
}