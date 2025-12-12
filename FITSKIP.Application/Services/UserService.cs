using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Exceptions;
using System.Text.RegularExpressions;

namespace FITSKIP.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository userRepository;

    public UserService(IUserRepository userRepository)
    {
        this.userRepository = userRepository;
    }

    public Task<User> CreateUserAsync(User user, string password, string[]? roleIds = null, CancellationToken cancellationToken = default) => userRepository.CreateUserAsync(user, password, roleIds, cancellationToken);

    public Task<User?> DeleteUserAsync(string id, CancellationToken cancellationToken = default) => userRepository.DeleteUserAsync(id, cancellationToken);

    public Task<IReadOnlyList<UserDTO>> GetUsersWithRolesAsync(CancellationToken cancellationToken = default)
    {
        return userRepository.GetUsersWithRolesAsync(cancellationToken);
    }

    public Task<User?> GetByUsernameAsync(string fullName, CancellationToken cancellationToken = default) => userRepository.GetByUsernameAsync(fullName, cancellationToken);

    public Task<User?> GetUserByIdAsync(string id, CancellationToken cancellationToken = default) => userRepository.GetUserByIdAsync(id, cancellationToken);

    public Task<User?> UpdateUserAsync(User user, CancellationToken cancellationToken = default) => userRepository.UpdateUserAsync(user, cancellationToken);


    public Task<IReadOnlyList<Department>> GetDepartmentsAsync(CancellationToken cancellationToken = default) => userRepository.GetDepartmentsAsync(cancellationToken);

    public Task<IReadOnlyList<User>> GetUsersByRoleAsync(string roleName, CancellationToken cancellationToken = default) => userRepository.GetUsersByRoleAsync(roleName, cancellationToken);

    public Task<IReadOnlyList<User>> GetActiveTeamLeadsByLineAsync(int lineId, CancellationToken cancellationToken = default) => userRepository.GetActiveTeamLeadsByLineAsync(lineId, cancellationToken);

    public Task<User?> UpdateProfileAsync(string userId, UpdateProfileRequest request, CancellationToken cancellationToken = default) => userRepository.UpdateProfileAsync(userId, request, cancellationToken);

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default) => userRepository.GetByEmailAsync(email, cancellationToken);

    public Task<User?> GetByEmployeeCodeAsync(string employeeCode, CancellationToken cancellationToken = default) => userRepository.GetByEmployeeCodeAsync(employeeCode, cancellationToken);

    public Task<bool> ResetPasswordAsync(string userId, string newPassword, CancellationToken cancellationToken = default) => userRepository.ResetPasswordAsync(userId, newPassword, cancellationToken);

    public Task<bool> ResetPasswordByPhoneAsync(string phoneNumber, string newPassword, CancellationToken cancellationToken = default) => userRepository.ResetPasswordByPhoneAsync(phoneNumber, newPassword, cancellationToken);

    public Task<User?> GetUserByPhoneAsync(string phoneNumber, CancellationToken cancellationToken = default) => userRepository.GetUserByPhoneAsync(phoneNumber, cancellationToken);

    public Task<bool> ConfirmPhoneNumberAsync(string userId, CancellationToken cancellationToken = default) => userRepository.ConfirmPhoneNumberAsync(userId, cancellationToken);

    public Task<IReadOnlyList<UserLine>> GetUserLinesAsync(string userId, CancellationToken cancellationToken = default) => userRepository.GetUserLinesAsync(userId, cancellationToken);

    // Validation-enabled methods
    public async Task<User> CreateUserWithAssignmentsAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        // Validate email
        ValidateEmail(request.Email);

        // Validate full name if provided
        if (!string.IsNullOrWhiteSpace(request.FullName))
        {
            ValidateFullName(request.FullName);
        }

        // Validate employee code if provided
        if (!string.IsNullOrWhiteSpace(request.EmployeeCode))
        {
            ValidateEmployeeCode(request.EmployeeCode);
        }

        // Validate phone number if provided
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            ValidatePhoneNumber(request.PhoneNumber);
        }

        // Check duplicate email
        var existingUserByEmail = await userRepository.GetByEmailAsync(request.Email.Trim().ToLower(), cancellationToken);
        if (existingUserByEmail != null)
        {
            throw new UserValidationException(
                $"Email '{request.Email.Trim()}' đã được sử dụng",
                "USER_EMAIL_EXISTS",
                new { Email = request.Email.Trim(), ExistingUserId = existingUserByEmail.Id });
        }

        // Check duplicate employee code if provided
        if (!string.IsNullOrWhiteSpace(request.EmployeeCode))
        {
            var existingUserByEmployeeCode = await userRepository.GetByEmployeeCodeAsync(request.EmployeeCode.Trim().ToUpper(), cancellationToken);
            if (existingUserByEmployeeCode != null)
            {
                throw new UserValidationException(
                    $"Mã nhân viên '{request.EmployeeCode.Trim()}' đã tồn tại",
                    "USER_EMPLOYEE_CODE_EXISTS",
                    new { EmployeeCode = request.EmployeeCode.Trim(), ExistingUserId = existingUserByEmployeeCode.Id });
            }
        }

        // Validate department if provided
        if (request.DepartmentId.HasValue)
        {
            var departments = await userRepository.GetDepartmentsAsync(cancellationToken);
            var department = departments.FirstOrDefault(d => d.DepartmentId == request.DepartmentId.Value);
            if (department == null)
            {
                throw new UserValidationException(
                    $"Không tìm thấy phòng ban với ID {request.DepartmentId.Value}",
                    "DEPARTMENT_NOT_FOUND",
                    new { DepartmentId = request.DepartmentId.Value });
            }
        }

        return await userRepository.CreateUserWithAssignmentsAsync(request, cancellationToken);
    }

    public async Task<UserDTO?> UpdateUserAsync(string id, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        // Check if user exists
        var existingUser = await userRepository.GetUserByIdAsync(id, cancellationToken);
        if (existingUser == null)
        {
            throw new UserValidationException(
                $"Không tìm thấy người dùng với ID {id}",
                "USER_NOT_FOUND",
                new { UserId = id });
        }

        // Validate email
        ValidateEmail(request.Email);

        // Validate full name if provided
        if (!string.IsNullOrWhiteSpace(request.FullName))
        {
            ValidateFullName(request.FullName);
        }

        // Validate employee code if provided
        if (!string.IsNullOrWhiteSpace(request.EmployeeCode))
        {
            ValidateEmployeeCode(request.EmployeeCode);
        }

        // Validate phone number if provided
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            ValidatePhoneNumber(request.PhoneNumber);
        }

        // Check duplicate email (exclude current user)
        var usersWithRoles = await userRepository.GetUsersWithRolesAsync(cancellationToken);
        var duplicateUserByEmail = usersWithRoles.FirstOrDefault(u => u.Email?.Trim().ToLower() == request.Email.Trim().ToLower() && u.Id != id);
        if (duplicateUserByEmail != null)
        {
            throw new UserValidationException(
                $"Email '{request.Email.Trim()}' đã được sử dụng bởi người dùng khác",
                "USER_EMAIL_EXISTS",
                new { Email = request.Email.Trim(), ExistingUserId = duplicateUserByEmail.Id });
        }

        // Check duplicate employee code if provided (exclude current user)
        if (!string.IsNullOrWhiteSpace(request.EmployeeCode))
        {
            var duplicateUserByEmployeeCode = usersWithRoles.FirstOrDefault(u => u.EmployeeCode?.Trim().ToUpper() == request.EmployeeCode.Trim().ToUpper() && u.Id != id);
            if (duplicateUserByEmployeeCode != null)
            {
                throw new UserValidationException(
                    $"Mã nhân viên '{request.EmployeeCode.Trim()}' đã được sử dụng bởi người dùng khác",
                    "USER_EMPLOYEE_CODE_EXISTS",
                    new { EmployeeCode = request.EmployeeCode.Trim(), ExistingUserId = duplicateUserByEmployeeCode.Id });
            }
        }

        // Validate department if provided
        if (request.DepartmentId.HasValue)
        {
            var departments = await userRepository.GetDepartmentsAsync(cancellationToken);
            var department = departments.FirstOrDefault(d => d.DepartmentId == request.DepartmentId.Value);
            if (department == null)
            {
                throw new UserValidationException(
                    $"Không tìm thấy phòng ban với ID {request.DepartmentId.Value}",
                    "DEPARTMENT_NOT_FOUND",
                    new { DepartmentId = request.DepartmentId.Value });
            }
        }

        return await userRepository.UpdateUserAsync(id, request, cancellationToken);
    }

    private void ValidateEmail(string email)
    {
        // Check if null or empty
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new UserValidationException(
                "Email không được để trống",
                "USER_EMAIL_REQUIRED");
        }

        // Trim and check format
        email = email.Trim();

        // Check maximum length
        if (email.Length > 256)
        {
            throw new UserValidationException(
                "Email không được vượt quá 256 ký tự",
                "USER_EMAIL_TOO_LONG",
                new { MaxLength = 256, ActualLength = email.Length });
        }

        // Check email format
        var emailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
        if (!Regex.IsMatch(email, emailPattern))
        {
            throw new UserValidationException(
                "Email không đúng định dạng",
                "USER_EMAIL_INVALID_FORMAT");
        }
    }

    private void ValidateFullName(string fullName)
    {
        // Check if null or empty
        if (string.IsNullOrWhiteSpace(fullName))
        {
            throw new UserValidationException(
                "Họ tên không được để trống",
                "USER_FULL_NAME_REQUIRED");
        }

        // Trim and check again
        fullName = fullName.Trim();

        // Check minimum length
        if (fullName.Length < 2)
        {
            throw new UserValidationException(
                "Họ tên phải có ít nhất 2 ký tự",
                "USER_FULL_NAME_TOO_SHORT",
                new { MinLength = 2, ActualLength = fullName.Length });
        }

        // Check maximum length
        if (fullName.Length > 100)
        {
            throw new UserValidationException(
                "Họ tên không được vượt quá 100 ký tự",
                "USER_FULL_NAME_TOO_LONG",
                new { MaxLength = 100, ActualLength = fullName.Length });
        }

        // Check for allowed characters (alphanumeric, spaces, hyphens, underscores, Vietnamese characters)
        var allowedPattern = @"^[a-zA-Z\sÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+$";
        if (!Regex.IsMatch(fullName, allowedPattern))
        {
            throw new UserValidationException(
                "Họ tên chỉ được chứa chữ cái, khoảng trắng",
                "USER_FULL_NAME_INVALID_CHARACTERS");
        }
    }

    private void ValidateEmployeeCode(string employeeCode)
    {
        // Check if null or empty
        if (string.IsNullOrWhiteSpace(employeeCode))
        {
            throw new UserValidationException(
                "Mã nhân viên không được để trống",
                "USER_EMPLOYEE_CODE_REQUIRED");
        }

        // Trim and check again
        employeeCode = employeeCode.Trim();

        // Check minimum length
        if (employeeCode.Length < 2)
        {
            throw new UserValidationException(
                "Mã nhân viên phải có ít nhất 2 ký tự",
                "USER_EMPLOYEE_CODE_TOO_SHORT",
                new { MinLength = 2, ActualLength = employeeCode.Length });
        }

        // Check maximum length
        if (employeeCode.Length > 20)
        {
            throw new UserValidationException(
                "Mã nhân viên không được vượt quá 20 ký tự",
                "USER_EMPLOYEE_CODE_TOO_LONG",
                new { MaxLength = 20, ActualLength = employeeCode.Length });
        }

        // Check for allowed characters (alphanumeric, hyphens, underscores only - no spaces)
        var allowedPattern = @"^[a-zA-Z0-9\-_]+$";
        if (!Regex.IsMatch(employeeCode, allowedPattern))
        {
            throw new UserValidationException(
                "Mã nhân viên chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không có khoảng trắng",
                "USER_EMPLOYEE_CODE_INVALID_CHARACTERS");
        }
    }

    private void ValidatePhoneNumber(string phoneNumber)
    {
        // Check if null or empty
        if (string.IsNullOrWhiteSpace(phoneNumber))
        {
            throw new UserValidationException(
                "Số điện thoại không được để trống",
                "USER_PHONE_NUMBER_REQUIRED");
        }

        // Trim and check again
        phoneNumber = phoneNumber.Trim();

        // Check maximum length
        if (phoneNumber.Length > 20)
        {
            throw new UserValidationException(
                "Số điện thoại không được vượt quá 20 ký tự",
                "USER_PHONE_NUMBER_TOO_LONG",
                new { MaxLength = 20, ActualLength = phoneNumber.Length });
        }

        // Check phone number format (Vietnamese phone numbers)
        var phonePattern = @"^(\+84|84|0)[3|5|7|8|9][0-9]{8}$";
        if (!Regex.IsMatch(phoneNumber, phonePattern))
        {
            throw new UserValidationException(
                "Số điện thoại không đúng định dạng (VD: 0987654321 hoặc +84987654321)",
                "USER_PHONE_NUMBER_INVALID_FORMAT");
        }
    }
}






