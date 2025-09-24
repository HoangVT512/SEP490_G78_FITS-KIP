using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;

namespace FITSKIP.Infrastructure.Repositories;

public class InMemoryUserRepository : IUserRepository
{
    private static readonly IReadOnlyList<User> Seed = new List<User>
    {
        new User { Id = 1, Code = "U001", FullName = "Nguyen Van A", Email = "a@example.com" },
        new User { Id = 2, Code = "U002", FullName = "Tran Thi B", Email = "b@example.com" },
        new User { Id = 3, Code = "U003", FullName = "Le Van C", Email = "c@example.com" }
    };

    public Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(Seed);
    }
}


