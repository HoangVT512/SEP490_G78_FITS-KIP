using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;

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

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await db.Users
            .AsNoTracking()
            .ToListAsync(cancellationToken);
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
}