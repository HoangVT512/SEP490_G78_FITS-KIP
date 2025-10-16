using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;
using FITSKIP.Domain.DTO;

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

    public async Task<User> CreateUserAsync(User user, string password, string[]? roleIds = null, CancellationToken cancellationToken = default)
    {
        var existingUser = await db.Users.FirstOrDefaultAsync(u => u.UserName == user.UserName, cancellationToken);
        if (existingUser != null)
        {
            throw new ArgumentException("Người dùng với tên đăng nhập này đã tồn tại.");
        }

        // Only check for duplicate email when an email is provided (non-empty, non-whitespace)
        if (!string.IsNullOrWhiteSpace(user.Email))
        {
            var existingEmail = await db.Users.FirstOrDefaultAsync(u => u.Email == user.Email, cancellationToken);
            if (existingEmail != null)
            {
                throw new ArgumentException("Người dùng với email này đã tồn tại.");
            }
        }
        else
        {
            // Normalize blank emails to null so DB doesn't store empty string
            user.Email = null;
        }

        if (!string.IsNullOrEmpty(user.EmployeeCode))
        {
            var existingEmployeeCode = await db.Users.FirstOrDefaultAsync(u => u.EmployeeCode == user.EmployeeCode, cancellationToken);
            if (existingEmployeeCode != null)
            {
                throw new ArgumentException("Người dùng với mã nhân viên này đã tồn tại.");
            }
        }

        // Phone number: treat blank/whitespace as null and only check duplicates when provided
        if (!string.IsNullOrWhiteSpace(user.PhoneNumber))
        {
            var existingPhone = await db.Users.FirstOrDefaultAsync(u => u.PhoneNumber == user.PhoneNumber, cancellationToken);
            if (existingPhone != null)
            {
                throw new ArgumentException("Người dùng với số điện thoại này đã tồn tại.");
            }
        }
        else
        {
            user.PhoneNumber = null;
        }

        // Create user with password using Identity
        var createResult = await userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            throw new Exception($"Failed to create user: {string.Join(", ", createResult.Errors.Select(e => e.Description))}");
        }

        // Note: User is already added to db by userManager.CreateAsync, no need to AddAsync again

        // Assign role to user if roleIds provided (only first role since User now has single RoleId)
        if (roleIds != null && roleIds.Length > 0)
        {
            var roleId = roleIds[0]; // Only take first role

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

        return user;
    }

    public async Task<User?> DeleteUserAsync(string id, CancellationToken cancellationToken = default)
    {
        var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (existingUser == null)
        {
            return null;
        }
        db.Users.Remove(existingUser);
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
            // Get role name from RoleId
            var roleName = user.RoleId != null
                ? (await db.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Id == user.RoleId, cancellationToken))?.Name
                : null;
            var roles = roleName != null ? new List<string> { roleName } : new List<string>();

            // Resolve department using priority:
            // 1) If user has UserLines -> department of the first line
            // 2) Else if user.DepartmentId is set -> that department
            // 3) Else if user is set as Manager (Department.ManagerId) -> that department
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
                // If user is a manager (has ManagerId set), also check that
                department = await db.Departments
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.ManagerId == user.Id, cancellationToken);
            }

            // Get lines assigned to user
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
        var existingUser = db.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (existingUser == null)
        {
            throw new ArgumentException("A user with the same ID does not exist.");
        }
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
        var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (existingUser == null)
        {
            return null;
        }

        // Normalize incoming contact fields: convert empty/whitespace to null so DB stores NULL instead of empty string
        var normalizedEmail = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        var normalizedPhone = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();

        // Determine desired UserName: priority -> explicit request.UserName, then request.EmployeeCode, then keep existing
        string? desiredUserName = null;
        if (!string.IsNullOrWhiteSpace(request.UserName))
        {
            desiredUserName = request.UserName.Trim();
        }
        else if (!string.IsNullOrWhiteSpace(request.EmployeeCode))
        {
            // If user didn't explicitly set UserName, prefer EmployeeCode as username when provided
            desiredUserName = request.EmployeeCode.Trim();
        }
        else
        {
            desiredUserName = existingUser.UserName;
        }

        var normalizedUserName = desiredUserName?.ToUpperInvariant();

        // Ensure the desired username is unique (by normalized username) before applying change
        if (!string.IsNullOrWhiteSpace(desiredUserName) && normalizedUserName != existingUser.NormalizedUserName)
        {
            var usernameExists = await db.Users.AnyAsync(u => u.NormalizedUserName == normalizedUserName && u.Id != id, cancellationToken);
            if (usernameExists)
            {
                throw new ArgumentException("Tên đăng nhập đã tồn tại.");
            }
        }

        // Update user properties using EF Core directly
        existingUser.UserName = desiredUserName;
        existingUser.Email = normalizedEmail;
        existingUser.NormalizedUserName = normalizedUserName;
        existingUser.NormalizedEmail = normalizedEmail?.ToUpperInvariant();
        existingUser.FullName = request.FullName;
        existingUser.EmployeeCode = request.EmployeeCode;
        existingUser.PhoneNumber = normalizedPhone;
        existingUser.IsActive = request.IsActive;

        // Update role if provided (Now using RoleId in User entity)
        if (request.RoleIds != null && request.RoleIds.Length > 0)
        {
            // Only take the first role since we now have 1-to-many relationship
            var roleIdOrName = request.RoleIds[0];

            // Normalize input
            var normalizedInput = roleIdOrName?.Trim();

            if (string.IsNullOrEmpty(normalizedInput))
            {
                throw new ArgumentException("RoleId hoặc Role Name không được để trống");
            }

            // Try to find role by Id first, then by Name (case-insensitive)
            var role = await db.Roles.FirstOrDefaultAsync(
                r => r.Id == normalizedInput || r.Name == normalizedInput,
                cancellationToken);

            if (role == null || string.IsNullOrEmpty(role.Name))
            {
                throw new Exception($"Role '{normalizedInput}' không tồn tại hoặc không hợp lệ trong hệ thống. Vui lòng kiểm tra lại Role ID hoặc Role Name.");
            }

            // Update RoleId in User entity for navigation (always store the actual ID)
            existingUser.RoleId = role.Id;

            // If role is "Quản lý" and department is provided, set user as manager
            if (role.Name == "Quản lý" && request.DepartmentId.HasValue && request.DepartmentId.Value > 0)
            {
                // Verify department exists
                var deptToManage = await db.Departments.FirstOrDefaultAsync(d => d.DepartmentId == request.DepartmentId.Value, cancellationToken);
                if (deptToManage == null)
                {
                    throw new Exception($"Department với ID '{request.DepartmentId.Value}' không tồn tại trong hệ thống");
                }

                // Check if department already has a different manager
                if (deptToManage.ManagerId != null && deptToManage.ManagerId != id)
                {
                    // Unset the other manager
                    var otherManagerDept = await db.Departments.FirstOrDefaultAsync(d => d.ManagerId == deptToManage.ManagerId, cancellationToken);
                    if (otherManagerDept != null)
                    {
                        otherManagerDept.ManagerId = null;
                    }
                }

                // Unset previous manager if any (if user was managing a different department)
                var previousManagerDepartment = await db.Departments.FirstOrDefaultAsync(d => d.ManagerId == id && d.DepartmentId != request.DepartmentId.Value, cancellationToken);
                if (previousManagerDepartment != null)
                {
                    previousManagerDepartment.ManagerId = null;
                }

                // Set user as manager of the new department
                deptToManage.ManagerId = id;

                // Clear DepartmentId since manager relationship is separate
                existingUser.DepartmentId = null;
            }
            else
            {
                // If not "Quản lý" role, remove manager assignment if any
                var previousManagerDepartment = await db.Departments.FirstOrDefaultAsync(d => d.ManagerId == id, cancellationToken);
                if (previousManagerDepartment != null)
                {
                    previousManagerDepartment.ManagerId = null;
                }
            }
        }
        else if (request.RoleIds != null && request.RoleIds.Length == 0)
        {
            // Clear role if empty array is provided
            existingUser.RoleId = null;

            // Also remove manager assignment
            var previousManagerDepartment = await db.Departments.FirstOrDefaultAsync(d => d.ManagerId == id, cancellationToken);
            if (previousManagerDepartment != null)
            {
                previousManagerDepartment.ManagerId = null;
            }
        }

        // TH1 & TH2: Update department assignment
        // Remove existing UserLines first
        var existingUserLines = await db.UserLines
            .Where(ul => ul.UserId == id)
            .ToListAsync(cancellationToken);

        if (existingUserLines.Any())
        {
            db.UserLines.RemoveRange(existingUserLines);
        }

        // Handle department assignment based on whether LineIds are provided
        if (request.DepartmentId.HasValue)
        {
            // Verify department exists
            var dept = await db.Departments.FirstOrDefaultAsync(d => d.DepartmentId == request.DepartmentId.Value, cancellationToken);
            if (dept == null)
            {
                throw new Exception($"Department với ID '{request.DepartmentId.Value}' không tồn tại trong hệ thống");
            }

            // TH1: Không có LineIds -> assign user vào department trực tiếp
            if (request.LineIds == null || request.LineIds.Count == 0)
            {
                existingUser.DepartmentId = request.DepartmentId.Value;
            }
            // TH2: Có LineIds -> assign qua UserLine, clear DepartmentId
            else
            {
                existingUser.DepartmentId = null;

                foreach (var lineId in request.LineIds)
                {
                    // Verify line exists
                    var line = await db.Lines.FirstOrDefaultAsync(l => l.LineId == lineId, cancellationToken);
                    if (line == null)
                    {
                        throw new Exception($"Line với ID '{lineId}' không tồn tại trong hệ thống");
                    }

                    // Verify line belongs to the specified department
                    if (line.DepartmentId != request.DepartmentId.Value)
                    {
                        throw new Exception($"Line với ID '{lineId}' không thuộc Department '{request.DepartmentId}'.");
                    }

                    var newUserLine = new UserLine
                    {
                        UserId = id,
                        LineId = lineId,
                        CreatedAt = DateTime.UtcNow
                    };
                    await db.UserLines.AddAsync(newUserLine, cancellationToken);
                }
            }
        }
        else
        {
            // No department specified, clear DepartmentId
            existingUser.DepartmentId = null;
        }

        await db.SaveChangesAsync(cancellationToken);

        // Return UserDTO with role, department, and lines
        // Get role name from the Role navigation property
        var roleName = existingUser.RoleId != null
            ? (await db.Roles.FirstOrDefaultAsync(r => r.Id == existingUser.RoleId, cancellationToken))?.Name
            : null;

        // Get lines assigned to user
        var userLines = await db.UserLines
            .Include(ul => ul.Line)
            .Where(ul => ul.UserId == id)
            .ToListAsync(cancellationToken);

        // Get department from user's lines (User → UserLine → Line → Department)
        var userLine = userLines.FirstOrDefault();
        Department? department = null;
        if (userLine?.Line != null)
        {
            department = await db.Departments
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.DepartmentId == userLine.Line.DepartmentId, cancellationToken);
        }
        // If user is a manager (has ManagerId set), also check that
        else
        {
            department = await db.Departments
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.ManagerId == id, cancellationToken);
        }

        var userLineIds = userLines.Select(ul => ul.LineId).ToList();

        return new UserDTO
        {
            Id = existingUser.Id,
            UserName = existingUser.UserName,
            NormalizedUserName = existingUser.NormalizedUserName,
            NormalizedEmail = existingUser.NormalizedEmail,
            Email = existingUser.Email,
            EmailConfirmed = existingUser.EmailConfirmed,
            PasswordHash = existingUser.PasswordHash,
            SecurityStamp = existingUser.SecurityStamp,
            ConcurrencyStamp = existingUser.ConcurrencyStamp,
            PhoneNumber = existingUser.PhoneNumber,
            PhoneNumberConfirmed = existingUser.PhoneNumberConfirmed,
            TwoFactorEnabled = existingUser.TwoFactorEnabled,
            LockoutEnd = existingUser.LockoutEnd,
            LockoutEnabled = existingUser.LockoutEnabled,
            AccessFailedCount = existingUser.AccessFailedCount,
            FullName = existingUser.FullName,
            EmployeeCode = existingUser.EmployeeCode,
            IsActive = existingUser.IsActive,
            Roles = roleName != null ? new List<string> { roleName } : new List<string>(),
            DepartmentId = department?.DepartmentId,
            DepartmentName = department?.DepartmentName,
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
            Console.WriteLine($"GetUsersByRoleAsync called with roleName: {roleName}");

            // Get users by RoleId instead of role name
            // Note: Removed IsActive filter to include all managers
            var users = await db.Users
                .Include(u => u.Role)
                .Where(u => u.Role != null && u.Role.Name == roleName)
                .ToListAsync(cancellationToken);

            Console.WriteLine($"Found {users.Count} users with role {roleName}");

            return users;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetUsersByRoleAsync: {ex.Message}");
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

            // Check if email is already taken by another user (only when provided)
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var emailExists = await db.Users.AnyAsync(u => u.Email == request.Email && u.Id != userId, cancellationToken);
                if (emailExists)
                {
                    throw new ArgumentException("Đã có người dùng sử dụng email này, không được dùng.");
                }
            }

            // Check if phone number is already taken by another user (only when provided)
            if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
            {
                var phoneExists = await db.Users.AnyAsync(u => u.PhoneNumber == request.PhoneNumber && u.Id != userId, cancellationToken);
                if (phoneExists)
                {
                    throw new ArgumentException("Đã có người dùng sử dụng số điện thoại này, không được dùng.");
                }
            }

            // Update only editable fields - normalize empty values to null
            existingUser.FullName = request.FullName;
            var normalizedEmailProfile = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
            var normalizedPhoneProfile = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();

            // Check if email is being changed and set EmailConfirmed to false
            if (existingUser.Email != normalizedEmailProfile)
            {
                existingUser.EmailConfirmed = false;
            }

            // Check if phone number is being changed and set PhoneNumberConfirmed to false
            if (existingUser.PhoneNumber != normalizedPhoneProfile)
            {
                existingUser.PhoneNumberConfirmed = false;
            }

            existingUser.Email = normalizedEmailProfile;
            existingUser.NormalizedEmail = normalizedEmailProfile?.ToUpperInvariant();
            existingUser.PhoneNumber = normalizedPhoneProfile;
            // Note: ProfileImageUrl would be handled when we add image upload functionality

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
        // Create the user entity from request
        // Auto-set UserName from EmployeeCode if not provided
        var userName = string.IsNullOrEmpty(request.UserName) ? request.EmployeeCode : request.UserName;

        // Normalize input: convert empty or whitespace email/phone to null to avoid DB storing empty strings
        var normalizedEmail = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim();
        var normalizedPhone = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();

        var user = new User
        {
            UserName = userName,
            Email = normalizedEmail,
            FullName = request.FullName,
            EmployeeCode = request.EmployeeCode,
            PhoneNumber = normalizedPhone
        };

        // Create user using existing method with default password if not provided
        var password = string.IsNullOrEmpty(request.Password) ? "123456" : request.Password;
        var createdUser = await CreateUserAsync(user, password, request.RoleIds, cancellationToken);

        // TH1: Nếu có DepartmentId nhưng KHÔNG có LineIds -> set user.DepartmentId trực tiếp
        // TH2: Nếu có LineIds -> tạo UserLine (không set DepartmentId trực tiếp)
        if (request.DepartmentId.HasValue)
        {
            // Verify department exists
            var department = await db.Departments.FirstOrDefaultAsync(d => d.DepartmentId == request.DepartmentId.Value, cancellationToken);
            if (department == null)
            {
                throw new ArgumentException($"Department với ID '{request.DepartmentId}' không tồn tại.");
            }

            // TH1: Không có LineIds -> assign user vào department trực tiếp
            if (request.LineIds == null || request.LineIds.Length == 0)
            {
                createdUser.DepartmentId = request.DepartmentId.Value;
                await db.SaveChangesAsync(cancellationToken);
            }
            // TH2: Có LineIds -> assign qua UserLine (DepartmentId sẽ được suy ra từ Line)
            else
            {
                foreach (var lineId in request.LineIds)
                {
                    var line = await db.Lines.FirstOrDefaultAsync(l => l.LineId == lineId, cancellationToken);
                    if (line != null)
                    {
                        // Verify line belongs to the specified department
                        if (line.DepartmentId != request.DepartmentId.Value)
                        {
                            throw new ArgumentException($"Line với ID '{lineId}' không thuộc Department '{request.DepartmentId}'.");
                        }

                        var userLine = new UserLine
                        {
                            UserId = createdUser.Id,
                            LineId = lineId,
                            CreatedAt = DateTime.UtcNow
                        };
                        await db.UserLines.AddAsync(userLine, cancellationToken);
                    }
                    else
                    {
                        throw new ArgumentException($"Line với ID '{lineId}' không tồn tại.");
                    }
                }
                await db.SaveChangesAsync(cancellationToken);
            }
        }

        return createdUser;
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User?> GetByEmployeeCodeAsync(string employeeCode, CancellationToken cancellationToken = default)
    {
        return await db.Users.FirstOrDefaultAsync(u => u.EmployeeCode == employeeCode, cancellationToken);
    }
}