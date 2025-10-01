using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;

namespace FITSKIP.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository repository;

    public DepartmentService(IDepartmentRepository repository)
    {
        this.repository = repository;
    }

    public async Task<IReadOnlyList<DepartmentDTO>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var items = await repository.GetAllAsync(cancellationToken);
        return items.Select(MapToDto).ToList();
    }

    public async Task<DepartmentDTO?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await repository.GetByIdAsync(id, cancellationToken);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<DepartmentDTO> CreateAsync(CreateDepartmentRequest request, CancellationToken cancellationToken = default)
    {
        var entity = new Department
        {
            DepartmentName = request.DepartmentName,
            ManagerId = request.ManagerId,
            Description = request.Description
        };
        var created = await repository.CreateAsync(entity, cancellationToken);
        return MapToDto(created);
    }

    public async Task<DepartmentDTO?> UpdateAsync(int id, UpdateDepartmentRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;
        entity.DepartmentName = request.DepartmentName;
        entity.ManagerId = request.ManagerId;
        entity.Description = request.Description;
        var updated = await repository.UpdateAsync(entity, cancellationToken);
        return updated == null ? null : MapToDto(updated);
    }

    public Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        return repository.DeleteAsync(id, cancellationToken);
    }

    private static DepartmentDTO MapToDto(Department d)
    {
        return new DepartmentDTO
        {
            DepartmentId = d.DepartmentId,
            DepartmentName = d.DepartmentName,
            ManagerId = d.ManagerId,
            ManagerName = d.Manager?.FullName,
            Description = d.Description,
            IsActive = d.IsActive
        };
    }

}


