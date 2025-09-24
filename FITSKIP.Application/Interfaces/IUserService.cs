using FITSKIP.Domain.Entities;

namespace FITSKIP.Application.Interfaces;

public interface IUserService
{
    Task<IReadOnlyList<User>> GetUsersAsync(CancellationToken cancellationToken = default);
}


