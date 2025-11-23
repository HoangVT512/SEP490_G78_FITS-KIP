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
            .Include(i => i.Line)
            .Include(i => i.Type)
            .Include(i => i.ReportedByUser)
            .Include(i => i.IncidentShifts)
                .ThenInclude(ishft => ishft.Shift)
            .Include(i => i.IncidentImages) // Load incident images
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
            .Include(i => i.Line)
            .Include(i => i.Type)
            .Include(i => i.ReportedByUser)
            .Include(i => i.IncidentShifts)
                .ThenInclude(ishft => ishft.Shift)
            .Include(i => i.IncidentImages) // Load incident images
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

        // Ensure IncidentShifts collection is properly tracked
        if (incident.IncidentShifts != null)
        {
            foreach (var shift in incident.IncidentShifts)
            {
                // If IncidentShiftId is 0, it's a new shift - add it
                if (shift.IncidentShiftId == 0)
                {
                    _context.Entry(shift).State = EntityState.Added;
                }
            }
        }

        // Ensure IncidentImages collection is tracked and saved
        if (incident.IncidentImages != null && incident.IncidentImages.Any())
        {
            foreach (var image in incident.IncidentImages)
            {
                // If ImageId is 0, it's a new image - add it
                if (image.ImageId == 0)
                {
                    _context.Entry(image).State = EntityState.Added;
                }
            }
        }

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

        // Load IncidentImages collection
        await _context.Entry(incident)
            .Collection(i => i.IncidentImages)
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
            .Include(i => i.Line)
            .Include(i => i.Type)
            .Include(i => i.IncidentShifts)
            .Include(i => i.IncidentImages) // Load incident images
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
            .Include(i => i.Line)
            .Include(i => i.Type)
            .Include(i => i.IncidentShifts)
            .Include(i => i.IncidentImages) // Load incident images
            .Where(i =>
                // Include incidents with direct LineId
                ((i.LineId == lineId) ||
                // Or incidents with Equipment.Stage.LineId
                (i.Equipment != null &&
                 i.Equipment.Stage != null &&
                 i.Equipment.Stage.Line != null &&
                 i.Equipment.Stage.Line.LineId == lineId)) &&
                // Apply time filter to both conditions
                i.StartTime >= startDate &&
                i.StartTime <= endDate)
            .OrderByDescending(i => i.CreatedDate)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<IncidentHistory>> GetIncidentsByLineDateShiftSlotAsync(int lineId, DateTime date, int shiftId, DateTime startTime, DateTime endTime, CancellationToken cancellationToken = default)
    {
        return await _context.IncidentHistories
            .Include(i => i.Equipment)
                .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
            .Include(i => i.Line)
            .Include(i => i.Type)
            .Include(i => i.IncidentShifts)
                .ThenInclude(ish => ish.Shift)
            .Include(i => i.IncidentImages)
            .Where(i =>
                // Filter by line
                (i.LineId == lineId ||
                 (i.Equipment != null && i.Equipment.Stage != null && i.Equipment.Stage.LineId == lineId)) &&
                // Filter by date
                i.StartTime.HasValue && i.StartTime.Value.Date == date.Date &&
                // Filter by shift through IncidentShifts
                i.IncidentShifts.Any(ish => ish.ShiftId == shiftId) &&
                // Overlap with slot time: incident starts before slot ends and ends after slot starts
                i.StartTime < endTime && (i.EndTime == null || i.EndTime > startTime))
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

    public async Task<IReadOnlyList<IncidentShift>> GetIncidentShiftsAsync(int incidentId, CancellationToken cancellationToken = default)
    {
        return await _context.IncidentShifts
            .Include(ishft => ishft.Shift)
            .Where(ishft => ishft.IncidentId == incidentId)
            .OrderBy(ishft => ishft.StartTime)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<IncidentHistory>> GetOverlappingIncidentsAsync(int lineId, DateTime date, DateTime startTime, DateTime endTime, int? excludeIncidentId = null, CancellationToken cancellationToken = default)
    {
        var query = _context.IncidentHistories
            .Include(i => i.Equipment)
            .Include(i => i.Line)
            .Include(i => i.Type)
            .Where(i =>
                // Filter by line only (not equipment)
                i.LineId == lineId &&
                // Filter by date: only incidents on the same day
                i.StartTime.HasValue && i.StartTime.Value.Date == date.Date &&
                // Time overlap: incident starts before new end time and ends after new start time
                i.StartTime < endTime && (i.EndTime == null || i.EndTime > startTime));

        // Exclude current incident if updating
        if (excludeIncidentId.HasValue)
        {
            query = query.Where(i => i.IncidentId != excludeIncidentId.Value);
        }

        return await query
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}