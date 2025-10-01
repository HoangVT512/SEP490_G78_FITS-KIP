using FITSKIP.Domain.Entities;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces;

public interface ILineService
{
    Task<IReadOnlyList<Line>> GetLinesAsync(CancellationToken cancellationToken = default);
    Task<Line> CreateLineAsync(CreateLineRequest request, CancellationToken cancellationToken = default);
    Task<Line?> GetLineByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Line?> UpdateLineAsync(int id, UpdateLineRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteLineAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Line>> GetLinesByDepartmentAsync(int departmentId, CancellationToken cancellationToken = default);
}