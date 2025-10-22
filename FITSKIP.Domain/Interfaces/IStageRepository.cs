using FITSKIP.Domain.Entities;

namespace FITSKIP.Domain.Interfaces;

public interface IStageRepository
{
    Task<IReadOnlyList<Stage>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Stage>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<Stage?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Stage> CreateAsync(Stage stage, CancellationToken cancellationToken = default);
    Task<Stage?> UpdateAsync(Stage stage, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Stage>> GetByLineIdAsync(int lineId, CancellationToken cancellationToken = default);
    Task<bool> HasDependenciesAsync(int stageId, CancellationToken cancellationToken = default);
     Task<IReadOnlyList<Stage>> GetStagesByUserLinesAsync(string userId, CancellationToken cancellationToken = default);
}