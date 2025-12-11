using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Exceptions;
using FITSKIP.Domain.Interfaces;
using System.Text.RegularExpressions;

namespace FITSKIP.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository repository;
    private readonly IUserRepository userRepository;
    private readonly IRoleRepository roleRepository;

    public DepartmentService(IDepartmentRepository repository, IUserRepository userRepository, IRoleRepository roleRepository)
    {
        this.repository = repository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
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
        // Validate department name
        ValidateDepartmentName(request.DepartmentName);

        // Check for duplicate name
        var existingDepartments = await repository.GetAllAsync(cancellationToken);
        var duplicateDepartment = existingDepartments.FirstOrDefault(d => d.DepartmentName.Trim().ToLower() == request.DepartmentName.Trim().ToLower());
        if (duplicateDepartment != null)
        {
            throw new DepartmentValidationException(
                $"Đã tồn tại phòng ban có tên '{request.DepartmentName.Trim()}'",
                "DEPARTMENT_NAME_EXISTS",
                new { ExistingDepartmentId = duplicateDepartment.DepartmentId, DepartmentName = request.DepartmentName.Trim() });
        }


        // Validate description if provided
        if (!string.IsNullOrWhiteSpace(request.Description))
        {
            ValidateDescription(request.Description);
        }

        var entity = new Department
        {
            DepartmentName = request.DepartmentName.Trim(),
            Description = request.Description?.Trim(),
        };
        var created = await repository.CreateAsync(entity, cancellationToken);
        return MapToDto(created);
    }

    public async Task<DepartmentDTO?> UpdateAsync(int id, UpdateDepartmentRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await repository.GetByIdAsync(id, cancellationToken);
        if (entity == null)
        {
            throw new DepartmentValidationException(
                $"Không tìm thấy phòng ban với ID {id}",
                "DEPARTMENT_NOT_FOUND",
                new { DepartmentId = id });
        }

        // Validate department name
        ValidateDepartmentName(request.DepartmentName);

        // Check for duplicate name (exclude current department)
        var existingDepartments = await repository.GetAllAsync(cancellationToken);
        var duplicateDepartment = existingDepartments.FirstOrDefault(d => d.DepartmentId != id && d.DepartmentName.Trim().ToLower() == request.DepartmentName.Trim().ToLower());
        if (duplicateDepartment != null)
        {
            throw new DepartmentValidationException(
                $"Đã tồn tại phòng ban có tên '{request.DepartmentName.Trim()}'",
                "DEPARTMENT_NAME_EXISTS",
                new { ExistingDepartmentId = duplicateDepartment.DepartmentId, DepartmentName = request.DepartmentName.Trim() });
        }

        // Validate description if provided
        if (!string.IsNullOrWhiteSpace(request.Description))
        {
            ValidateDescription(request.Description);
        }

        entity.DepartmentName = request.DepartmentName.Trim();
        entity.Description = request.Description?.Trim();
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

    private void ValidateDepartmentName(string departmentName)
    {
        // Check if null or empty
        if (string.IsNullOrWhiteSpace(departmentName))
        {
            throw new DepartmentValidationException(
                "Tên phòng ban không được để trống",
                "DEPARTMENT_NAME_REQUIRED");
        }

        // Trim and check again
        departmentName = departmentName.Trim();

        // Check minimum length
        if (departmentName.Length < 2)
        {
            throw new DepartmentValidationException(
                "Tên phòng ban phải có ít nhất 2 ký tự",
                "DEPARTMENT_NAME_TOO_SHORT",
                new { MinLength = 2, ActualLength = departmentName.Length });
        }

        // Check maximum length
        if (departmentName.Length > 100)
        {
            throw new DepartmentValidationException(
                "Tên phòng ban không được vượt quá 100 ký tự",
                "DEPARTMENT_NAME_TOO_LONG",
                new { MaxLength = 100, ActualLength = departmentName.Length });
        }

        // Check for allowed characters (alphanumeric, spaces, hyphens, underscores, Vietnamese characters)
        var allowedPattern = @"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+$";
        if (!Regex.IsMatch(departmentName, allowedPattern))
        {
            throw new DepartmentValidationException(
                "Tên phòng ban chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới",
                "DEPARTMENT_NAME_INVALID_CHARACTERS");
        }
    }

    private async Task ValidateManagerIdAsync(string managerId, CancellationToken cancellationToken = default)
    {
        // Check if user exists
        var user = await userRepository.GetUserByIdAsync(managerId, cancellationToken);
        if (user == null)
        {
            throw new DepartmentValidationException(
                $"Không tìm thấy người quản lý với ID '{managerId}'",
                "MANAGER_NOT_FOUND",
                new { ManagerId = managerId });
        }

        // Check if user has manager role by getting all managers
        var managers = await userRepository.GetUsersByRoleAsync("Quản lý", cancellationToken);
        var hasManagerRole = managers.Any(m => m.Id == managerId);

        if (!hasManagerRole)
        {
            throw new DepartmentValidationException(
                $"Người dùng '{user.FullName}' không có vai trò quản lý",
                "USER_NOT_MANAGER",
                new { ManagerId = managerId, UserName = user.FullName });
        }
    }

    private void ValidateDescription(string description)
    {
        // Check maximum length
        if (description.Length > 500)
        {
            throw new DepartmentValidationException(
                "Mô tả phòng ban không được vượt quá 500 ký tự",
                "DESCRIPTION_TOO_LONG",
                new { MaxLength = 500, ActualLength = description.Length });
        }

        // Basic XSS protection - check for script tags
        if (description.Contains("<script", StringComparison.OrdinalIgnoreCase))
        {
            throw new DepartmentValidationException(
                "Mô tả phòng ban không được chứa mã script",
                "DESCRIPTION_CONTAINS_SCRIPT");
        }
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


