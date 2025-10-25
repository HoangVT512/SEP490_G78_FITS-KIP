using Microsoft.EntityFrameworkCore;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;

namespace FITSKIP.Infrastructure.Repositories;

public class ProductionOutputRepository : IProductionOutputRepository
{
    private readonly FitskipDbContext _context;

    public ProductionOutputRepository(FitskipDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<ProductionOutput>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.ProductionOutputs
            .Include(po => po.Line)
            .ThenInclude(l => l.Department)
            .Include(po => po.Shift)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductionOutput?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionOutputs
            .Include(po => po.Line)
            .ThenInclude(l => l.Department)
            .Include(po => po.Shift)
            .FirstOrDefaultAsync(po => po.OutputId == id, cancellationToken);
    }

    public async Task<ProductionOutput> CreateAsync(ProductionOutput output, CancellationToken cancellationToken = default)
    {
        await _context.ProductionOutputs.AddAsync(output, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Load the line and shift after saving
        await _context.Entry(output)
            .Reference(po => po.Line)
            .LoadAsync(cancellationToken);

        if (output.Line != null)
        {
            await _context.Entry(output.Line)
                .Reference(l => l.Department)
                .LoadAsync(cancellationToken);
        }

        await _context.Entry(output)
            .Reference(po => po.Shift)
            .LoadAsync(cancellationToken);

        return output;
    }

    public async Task<ProductionOutput?> UpdateAsync(ProductionOutput output, CancellationToken cancellationToken = default)
    {
        _context.ProductionOutputs.Update(output);
        await _context.SaveChangesAsync(cancellationToken);

        // Load the line and shift after updating
        await _context.Entry(output)
            .Reference(po => po.Line)
            .LoadAsync(cancellationToken);

        if (output.Line != null)
        {
            await _context.Entry(output.Line)
                .Reference(l => l.Department)
                .LoadAsync(cancellationToken);
        }

        await _context.Entry(output)
            .Reference(po => po.Shift)
            .LoadAsync(cancellationToken);

        return output;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var output = await _context.ProductionOutputs.FindAsync(new object[] { id }, cancellationToken);
        if (output == null)
            return false;

        _context.ProductionOutputs.Remove(output);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<ProductionOutput>> GetByLineIdAsync(int lineId, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionOutputs
            .Include(po => po.Line)
            .ThenInclude(l => l.Department)
            .Include(po => po.Shift)
            .Where(po => po.LineId == lineId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductionOutput>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionOutputs
            .Include(po => po.Line)
            .ThenInclude(l => l.Department)
            .Include(po => po.Shift)
            .Where(po => po.Date >= startDate && po.Date <= endDate)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductionOutput>> GetByLineAndDateAsync(int lineId, DateTime date, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionOutputs
            .Include(po => po.Line)
            .ThenInclude(l => l.Department)
            .Include(po => po.Shift)
            .Where(po => po.LineId == lineId && po.Date.Date == date.Date)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductionOutput>> GetByLineDateAndShiftAsync(int lineId, DateTime date, int shiftId, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionOutputs
            .Include(po => po.Line)
            .ThenInclude(l => l.Department)
            .Include(po => po.Shift)
            .Where(po => po.LineId == lineId && po.Date.Date == date.Date && po.ShiftId == shiftId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(int lineId, DateTime date, int shiftId, string slotTime, CancellationToken cancellationToken = default)
    {
        return await _context.ProductionOutputs
            .AnyAsync(po => po.LineId == lineId && 
                           po.Date.Date == date.Date && 
                           po.ShiftId == shiftId && 
                           po.SlotTime == slotTime, cancellationToken);
    }
}
