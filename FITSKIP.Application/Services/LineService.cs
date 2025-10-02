using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Services;

public class LineService : ILineService
{
    private readonly ILineRepository _lineRepository;
    private readonly IDepartmentRepository _departmentRepository;

    public LineService(ILineRepository lineRepository, IDepartmentRepository departmentRepository)
    {
        _lineRepository = lineRepository;
        _departmentRepository = departmentRepository;
    }

    public Task<IReadOnlyList<Line>> GetLinesAsync(CancellationToken cancellationToken = default)
    {
        return _lineRepository.GetAllAsync(cancellationToken);
    }

    public async Task<Line> CreateLineAsync(CreateLineRequest request, CancellationToken cancellationToken = default)
    {
        // Get department info for detailed error message
        var department = await _departmentRepository.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department == null)
        {
            throw new InvalidOperationException($"Không tìm thấy phòng ban với ID: {request.DepartmentId}");
        }

        // Check duplicate line name in same department
        var existingLines = await _lineRepository.GetByDepartmentIdAsync(request.DepartmentId, cancellationToken);
        var duplicateLine = existingLines.FirstOrDefault(l => l.LineName.Trim().ToLower() == request.LineName.Trim().ToLower());
        if (duplicateLine != null)
        {
            throw new InvalidOperationException($"'{department.DepartmentName}' đã có chuyền sản xuất tên '{request.LineName}'");
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

        // Get department info for detailed error message
        var department = await _departmentRepository.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department == null)
        {
            throw new InvalidOperationException($"Không tìm thấy phòng ban với ID: {request.DepartmentId}");
        }

        // Check duplicate line name in same department (exclude current line)
        var existingLines = await _lineRepository.GetByDepartmentIdAsync(request.DepartmentId, cancellationToken);
        var duplicateLine = existingLines.FirstOrDefault(l => l.LineId != id && l.LineName.Trim().ToLower() == request.LineName.Trim().ToLower());
        if (duplicateLine != null)
        {
            throw new InvalidOperationException($"'{department.DepartmentName}' đã có chuyền sản xuất tên '{request.LineName}'");
        }

        existingLine.LineName = request.LineName;
        existingLine.DepartmentId = request.DepartmentId;
        existingLine.IsActive = request.IsActive;

        return await _lineRepository.UpdateAsync(existingLine, cancellationToken);
    }

    public Task<IReadOnlyList<Line>> GetLinesByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return _lineRepository.GetByDepartmentIdAsync(departmentId, cancellationToken);
    }

    public Task<Line?> ToggleLineStatusAsync(int id, CancellationToken cancellationToken = default)
    {
        return _lineRepository.ToggleLineStatusAsync(id, cancellationToken);
    }
}