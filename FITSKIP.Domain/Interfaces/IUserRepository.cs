using FITSKIP.Domain.Entities;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Domain.Interfaces;

public interface IUserRepository
{
    Task<IReadOnlyList<UserDTO>> GetUsersWithRolesAsync(CancellationToken cancellationToken = default);
    Task<User> CreateUserAsync(User user, string password, string[]? roleIds = null, CancellationToken cancellationToken = default);
    Task<User> CreateUserWithAssignmentsAsync(CreateUserRequest request, CancellationToken cancellationToken = default);
    Task<User?> GetByUsernameAsync(string fullName, CancellationToken cancellationToken = default);
    Task<User?> UpdateUserAsync(User user, CancellationToken cancellationToken = default);
    Task<UserDTO?> UpdateUserAsync(string id, UpdateUserRequest request, CancellationToken cancellationToken = default);
    Task<User?> GetUserByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<User?> DeleteUserAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Department>> GetDepartmentsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<User>> GetUsersByRoleAsync(string roleName, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<User>> GetActiveTeamLeadsByLineAsync(int lineId, CancellationToken cancellationToken = default);
    Task<User?> UpdateProfileAsync(string userId, UpdateProfileRequest request, CancellationToken cancellationToken = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByEmployeeCodeAsync(string employeeCode, CancellationToken cancellationToken = default);
    Task<bool> ResetPasswordAsync(string userId, string newPassword, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<UserLine>> GetUserLinesAsync(string userId, CancellationToken cancellationToken = default);
}




