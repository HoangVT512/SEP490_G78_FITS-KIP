using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;
using FITSKIP.Domain.DTO;
using System.Text.RegularExpressions;

namespace FITSKIP.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly FitskipDbContext db;
    private readonly UserManager<User> userManager;

    public UserRepository(FitskipDbContext db, UserManager<User> userManager)
    {
        this.db = db;
        this.userManager = userManager;
    }

    private bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }

    private bool IsValidVietnamPhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;

        string pattern = @"^(?:\+84|0)[0-9]{9}$";
        return Regex.IsMatch(phoneNumber, pattern);
    }

    public async Task<User> CreateUserAsync(User user, string password, string[]? roleIds = null, CancellationToken cancellationToken = default)
    {
        // Validation: Check required fields
        if (string.IsNullOrWhiteSpace(user.EmployeeCode))
        {
            throw new ArgumentException("Mã nhân viên là bắt buộc");
        }

        if (string.IsNullOrWhiteSpace(user.FullName))
        {
            throw new ArgumentException("Họ tên là bắt buộc");
        }

        // Validation: Check if email already exists (only when email is provided)
        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            // Validate email format
            if (!IsValidEmail(user.Email))
            {
                throw new ArgumentException("Email không hợp lệ");
            }

            var existingEmail = await db.Users.FirstOrDefaultAsync(u => u.Email == user.Email, cancellationToken);
            if (existingEmail != null)
            {
                throw new ArgumentException($"Email '{user.Email}' đã tồn tại trong hệ thống");
            }
        }
        else
        {
            // Normalize blank emails to null so DB doesn't store empty string
            user.Email = null;
        }

        // Validation: Check if employee code already exists
        if (!string.IsNullOrEmpty(user.EmployeeCode))
        {
            var existingEmployeeCode = await db.Users.FirstOrDefaultAsync(u => u.EmployeeCode == user.EmployeeCode, cancellationToken);
            if (existingEmployeeCode != null)
            {
                throw new ArgumentException($"Mã nhân viên '{user.EmployeeCode}' đã tồn tại trong hệ thống");
            }
        }

        // Validation: Check phone number (only when provided)
        if (!string.IsNullOrWhiteSpace(user.PhoneNumber))
        {
            // Validate phone number format
            if (!IsValidVietnamPhoneNumber(user.PhoneNumber))
            {
                throw new ArgumentException("Số điện thoại không hợp lệ");
            }

            var existingPhone = await db.Users.FirstOrDefaultAsync(u => u.PhoneNumber == user.PhoneNumber, cancellationToken);
            if (existingPhone != null)
            {
                throw new ArgumentException($"Số điện thoại '{user.PhoneNumber}' đã tồn tại trong hệ thống");
            }
        }
        else
        {
            user.PhoneNumber = null;
        }
        // Assign role to user if roleIds provided (only first role since User now has single RoleId)
        if (roleIds != null && roleIds.Length > 0)
        {
            var roleId = roleIds[0];

            // Try to find role by Id first
            var role = await db.Roles.FirstOrDefaultAsync(r => r.Id == roleId, cancellationToken);

            // If not found by Id, try by Name
            if (role == null)
            {
                role = await db.Roles.FirstOrDefaultAsync(r => r.Name == roleId, cancellationToken);
            }

            // If not found by Name, try by NormalizedName
            if (role == null)
            {
                role = await db.Roles.FirstOrDefaultAsync(r => r.NormalizedName == roleId.ToUpperInvariant(), cancellationToken);
            }

            if (role != null)
            {
                user.RoleId = role.Id;
                await userManager.UpdateAsync(user);
            }
            else
            {
                throw new Exception($"Role với ID/Name '{roleId}' không tồn tại trong hệ thống");
            }
        }

        // Create user with password using Identity
        var createResult = await userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            throw new Exception($"Failed to create user: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
        }
        return user;
    }

    public async Task<User?> DeleteUserAsync(string id, CancellationToken cancellationToken = default)
    {
        var existingUser = await db.Users
            .Include(u => u.Role) // Include the Role navigation property
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        if (existingUser == null)
        {
            throw new ArgumentException($"Không tồn tại user với ID {id} trong hệ thống");
        }

        // Check if the user has the "Quản lý" role
        if (existingUser.Role != null && existingUser.Role.Name.Equals("Quản trị viên", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException("Không thể khóa tài khoản của quản trị viên");
        }

        // Deactivate the user
        existingUser.IsActive = false;

        await db.SaveChangesAsync(cancellationToken);
        return existingUser;
    }

    public async Task<IReadOnlyList<UserDTO>> GetUsersWithRolesAsync(CancellationToken cancellationToken = default)
    {
        var users = await db.Users
            .Include(u => u.UserLines)
                .ThenInclude(ul => ul.Line)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var userDTOs = new List<UserDTO>();
        foreach (var user in users)
        {
            var roleName = user.RoleId != null
                ? (await db.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Id == user.RoleId, cancellationToken))?.Name
                : null;
            var roles = roleName != null ? new List<string> { roleName } : new List<string>();

            var userLine = user.UserLines.FirstOrDefault();
            Department? department = null;

            if (userLine?.Line != null)
            {
                department = await db.Departments
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.DepartmentId == userLine.Line.DepartmentId, cancellationToken);
            }
            else if (user.DepartmentId.HasValue)
            {
                department = await db.Departments
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.DepartmentId == user.DepartmentId.Value, cancellationToken);
            }
            else
            {
                department = await db.Departments
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.ManagerId == user.Id, cancellationToken);
            }

            var userLineIds = user.UserLines.Select(ul => ul.LineId).ToList();

            userDTOs.Add(new UserDTO
            {
                Id = user.Id,
                UserName = user.UserName,
                NormalizedUserName = user.NormalizedUserName,
                Email = user.Email,
                NormalizedEmail = user.NormalizedEmail,
                EmailConfirmed = user.EmailConfirmed,
                PasswordHash = user.PasswordHash,
                SecurityStamp = user.SecurityStamp,
                ConcurrencyStamp = user.ConcurrencyStamp,
                PhoneNumber = user.PhoneNumber,
                PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                TwoFactorEnabled = user.TwoFactorEnabled,
                LockoutEnd = user.LockoutEnd,
                LockoutEnabled = user.LockoutEnabled,
                AccessFailedCount = user.AccessFailedCount,
                FullName = user.FullName,
                EmployeeCode = user.EmployeeCode,
                IsActive = user.IsActive,
                Roles = roles.ToList(),
                DepartmentId = department?.DepartmentId,
                DepartmentName = department?.DepartmentName,
                LineIds = userLineIds
            });
        }
        return userDTOs;
    }

    public Task<User?> GetByUsernameAsync(string fullName, CancellationToken cancellationToken = default)
    {
        var existingUser = db.Users.FirstOrDefaultAsync(u => u.FullName == fullName, cancellationToken);
        if (existingUser == null)
        {
            throw new ArgumentException("A user with the same username does not exist.");
        }
        return existingUser;
    }

    public Task<User?> GetUserByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var existingUser = db.Users
            .Include(u => u.UserLines)
            .ThenInclude(ul => ul.Line)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        return existingUser;
    }

    public async Task<User?> UpdateUserAsync(User user, CancellationToken cancellationToken = default)
    {
        var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Id == user.Id, cancellationToken);
        if (existingUser == null)
        {
            throw new ArgumentException("A user with the same ID does not exist.");
        }
        db.Users.Entry(existingUser).CurrentValues.SetValues(user);
        await db.SaveChangesAsync(cancellationToken);
        return existingUser;
    }

    public async Task<UserDTO?> UpdateUserAsync(string id, UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var existingUser = await db.Users
            .Include(u => u.Role) // Include the Role navigation property
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        if (existingUser == null)
        {
            throw new ArgumentException($"Không tồn tại user với ID {id} trong hệ thống");
        }
        // Validation: Check required fields
        if (string.IsNullOrWhiteSpace(request.EmployeeCode))
        {
            throw new ArgumentException("Mã nhân viên là bắt buộc");
        }

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            throw new ArgumentException("Họ tên là bắt buộc");
        }

        // Validation: Check if email already exists (only when email is provided)
        if (!string.IsNullOrWhiteSpace(request.Email))
        {
            // Validate email format
            if (!IsValidEmail(request.Email))
            {
                throw new ArgumentException("Email không hợp lệ");
            }

            var existingEmail = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.Id != id, cancellationToken);
            if (existingEmail != null)
            {
                throw new ArgumentException($"Email '{request.Email}' đã tồn tại trong hệ thống");
            }
        }
        else
        {
            // Normalize blank emails to null so DB doesn't store empty string
            request.Email = null;
        }

        // Validation: Check if employee code already exists
        if (!string.IsNullOrEmpty(request.EmployeeCode))
        {
            var existingEmployeeCode = await db.Users.FirstOrDefaultAsync(u => u.EmployeeCode == request.EmployeeCode && u.Id != id, cancellationToken);
            if (existingEmployeeCode != null)
            {
                throw new ArgumentException($"Mã nhân viên '{request.EmployeeCode}' đã tồn tại trong hệ thống");
            }
        }

        // Validation: Check phone number (only when provided)
        if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            // Validate phone number format
            if (!IsValidVietnamPhoneNumber(request.PhoneNumber))
            {
                throw new ArgumentException("Số điện thoại không hợp lệ");
            }

            var existingPhone = await db.Users.FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber && u.Id != id, cancellationToken);
            if (existingPhone != null)
            {
                throw new ArgumentException($"Số điện thoại '{request.PhoneNumber}' đã tồn tại trong hệ thống");
            }
        }
        else
        {
            request.PhoneNumber = null;
        }
        // Check if the current role is "Quản trị viên"
        if (existingUser.Role != null && existingUser.Role.Name.Equals("Quản trị viên", StringComparison.OrdinalIgnoreCase))
        {
            // Prevent role updates for "Quản trị viên" - only block if trying to change to a different role
            if (request.RoleIds != null && request.RoleIds.Length > 0)
            {
                var requestedRoleId = request.RoleIds[0];
                var requestedRole = await db.Roles.FirstOrDefaultAsync(
                    r => r.Id == requestedRoleId || r.Name == requestedRoleId,
                    cancellationToken);

                if (requestedRole != null && requestedRole.Id != existingUser.RoleId)
                {
                    throw new ArgumentException("Không thể cập nhật role của người dùng có vai trò 'Quản trị viên'.");
                }
            }
        }

        // Normalize incoming contact fields
        var normalizedEmail = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        var normalizedPhone = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();

        // Validation: Check email format (only if email is provided)
        if (!string.IsNullOrEmpty(normalizedEmail) && !IsValidEmail(normalizedEmail))
        {
            throw new ArgumentException("Email không hợp lệ");
        }

        // Validation: Check phone number format (only if phone number is provided)
        if (!string.IsNullOrEmpty(normalizedPhone) && !IsValidVietnamPhoneNumber(normalizedPhone))
        {
            throw new ArgumentException("Số điện thoại không hợp lệ");
        }

        // Validation: Ensure the desired role is valid
        if (request.RoleIds != null && request.RoleIds.Length > 0)
        {
            var roleIdOrName = request.RoleIds[0];
            var role = await db.Roles.FirstOrDefaultAsync(
                r => r.Id == roleIdOrName || r.Name == roleIdOrName,
                cancellationToken);

            if (role == null)
            {
                throw new ArgumentException($"Role '{roleIdOrName}' không tồn tại hoặc không hợp lệ trong hệ thống");
            }

            // Validation: Restricted roles must not have lines
            var restrictedRoles = new[] { "Quản lý", "Kỹ thuật viên", "Kỹ thuật", "Quản trị viên" };
            if (restrictedRoles.Contains(role.Name, StringComparer.OrdinalIgnoreCase) && request.LineIds != null && request.LineIds.Any())
            {
                throw new ArgumentException($"Role '{role.Name}' không được nhập Line.");
            }

            // Check if the role is "Quản lý" and validate department manager assignment
            if (role.Name.Equals("Quản lý", StringComparison.OrdinalIgnoreCase) && request.DepartmentId.HasValue)
            {
                var newDepartment = await db.Departments.FirstOrDefaultAsync(
                    d => d.DepartmentId == request.DepartmentId.Value,
                    cancellationToken);

                if (newDepartment == null)
                {
                    throw new ArgumentException($"Phòng ban với ID '{request.DepartmentId}' không tồn tại.");
                }

                // Check if the department already has a DIFFERENT manager
                if (newDepartment.ManagerId != null && newDepartment.ManagerId != id)
                {
                    throw new ArgumentException($"Phòng ban '{newDepartment.DepartmentName}' đã có quản lý.");
                }

                // Nếu đổi sang phòng ban mới (khác phòng ban hiện tại)
                if (newDepartment.ManagerId != id)
                {
                    // Xóa ManagerId của phòng ban cũ
                    var oldDepartment = await db.Departments
                        .FirstOrDefaultAsync(d => d.ManagerId == id, cancellationToken);

                    if (oldDepartment != null)
                    {
                        oldDepartment.ManagerId = null;
                    }

                    // Gán ManagerId mới
                    newDepartment.ManagerId = id;
                }
                // Nếu newDepartment.ManagerId == id thì không làm gì (giữ nguyên)
            }

            existingUser.RoleId = role.Id;
        }

        // Update user properties
        existingUser.FullName = request.FullName;
        existingUser.Email = normalizedEmail;
        existingUser.PhoneNumber = normalizedPhone;

        // Check if trying to deactivate an admin user
        if (existingUser.Role != null && existingUser.Role.Name == "Quản trị viên" && !request.IsActive)
        {
            // Count active admin users (excluding current user)
            var activeAdminCount = await db.Users
                .Include(u => u.Role)
                .Where(u => u.Role != null && u.Role.Name == "Quản trị viên" && u.IsActive == true && u.Id != id)
                .CountAsync(cancellationToken);

            if (activeAdminCount == 0)
            {
                throw new InvalidOperationException("Không thể vô hiệu hóa tài khoản quản trị viên cuối cùng. Phải có ít nhất một quản trị viên hoạt động trong hệ thống.");
            }
        }

        existingUser.IsActive = request.IsActive;

        // Remove existing UserLines if LineIds are provided
        if (request.LineIds != null)
        {
            var existingUserLines = await db.UserLines
                .Where(ul => ul.UserId == id)
                .ToListAsync(cancellationToken);

            if (existingUserLines.Any())
            {
                db.UserLines.RemoveRange(existingUserLines);
            }

            foreach (var lineId in request.LineIds)
            {
                var line = await db.Lines.FirstOrDefaultAsync(l => l.LineId == lineId, cancellationToken);
                if (line == null)
                {
                    throw new ArgumentException($"Line với ID '{lineId}' không tồn tại trong hệ thống");
                }

                var userLine = new UserLine
                {
                    UserId = id,
                    LineId = lineId,
                    CreatedAt = DateTime.UtcNow
                };
                await db.UserLines.AddAsync(userLine, cancellationToken);
            }
        }

        // Handle department assignment for non-manager roles
        if (request.DepartmentId.HasValue)
        {
            var department = await db.Departments.FirstOrDefaultAsync(d => d.DepartmentId == request.DepartmentId.Value, cancellationToken);
            if (department == null)
            {
                throw new ArgumentException($"Phòng ban với ID '{request.DepartmentId}' không tồn tại.");
            }

            var currentRoleName = existingUser.RoleId != null
                ? (await db.Roles.FirstOrDefaultAsync(r => r.Id == existingUser.RoleId, cancellationToken))?.Name
                : null;

            if (currentRoleName == "Tổ trưởng")
            {
                if (request.LineIds == null || request.LineIds.Count == 0)
                {
                    throw new ArgumentException("Vai trò 'Tổ trưởng' phải có cả phòng ban và dây chuyền.");
                }
                // Nếu có line, set DepartmentId = null
                existingUser.DepartmentId = null;
            }
            else if (currentRoleName != "Quản lý")
            {
                // Cho role khác (không phải Quản lý), nếu không có line, set DepartmentId
                if (request.LineIds == null || request.LineIds.Count == 0)
                {
                    existingUser.DepartmentId = request.DepartmentId.Value;
                }
                else
                {
                    existingUser.DepartmentId = null;
                }
            }
        }
        else
        {
            // Nếu không có DepartmentId, set null (trừ trường hợp Quản lý đã xử lý riêng)
            if (existingUser.Role == null || existingUser.Role.Name != "Quản lý")
            {
                existingUser.DepartmentId = null;
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        // Return updated UserDTO
        var roleName = existingUser.RoleId != null
            ? (await db.Roles.FirstOrDefaultAsync(r => r.Id == existingUser.RoleId, cancellationToken))?.Name
            : null;

        var userLines = await db.UserLines
            .Include(ul => ul.Line)
            .Where(ul => ul.UserId == id)
            .ToListAsync(cancellationToken);

        var userLineIds = userLines.Select(ul => ul.LineId).ToList();

        return new UserDTO
        {
            Id = existingUser.Id,
            UserName = existingUser.UserName,
            FullName = existingUser.FullName,
            Email = existingUser.Email,
            PhoneNumber = existingUser.PhoneNumber,
            IsActive = existingUser.IsActive,
            Roles = roleName != null ? new List<string> { roleName } : new List<string>(),
            LineIds = userLineIds
        };
    }

    public async Task<IReadOnlyList<Department>> GetDepartmentsAsync(CancellationToken cancellationToken = default)
    {
        return await db.Departments
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<User>> GetUsersByRoleAsync(string roleName, CancellationToken cancellationToken = default)
    {
        try
        {
            Console.WriteLine($"GetUsersByRoleAsync được gọi với roleName: {roleName}");

            var users = await db.Users
                .Include(u => u.Role)
                .Where(u => u.Role != null && u.Role.Name == roleName)
                .ToListAsync(cancellationToken);

            Console.WriteLine($"Đã tìm thấy {users.Count} users với role {roleName}");

            return users;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Lỗi trong GetUsersByRoleAsync: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return new List<User>();
        }
    }

    public async Task<IReadOnlyList<User>> GetActiveTeamLeadsByLineAsync(int lineId, CancellationToken cancellationToken = default)
    {
        try
        {
            Console.WriteLine($"GetActiveTeamLeadsByLineAsync được gọi với lineId: {lineId}");

            var users = await db.Users
                .Include(u => u.Role)
                .Include(u => u.UserLines)
                .Include(u => u.Department)
                .Where(u => u.Role != null && u.Role.Name == "Tổ trưởng" && u.IsActive == true)
                .Where(u => u.UserLines.Any(ul => ul.LineId == lineId))
                .ToListAsync(cancellationToken);

            Console.WriteLine($"Đã tìm thấy {users.Count} team leads hoạt động cho line {lineId}");

            return users;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Lỗi trong GetActiveTeamLeadsByLineAsync: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return new List<User>();
        }
    }

    public async Task<User?> UpdateProfileAsync(string userId, UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        try
        {
            var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
            if (existingUser == null)
            {
                throw new ArgumentException("Không tìm thấy người dùng với ID này.");
            }

            var normalizedEmailProfile = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
            var normalizedPhoneProfile = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();

            // Validation: Check email format
            if (!string.IsNullOrEmpty(normalizedEmailProfile) && !IsValidEmail(normalizedEmailProfile))
            {
                throw new ArgumentException("Email không hợp lệ");
            }

            // Validation: Check phone number format
            if (!string.IsNullOrEmpty(normalizedPhoneProfile) && !IsValidVietnamPhoneNumber(normalizedPhoneProfile))
            {
                throw new ArgumentException("Số điện thoại không hợp lệ");
            }

            // Validation: Check if email is already taken by another user
            if (!string.IsNullOrWhiteSpace(normalizedEmailProfile))
            {
                var emailExists = await db.Users.AnyAsync(u => u.Email == normalizedEmailProfile && u.Id != userId, cancellationToken);
                if (emailExists)
                {
                    throw new ArgumentException($"Email '{normalizedEmailProfile}' đã có người dùng sử dụng, không được dùng.");
                }
            }

            // Validation: Check if phone number is already taken by another user
            if (!string.IsNullOrWhiteSpace(normalizedPhoneProfile))
            {
                var phoneExists = await db.Users.AnyAsync(u => u.PhoneNumber == normalizedPhoneProfile && u.Id != userId, cancellationToken);
                if (phoneExists)
                {
                    throw new ArgumentException($"Số điện thoại '{normalizedPhoneProfile}' đã có người dùng sử dụng, không được dùng.");
                }
            }

            // Update editable fields
            existingUser.FullName = request.FullName;

            // Check if email is being changed
            if (existingUser.Email != normalizedEmailProfile)
            {
                existingUser.EmailConfirmed = false;
            }

            // Check if phone number is being changed
            if (existingUser.PhoneNumber != normalizedPhoneProfile)
            {
                existingUser.PhoneNumberConfirmed = false;
            }

            existingUser.Email = normalizedEmailProfile;
            existingUser.NormalizedEmail = normalizedEmailProfile?.ToUpperInvariant();
            existingUser.PhoneNumber = normalizedPhoneProfile;

            await db.SaveChangesAsync(cancellationToken);
            return existingUser;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"UpdateProfile Error: {ex.Message}");
            throw;
        }
    }

    public async Task<User> CreateUserWithAssignmentsAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        // Validation: Check required fields
        if (string.IsNullOrWhiteSpace(request.EmployeeCode))
        {
            throw new ArgumentException("Mã nhân viên là bắt buộc");
        }

        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            throw new ArgumentException("Họ tên là bắt buộc");
        }

        var userName = request.EmployeeCode;
        var normalizedEmail = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        var normalizedPhone = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();

        // Validation: Check email format (only if email is provided)
        if (!string.IsNullOrEmpty(normalizedEmail) && !IsValidEmail(normalizedEmail))
        {
            throw new ArgumentException("Email không hợp lệ");
        }

        // Validation: Check phone number format (only if phone number is provided)
        if (!string.IsNullOrEmpty(normalizedPhone) && !IsValidVietnamPhoneNumber(normalizedPhone))
        {
            throw new ArgumentException("Số điện thoại không hợp lệ");
        }

        // Start a transaction
        using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            // Validate department and role before creating the user
            if (request.RoleIds != null && request.RoleIds.Length > 0)
            {
                var roleId = request.RoleIds[0];
                var role = await db.Roles.FirstOrDefaultAsync(r => r.Id == roleId || r.Name == roleId, cancellationToken);

                if (role == null)
                {
                    throw new ArgumentException($"Role với ID/Name '{roleId}' không tồn tại.");
                }

                // Validation: Restricted roles must not have lines
                var restrictedRoles = new[] { "Quản lý", "Kỹ thuật viên", "Kỹ thuật", "Quản trị viên" };
                if (restrictedRoles.Contains(role.Name, StringComparer.OrdinalIgnoreCase) && request.LineIds != null && request.LineIds.Length > 0)
                {
                    throw new ArgumentException($"Role '{role.Name}' không được nhập Line.");
                }

                // Additional validation for "Quản lý" role
                if (role.Name == "Quản lý" && request.DepartmentId.HasValue)
                {
                    var departmentToManage = await db.Departments.FirstOrDefaultAsync(d => d.DepartmentId == request.DepartmentId.Value, cancellationToken);
                    if (departmentToManage == null)
                    {
                        throw new ArgumentException($"Department với ID '{request.DepartmentId}' không tồn tại.");
                    }

                    if (departmentToManage.ManagerId != null)
                    {
                        throw new ArgumentException($"Phòng ban '{departmentToManage.DepartmentName}' đã có quản lý. Không thể thêm quản lý mới.");
                    }
                }
                // Validate lines exist and belong to the correct department
                if (request.LineIds != null && request.LineIds.Length > 0)
                {
                    // Check if all lines exist
                    var existingLines = await db.Lines
                        .Where(line => request.LineIds.Contains(line.LineId))
                        .ToListAsync(cancellationToken);

                    // Find non-existent lines
                    var nonExistentLineIds = request.LineIds.Except(existingLines.Select(l => l.LineId)).ToList();
                    if (nonExistentLineIds.Any())
                    {
                        var nonExistentIds = string.Join(", ", nonExistentLineIds);
                        throw new ArgumentException($"Các Line với ID '{nonExistentIds}' không tồn tại trong hệ thống.");
                    }

                    // If department is specified, validate lines belong to that department
                    if (request.DepartmentId.HasValue)
                    {
                        var invalidLines = existingLines
                            .Where(line => line.DepartmentId != request.DepartmentId.Value)
                            .ToList();

                        if (invalidLines.Any())
                        {
                            var invalidLineIds = string.Join(", ", invalidLines.Select(line => $"{line.LineId} (thuộc PB: {line.DepartmentId})"));
                            throw new ArgumentException($"Các Line [{invalidLineIds}] không thuộc Phòng ban (ID: {request.DepartmentId}).");
                        }
                    }
                }
            }

            // Create user object
            var user = new User
            {
                UserName = userName,
                Email = normalizedEmail,
                FullName = request.FullName,
                EmployeeCode = request.EmployeeCode,
                PhoneNumber = normalizedPhone
            };

            // Create user using existing method (with all validations)
            var password = "123456";
            var createdUser = await CreateUserAsync(user, password, request.RoleIds, cancellationToken);

            // Handle department assignment
            if (request.DepartmentId.HasValue)
            {
                var department = await db.Departments.FirstOrDefaultAsync(d => d.DepartmentId == request.DepartmentId.Value, cancellationToken);
                if (department == null)
                {
                    throw new ArgumentException($"Department với ID '{request.DepartmentId}' không tồn tại.");
                }

                if (request.LineIds == null || request.LineIds.Length == 0)
                {
                    createdUser.DepartmentId = request.DepartmentId.Value;
                    await db.SaveChangesAsync(cancellationToken);
                }
                else
                {
                    createdUser.DepartmentId = null;

                    foreach (var lineId in request.LineIds)
                    {
                        var userLine = new UserLine
                        {
                            UserId = createdUser.Id,
                            LineId = lineId,
                            CreatedAt = DateTime.UtcNow
                        };
                        await db.UserLines.AddAsync(userLine, cancellationToken);
                    }
                    await db.SaveChangesAsync(cancellationToken);
                }
            }

            // Handle manager assignment
            if (request.RoleIds != null && request.RoleIds.Length > 0 && request.DepartmentId.HasValue)
            {
                var roleId = request.RoleIds[0];
                var role = await db.Roles.FirstOrDefaultAsync(r => r.Id == roleId || r.Name == roleId, cancellationToken);
                if (role != null && role.Name == "Quản lý")
                {
                    var departmentToManage = await db.Departments.FirstOrDefaultAsync(d => d.DepartmentId == request.DepartmentId.Value, cancellationToken);
                    if (departmentToManage != null)
                    {
                        departmentToManage.ManagerId = createdUser.Id;
                        createdUser.DepartmentId = request.DepartmentId.Value;

                        // Save changes to persist the ManagerId update
                        await db.SaveChangesAsync(cancellationToken);
                    }
                }
            }

            // Commit the transaction
            await transaction.CommitAsync(cancellationToken);

            return createdUser;
        }
        catch
        {
            // Rollback the transaction if any exception occurs
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User?> GetByEmployeeCodeAsync(string employeeCode, CancellationToken cancellationToken = default)
    {
        return await db.Users.FirstOrDefaultAsync(u => u.EmployeeCode == employeeCode, cancellationToken);
    }

    public async Task<bool> ResetPasswordAsync(string userId, string newPassword, CancellationToken cancellationToken = default)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user == null)
        {
            return false;
        }

        var removeResult = await userManager.RemovePasswordAsync(user);
        if (!removeResult.Succeeded)
        {
            return false;
        }

        var addResult = await userManager.AddPasswordAsync(user, newPassword);
        return addResult.Succeeded;
    }

    public async Task<IReadOnlyList<UserLine>> GetUserLinesAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await db.UserLines
            .Include(ul => ul.Line)
            .Where(ul => ul.UserId == userId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<User>> GetUsersByRoleIdAsync(string roleId, CancellationToken cancellationToken = default)
    {
        try
        {
            Console.WriteLine($"GetUsersByRoleIdAsync được gọi với roleId: {roleId}");

            var users = await db.Users
                .Include(u => u.Role)
                .Where(u => u.RoleId == roleId && !string.IsNullOrEmpty(u.EmployeeCode))
                .ToListAsync(cancellationToken);

            Console.WriteLine($"Đã tìm thấy {users.Count} users với roleId {roleId}");

            return users;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Lỗi trong GetUsersByRoleIdAsync: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return new List<User>();
        }
    }
}