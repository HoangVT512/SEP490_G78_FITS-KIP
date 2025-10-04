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
            throw new ArgumentException("User with the same username already exists.");
        }

        var existingEmail = await db.Users.FirstOrDefaultAsync(u => u.Email == user.Email, cancellationToken);
        if (existingEmail != null)
        {
            throw new ArgumentException("User with the same email already exists.");
        }

        if (!string.IsNullOrEmpty(user.EmployeeCode))
        {
            var existingEmployeeCode = await db.Users.FirstOrDefaultAsync(u => u.EmployeeCode == user.EmployeeCode, cancellationToken);
            if (existingEmployeeCode != null)
            {
                throw new ArgumentException("User with the same employee code already exists.");
            }
        }

        if (!string.IsNullOrEmpty(user.PhoneNumber))
        {
            var existingPhone = await db.Users.FirstOrDefaultAsync(u => u.PhoneNumber == user.PhoneNumber, cancellationToken);
            if (existingPhone != null)
            {
                throw new ArgumentException("User with the same phone number already exists.");
            }
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

            // Get department from user's lines (User → UserLine → Line → Department)
            // If user is assigned to a line, get department from that line
            var userLine = user.UserLines.FirstOrDefault();
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
                Gender = user.Gender,
                EmployeeCode = user.EmployeeCode,
                Position = user.Position,
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

        // Update user properties using EF Core directly
        existingUser.UserName = request.UserName;
        existingUser.Email = request.Email;
        existingUser.NormalizedUserName = request.UserName.ToUpperInvariant();
        existingUser.NormalizedEmail = request.Email.ToUpperInvariant();
        existingUser.FullName = request.FullName;
        existingUser.Gender = request.Gender;
        existingUser.EmployeeCode = request.EmployeeCode;
        existingUser.Position = request.Position;
        existingUser.PhoneNumber = request.PhoneNumber;
        existingUser.IsActive = request.IsActive;

        // Update role if provided (Now using RoleId in User entity)
        if (request.RoleIds != null && request.RoleIds.Length > 0)
        {
            // Only take the first role since we now have 1-to-many relationship
            var roleId = request.RoleIds[0];

            // Verify role exists and has name
            var role = await db.Roles.FirstOrDefaultAsync(r => r.Id == roleId, cancellationToken);
            if (role == null || string.IsNullOrEmpty(role.Name))
            {
                throw new Exception($"Role với ID '{roleId}' không tồn tại hoặc không hợp lệ trong hệ thống");
            }

            // Update RoleId in User entity for navigation
            existingUser.RoleId = roleId;

            // If role is "Quản lý" and department is provided, set user as manager
            if (role.Name == "Quản lý" && request.DepartmentId.HasValue && request.DepartmentId.Value > 0)
            {
                // Verify department exists
                var deptToManage = await db.Departments.FirstOrDefaultAsync(d => d.DepartmentId == request.DepartmentId.Value, cancellationToken);
                if (deptToManage == null)
                {
                    throw new Exception($"Department với ID '{request.DepartmentId.Value}' không tồn tại trong hệ thống");
                }

                // Unset previous manager if any
                var previousManagerDepartment = await db.Departments.FirstOrDefaultAsync(d => d.ManagerId == id, cancellationToken);
                if (previousManagerDepartment != null)
                {
                    previousManagerDepartment.ManagerId = null;
                }

                // Set user as manager of the new department
                deptToManage.ManagerId = id;
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

        // Update lines if provided
        if (request.LineIds != null)
        {
            // Remove all existing user lines
            var existingUserLines = await db.UserLines
                .Where(ul => ul.UserId == id)
                .ToListAsync(cancellationToken);

            if (existingUserLines.Any())
            {
                db.UserLines.RemoveRange(existingUserLines);
            }

            // Add new lines
            if (request.LineIds.Count > 0)
            {
                foreach (var lineId in request.LineIds)
                {
                    // Verify line exists
                    var line = await db.Lines.FirstOrDefaultAsync(l => l.LineId == lineId, cancellationToken);
                    if (line == null)
                    {
                        throw new Exception($"Line với ID '{lineId}' không tồn tại trong hệ thống");
                    }

                    var newUserLine = new UserLine
                    {
                        UserId = id,
                        LineId = lineId
                    };
                    await db.UserLines.AddAsync(newUserLine, cancellationToken);
                }
            }
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
            Gender = existingUser.Gender,
            EmployeeCode = existingUser.EmployeeCode,
            Position = existingUser.Position,
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
            // Handle specific encoding issues for Vietnamese role names
            var actualRoleName = roleName;
            if (roleName == "Quản lý")
                actualRoleName = "Quan ly";

            var usersInRole = await userManager.GetUsersInRoleAsync(actualRoleName);
            var activeUsers = usersInRole.Where(u => u.IsActive).ToList();

            return activeUsers;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetUsersByRoleAsync: {ex.Message}");
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

            // Check if email is already taken by another user
            var emailExists = await db.Users.AnyAsync(u => u.Email == request.Email && u.Id != userId, cancellationToken);
            if (emailExists)
            {
                throw new ArgumentException("Đã có người dùng sử dụng email này, không được dùng.");
            }

            // Check if phone number is already taken by another user
            var phoneExists = await db.Users.AnyAsync(u => u.PhoneNumber == request.PhoneNumber && u.Id != userId, cancellationToken);
            if (phoneExists)
            {
                throw new ArgumentException("Đã có người dùng sử dụng số điện thoại này, không được dùng.");
            }

            // Update only editable fields 
            existingUser.FullName = request.FullName;
            existingUser.Email = request.Email;
            existingUser.NormalizedEmail = request.Email.ToUpperInvariant();
            existingUser.PhoneNumber = request.PhoneNumber;
            existingUser.Gender = request.Gender;
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
        var user = new User
        {
            UserName = request.UserName,
            Email = request.Email,
            FullName = request.FullName,
            Gender = request.Gender,
            EmployeeCode = request.EmployeeCode,
            Position = request.Position,
            PhoneNumber = request.PhoneNumber
        };

        // Create user using existing method with default password if not provided
        var password = string.IsNullOrEmpty(request.Password) ? "123456" : request.Password;
        var createdUser = await CreateUserAsync(user, password, request.RoleIds, cancellationToken);

        // Assign as manager of department if specified
        if (request.DepartmentId.HasValue)
        {
            var department = await db.Departments.FirstOrDefaultAsync(d => d.DepartmentId == request.DepartmentId.Value, cancellationToken);
            if (department != null)
            {
                department.ManagerId = createdUser.Id;
                await db.SaveChangesAsync(cancellationToken);
            }
            else
            {
                throw new ArgumentException($"Department with ID '{request.DepartmentId}' does not exist.");
            }
        }

        // Assign to lines if specified
        if (request.LineIds != null && request.LineIds.Length > 0)
        {
            foreach (var lineId in request.LineIds)
            {
                var line = await db.Lines.FirstOrDefaultAsync(l => l.LineId == lineId, cancellationToken);
                if (line != null)
                {
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
                    throw new ArgumentException($"Line with ID '{lineId}' does not exist.");
                }
            }
            await db.SaveChangesAsync(cancellationToken);
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