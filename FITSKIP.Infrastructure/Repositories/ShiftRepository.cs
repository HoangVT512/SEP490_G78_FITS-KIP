using Microsoft.EntityFrameworkCore;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;

namespace FITSKIP.Infrastructure.Repositories;

public class ShiftRepository : IShiftRepository
{
    private readonly FitskipDbContext _context;

    public ShiftRepository(FitskipDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Shift>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Shifts
            .OrderBy(s => s.StartTime)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Shift?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Shifts
            .FirstOrDefaultAsync(s => s.ShiftId == id, cancellationToken);
    }
}