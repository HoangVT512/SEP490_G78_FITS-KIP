using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;
using Microsoft.EntityFrameworkCore;

namespace FITSKIP.Infrastructure.Repositories;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly FitskipDbContext dbContext;

    public DepartmentRepository(FitskipDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    public async Task<IReadOnlyList<Department>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Departments
            .AsNoTracking()
            .Include(d => d.Manager)
            .ToListAsync(cancellationToken);
    }

    public async Task<Department?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Departments
            .Include(d => d.Manager)
            .FirstOrDefaultAsync(d => d.DepartmentId == id, cancellationToken);
    }

    public async Task<Department> CreateAsync(Department department, CancellationToken cancellationToken = default)
    {
        await dbContext.Departments.AddAsync(department, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return department;
    }

    public async Task<Department?> UpdateAsync(Department department, CancellationToken cancellationToken = default)
    {
        var existing = await dbContext.Departments.FirstOrDefaultAsync(d => d.DepartmentId == department.DepartmentId, cancellationToken);
        if (existing == null) return null;
        dbContext.Entry(existing).CurrentValues.SetValues(department);
        await dbContext.SaveChangesAsync(cancellationToken);
        return existing;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var existing = await dbContext.Departments.FirstOrDefaultAsync(d => d.DepartmentId == id, cancellationToken);
        if (existing == null) return false;
        existing.IsActive = false;
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}