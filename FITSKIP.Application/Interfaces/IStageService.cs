using FITSKIP.Domain.Entities;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces;

public interface IStageService
{
    Task<IReadOnlyList<Stage>> GetStagesAsync(CancellationToken cancellationToken = default);
    Task<Stage> CreateStageAsync(CreateStageRequest request, CancellationToken cancellationToken = default);
    Task<Stage?> GetStageByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Stage?> UpdateStageAsync(int id, UpdateStageRequest request, CancellationToken cancellationToken = default);
    Task<Stage?> ToggleStageStatusAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Stage>> GetStagesByLineAsync(int lineId, CancellationToken cancellationToken = default);
}