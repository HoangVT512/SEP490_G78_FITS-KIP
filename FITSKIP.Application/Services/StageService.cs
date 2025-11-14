using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Exceptions;
using System.Text.RegularExpressions;

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
        // Validate stage name
        ValidateStageName(request.StageName);

        // Validate line exists
        var line = await _lineRepository.GetByIdAsync(request.LineId, cancellationToken);
        if (line == null)
        {
            throw new StageValidationException(
                $"Không tìm thấy chuyền sản xuất với ID {request.LineId}",
                "LINE_NOT_FOUND",
                new { LineId = request.LineId });
        }

        // Chuẩn hóa tên stage: trim và thay thế nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
        var normalizedStageName = Regex.Replace(request.StageName.Trim(), @"\s+", " ");

        // Check duplicate stage name in same line
        var existingStages = await _stageRepository.GetByLineIdAsync(request.LineId, cancellationToken);
        var duplicateStage = existingStages.FirstOrDefault(s =>
            Regex.Replace(s.StageName.Trim(), @"\s+", " ").ToLower() == normalizedStageName.ToLower());
        if (duplicateStage != null)
        {
            throw new StageValidationException(
                $"Chuyền '{line.LineName}' đã có giai đoạn tên '{duplicateStage.StageName}'",
                "STAGE_NAME_EXISTS_IN_LINE",
                new { LineName = line.LineName, ExistingStageName = duplicateStage.StageName, StageName = request.StageName.Trim() });
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
            throw new StageValidationException(
                $"Không tìm thấy giai đoạn với ID {id}",
                "STAGE_NOT_FOUND",
                new { StageId = id });
        }

        // Validate stage name
        ValidateStageName(request.StageName);

        // Validate line exists
        var line = await _lineRepository.GetByIdAsync(request.LineId, cancellationToken);
        if (line == null)
        {
            throw new StageValidationException(
                $"Không tìm thấy chuyền sản xuất với ID {request.LineId}",
                "LINE_NOT_FOUND",
                new { LineId = request.LineId });
        }

        // Chuẩn hóa tên stage: trim và thay thế nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
        var normalizedStageName = Regex.Replace(request.StageName.Trim(), @"\s+", " ");

        // Check duplicate stage name in same line (exclude current stage)
        var existingStages = await _stageRepository.GetByLineIdAsync(request.LineId, cancellationToken);
        var duplicateStage = existingStages.FirstOrDefault(s => s.StageId != id &&
            Regex.Replace(s.StageName.Trim(), @"\s+", " ").ToLower() == normalizedStageName.ToLower());
        if (duplicateStage != null)
        {
            throw new StageValidationException(
                $"Chuyền '{line.LineName}' đã có giai đoạn tên '{duplicateStage.StageName}'",
                "STAGE_NAME_EXISTS_IN_LINE",
                new { LineName = line.LineName, ExistingStageName = duplicateStage.StageName, StageName = request.StageName.Trim() });
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

    public Task<IReadOnlyList<Stage>> GetStagesByUserLinesAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _stageRepository.GetStagesByUserLinesAsync(userId, cancellationToken);
    }

    private void ValidateStageName(string stageName)
    {
        // Check if null or empty
        if (string.IsNullOrWhiteSpace(stageName))
        {
            throw new StageValidationException(
                "Tên giai đoạn không được để trống",
                "STAGE_NAME_REQUIRED");
        }

        // Trim and check again
        stageName = stageName.Trim();

        // Check minimum length
        if (stageName.Length < 2)
        {
            throw new StageValidationException(
                "Tên giai đoạn phải có ít nhất 2 ký tự",
                "STAGE_NAME_TOO_SHORT",
                new { MinLength = 2, ActualLength = stageName.Length });
        }

        // Check maximum length
        if (stageName.Length > 100)
        {
            throw new StageValidationException(
                "Tên giai đoạn không được vượt quá 100 ký tự",
                "STAGE_NAME_TOO_LONG",
                new { MaxLength = 100, ActualLength = stageName.Length });
        }

        // Check for allowed characters (alphanumeric, spaces, hyphens, underscores, Vietnamese characters)
        var allowedPattern = @"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+$";
        if (!Regex.IsMatch(stageName, allowedPattern))
        {
            throw new StageValidationException(
                "Tên giai đoạn chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới",
                "STAGE_NAME_INVALID_CHARACTERS");
        }
    }
}