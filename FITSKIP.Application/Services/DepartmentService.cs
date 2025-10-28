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

    public async Task<IReadOnlyList<DepartmentDTO>> GetActiveAsync(CancellationToken cancellationToken = default)
    {
        var items = await repository.GetAllAsync(cancellationToken);
        return items.Where(d => d.IsActive).Select(MapToDto).ToList();
    }

    public async Task<DepartmentDTO?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await repository.GetByIdAsync(id, cancellationToken);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<DepartmentDTO> CreateAsync(CreateDepartmentRequest request, CancellationToken cancellationToken = default)
    {
        // Check duplicate department name
        var existingDepartments = await repository.GetAllAsync(cancellationToken);
        var duplicateDepartment = existingDepartments.FirstOrDefault(d => d.DepartmentName.Trim().ToLower() == request.DepartmentName.Trim().ToLower());
        if (duplicateDepartment != null)
        {
            throw new InvalidOperationException($"Đã tồn tại phòng ban có tên '{request.DepartmentName}'");
        }

        var entity = new Department
        {
            DepartmentName = request.DepartmentName,
            Description = request.Description
        };
        var created = await repository.CreateAsync(entity, cancellationToken);
        return MapToDto(created);
    }

    public async Task<DepartmentDTO?> UpdateAsync(int id, UpdateDepartmentRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;

        // Check duplicate department name (exclude current department)
        var existingDepartments = await repository.GetAllAsync(cancellationToken);
        var duplicateDepartment = existingDepartments.FirstOrDefault(d => d.DepartmentId != id && d.DepartmentName.Trim().ToLower() == request.DepartmentName.Trim().ToLower());
        if (duplicateDepartment != null)
        {
            throw new InvalidOperationException($"Đã tồn tại phòng ban có tên '{request.DepartmentName}'");
        }

        entity.DepartmentName = request.DepartmentName;
        entity.Description = request.Description;
        entity.IsActive = request.IsActive;
        var updated = await repository.UpdateAsync(entity, cancellationToken);
        return updated == null ? null : MapToDto(updated);
    }

    public async Task<DepartmentDTO?> ToggleStatusAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;

        // Toggle IsActive status
        entity.IsActive = !entity.IsActive;
        
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


