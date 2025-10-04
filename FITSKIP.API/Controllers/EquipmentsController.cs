using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EquipmentsController : ControllerBase
{
    private readonly IEquipmentService _equipmentService;

    public EquipmentsController(IEquipmentService equipmentService)
    {
        _equipmentService = equipmentService;
    }

    /// <summary>
    /// Lấy danh sách tất cả thiết bị
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetEquipments()
    {
        try
        {
            var equipments = await _equipmentService.GetEquipmentsAsync();
            return Ok(new { success = true, data = equipments });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi lấy danh sách thiết bị", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy thông tin thiết bị theo ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEquipment(int id)
    {
        try
        {
            var equipment = await _equipmentService.GetEquipmentByIdAsync(id);
            if (equipment == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy thiết bị" });
            }
            return Ok(new { success = true, data = equipment });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi lấy thông tin thiết bị", details = ex.Message });
        }
    }

    /// <summary>
    /// Tạo thiết bị mới
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateEquipment([FromBody] CreateEquipmentRequest request)
    {
        try
        {
            var equipment = await _equipmentService.CreateEquipmentAsync(request);
            return CreatedAtAction(nameof(GetEquipment), new { id = equipment.EquipmentId }, new { success = true, data = equipment, message = "Tạo thiết bị thành công" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi tạo thiết bị", details = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật thông tin thiết bị
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateEquipment(int id, [FromBody] UpdateEquipmentRequest request)
    {
        try
        {
            var equipment = await _equipmentService.UpdateEquipmentAsync(id, request);
            if (equipment == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy thiết bị" });
            }
            return Ok(new { success = true, data = equipment, message = "Cập nhật thiết bị thành công" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi cập nhật thiết bị", details = ex.Message });
        }
    }

    /// <summary>
    /// Xóa thiết bị
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEquipment(int id)
    {
        try
        {
            var result = await _equipmentService.DeleteEquipmentAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, message = "Không tìm thấy thiết bị" });
            }
            return Ok(new { success = true, message = "Xóa thiết bị thành công" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi xóa thiết bị", details = ex.Message });
        }
    }

    /// <summary>
    /// Chuyển đổi trạng thái kích hoạt của thiết bị
    /// </summary>
    [HttpPatch("{id}/toggle-status")]
    public async Task<IActionResult> ToggleEquipmentStatus(int id)
    {
        try
        {
            var equipment = await _equipmentService.ToggleEquipmentStatusAsync(id);
            if (equipment == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy thiết bị" });
            }
            return Ok(new { success = true, data = equipment, message = "Cập nhật trạng thái thiết bị thành công" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi cập nhật trạng thái thiết bị", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách thiết bị theo công đoạn
    /// </summary>
    [HttpGet("by-stage/{stageId}")]
    public async Task<IActionResult> GetEquipmentsByStage(int stageId)
    {
        try
        {
            var equipments = await _equipmentService.GetEquipmentsByStageAsync(stageId);
            return Ok(new { success = true, data = equipments });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi lấy danh sách thiết bị theo công đoạn", details = ex.Message });
        }
    }

    /// <summary>
    /// Tạo mã QR cho thiết bị
    /// </summary>
    [HttpPost("{id}/generate-qr")]
    public async Task<IActionResult> GenerateQRCode(int id)
    {
        try
        {
            var equipment = await _equipmentService.GenerateQRCodeAsync(id);
            if (equipment == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy thiết bị" });
            }
            return Ok(new { success = true, data = equipment, message = "Tạo mã QR thành công" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi tạo mã QR", details = ex.Message });
        }
    }
}
