using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository userRepository;

    public UserService(IUserRepository userRepository)
    {
        this.userRepository = userRepository;
    }

    public Task<User> CreateUserAsync(User user, CancellationToken cancellationToken = default) => userRepository.CreateUserAsync(user, cancellationToken);

    public Task<User?> DeleteUserAsync(string id, CancellationToken cancellationToken = default) => userRepository.DeleteUserAsync(id, cancellationToken);

    public Task<IReadOnlyList<User>> GetUsersAsync(CancellationToken cancellationToken = default)
    {
        return userRepository.GetAllAsync(cancellationToken);
    }
    public Task<User?> GetByUsernameAsync(string fullName, CancellationToken cancellationToken = default) => userRepository.GetByUsernameAsync(fullName, cancellationToken);

    public Task<User?> GetUserByIdAsync(string id, CancellationToken cancellationToken = default) => userRepository.GetUserByIdAsync(id, cancellationToken);

    public Task<User?> UpdateUserAsync(User user, CancellationToken cancellationToken = default) => userRepository.UpdateUserAsync(user, cancellationToken);

    public Task<IReadOnlyList<Department>> GetDepartmentsAsync(CancellationToken cancellationToken = default) => userRepository.GetDepartmentsAsync(cancellationToken);

    public Task<IReadOnlyList<User>> GetUsersByRoleAsync(string roleName, CancellationToken cancellationToken = default) => userRepository.GetUsersByRoleAsync(roleName, cancellationToken);

    public Task<User?> UpdateProfileAsync(string userId, UpdateProfileRequest request, CancellationToken cancellationToken = default) => userRepository.UpdateProfileAsync(userId, request, cancellationToken);
}



