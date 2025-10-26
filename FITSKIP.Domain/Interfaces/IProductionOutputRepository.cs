using FITSKIP.Domain.Entities;

namespace FITSKIP.Domain.Interfaces;

public interface IProductionOutputRepository
{
    Task<IReadOnlyList<ProductionOutput>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<ProductionOutput?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductionOutput> CreateAsync(ProductionOutput output, CancellationToken cancellationToken = default);
    Task<ProductionOutput?> UpdateAsync(ProductionOutput output, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOutput>> GetByLineIdAsync(int lineId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOutput>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOutput>> GetByLineAndDateAsync(int lineId, DateTime date, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOutput>> GetByLineDateAndShiftAsync(int lineId, DateTime date, int shiftId, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(int lineId, DateTime date, int shiftId, string slotTime, CancellationToken cancellationToken = default);
}
