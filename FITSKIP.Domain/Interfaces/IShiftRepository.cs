using FITSKIP.Domain.Entities;

namespace FITSKIP.Domain.Interfaces;

public interface IShiftRepository
{
    Task<IReadOnlyList<Shift>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Shift?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
}