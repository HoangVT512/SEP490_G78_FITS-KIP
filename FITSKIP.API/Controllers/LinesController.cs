using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LinesController : ControllerBase
{
    private readonly ILineService _lineService;

    public LinesController(ILineService lineService)
    {
        _lineService = lineService;
    }

    /// <summary>
    /// Lấy danh sách tất cả chuyền sản xuất
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetLines()
    {
        try
        {
            var lines = await _lineService.GetLinesAsync();
            return Ok(new { success = true, data = lines });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy danh sách chuyền sản xuất", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách chuyền sản xuất đang hoạt động
    /// </summary>
    [HttpGet("active")]
    public async Task<IActionResult> GetActiveLines()
    {
        try
        {
            var lines = await _lineService.GetActiveLinesAsync();
            return Ok(new { success = true, data = lines });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy danh sách chuyền sản xuất", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy thông tin chuyền sản xuất theo ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetLine(int id)
    {
        try
        {
            var line = await _lineService.GetLineByIdAsync(id);
            if (line == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy chuyền sản xuất" });
            }
            return Ok(new { success = true, data = line });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy thông tin chuyền sản xuất", details = ex.Message });
        }
    }

    /// <summary>
    /// Tạo chuyền sản xuất mới
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Quản trị viên,Quản lý")]
    public async Task<IActionResult> CreateLine([FromBody] CreateLineRequest request)
    {
        try
        {
            Console.WriteLine($"Creating line: {request.LineName}, DepartmentId: {request.DepartmentId}");
            var line = await _lineService.CreateLineAsync(request);
            return CreatedAtAction(nameof(GetLine), new { id = line.LineId }, new { success = true, data = line, message = "Tạo chuyền sản xuất thành công" });
        }
        catch (InvalidOperationException ex)
        {
            // Trả về thông báo lỗi cụ thể từ service layer
            Console.WriteLine($"Business logic error: {ex.Message}");
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating line: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi tạo chuyền sản xuất", details = ex.Message });
        }
    }

    /// <summary>
    /// Cập nhật thông tin chuyền sản xuất
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Quản trị viên,Quản lý")]
    public async Task<IActionResult> UpdateLine(int id, [FromBody] UpdateLineRequest request)
    {
        try
        {
            var line = await _lineService.UpdateLineAsync(id, request);
            if (line == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy chuyền sản xuất" });
            }
            return Ok(new { success = true, data = line, message = "Cập nhật chuyền sản xuất thành công" });
        }
        catch (InvalidOperationException ex)
        {
            // Trả về thông báo lỗi cụ thể từ service layer
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi cập nhật chuyền sản xuất", details = ex.Message });
        }
    }

    /// <summary>
    /// Thay đổi trạng thái hoạt động của chuyền sản xuất
    /// </summary>
    [HttpPatch("{id}/toggle-status")]
    [Authorize(Roles = "Quản trị viên,Quản lý")]
    public async Task<IActionResult> ToggleLineStatus(int id)
    {
        try
        {
            var line = await _lineService.ToggleLineStatusAsync(id);
            if (line == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy chuyền sản xuất" });
            }
            return Ok(new { success = true, data = line, message = $"Chuyền sản xuất đã được {(line.IsActive ? "kích hoạt" : "vô hiệu hóa")}" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi thay đổi trạng thái chuyền sản xuất", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách chuyền sản xuất mà user được phân công
    /// </summary>
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetLinesByUser(string userId)
    {
        try
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(new { success = false, message = "ID người dùng không hợp lệ" });
            }

            var lines = await _lineService.GetLinesByUserAsync(userId);
            return Ok(new { success = true, data = lines, message = $"Lấy danh sách {lines.Count} chuyền sản xuất của user thành công" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Có lỗi xảy ra khi lấy danh sách chuyền sản xuất của user", details = ex.Message });
        }
    }

    /// <summary>
    /// Lấy danh sách tất cả chuyền sản xuất (không cần authentication)
    /// </summary>
    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetAllLinesPublic()
    {
        try
        {
            var lines = await _lineService.GetLinesAsync();
            return Ok(new { success = true, data = lines });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = "Có lỗi xảy ra khi lấy danh sách chuyền sản xuất", details = ex.Message });
        }
    }
}