using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(IDashboardService dashboardService, ILogger<DashboardController> logger)
    {
        _dashboardService = dashboardService;
        _logger = logger;
    }



    [HttpGet("downtime-stats")]
    public async Task<IActionResult> GetDowntimeStats(int month, int year, int? lineId = null)
    {
        if (month < 1 || month > 12 || year < 1900 || year > DateTime.Now.Year + 10)
        {
            return BadRequest(new { success = false, message = "Tháng hoặc năm không hợp lệ." });
        }

        _logger.LogInformation($"Gọi API: GetDowntimeStats cho tháng={month}, năm={year}, lineId={lineId}");

        try
        {
            var data = await _dashboardService.GetDowntimeStatsAsync(month, year, lineId);
            return Ok(new { success = true, data = data });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi trong GetDowntimeStats");
            return StatusCode(500, new { success = false, message = "Lỗi máy chủ nội bộ", error = ex.Message });
        }
    }

    // Cập nhật endpoint mới
    [HttpGet("daily-downtime-stats")]
    public async Task<IActionResult> GetDailyDowntimeStats(int month, int year, int? lineId = null, string? date = null)
    {
        if (month < 1 || month > 12 || year < 1900 || year > DateTime.Now.Year + 10)
        {
            return BadRequest(new { success = false, message = "Tháng hoặc năm không hợp lệ." });
        }

        if (!string.IsNullOrEmpty(date) && !DateTime.TryParseExact(date, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out _))
        {
            return BadRequest(new { success = false, message = "Định dạng ngày không hợp lệ. Sử dụng dd/MM/yyyy." });
        }

        _logger.LogInformation($"Gọi API: GetDailyDowntimeStats cho tháng={month}, năm={year}, lineId={lineId}, ngày={date}");

        try
        {
            var data = await _dashboardService.GetDailyDowntimeStatsAsync(month, year, lineId, date);
            return Ok(new { success = true, data = data });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi trong GetDailyDowntimeStats");
            return StatusCode(500, new { success = false, message = "Lỗi máy chủ nội bộ", error = ex.Message });
        }
    }

    // New endpoint for detailed OEE stats per day per line
    [HttpGet("detailed-oee-daily-stats")]
    public async Task<IActionResult> GetDetailedOEEDailyStats(int lineId, string date)
    {
        if (lineId <= 0)
        {
            return BadRequest(new { success = false, message = "LineId không hợp lệ." });
        }

        if (!DateTime.TryParseExact(date, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out var parsedDate))
        {
            return BadRequest(new { success = false, message = "Định dạng ngày không hợp lệ. Sử dụng yyyy-MM-dd." });
        }

        _logger.LogInformation($"Gọi API: GetDetailedOEEDailyStats cho lineId={lineId}, ngày={date}");

        try
        {
            var result = await _dashboardService.GetDetailedOEEDailyStatsAsync(lineId, parsedDate);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi trong GetDetailedOEEDailyStats");
            return StatusCode(500, new { success = false, message = "Lỗi máy chủ nội bộ", error = ex.Message });
        }
    }

    // New endpoint for detailed OEE stats per slot per line
    [HttpGet("detailed-oee-slot-stats")]
    public async Task<IActionResult> GetDetailedOEESlotStats(int lineId, string date, int shiftId, string slotTime)
    {
        if (lineId <= 0)
        {
            return BadRequest(new { success = false, message = "LineId không hợp lệ." });
        }

        if (!DateTime.TryParseExact(date, "yyyy-MM-dd", null, System.Globalization.DateTimeStyles.None, out var parsedDate))
        {
            return BadRequest(new { success = false, message = "Định dạng ngày không hợp lệ. Sử dụng yyyy-MM-dd." });
        }

        if (shiftId <= 0)
        {
            return BadRequest(new { success = false, message = "ShiftId không hợp lệ." });
        }

        if (string.IsNullOrEmpty(slotTime))
        {
            return BadRequest(new { success = false, message = "SlotTime không hợp lệ." });
        }

        _logger.LogInformation($"Gọi API: GetDetailedOEESlotStats cho lineId={lineId}, ngày={date}, shiftId={shiftId}, slotTime={slotTime}");

        try
        {
            var result = await _dashboardService.GetDetailedOEESlotStatsAsync(lineId, parsedDate, shiftId, slotTime);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi trong GetDetailedOEESlotStats");
            return StatusCode(500, new { success = false, message = "Lỗi máy chủ nội bộ", error = ex.Message });
        }
    }
}