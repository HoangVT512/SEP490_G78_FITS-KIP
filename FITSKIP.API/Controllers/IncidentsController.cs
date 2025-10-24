using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
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
    private readonly IHubContext<NotificationHub> _hubContext;

    public IncidentsController(IIncidentService incidentService, IHubContext<NotificationHub> hubContext)
    {
        _incidentService = incidentService;
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

            // Validate ReportedByUserId
            if (string.IsNullOrWhiteSpace(request.ReportedByUserId))
            {
                return BadRequest(new { success = false, message = "ID người báo cáo là bắt buộc" });
            }

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

            // Set ReportedByUserId from authenticated user if available
            var userId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                request.ReportedByUserId = userId;
            }

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
            }

            // Set ReportedByUserId from authenticated user if not provided
            var userId = User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                foreach (var incident in request.Incidents)
                {
                    if (string.IsNullOrEmpty(incident.ReportedByUserId))
                    {
                        incident.ReportedByUserId = userId;
                    }
                }
            }

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
    public async Task<IActionResult> UpdateIncident(int id, [FromForm] UpdateIncidentRequest request)
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

            if (string.IsNullOrWhiteSpace(request.ReportedByUserId))
            {
                return BadRequest(new { success = false, message = "ID người báo cáo là bắt buộc" });
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

            if (string.IsNullOrEmpty(incident.ImageUrl))
            {
                return NotFound(new { success = false, message = "Sự cố này không có ảnh" });
            }

            return Ok(new { success = true, data = new { imageUrl = incident.ImageUrl } });
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
}