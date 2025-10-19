using Microsoft.EntityFrameworkCore;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;

namespace FITSKIP.Infrastructure.Repositories;

public class IncidentRepository : IIncidentRepository
{
    private readonly FitskipDbContext _context;

    public IncidentRepository(FitskipDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<IncidentHistory>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.IncidentHistories
            .Include(i => i.Equipment)
                .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
            .Include(i => i.Type)
            .Include(i => i.ReportedByUser)
            .Include(i => i.IncidentShifts)
                .ThenInclude(ishft => ishft.Shift)
            .OrderByDescending(i => i.CreatedDate)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IncidentHistory?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.IncidentHistories
            .Include(i => i.Equipment)
                .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
            .Include(i => i.Type)
            .Include(i => i.ReportedByUser)
            .Include(i => i.IncidentShifts)
                .ThenInclude(ishft => ishft.Shift)
            .FirstOrDefaultAsync(i => i.IncidentId == id, cancellationToken);
    }

    public async Task<IncidentHistory> CreateAsync(IncidentHistory incident, CancellationToken cancellationToken = default)
    {
        await _context.IncidentHistories.AddAsync(incident, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Load related entities after saving
        await _context.Entry(incident)
            .Reference(i => i.Equipment)
            .LoadAsync(cancellationToken);

        if (incident.Equipment != null)
        {
            await _context.Entry(incident.Equipment)
                .Reference(e => e.Stage)
                .LoadAsync(cancellationToken);

            if (incident.Equipment.Stage != null)
            {
                await _context.Entry(incident.Equipment.Stage)
                    .Reference(s => s.Line)
                    .LoadAsync(cancellationToken);
            }
        }

        await _context.Entry(incident)
            .Reference(i => i.Type)
            .LoadAsync(cancellationToken);

        await _context.Entry(incident)
            .Collection(i => i.IncidentShifts)
            .LoadAsync(cancellationToken);

        return incident;
    }

    public async Task<IncidentHistory?> UpdateAsync(IncidentHistory incident, CancellationToken cancellationToken = default)
    {
        _context.IncidentHistories.Update(incident);
        await _context.SaveChangesAsync(cancellationToken);

        // Load related entities after updating
        await _context.Entry(incident)
            .Reference(i => i.Equipment)
            .LoadAsync(cancellationToken);

        if (incident.Equipment != null)
        {
            await _context.Entry(incident.Equipment)
                .Reference(e => e.Stage)
                .LoadAsync(cancellationToken);

            if (incident.Equipment.Stage != null)
            {
                await _context.Entry(incident.Equipment.Stage)
                    .Reference(s => s.Line)
                    .LoadAsync(cancellationToken);
            }
        }

        await _context.Entry(incident)
            .Reference(i => i.Type)
            .LoadAsync(cancellationToken);

        await _context.Entry(incident)
            .Collection(i => i.IncidentShifts)
            .LoadAsync(cancellationToken);

        return incident;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var incident = await _context.IncidentHistories.FindAsync(new object[] { id }, cancellationToken);
        if (incident == null)
            return false;

        _context.IncidentHistories.Remove(incident);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<IncidentHistory>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _context.IncidentHistories
            .Include(i => i.Equipment)
                .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
            .Include(i => i.Type)
            .Include(i => i.IncidentShifts)
            .Where(i => i.StartTime >= startDate && i.StartTime <= endDate)
            .OrderByDescending(i => i.CreatedDate)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<IncidentHistory>> GetByLineIdAsync(int lineId, DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _context.IncidentHistories
            .Include(i => i.Equipment)
                .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
            .Include(i => i.Type)
            .Include(i => i.IncidentShifts)
            .Where(i => i.Equipment != null &&
                       i.Equipment.Stage != null &&
                       i.Equipment.Stage.Line != null &&
                       i.Equipment.Stage.Line.LineId == lineId &&
                       i.StartTime >= startDate &&
                       i.StartTime <= endDate)
            .OrderByDescending(i => i.CreatedDate)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<dynamic>> GetStopTypesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.StopTypes
            .Select(s => new { typeId = s.TypeId, typeName = s.TypeName } as dynamic)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}