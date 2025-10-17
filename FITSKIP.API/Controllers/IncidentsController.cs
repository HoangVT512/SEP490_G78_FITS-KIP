using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class IncidentsController : ControllerBase
{
    private readonly IIncidentService _incidentService;

    public IncidentsController(IIncidentService incidentService)
    {
        _incidentService = incidentService;
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
                return BadRequest(new { success = false, message = "Error: ID sự cố không hợp lệ" });
            }

            var incident = await _incidentService.GetIncidentByIdAsync(id);
            if (incident == null)
            {
                return NotFound(new { success = false, message = "Error: Không tìm thấy sự cố" });
            }
            return Ok(new { success = true, data = incident });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Error: Có lỗi xảy ra khi lấy thông tin sự cố", details = ex.Message });
        }
    }

    /// <summary>
    /// Tạo sự cố mới
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateIncident([FromBody] CreateIncidentRequest request)
    {
        try
        {
            // Validate request object first
            if (request == null)
            {
                return BadRequest(new { success = false, message = "Error: Request body is required" });
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

            // Additional business validation
            if (request.EquipmentId <= 0)
            {
                return BadRequest(new { success = false, message = "Error: Equipment ID phải lớn hơn 0" });
            }

            if (request.TypeId <= 0)
            {
                return BadRequest(new { success = false, message = "Error: Stop Type ID phải lớn hơn 0" });
            }

            if (request.StartTime > DateTime.Now)
            {
                return BadRequest(new { success = false, message = "Error: Thời gian bắt đầu không thể trong tương lai" });
            }

            if (request.EndTime.HasValue && request.EndTime.Value <= request.StartTime)
            {
                return BadRequest(new { success = false, message = "Error: Thời gian kết thúc phải sau thời gian bắt đầu" });
            }

            if (request.EndTime.HasValue && request.EndTime.Value > DateTime.Now)
            {
                return BadRequest(new { success = false, message = "Error: Thời gian kết thúc không thể trong tương lai" });
            }

            var incident = await _incidentService.CreateIncidentAsync(request);
            return CreatedAtAction(nameof(GetIncident), new { id = incident.IncidentId },
                new { success = true, data = incident, message = "Tạo sự cố thành công" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = $"Error: {ex.Message}" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = $"Error: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error: Có lỗi xảy ra khi tạo sự cố", details = ex.Message });
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
                return BadRequest(new { success = false, message = "Error: ID sự cố phải lớn hơn 0" });
            }

            // Validate request object first
            if (request == null)
            {
                return BadRequest(new { success = false, message = "Error: Request body is required" });
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

            // Additional business validation
            if (request.EquipmentId <= 0)
            {
                return BadRequest(new { success = false, message = "Error: Equipment ID phải lớn hơn 0" });
            }

            if (request.TypeId <= 0)
            {
                return BadRequest(new { success = false, message = "Error: Stop Type ID phải lớn hơn 0" });
            }

            if (request.StartTime > DateTime.Now)
            {
                return BadRequest(new { success = false, message = "Error: Thời gian bắt đầu không thể trong tương lai" });
            }

            if (request.EndTime.HasValue && request.EndTime.Value <= request.StartTime)
            {
                return BadRequest(new { success = false, message = "Error: Thời gian kết thúc phải sau thời gian bắt đầu" });
            }

            if (request.EndTime.HasValue && request.EndTime.Value > DateTime.Now)
            {
                return BadRequest(new { success = false, message = "Error: Thời gian kết thúc không thể trong tương lai" });
            }

            var incident = await _incidentService.UpdateIncidentAsync(id, request);
            if (incident == null)
            {
                return NotFound(new { success = false, message = "Error: Không tìm thấy sự cố để cập nhật" });
            }
            return Ok(new { success = true, data = incident, message = "Cập nhật sự cố thành công" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = $"Error: {ex.Message}" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = $"Error: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error: Có lỗi xảy ra khi cập nhật sự cố", details = ex.Message });
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
                return BadRequest(new { success = false, message = "Error: ID sự cố không hợp lệ" });
            }

            var result = await _incidentService.DeleteIncidentAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, message = "Error: Không tìm thấy sự cố" });
            }
            return Ok(new { success = true, data = true, message = "Xóa sự cố thành công" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error: Có lỗi xảy ra khi xóa sự cố", details = ex.Message });
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
                return BadRequest(new { success = false, message = "Error: Period parameter is required (day, week, month)" });
            }

            period = period.ToLower().Trim();
            var validPeriods = new[] { "day", "week", "month" };
            if (!validPeriods.Contains(period))
            {
                return BadRequest(new { success = false, message = $"Error: Invalid period '{period}'. Must be one of: day, week, month" });
            }

            // Validate date range if provided
            if (startDate.HasValue && endDate.HasValue)
            {
                if (startDate.Value > endDate.Value)
                {
                    return BadRequest(new { success = false, message = "Error: Start date phải trước hoặc bằng end date" });
                }

                // Reasonable date range validation (not too far in the past or future)
                var maxPastDays = 365 * 2; // 2 years
                var minDate = DateTime.Now.AddDays(-maxPastDays);
                var maxDate = DateTime.Now.AddDays(1);

                if (startDate.Value < minDate)
                {
                    return BadRequest(new { success = false, message = $"Error: Start date không thể quá xa trong quá khứ (tối đa {maxPastDays} ngày)" });
                }

                if (endDate.Value > maxDate)
                {
                    return BadRequest(new { success = false, message = "Error: End date không thể trong tương lai" });
                }
            }

            // Validate lineId if provided
            if (lineId.HasValue && lineId.Value <= 0)
            {
                return BadRequest(new { success = false, message = "Error: Line ID phải lớn hơn 0" });
            }

            var stats = await _incidentService.GetDowntimeStatsAsync(period, startDate, endDate, lineId);
            return Ok(new { success = true, data = stats });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = $"Error: {ex.Message}" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = $"Error: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error: Có lỗi xảy ra khi lấy thống kê downtime", details = ex.Message });
        }
    }
}