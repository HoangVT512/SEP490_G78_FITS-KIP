using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Exceptions;

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

    public async Task<IReadOnlyList<Line>> GetActiveLinesAsync(CancellationToken cancellationToken = default)
    {
        var lines = await _lineRepository.GetAllAsync(cancellationToken);
        return lines.Where(l => l.IsActive).ToList();
    }

    public async Task<Line> CreateLineAsync(CreateLineRequest request, CancellationToken cancellationToken = default)
    {
        // Validate line name
        ValidateLineName(request.LineName);

        // Validate line code
        ValidateLineCode(request.LineCode);

        // Validate department exists
        var department = await _departmentRepository.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department == null)
        {
            throw new LineValidationException(
                $"Không tìm thấy phòng ban với ID {request.DepartmentId}",
                "DEPARTMENT_NOT_FOUND",
                new { DepartmentId = request.DepartmentId });
        }

        // Chuẩn hóa tên line: trim và thay thế nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
        var normalizedLineName = System.Text.RegularExpressions.Regex.Replace(request.LineName.Trim(), @"\s+", " ");

        // Chuẩn hóa LineCode: trim và chuyển về uppercase để so sánh case-insensitive
        var normalizedLineCode = request.LineCode.Trim().ToUpper();

        // Check duplicate line name in same department
        var existingLines = await _lineRepository.GetByDepartmentIdAsync(request.DepartmentId, cancellationToken);
        var duplicateLine = existingLines.FirstOrDefault(l =>
            System.Text.RegularExpressions.Regex.Replace(l.LineName.Trim(), @"\s+", " ").ToLower() == normalizedLineName.ToLower());
        if (duplicateLine != null)
        {
            throw new LineValidationException(
                $"Phòng ban '{department.DepartmentName}' đã có chuyền sản xuất tên '{duplicateLine.LineName}'",
                "LINE_NAME_EXISTS_IN_DEPARTMENT",
                new { DepartmentName = department.DepartmentName, ExistingLineName = duplicateLine.LineName, LineName = request.LineName.Trim() });
        }

        // Check duplicate LineCode globally (unique across all lines)
        var existingLineByCode = await _lineRepository.GetByLineCodeAsync(normalizedLineCode, cancellationToken);
        if (existingLineByCode != null)
        {
            throw new LineValidationException(
                $"Mã chuyền '{request.LineCode}' đã tồn tại trong hệ thống",
                "LINE_CODE_EXISTS",
                new { LineCode = request.LineCode.Trim(), ExistingLineId = existingLineByCode.LineId });
        }

        var line = new Line
        {
            LineName = normalizedLineName, // Sử dụng tên đã chuẩn hóa
            LineCode = normalizedLineCode, // Sử dụng mã đã chuẩn hóa
            DepartmentId = request.DepartmentId,
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
            throw new LineValidationException(
                $"Không tìm thấy chuyền sản xuất với ID {id}",
                "LINE_NOT_FOUND",
                new { LineId = id });
        }

        // Validate line name
        ValidateLineName(request.LineName);

        // Validate line code
        ValidateLineCode(request.LineCode);

        // Validate department exists
        var department = await _departmentRepository.GetByIdAsync(request.DepartmentId, cancellationToken);
        if (department == null)
        {
            throw new LineValidationException(
                $"Không tìm thấy phòng ban với ID {request.DepartmentId}",
                "DEPARTMENT_NOT_FOUND",
                new { DepartmentId = request.DepartmentId });
        }

        // Chuẩn hóa tên line: trim và thay thế nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
        var normalizedLineName = System.Text.RegularExpressions.Regex.Replace(request.LineName.Trim(), @"\s+", " ");

        // Chuẩn hóa LineCode: trim và chuyển về uppercase để so sánh case-insensitive
        var normalizedLineCode = request.LineCode.Trim().ToUpper();

        // Check duplicate line name in same department (exclude current line)
        var existingLines = await _lineRepository.GetByDepartmentIdAsync(request.DepartmentId, cancellationToken);
        var duplicateLine = existingLines.FirstOrDefault(l => l.LineId != id &&
            System.Text.RegularExpressions.Regex.Replace(l.LineName.Trim(), @"\s+", " ").ToLower() == normalizedLineName.ToLower());
        if (duplicateLine != null)
        {
            throw new LineValidationException(
                $"Phòng ban '{department.DepartmentName}' đã có chuyền sản xuất tên '{duplicateLine.LineName}'",
                "LINE_NAME_EXISTS_IN_DEPARTMENT",
                new { DepartmentName = department.DepartmentName, ExistingLineName = duplicateLine.LineName, LineName = request.LineName.Trim() });
        }

        // Check duplicate LineCode globally (unique across all lines, exclude current line)
        var existingLineByCode = await _lineRepository.GetByLineCodeAsync(normalizedLineCode, cancellationToken);
        if (existingLineByCode != null && existingLineByCode.LineId != id)
        {
            throw new LineValidationException(
                $"Mã chuyền '{request.LineCode}' đã tồn tại trong hệ thống",
                "LINE_CODE_EXISTS",
                new { LineCode = request.LineCode.Trim(), ExistingLineId = existingLineByCode.LineId });
        }

        // Nếu department thay đổi, remove tất cả UserLines cho line này
        if (existingLine.DepartmentId != request.DepartmentId)
        {
            await _lineRepository.RemoveUserLinesForLineAsync(id, cancellationToken);
        }

        existingLine.LineName = normalizedLineName; // Sử dụng tên đã chuẩn hóa
        existingLine.LineCode = normalizedLineCode; // Sử dụng mã đã chuẩn hóa
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

    public Task<IReadOnlyList<Line>> GetLinesByUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        return _lineRepository.GetLinesByUserAsync(userId, cancellationToken);
    }

    private void ValidateLineName(string lineName)
    {
        // Check if null or empty
        if (string.IsNullOrWhiteSpace(lineName))
        {
            throw new LineValidationException(
                "Tên chuyền sản xuất không được để trống",
                "LINE_NAME_REQUIRED");
        }

        // Trim and check again
        lineName = lineName.Trim();

        // Check minimum length
        if (lineName.Length < 2)
        {
            throw new LineValidationException(
                "Tên chuyền sản xuất phải có ít nhất 2 ký tự",
                "LINE_NAME_TOO_SHORT",
                new { MinLength = 2, ActualLength = lineName.Length });
        }

        // Check maximum length
        if (lineName.Length > 100)
        {
            throw new LineValidationException(
                "Tên chuyền sản xuất không được vượt quá 100 ký tự",
                "LINE_NAME_TOO_LONG",
                new { MaxLength = 100, ActualLength = lineName.Length });
        }

        // Check for allowed characters (alphanumeric, spaces, hyphens, underscores, Vietnamese characters)
        var allowedPattern = @"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+$";
        if (!System.Text.RegularExpressions.Regex.IsMatch(lineName, allowedPattern))
        {
            throw new LineValidationException(
                "Tên chuyền sản xuất chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới",
                "LINE_NAME_INVALID_CHARACTERS");
        }
    }

    private void ValidateLineCode(string lineCode)
    {
        // Check if null or empty
        if (string.IsNullOrWhiteSpace(lineCode))
        {
            throw new LineValidationException(
                "Mã chuyền sản xuất không được để trống",
                "LINE_CODE_REQUIRED");
        }

        // Trim and check again
        lineCode = lineCode.Trim();

        // Check minimum length
        if (lineCode.Length < 2)
        {
            throw new LineValidationException(
                "Mã chuyền sản xuất phải có ít nhất 2 ký tự",
                "LINE_CODE_TOO_SHORT",
                new { MinLength = 2, ActualLength = lineCode.Length });
        }

        // Check maximum length
        if (lineCode.Length > 50)
        {
            throw new LineValidationException(
                "Mã chuyền sản xuất không được vượt quá 50 ký tự",
                "LINE_CODE_TOO_LONG",
                new { MaxLength = 50, ActualLength = lineCode.Length });
        }

        // Check for allowed characters (alphanumeric, hyphens, underscores only - no spaces)
        var allowedPattern = @"^[a-zA-Z0-9\-_]+$";
        if (!System.Text.RegularExpressions.Regex.IsMatch(lineCode, allowedPattern))
        {
            throw new LineValidationException(
                "Mã chuyền sản xuất chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không có khoảng trắng",
                "LINE_CODE_INVALID_CHARACTERS");
        }
    }
}