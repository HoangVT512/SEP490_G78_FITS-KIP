using FITSKIP.Domain.Entities;

namespace FITSKIP.Domain.Interfaces;

public interface IUserRepository
{
    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default);
}


