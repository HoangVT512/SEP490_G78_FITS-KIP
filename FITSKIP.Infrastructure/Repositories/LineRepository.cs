using Microsoft.EntityFrameworkCore;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;

namespace FITSKIP.Infrastructure.Repositories;

public class LineRepository : ILineRepository
{
    private readonly FitskipDbContext _context;

    public LineRepository(FitskipDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Line>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Lines
            .Include(l => l.Department)
            .Include(l => l.Stages)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Line?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Lines
            .Include(l => l.Department)
            .Include(l => l.Stages) // Load stages for the line
            .FirstOrDefaultAsync(l => l.LineId == id, cancellationToken);
    }

    public async Task<Line> CreateAsync(Line line, CancellationToken cancellationToken = default)
    {
        await _context.Lines.AddAsync(line, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Load the department after saving
        await _context.Entry(line)
            .Reference(l => l.Department)
            .LoadAsync(cancellationToken);

        return line;
    }

    public async Task<Line?> UpdateAsync(Line line, CancellationToken cancellationToken = default)
    {
        _context.Lines.Update(line);
        await _context.SaveChangesAsync(cancellationToken);

        // Load the department after updating
        await _context.Entry(line)
            .Reference(l => l.Department)
            .LoadAsync(cancellationToken);

        return line;
    }

    public async Task<IReadOnlyList<Line>> GetByDepartmentIdAsync(int departmentId, CancellationToken cancellationToken = default)
    {
        return await _context.Lines
            .Include(l => l.Department)
            .Where(l => l.DepartmentId == departmentId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasDependenciesAsync(int lineId, CancellationToken cancellationToken = default)
    {
        // Check if line has any stages
        var hasStages = await _context.Stages.AnyAsync(s => s.LineId == lineId, cancellationToken);
        if (hasStages) return true;

        // Note: Equipment no longer has LineId, so we remove this check

        // Check if line has any production outputs
        var hasProductionOutputs = await _context.ProductionOutputs.AnyAsync(p => p.LineId == lineId, cancellationToken);
        if (hasProductionOutputs) return true;

        // Note: IncidentHistory no longer has LineId, so we remove this check

        // Check if line has any user assignments
        var hasUserLines = await _context.UserLines.AnyAsync(u => u.LineId == lineId, cancellationToken);
        if (hasUserLines) return true;

        return false;
    }

    public async Task<Line?> ToggleLineStatusAsync(int id, CancellationToken cancellationToken = default)
    {
        var line = await GetByIdAsync(id, cancellationToken);
        if (line == null)
            return null;

        line.IsActive = !line.IsActive;
        await _context.SaveChangesAsync(cancellationToken);

        return line;
    }
}