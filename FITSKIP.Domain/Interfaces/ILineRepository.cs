using FITSKIP.Domain.Entities;

namespace FITSKIP.Domain.Interfaces;

public interface ILineRepository
{
    Task<IReadOnlyList<Line>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Line?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Line> CreateAsync(Line line, CancellationToken cancellationToken = default);
    Task<Line?> UpdateAsync(Line line, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Line>> GetByDepartmentIdAsync(int departmentId, CancellationToken cancellationToken = default);
    Task<bool> HasDependenciesAsync(int lineId, CancellationToken cancellationToken = default);
}