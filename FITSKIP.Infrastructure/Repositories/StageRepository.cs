using Microsoft.EntityFrameworkCore;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;

namespace FITSKIP.Infrastructure.Repositories;

public class StageRepository : IStageRepository
{
    private readonly FitskipDbContext _context;

    public StageRepository(FitskipDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<Stage>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Stages
            .Include(s => s.Line)
            .ThenInclude(l => l.Department)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Stage?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Stages
            .Include(s => s.Line)
            .ThenInclude(l => l.Department)
            .Include(s => s.Equipment)
            .FirstOrDefaultAsync(s => s.StageId == id, cancellationToken);
    }

    public async Task<Stage> CreateAsync(Stage stage, CancellationToken cancellationToken = default)
    {
        await _context.Stages.AddAsync(stage, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        
        // Load the line and department after saving
        await _context.Entry(stage)
            .Reference(s => s.Line)
            .LoadAsync(cancellationToken);
            
        if (stage.Line != null)
        {
            await _context.Entry(stage.Line)
                .Reference(l => l.Department)
                .LoadAsync(cancellationToken);
        }
            
        return stage;
    }

    public async Task<Stage?> UpdateAsync(Stage stage, CancellationToken cancellationToken = default)
    {
        _context.Stages.Update(stage);
        await _context.SaveChangesAsync(cancellationToken);
        
        // Load the line and department after updating
        await _context.Entry(stage)
            .Reference(s => s.Line)
            .LoadAsync(cancellationToken);
            
        if (stage.Line != null)
        {
            await _context.Entry(stage.Line)
                .Reference(l => l.Department)
                .LoadAsync(cancellationToken);
        }
            
        return stage;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var stage = await GetByIdAsync(id, cancellationToken);
        if (stage == null)
            return false;

        _context.Stages.Remove(stage);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<Stage>> GetByLineIdAsync(int lineId, CancellationToken cancellationToken = default)
    {
        return await _context.Stages
            .Include(s => s.Line)
            .ThenInclude(l => l.Department)
            .Where(s => s.LineId == lineId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasDependenciesAsync(int stageId, CancellationToken cancellationToken = default)
    {
        // Check if stage has any equipment
        var hasEquipment = await _context.Equipment.AnyAsync(e => e.StageId == stageId, cancellationToken);
        if (hasEquipment) return true;

        // Check if stage has any production outputs
        var hasProductionOutputs = await _context.ProductionOutputs.AnyAsync(p => p.StageId == stageId, cancellationToken);
        if (hasProductionOutputs) return true;

        // Check if stage has any error histories
        var hasErrorHistories = await _context.ErrorHistories.AnyAsync(e => e.StageId == stageId, cancellationToken);
        if (hasErrorHistories) return true;

        return false;
    }
}