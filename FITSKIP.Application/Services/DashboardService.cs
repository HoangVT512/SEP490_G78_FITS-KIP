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
                    var aLossMinutes = dailyDowntime.Where(dd => dd.Date == d.Date && dd.LineId == d.LineId && new[] { 1, 2, 4, 5 }.Contains(dd.TypeId)).Sum(dd => dd.TotalDuration);
                    var defectiveCount = dailyDowntime.FirstOrDefault(dd => dd.Date == d.Date && dd.LineId == d.LineId && dd.TypeId == 3)?.Occurrences ?? 0;
                    var idealCycleTime = prodData != null && prodData.AvgTargetAmount > 0 ? 60.0 / prodData.AvgTargetAmount : 0; // Giả định 60 phút per slot
                    var qLossMinutes = defectiveCount * idealCycleTime;
                    var totalLossPercentage = operatingMinutes > 0 ? ((aLossMinutes + qLossMinutes) / operatingMinutes) * 100 : 0; // Tỷ lệ mất mát = (A Loss + Q Loss) / Operating Minutes × 100
                    return new
                    {
                        date = d.Date.ToString("yyyy-MM-dd"),
                        oee = Math.Round(dailyOee.FirstOrDefault(oe => oe.Date == d.Date && oe.LineId == d.LineId)?.AvgOee ?? 0, 2),
                        lossPercentage = Math.Round(totalLossPercentage, 2), // Cập nhật tỷ lệ mất mát
                        // Sửa downDetails để Phe Pham (TypeId=3) không tính percentage như downtime:
                        downDetails = new
                        {
                            dungNgan = GetTypeDetails(dailyDowntime, d.Date, d.LineId, 1, operatingMinutes),
                            dungDai = GetTypeDetails(dailyDowntime, d.Date, d.LineId, 2, operatingMinutes),
                            phePham = new  // Tính riêng như Q Loss, không như downtime
                            {
                                percentage = operatingMinutes > 0 ? Math.Round((qLossMinutes / operatingMinutes) * 100, 2) : 0.00,  // Q Loss percentage
                                duration = Math.Round(qLossMinutes, 2),  // Thời gian Q Loss
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
}