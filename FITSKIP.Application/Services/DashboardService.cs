using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Domain.Exceptions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FITSKIP.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repository;
    private readonly ILineRepository _lineRepository;
    private readonly IShiftRepository _shiftRepository;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(
        IDashboardRepository repository,
        ILineRepository lineRepository,
        IShiftRepository shiftRepository,
        ILogger<DashboardService> logger)
    {
        _repository = repository;
        _lineRepository = lineRepository;
        _shiftRepository = shiftRepository;
        _logger = logger;
    }


    public async Task<object> GetDowntimeStatsAsync(int month, int year, int? lineId = null)
    {
        // Validate parameters
        ValidateMonthYear(month, year);
        if (lineId.HasValue)
        {
            await ValidateLineIdAsync(lineId.Value);
        }

        _logger.LogInformation($"Đang lấy thống kê thời gian ngừng hoạt động cho tháng={month}, năm={year}, lineId={lineId}");

        // Step 1: Define month range
        var startOfMonth = new DateTime(year, month, 1);
        var endOfMonth = startOfMonth.AddMonths(1);

        // Step 2: Calculate total operating minutes from ProductionOutput (actual planned time)
        var totalOperatingMinutesQuery = from po in _repository.ProductionOutputs
                                         where po.Date >= startOfMonth && po.Date < endOfMonth
                                         && (lineId == null || po.LineId == lineId)
                                         select po.LoadingTime ?? 0;

        double totalOperatingMinutes = await totalOperatingMinutesQuery.SumAsync(x => (double)x);
        _logger.LogInformation($"Tổng thời gian hoạt động (từ sản lượng sản xuất): {totalOperatingMinutes}");

        // Step 3: Query downtime by type from IncidentHistory
        var downtimeQuery = from ih in _repository.IncidentHistories
                            where ih.StartTime >= startOfMonth && ih.StartTime < endOfMonth
                            && (lineId == null || ih.LineId == lineId)
                            && ih.TypeId.HasValue
                            select new
                            {
                                TypeId = (int)ih.TypeId!,
                                DurationMinutes = ih.Duration ?? 0
                            };

        var downtimeByTypeRaw = await downtimeQuery
            .GroupBy(x => x.TypeId)
            .Select(g => new
            {
                TypeID = g.Key,
                TotalMinutes = g.Sum(x => (double)x.DurationMinutes)
            })
            .ToListAsync();

        // double totalDowntimeMinutes = downtimeByTypeRaw.Sum(x => x.TotalMinutes);
        double totalDowntimeMinutes = downtimeByTypeRaw.Where(x => x.TypeID != 3).Sum(x => x.TotalMinutes);  // Loại trừ defects (TypeId=3)
        _logger.LogInformation($"Tổng thời gian ngừng hoạt động: {totalDowntimeMinutes}");

        // Step 4: Fetch all StopTypes
        var allStopTypes = await _repository.StopTypes.ToListAsync();
        var typeNames = allStopTypes.ToDictionary(t => t.TypeId, t => t.TypeName);

        // Step 5: Calculate operating time
        double operatingMinutes = totalOperatingMinutes - totalDowntimeMinutes;
        double operatingTimePercentage = totalOperatingMinutes > 0
            ? Math.Round((operatingMinutes / totalOperatingMinutes) * 100, 2)
            : 0.0;

        // Step 6: Build downtime by type (include ALL StopTypes + Operating Time)
        var downtimeByType = new List<object>
        {
            new
            {
                typeId = 0,  // Special ID for operating time
                typeName = "Thời gian hoạt động",
                percentage = operatingTimePercentage
            }
        };
        downtimeByType.AddRange(allStopTypes.Select(st => new
        {
            typeId = st.TypeId,
            typeName = st.TypeName,
            percentage = totalOperatingMinutes > 0
                ? Math.Round((downtimeByTypeRaw.FirstOrDefault(dt => dt.TypeID == st.TypeId)?.TotalMinutes ?? 0) / totalOperatingMinutes * 100, 2)
                : 0.0
        }));

        // Step 7: Return structured data
        return new
        {
            totalOperatingMinutes = totalOperatingMinutes,
            operatingTimePercentage = operatingTimePercentage,
            totalDowntime = totalDowntimeMinutes,
            downtimeByType = downtimeByType
        };
    }

    // Cập nhật method mới với logic OEE giống GetDetailedOEEDailyStatsAsync
    public async Task<object> GetDailyDowntimeStatsAsync(int month, int year, int? lineId = null, string? date = null)
    {
        // Validate parameters
        ValidateMonthYear(month, year);
        if (lineId.HasValue)
        {
            await ValidateLineIdAsync(lineId.Value);
        }
        if (!string.IsNullOrEmpty(date))
        {
            ValidateDateString(date, "dd/MM/yyyy");
        }

        _logger.LogInformation($"Đang lấy thống kê thời gian ngừng hoạt động hàng ngày cho tháng={month}, năm={year}, lineId={lineId}, date={date}");

        DateTime startDate, endDate;
        if (!string.IsNullOrEmpty(date))
        {
            // Lọc theo ngày cụ thể (dd/mm/yyyy)
            if (!DateTime.TryParseExact(date, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out startDate))
            {
                throw new DashboardValidationException(
                    "Lỗi định dạng ngày. Sử dụng dd/MM/yyyy.",
                    "DASHBOARD_INVALID_DATE_FORMAT",
                    new { ProvidedDate = date, ExpectedFormat = "dd/MM/yyyy" });
            }
            endDate = startDate.AddDays(1);
        }
        else
        {
            // Lọc theo tháng (MM/yyyy)
            startDate = new DateTime(year, month, 1);
            endDate = startDate.AddMonths(1);
        }

        // Query all unique date-line combinations from ProductionOutput
        var productionDays = await _repository.ProductionOutputs
            .Where(po => po.Date >= startDate && po.Date < endDate && (lineId == null || po.LineId == lineId))
            .Select(po => new { Date = po.Date.Date, LineId = (int)po.LineId })
            .Distinct()
            .ToListAsync();

        // Query all unique date-line combinations from IncidentHistory
        var incidentDays = await _repository.IncidentHistories
            .Where(ih => ih.StartTime >= startDate && ih.StartTime < endDate
                        && ih.LineId.HasValue && (lineId == null || ih.LineId == lineId))
            .Select(ih => new { Date = ih.StartTime!.Value.Date, LineId = (int)ih.LineId!.Value })
            .Distinct()
            .ToListAsync();

        // Concat and distinct all unique date-line combinations
        var allDays = productionDays.Concat(incidentDays).Distinct().ToList();

        // Query line names from database
        var lineNames = await _repository.ProductionOutputs
            .Where(po => po.Date >= startDate && po.Date < endDate && (lineId == null || po.LineId == lineId))
            .Select(po => new { LineId = (int)po.LineId, LineName = po.Line.LineName })
            .Distinct()
            .ToDictionaryAsync(x => x.LineId, x => x.LineName);

        // Also include line names from incidents if not in production
        var incidentLineNames = await (from ih in _repository.IncidentHistories.Include(ih => ih.Line)
                                       where ih.StartTime >= startDate && ih.StartTime < endDate
                                       && (lineId == null || ih.LineId == lineId)
                                       && ih.LineId.HasValue
                                       && ih.Line != null
                                       select new { LineId = (int)ih.LineId!.Value, LineName = ih.Line != null ? ih.Line.LineName : "Unknown" })
            .Distinct()
            .ToDictionaryAsync(x => x.LineId, x => x.LineName);

        foreach (var kvp in incidentLineNames)
        {
            if (!lineNames.ContainsKey(kvp.Key))
            {
                lineNames[kvp.Key] = kvp.Value;
            }
        }

        // Build result using same OEE logic as GetDetailedOEEDailyStatsAsync
        var result = new List<object>();

        foreach (var lineGroup in allDays.GroupBy(d => d.LineId))
        {
            var dailyStats = new List<object>();

            foreach (var day in lineGroup)
            {
                int currentLineId = day.LineId;
                DateTime currentDate = day.Date;
                DateTime dayStart = currentDate.Date;
                DateTime dayEnd = dayStart.AddDays(1);

                // Query ProductionOutput data for this day
                var productionDataList = await _repository.ProductionOutputs
                    .Where(po => po.Date == dayStart && po.LineId == currentLineId)
                    .ToListAsync();

                // Calculate totals for the day (same logic as GetDetailedOEEDailyStatsAsync)
                double totalPlannedProductionTime = productionDataList.Sum(po => (double)(po.LoadingTime ?? 0));
                double totalTargetAmount = productionDataList.Sum(po => (double)(po.TargetAmount ?? 0));
                double totalResultAmount = productionDataList.Sum(po => (double)(po.ResultAmount ?? 0));

                // Calculate defective count for the day
                int totalDefectiveCount = await CalculateDefectiveCountForPeriodAsync(currentLineId, dayStart, dayEnd);

                // Calculate downtime by type for the day (excluding Phe Pham for A-Loss)
                var downtimeByType = await CalculateDowntimeForPeriodAsync(currentLineId, dayStart, dayEnd);
                
                // Calculate A-Loss (all downtime except Phe Pham - Type 3)
                double totalALossDowntime = downtimeByType
                    .Where(kvp => kvp.Key != 3)
                    .Sum(kvp => kvp.Value.Duration);

                // OEE Calculations (same as GetDetailedOEEDailyStatsAsync)
                double totalActualRunTime = totalPlannedProductionTime - totalALossDowntime;
                double idealCycleTime = totalTargetAmount > 0 ? totalPlannedProductionTime / totalTargetAmount : 0;
                double qLossTime = totalDefectiveCount * idealCycleTime;

                double availability = totalPlannedProductionTime > 0 ? totalActualRunTime / totalPlannedProductionTime : 0;
                double performance = totalActualRunTime > 0 && idealCycleTime > 0 ? (totalResultAmount * idealCycleTime) / totalActualRunTime : 0;
                double quality = totalResultAmount > 0 ? (totalResultAmount - totalDefectiveCount) / totalResultAmount : 0;

                double oee = availability * performance * quality;

                // Loss calculations using standard OEE formulas
                double aLoss = (1 - availability) * 100;
                double pLoss = availability * (1 - performance) * 100;
                double qLoss = availability * performance * (1 - quality) * 100;
                double totalLoss = (1 - oee) * 100;
                double totalDetailedLoss = aLoss + pLoss + qLoss;

                // Build detailed downtime by type
                var downDetails = new
                {
                    dungNgan = GetTypeDetailsFromDict(downtimeByType, 1, totalPlannedProductionTime),
                    dungDai = GetTypeDetailsFromDict(downtimeByType, 2, totalPlannedProductionTime),
                    phePham = new
                    {
                        percentage = Math.Round(qLoss, 2),
                        duration = Math.Round(qLossTime, 2),
                        totalDuration = Math.Round(downtimeByType.ContainsKey(3) ? downtimeByType[3].Duration : 0, 2),
                        occurrences = totalDefectiveCount
                    },
                    veSinhDauCuoiCa = GetTypeDetailsFromDict(downtimeByType, 4, totalPlannedProductionTime),
                    doiMa = GetTypeDetailsFromDict(downtimeByType, 5, totalPlannedProductionTime)
                };

                dailyStats.Add(new
                {
                    date = currentDate.ToString("yyyy-MM-dd"),
                    oee = Math.Round(oee * 100, 2),
                    aLoss = Math.Round(aLoss, 2),
                    pLoss = Math.Round(pLoss, 2),
                    qLoss = Math.Round(qLoss, 2),
                    totalLoss = Math.Round(totalLoss, 2),
                    totalDetailedLoss = Math.Round(totalDetailedLoss, 2),
                    downDetails = downDetails
                });
            }

            result.Add(new
            {
                lineId = lineGroup.Key,
                lineName = lineNames.ContainsKey(lineGroup.Key) ? lineNames[lineGroup.Key] : "Unknown Line",
                dailyStats = dailyStats
            });
        }

        return result;
    }

    private object GetTypeDetailsFromDict(Dictionary<int, (double Duration, int Count)> downtimeDict, int typeId, double totalOperatingMinutes)
    {
        if (!downtimeDict.ContainsKey(typeId))
        {
            return new { percentage = 0.00, duration = 0.00, occurrences = 0 };
        }
        
        var typeData = downtimeDict[typeId];
        return new
        {
            percentage = Math.Round(totalOperatingMinutes > 0 ? (typeData.Duration / totalOperatingMinutes) * 100 : 0.0, 2),
            duration = Math.Round(typeData.Duration, 2),
            occurrences = typeData.Count
        };
    }

    // New method for detailed OEE calculation per day per line
    public async Task<object> GetDetailedOEEDailyStatsAsync(int lineId, DateTime date)
    {
        // Validate parameters
        await ValidateLineIdAsync(lineId);
        ValidateDateForOEE(date);

        _logger.LogInformation($"Đang tính chi tiết OEE cho dây chuyền={lineId}, date={date.ToString("yyyy-MM-dd")}");

        // Define date range for the specific day
        var startOfDay = date.Date;
        var endOfDay = startOfDay.AddDays(1);

        // Query all ProductionOutput for the day
        var productionDataList = await _repository.ProductionOutputs
            .Where(po => po.Date == startOfDay && po.LineId == lineId)
            .ToListAsync();

        if (!productionDataList.Any())
        {
            return new
            {
                success = false,
                message = "Không tìm thấy dữ liệu sản xuất cho ngày và dây chuyền đã chỉ định.",
                data = (object?)null
            };
        }

        // Aggregate data for the day
        double totalPlannedProductionTime = productionDataList.Sum(po => (double)(po.LoadingTime ?? 0));
        double totalTargetAmount = productionDataList.Sum(po => (double)(po.TargetAmount ?? 0));
        double totalResultAmount = productionDataList.Sum(po => (double)(po.ResultAmount ?? 0));

        // Query defective count (Phe Pham incidents) for the day
        int totalDefectiveCount = await CalculateDefectiveCountForPeriodAsync(lineId, startOfDay, endOfDay);

        // Query total downtime (excluding Phe Pham) for the day, accounting for crossover across slots
        double totalDowntime = 0;
        foreach (var po in productionDataList)
        {
            var slotParts = po.SlotTime.Split('-');
            if (slotParts.Length == 2 &&
                TimeSpan.TryParse(slotParts[0], out var startTimeSpan) &&
                TimeSpan.TryParse(slotParts[1], out var endTimeSpan))
            {
                var slotStart = date.Date.Add(startTimeSpan);
                var slotEnd = date.Date.Add(endTimeSpan);
                var downtimeDict = await CalculateDowntimeForPeriodAsync(lineId, slotStart, slotEnd, 3);
                totalDowntime += downtimeDict.Values.Sum(d => d.Duration);
            }
        }

        // Calculations
        double totalActualRunTime = totalPlannedProductionTime - totalDowntime;
        double idealCycleTime = totalTargetAmount > 0 ? totalPlannedProductionTime / totalTargetAmount : 0;
        double qLossTime = totalDefectiveCount * idealCycleTime;

        double availability = totalPlannedProductionTime > 0 ? totalActualRunTime / totalPlannedProductionTime : 0;
        double performance = totalActualRunTime > 0 && idealCycleTime > 0 ? (totalResultAmount * idealCycleTime) / totalActualRunTime : 0;
        double quality = totalResultAmount > 0 ? (totalResultAmount - totalDefectiveCount) / totalResultAmount : 0;

        double oee = availability * performance * quality;

        // Corrected loss calculations using standard OEE formulas
        double aLoss = (1 - availability) * 100;
        double pLoss = availability * (1 - performance) * 100;
        double qLoss = availability * performance * (1 - quality) * 100;
        double totalLoss = (1 - oee) * 100;
        double totalDetailedLoss = aLoss + pLoss + qLoss;

        // Return structured data
        return new
        {
            success = true,
            data = new
            {
                plannedProductionTime = Math.Round(totalPlannedProductionTime, 2),
                actualRunTime = Math.Round(totalActualRunTime, 2),
                targetAmount = Math.Round(totalTargetAmount, 2),
                resultAmount = Math.Round(totalResultAmount, 2),
                defectiveCount = totalDefectiveCount,
                totalDowntime = Math.Round(totalDowntime, 2),
                idealCycleTime = Math.Round(idealCycleTime, 4),
                qLossTime = Math.Round(qLossTime, 2),
                availability = Math.Round(availability * 100, 2),
                performance = Math.Round(performance * 100, 2),
                quality = Math.Round(quality * 100, 2),
                oee = Math.Round(oee * 100, 2),
                aLoss = Math.Round(aLoss, 2),
                pLoss = Math.Round(pLoss, 2),
                qLoss = Math.Round(qLoss, 2),
                totalLoss = Math.Round(totalLoss, 2),
                totalDetailedLoss = Math.Round(totalDetailedLoss, 2) // A + P + Q Loss
            }
        };
    }

    // New method for detailed OEE calculation per slot per line
    public async Task<object> GetDetailedOEESlotStatsAsync(int lineId, DateTime date, int shiftId, string slotTime)
    {
        // Validate parameters
        await ValidateLineIdAsync(lineId);
        await ValidateShiftIdAsync(shiftId);
        ValidateDateForOEE(date);
        ValidateSlotTimeFormat(slotTime);

        _logger.LogInformation($"Đang tính chi tiết OEE cho dây chuyền={lineId}, date={date.ToString("yyyy-MM-dd")}, shiftId={shiftId}, slotTime={slotTime}");

        // Parse slot time to get start and end time
        var slotParts = slotTime.Split('-');
        if (slotParts.Length != 2 ||
            !TimeSpan.TryParse(slotParts[0], out var startTimeSpan) ||
            !TimeSpan.TryParse(slotParts[1], out var endTimeSpan))
        {
            throw new DashboardValidationException(
                "Định dạng khung thời gian không hợp lệ. Sử dụng HH:mm-HH:mm.",
                "DASHBOARD_INVALID_SLOT_TIME_FORMAT",
                new { SlotTime = slotTime, ExpectedFormat = "HH:mm-HH:mm" });
        }

        var slotStart = date.Date.Add(startTimeSpan);
        var slotEnd = date.Date.Add(endTimeSpan);

        // Query ProductionOutput for the slot
        var productionData = await _repository.ProductionOutputs
            .Where(po => po.Date == date.Date && po.LineId == lineId && po.ShiftId == shiftId && po.SlotTime == slotTime)
            .FirstOrDefaultAsync();

        if (productionData == null)
        {
            return new
            {
                success = false,
                message = "Không tìm thấy dữ liệu sản xuất cho slot đã chỉ định."
            };
        }

        double plannedProductionTime = (double)(productionData.LoadingTime ?? 0);
        double targetAmount = (double)(productionData.TargetAmount ?? 0);
        double resultAmount = (double)(productionData.ResultAmount ?? 0);

        // Query defective count (Phe Pham incidents) within the slot
        int defectiveCount = await CalculateDefectiveCountForPeriodAsync(lineId, slotStart, slotEnd);

        // Query total downtime (excluding Phe Pham) within the slot, accounting for crossover
        var downtimeDict = await CalculateDowntimeForPeriodAsync(lineId, slotStart, slotEnd, 3);
        double totalDowntime = downtimeDict.Values.Sum(d => d.Duration);

        // Calculations
        double actualRunTime = plannedProductionTime - totalDowntime;
        double idealCycleTime = targetAmount > 0 ? plannedProductionTime / targetAmount : 0;
        double qLossTime = defectiveCount * idealCycleTime;

        double availability = plannedProductionTime > 0 ? actualRunTime / plannedProductionTime : 0;
        double performance = actualRunTime > 0 && idealCycleTime > 0 ? (resultAmount * idealCycleTime) / actualRunTime : 0;
        double quality = resultAmount > 0 ? (resultAmount - defectiveCount) / resultAmount : 0;

        double oee = availability * performance * quality;

        // Corrected loss calculations using standard OEE formulas
        double aLoss = (1 - availability) * 100;
        double pLoss = availability * (1 - performance) * 100;
        double qLoss = availability * performance * (1 - quality) * 100;
        double totalLoss = (1 - oee) * 100;
        double totalDetailedLoss = aLoss + pLoss + qLoss;

        // Return structured data
        return new
        {
            success = true,
            data = new
            {
                slotTime = slotTime,
                plannedProductionTime = Math.Round(plannedProductionTime, 2),
                actualRunTime = Math.Round(actualRunTime, 2),
                targetAmount = Math.Round(targetAmount, 2),
                resultAmount = Math.Round(resultAmount, 2),
                defectiveCount = defectiveCount,
                totalDowntime = Math.Round(totalDowntime, 2),
                idealCycleTime = Math.Round(idealCycleTime, 4),
                qLossTime = Math.Round(qLossTime, 2),
                availability = Math.Round(availability * 100, 2),
                performance = Math.Round(performance * 100, 2),
                quality = Math.Round(quality * 100, 2),
                oee = Math.Round(oee * 100, 2),
                aLoss = Math.Round(aLoss, 2),
                pLoss = Math.Round(pLoss, 2),
                qLoss = Math.Round(qLoss, 2),
                totalLoss = Math.Round(totalLoss, 2),
                totalDetailedLoss = Math.Round(totalDetailedLoss, 2) // A + P + Q Loss
            }
        };
    }

    // Helper method to calculate total downtime for a specific period, accounting for crossover incidents and real-time calculation
    private async Task<Dictionary<int, (double Duration, int Count)>> CalculateDowntimeForPeriodAsync(int lineId, DateTime start, DateTime end, int? excludeTypeId = null)
    {
        var incidents = await _repository.IncidentHistories
            .Where(ih => ih.LineId == lineId && ih.TypeId.HasValue && ih.StartTime.HasValue)
            .Select(ih => new { ih.StartTime, ih.EndTime, ih.TypeId })
            .ToListAsync();

        var downtimeByType = new Dictionary<int, (double, int)>();
        DateTime currentTime = DateTime.Now;

        foreach (var incident in incidents)
        {
            if (incident.TypeId == excludeTypeId) continue;

            var incidentStart = incident.StartTime!.Value;
            DateTime incidentEnd = incident.EndTime ?? currentTime;
            // Clamp to current time if ongoing
            if (incidentEnd > currentTime) incidentEnd = currentTime;

            // Calculate overlap with the period
            var overlapStart = incidentStart > start ? incidentStart : start;
            var overlapEnd = incidentEnd < end ? incidentEnd : end;

            if (overlapStart < overlapEnd)
            {
                var overlapMinutes = (overlapEnd - overlapStart).TotalMinutes;
                var typeId = (int)incident.TypeId!;
                if (!downtimeByType.ContainsKey(typeId))
                    downtimeByType[typeId] = (0, 0);
                downtimeByType[typeId] = (downtimeByType[typeId].Item1 + overlapMinutes, downtimeByType[typeId].Item2 + 1);
            }
        }

        return downtimeByType;
    }

    // Helper method to calculate defective count for a specific period
    private async Task<int> CalculateDefectiveCountForPeriodAsync(int lineId, DateTime start, DateTime end)
    {
        return await _repository.IncidentHistories
            .Where(ih => ih.StartTime >= start && ih.StartTime < end
                        && ih.LineId == lineId && ih.TypeId == 3)
            .CountAsync();
    }

    private void ValidateMonthYear(int month, int year)
    {
        if (month < 1 || month > 12)
        {
            throw new DashboardValidationException(
                "Tháng phải từ 1 đến 12",
                "DASHBOARD_INVALID_MONTH",
                new { Month = month, ValidRange = "1-12" });
        }

        if (year < 2020 || year > DateTime.Now.Year + 1)
        {
            throw new DashboardValidationException(
                $"Năm phải từ 2020 đến {DateTime.Now.Year + 1}",
                "DASHBOARD_INVALID_YEAR",
                new { Year = year, MinYear = 2020, MaxYear = DateTime.Now.Year + 1 });
        }
    }

    private void ValidateDateString(string date, string expectedFormat)
    {
        if (string.IsNullOrWhiteSpace(date))
        {
            throw new DashboardValidationException(
                "Ngày không được để trống",
                "DASHBOARD_DATE_REQUIRED");
        }

        if (!DateTime.TryParseExact(date, expectedFormat, null, System.Globalization.DateTimeStyles.None, out _))
        {
            throw new DashboardValidationException(
                $"Định dạng ngày không hợp lệ. Sử dụng {expectedFormat}",
                "DASHBOARD_INVALID_DATE_FORMAT",
                new { ProvidedDate = date, ExpectedFormat = expectedFormat });
        }
    }

    private async Task ValidateLineIdAsync(int lineId)
    {
        var line = await _lineRepository.GetByIdAsync(lineId);
        if (line == null)
        {
            throw new DashboardValidationException(
                $"Không tìm thấy chuyền sản xuất với ID {lineId}",
                "LINE_NOT_FOUND",
                new { LineId = lineId });
        }
    }

    private async Task ValidateShiftIdAsync(int shiftId)
    {
        var shift = await _shiftRepository.GetByIdAsync(shiftId);
        if (shift == null)
        {
            throw new DashboardValidationException(
                $"Không tìm thấy ca làm việc với ID {shiftId}",
                "SHIFT_NOT_FOUND",
                new { ShiftId = shiftId });
        }
    }

    private void ValidateDateForOEE(DateTime date)
    {
        if (date > DateTime.Now.AddDays(1))
        {
            throw new DashboardValidationException(
                "Ngày không được ở tương lai",
                "DASHBOARD_DATE_IN_FUTURE",
                new { Date = date });
        }

        if (date < new DateTime(2020, 1, 1))
        {
            throw new DashboardValidationException(
                "Ngày không được nhỏ hơn năm 2020",
                "DASHBOARD_DATE_TOO_OLD",
                new { Date = date, MinDate = new DateTime(2020, 1, 1) });
        }
    }

    private void ValidateSlotTimeFormat(string slotTime)
    {
        if (string.IsNullOrWhiteSpace(slotTime))
        {
            throw new DashboardValidationException(
                "Thời gian slot không được để trống",
                "DASHBOARD_SLOT_TIME_REQUIRED");
        }

        // Validate slot time format (HH:mm-HH:mm)
        var slotPattern = @"^\d{1,2}:\d{2}-\d{1,2}:\d{2}$";
        if (!System.Text.RegularExpressions.Regex.IsMatch(slotTime.Trim(), slotPattern))
        {
            throw new DashboardValidationException(
                "Định dạng thời gian slot không hợp lệ. Sử dụng HH:mm-HH:mm",
                "DASHBOARD_INVALID_SLOT_TIME_FORMAT",
                new { SlotTime = slotTime, ExpectedFormat = "HH:mm-HH:mm" });
        }

        // Validate hour and minute ranges
        var parts = slotTime.Split('-');
        if (parts.Length == 2)
        {
            for (int i = 0; i < 2; i++)
            {
                var timeParts = parts[i].Split(':');
                if (timeParts.Length == 2 &&
                    int.TryParse(timeParts[0], out int hour) &&
                    int.TryParse(timeParts[1], out int minute))
                {
                    if (hour < 0 || hour > 23)
                    {
                        throw new DashboardValidationException(
                            "Giờ phải từ 0 đến 23",
                            "DASHBOARD_INVALID_HOUR",
                            new { Hour = hour, SlotTime = slotTime });
                    }
                    if (minute < 0 || minute > 59)
                    {
                        throw new DashboardValidationException(
                            "Phút phải từ 0 đến 59",
                            "DASHBOARD_INVALID_MINUTE",
                            new { Minute = minute, SlotTime = slotTime });
                    }
                }
            }

            // Validate start time < end time
            if (TimeSpan.TryParse(parts[0], out var startTime) &&
                TimeSpan.TryParse(parts[1], out var endTime))
            {
                if (startTime >= endTime)
                {
                    throw new DashboardValidationException(
                        "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc",
                        "DASHBOARD_INVALID_TIME_RANGE",
                        new { StartTime = parts[0], EndTime = parts[1], SlotTime = slotTime });
                }
            }
        }
    }
}