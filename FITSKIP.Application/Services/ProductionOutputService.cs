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

    // Cập nhật CreateProductionOutputAsync
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

        // ✅ VALIDATION: Kiểm tra targetAmount và resultAmount phải >0
        if (request.TargetAmount.HasValue && request.TargetAmount.Value <= 0)
            throw new ArgumentException("Số lượng mục tiêu phải là số dương (>0).");
        if (request.ResultAmount.HasValue && request.ResultAmount.Value <= 0)
            throw new ArgumentException("Số lượng thực tế phải là số dương (>0).");

        // ✅ VALIDATION: Kiểm tra Loading Time không vượt quá thời gian slot
        if (request.LoadingTime.HasValue)
        {
            int maxLoadingTime = CalculateMaxLoadingTime(request.SlotTime);
            if (request.LoadingTime.Value > maxLoadingTime)
                throw new ArgumentException($"Thời gian tải không được vượt quá {maxLoadingTime} phút cho slot {request.SlotTime}.");
            if (request.LoadingTime.Value <= 0)
                throw new ArgumentException("Thời gian tải phải là số dương (>0).");
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
            Console.WriteLine($"📡 Broadcasting production output creation to Managers group for OEE Dashboard");
            await _notificationService.SendNotificationToGroupAsync(
                "Managers",
                "Thêm sản lượng mới",
                $"Sản lượng mới được thêm cho chuyền {line.LineName} - Ca {shift.ShiftName}",
                "production"
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
        if (output == null) return null;

        // ✅ VALIDATION: Kiểm tra targetAmount và resultAmount phải >0 nếu có giá trị
        if (request.TargetAmount.HasValue && request.TargetAmount.Value <= 0)
            throw new ArgumentException("Số lượng mục tiêu phải là số dương (>0).");
        if (request.ResultAmount.HasValue && request.ResultAmount.Value <= 0)
            throw new ArgumentException("Số lượng thực tế phải là số dương (>0).");

        // ✅ VALIDATION: Kiểm tra Loading Time không vượt quá thời gian slot
        if (request.LoadingTime.HasValue)
        {
            int maxLoadingTime = CalculateMaxLoadingTime(output.SlotTime);
            if (request.LoadingTime.Value > maxLoadingTime)
                throw new ArgumentException($"Thời gian tải không được vượt quá {maxLoadingTime} phút cho slot {output.SlotTime}.");
            if (request.LoadingTime.Value <= 0)
                throw new ArgumentException("Thời gian tải phải là số dương (>0).");
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
                    "Cập nhật sản lượng",
                    $"Sản lượng được cập nhật cho chuyền {line?.LineName} - Ca {shift?.ShiftName}",
                    "production"
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
                    "Xóa sản lượng",
                    $"Sản lượng đã được xóa cho chuyền {line?.LineName} - Ca {shift?.ShiftName}",
                    "production"
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
        // Chuẩn hóa: loại bỏ "h", ":", và space
        var cleanedSlotTime = slotTime.Replace("h", "").Replace(":", "").Replace(" ", "").Replace("–", "-").Replace("—", "-").Replace("−", "-");

        var slotParts = cleanedSlotTime.Split('-');
        if (slotParts.Length != 2)
            throw new ArgumentException("Định dạng slot time không hợp lệ. Định dạng mong đợi: '07:00-08:00' hoặc '7h-8h'");

        // Parse giờ (giả sử luôn 4 ký tự sau khi clean: "0700-0800")
        if (!int.TryParse(slotParts[0].Substring(0, 2), out var startHour) ||
            !int.TryParse(slotParts[1].Substring(0, 2), out var endHour))
        {
            throw new ArgumentException("Không thể parse giờ từ slot time");
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
            var cleanedSlotTime = slotTime.Replace("h", "").Replace(":", "").Replace(" ", "").Replace("–", "-").Replace("—", "-").Replace("−", "-");
            var slotParts = cleanedSlotTime.Split('-');
            if (slotParts.Length == 2 &&
                int.TryParse(slotParts[0].Substring(0, 2), out var startHour) &&
                int.TryParse(slotParts[1].Substring(0, 2), out var endHour))
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
        var cleanedSlotTime = slotTime.Replace("h", "").Replace(":", "").Replace(" ", "").Replace("–", "-").Replace("—", "-").Replace("−", "-");
        var slotParts = cleanedSlotTime.Split('-');
        DateTime slotStart = date.Date, slotEnd = date.Date;
        if (slotParts.Length == 2 &&
            int.TryParse(slotParts[0].Substring(0, 2), out var startHour) &&
            int.TryParse(slotParts[1].Substring(0, 2), out var endHour))
        {
            slotStart = date.Date.AddHours(startHour);
            slotEnd = date.Date.AddHours(endHour);
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
        // Chuẩn hóa slot time
        var cleanedSlotTime = slotTime.Replace("h", "").Replace(":", "").Replace(" ", "").Replace("–", "-").Replace("—", "-").Replace("−", "-");
        var slotParts = cleanedSlotTime.Split('-');
        if (slotParts.Length != 2 ||
            !int.TryParse(slotParts[0].Substring(0, 2), out var startHour) ||
            !int.TryParse(slotParts[1].Substring(0, 2), out var endHour))
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
}
