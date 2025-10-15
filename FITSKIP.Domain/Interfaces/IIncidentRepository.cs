using FITSKIP.Domain.Entities;

namespace FITSKIP.Domain.Interfaces;

public interface IIncidentRepository
{
    Task<IReadOnlyList<IncidentHistory>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IncidentHistory?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IncidentHistory> CreateAsync(IncidentHistory incident, CancellationToken cancellationToken = default);
    Task<IncidentHistory?> UpdateAsync(IncidentHistory incident, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<IncidentHistory>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<IncidentHistory>> GetByLineIdAsync(int lineId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
}