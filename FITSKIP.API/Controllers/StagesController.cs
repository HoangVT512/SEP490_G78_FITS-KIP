using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StagesController : ControllerBase
{
    private readonly IStageService _stageService;

    public StagesController(IStageService stageService)
    {
        _stageService = stageService;
    }

    /// <summary>
    /// Lấy danh sách tất cả giai đoạn
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetStages()
    {
        try
        {
            var stages = await _stageService.GetStagesAsync();
            return Ok(new { success = true, data = stages });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi lấy danh sách giai đoạn", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy thông tin giai đoạn theo ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetStage(int id)
    {
        try
        {
            var stage = await _stageService.GetStageByIdAsync(id);
            if (stage == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy giai đoạn" });
            }
            return Ok(new { success = true, data = stage });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi lấy thông tin giai đoạn", details = ex.Message });
        }
    }

    /// <summary>
    /// Tạo giai đoạn mới
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Quản trị viên,Quản lý")]
    public async Task<IActionResult> CreateStage([FromBody] CreateStageRequest request)
    {
        try
        {
            var stage = await _stageService.CreateStageAsync(request);
            return CreatedAtAction(nameof(GetStage), new { id = stage.StageId }, new { success = true, data = stage, message = "Tạo giai đoạn thành công" });
        }
        catch (InvalidOperationException ex)
        {
            // Trả về thông báo lỗi cụ thể từ service layer
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi tạo giai đoạn", details = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật thông tin giai đoạn
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Quản trị viên,Quản lý")]
    public async Task<IActionResult> UpdateStage(int id, [FromBody] UpdateStageRequest request)
    {
        try
        {
            var stage = await _stageService.UpdateStageAsync(id, request);
            if (stage == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy giai đoạn" });
            }
            return Ok(new { success = true, data = stage, message = "Cập nhật giai đoạn thành công" });
        }
        catch (InvalidOperationException ex)
        {
            // Trả về thông báo lỗi cụ thể từ service layer
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi cập nhật giai đoạn", details = ex.Message });
        }
    }

    /// <summary>
    /// Khóa/Mở khóa giai đoạn
    /// </summary>
    [HttpPatch("{id}/toggle-status")]
    [Authorize(Roles = "Quản trị viên,Quản lý")]
    public async Task<IActionResult> ToggleStageStatus(int id)
    {
        try
        {
            var stage = await _stageService.ToggleStageStatusAsync(id);
            if (stage == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy giai đoạn" });
            }
            var action = stage.IsActive ? "mở khóa" : "khóa";
            return Ok(new { success = true, data = stage, message = $"Đã {action} giai đoạn thành công" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi thay đổi trạng thái giai đoạn", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách giai đoạn theo dây chuyền
    /// </summary>
    [HttpGet("line/{lineId}")]
    public async Task<IActionResult> GetStagesByLine(int lineId)
    {
        try
        {
            var stages = await _stageService.GetStagesByLineAsync(lineId);
            return Ok(new { success = true, data = stages });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi lấy danh sách giai đoạn theo dây chuyền", details = ex.Message });
        }
    }
}