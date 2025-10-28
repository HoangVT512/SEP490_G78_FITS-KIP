using FITSKIP.Domain.Entities;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces;

public interface IProductionOutputService
{
    Task<IReadOnlyList<ProductionOutputDTO>> GetProductionOutputsAsync(CancellationToken cancellationToken = default);
    Task<ProductionOutputDTO?> GetProductionOutputByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductionOutputDTO> CreateProductionOutputAsync(CreateProductionOutputRequest request, CancellationToken cancellationToken = default);
    Task<ProductionOutputDTO?> UpdateProductionOutputAsync(int id, UpdateProductionOutputRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteProductionOutputAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOutputDTO>> GetProductionOutputsByLineAsync(int lineId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOutputDTO>> GetProductionOutputsByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductionOutputDTO>> GetProductionOutputsByLineAndDateAsync(int lineId, DateTime date, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<SlotTimeResponse>> GetAvailableSlotTimesAsync(ProductionOutputSlotTimeRequest request, CancellationToken cancellationToken = default);
    // Task<int> CalculateLoadingTimeAsync(int lineId, DateTime date, int shiftId, string slotTime, CancellationToken cancellationToken = default);
    // Task<decimal> CalculateOEEAsync(int lineId, DateTime date, int shiftId, string slotTime, int? targetAmount, int? resultAmount, CancellationToken cancellationToken = default);
    // Cập nhật signature của CalculateLoadingTimeAsync và CalculateOEEAsync
    Task<int> CalculateLoadingTimeAsync(int lineId, DateTime date, int shiftId, string slotTime, int? providedLoadingTime = null, CancellationToken cancellationToken = default);
    Task<decimal> CalculateOEEAsync(int lineId, DateTime date, int shiftId, string slotTime, int? targetAmount, int? resultAmount, int runTime, CancellationToken cancellationToken = default);
    Task<OEEResult> CalculateOEEForShiftAsync(int lineId, DateTime date, int shiftId, CancellationToken cancellationToken = default);
    Task<OEEResult> CalculateOEEForDayAsync(int lineId, DateTime date, CancellationToken cancellationToken = default);
}
