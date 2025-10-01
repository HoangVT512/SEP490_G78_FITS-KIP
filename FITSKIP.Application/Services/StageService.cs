using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Services;

public class StageService : IStageService
{
    private readonly IStageRepository _stageRepository;

    public StageService(IStageRepository stageRepository)
    {
        _stageRepository = stageRepository;
    }

    public Task<IReadOnlyList<Stage>> GetStagesAsync(CancellationToken cancellationToken = default)
    {
        return _stageRepository.GetAllAsync(cancellationToken);
    }

    public async Task<Stage> CreateStageAsync(CreateStageRequest request, CancellationToken cancellationToken = default)
    {
        // Check duplicate stage name in same line
        var existingStages = await _stageRepository.GetByLineIdAsync(request.LineId, cancellationToken);
        if (existingStages.Any(s => s.StageName.Trim().ToLower() == request.StageName.Trim().ToLower()))
        {
            throw new InvalidOperationException($"Tên giai đoạn '{request.StageName}' đã tồn tại trong dây chuyền này");
        }

        var stage = new Stage
        {
            StageName = request.StageName,
            LineId = request.LineId
        };

        return await _stageRepository.CreateAsync(stage, cancellationToken);
    }

    public Task<Stage?> GetStageByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return _stageRepository.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Stage?> UpdateStageAsync(int id, UpdateStageRequest request, CancellationToken cancellationToken = default)
    {
        var existingStage = await _stageRepository.GetByIdAsync(id, cancellationToken);
        if (existingStage == null)
        {
            return null;
        }

        // Check duplicate stage name in same line (exclude current stage)
        var existingStages = await _stageRepository.GetByLineIdAsync(request.LineId, cancellationToken);
        if (existingStages.Any(s => s.StageId != id && s.StageName.Trim().ToLower() == request.StageName.Trim().ToLower()))
        {
            throw new InvalidOperationException($"Tên giai đoạn '{request.StageName}' đã tồn tại trong dây chuyền này");
        }

        existingStage.StageName = request.StageName;
        existingStage.LineId = request.LineId;

        return await _stageRepository.UpdateAsync(existingStage, cancellationToken);
    }

    public async Task<bool> DeleteStageAsync(int id, CancellationToken cancellationToken = default)
    {
        // Check if stage has any dependencies before deletion
        var hasDependencies = await _stageRepository.HasDependenciesAsync(id, cancellationToken);
        if (hasDependencies)
        {
            throw new InvalidOperationException("Đã có thiết bị trong giai đoạn, không thể xóa");
        }

        return await _stageRepository.DeleteAsync(id, cancellationToken);
    }

    public Task<IReadOnlyList<Stage>> GetStagesByLineAsync(int lineId, CancellationToken cancellationToken = default)
    {
        return _stageRepository.GetByLineIdAsync(lineId, cancellationToken);
    }
}