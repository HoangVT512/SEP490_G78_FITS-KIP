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

        // Thêm roles cho user nếu có roleIds
        if (roleIds != null && roleIds.Length > 0)
        {
            foreach (var roleId in roleIds)
            {
                // Thử tìm role theo Id trước
                var role = await db.Roles.FirstOrDefaultAsync(r => r.Id == roleId, cancellationToken);

                // Nếu không tìm thấy theo Id, thử tìm theo Name
                if (role == null)
                {
                    role = await db.Roles.FirstOrDefaultAsync(r => r.Name == roleId, cancellationToken);
                }

                // Nếu không tìm thấy theo Name, thử tìm theo NormalizedName
                if (role == null)
                {
                    role = await db.Roles.FirstOrDefaultAsync(r => r.NormalizedName == roleId.ToUpperInvariant(), cancellationToken);
                }

                if (role != null && !string.IsNullOrEmpty(role.Name))
                {
                    var result = await userManager.AddToRoleAsync(user, role.Name);
                    if (!result.Succeeded)
                    {
                        throw new Exception($"Không thể thêm role '{role.Name}' cho user: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                    }
                }
                else
                {
                    throw new Exception($"Role với ID/Name '{roleId}' không tồn tại trong hệ thống");
                }
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
            var roles = await userManager.GetRolesAsync(user);

            // Get department where user is manager
            var managedDepartment = await db.Departments
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.ManagerId == user.Id, cancellationToken);

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
                DepartmentId = managedDepartment?.DepartmentId,
                DepartmentName = managedDepartment?.DepartmentName,
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

        // Update roles if provided
        if (request.RoleIds != null)
        {
            // Remove all existing user roles directly from AspNetUserRoles table
            var existingUserRoles = await db.UserRoles
                .Where(ur => ur.UserId == id)
                .ToListAsync(cancellationToken);

            if (existingUserRoles.Any())
            {
                db.UserRoles.RemoveRange(existingUserRoles);
            }

            // Add new roles directly to AspNetUserRoles table
            if (request.RoleIds.Length > 0)
            {
                foreach (var roleId in request.RoleIds)
                {
                    // Verify role exists
                    var roleExists = await db.Roles.AnyAsync(r => r.Id == roleId, cancellationToken);
                    if (!roleExists)
                    {
                        throw new Exception($"Role với ID '{roleId}' không tồn tại trong hệ thống");
                    }

                    // Add to AspNetUserRoles
                    var userRole = new Microsoft.AspNetCore.Identity.IdentityUserRole<string>
                    {
                        UserId = id,
                        RoleId = roleId
                    };
                    await db.UserRoles.AddAsync(userRole, cancellationToken);
                }
            }
        }

        // Update department if provided
        if (request.DepartmentId.HasValue)
        {
            // Verify department exists
            var department = await db.Departments.FirstOrDefaultAsync(d => d.DepartmentId == request.DepartmentId.Value, cancellationToken);
            if (department == null)
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
            department.ManagerId = id;
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

                    var userLine = new UserLine
                    {
                        UserId = id,
                        LineId = lineId
                    };
                    await db.UserLines.AddAsync(userLine, cancellationToken);
                }
            }
        }

        await db.SaveChangesAsync(cancellationToken);

        // Return UserDTO with roles, department, and lines
        var userRoles = await userManager.GetRolesAsync(existingUser);

        // Get department where user is manager
        var managedDepartment = await db.Departments
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.ManagerId == id, cancellationToken);

        // Get lines assigned to user
        var userLines = await db.UserLines
            .Where(ul => ul.UserId == id)
            .Select(ul => ul.LineId)
            .ToListAsync(cancellationToken);

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
            Roles = userRoles.ToList(),
            DepartmentId = managedDepartment?.DepartmentId,
            DepartmentName = managedDepartment?.DepartmentName,
            LineIds = userLines
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

        // Create user using existing method
        var createdUser = await CreateUserAsync(user, request.Password, request.RoleIds, cancellationToken);

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
                        CreateDate = DateTime.UtcNow
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