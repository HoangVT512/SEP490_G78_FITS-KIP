using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces;

public interface IDepartmentService
{
    Task<IReadOnlyList<DepartmentDTO>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DepartmentDTO>> GetActiveAsync(CancellationToken cancellationToken = default);
    Task<DepartmentDTO?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<DepartmentDTO> CreateAsync(CreateDepartmentRequest request, CancellationToken cancellationToken = default);
    Task<DepartmentDTO?> UpdateAsync(int id, UpdateDepartmentRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}



