using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Services;

public class StageService : IStageService
{
    private readonly IStageRepository _stageRepository;
    private readonly ILineRepository _lineRepository;

    public StageService(IStageRepository stageRepository, ILineRepository lineRepository)
    {
        _stageRepository = stageRepository;
        _lineRepository = lineRepository;
    }

    public Task<IReadOnlyList<Stage>> GetStagesAsync(CancellationToken cancellationToken = default)
    {
        return _stageRepository.GetAllAsync(cancellationToken);
    }

    public Task<IReadOnlyList<Stage>> GetActiveStagesAsync(CancellationToken cancellationToken = default)
    {
        return _stageRepository.GetActiveAsync(cancellationToken);
    }

    public async Task<Stage> CreateStageAsync(CreateStageRequest request, CancellationToken cancellationToken = default)
    {
        // Get line info for detailed error message
        var line = await _lineRepository.GetByIdAsync(request.LineId, cancellationToken);
        if (line == null)
        {
            throw new InvalidOperationException($"Không tìm thấy chuyền sản xuất với ID: {request.LineId}");
        }

        // Chuẩn hóa tên stage: trim và thay thế nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
        var normalizedStageName = System.Text.RegularExpressions.Regex.Replace(request.StageName.Trim(), @"\s+", " ");

        // Check duplicate stage name in same line
        var existingStages = await _stageRepository.GetByLineIdAsync(request.LineId, cancellationToken);
        var duplicateStage = existingStages.FirstOrDefault(s => 
            System.Text.RegularExpressions.Regex.Replace(s.StageName.Trim(), @"\s+", " ").ToLower() == normalizedStageName.ToLower());
        if (duplicateStage != null)
        {
            throw new InvalidOperationException($"'{line.LineName}' đã có giai đoạn tên '{duplicateStage.StageName}'");
        }

        var stage = new Stage
        {
            StageName = normalizedStageName, // Sử dụng tên đã chuẩn hóa
            LineId = request.LineId,
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

        // Get line info for detailed error message
        var line = await _lineRepository.GetByIdAsync(request.LineId, cancellationToken);
        if (line == null)
        {
            throw new InvalidOperationException($"Không tìm thấy chuyền sản xuất với ID: {request.LineId}");
        }

        // Chuẩn hóa tên stage: trim và thay thế nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
        var normalizedStageName = System.Text.RegularExpressions.Regex.Replace(request.StageName.Trim(), @"\s+", " ");

        // Check duplicate stage name in same line (exclude current stage)
        var existingStages = await _stageRepository.GetByLineIdAsync(request.LineId, cancellationToken);
        var duplicateStage = existingStages.FirstOrDefault(s => s.StageId != id && 
            System.Text.RegularExpressions.Regex.Replace(s.StageName.Trim(), @"\s+", " ").ToLower() == normalizedStageName.ToLower());
        if (duplicateStage != null)
        {
            throw new InvalidOperationException($"'{line.LineName}' đã có giai đoạn tên '{duplicateStage.StageName}'");
        }

        existingStage.StageName = normalizedStageName; // Sử dụng tên đã chuẩn hóa
        existingStage.LineId = request.LineId;
        existingStage.IsActive = request.IsActive;

        return await _stageRepository.UpdateAsync(existingStage, cancellationToken);
    }

    public async Task<Stage?> ToggleStageStatusAsync(int id, CancellationToken cancellationToken = default)
    {
        var existingStage = await _stageRepository.GetByIdAsync(id, cancellationToken);
        if (existingStage == null)
        {
            return null;
        }

        existingStage.IsActive = !existingStage.IsActive;
        return await _stageRepository.UpdateAsync(existingStage, cancellationToken);
    }

    public Task<IReadOnlyList<Stage>> GetStagesByLineAsync(int lineId, CancellationToken cancellationToken = default)
    {
        return _stageRepository.GetByLineIdAsync(lineId, cancellationToken);
    }
}