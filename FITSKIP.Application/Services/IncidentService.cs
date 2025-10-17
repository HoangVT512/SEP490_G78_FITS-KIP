using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Services;

public class IncidentService : IIncidentService
{
    private readonly IIncidentRepository _incidentRepository;
    private readonly IEquipmentRepository _equipmentRepository;
    private readonly ILineRepository _lineRepository;
    private readonly IShiftRepository _shiftRepository;

    public IncidentService(
        IIncidentRepository incidentRepository,
        IEquipmentRepository equipmentRepository,
        ILineRepository lineRepository,
        IShiftRepository shiftRepository)
    {
        _incidentRepository = incidentRepository;
        _equipmentRepository = equipmentRepository;
        _lineRepository = lineRepository;
        _shiftRepository = shiftRepository;
    }

    public Task<IReadOnlyList<IncidentHistory>> GetIncidentsAsync(CancellationToken cancellationToken = default)
    {
        return _incidentRepository.GetAllAsync(cancellationToken);
    }

    public Task<IncidentHistory?> GetIncidentByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return _incidentRepository.GetByIdAsync(id, cancellationToken);
    }

    public async Task<IncidentHistory> CreateIncidentAsync(CreateIncidentRequest request, CancellationToken cancellationToken = default)
    {
        // Validate equipment exists and is active
        var equipment = await _equipmentRepository.GetByIdAsync(request.EquipmentId, cancellationToken);
        if (equipment == null || !equipment.IsActive)
        {
            throw new InvalidOperationException($"Không tìm thấy thiết bị với ID: {request.EquipmentId} hoặc thiết bị đã bị vô hiệu hóa");
        }

        // Validate start time
        if (request.StartTime > DateTime.Now)
        {
            throw new InvalidOperationException("Thời gian bắt đầu không thể trong tương lai");
        }

        // Validate end time if provided
        if (request.EndTime.HasValue)
        {
            if (request.EndTime.Value <= request.StartTime)
            {
                throw new InvalidOperationException("Thời gian kết thúc phải sau thời gian bắt đầu");
            }

            if (request.EndTime.Value > DateTime.Now)
            {
                throw new InvalidOperationException("Thời gian kết thúc không thể trong tương lai");
            }
        }

        // Calculate duration if end time is provided
        decimal? duration = null;
        if (request.EndTime.HasValue)
        {
            var timeSpan = request.EndTime.Value - request.StartTime;
            var durationMinutes = timeSpan.TotalMinutes;

            // Đảm bảo Duration luôn dương và ít nhất 1 phút
            duration = Math.Max(1, (decimal)durationMinutes);
        }

        var incident = new IncidentHistory
        {
            EquipmentId = request.EquipmentId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Duration = duration,
            TypeId = request.TypeId,
            Issue = request.Issue?.Trim(),
            Reason = request.Reason?.Trim(),
            Solution = request.Solution?.Trim(),
            CreatedDate = DateTime.UtcNow
        };

        return await _incidentRepository.CreateAsync(incident, cancellationToken);
    }

    public async Task<IncidentHistory?> UpdateIncidentAsync(int id, UpdateIncidentRequest request, CancellationToken cancellationToken = default)
    {
        var existingIncident = await _incidentRepository.GetByIdAsync(id, cancellationToken);
        if (existingIncident == null)
        {
            return null;
        }

        // Validate equipment exists and is active
        var equipment = await _equipmentRepository.GetByIdAsync(request.EquipmentId, cancellationToken);
        if (equipment == null || !equipment.IsActive)
        {
            throw new InvalidOperationException($"Không tìm thấy thiết bị với ID: {request.EquipmentId} hoặc thiết bị đã bị vô hiệu hóa");
        }

        // Validate start time
        if (request.StartTime > DateTime.Now)
        {
            throw new InvalidOperationException("Thời gian bắt đầu không thể trong tương lai");
        }

        // Validate end time if provided
        if (request.EndTime.HasValue)
        {
            if (request.EndTime.Value <= request.StartTime)
            {
                throw new InvalidOperationException("Thời gian kết thúc phải sau thời gian bắt đầu");
            }

            if (request.EndTime.Value > DateTime.Now)
            {
                throw new InvalidOperationException("Thời gian kết thúc không thể trong tương lai");
            }
        }

        // Calculate duration if end time is provided
        decimal? duration = null;
        if (request.EndTime.HasValue)
        {
            var timeSpan = request.EndTime.Value - request.StartTime;
            var durationMinutes = timeSpan.TotalMinutes;

            // Đảm bảo Duration luôn dương và ít nhất 1 phút
            duration = Math.Max(1, (decimal)durationMinutes);
        }

        existingIncident.EquipmentId = request.EquipmentId;
        existingIncident.StartTime = request.StartTime;
        existingIncident.EndTime = request.EndTime;
        existingIncident.Duration = duration;
        existingIncident.TypeId = request.TypeId;
        existingIncident.Issue = request.Issue?.Trim();
        existingIncident.Reason = request.Reason?.Trim();
        existingIncident.Solution = request.Solution?.Trim();

        return await _incidentRepository.UpdateAsync(existingIncident, cancellationToken);
    }

    public Task<bool> DeleteIncidentAsync(int id, CancellationToken cancellationToken = default)
    {
        return _incidentRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task<DowntimeStatsDTO> GetDowntimeStatsAsync(string period, DateTime? startDate = null, DateTime? endDate = null, int? lineId = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(period))
        {
            throw new ArgumentException("Period is required (day, week, month)");
        }

        period = period.ToLower();
        if (!new[] { "day", "week", "month" }.Contains(period))
        {
            throw new ArgumentException("Invalid period. Use 'day', 'week', or 'month'");
        }

        // Calculate date range based on period
        DateTime periodStartDate, periodEndDate;
        var now = DateTime.Now;

        switch (period)
        {
            case "day":
                periodStartDate = startDate ?? now.Date;
                periodEndDate = endDate ?? periodStartDate.AddDays(1).AddTicks(-1);
                break;
            case "week":
                var startOfWeek = now.Date.AddDays(-(int)now.DayOfWeek);
                periodStartDate = startDate ?? startOfWeek;
                periodEndDate = endDate ?? periodStartDate.AddDays(7).AddTicks(-1);
                break;
            case "month":
                var startOfMonth = new DateTime(now.Year, now.Month, 1);
                periodStartDate = startDate ?? startOfMonth;
                periodEndDate = endDate ?? periodStartDate.AddMonths(1).AddTicks(-1);
                break;
            default:
                periodStartDate = startDate ?? now.Date;
                periodEndDate = endDate ?? periodStartDate.AddDays(1).AddTicks(-1);
                break;
        }

        // Validate line if provided
        if (lineId.HasValue)
        {
            var line = await _lineRepository.GetByIdAsync(lineId.Value, cancellationToken);
            if (line == null || !line.IsActive)
            {
                throw new InvalidOperationException($"Không tìm thấy chuyền sản xuất với ID: {lineId.Value} hoặc chuyền đã bị vô hiệu hóa");
            }
        }

        // Get incidents based on filters
        IReadOnlyList<IncidentHistory> incidents;
        if (lineId.HasValue)
        {
            incidents = await _incidentRepository.GetByLineIdAsync(lineId.Value, periodStartDate, periodEndDate, cancellationToken);
        }
        else
        {
            incidents = await _incidentRepository.GetByDateRangeAsync(periodStartDate, periodEndDate, cancellationToken);
        }

        // Calculate statistics
        var totalDowntime = incidents.Where(i => i.Duration.HasValue).Sum(i => i.Duration.Value);
        var totalIncidents = incidents.Count;

        // Group by line
        var downtimeByLines = incidents
            .Where(i => i.Equipment?.Stage?.Line != null)
            .GroupBy(i => new
            {
                LineId = i.Equipment!.Stage!.Line!.LineId,
                LineName = i.Equipment.Stage.Line.LineName
            })
            .Select(g => new DowntimeByLineDTO
            {
                LineId = g.Key.LineId,
                LineName = g.Key.LineName,
                TotalDowntime = g.Where(i => i.Duration.HasValue).Sum(i => i.Duration.Value),
                IncidentCount = g.Count()
            })
            .ToList();

        // Group by stop type
        var incidentsByStopType = incidents
            .Where(i => i.Type != null)
            .GroupBy(i => new
            {
                TypeId = i.TypeId ?? 0,
                TypeName = i.Type!.TypeName ?? "Unknown"
            })
            .Select(g => new IncidentByStopTypeDTO
            {
                TypeId = g.Key.TypeId,
                TypeName = g.Key.TypeName,
                IncidentCount = g.Count(),
                TotalDowntime = g.Where(i => i.Duration.HasValue).Sum(i => i.Duration.Value)
            })
            .ToList();

        // Group by shift - Calculate downtime for each shift based on incident start time
        var shifts = await _shiftRepository.GetAllAsync(cancellationToken);
        var downtimeByShifts = new List<DowntimeByShiftDTO>();

        foreach (var shift in shifts)
        {
            var shiftIncidents = incidents.Where(i =>
                i.StartTime.HasValue &&
                IsTimeInShift(i.StartTime.Value.TimeOfDay, shift.StartTime, shift.EndTime)
            ).ToList();

            downtimeByShifts.Add(new DowntimeByShiftDTO
            {
                ShiftId = shift.ShiftId,
                ShiftName = shift.ShiftName,
                TotalDowntime = shiftIncidents.Where(i => i.Duration.HasValue).Sum(i => i.Duration.Value),
                IncidentCount = shiftIncidents.Count
            });
        }

        return new DowntimeStatsDTO
        {
            Period = $"{period.ToUpper()} ({periodStartDate:yyyy-MM-dd} to {periodEndDate:yyyy-MM-dd})",
            TotalDowntime = totalDowntime,
            TotalIncidents = totalIncidents,
            DowntimeByLines = downtimeByLines,
            IncidentsByStopType = incidentsByStopType,
            DowntimeByShifts = downtimeByShifts
        };
    }

    public async Task<IReadOnlyList<dynamic>> GetStopTypesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var stopTypes = await _incidentRepository.GetStopTypesAsync(cancellationToken);
            return stopTypes;
        }
        catch (Exception)
        {
            return new List<dynamic>();
        }
    }

    private static bool IsTimeInShift(TimeSpan time, TimeOnly shiftStart, TimeOnly shiftEnd)
    {
        var timeOnly = TimeOnly.FromTimeSpan(time);

        if (shiftStart <= shiftEnd)
        {
            // Normal shift (e.g., 06:00 - 14:00)
            return timeOnly >= shiftStart && timeOnly < shiftEnd;
        }
        else
        {
            // Night shift crossing midnight (e.g., 22:00 - 06:00)
            return timeOnly >= shiftStart || timeOnly < shiftEnd;
        }
    }
}