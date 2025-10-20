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
    private readonly IUserRepository _userRepository;
    private readonly INotificationService _notificationService;
    private readonly IUserService _userService;

    public IncidentService(
        IIncidentRepository incidentRepository,
        IEquipmentRepository equipmentRepository,
        ILineRepository lineRepository,
        IShiftRepository shiftRepository,
        IUserRepository userRepository,
        INotificationService notificationService,
        IUserService userService)
    {
        _incidentRepository = incidentRepository;
        _equipmentRepository = equipmentRepository;
        _lineRepository = lineRepository;
        _shiftRepository = shiftRepository;
        _userRepository = userRepository;
        _notificationService = notificationService;
        _userService = userService;
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

        // Issue can be null or empty - no validation required

        // Set StartTime to now if not provided
        var startTime = request.StartTime ?? DateTime.Now;

        // Validate end time if provided
        if (request.EndTime.HasValue)
        {
            if (request.EndTime.Value <= startTime)
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
            var timeSpan = request.EndTime.Value - startTime;
            var durationMinutes = timeSpan.TotalMinutes;

            // Đảm bảo Duration luôn dương và ít nhất 1 phút
            duration = Math.Max(1, (decimal)durationMinutes);
        }

        var incident = new IncidentHistory
        {
            EquipmentId = request.EquipmentId,
            StartTime = startTime,
            EndTime = request.EndTime,
            Duration = duration,
            TypeId = request.TypeId, /* Lines 82-83 omitted */
            Issue = request.Issue?.Trim(),
            Reason = request.Reason?.Trim(),
            Solution = request.Solution?.Trim(),
            Status = request.EndTime.HasValue ? "Hoàn thành" : "Chờ xử lý",
            CreatedDate = DateTime.Now,
            ReportedByUserId = request.ReportedByUserId,
            IsTechSupport = request.IsTechSupport
        };

        var createdIncident = await _incidentRepository.CreateAsync(incident, cancellationToken);

        // Tự động tạo IncidentShift records nếu có endtime
        if (request.EndTime.HasValue)
        {
            await CreateIncidentShiftsAsync(createdIncident, cancellationToken);
            // Save changes after creating incident shifts
            await _incidentRepository.UpdateAsync(createdIncident, cancellationToken);
        }

        // Send notification to Technical Managers
        await SendIncidentNotificationToTechnicalManagersAsync(createdIncident, equipment, cancellationToken);

        return createdIncident;
    }

    public async Task<BulkIncidentResponse> CreateBulkIncidentsAsync(CreateBulkIncidentRequest request, CancellationToken cancellationToken = default)
    {
        var response = new BulkIncidentResponse
        {
            TotalRequested = request.Incidents.Count
        };

        for (int i = 0; i < request.Incidents.Count; i++)
        {
            var incidentRequest = request.Incidents[i];
            try
            {
                // Validate equipment exists and is active
                var equipment = await _equipmentRepository.GetByIdAsync(incidentRequest.EquipmentId, cancellationToken);
                if (equipment == null || !equipment.IsActive)
                {
                    response.FailureCount++;
                    response.Errors.Add(new BulkIncidentError
                    {
                        Index = i + 1,
                        ErrorMessage = $"Không tìm thấy thiết bị với ID: {incidentRequest.EquipmentId} hoặc thiết bị đã bị vô hiệu hóa",
                        FailedRequest = incidentRequest
                    });
                    continue;
                }

                // Set StartTime to now if not provided
                var startTime = incidentRequest.StartTime ?? DateTime.Now;

                // Validate end time if provided
                if (incidentRequest.EndTime.HasValue)
                {
                    if (incidentRequest.EndTime.Value <= startTime)
                    {
                        response.FailureCount++;
                        response.Errors.Add(new BulkIncidentError
                        {
                            Index = i + 1,
                            ErrorMessage = "Thời gian kết thúc phải sau thời gian bắt đầu",
                            FailedRequest = incidentRequest
                        });
                        continue;
                    }

                    if (incidentRequest.EndTime.Value > DateTime.Now)
                    {
                        response.FailureCount++;
                        response.Errors.Add(new BulkIncidentError
                        {
                            Index = i + 1,
                            ErrorMessage = "Thời gian kết thúc không thể trong tương lai",
                            FailedRequest = incidentRequest
                        });
                        continue;
                    }
                }

                // Calculate duration if end time is provided
                decimal? duration = null;
                if (incidentRequest.EndTime.HasValue)
                {
                    var timeSpan = incidentRequest.EndTime.Value - startTime;
                    var durationMinutes = timeSpan.TotalMinutes;
                    duration = Math.Max(1, (decimal)durationMinutes);
                }

                var incident = new IncidentHistory
                {
                    EquipmentId = incidentRequest.EquipmentId,
                    StartTime = startTime,
                    EndTime = incidentRequest.EndTime,
                    Duration = duration,
                    TypeId = incidentRequest.TypeId,
                    Issue = incidentRequest.Issue?.Trim(),
                    Reason = incidentRequest.Reason?.Trim(),
                    Solution = incidentRequest.Solution?.Trim(),
                    Status = incidentRequest.EndTime.HasValue ? "Hoàn thành" : "Chờ xử lý",
                    CreatedDate = DateTime.Now,
                    ReportedByUserId = incidentRequest.ReportedByUserId,
                    IsTechSupport = incidentRequest.IsTechSupport
                };

                var createdIncident = await _incidentRepository.CreateAsync(incident, cancellationToken);

                // Tự động tạo IncidentShift records nếu có endtime
                if (incidentRequest.EndTime.HasValue)
                {
                    await CreateIncidentShiftsAsync(createdIncident, cancellationToken);
                    // Save changes after creating incident shifts
                    createdIncident = await _incidentRepository.UpdateAsync(createdIncident, cancellationToken);
                }

                response.SuccessCount++;

                // Send notification to Technical Managers for each incident
                await SendIncidentNotificationToTechnicalManagersAsync(createdIncident, equipment, cancellationToken);

                // Map to DTO for response
                if (createdIncident != null)
                {
                    response.SuccessfulIncidents.Add(new IncidentHistoryDTO
                    {
                        IncidentId = createdIncident.IncidentId,
                        EquipmentId = createdIncident.EquipmentId ?? 0,
                        EquipmentName = createdIncident.Equipment?.EquipmentName,
                        EquipmentCode = createdIncident.Equipment?.EquipmentCode,
                        LineName = createdIncident.Equipment?.Stage?.Line?.LineName,
                        StartTime = createdIncident.StartTime,
                        EndTime = createdIncident.EndTime,
                        Duration = createdIncident.Duration,
                        TypeId = createdIncident.TypeId,
                        TypeName = createdIncident.Type?.TypeName,
                        Reason = createdIncident.Reason,
                        Solution = createdIncident.Solution,
                        Issue = createdIncident.Issue,
                        CreatedDate = createdIncident.CreatedDate
                    });
                }
            }
            catch (Exception ex)
            {
                response.FailureCount++;
                response.Errors.Add(new BulkIncidentError
                {
                    Index = i + 1,
                    ErrorMessage = ex.Message,
                    FailedRequest = incidentRequest
                });
            }
        }

        return response;
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

        // Update TypeId only if provided
        if (request.TypeId.HasValue && request.TypeId > 0)
        {
            existingIncident.TypeId = request.TypeId;
        }

        // Update ReportedByUserId (can be null)
        existingIncident.ReportedByUserId = request.ReportedByUserId;

        existingIncident.Issue = request.Issue?.Trim();
        existingIncident.Reason = request.Reason?.Trim(); // Có thể null
        existingIncident.Solution = request.Solution?.Trim(); // Có thể null

        // Update status if provided
        if (!string.IsNullOrEmpty(request.Status))
        {
            existingIncident.Status = request.Status;
        }

        // Track if status or IsTechSupport changed to "Chờ xử lý" + true (need notification)
        var wasNotTechSupport = !existingIncident.IsTechSupport;
        var wasNotPending = existingIncident.Status != "Chờ xử lý";

        existingIncident.IsTechSupport = request.IsTechSupport;

        var updatedIncident = await _incidentRepository.UpdateAsync(existingIncident, cancellationToken);

        // Tự động tạo IncidentShift records nếu có endtime và đã có IncidentShift nào
        if (request.EndTime.HasValue && updatedIncident != null)
        {
            // Clear existing incident shifts if any
            updatedIncident.IncidentShifts.Clear();
            await CreateIncidentShiftsAsync(updatedIncident, cancellationToken);
            // Save changes after creating incident shifts
            updatedIncident = await _incidentRepository.UpdateAsync(updatedIncident, cancellationToken);
        }

        // Gửi notification CHỈ KHI status hoặc IsTechSupport THAY ĐỔI thành "Chờ xử lý" + true
        // Tránh gửi duplicate notification khi update các field khác
        var shouldSendNotification = updatedIncident != null
            && updatedIncident.Status == "Chờ xử lý"
            && updatedIncident.IsTechSupport
            && (wasNotTechSupport || wasNotPending); // Only if changed TO this state

        if (shouldSendNotification)
        {
            var updatedEquipment = await _equipmentRepository.GetByIdAsync(updatedIncident.EquipmentId ?? 0, cancellationToken);
            if (updatedEquipment != null)
            {
                Console.WriteLine($"🔔 Update triggered notification - wasNotTechSupport: {wasNotTechSupport}, wasNotPending: {wasNotPending}");
                await SendIncidentNotificationToTechnicalManagersAsync(updatedIncident, updatedEquipment, cancellationToken);
            }
        }
        else
        {
            Console.WriteLine($"⏭️ Skipping notification on update - Status: {updatedIncident?.Status}, IsTechSupport: {updatedIncident?.IsTechSupport}, Changed: {wasNotTechSupport || wasNotPending}");
        }

        return updatedIncident;
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
        var totalDowntime = incidents.Where(i => i.Duration.HasValue).Sum(i => i.Duration!.Value);
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
                TotalDowntime = g.Where(i => i.Duration.HasValue).Sum(i => i.Duration!.Value),
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
                TotalDowntime = g.Where(i => i.Duration.HasValue).Sum(i => i.Duration!.Value)
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
                TotalDowntime = shiftIncidents.Where(i => i.Duration.HasValue).Sum(i => i.Duration!.Value),
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

    private async Task CreateIncidentShiftsAsync(IncidentHistory incident, CancellationToken cancellationToken = default)
    {
        if (!incident.EndTime.HasValue || !incident.StartTime.HasValue)
            return;

        // Get all shifts
        var shifts = await _shiftRepository.GetAllAsync(cancellationToken);

        foreach (var shift in shifts)
        {
            // Calculate shift start and end datetime for the incident date
            var incidentDate = incident.StartTime.Value.Date;
            var shiftStartDateTime = incidentDate.Add(shift.StartTime.ToTimeSpan());
            var shiftEndDateTime = shift.StartTime <= shift.EndTime
                ? incidentDate.Add(shift.EndTime.ToTimeSpan())  // Normal shift
                : incidentDate.AddDays(1).Add(shift.EndTime.ToTimeSpan());  // Night shift crossing midnight

            // Calculate overlap between incident and shift
            var overlapStart = incident.StartTime.Value > shiftStartDateTime ? incident.StartTime.Value : shiftStartDateTime;
            var overlapEnd = incident.EndTime.Value < shiftEndDateTime ? incident.EndTime.Value : shiftEndDateTime;

            // Only create IncidentShift if there is actual overlap
            if (overlapStart < overlapEnd)
            {
                var incidentShift = new IncidentShift
                {
                    IncidentId = incident.IncidentId,
                    ShiftId = shift.ShiftId,
                    StartTime = overlapStart,
                    EndTime = overlapEnd
                };

                incident.IncidentShifts.Add(incidentShift);
            }
        }
    }

    public async Task<IReadOnlyList<IncidentShift>> GetIncidentShiftsAsync(int incidentId, CancellationToken cancellationToken = default)
    {
        return await _incidentRepository.GetIncidentShiftsAsync(incidentId, cancellationToken);
    }

    public async Task<bool> AssignTechnicianAsync(int incidentId, string technicianId, bool updateStatus = false, CancellationToken cancellationToken = default)
    {
        var incident = await _incidentRepository.GetByIdAsync(incidentId, cancellationToken);
        if (incident == null)
        {
            return false;
        }

        // Update the AssignedTo field with the technician ID
        incident.AssignedTo = technicianId;

        // Update status if requested
        if (updateStatus && incident.Status == "Chờ xử lý")
        {
            incident.Status = "Đang xử lý";
        }

        await _incidentRepository.UpdateAsync(incident, cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<IncidentHistory>> GetIncidentsByUserLinesAsync(string userId, CancellationToken cancellationToken = default)
    {
        // Get user's assigned lines
        var userLines = await _userRepository.GetUserLinesAsync(userId, cancellationToken);
        var lineIds = userLines.Select(ul => ul.LineId).ToList();

        // Get all incidents and filter by line IDs
        var allIncidents = await _incidentRepository.GetAllAsync(cancellationToken);
        var filteredIncidents = allIncidents.Where(i => i.Equipment != null && i.Equipment.Stage != null && i.Equipment.Stage.LineId.HasValue && lineIds.Contains(i.Equipment.Stage.LineId.Value)).ToList();

        return filteredIncidents.AsReadOnly();
    }

    private async Task SendIncidentNotificationToTechnicalManagersAsync(IncidentHistory incident, Equipment equipment, CancellationToken cancellationToken)
    {
        try
        {
            Console.WriteLine($"📢 SendIncidentNotificationToTechnicalManagersAsync called for incident {incident.IncidentId}");
            Console.WriteLine($"   Status: {incident.Status}, IsTechSupport: {incident.IsTechSupport}");

            // Chỉ gửi notification khi status là "Chờ xử lý" và istechsupport là true
            if (incident.Status != "Chờ xử lý" || !incident.IsTechSupport)
            {
                Console.WriteLine($"   ❌ Skipping notification - Status: {incident.Status}, IsTechSupport: {incident.IsTechSupport}");
                return;
            }

            // Get equipment's department
            var department = equipment?.Stage?.Line?.Department;
            Console.WriteLine($"   Equipment: {equipment?.EquipmentName} (ID: {equipment?.EquipmentId})");
            Console.WriteLine($"   Stage: {equipment?.Stage?.StageName} (ID: {equipment?.Stage?.StageId})");
            Console.WriteLine($"   Line: {equipment?.Stage?.Line?.LineName} (ID: {equipment?.Stage?.Line?.LineId})");
            Console.WriteLine($"   Department: {department?.DepartmentName} (ID: {department?.DepartmentId})");

            if (department == null || department.DepartmentId == 0)
            {
                Console.WriteLine($"⚠️ Warning: Could not determine department for equipment {equipment?.EquipmentId}");
                return;
            }

            // Get all Technical Managers
            var allTechnicalManagers = await _userService.GetUsersByRoleAsync("Quản lý kỹ thuật", cancellationToken);
            Console.WriteLine($"   Found {allTechnicalManagers.Count()} total Technical Managers");

            // ✅ FIX: Chỉ gửi notification cho Technical Managers thuộc ĐÚNG phòng ban
            var technicalManagers = allTechnicalManagers
                .Where(m => m.DepartmentId.HasValue && m.DepartmentId.Value == department.DepartmentId)
                .ToList();

            Console.WriteLine($"   ✅ Filtered to {technicalManagers.Count} Technical Managers in department {department.DepartmentId}");

            // Create notification record in database for each Technical Manager in this department
            foreach (var manager in technicalManagers)
            {
                if (!string.IsNullOrEmpty(manager.Id))
                {
                    Console.WriteLine($"   📝 Creating notification for manager: {manager.FullName} (ID: {manager.Id}, Dept: {manager.DepartmentId})");
                    await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                    {
                        UserId = manager.Id,
                        Title = "Sự cố cần hỗ trợ kỹ thuật",
                        Message = $"Có sự cố mới cần hỗ trợ kỹ thuật tại thiết bị {equipment.EquipmentName} ({equipment.EquipmentCode}) - Mã sự cố: {incident.IncidentId}"
                    });
                }
            }

            // Send realtime notification to TechnicalManagers group (broadcast to all)
            Console.WriteLine($"   🔔 Sending realtime notification to TechnicalManagers group");
            await _notificationService.SendNotificationToGroupAsync(
                "TechnicalManagers",
                "Sự cố cần hỗ trợ kỹ thuật",
                $"Có sự cố mới cần hỗ trợ kỹ thuật tại thiết bị {equipment.EquipmentName} ({equipment.EquipmentCode}) - Mã sự cố: {incident.IncidentId}",
                "incident"
            );
            Console.WriteLine($"   ✅ Notification sent successfully");
        }
        catch (Exception ex)
        {
            // Log error but don't fail the incident creation
            Console.WriteLine($"❌ Error sending incident notification: {ex.Message}");
            Console.WriteLine($"   Stack trace: {ex.StackTrace}");
        }
    }
}