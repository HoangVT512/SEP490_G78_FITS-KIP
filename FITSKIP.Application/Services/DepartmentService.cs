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
        // Chuẩn hóa tên department: trim và thay thế nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
        var normalizedDepartmentName = System.Text.RegularExpressions.Regex.Replace(request.DepartmentName.Trim(), @"\s+", " ");

        // Check duplicate department name
        var existingDepartments = await repository.GetAllAsync(cancellationToken);
        var duplicateDepartment = existingDepartments.FirstOrDefault(d => 
            System.Text.RegularExpressions.Regex.Replace(d.DepartmentName.Trim(), @"\s+", " ").ToLower() == normalizedDepartmentName.ToLower());
        if (duplicateDepartment != null)
        {
            throw new InvalidOperationException($"Đã tồn tại phòng ban có tên '{duplicateDepartment.DepartmentName}'");
        }

        var entity = new Department
        {
            DepartmentName = normalizedDepartmentName, // Sử dụng tên đã chuẩn hóa
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

        // Chuẩn hóa tên department: trim và thay thế nhiều khoảng trắng liên tiếp thành 1 khoảng trắng
        var normalizedDepartmentName = System.Text.RegularExpressions.Regex.Replace(request.DepartmentName.Trim(), @"\s+", " ");

        // Check duplicate department name (exclude current department)
        var existingDepartments = await repository.GetAllAsync(cancellationToken);
        var duplicateDepartment = existingDepartments.FirstOrDefault(d => d.DepartmentId != id && 
            System.Text.RegularExpressions.Regex.Replace(d.DepartmentName.Trim(), @"\s+", " ").ToLower() == normalizedDepartmentName.ToLower());
        if (duplicateDepartment != null)
        {
            throw new InvalidOperationException($"Đã tồn tại phòng ban có tên '{duplicateDepartment.DepartmentName}'");
        }

        entity.DepartmentName = normalizedDepartmentName; // Sử dụng tên đã chuẩn hóa
        entity.ManagerId = request.ManagerId;
        entity.Description = request.Description;
        entity.IsActive = request.IsActive;
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


