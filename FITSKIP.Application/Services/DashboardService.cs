// using FITSKIP.Application.Interfaces;
// using FITSKIP.Domain.DTO;
// using FITSKIP.Domain.Entities;
// using FITSKIP.Domain.Interfaces;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.Extensions.Logging;

// namespace FITSKIP.Application.Services;

// public class DashboardService : IDashboardService
// {
//     private readonly IDashboardRepository _repository;
//     private readonly ILogger<DashboardService> _logger;

//     // Hardcoded total minutes per day based on Slots (1275 minutes)
//     private const double TotalMinutesPerDay = 1275.0;

//     public DashboardService(IDashboardRepository repository, ILogger<DashboardService> logger)
//     {
//         _repository = repository;
//         _logger = logger;
//     }

//     public async Task<object> GetDowntimeStatsAsync(int month, int year, int? lineId = null)
//     {
//         _logger.LogInformation($"Fetching downtime stats for month={month}, year={year}, lineId={lineId}");

//         // Step 1: Calculate total operating minutes for the full month (30 days × 1275 minutes)
//         var daysInMonth = DateTime.DaysInMonth(year, month);
//         double totalOperatingMinutes = daysInMonth * TotalMinutesPerDay;
//         _logger.LogInformation($"Total operating minutes (full month): {totalOperatingMinutes}");

//         // Step 2: Define month range
//         var startOfMonth = new DateTime(year, month, 1);
//         var endOfMonth = startOfMonth.AddMonths(1);

//         // Step 3: Query downtime by type, filtered by month and optional lineId (from IncidentHistory.StartTime)
//         var downtimeQuery = from ih in _repository.IncidentHistories
//                             where ih.StartTime >= startOfMonth && ih.StartTime < endOfMonth
//                             && (lineId == null || ih.LineId == lineId)
//                             && ih.TypeId.HasValue
//                             select new
//                             {
//                                 TypeId = (int)ih.TypeId!,
//                                 DurationMinutes = ih.Duration ?? 0
//                             };

//         var downtimeByTypeRaw = await downtimeQuery
//             .GroupBy(x => x.TypeId)
//             .Select(g => new
//             {
//                 TypeID = g.Key,
//                 TotalMinutes = g.Sum(x => (double)x.DurationMinutes)
//             })
//             .ToListAsync();

//         double totalDowntimeMinutes = downtimeByTypeRaw.Sum(x => x.TotalMinutes);
//         _logger.LogInformation($"Total downtime minutes: {totalDowntimeMinutes}");

//         // Step 4: Fetch all StopTypes
//         var allStopTypes = await _repository.StopTypes.ToListAsync();
//         var typeNames = allStopTypes.ToDictionary(t => t.TypeId, t => t.TypeName);

//         // Step 5: Calculate operating time
//         double operatingMinutes = totalOperatingMinutes - totalDowntimeMinutes;
//         double operatingTimePercentage = totalOperatingMinutes > 0
//             ? Math.Round((operatingMinutes / totalOperatingMinutes) * 100, 2)  // Changed to 2 decimal places
//             : 0.0;

//         // Step 6: Build downtime by type (include ALL StopTypes + Operating Time)
//         var downtimeByType = new List<object>
//         {
//             new
//             {
//                 typeId = 0,  // Special ID for operating time
//                 typeName = "Thời gian hoạt động",
//                 percentage = operatingTimePercentage
//             }
//         };
//         downtimeByType.AddRange(allStopTypes.Select(st => new
//         {
//             typeId = st.TypeId,
//             typeName = st.TypeName,
//             percentage = totalOperatingMinutes > 0
//                 ? Math.Round((downtimeByTypeRaw.FirstOrDefault(dt => dt.TypeID == st.TypeId)?.TotalMinutes ?? 0) / totalOperatingMinutes * 100, 2)  // Changed to 2 decimal places
//                 : 0.0
//         }));

//         // Step 7: Return structured data
//         return new
//         {
//             totalOperatingMinutes = totalOperatingMinutes,
//             operatingTimePercentage = operatingTimePercentage,
//             totalDowntime = totalDowntimeMinutes,
//             downtimeByType = downtimeByType
//         };
//     }
// }


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
        _logger.LogInformation($"Fetching downtime stats for month={month}, year={year}, lineId={lineId}");

        // Step 1: Define month range
        var startOfMonth = new DateTime(year, month, 1);
        var endOfMonth = startOfMonth.AddMonths(1);

        // Step 2: Calculate total operating minutes from ProductionOutput (actual planned time)
        var totalOperatingMinutesQuery = from po in _repository.ProductionOutputs
                                         where po.Date >= startOfMonth && po.Date < endOfMonth
                                         && (lineId == null || po.LineId == lineId)
                                         select po.LoadingTime ?? 0;

        double totalOperatingMinutes = await totalOperatingMinutesQuery.SumAsync(x => (double)x);
        _logger.LogInformation($"Total operating minutes (from ProductionOutput): {totalOperatingMinutes}");

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

        double totalDowntimeMinutes = downtimeByTypeRaw.Sum(x => x.TotalMinutes);
        _logger.LogInformation($"Total downtime minutes: {totalDowntimeMinutes}");

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
        _logger.LogInformation($"Fetching daily downtime stats for month={month}, year={year}, lineId={lineId}, date={date}");

        DateTime startDate, endDate;
        if (!string.IsNullOrEmpty(date))
        {
            // Lọc theo ngày cụ thể (dd/mm/yyyy)
            if (!DateTime.TryParseExact(date, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out startDate))
            {
                throw new ArgumentException("Invalid date format. Use dd/MM/yyyy.");
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

        // Build response: For each unique date-line, include data
        var result = allDays
            .GroupBy(d => d.LineId)
            .Select(lineGroup => new
            {
                lineId = lineGroup.Key,
                lineName = lineNames.ContainsKey(lineGroup.Key) ? lineNames[lineGroup.Key] : "Unknown Line",
                dailyStats = lineGroup.Select(d => new
                {
                    date = d.Date.ToString("yyyy-MM-dd"),
                    oee = Math.Round(dailyOee.FirstOrDefault(oe => oe.Date == d.Date && oe.LineId == d.LineId)?.AvgOee ?? 0, 2),
                    lossPercentage = Math.Round((dailyOperatingMinutes.FirstOrDefault(dom => dom.Date == d.Date && dom.LineId == d.LineId)?.TotalOperatingMinutes ?? 0) > 0
                        ? (dailyDowntime.Where(dd => dd.Date == d.Date && dd.LineId == d.LineId).Sum(dd => dd.TotalDuration) /
                           (dailyOperatingMinutes.FirstOrDefault(dom => dom.Date == d.Date && dom.LineId == d.LineId)?.TotalOperatingMinutes ?? 0)) * 100
                        : 0.0, 2),
                    downDetails = new
                    {
                        dungNgan = GetTypeDetails(dailyDowntime, d.Date, d.LineId, 1, dailyOperatingMinutes.FirstOrDefault(dom => dom.Date == d.Date && dom.LineId == d.LineId)?.TotalOperatingMinutes ?? 0),
                        dungDai = GetTypeDetails(dailyDowntime, d.Date, d.LineId, 2, dailyOperatingMinutes.FirstOrDefault(dom => dom.Date == d.Date && dom.LineId == d.LineId)?.TotalOperatingMinutes ?? 0),
                        phePham = GetTypeDetails(dailyDowntime, d.Date, d.LineId, 3, dailyOperatingMinutes.FirstOrDefault(dom => dom.Date == d.Date && dom.LineId == d.LineId)?.TotalOperatingMinutes ?? 0),
                        veSinhDauCuoiCa = GetTypeDetails(dailyDowntime, d.Date, d.LineId, 4, dailyOperatingMinutes.FirstOrDefault(dom => dom.Date == d.Date && dom.LineId == d.LineId)?.TotalOperatingMinutes ?? 0),
                        doiMa = GetTypeDetails(dailyDowntime, d.Date, d.LineId, 5, dailyOperatingMinutes.FirstOrDefault(dom => dom.Date == d.Date && dom.LineId == d.LineId)?.TotalOperatingMinutes ?? 0)
                    }
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