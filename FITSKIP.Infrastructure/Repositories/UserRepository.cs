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

    public async Task<User> CreateUserAsync(User user, CancellationToken cancellationToken = default)
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

        await db.Users.AddAsync(user, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
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
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var userDTOs = new List<UserDTO>();
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
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
                Roles = roles.ToList()
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

            // Update only editable fields - NOT including FullName (không cho sửa tên)
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

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await db.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<User?> GetByEmployeeCodeAsync(string employeeCode, CancellationToken cancellationToken = default)
    {
        return await db.Users.FirstOrDefaultAsync(u => u.EmployeeCode == employeeCode, cancellationToken);
    }
}