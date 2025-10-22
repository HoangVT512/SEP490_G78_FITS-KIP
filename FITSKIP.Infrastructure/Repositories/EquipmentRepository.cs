using Microsoft.EntityFrameworkCore;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;

namespace FITSKIP.Infrastructure.Repositories;

public class EquipmentRepository : IEquipmentRepository
{
    private readonly FitskipDbContext _context;

    public EquipmentRepository(FitskipDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Equipment>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Equipment
            .Include(e => e.Stage!)
            .ThenInclude(s => s.Line!)
            .ThenInclude(l => l.Department)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Equipment?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Equipment
            .Include(e => e.Stage!)
            .ThenInclude(s => s.Line!)
            .ThenInclude(l => l.Department)
            .FirstOrDefaultAsync(e => e.EquipmentId == id, cancellationToken);
    }

    public async Task<Equipment> CreateAsync(Equipment equipment, CancellationToken cancellationToken = default)
    {
        await _context.Equipment.AddAsync(equipment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Load the stage after saving
        if (equipment.StageId.HasValue)
        {
            await _context.Entry(equipment)
                .Reference(e => e.Stage)
                .LoadAsync(cancellationToken);

            if (equipment.Stage != null)
            {
                await _context.Entry(equipment.Stage)
                    .Reference(s => s.Line)
                    .LoadAsync(cancellationToken);
            }
        }

        return equipment;
    }

    public async Task<Equipment?> UpdateAsync(Equipment equipment, CancellationToken cancellationToken = default)
    {
        _context.Equipment.Update(equipment);
        await _context.SaveChangesAsync(cancellationToken);

        // Load the stage after updating
        if (equipment.StageId.HasValue)
        {
            await _context.Entry(equipment)
                .Reference(e => e.Stage)
                .LoadAsync(cancellationToken);

            if (equipment.Stage != null)
            {
                await _context.Entry(equipment.Stage)
                    .Reference(s => s.Line)
                    .LoadAsync(cancellationToken);
            }
        }

        return equipment;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var equipment = await GetByIdAsync(id, cancellationToken);
        if (equipment == null)
            return false;

        _context.Equipment.Remove(equipment);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<Equipment>> GetByStageIdAsync(int stageId, CancellationToken cancellationToken = default)
    {
        return await _context.Equipment
            .Include(e => e.Stage!)
            .ThenInclude(s => s.Line)
            .Where(e => e.StageId == stageId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Equipment?> GetByCodeAsync(string equipmentCode, CancellationToken cancellationToken = default)
    {
        var normalizedCode = equipmentCode.ToUpper();
        return await _context.Equipment
            .FirstOrDefaultAsync(e => e.EquipmentCode != null && e.EquipmentCode.ToUpper() == normalizedCode, cancellationToken);
    }

    public async Task<IReadOnlyList<Equipment>> GetEquipmentsByTeamLeaderAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _context.Equipment
            .Include(e => e.Stage!)
            .ThenInclude(s => s.Line!)
            .ThenInclude(l => l.UserLines)
            .Where(e => e.Stage != null &&
                        e.Stage.Line != null &&
                        e.Stage.Line.UserLines.Any(ul => ul.UserId == userId))
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Equipment>> GetByLineIdAsync(int lineId, CancellationToken cancellationToken = default)
    {
        return await _context.Equipment
            .Include(e => e.Stage!)
            .ThenInclude(s => s.Line!)
            .ThenInclude(l => l.Department)
            .Where(e => e.Stage != null && e.Stage.LineId == lineId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}
