using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Services;

public class LineService : ILineService
{
    private readonly ILineRepository _lineRepository;

    public LineService(ILineRepository lineRepository)
    {
        _lineRepository = lineRepository;
    }

    public Task<IReadOnlyList<Line>> GetLinesAsync(CancellationToken cancellationToken = default)
    {
        return _lineRepository.GetAllAsync(cancellationToken);
    }

    public async Task<Line> CreateLineAsync(CreateLineRequest request, CancellationToken cancellationToken = default)
    {
        // Check duplicate line name in same department
        var existingLines = await _lineRepository.GetByDepartmentIdAsync(request.DepartmentId, cancellationToken);
        if (existingLines.Any(l => l.LineName.Trim().ToLower() == request.LineName.Trim().ToLower()))
        {
            throw new InvalidOperationException($"Tên chuyền '{request.LineName}' đã tồn tại trong phòng ban này");
        }

        var line = new Line
        {
            LineName = request.LineName,
            DepartmentId = request.DepartmentId,
            IsActive = request.IsActive
        };

        return await _lineRepository.CreateAsync(line, cancellationToken);
    }

    public Task<Line?> GetLineByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return _lineRepository.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Line?> UpdateLineAsync(int id, UpdateLineRequest request, CancellationToken cancellationToken = default)
    {
        var existingLine = await _lineRepository.GetByIdAsync(id, cancellationToken);
        if (existingLine == null)
        {
            return null;
        }

        // Check duplicate line name in same department (exclude current line)
        var existingLines = await _lineRepository.GetByDepartmentIdAsync(request.DepartmentId, cancellationToken);
        if (existingLines.Any(l => l.LineId != id && l.LineName.Trim().ToLower() == request.LineName.Trim().ToLower()))
        {
            throw new InvalidOperationException($"Tên chuyền '{request.LineName}' đã tồn tại trong phòng ban này");
        }

        existingLine.LineName = request.LineName;
        existingLine.DepartmentId = request.DepartmentId;
        existingLine.IsActive = request.IsActive;

        return await _lineRepository.UpdateAsync(existingLine, cancellationToken);
    }

    public async Task<bool> DeleteLineAsync(int id, CancellationToken cancellationToken = default)
    {
        // Check if line has any dependencies before deletion
        var hasDependencies = await _lineRepository.HasDependenciesAsync(id, cancellationToken);
        if (hasDependencies)
        {
            throw new InvalidOperationException("Đã có giai đoạn trong chuyền, không thể xóa");
        }

        return await _lineRepository.DeleteAsync(id, cancellationToken);
    }

    public Task<IReadOnlyList<Line>> GetLinesByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return _lineRepository.GetByDepartmentIdAsync(departmentId, cancellationToken);
    }
}