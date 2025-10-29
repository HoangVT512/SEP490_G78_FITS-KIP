using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FITSKIP.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repository;
    private readonly ILogger<DashboardService> _logger;

    public DashboardService(IDashboardRepository repository, ILogger<DashboardService> logger)
    {
        _repository = repository;
        _logger = logger;
    }


    public async Task<object> GetDowntimeStatsAsync(int month, int year, int? lineId = null)
    {
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

    // Cập nhật method mới
    public async Task<object> GetDailyDowntimeStatsAsync(int month, int year, int? lineId = null, string? date = null)
    {
        _logger.LogInformation($"Đang lấy thống kê thời gian ngừng hoạt động hàng ngày cho tháng={month}, năm={year}, lineId={lineId}, date={date}");

        DateTime startDate, endDate;
        if (!string.IsNullOrEmpty(date))
        {
            // Lọc theo ngày cụ thể (dd/mm/yyyy)
            if (!DateTime.TryParseExact(date, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out startDate))
            {
                throw new ArgumentException("Lỗi định dạng ngày. Sử dụng dd/MM/yyyy.");
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
            .Select(po => new { Date = po.Date.Date, LineId = (int)po.LineId })  // Cast to int
            .Distinct()
            .ToListAsync();

        // Query all unique date-line combinations from IncidentHistory
        var incidentDays = await (from ih in _repository.IncidentHistories
                                  join ish in _repository.IncidentShifts on ih.IncidentId equals ish.IncidentId
                                  where ish.StartTime >= startDate && ish.StartTime < endDate
                                  && (lineId == null || ih.LineId == lineId)
                                  select new { Date = ish.StartTime.Date, LineId = (int)ih.LineId! })  // Cast to int
            .Distinct()
            .ToListAsync();

        // Concat and distinct all unique date-line combinations
        var allDays = productionDays.Concat(incidentDays).Distinct().ToList();

        // Query total operating minutes per day from ProductionOutput
        var dailyOperatingMinutes = await _repository.ProductionOutputs
            .Where(po => po.Date >= startDate && po.Date < endDate && (lineId == null || po.LineId == lineId))
            .GroupBy(po => new { po.Date.Date, po.LineId })
            .Select(g => new
            {
                Date = g.Key.Date,
                LineId = (int)g.Key.LineId,  // Cast to int
                TotalOperatingMinutes = (double)g.Sum(po => po.LoadingTime ?? 0)
            })
            .ToListAsync();

        // Query OEE per day per line from ProductionOutput
        var dailyOee = await _repository.ProductionOutputs
            .Where(po => po.Date >= startDate && po.Date < endDate && (lineId == null || po.LineId == lineId))
            .GroupBy(po => new { po.Date.Date, po.LineId })
            .Select(g => new
            {
                Date = g.Key.Date,
                LineId = (int)g.Key.LineId,  // Cast to int
                AvgOee = g.Average(po => po.OEE ?? 0)
            })
            .ToListAsync();

        // Query downtime per day per type from IncidentHistory and IncidentShifts
        var dailyDowntime = await (from ih in _repository.IncidentHistories
                                   join ish in _repository.IncidentShifts on ih.IncidentId equals ish.IncidentId
                                   where ish.StartTime >= startDate && ish.StartTime < endDate
                                   && (lineId == null || ih.LineId == lineId)
                                   && ih.TypeId.HasValue
                                   select new
                                   {
                                       Date = ish.StartTime.Date,
                                       LineId = (int)ih.LineId!,  // Cast to int
                                       TypeId = (int)ih.TypeId!,
                                       Duration = ih.Duration ?? 0
                                   })
            .GroupBy(x => new { x.Date, x.LineId, x.TypeId })
            .Select(g => new
            {
                Date = g.Key.Date,
                LineId = g.Key.LineId,
                TypeId = g.Key.TypeId,
                TotalDuration = g.Sum(x => (double)x.Duration),
                Occurrences = g.Count()
            })
            .ToListAsync();

        // Query line names from database
        var lineNames = await _repository.ProductionOutputs
            .Where(po => po.Date >= startDate && po.Date < endDate && (lineId == null || po.LineId == lineId))
            .Select(po => new { LineId = (int)po.LineId, LineName = po.Line.LineName })  // Cast LineId to int
            .Distinct()
            .ToDictionaryAsync(x => x.LineId, x => x.LineName);

        // Also include line names from incidents if not in production
        var incidentLineNames = await (from ih in _repository.IncidentHistories.Include(ih => ih.Line)
                                       join ish in _repository.IncidentShifts on ih.IncidentId equals ish.IncidentId
                                       where ish.StartTime >= startDate && ish.StartTime < endDate
                                       && (lineId == null || ih.LineId == lineId)
                                       && ih.LineId.HasValue
                                       && ih.Line != null
                                       select new { LineId = (int)ih.LineId!, LineName = ih.Line != null ? ih.Line.LineName : "Unknown" })
            .Distinct()
            .ToDictionaryAsync(x => x.LineId, x => x.LineName);

        foreach (var kvp in incidentLineNames)
        {
            if (!lineNames.ContainsKey(kvp.Key))
            {
                lineNames[kvp.Key] = kvp.Value;
            }
        }

        // Thêm query Target và Result per day per line
        var dailyProduction = await _repository.ProductionOutputs
            .Where(po => po.Date >= startDate && po.Date < endDate && (lineId == null || po.LineId == lineId))
            .GroupBy(po => new { po.Date.Date, po.LineId })
            .Select(g => new
            {
                Date = g.Key.Date,
                LineId = (int)g.Key.LineId,
                AvgTargetAmount = g.Average(po => (double)(po.TargetAmount ?? 0)),
                AvgResultAmount = g.Average(po => (double)(po.ResultAmount ?? 0))
            })
            .ToListAsync();


        // Trong phần build result, cập nhật lossPercentage
        var result = allDays
            .GroupBy(d => d.LineId)
            .Select(lineGroup => new
            {
                lineId = lineGroup.Key,
                lineName = lineNames.ContainsKey(lineGroup.Key) ? lineNames[lineGroup.Key] : "Unknown Line",
                dailyStats = lineGroup.Select(d =>
                {
                    var prodData = dailyProduction.FirstOrDefault(p => p.Date == d.Date && p.LineId == d.LineId);
                    var operatingMinutes = dailyOperatingMinutes.FirstOrDefault(dom => dom.Date == d.Date && dom.LineId == d.LineId)?.TotalOperatingMinutes ?? 0;
                    var totalTargetAmount = prodData?.AvgTargetAmount * 3 ?? 0; // Assuming 3 slots per day, adjust if needed
                    var totalResultAmount = prodData?.AvgResultAmount * 3 ?? 0;
                    var aLossMinutes = dailyDowntime.Where(dd => dd.Date == d.Date && dd.LineId == d.LineId && new[] { 1, 2, 4, 5 }.Contains(dd.TypeId)).Sum(dd => dd.TotalDuration);
                    var defectiveCount = dailyDowntime.FirstOrDefault(dd => dd.Date == d.Date && dd.LineId == d.LineId && dd.TypeId == 3)?.Occurrences ?? 0;
                    var phePhamTotalDuration = dailyDowntime.FirstOrDefault(dd => dd.Date == d.Date && dd.LineId == d.LineId && dd.TypeId == 3)?.TotalDuration ?? 0;
                    var idealCycleTime = totalTargetAmount > 0 ? operatingMinutes / totalTargetAmount : 0;
                    var actualRunTime = operatingMinutes - aLossMinutes;
                    var availability = operatingMinutes > 0 ? actualRunTime / operatingMinutes : 0;
                    var performance = actualRunTime > 0 && idealCycleTime > 0 ? (totalResultAmount * idealCycleTime) / actualRunTime : 0;
                    var quality = totalResultAmount > 0 ? (totalResultAmount - defectiveCount) / totalResultAmount : 0;
                    var oee = availability * performance * quality;
                    var aLoss = (1 - availability) * 100;
                    var pLoss = availability * (1 - performance) * 100;
                    var qLoss = availability * performance * (1 - quality) * 100;
                    var totalDetailedLoss = aLoss + pLoss + qLoss;
                    var totalLoss = (1 - oee) * 100;
                    var qLossMinutes = defectiveCount * idealCycleTime;
                    return new
                    {
                        date = d.Date.ToString("yyyy-MM-dd"),
                        oee = Math.Round(oee * 100, 2),
                        aLoss = Math.Round(aLoss, 2),
                        pLoss = Math.Round(pLoss, 2),
                        qLoss = Math.Round(qLoss, 2),
                        totalLoss = Math.Round(totalLoss, 2),
                        totalDetailedLoss = Math.Round(totalDetailedLoss, 2),
                        downDetails = new
                        {
                            dungNgan = GetTypeDetails(dailyDowntime, d.Date, d.LineId, 1, operatingMinutes),
                            dungDai = GetTypeDetails(dailyDowntime, d.Date, d.LineId, 2, operatingMinutes),
                            phePham = new
                            {
                                percentage = Math.Round(qLoss, 2),
                                duration = Math.Round(qLossMinutes, 2),
                                totalDuration = Math.Round(phePhamTotalDuration, 2),
                                occurrences = defectiveCount
                            },
                            veSinhDauCuoiCa = GetTypeDetails(dailyDowntime, d.Date, d.LineId, 4, operatingMinutes),
                            doiMa = GetTypeDetails(dailyDowntime, d.Date, d.LineId, 5, operatingMinutes)
                        }
                    };
                }).ToList()
            })
            .ToList();

        return result;
    }

    private object GetTypeDetails(IEnumerable<dynamic> dailyDowntime, DateTime date, int lineId, int typeId, double totalOperatingMinutes)
    {
        var typeData = dailyDowntime.FirstOrDefault(dd => dd.Date == date && dd.LineId == lineId && dd.TypeId == typeId);
        if (typeData == null)
        {
            return new { percentage = 0.00, duration = 0.00, occurrences = 0 };
        }
        return new
        {
            percentage = Math.Round(totalOperatingMinutes > 0 ? (typeData.TotalDuration / totalOperatingMinutes) * 100 : 0.0, 2),
            duration = Math.Round(typeData.TotalDuration, 2),
            occurrences = typeData.Occurrences
        };
    }

    // New method for detailed OEE calculation per day per line
    public async Task<object> GetDetailedOEEDailyStatsAsync(int lineId, DateTime date)
    {
        _logger.LogInformation($"Calculating detailed OEE stats for lineId={lineId}, date={date.ToString("yyyy-MM-dd")}");

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
                message = "No production data found for the specified date and line.",
                data = (object?)null
            };
        }

        // Aggregate data for the day
        double totalPlannedProductionTime = productionDataList.Sum(po => (double)(po.LoadingTime ?? 0));
        double totalTargetAmount = productionDataList.Sum(po => (double)(po.TargetAmount ?? 0));
        double totalResultAmount = productionDataList.Sum(po => (double)(po.ResultAmount ?? 0));

        // Query defective count (Phe Pham incidents) for the day
        int totalDefectiveCount = await _repository.IncidentHistories
            .Where(ih => ih.StartTime >= startOfDay && ih.StartTime < endOfDay
                        && ih.LineId == lineId && ih.TypeId == 3)
            .CountAsync();

        // Query total downtime (excluding Phe Pham) for the day
        double totalDowntime = await _repository.IncidentHistories
            .Where(ih => ih.StartTime >= startOfDay && ih.StartTime < endOfDay
                        && ih.LineId == lineId && ih.TypeId.HasValue && ih.TypeId != 3)
            .SumAsync(ih => (double)(ih.Duration ?? 0));

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
        _logger.LogInformation($"Calculating detailed OEE stats for lineId={lineId}, date={date.ToString("yyyy-MM-dd")}, shiftId={shiftId}, slotTime={slotTime}");

        // Parse slot time to get start and end time
        var slotParts = slotTime.Split('-');
        if (slotParts.Length != 2 ||
            !TimeSpan.TryParse(slotParts[0], out var startTimeSpan) ||
            !TimeSpan.TryParse(slotParts[1], out var endTimeSpan))
        {
            return new
            {
                success = false,
                message = "Invalid slot time format. Use HH:mm-HH:mm."
            };
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
                message = "No production data found for the specified slot."
            };
        }

        double plannedProductionTime = productionData.LoadingTime ?? 0;
        double targetAmount = productionData.TargetAmount ?? 0;
        double resultAmount = productionData.ResultAmount ?? 0;

        // Query defective count (Phe Pham incidents) within the slot
        int defectiveCount = await _repository.IncidentHistories
            .Where(ih => ih.StartTime >= slotStart && ih.StartTime < slotEnd
                        && ih.LineId == lineId && ih.TypeId == 3)
            .CountAsync();

        // Query total downtime (excluding Phe Pham) within the slot
        double totalDowntime = await _repository.IncidentHistories
            .Where(ih => ih.StartTime >= slotStart && ih.StartTime < slotEnd
                        && ih.LineId == lineId && ih.TypeId.HasValue && ih.TypeId != 3)
            .SumAsync(ih => (double)(ih.Duration ?? 0));

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
}