using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.AspNetCore.Http;

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
    private readonly IAzureStorageService _azureStorageService;

    public IncidentService(
        IIncidentRepository incidentRepository,
        IEquipmentRepository equipmentRepository,
        ILineRepository lineRepository,
        IShiftRepository shiftRepository,
        IUserRepository userRepository,
        INotificationService notificationService,
        IUserService userService,
        IAzureStorageService azureStorageService)
    {
        _incidentRepository = incidentRepository;
        _equipmentRepository = equipmentRepository;
        _lineRepository = lineRepository;
        _shiftRepository = shiftRepository;
        _userRepository = userRepository;
        _notificationService = notificationService;
        _userService = userService;
        _azureStorageService = azureStorageService;
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
        // Validate equipment exists and is active if EquipmentId is provided
        if (request.EquipmentId.HasValue)
        {
            var validatedEquipment = await _equipmentRepository.GetByIdAsync(request.EquipmentId.Value, cancellationToken);
            if (validatedEquipment == null)
            {
                throw new InvalidOperationException($"Không tìm thấy thiết bị với ID: {request.EquipmentId.Value}");
            }
            if (!validatedEquipment.IsActive)
            {
                throw new InvalidOperationException($"Thiết bị với ID: {request.EquipmentId.Value} đã bị vô hiệu hóa");
            }
        }

        // Validate line exists and is active if LineId is provided
        if (request.LineId.HasValue)
        {
            var line = await _lineRepository.GetByIdAsync(request.LineId.Value, cancellationToken);
            if (line == null)
            {
                throw new InvalidOperationException($"Không tìm thấy dây chuyền với ID: {request.LineId.Value}");
            }
            if (!line.IsActive)
            {
                throw new InvalidOperationException($"Dây chuyền với ID: {request.LineId.Value} đã bị vô hiệu hóa");
            }
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

        // Calculate duration logic:
        // 1. If user provides duration manually, use it (manual override)
        // 2. If no duration provided but endTime exists, calculate from startTime-endTime with break time deduction
        // 3. If neither duration nor endTime provided, duration remains null
        decimal? duration = request.Duration; // Use manual duration if provided
        if (!request.Duration.HasValue && request.EndTime.HasValue)
        {
            // Auto-calculate only when no manual duration is provided
            var rawDuration = (decimal)(request.EndTime.Value - startTime).TotalMinutes;
            // Làm tròn chính xác đến 2 chữ số thập phân
            rawDuration = Math.Round(rawDuration, 2, MidpointRounding.ToEven);
            duration = CalculateAdjustedDuration(startTime, request.EndTime.Value, rawDuration);
        }

        var incident = new IncidentHistory
        {
            EquipmentId = request.EquipmentId,
            LineId = request.LineId,
            StartTime = startTime,
            EndTime = request.EndTime,
            Duration = duration,
            TypeId = request.TypeId,
            Issue = request.Issue?.Trim(),
            Reason = request.Reason?.Trim(),
            Solution = request.Solution?.Trim(),
            Status = request.EndTime.HasValue ? "Hoàn thành" : "Chờ xử lý",
            CreatedDate = DateTime.Now,
            ReportedByUserId = request.ReportedByUserId,
            IsTechSupport = request.IsTechSupport
        };

        var createdIncident = await _incidentRepository.CreateAsync(incident, cancellationToken);

        // Create IncidentImage records if multiple images provided
        if (request.ImageUrls != null && request.ImageUrls.Count > 0)
        {
            Console.WriteLine($"[CreateIncidentAsync] Creating {request.ImageUrls.Count} image records for incident {createdIncident.IncidentId}");
            for (int i = 0; i < Math.Min(request.ImageUrls.Count, 5); i++) // Max 5 images
            {
                var incidentImage = new IncidentImage
                {
                    IncidentId = createdIncident.IncidentId,
                    ImageUrl = request.ImageUrls[i],
                    OrderIndex = i,
                    UploadedAt = DateTime.Now
                };
                createdIncident.IncidentImages.Add(incidentImage);
                Console.WriteLine($"[CreateIncidentAsync] Added image {i}: {request.ImageUrls[i]}");
            }
            // Save the incident images
            await _incidentRepository.UpdateAsync(createdIncident, cancellationToken);
            Console.WriteLine($"[CreateIncidentAsync] Saved {createdIncident.IncidentImages.Count} images to database");
        }
        else
        {
            Console.WriteLine($"[CreateIncidentAsync] No imageUrls provided");
        }

        // Tự động tạo IncidentShift records nếu có endtime
        if (request.EndTime.HasValue)
        {
            await CreateIncidentShiftsAsync(createdIncident, cancellationToken);
            // Save changes after creating incident shifts
            await _incidentRepository.UpdateAsync(createdIncident, cancellationToken);
        }

        // Send notification to Technical Managers
        var equipment = request.EquipmentId.HasValue ? await _equipmentRepository.GetByIdAsync(request.EquipmentId.Value, cancellationToken) : null;
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
                // Validate equipment exists and is active if EquipmentId is provided
                if (incidentRequest.EquipmentId.HasValue)
                {
                    var validatedEquipment = await _equipmentRepository.GetByIdAsync(incidentRequest.EquipmentId.Value, cancellationToken);
                    if (validatedEquipment == null || !validatedEquipment.IsActive)
                    {
                        response.FailureCount++;
                        response.Errors.Add(new BulkIncidentError
                        {
                            Index = i + 1,
                            ErrorMessage = $"Không tìm thấy thiết bị với ID: {incidentRequest.EquipmentId.Value} hoặc thiết bị đã bị vô hiệu hóa",
                            FailedRequest = incidentRequest
                        });
                        continue;
                    }
                }

                // Validate line exists and is active if LineId is provided
                if (incidentRequest.LineId.HasValue)
                {
                    var line = await _lineRepository.GetByIdAsync(incidentRequest.LineId.Value, cancellationToken);
                    if (line == null || !line.IsActive)
                    {
                        response.FailureCount++;
                        response.Errors.Add(new BulkIncidentError
                        {
                            Index = i + 1,
                            ErrorMessage = $"Không tìm thấy dây chuyền với ID: {incidentRequest.LineId.Value} hoặc dây chuyền đã bị vô hiệu hóa",
                            FailedRequest = incidentRequest
                        });
                        continue;
                    }
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

                // Calculate duration - use provided duration or calculate from end time
                decimal? duration = incidentRequest.Duration;
                if (!incidentRequest.Duration.HasValue && incidentRequest.EndTime.HasValue)
                {
                    var rawDuration = (decimal)(incidentRequest.EndTime.Value - startTime).TotalMinutes;
                    duration = CalculateAdjustedDuration(startTime, incidentRequest.EndTime.Value, rawDuration);
                }

                var incident = new IncidentHistory
                {
                    EquipmentId = incidentRequest.EquipmentId,
                    LineId = incidentRequest.LineId,
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

                // Create IncidentImage records if multiple images provided
                if (incidentRequest.ImageUrls != null && incidentRequest.ImageUrls.Count > 0)
                {
                    Console.WriteLine($"[Bulk CreateIncidentAsync] Creating {incidentRequest.ImageUrls.Count} image records for incident {createdIncident.IncidentId}");
                    for (int j = 0; j < Math.Min(incidentRequest.ImageUrls.Count, 5); j++) // Max 5 images
                    {
                        var incidentImage = new IncidentImage
                        {
                            IncidentId = createdIncident.IncidentId,
                            ImageUrl = incidentRequest.ImageUrls[j],
                            OrderIndex = j,
                            UploadedAt = DateTime.Now
                        };
                        createdIncident.IncidentImages.Add(incidentImage);
                        Console.WriteLine($"[Bulk CreateIncidentAsync] Added image {j}: {incidentRequest.ImageUrls[j]}");
                    }
                    // Save the incident images
                    await _incidentRepository.UpdateAsync(createdIncident, cancellationToken);
                    Console.WriteLine($"[Bulk CreateIncidentAsync] Saved {createdIncident.IncidentImages.Count} images to database");
                }

                // Tự động tạo IncidentShift records nếu có endtime
                if (incidentRequest.EndTime.HasValue)
                {
                    await CreateIncidentShiftsAsync(createdIncident, cancellationToken);
                    // Save changes after creating incident shifts
                    createdIncident = await _incidentRepository.UpdateAsync(createdIncident, cancellationToken);
                }

                response.SuccessCount++;

                // Send notification to Technical Managers for each incident
                var equipmentForNotification = incidentRequest.EquipmentId.HasValue ? await _equipmentRepository.GetByIdAsync(incidentRequest.EquipmentId.Value, cancellationToken) : null;
                if (createdIncident != null)
                {
                    await SendIncidentNotificationToTechnicalManagersAsync(createdIncident, equipmentForNotification, cancellationToken);
                }

                // Map to DTO for response
                if (createdIncident != null)
                {
                    response.SuccessfulIncidents.Add(new IncidentHistoryDTO
                    {
                        IncidentId = createdIncident.IncidentId,
                        EquipmentId = createdIncident.EquipmentId ?? 0,
                        EquipmentName = createdIncident.Equipment?.EquipmentName,
                        EquipmentCode = createdIncident.Equipment?.EquipmentCode,
                        LineId = createdIncident.LineId,
                        LineName = createdIncident.Line?.LineName ?? createdIncident.Equipment?.Stage?.Line?.LineName,
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

        // Validate equipment exists and is active if EquipmentId is provided
        if (request.EquipmentId.HasValue)
        {
            var validatedEquipment = await _equipmentRepository.GetByIdAsync(request.EquipmentId.Value, cancellationToken);
            if (validatedEquipment == null)
            {
                throw new InvalidOperationException($"Không tìm thấy thiết bị với ID: {request.EquipmentId.Value}");
            }
            if (!validatedEquipment.IsActive)
            {
                throw new InvalidOperationException($"Thiết bị với ID: {request.EquipmentId.Value} đã bị vô hiệu hóa");
            }
        }

        // Validate line exists and is active if LineId is provided
        if (request.LineId.HasValue)
        {
            var line = await _lineRepository.GetByIdAsync(request.LineId.Value, cancellationToken);
            if (line == null)
            {
                throw new InvalidOperationException($"Không tìm thấy dây chuyền với ID: {request.LineId.Value}");
            }
            if (!line.IsActive)
            {
                throw new InvalidOperationException($"Dây chuyền với ID: {request.LineId.Value} đã bị vô hiệu hóa");
            }
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

        // Calculate duration logic:
        // 1. If user provides duration manually, use it (manual override)
        // 2. If no duration provided but endTime exists, calculate from startTime-endTime with break time deduction
        // 3. If neither duration nor endTime provided, duration remains null
        decimal? duration = request.Duration; // Use manual duration if provided
        if (!request.Duration.HasValue && request.EndTime.HasValue)
        {
            // Auto-calculate only when no manual duration is provided
            var rawDuration = (decimal)(request.EndTime.Value - request.StartTime).TotalMinutes;
            // Làm tròn chính xác đến 2 chữ số thập phân
            rawDuration = Math.Round(rawDuration, 2, MidpointRounding.ToEven);
            duration = CalculateAdjustedDuration(request.StartTime, request.EndTime.Value, rawDuration);
        }

        existingIncident.EquipmentId = request.EquipmentId;
        existingIncident.LineId = request.LineId;
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

        // Update IncidentImages collection
        if (request.ImageUrls != null && request.ImageUrls.Count > 0)
        {
            Console.WriteLine($"[UpdateIncidentAsync] Updating {request.ImageUrls.Count} image records for incident {id}");

            // Clear existing images
            existingIncident.IncidentImages.Clear();

            // Add new images
            for (int i = 0; i < Math.Min(request.ImageUrls.Count, 5); i++) // Max 5 images
            {
                var incidentImage = new IncidentImage
                {
                    IncidentId = existingIncident.IncidentId,
                    ImageUrl = request.ImageUrls[i],
                    OrderIndex = i,
                    UploadedAt = DateTime.Now
                };
                existingIncident.IncidentImages.Add(incidentImage);
                Console.WriteLine($"[UpdateIncidentAsync] Added image {i}: {request.ImageUrls[i]}");
            }
            Console.WriteLine($"[UpdateIncidentAsync] Updated {existingIncident.IncidentImages.Count} images");
        }
        else if (request.ImageUrls != null && request.ImageUrls.Count == 0)
        {
            // If imageUrls is empty array, clear all images
            Console.WriteLine($"[UpdateIncidentAsync] Clearing all images for incident {id}");
            existingIncident.IncidentImages.Clear();
        }

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

        if (shouldSendNotification && updatedIncident != null)
        {
            var updatedEquipment = updatedIncident.EquipmentId.HasValue ? await _equipmentRepository.GetByIdAsync(updatedIncident.EquipmentId.Value, cancellationToken) : null;
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
            .Where(i => i.Line != null || (i.Equipment?.Stage?.Line != null))
            .GroupBy(i => new
            {
                LineId = i.LineId ?? i.Equipment?.Stage?.Line?.LineId ?? 0,
                LineName = i.Line?.LineName ?? i.Equipment?.Stage?.Line?.LineName ?? "Unknown"
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
        var filteredIncidents = allIncidents.Where(i =>
            // Include incidents that have LineId directly
            (i.LineId.HasValue && lineIds.Contains(i.LineId.Value)) ||
            // Or incidents that have Equipment with Stage.LineId
            (i.Equipment != null && i.Equipment.Stage != null && i.Equipment.Stage.LineId.HasValue && lineIds.Contains(i.Equipment.Stage.LineId.Value))
        ).ToList();

        return filteredIncidents.AsReadOnly();
    }

    public async Task<IReadOnlyList<IncidentHistory>> GetIncidentsAssignedToTechnicianAsync(string technicianId, CancellationToken cancellationToken = default)
    {
        // Get all incidents that are assigned to the technician
        var allIncidents = await _incidentRepository.GetAllAsync(cancellationToken);
        var assignedIncidents = allIncidents.Where(i =>
            i.AssignedTo != null && i.AssignedTo.ToString() == technicianId
        ).ToList();

        return assignedIncidents.AsReadOnly();
    }

    private static decimal CalculateAdjustedDuration(DateTime startTime, DateTime endTime, decimal rawDurationMinutes)
    {
        // Đảm bảo Duration luôn dương và ít nhất 1 phút
        // if (rawDurationMinutes <= 0)
        //     return 1;

        var adjustedDuration = rawDurationMinutes;

        // Thời gian nghỉ cố định
        var break1Start = new TimeSpan(11, 0, 0); // 11:00
        var break1End = new TimeSpan(11, 30, 0);   // 11:30
        var break2Start = new TimeSpan(18, 0, 0); // 18:00
        var break2End = new TimeSpan(18, 30, 0);   // 18:30

        // Tính overlap với thời gian nghỉ trong khoảng thời gian của incident
        var incidentStart = startTime.TimeOfDay;
        var incidentEnd = endTime.TimeOfDay;

        // Nếu incident kéo dài qua nhiều ngày, chỉ xét trong ngày đầu tiên
        if (endTime.Date > startTime.Date)
        {
            incidentEnd = new TimeSpan(23, 59, 59);
        }

        // Tính overlap với break 1 (11:00-11:30)
        var break1Overlap = CalculateOverlapMinutes(incidentStart, incidentEnd, break1Start, break1End);
        adjustedDuration -= break1Overlap;

        // Tính overlap với break 2 (18:00-18:30)
        var break2Overlap = CalculateOverlapMinutes(incidentStart, incidentEnd, break2Start, break2End);
        adjustedDuration -= break2Overlap;

        // Đảm bảo duration không âm
        return Math.Max(0, adjustedDuration);
    }

    private static decimal CalculateOverlapMinutes(TimeSpan start1, TimeSpan end1, TimeSpan start2, TimeSpan end2)
    {
        var overlapStart = start1 > start2 ? start1 : start2;
        var overlapEnd = end1 < end2 ? end1 : end2;

        if (overlapStart < overlapEnd)
        {
            //return (decimal)(overlapEnd - overlapStart).TotalMinutes;
            // Tính chính xác đến 2 chữ số thập phân, không làm tròn
            var totalSeconds = (overlapEnd - overlapStart).TotalSeconds;
            return Math.Round((decimal)(totalSeconds / 60), 2, MidpointRounding.ToEven);
        }

        return 0;
    }

    private async Task SendIncidentNotificationToTechnicalManagersAsync(IncidentHistory incident, Equipment? equipment, CancellationToken cancellationToken)
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

            // Get equipment's information for notification message
            var department = equipment?.Stage?.Line?.Department;
            var line = equipment?.Stage?.Line ?? incident.Line; // Use direct Line if equipment is null
            var departmentName = department?.DepartmentName ?? line?.Department?.DepartmentName ?? "Chưa xác định";

            Console.WriteLine($"   Equipment: {equipment?.EquipmentName} (ID: {equipment?.EquipmentId})");
            Console.WriteLine($"   Stage: {equipment?.Stage?.StageName} (ID: {equipment?.Stage?.StageId})");
            Console.WriteLine($"   Line: {line?.LineName} (ID: {line?.LineId})");
            Console.WriteLine($"   Department: {departmentName}");

            // Get all Technical Managers in the company
            var allTechnicalManagers = await _userService.GetUsersByRoleAsync("Quản lý kỹ thuật", cancellationToken);
            Console.WriteLine($"   Found {allTechnicalManagers.Count()} total Technical Managers in company");

            // ✅ FIXED: Send notification to ALL Technical Managers regardless of their assigned department
            // Quản lý kỹ thuật sẽ nhận thông báo từ TẤT CẢ các sự cố có IsTechSupport = true
            // bất kể phòng ban hoặc dù không gắn với phòng ban nào cả (DepartmentId = null)
            var technicalManagers = allTechnicalManagers.ToList();

            Console.WriteLine($"   ✅ Sending notifications to {technicalManagers.Count} Technical Managers across all departments");

            // Create notification record in database for each Technical Manager in company
            foreach (var manager in technicalManagers)
            {
                if (!string.IsNullOrEmpty(manager.Id))
                {
                    Console.WriteLine($"   📝 Creating notification for manager: {manager.FullName} (ID: {manager.Id}, Dept: {manager.DepartmentId ?? 0})");
                    await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                    {
                        UserId = manager.Id,
                        Title = "Sự cố cần hỗ trợ kỹ thuật",
                        Message = $"Có sự cố mới cần hỗ trợ kỹ thuật tại {(equipment != null ? $"thiết bị {equipment.EquipmentName} ({equipment.EquipmentCode})" : $"dây chuyền {line?.LineName ?? "Chưa xác định"}")} ở {departmentName} - Mã sự cố: {incident.IncidentId}"
                    });

                    // Send realtime notification to each Technical Manager
                    Console.WriteLine($"   🔔 Sending realtime notification to manager: {manager.FullName}");
                    await _notificationService.SendNotificationToUserAsync(
                        manager.Id,
                        "Sự cố cần hỗ trợ kỹ thuật",
                        $"Có sự cố mới cần hỗ trợ kỹ thuật tại {(equipment != null ? $"thiết bị {equipment.EquipmentName} ({equipment.EquipmentCode})" : $"dây chuyền {line?.LineName ?? "Chưa xác định"}")} ở {departmentName} - Mã sự cố: {incident.IncidentId}",
                        "incident"
                    );
                }
            }
            Console.WriteLine($"   ✅ Notifications sent successfully to {technicalManagers.Count} managers");
        }
        catch (Exception ex)
        {
            // Log error but don't fail the incident creation
            Console.WriteLine($"❌ Error sending incident notification: {ex.Message}");
            Console.WriteLine($"   Stack trace: {ex.StackTrace}");
        }
    }

    public async Task<string> UploadIncidentImageAsync(IFormFile imageFile, CancellationToken cancellationToken = default)
    {
        if (imageFile == null || imageFile.Length == 0)
        {
            throw new ArgumentException("File ảnh không hợp lệ");
        }

        return await HandleImageUploadAsync(imageFile, cancellationToken);
    }

    private async Task<string> HandleImageUploadAsync(IFormFile imageFile, CancellationToken cancellationToken = default)
    {
        try
        {
            return await _azureStorageService.UploadFileAsync(imageFile, "incidents", "images", cancellationToken);
        }
        catch (ArgumentException ex)
        {
            throw new InvalidOperationException($"Lỗi upload ảnh: {ex.Message}");
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Có lỗi xảy ra khi upload ảnh: {ex.Message}");
        }
    }
}