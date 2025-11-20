using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EquipmentsController : ControllerBase
{
    private readonly IEquipmentService _equipmentService;
    private readonly ILogger<EquipmentsController> _logger;

    public EquipmentsController(IEquipmentService equipmentService, ILogger<EquipmentsController> logger)
    {
        _equipmentService = equipmentService;
        _logger = logger;
    }

    /// <summary>
    /// Lấy danh sách tất cả thiết bị
    /// </summary>
    /// <returns>Danh sách thiết bị</returns>
    /// <response code="200">Trả về danh sách thiết bị thành công</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<EquipmentDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetEquipments()
    {
        try
        {
            var equipments = await _equipmentService.GetEquipmentsAsync();
            return Ok(ApiResponse<IReadOnlyList<EquipmentDTO>>.SuccessResponse(
                equipments,
                $"Lấy danh sách {equipments.Count} thiết bị thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách thiết bị");
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi lấy danh sách thiết bị",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Lấy thông tin thiết bị theo ID
    /// </summary>
    /// <param name="id">ID của thiết bị</param>
    /// <returns>Thông tin thiết bị</returns>
    /// <response code="200">Trả về thông tin thiết bị thành công</response>
    /// <response code="404">Không tìm thấy thiết bị</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<EquipmentDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetEquipment(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID thiết bị không hợp lệ",
                    new List<string> { "ID phải lớn hơn 0" }
                ));
            }

            var equipment = await _equipmentService.GetEquipmentByIdAsync(id);
            if (equipment == null)
            {
                return NotFound(ApiResponse.ErrorResponse($"Không tìm thấy thiết bị với ID: {id}"));
            }

            return Ok(ApiResponse<EquipmentDTO>.SuccessResponse(
                equipment,
                "Lấy thông tin thiết bị thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin thiết bị với ID: {EquipmentId}", id);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi lấy thông tin thiết bị",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Tạo thiết bị mới
    /// </summary>
    /// <param name="request">Thông tin thiết bị cần tạo</param>
    /// <returns>Thiết bị vừa được tạo</returns>
    /// <response code="201">Tạo thiết bị thành công</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<EquipmentDTO>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreateEquipment([FromBody] CreateEquipmentRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse.ErrorResponse(
                    "Dữ liệu đầu vào không hợp lệ",
                    errors
                ));
            }

            var equipment = await _equipmentService.CreateEquipmentAsync(request);

            return CreatedAtAction(
                nameof(GetEquipment),
                new { id = equipment.EquipmentId },
                ApiResponse<EquipmentDTO>.SuccessResponse(
                    equipment,
                    $"Tạo thiết bị '{equipment.EquipmentName}' thành công"
                )
            );
        }
        catch (EquipmentValidationException ex)
        {
            _logger.LogWarning(ex, "Lỗi validation khi tạo thiết bị");
            return BadRequest(new {
                success = false,
                message = ex.Message,
                errorCode = ex.ErrorCode,
                errorData = ex.ErrorData
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Lỗi business logic khi tạo thiết bị");
            return BadRequest(ApiResponse.ErrorResponse(
                ex.Message,
                new List<string> { ex.Message }
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo thiết bị");
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi tạo thiết bị",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Cập nhật thông tin thiết bị
    /// </summary>
    /// <param name="id">ID của thiết bị cần cập nhật</param>
    /// <param name="request">Thông tin cập nhật</param>
    /// <returns>Thiết bị sau khi cập nhật</returns>
    /// <response code="200">Cập nhật thiết bị thành công</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ</response>
    /// <response code="404">Không tìm thấy thiết bị</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<EquipmentDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateEquipment(int id, [FromBody] UpdateEquipmentRequest request)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID thiết bị không hợp lệ",
                    new List<string> { "ID phải lớn hơn 0" }
                ));
            }

            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse.ErrorResponse(
                    "Dữ liệu đầu vào không hợp lệ",
                    errors
                ));
            }

            var equipment = await _equipmentService.UpdateEquipmentAsync(id, request);
            if (equipment == null)
            {
                return NotFound(ApiResponse.ErrorResponse($"Không tìm thấy thiết bị với ID: {id}"));
            }

            return Ok(ApiResponse<EquipmentDTO>.SuccessResponse(
                equipment,
                $"Cập nhật thiết bị '{equipment.EquipmentName}' thành công"
            ));
        }
        catch (EquipmentValidationException ex)
        {
            _logger.LogWarning(ex, "Lỗi validation khi cập nhật thiết bị với ID: {EquipmentId}", id);
            return BadRequest(new {
                success = false,
                message = ex.Message,
                errorCode = ex.ErrorCode,
                errorData = ex.ErrorData
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Lỗi business logic khi cập nhật thiết bị với ID: {EquipmentId}", id);
            return BadRequest(ApiResponse.ErrorResponse(
                ex.Message,
                new List<string> { ex.Message }
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật thiết bị với ID: {EquipmentId}", id);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi cập nhật thiết bị",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Xóa thiết bị
    /// </summary>
    /// <param name="id">ID của thiết bị cần xóa</param>
    /// <returns>Kết quả xóa</returns>
    /// <response code="200">Xóa thiết bị thành công</response>
    /// <response code="400">ID không hợp lệ</response>
    /// <response code="404">Không tìm thấy thiết bị</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteEquipment(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID thiết bị không hợp lệ",
                    new List<string> { "ID phải lớn hơn 0" }
                ));
            }

            var result = await _equipmentService.DeleteEquipmentAsync(id);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse($"Không tìm thấy thiết bị với ID: {id}"));
            }

            return Ok(ApiResponse.SuccessResponse("Xóa thiết bị thành công"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa thiết bị với ID: {EquipmentId}", id);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi xóa thiết bị",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Chuyển đổi trạng thái kích hoạt của thiết bị
    /// </summary>
    /// <param name="id">ID của thiết bị</param>
    /// <returns>Thiết bị sau khi cập nhật trạng thái</returns>
    /// <response code="200">Cập nhật trạng thái thành công</response>
    /// <response code="400">ID không hợp lệ</response>
    /// <response code="404">Không tìm thấy thiết bị</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpPatch("{id}/toggle-status")]
    [ProducesResponseType(typeof(ApiResponse<EquipmentDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ToggleEquipmentStatus(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID thiết bị không hợp lệ",
                    new List<string> { "ID phải lớn hơn 0" }
                ));
            }

            var equipment = await _equipmentService.ToggleEquipmentStatusAsync(id);
            if (equipment == null)
            {
                return NotFound(ApiResponse.ErrorResponse($"Không tìm thấy thiết bị với ID: {id}"));
            }

            var statusText = equipment.IsActive ? "kích hoạt" : "vô hiệu hóa";
            return Ok(ApiResponse<EquipmentDTO>.SuccessResponse(
                equipment,
                $"Đã {statusText} thiết bị '{equipment.EquipmentName}' thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật trạng thái thiết bị với ID: {EquipmentId}", id);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi cập nhật trạng thái thiết bị",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Lấy danh sách thiết bị theo công đoạn
    /// </summary>
    /// <param name="stageId">ID của công đoạn</param>
    /// <returns>Danh sách thiết bị thuộc công đoạn</returns>
    /// <response code="200">Trả về danh sách thiết bị thành công</response>
    /// <response code="400">ID công đoạn không hợp lệ</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpGet("by-stage/{stageId}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<EquipmentDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetEquipmentsByStage(int stageId)
    {
        try
        {
            if (stageId <= 0)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID công đoạn không hợp lệ",
                    new List<string> { "ID phải lớn hơn 0" }
                ));
            }

            var equipments = await _equipmentService.GetEquipmentsByStageAsync(stageId);
            return Ok(ApiResponse<IReadOnlyList<EquipmentDTO>>.SuccessResponse(
                equipments,
                $"Lấy danh sách {equipments.Count} thiết bị của công đoạn thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách thiết bị theo công đoạn với ID: {StageId}", stageId);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi lấy danh sách thiết bị theo công đoạn",
                new List<string> { ex.Message }
            ));
        }
    }


    /// <summary>
    /// Tạo mã QR cho thiết bị
    /// </summary>
    /// <param name="id">ID của thiết bị</param>
    /// <returns>Mã QR của thiết bị</returns>
    /// <response code="200">Tạo mã QR thành công</response>
    /// <response code="404">Không tìm thấy thiết bị</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpGet("{id}/generate-qr")]
    [ProducesResponseType(typeof(ApiResponse<string>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GenerateQRCode(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID thiết bị không hợp lệ",
                    new List<string> { "ID phải lớn hơn 0" }
                ));
            }

            var qrCode = await _equipmentService.GenerateQRCodeAsync(id);
            if (qrCode == null)
            {
                return NotFound(ApiResponse.ErrorResponse($"Không tìm thấy thiết bị với ID: {id}"));
            }

            return Ok(ApiResponse<string>.SuccessResponse(
                qrCode,
                "Tạo mã QR thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo mã QR cho thiết bị với ID: {EquipmentId}", id);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi tạo mã QR",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Lấy danh sách thiết bị mà tổ trưởng quản lý
    /// </summary>
    /// <returns>Danh sách thiết bị của tổ trưởng</returns>
    /// <response code="200">Trả về danh sách thiết bị thành công</response>
    /// <response code="401">Không xác thực được người dùng</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpGet("my-equipments")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<EquipmentDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetMyEquipments()
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse.ErrorResponse("Không thể xác thực người dùng"));
            }

            //var equipments = await _equipmentService.GetEquipmentsByTeamLeaderAsync(userId);
            var equipments = await _equipmentService.GetEquipmentsByUserLinesAsync(userId);
            return Ok(ApiResponse<IReadOnlyList<EquipmentDTO>>.SuccessResponse(
                equipments,
                $"Lấy danh sách {equipments.Count} thiết bị quản lý thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách thiết bị của tổ trưởng");
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi lấy danh sách thiết bị",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Lấy danh sách thiết bị theo các line mà user được phân công
    /// </summary>
    /// <param name="userId">ID của user</param>
    /// <returns>Danh sách thiết bị thuộc các line của user</returns>
    /// <response code="200">Trả về danh sách thiết bị thành công</response>
    /// <response code="400">ID user không hợp lệ</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpGet("user/{userId}/lines")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<EquipmentDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetEquipmentsByUserLines(string userId)
    {
        try
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID người dùng không hợp lệ",
                    new List<string> { "ID không được để trống" }
                ));
            }

            var equipments = await _equipmentService.GetEquipmentsByUserLinesAsync(userId);
            return Ok(ApiResponse<IReadOnlyList<EquipmentDTO>>.SuccessResponse(
                equipments,
                $"Lấy danh sách {equipments.Count} thiết bị theo line của user thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách thiết bị theo line của user: {UserId}", userId);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi lấy danh sách thiết bị theo line của user",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Lấy danh sách thiết bị theo dây chuyền
    /// </summary>
    /// <param name="lineId">ID của dây chuyền</param>
    /// <returns>Danh sách thiết bị thuộc dây chuyền</returns>
    /// <response code="200">Trả về danh sách thiết bị thành công</response>
    /// <response code="400">ID dây chuyền không hợp lệ</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpGet("by-line/{lineId}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<EquipmentDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetEquipmentsByLine(int lineId)
    {
        try
        {
            if (lineId <= 0)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID dây chuyền không hợp lệ",
                    new List<string> { "ID phải lớn hơn 0" }
                ));
            }

            var equipments = await _equipmentService.GetEquipmentsByLineAsync(lineId);

            return Ok(ApiResponse<IReadOnlyList<EquipmentDTO>>.SuccessResponse(
                equipments,
                $"Lấy danh sách {equipments.Count} thiết bị của dây chuyền {lineId} thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách thiết bị theo dây chuyền với ID: {LineId}", lineId);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi lấy danh sách thiết bị theo dây chuyền",
                new List<string> { ex.Message }
            ));
        }
    }

}
