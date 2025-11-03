using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using FITSKIP.API.Hubs;
using System.Security.Claims;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IncidentsController : ControllerBase
{
    private readonly IIncidentService _incidentService;
    private readonly IUserRepository _userRepository;
    private readonly IHubContext<NotificationHub> _hubContext;

    public IncidentsController(IIncidentService incidentService, IUserRepository userRepository, IHubContext<NotificationHub> hubContext)
    {
        _incidentService = incidentService;
        _userRepository = userRepository;
        _hubContext = hubContext;
    }

    /// <summary>
    /// Lấy danh sách tất cả sự cố
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetIncidents()
    {
        try
        {
            var incidents = await _incidentService.GetIncidentsAsync();
            return Ok(new { success = true, data = incidents });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Error: Có lỗi xảy ra khi lấy danh sách sự cố", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách sự cố theo department
    /// </summary>
    [HttpGet("by-department/{departmentId}")]
    public async Task<IActionResult> GetIncidentsByDepartment(int departmentId)
    {
        try
        {
            if (departmentId <= 0)
            {
                return BadRequest(new { success = false, message = "Error: Department ID không hợp lệ" });
            }

            var incidents = await _incidentService.GetIncidentsAsync();

            // Filter incidents by department
            var departmentIncidents = incidents
                .Where(i => i.Equipment?.Stage?.Line?.DepartmentId == departmentId)
                .ToList();

            return Ok(departmentIncidents);
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Error: Có lỗi xảy ra khi lấy danh sách sự cố", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy sự cố cần hỗ trợ kỹ thuật (IsTechSupport = true và Status chưa hoàn thành)
    /// </summary>
    [HttpGet("tech-support-pending")]
    public async Task<IActionResult> GetTechSupportPendingIncidents([FromQuery] string? date = null)
    {
        try
        {
            var allIncidents = await _incidentService.GetIncidentsAsync();

            // Filter: IsTechSupport = true AND Status != "Hoàn thành"
            var pendingIncidents = allIncidents.Where(i =>
                i.IsTechSupport &&
                i.Status != "Hoàn thành"
            );

            // If date is provided, filter by date
            if (!string.IsNullOrEmpty(date))
            {
                if (!DateTime.TryParseExact(date, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out var parsedDate))
                {
                    return BadRequest(new { success = false, message = "Invalid date format. Use yyyy-MM-dd." });
                }
                pendingIncidents = pendingIncidents.Where(i =>
                    i.StartTime.HasValue &&
                    i.StartTime.Value.Date == parsedDate.Date
                );
            }

            // Get all users for assignedTo lookup
            var allUsers = await _userRepository.GetUsersWithRolesAsync();
            var userLookup = allUsers.ToDictionary(u => u.Id, u => u.FullName);

            // Group by LineId
            var groupedByLine = pendingIncidents
                .GroupBy(i => i.LineId)
                .Select(g => new
                {
                    lineId = g.Key,
                    incidentCount = g.Count(),
                    totalDuration = g.Sum(i => i.Duration ?? 0),
                    incidents = g.Select(i => new
                    {
                        incidentId = i.IncidentId,
                        equipmentCode = i.Equipment?.EquipmentCode,
                        equipmentName = i.Equipment?.EquipmentName,
                        stage = i.Equipment?.Stage?.StageName,
                        line = i.Line?.LineName,
                        startTime = i.StartTime,
                        duration = i.Duration,
                        status = i.Status,
                        issue = i.Issue,
                        assignedTo = !string.IsNullOrEmpty(i.AssignedTo)
                            ? userLookup.GetValueOrDefault(i.AssignedTo, "Unknown User")
                            : null
                    }).ToList()
                })
                .ToList();

            return Ok(new { success = true, data = groupedByLine });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Error fetching tech support incidents", details = ex.Message });
        }
    }

    [HttpGet("line/{lineId}/date")]
    public async Task<IActionResult> GetIncidentsByLineAndDate(int lineId, [FromQuery] string date)
    {
        try
        {
            // Parse date string to DateTime with DD/MM/YYYY format
            Console.WriteLine($"Đang parse date string: '{date}'");
            var vietnameseCulture = new System.Globalization.CultureInfo("vi-VN");
            if (!DateTime.TryParse(date, vietnameseCulture, System.Globalization.DateTimeStyles.None, out var parsedDate))
            {
                Console.WriteLine($"Không thể parse date: '{date}' với culture vi-VN");
                return BadRequest(new { success = false, message = "Định dạng ngày không hợp lệ. Định dạng mong đợi: DD/MM/YYYY" });
            }

            Console.WriteLine($"Đang lấy incidents cho line {lineId} vào ngày {parsedDate:dd/MM/yyyy}");

            // Get all incidents and filter by LineId and date (safely handle nullable StartTime)
            var allIncidents = await _incidentService.GetIncidentsAsync();
            var filteredIncidents = allIncidents.Where(i =>
                i.LineId == lineId &&
                i.StartTime.HasValue &&  // Ensure StartTime is not null
                i.StartTime.Value.Date == parsedDate.Date  // Access .Date on the non-null value
            ).ToList();

            Console.WriteLine($"Tìm thấy {filteredIncidents.Count} incidents");

            return Ok(new { success = true, data = filteredIncidents, message = "Lấy danh sách incidents theo line và ngày thành công" });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Lỗi khi lấy incidents: {ex.Message}");
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy danh sách incidents theo line và ngày", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách loại dừng
    /// </summary>
    [HttpGet("stop-types")]
    public async Task<IActionResult> GetStopTypes()
    {
        try
        {
            var stopTypes = await _incidentService.GetStopTypesAsync();
            return Ok(new { success = true, data = stopTypes });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Error: Có lỗi xảy ra khi lấy danh sách loại dừng", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách sự cố được giao cho kỹ thuật viên hiện tại
    /// </summary>
    [HttpGet("assigned-to-me")]
    public async Task<IActionResult> GetIncidentsAssignedToMe()
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { success = false, message = "Không thể xác thực người dùng" });
            }

            var incidents = await _incidentService.GetIncidentsAssignedToTechnicianAsync(userId);
            return Ok(new { success = true, data = incidents });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy danh sách sự cố được giao", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy thông tin sự cố theo ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetIncident(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { success = false, message = "ID sự cố phải lớn hơn 0" });
            }

            var incident = await _incidentService.GetIncidentByIdAsync(id);
            if (incident == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy sự cố với ID " + id });
            }
            return Ok(new { success = true, data = incident });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy thông tin sự cố", details = ex.Message });
        }
    }

    /// <summary>
    /// Tạo sự cố mới
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateIncident([FromForm] CreateIncidentRequest request)
    {
        try
        {
            // Validate request object first
            if (request == null)
            {
                return BadRequest(new { success = false, message = "Dữ liệu yêu cầu không được để trống" });
            }

            // Validate ModelState (attributes validation)
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = errors });
            }

            // Additional business validation
            if (request.EquipmentId.HasValue && request.EquipmentId.Value <= 0)
            {
                return BadRequest(new { success = false, message = "ID thiết bị phải là số nguyên dương" });
            }

            // Validate LineId if provided
            if (request.LineId.HasValue && request.LineId.Value <= 0)
            {
                return BadRequest(new { success = false, message = "ID dây chuyền phải là số nguyên dương" });
            }

            // Validate TypeId if provided
            if (request.TypeId.HasValue && request.TypeId.Value <= 0)
            {
                return BadRequest(new { success = false, message = "ID loại dừng phải là số nguyên dương" });
            }

            // Validate Duration if provided
            if (request.Duration.HasValue && request.Duration.Value < 0)
            {
                return BadRequest(new { success = false, message = "Thời lượng không được âm" });
            }

            // Validate ReportedByUserId - optional, can be null if not selected
            // if (string.IsNullOrWhiteSpace(request.ReportedByUserId))
            // {
            //     return BadRequest(new { success = false, message = "ID người báo cáo là bắt buộc" });
            // }

            // Validate time logic
            if (request.EndTime.HasValue && request.StartTime.HasValue && request.EndTime.Value <= request.StartTime.Value)
            {
                return BadRequest(new { success = false, message = "Thời gian kết thúc phải sau thời gian bắt đầu" });
            }

            if (request.EndTime.HasValue && request.EndTime.Value > DateTime.Now)
            {
                return BadRequest(new { success = false, message = "Thời gian kết thúc không thể trong tương lai" });
            }

            if (request.StartTime.HasValue && request.StartTime.Value > DateTime.Now)
            {
                return BadRequest(new { success = false, message = "Thời gian bắt đầu không thể trong tương lai" });
            }

            // Validate Duration against actual time if both start and end times are provided
            if (request.Duration.HasValue && request.EndTime.HasValue && request.StartTime.HasValue)
            {
                var rawActualDuration = CalculateAdjustedDuration(request.StartTime.Value, request.EndTime.Value);
                var actualDuration = Math.Round(rawActualDuration, 2);

                if (request.Duration.Value > actualDuration)
                {
                    return BadRequest(new { success = false, message = $"Thời lượng ({request.Duration.Value:F2} phút) không được lớn hơn thời gian thực tế ({actualDuration:F2} phút)!" });
                }
            }

            // Don't auto-set ReportedByUserId - allow it to be null if not selected
            // If user doesn't select anyone, it should remain null in database

            var incident = await _incidentService.CreateIncidentAsync(request);
            // Note: Realtime notifications are already sent from IncidentService
            // No need to send duplicate DataUpdated events here
            return CreatedAtAction(nameof(GetIncident), new { id = incident.IncidentId },
                new { success = true, data = incident, message = "Tạo sự cố thành công" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi tạo sự cố", details = ex.Message });
        }
    }

    /// <summary>
    /// Tạo nhiều sự cố cùng lúc (Bulk Create)
    /// </summary>
    [HttpPost("bulk")]
    public async Task<IActionResult> CreateBulkIncidents([FromBody] CreateBulkIncidentRequest request)
    {
        try
        {
            // Validate request object first
            if (request == null || request.Incidents == null || request.Incidents.Count == 0)
            {
                return BadRequest(new { success = false, message = "Error: Danh sách sự cố không được rỗng" });
            }

            // Validate ModelState (attributes validation)
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(new { success = false, message = $"Error: Validation failed - {string.Join(", ", errors)}" });
            }

            // Validate each incident
            for (int i = 0; i < request.Incidents.Count; i++)
            {
                var incident = request.Incidents[i];

                // if (incident.EquipmentId <= 0)
                // {
                //     return BadRequest(new { success = false, message = $"Error: Sự cố #{i + 1} - Equipment ID phải lớn hơn 0" });
                // }

                if (incident.LineId.HasValue && incident.LineId.Value <= 0)
                {
                    return BadRequest(new { success = false, message = $"Error: Sự cố #{i + 1} - Line ID phải lớn hơn 0" });
                }

                if (incident.EndTime.HasValue && incident.StartTime.HasValue && incident.EndTime.Value <= incident.StartTime.Value)
                {
                    return BadRequest(new { success = false, message = $"Error: Sự cố #{i + 1} - Thời gian kết thúc phải sau thời gian bắt đầu" });
                }

                if (incident.EndTime.HasValue && incident.EndTime.Value > DateTime.Now)
                {
                    return BadRequest(new { success = false, message = $"Error: Sự cố #{i + 1} - Thời gian kết thúc không thể trong tương lai" });
                }

                // Validate Duration against actual time if both start and end times are provided
                if (incident.Duration.HasValue && incident.EndTime.HasValue && incident.StartTime.HasValue)
                {
                    var rawActualDuration = CalculateAdjustedDuration(incident.StartTime.Value, incident.EndTime.Value);
                    var actualDuration = Math.Round(rawActualDuration, 2);

                    if (incident.Duration.Value > actualDuration)
                    {
                        return BadRequest(new { success = false, message = $"Error: Sự cố #{i + 1} - Thời lượng ({incident.Duration.Value:F2} phút) không được lớn hơn thời gian thực tế ({actualDuration:F2} phút)!" });
                    }
                }
            }

            // Don't auto-set ReportedByUserId - allow it to be null if not selected
            // If user doesn't select anyone, it should remain null in database

            var result = await _incidentService.CreateBulkIncidentsAsync(request);

            if (result.SuccessCount == 0)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Không thể tạo sự cố nào",
                    data = result
                });
            }

            if (result.FailureCount > 0)
            {
                return Ok(new
                {
                    success = true,
                    message = $"Đã tạo thành công {result.SuccessCount}/{result.TotalRequested} sự cố. {result.FailureCount} sự cố thất bại.",
                    data = result
                });
            }

            return Ok(new
            {
                success = true,
                message = $"Đã tạo thành công tất cả {result.SuccessCount} sự cố",
                data = result
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = $"{ex.Message}" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = $"{ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi tạo nhiều sự cố", details = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật thông tin sự cố
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateIncident(int id, [FromBody] UpdateIncidentRequest request)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { success = false, message = "ID sự cố phải là số nguyên dương" });
            }

            // Validate request object first
            if (request == null)
            {
                return BadRequest(new { success = false, message = "Dữ liệu yêu cầu không được để trống" });
            }

            // Validate ModelState (attributes validation)
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = errors });
            }

            // Additional business validation
            if (request.EquipmentId.HasValue && request.EquipmentId.Value <= 0)
            {
                return BadRequest(new { success = false, message = "ID thiết bị phải là số nguyên dương" });
            }

            if (request.LineId.HasValue && request.LineId.Value <= 0)
            {
                return BadRequest(new { success = false, message = "ID dây chuyền phải là số nguyên dương" });
            }

            if (request.TypeId.HasValue && request.TypeId.Value <= 0)
            {
                return BadRequest(new { success = false, message = "ID loại dừng phải là số nguyên dương" });
            }

            if (request.Duration.HasValue && request.Duration.Value < 0)
            {
                return BadRequest(new { success = false, message = "Thời lượng không được âm" });
            }

            if (request.StartTime > DateTime.Now)
            {
                return BadRequest(new { success = false, message = "Thời gian bắt đầu không thể trong tương lai" });
            }

            if (request.EndTime.HasValue && request.EndTime.Value <= request.StartTime)
            {
                return BadRequest(new { success = false, message = "Thời gian kết thúc phải sau thời gian bắt đầu" });
            }

            if (request.EndTime.HasValue && request.EndTime.Value > DateTime.Now)
            {
                return BadRequest(new { success = false, message = "Thời gian kết thúc không thể trong tương lai" });
            }

            // Validate Duration against actual time if both start and end times are provided
            if (request.Duration.HasValue && request.EndTime.HasValue)
            {
                var rawActualDuration = CalculateAdjustedDuration(request.StartTime, request.EndTime.Value);
                var actualDuration = Math.Round(rawActualDuration, 2);

                if (request.Duration.Value > actualDuration)
                {
                    return BadRequest(new { success = false, message = $"Thời lượng ({request.Duration.Value:F2} phút) không được lớn hơn thời gian thực tế ({actualDuration:F2} phút)!" });
                }
            }

            var incident = await _incidentService.UpdateIncidentAsync(id, request);
            if (incident == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy sự cố để cập nhật" });
            }
            // Note: Realtime notifications are already sent from IncidentService if status/IsTechSupport changed
            // No need to send duplicate DataUpdated events here
            return Ok(new { success = true, data = incident, message = "Cập nhật sự cố thành công" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi cập nhật sự cố", details = ex.Message });
        }
    }

    /// <summary>
    /// Xóa sự cố
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIncident(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { success = false, message = "ID sự cố không hợp lệ" });
            }

            var result = await _incidentService.DeleteIncidentAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, message = "Không tìm thấy sự cố" });
            }
            // Note: Real-time updates are handled by frontend filtering based on user's department
            // Removed broadcast to avoid sending notifications to all Technical Managers regardless of department
            // await _hubContext.Clients.Group("TechnicalManagers").SendAsync("DataUpdated", new { type = "incident", action = "deleted", incidentId = id });
            await _hubContext.Clients.Group("TeamLeaders").SendAsync("DataUpdated", new { type = "incident", action = "deleted", incidentId = id });
            return Ok(new { success = true, data = true, message = "Xóa sự cố thành công" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi xóa sự cố", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy thống kê downtime - bao gồm số incident theo stop type và downtime theo shift
    /// </summary>
    [HttpGet("downtime-stats")]
    public async Task<IActionResult> GetDowntimeStats(
        [FromQuery] string period,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null,
        [FromQuery] int? lineId = null)
    {
        try
        {
            // Validate period parameter
            if (string.IsNullOrWhiteSpace(period))
            {
                return BadRequest(new { success = false, message = "Tham số thời gian là bắt buộc (ngày, tuần, tháng)" });
            }

            period = period.ToLower().Trim();
            var validPeriods = new[] { "day", "week", "month" };
            if (!validPeriods.Contains(period))
            {
                return BadRequest(new { success = false, message = $"Thời gian không hợp lệ '{period}'. Phải là một trong các giá trị: ngày, tuần, tháng" });
            }

            // Validate date range if provided
            if (startDate.HasValue && endDate.HasValue)
            {
                if (startDate.Value > endDate.Value)
                {
                    return BadRequest(new { success = false, message = "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc" });
                }

                // Reasonable date range validation (not too far in the past or future)
                var maxPastDays = 365 * 2; // 2 years
                var minDate = DateTime.Now.AddDays(-maxPastDays);
                var maxDate = DateTime.Now.AddDays(1);

                if (startDate.Value < minDate)
                {
                    return BadRequest(new { success = false, message = $"Ngày bắt đầu không thể quá xa trong quá khứ (tối đa {maxPastDays} ngày)" });
                }

                if (endDate.Value > maxDate)
                {
                    return BadRequest(new { success = false, message = "Ngày kết thúc không thể trong tương lai" });
                }
            }

            // Validate lineId if provided
            if (lineId.HasValue && lineId.Value <= 0)
            {
                return BadRequest(new { success = false, message = "ID dây chuyền phải lớn hơn 0" });
            }

            var stats = await _incidentService.GetDowntimeStatsAsync(period, startDate, endDate, lineId);
            return Ok(new { success = true, data = stats });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = $"{ex.Message}" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = $"{ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi lấy thống kê thời gian dừng", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách IncidentShifts theo Incident ID
    /// </summary>
    [HttpGet("{id}/shifts")]
    public async Task<IActionResult> GetIncidentShifts(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { success = false, message = "ID sự cố không hợp lệ" });
            }

            var shifts = await _incidentService.GetIncidentShiftsAsync(id);
            return Ok(new { success = true, data = shifts });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Error: Có lỗi xảy ra khi lấy danh sách ca sự cố", details = ex.Message });
        }
    }

    /// <summary>
    /// Phân công kỹ thuật viên cho sự cố
    /// </summary>
    [HttpPut("{id}/assign-technician")]
    public async Task<IActionResult> AssignTechnician(int id, [FromBody] AssignTechnicianRequest request)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { success = false, message = "ID sự cố không hợp lệ" });
            }

            if (request == null || string.IsNullOrEmpty(request.TechnicianId))
            {
                return BadRequest(new { success = false, message = "ID kỹ thuật viên là bắt buộc" });
            }

            var result = await _incidentService.AssignTechnicianAsync(id, request.TechnicianId, request.UpdateStatus);
            if (!result)
            {
                return NotFound(new { success = false, message = "Không tìm thấy sự cố để phân công" });
            }

            // Note: Real-time updates are handled by frontend filtering based on user's department
            // Removed broadcast to avoid sending notifications to all Technical Managers regardless of department
            // await _hubContext.Clients.Group("TechnicalManagers").SendAsync("DataUpdated", new { type = "incident", action = "assigned", incidentId = id });
            await _hubContext.Clients.Group("TeamLeaders").SendAsync("DataUpdated", new { type = "incident", action = "assigned", incidentId = id });

            return Ok(new { success = true, message = request.UpdateStatus ? "Phân công kỹ thuật viên và cập nhật trạng thái thành công" : "Phân công kỹ thuật viên thành công" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi phân công kỹ thuật viên", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách sự cố theo các line được phân công cho user (dành cho Team Leader)
    /// </summary>
    [HttpGet("user/{userId}/lines")]
    public async Task<IActionResult> GetIncidentsByUserLines(string userId)
    {
        try
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { success = false, message = "User ID là bắt buộc" });
            }

            var incidents = await _incidentService.GetIncidentsByUserLinesAsync(userId);
            return Ok(new { success = true, data = incidents });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Error: Có lỗi xảy ra khi lấy danh sách sự cố theo line của user", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy URL ảnh của sự cố
    /// </summary>
    [HttpGet("{id}/image")]
    public async Task<IActionResult> GetIncidentImage(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(new { success = false, message = "ID sự cố không hợp lệ" });
            }

            var incident = await _incidentService.GetIncidentByIdAsync(id);
            if (incident == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy sự cố" });
            }

            if (incident.IncidentImages == null || !incident.IncidentImages.Any())
            {
                return NotFound(new { success = false, message = "Sự cố này không có ảnh" });
            }

            // Return all images from IncidentImages table
            var imageUrls = incident.IncidentImages.OrderBy(i => i.OrderIndex).Select(i => i.ImageUrl).ToList();
            return Ok(new { success = true, data = new { imageUrls } });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Error: Có lỗi xảy ra khi lấy ảnh sự cố", details = ex.Message });
        }
    }

    /// <summary>
    /// Upload ảnh cho sự cố
    /// </summary>
    [HttpPost("upload-image")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage(IFormFile imageFile)
    {
        try
        {
            if (imageFile == null || imageFile.Length == 0)
            {
                return BadRequest(new { success = false, message = "Vui lòng chọn file ảnh" });
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp" };
            var extension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { success = false, message = "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, bmp)" });
            }

            // Validate file size (max 5MB)
            if (imageFile.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { success = false, message = "Kích thước file không được vượt quá 5MB" });
            }

            var imageUrl = await _incidentService.UploadIncidentImageAsync(imageFile);
            return Ok(new { success = true, data = new { imageUrl } });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Error: Có lỗi xảy ra khi upload ảnh", details = ex.Message });
        }
    }

    /// <summary>
    /// Kiểm tra trạng thái yêu cầu linh kiện của sự cố
    /// </summary>
    [HttpGet("{incidentId}/spare-parts-status")]
    public async Task<IActionResult> GetIncidentSparePartsStatus(int incidentId)
    {
        try
        {
            var incident = await _incidentService.GetIncidentByIdAsync(incidentId);
            if (incident == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy sự cố" });
            }

            var sparePartsStatus = await _incidentService.GetSparePartsStatusAsync(incidentId);

            return Ok(new
            {
                success = true,
                data = new
                {
                    hasPendingRequests = sparePartsStatus.HasPendingRequests,
                    hasReturnRequests = sparePartsStatus.HasReturnRequests,
                    incidentId = incidentId
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Error: Có lỗi xảy ra khi kiểm tra trạng thái linh kiện", details = ex.Message });
        }
    }

    /// <summary>
    /// Kiểm tra xem sự cố có yêu cầu linh kiện không
    /// </summary>
    [HttpGet("{incidentId}/has-spare-parts")]
    public async Task<IActionResult> CheckIncidentHasSpareParts(int incidentId)
    {
        try
        {
            var incident = await _incidentService.GetIncidentByIdAsync(incidentId);
            if (incident == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy sự cố" });
            }

            // Call the service method directly with incidentId - this will check ReplacementHistories table for this specific incident
            var hasSpareParts = await _incidentService.HasSparePartsRequiredAsync(incidentId);

            return Ok(new
            {
                success = true,
                data = new
                {
                    hasSpareParts = hasSpareParts,
                    incidentId = incidentId
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Error: Có lỗi xảy ra khi kiểm tra linh kiện", details = ex.Message });
        }
    }

    private decimal CalculateAdjustedDuration(DateTime startTime, DateTime endTime)
    {
        var rawDuration = (decimal)(endTime - startTime).TotalMinutes;
        var adjustedDuration = rawDuration;

        // Break times: 11:00-11:30 and 18:00-18:30
        var break1Start = startTime.Date.AddHours(11);
        var break1End = startTime.Date.AddHours(11).AddMinutes(30);
        var break2Start = startTime.Date.AddHours(18);
        var break2End = startTime.Date.AddHours(18).AddMinutes(30);

        // Calculate overlap with break 1 (11:00-11:30)
        var break1OverlapStart = startTime > break1Start ? startTime : break1Start;
        var break1OverlapEnd = endTime < break1End ? endTime : break1End;
        if (break1OverlapStart < break1OverlapEnd)
        {
            var break1Overlap = (decimal)(break1OverlapEnd - break1OverlapStart).TotalMinutes;
            adjustedDuration -= break1Overlap;
        }

        // Calculate overlap with break 2 (18:00-18:30)
        var break2OverlapStart = startTime > break2Start ? startTime : break2Start;
        var break2OverlapEnd = endTime < break2End ? endTime : break2End;
        if (break2OverlapStart < break2OverlapEnd)
        {
            var break2Overlap = (decimal)(break2OverlapEnd - break2OverlapStart).TotalMinutes;
            adjustedDuration -= break2Overlap;
        }

        // Ensure duration is not negative
        return Math.Max(0, adjustedDuration);
    }
}