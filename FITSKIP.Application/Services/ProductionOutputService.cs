using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Exceptions;
using System.Text.RegularExpressions;

namespace FITSKIP.Application.Services;

public class ProductionOutputService : IProductionOutputService
{
    private readonly IProductionOutputRepository _productionOutputRepository;
    private readonly ILineRepository _lineRepository;
    private readonly IShiftRepository _shiftRepository;
    private readonly IIncidentRepository _incidentRepository;
    private readonly INotificationService _notificationService;

    public ProductionOutputService(
        IProductionOutputRepository productionOutputRepository,
        ILineRepository lineRepository,
        IShiftRepository shiftRepository,
        IIncidentRepository incidentRepository,
        INotificationService notificationService)
    {
        _productionOutputRepository = productionOutputRepository;
        _lineRepository = lineRepository;
        _shiftRepository = shiftRepository;
        _incidentRepository = incidentRepository;
        _notificationService = notificationService;
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

    // Validation-enabled method
    public async Task<ProductionOutputDTO> CreateProductionOutputAsync(CreateProductionOutputRequest request, CancellationToken cancellationToken = default)
    {
        // Validate line ID existence
        await ValidateLineIdAsync(request.LineId, cancellationToken);

        // Validate shift ID existence
        await ValidateShiftIdAsync(request.ShiftId, cancellationToken);

        // Validate date
        ValidateDate(request.Date);

        // Validate slot time format
        ValidateSlotTime(request.SlotTime);

        // Check if slot time already exists for this line, date, shift
        var exists = await _productionOutputRepository.ExistsAsync(request.LineId, request.Date, request.ShiftId, request.SlotTime, cancellationToken);
        if (exists)
        {
            throw new ProductionOutputValidationException(
                $"Sản lượng sản xuất đã tồn tại cho Chuyền {request.LineId}, Ngày {request.Date:yyyy-MM-dd}, Ca {request.ShiftId}, Slot {request.SlotTime}",
                "PRODUCTION_OUTPUT_DUPLICATE_SLOT",
                new {
                    LineId = request.LineId,
                    Date = request.Date,
                    ShiftId = request.ShiftId,
                    SlotTime = request.SlotTime
                });
        }

        // Validate target amount if provided
        if (request.TargetAmount.HasValue)
        {
            ValidateTargetAmount(request.TargetAmount.Value);
        }

        // Validate result amount if provided
        if (request.ResultAmount.HasValue)
        {
            ValidateResultAmount(request.ResultAmount.Value);
        }

        // Validate loading time if provided
        if (request.LoadingTime.HasValue)
        {
            ValidateLoadingTime(request.LoadingTime.Value, request.SlotTime);
        }

        // Business rule: Result amount should not exceed target amount significantly
        if (request.TargetAmount.HasValue && request.ResultAmount.HasValue)
        {
            ValidateProductionAmounts(request.TargetAmount.Value, request.ResultAmount.Value);
        }

        // Tính Run Time = Loading Time nhập - downtime
        int runTime = await CalculateLoadingTimeAsync(request.LineId, request.Date, request.ShiftId, request.SlotTime, request.LoadingTime, cancellationToken);

        //var oee = await CalculateOEEAsync(request.LineId, request.Date, request.ShiftId, request.SlotTime, request.TargetAmount, request.ResultAmount, runTime, cancellationToken);

        // ✅ THÊM: Chỉ tính OEE nếu đủ dữ liệu
        decimal? oee = null;
        if (request.TargetAmount.HasValue && request.ResultAmount.HasValue && request.TargetAmount.Value > 0 && request.ResultAmount.Value > 0)
        {
            oee = await CalculateOEEAsync(request.LineId, request.Date, request.ShiftId, request.SlotTime, request.TargetAmount, request.ResultAmount, runTime, cancellationToken);
        }

        var productionOutput = new ProductionOutput
        {
            LineId = request.LineId,
            Date = request.Date,
            ShiftId = request.ShiftId,
            SlotTime = request.SlotTime,
            LoadingTime = request.LoadingTime ?? 60, // Lưu Loading Time nhập (hoặc 60 mặc định)
            TargetAmount = request.TargetAmount,
            ResultAmount = request.ResultAmount,
            OEE = oee,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdOutput = await _productionOutputRepository.CreateAsync(productionOutput, cancellationToken);

        // Broadcast to Managers group for OEE Dashboard realtime updates
        try
        {
            var line = await _lineRepository.GetByIdAsync(request.LineId, cancellationToken);
            var shift = await _shiftRepository.GetByIdAsync(request.ShiftId, cancellationToken);

            Console.WriteLine($"📡 Broadcasting production output creation to Managers group for OEE Dashboard");
            await _notificationService.SendNotificationToGroupAsync(
                "Managers",
                "", // Không cần title - chỉ cần trigger refresh
                "", // Không cần message - chỉ cần trigger refresh  
                "production",
                "production" // dataType = "production" để OEE Dashboard reload
            );
            Console.WriteLine($"✅ Broadcast to Managers group completed for production output creation");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error broadcasting production output creation: {ex.Message}");
        }

        return ProductionOutputDTO.FromEntity(createdOutput);
    }

    // Cập nhật UpdateProductionOutputAsync
    // public async Task<ProductionOutputDTO?> UpdateProductionOutputAsync(int id, UpdateProductionOutputRequest request, CancellationToken cancellationToken = default)
    // {
    //     var output = await _productionOutputRepository.GetByIdAsync(id, cancellationToken);
    //     if (output == null) return null;

    //     // Only update fields that are provided (not null)
    //     if (request.LoadingTime.HasValue)
    //         output.LoadingTime = request.LoadingTime.Value;

    //     if (request.TargetAmount.HasValue)
    //         output.TargetAmount = request.TargetAmount.Value;

    //     if (request.ResultAmount.HasValue)
    //         output.ResultAmount = request.ResultAmount.Value;

    //     // Tính Run Time = Loading Time cập nhật - downtime
    //     int runTime = await CalculateLoadingTimeAsync(output.LineId, output.Date, output.ShiftId, output.SlotTime, output.LoadingTime, cancellationToken);

    //     // Recalculate OEE based on updated values
    //     output.OEE = await CalculateOEEAsync(
    //         output.LineId,
    //         output.Date,
    //         output.ShiftId,
    //         output.SlotTime,
    //         output.TargetAmount,
    //         output.ResultAmount,
    //         runTime,
    //         cancellationToken);

    //     output.UpdatedAt = DateTime.UtcNow;
    //     var updatedOutput = await _productionOutputRepository.UpdateAsync(output, cancellationToken);
    //     return updatedOutput != null ? ProductionOutputDTO.FromEntity(updatedOutput) : null;
    // }

    public async Task<ProductionOutputDTO?> UpdateProductionOutputAsync(int id, UpdateProductionOutputRequest request, CancellationToken cancellationToken = default)
    {
        var output = await _productionOutputRepository.GetByIdAsync(id, cancellationToken);
        if (output == null)
        {
            throw new ProductionOutputValidationException(
                $"Không tìm thấy sản lượng sản xuất với ID {id}",
                "PRODUCTION_OUTPUT_NOT_FOUND",
                new { OutputId = id });
        }

        // Validate target amount if provided
        if (request.TargetAmount.HasValue)
        {
            ValidateTargetAmount(request.TargetAmount.Value);
        }

        // Validate result amount if provided
        if (request.ResultAmount.HasValue)
        {
            ValidateResultAmount(request.ResultAmount.Value);
        }

        // Validate loading time if provided
        if (request.LoadingTime.HasValue)
        {
            ValidateLoadingTime(request.LoadingTime.Value, output.SlotTime);
        }

        // Business rule: Result amount should not exceed target amount significantly
        if (request.TargetAmount.HasValue && request.ResultAmount.HasValue)
        {
            ValidateProductionAmounts(request.TargetAmount.Value, request.ResultAmount.Value);
        }
        else if (request.TargetAmount.HasValue && output.ResultAmount.HasValue)
        {
            ValidateProductionAmounts(request.TargetAmount.Value, output.ResultAmount.Value);
        }
        else if (output.TargetAmount.HasValue && request.ResultAmount.HasValue)
        {
            ValidateProductionAmounts(output.TargetAmount.Value, request.ResultAmount.Value);
        }

        // ✅ SỬA: Update fields - cho phép set thành null để xóa dữ liệu
        if (request.LoadingTime.HasValue)
            output.LoadingTime = request.LoadingTime.Value;
        // TargetAmount và ResultAmount có thể set thành null
        output.TargetAmount = request.TargetAmount;
        output.ResultAmount = request.ResultAmount;

        // ✅ THÊM: Chỉ tính OEE nếu cả target và result đều có và >0
        if (output.TargetAmount.HasValue && output.ResultAmount.HasValue && output.TargetAmount.Value > 0 && output.ResultAmount.Value > 0)
        {
            // Tính Run Time và OEE như cũ
            int runTime = await CalculateLoadingTimeAsync(output.LineId, output.Date, output.ShiftId, output.SlotTime, output.LoadingTime, cancellationToken);
            output.OEE = await CalculateOEEAsync(output.LineId, output.Date, output.ShiftId, output.SlotTime, output.TargetAmount, output.ResultAmount, runTime, cancellationToken);
        }
        else
        {
            // Nếu thiếu dữ liệu, không tính OEE (set null để tránh sai)
            output.OEE = null;
        }

        // ❌ LOẠI BỎ: Không cần gọi lại CalculateOEEAsync ở đây, vì đã tính trong if
        // output.OEE = await CalculateOEEAsync(...);

        output.UpdatedAt = DateTime.UtcNow;
        var updatedOutput = await _productionOutputRepository.UpdateAsync(output, cancellationToken);

        // Broadcast to Managers group for OEE Dashboard realtime updates
        if (updatedOutput != null)
        {
            try
            {
                var line = await _lineRepository.GetByIdAsync(output.LineId, cancellationToken);
                var shift = await _shiftRepository.GetByIdAsync(output.ShiftId, cancellationToken);

                Console.WriteLine($"📡 Broadcasting production output update to Managers group for OEE Dashboard");
                await _notificationService.SendNotificationToGroupAsync(
                    "Managers",
                    "", // Không cần title - chỉ cần trigger refresh
                    "", // Không cần message - chỉ cần trigger refresh
                    "production",
                    "production" // dataType = "production" để OEE Dashboard reload
                );
                Console.WriteLine($"✅ Broadcast to Managers group completed for production output update");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error broadcasting production output update: {ex.Message}");
            }
        }

        return updatedOutput != null ? ProductionOutputDTO.FromEntity(updatedOutput) : null;
    }


    public async Task<bool> DeleteProductionOutputAsync(int id, CancellationToken cancellationToken = default)
    {
        // Get production output info before deleting for notification
        var output = await _productionOutputRepository.GetByIdAsync(id, cancellationToken);

        var result = await _productionOutputRepository.DeleteAsync(id, cancellationToken);

        // Broadcast to Managers group for OEE Dashboard realtime updates
        if (result && output != null)
        {
            try
            {
                var line = await _lineRepository.GetByIdAsync(output.LineId, cancellationToken);
                var shift = await _shiftRepository.GetByIdAsync(output.ShiftId, cancellationToken);

                Console.WriteLine($"📡 Broadcasting production output deletion to Managers group for OEE Dashboard");
                await _notificationService.SendNotificationToGroupAsync(
                    "Managers",
                    "", // Không cần title - chỉ cần trigger refresh
                    "", // Không cần message - chỉ cần trigger refresh
                    "production",
                    "production" // dataType = "production" để OEE Dashboard reload
                );
                Console.WriteLine($"✅ Broadcast to Managers group completed for production output deletion");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error broadcasting production output deletion: {ex.Message}");
            }
        }

        return result;
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

    // Cập nhật GetAvailableSlotTimesAsync
    public async Task<IReadOnlyList<SlotTimeResponse>> GetAvailableSlotTimesAsync(ProductionOutputSlotTimeRequest request, CancellationToken cancellationToken = default)
    {
        var slotTimes = new List<SlotTimeResponse>();
        // Generate slot times from 7h-8h to 22h-23h
        for (int hour = 7; hour <= 22; hour++)
        {
            var slotTime = $"{hour}h-{hour + 1}h";
            // Sửa: Truyền providedLoadingTime = null (vì không có Loading Time nhập) và cancellationToken ở cuối
            var loadingTime = await CalculateLoadingTimeAsync(request.LineId, request.Date, request.ShiftId, slotTime, null, cancellationToken);
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

    // Cập nhật CalculateLoadingTimeAsync để nhận Loading Time nhập và tính Run Time = Loading Time - downtime
    public async Task<int> CalculateLoadingTimeAsync(int lineId, DateTime date, int shiftId, string slotTime, int? providedLoadingTime = null, CancellationToken cancellationToken = default)
    {
        // Hỗ trợ cả "07:00-08:00" và "7h-8h"
        // Chuẩn hóa các loại dấu gạch ngang
        var normalizedSlotTime = slotTime.Replace("–", "-").Replace("—", "-").Replace("−", "-").Trim();

        int startHour, endHour;
        
        // Parse theo format
        if (normalizedSlotTime.Contains("h"))
        {
            // Format: "7h-8h" hoặc "07h-08h"
            var parts = normalizedSlotTime.Replace("h", "").Split('-');
            if (parts.Length != 2 || !int.TryParse(parts[0], out startHour) || !int.TryParse(parts[1], out endHour))
                throw new ArgumentException("Định dạng slot time không hợp lệ. Định dạng mong đợi: '7h-8h'");
        }
        else if (normalizedSlotTime.Contains(":"))
        {
            // Format: "07:00-08:00"
            var parts = normalizedSlotTime.Split('-');
            if (parts.Length != 2)
                throw new ArgumentException("Định dạng slot time không hợp lệ. Định dạng mong đợi: '07:00-08:00'");
            
            var startParts = parts[0].Split(':');
            var endParts = parts[1].Split(':');
            
            if (startParts.Length < 2 || endParts.Length < 2 ||
                !int.TryParse(startParts[0], out startHour) || !int.TryParse(endParts[0], out endHour))
            {
                throw new ArgumentException("Không thể parse giờ từ slot time");
            }
        }
        else
        {
            throw new ArgumentException("Định dạng slot time không hợp lệ. Định dạng mong đợi: '7h-8h' hoặc '07:00-08:00'");
        }

        // Tạo range thời gian
        var slotStart = date.Date.AddHours(startHour);
        var slotEnd = date.Date.AddHours(endHour);

        // Tính downtime từ incidents, accounting for crossover
        var totalIncidentDuration = await CalculateDowntimeForSlotAsync(lineId, slotStart, slotEnd, cancellationToken);

        // Run Time = Loading Time nhập - downtime (nếu không nhập, dùng 60 - downtime)
        var baseLoadingTime = providedLoadingTime ?? 60;
        var runTime = (int)(baseLoadingTime - totalIncidentDuration);
        return Math.Max(0, runTime); // Đảm bảo không âm
    }


    // Cập nhật CalculateOEEAsync để nhận runTime làm tham số (tính từ CalculateLoadingTimeAsync)
    public async Task<decimal> CalculateOEEAsync(int lineId, DateTime date, int shiftId, string slotTime, int? targetAmount, int? resultAmount, int runTime, CancellationToken cancellationToken = default)
    {
        // OEE = Availability × Performance × Quality

        // 1. Constants
        const decimal PlannedProductionTime = 60.0m; // Luôn 60 phút

        // 2. Calculate Availability (A)
        decimal availability = runTime / PlannedProductionTime; // A = Run Time / Planned Production Time ≤ 1.0

        // 3. Calculate Performance (P)
        decimal performance = 1.0m; // Default
        decimal idealCycleTime = 0.0m;
        if (targetAmount.HasValue && targetAmount.Value > 0)
        {
            idealCycleTime = PlannedProductionTime / targetAmount.Value; // Ideal Cycle Time = Planned Production Time / Target Amount
        }
        if (resultAmount.HasValue && runTime > 0)
        {
            performance = (idealCycleTime * resultAmount.Value) / runTime; // P = (Ideal Cycle Time × Total Result Amount) / Run Time
        }

        // 4. Calculate Quality (Q) from IncidentHistory TypeId=3 (Defective Count)
        decimal quality = 1.0m; // Default to 100%
        if (resultAmount.HasValue && resultAmount.Value > 0)
        {
            // Parse slot time to get start and end hours
            var normalizedSlotTime = slotTime.Replace("–", "-").Replace("—", "-").Replace("−", "-").Trim();
            
            int startHour = 0, endHour = 0;
            bool parsed = false;
            
            if (normalizedSlotTime.Contains("h"))
            {
                var parts = normalizedSlotTime.Replace("h", "").Split('-');
                if (parts.Length == 2 && int.TryParse(parts[0], out startHour) && int.TryParse(parts[1], out endHour))
                {
                    parsed = true;
                }
            }
            else if (normalizedSlotTime.Contains(":"))
            {
                var parts = normalizedSlotTime.Split('-');
                if (parts.Length == 2)
                {
                    var startParts = parts[0].Split(':');
                    var endParts = parts[1].Split(':');
                    if (startParts.Length >= 2 && endParts.Length >= 2 &&
                        int.TryParse(startParts[0], out startHour) && int.TryParse(endParts[0], out endHour))
                    {
                        parsed = true;
                    }
                }
            }
            
            if (parsed)
            {
                var slotStart = date.Date.AddHours(startHour);
                var slotEnd = date.Date.AddHours(endHour);

                // Query Defective Count (TypeId=3) from IncidentHistory
                var defectiveIncidents = await _incidentRepository.GetIncidentsByLineDateShiftSlotAsync(lineId, date, shiftId, slotStart, slotEnd, cancellationToken);
                int defectiveCount = defectiveIncidents.Count(i => i.TypeId == 3); // TypeId=3 for defects

                int goodCount = resultAmount.Value - defectiveCount;
                quality = (decimal)goodCount / resultAmount.Value; // Q = Good Count / Total Result Amount ≤ 1.0
            }
        }

        // 5. Calculate OEE without capping P
        var oee = availability * performance * quality;
        var clampedOee = Math.Max(0, Math.Min(1, oee)); // Đảm bảo OEE ≤ 1.0 nếu cần, nhưng theo logic, để P > 100% ảnh hưởng

        // Trả về phần trăm, làm tròn 2 chữ số
        return Math.Round(clampedOee * 100, 2);
    }

    // Cập nhật CalculateOEEForShiftAsync
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
            // Sửa: Tính runTime từ CalculateLoadingTimeAsync với providedLoadingTime = output.LoadingTime
            int runTime = await CalculateLoadingTimeAsync(lineId, date, shiftId, output.SlotTime, output.LoadingTime, cancellationToken);
            // Sửa: Truyền runTime và cancellationToken
            var slotOEE = await CalculateOEEAsync(lineId, date, shiftId, output.SlotTime, output.TargetAmount, output.ResultAmount, runTime, cancellationToken);
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

    // Cập nhật CalculateOEEForDayAsync
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
            // Sửa: Tính runTime từ CalculateLoadingTimeAsync với providedLoadingTime = output.LoadingTime
            int runTime = await CalculateLoadingTimeAsync(lineId, date, output.ShiftId, output.SlotTime, output.LoadingTime, cancellationToken);
            // Sửa: Truyền runTime và cancellationToken
            var slotOEE = await CalculateOEEAsync(lineId, date, output.ShiftId, output.SlotTime, output.TargetAmount, output.ResultAmount, runTime, cancellationToken);
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

    // Cập nhật CalculateSequentialLossesAsync (nếu cần, để dùng runTime)
    public async Task<LossResult> CalculateSequentialLossesAsync(int lineId, DateTime date, int shiftId, string slotTime, int? targetAmount, int? resultAmount, CancellationToken cancellationToken = default)
    {
        const decimal PlannedProductionTime = 60.0m;
        var runTime = await CalculateLoadingTimeAsync(lineId, date, shiftId, slotTime, null, cancellationToken); // Có thể truyền Loading Time nếu cần

        // Parse slot for incidents
        var normalizedSlotTime = slotTime.Replace("–", "-").Replace("—", "-").Replace("−", "-").Trim();
        DateTime slotStart = date.Date, slotEnd = date.Date;
        
        int startHour, endHour;
        if (normalizedSlotTime.Contains("h"))
        {
            var parts = normalizedSlotTime.Replace("h", "").Split('-');
            if (parts.Length == 2 && int.TryParse(parts[0], out startHour) && int.TryParse(parts[1], out endHour))
            {
                slotStart = date.Date.AddHours(startHour);
                slotEnd = date.Date.AddHours(endHour);
            }
        }
        else if (normalizedSlotTime.Contains(":"))
        {
            var parts = normalizedSlotTime.Split('-');
            if (parts.Length == 2)
            {
                var startParts = parts[0].Split(':');
                var endParts = parts[1].Split(':');
                if (startParts.Length >= 2 && endParts.Length >= 2 &&
                    int.TryParse(startParts[0], out startHour) && int.TryParse(endParts[0], out endHour))
                {
                    slotStart = date.Date.AddHours(startHour);
                    slotEnd = date.Date.AddHours(endHour);
                }
            }
        }

        // A Loss: Downtime from TypeId 1,2,4,5, accounting for crossover
        var aLossMinutes = (decimal)await CalculateDowntimeForSlotAsync(lineId, slotStart, slotEnd, cancellationToken);

        // Get incidents for defective count
        var incidents = await _incidentRepository.GetIncidentsByLineDateShiftSlotAsync(lineId, date, shiftId, slotStart, slotEnd, cancellationToken);
        var aLossPercentage = (aLossMinutes / PlannedProductionTime) * 100;

        // Q Loss: Defective time (TypeId=3 × Ideal Cycle Time)
        decimal idealCycleTime = targetAmount.HasValue && targetAmount.Value > 0 ? PlannedProductionTime / targetAmount.Value : 0;
        var defectiveCount = incidents.Count(i => i.TypeId == 3);
        var qLossMinutes = defectiveCount * idealCycleTime;
        var qLossPercentage = (qLossMinutes / PlannedProductionTime) * 100;

        // P Loss: Performance Loss = (1 - effectivePerformance) × 100%
        decimal effectivePerformance = 1.0m; // Giả sử tính từ CalculateOEEAsync, hoặc tính lại ở đây
        if (targetAmount.HasValue && targetAmount.Value > 0 && runTime > 0)
        {
            decimal idealCycleTimeForPerformance = PlannedProductionTime / targetAmount.Value;  // Đổi tên để tránh lỗi
            decimal performance = (idealCycleTimeForPerformance * (resultAmount ?? 0)) / runTime;
            effectivePerformance = Math.Min(performance, 1.0m);
        }
        var pLossPercentage = (1 - effectivePerformance) * 100;


        // Cập nhật Total Loss:
        return new LossResult
        {
            ALossPercentage = Math.Round(aLossPercentage, 2),
            PLossPercentage = Math.Round(pLossPercentage, 2),  // Thêm P Loss
            QLossPercentage = Math.Round(qLossPercentage, 2),
            TotalLossPercentage = Math.Round(aLossPercentage + pLossPercentage + qLossPercentage, 2)  // Cập nhật Total
        };
    }

    public class LossResult
    {
        public decimal ALossPercentage { get; set; }
        public decimal QLossPercentage { get; set; }
        public decimal PLossPercentage { get; set; }
        public decimal TotalLossPercentage { get; set; }
    }

    // Helper method to calculate max loading time based on slot time
    private static int CalculateMaxLoadingTime(string slotTime)
    {
        // Chuẩn hóa các loại dấu gạch ngang
        var normalizedSlotTime = slotTime.Replace("–", "-").Replace("—", "-").Replace("−", "-").Trim();
        
        int startHour, endHour;
        
        if (normalizedSlotTime.Contains("h"))
        {
            // Format: "7h-8h"
            var parts = normalizedSlotTime.Replace("h", "").Split('-');
            if (parts.Length != 2 || !int.TryParse(parts[0], out startHour) || !int.TryParse(parts[1], out endHour))
            {
                throw new ArgumentException("Định dạng slot time không hợp lệ.");
            }
        }
        else if (normalizedSlotTime.Contains(":"))
        {
            // Format: "07:00-08:00"
            var parts = normalizedSlotTime.Split('-');
            if (parts.Length != 2)
            {
                throw new ArgumentException("Định dạng slot time không hợp lệ.");
            }
            
            var startParts = parts[0].Split(':');
            var endParts = parts[1].Split(':');
            
            if (startParts.Length < 2 || endParts.Length < 2 ||
                !int.TryParse(startParts[0], out startHour) || !int.TryParse(endParts[0], out endHour))
            {
                throw new ArgumentException("Định dạng slot time không hợp lệ.");
            }
        }
        else
        {
            throw new ArgumentException("Định dạng slot time không hợp lệ.");
        }
        
        // Max loading time = (endHour - startHour) * 60
        return (endHour - startHour) * 60;
    }

    // Helper method to calculate total downtime for a specific slot, accounting for crossover incidents
    private async Task<double> CalculateDowntimeForSlotAsync(int lineId, DateTime slotStart, DateTime slotEnd, CancellationToken cancellationToken = default)
    {
        var incidents = await _incidentRepository.GetByLineIdAsync(lineId, slotStart.Date, slotStart.Date.AddDays(1), cancellationToken);
        double totalDowntime = 0;
        foreach (var incident in incidents)
        {
            if (!incident.StartTime.HasValue || !incident.Duration.HasValue || incident.TypeId == 3) continue; // Exclude defects

            var incidentStart = incident.StartTime.Value;
            var incidentEnd = incidentStart.AddMinutes((double)incident.Duration.Value);

            // Calculate overlap with the slot
            var overlapStart = incidentStart > slotStart ? incidentStart : slotStart;
            var overlapEnd = incidentEnd < slotEnd ? incidentEnd : slotEnd;

            if (overlapStart < overlapEnd)
            {
                var overlapMinutes = (overlapEnd - overlapStart).TotalMinutes;
                totalDowntime += overlapMinutes;
            }
        }
        return totalDowntime;
    }

    private async Task ValidateLineIdAsync(int lineId, CancellationToken cancellationToken)
    {
        var line = await _lineRepository.GetByIdAsync(lineId, cancellationToken);
        if (line == null)
        {
            throw new ProductionOutputValidationException(
                $"Không tìm thấy chuyền sản xuất với ID {lineId}",
                "LINE_NOT_FOUND",
                new { LineId = lineId });
        }
    }

    private async Task ValidateShiftIdAsync(int shiftId, CancellationToken cancellationToken)
    {
        var shift = await _shiftRepository.GetByIdAsync(shiftId, cancellationToken);
        if (shift == null)
        {
            throw new ProductionOutputValidationException(
                $"Không tìm thấy ca làm việc với ID {shiftId}",
                "SHIFT_NOT_FOUND",
                new { ShiftId = shiftId });
        }
    }

    private void ValidateDate(DateTime date)
    {
        if (date > DateTime.Now.AddDays(1)) // Allow 1 day in future for planning
        {
            throw new ProductionOutputValidationException(
                "Ngày sản xuất không được ở quá xa trong tương lai",
                "PRODUCTION_OUTPUT_DATE_TOO_FUTURE",
                new { Date = date, MaxAllowed = DateTime.Now.AddDays(1) });
        }

        if (date < new DateTime(2020, 1, 1))
        {
            throw new ProductionOutputValidationException(
                "Ngày sản xuất không được nhỏ hơn năm 2020",
                "PRODUCTION_OUTPUT_DATE_TOO_OLD",
                new { Date = date, MinAllowed = new DateTime(2020, 1, 1) });
        }
    }

    private void ValidateSlotTime(string slotTime)
    {
        if (string.IsNullOrWhiteSpace(slotTime))
        {
            throw new ProductionOutputValidationException(
                "Thời gian slot không được để trống",
                "PRODUCTION_OUTPUT_SLOT_TIME_REQUIRED");
        }

        // Chuẩn hóa các loại dấu gạch ngang
        var normalizedSlotTime = slotTime.Replace("–", "-").Replace("—", "-").Replace("−", "-").Trim();

        int startHour, endHour;
        bool isValidFormat = false;

        // Validate slot time format: support both "7h-8h" and "7:00-8:00" formats
        var slotPatternH = @"^\d{1,2}h-\d{1,2}h$"; // Format: 7h-8h
        var slotPatternColon = @"^\d{1,2}:\d{2}-\d{1,2}:\d{2}$"; // Format: 7:00-8:00
        
        if (Regex.IsMatch(normalizedSlotTime, slotPatternH))
        {
            // Parse format "7h-8h"
            var parts = normalizedSlotTime.Replace("h", "").Split('-');
            if (parts.Length == 2 && int.TryParse(parts[0], out startHour) && int.TryParse(parts[1], out endHour))
            {
                isValidFormat = true;
            }
            else
            {
                throw new ProductionOutputValidationException(
                    "Thời gian slot phải có định dạng 'Xh-Yh' (VD: 7h-8h) hoặc 'X:00-Y:00' (VD: 7:00-8:00)",
                    "PRODUCTION_OUTPUT_SLOT_TIME_INVALID_FORMAT",
                    new { SlotTime = slotTime });
            }
        }
        else if (Regex.IsMatch(normalizedSlotTime, slotPatternColon))
        {
            // Parse format "07:00-08:00"
            var parts = normalizedSlotTime.Split('-');
            if (parts.Length == 2)
            {
                var startParts = parts[0].Split(':');
                var endParts = parts[1].Split(':');
                
                if (startParts.Length >= 2 && endParts.Length >= 2 &&
                    int.TryParse(startParts[0], out startHour) && int.TryParse(endParts[0], out endHour))
                {
                    isValidFormat = true;
                }
                else
                {
                    throw new ProductionOutputValidationException(
                        "Thời gian slot phải có định dạng 'Xh-Yh' (VD: 7h-8h) hoặc 'X:00-Y:00' (VD: 7:00-8:00)",
                        "PRODUCTION_OUTPUT_SLOT_TIME_INVALID_FORMAT",
                        new { SlotTime = slotTime });
                }
            }
            else
            {
                throw new ProductionOutputValidationException(
                    "Thời gian slot phải có định dạng 'Xh-Yh' (VD: 7h-8h) hoặc 'X:00-Y:00' (VD: 7:00-8:00)",
                    "PRODUCTION_OUTPUT_SLOT_TIME_INVALID_FORMAT",
                    new { SlotTime = slotTime });
            }
        }
        else
        {
            throw new ProductionOutputValidationException(
                "Thời gian slot phải có định dạng 'Xh-Yh' (VD: 7h-8h) hoặc 'X:00-Y:00' (VD: 7:00-8:00)",
                "PRODUCTION_OUTPUT_SLOT_TIME_INVALID_FORMAT",
                new { SlotTime = slotTime });
        }

        // Validate hour range (0-23)
        if (isValidFormat)
        {
            if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23)
            {
                throw new ProductionOutputValidationException(
                    "Giờ trong slot phải từ 0 đến 23",
                    "PRODUCTION_OUTPUT_SLOT_TIME_INVALID_HOURS",
                    new { SlotTime = slotTime, StartHour = startHour, EndHour = endHour });
            }

            if (startHour >= endHour)
            {
                throw new ProductionOutputValidationException(
                    "Giờ bắt đầu phải nhỏ hơn giờ kết thúc",
                    "PRODUCTION_OUTPUT_SLOT_TIME_INVALID_RANGE",
                    new { SlotTime = slotTime, StartHour = startHour, EndHour = endHour });
            }
        }
    }

    private void ValidateTargetAmount(int targetAmount)
    {
        if (targetAmount <= 0)
        {
            throw new ProductionOutputValidationException(
                "Số lượng mục tiêu phải lớn hơn 0",
                "PRODUCTION_OUTPUT_TARGET_AMOUNT_INVALID",
                new { TargetAmount = targetAmount });
        }

        if (targetAmount > 10000)
        {
            throw new ProductionOutputValidationException(
                "Số lượng mục tiêu không được vượt quá 10.000",
                "PRODUCTION_OUTPUT_TARGET_AMOUNT_TOO_LARGE",
                new { MaxAmount = 10000, ActualAmount = targetAmount });
        }
    }

    private void ValidateResultAmount(int resultAmount)
    {
        if (resultAmount < 0)
        {
            throw new ProductionOutputValidationException(
                "Số lượng thực tế không được âm",
                "PRODUCTION_OUTPUT_RESULT_AMOUNT_NEGATIVE",
                new { ResultAmount = resultAmount });
        }

        if (resultAmount > 10000)
        {
            throw new ProductionOutputValidationException(
                "Số lượng thực tế không được vượt quá 10.000",
                "PRODUCTION_OUTPUT_RESULT_AMOUNT_TOO_LARGE",
                new { MaxAmount = 10000, ActualAmount = resultAmount });
        }
    }

    private void ValidateLoadingTime(int loadingTime, string slotTime)
    {
        if (loadingTime <= 0)
        {
            throw new ProductionOutputValidationException(
                "Thời gian tải phải lớn hơn 0",
                "PRODUCTION_OUTPUT_LOADING_TIME_INVALID",
                new { LoadingTime = loadingTime });
        }

        int maxLoadingTime = CalculateMaxLoadingTime(slotTime);
        if (loadingTime > maxLoadingTime)
        {
            throw new ProductionOutputValidationException(
                $"Thời gian tải không được vượt quá {maxLoadingTime} phút cho slot {slotTime}",
                "PRODUCTION_OUTPUT_LOADING_TIME_TOO_LONG",
                new { LoadingTime = loadingTime, MaxAllowed = maxLoadingTime, SlotTime = slotTime });
        }
    }

    private void ValidateProductionAmounts(int targetAmount, int resultAmount)
    {
        if (resultAmount > targetAmount * 2)
        {
            throw new ProductionOutputValidationException(
                "Số lượng thực tế không được vượt quá 2 lần số lượng mục tiêu",
                "PRODUCTION_OUTPUT_RESULT_EXCEEDS_TARGET",
                new {
                    TargetAmount = targetAmount,
                    ResultAmount = resultAmount,
                    MaxAllowed = targetAmount * 2,
                    ExcessRatio = (double)resultAmount / targetAmount
                });
        }
    }
}
