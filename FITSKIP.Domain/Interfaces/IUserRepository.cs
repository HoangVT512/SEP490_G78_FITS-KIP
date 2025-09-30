using FITSKIP.Domain.Entities;

namespace FITSKIP.Domain.Interfaces;

public interface IUserRepository
{
    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<User> CreateUserAsync(User user, CancellationToken cancellationToken = default);
    Task<User?> GetByUsernameAsync(string fullName, CancellationToken cancellationToken = default);
    Task<User?> UpdateUserAsync(User user, CancellationToken cancellationToken = default);
    Task<User?> GetUserByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<User?> DeleteUserAsync(string id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Department>> GetDepartmentsAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<User>> GetUsersByRoleAsync(string roleName, CancellationToken cancellationToken = default);
}


