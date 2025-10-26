using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Services;

public class ProductionOutputService : IProductionOutputService
{
    private readonly IProductionOutputRepository _productionOutputRepository;
    private readonly ILineRepository _lineRepository;
    private readonly IShiftRepository _shiftRepository;
    private readonly IIncidentRepository _incidentRepository;

    public ProductionOutputService(
        IProductionOutputRepository productionOutputRepository,
        ILineRepository lineRepository,
        IShiftRepository shiftRepository,
        IIncidentRepository incidentRepository)
    {
        _productionOutputRepository = productionOutputRepository;
        _lineRepository = lineRepository;
        _shiftRepository = shiftRepository;
        _incidentRepository = incidentRepository;
    }

    public async Task<IReadOnlyList<ProductionOutputDTO>> GetProductionOutputsAsync(CancellationToken cancellationToken = default)
    {
        var outputs = await _productionOutputRepository.GetAllAsync(cancellationToken);
        return outputs.Select(ProductionOutputDTO.FromEntity).ToList();
    }

    public async Task<ProductionOutputDTO?> GetProductionOutputByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var output = await _productionOutputRepository.GetByIdAsync(id, cancellationToken);
        return output != null ? ProductionOutputDTO.FromEntity(output) : null;
    }

    public async Task<ProductionOutputDTO> CreateProductionOutputAsync(CreateProductionOutputRequest request, CancellationToken cancellationToken = default)
    {
        // Validate line exists
        var line = await _lineRepository.GetByIdAsync(request.LineId, cancellationToken);
        if (line == null)
            throw new ArgumentException($"Không tìm thấy chuyền sản xuất với ID {request.LineId}");

        // Validate shift exists
        var shift = await _shiftRepository.GetByIdAsync(request.ShiftId, cancellationToken);
        if (shift == null)
            throw new ArgumentException($"Không tìm thấy ca làm việc với ID {request.ShiftId}");

        // Check if slot time already exists for this line, date, shift
        var exists = await _productionOutputRepository.ExistsAsync(request.LineId, request.Date, request.ShiftId, request.SlotTime, cancellationToken);
        if (exists)
            throw new InvalidOperationException($"Sản lượng sản xuất đã tồn tại cho Chuyền {request.LineId}, Ngày {request.Date:yyyy-MM-dd}, Ca {request.ShiftId}, Slot {request.SlotTime}");

        // Calculate loading time based on incidents
        var loadingTime = await CalculateLoadingTimeAsync(request.LineId, request.Date, request.ShiftId, request.SlotTime, cancellationToken);

        // Calculate OEE
        var oee = await CalculateOEEAsync(request.LineId, request.Date, request.ShiftId, request.SlotTime, request.TargetAmount, request.ResultAmount, cancellationToken);

        var productionOutput = new ProductionOutput
        {
            LineId = request.LineId,
            Date = request.Date,
            ShiftId = request.ShiftId,
            SlotTime = request.SlotTime,
            LoadingTime = loadingTime,
            TargetAmount = request.TargetAmount,
            ResultAmount = request.ResultAmount,
            OEE = oee,
            CreatedAt = DateTime.UtcNow
        };

        var createdOutput = await _productionOutputRepository.CreateAsync(productionOutput, cancellationToken);
        return ProductionOutputDTO.FromEntity(createdOutput);
    }

    public async Task<ProductionOutputDTO?> UpdateProductionOutputAsync(int id, UpdateProductionOutputRequest request, CancellationToken cancellationToken = default)
    {
        var output = await _productionOutputRepository.GetByIdAsync(id, cancellationToken);
        if (output == null)
            return null;

        output.TargetAmount = request.TargetAmount;
        output.ResultAmount = request.ResultAmount;
        
        // Recalculate OEE when target or result amount changes
        output.OEE = await CalculateOEEAsync(output.LineId, output.Date, output.ShiftId, output.SlotTime, request.TargetAmount, request.ResultAmount, cancellationToken);
        
        output.UpdatedAt = DateTime.UtcNow;

        var updatedOutput = await _productionOutputRepository.UpdateAsync(output, cancellationToken);
        return updatedOutput != null ? ProductionOutputDTO.FromEntity(updatedOutput) : null;
    }

    public async Task<bool> DeleteProductionOutputAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _productionOutputRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task<IReadOnlyList<ProductionOutputDTO>> GetProductionOutputsByLineAsync(int lineId, CancellationToken cancellationToken = default)
    {
        var outputs = await _productionOutputRepository.GetByLineIdAsync(lineId, cancellationToken);
        return outputs.Select(ProductionOutputDTO.FromEntity).ToList();
    }

    public async Task<IReadOnlyList<ProductionOutputDTO>> GetProductionOutputsByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
    {
        var outputs = await _productionOutputRepository.GetByDateRangeAsync(startDate, endDate, cancellationToken);
        return outputs.Select(ProductionOutputDTO.FromEntity).ToList();
    }

    public async Task<IReadOnlyList<ProductionOutputDTO>> GetProductionOutputsByLineAndDateAsync(int lineId, DateTime date, CancellationToken cancellationToken = default)
    {
        var outputs = await _productionOutputRepository.GetByLineAndDateAsync(lineId, date, cancellationToken);
        return outputs.Select(ProductionOutputDTO.FromEntity).ToList();
    }

    public async Task<IReadOnlyList<SlotTimeResponse>> GetAvailableSlotTimesAsync(ProductionOutputSlotTimeRequest request, CancellationToken cancellationToken = default)
    {
        var slotTimes = new List<SlotTimeResponse>();
        
        // Generate slot times from 7h-8h to 22h-23h
        for (int hour = 7; hour <= 22; hour++)
        {
            var slotTime = $"{hour}h-{hour + 1}h";
            var loadingTime = await CalculateLoadingTimeAsync(request.LineId, request.Date, request.ShiftId, slotTime, cancellationToken);
            
            // Check if slot time already exists
            var exists = await _productionOutputRepository.ExistsAsync(request.LineId, request.Date, request.ShiftId, slotTime, cancellationToken);
            
            slotTimes.Add(new SlotTimeResponse
            {
                SlotTime = slotTime,
                LoadingTime = loadingTime,
                IsAvailable = !exists,
                Reason = exists ? "Slot time đã được sử dụng" : null
            });
        }

        return slotTimes;
    }

    public async Task<int> CalculateLoadingTimeAsync(int lineId, DateTime date, int shiftId, string slotTime, CancellationToken cancellationToken = default)
    {
        // Parse slot time to get start and end hours
        var slotParts = slotTime.Split('-');
        if (slotParts.Length != 2)
            throw new ArgumentException("Định dạng slot time không hợp lệ. Định dạng mong đợi: '7h-8h'");

        var startHour = int.Parse(slotParts[0].Replace("h", ""));
        var endHour = int.Parse(slotParts[1].Replace("h", ""));

        // Create datetime range for the slot
        var slotStart = date.Date.AddHours(startHour);
        var slotEnd = date.Date.AddHours(endHour);

        // Get incidents for this line within the slot time
        var incidents = await _incidentRepository.GetByLineIdAsync(lineId, slotStart, slotEnd, cancellationToken);

        // Calculate total incident duration in minutes
        var totalIncidentDuration = incidents
            .Where(i => i.StartTime.HasValue && i.EndTime.HasValue && i.Duration.HasValue)
            .Sum(i => (int)i.Duration!.Value);

        // Loading time = 60 minutes - incident duration
        var loadingTime = 60 - totalIncidentDuration;

        // Ensure loading time is not negative
        return Math.Max(0, loadingTime);
    }

    public async Task<decimal> CalculateOEEAsync(int lineId, DateTime date, int shiftId, string slotTime, int? targetAmount, int? resultAmount, CancellationToken cancellationToken = default)
    {
        // OEE = Availability × Performance × Quality
        
        // 1. Calculate Availability
        var loadingTime = await CalculateLoadingTimeAsync(lineId, date, shiftId, slotTime, cancellationToken);
        var availability = (decimal)loadingTime / 60; // Convert to percentage (0-1)
        
        // 2. Calculate Performance
        decimal performance = 1.0m; // Default to 100% if no target/result
        if (targetAmount.HasValue && resultAmount.HasValue)
        {
            // Performance = Actual Output / Target Output
            performance = resultAmount.Value > 0 ? (decimal)resultAmount.Value / targetAmount.Value : 0;
        }
        
        // 3. Calculate Quality (simplified - assuming 100% quality for now)
        decimal quality = 1.0m; // Default to 100% quality
        
        // Calculate OEE
        var oee = availability * performance * quality;
        
        // Ensure OEE is between 0 and 1 (0% to 100%)
        return Math.Max(0, Math.Min(1, oee));
    }

    public async Task<OEEResult> CalculateOEEForShiftAsync(int lineId, DateTime date, int shiftId, CancellationToken cancellationToken = default)
    {
        // Get all production outputs for this line, date, and shift
        var outputs = await _productionOutputRepository.GetByLineDateAndShiftAsync(lineId, date, shiftId, cancellationToken);
        
        if (!outputs.Any())
        {
            return new OEEResult
            {
                CalculationType = "shift",
                OEE = 0,
                OEEPercentage = 0
            };
        }

        // Calculate average OEE for all slots in the shift
        decimal totalOEE = 0;
        foreach (var output in outputs)
        {
            var slotOEE = await CalculateOEEAsync(lineId, date, shiftId, output.SlotTime, output.TargetAmount, output.ResultAmount, cancellationToken);
            totalOEE += slotOEE;
        }

        var avgOEE = outputs.Count > 0 ? totalOEE / outputs.Count : 0;

        return new OEEResult
        {
            CalculationType = "shift",
            OEE = avgOEE,
            OEEPercentage = Math.Round(avgOEE * 100, 2)
        };
    }

    public async Task<OEEResult> CalculateOEEForDayAsync(int lineId, DateTime date, CancellationToken cancellationToken = default)
    {
        // Get all production outputs for this line and date
        var outputs = await _productionOutputRepository.GetByLineAndDateAsync(lineId, date, cancellationToken);
        
        if (!outputs.Any())
        {
            return new OEEResult
            {
                CalculationType = "day",
                OEE = 0,
                OEEPercentage = 0
            };
        }

        // Calculate average OEE for all slots in the day
        decimal totalOEE = 0;
        foreach (var output in outputs)
        {
            var slotOEE = await CalculateOEEAsync(lineId, date, output.ShiftId, output.SlotTime, output.TargetAmount, output.ResultAmount, cancellationToken);
            totalOEE += slotOEE;
        }

        var avgOEE = outputs.Count > 0 ? totalOEE / outputs.Count : 0;

        return new OEEResult
        {
            CalculationType = "day",
            OEE = avgOEE,
            OEEPercentage = Math.Round(avgOEE * 100, 2)
        };
    }
}
