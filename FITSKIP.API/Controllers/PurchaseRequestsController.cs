using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using FITSKIP.API.Hubs;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PurchaseRequestsController : ControllerBase
{
    private readonly IPurchaseRequestService _purchaseRequestService;
    private readonly ILogger<PurchaseRequestsController> _logger;
    private readonly IHubContext<NotificationHub> _hubContext;

    public PurchaseRequestsController(
        IPurchaseRequestService purchaseRequestService,
        ILogger<PurchaseRequestsController> logger,
        IHubContext<NotificationHub> hubContext)
    {
        _purchaseRequestService = purchaseRequestService;
        _logger = logger;
        _hubContext = hubContext;
    }

    /// <summary>
    /// Lấy danh sách tất cả yêu cầu mua hàng
    /// </summary>
    /// <returns>Danh sách yêu cầu mua hàng</returns>
    /// <response code="200">Trả về danh sách yêu cầu mua hàng thành công</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<PurchaseRequestDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetAllPurchaseRequests()
    {
        try
        {
            var requests = await _purchaseRequestService.GetAllPurchaseRequestsAsync();
            return Ok(ApiResponse<IReadOnlyList<PurchaseRequestDTO>>.SuccessResponse(
                requests,
                $"Lấy danh sách {requests.Count} yêu cầu mua hàng thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách yêu cầu mua hàng");
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi lấy danh sách yêu cầu mua hàng",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Lấy thông tin yêu cầu mua hàng theo ID
    /// </summary>
    /// <param name="id">ID của yêu cầu mua hàng</param>
    /// <returns>Thông tin yêu cầu mua hàng</returns>
    /// <response code="200">Trả về thông tin yêu cầu mua hàng thành công</response>
    /// <response code="404">Không tìm thấy yêu cầu mua hàng</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PurchaseRequestDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetPurchaseRequest(int id)
    {
        try
        {
            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID yêu cầu mua hàng không hợp lệ",
                    new List<string> { "ID phải lớn hơn 0" }
                ));
            }

            var request = await _purchaseRequestService.GetPurchaseRequestByIdAsync(id);
            if (request == null)
            {
                return NotFound(ApiResponse.ErrorResponse($"Không tìm thấy yêu cầu mua hàng với ID: {id}"));
            }

            return Ok(ApiResponse<PurchaseRequestDTO>.SuccessResponse(
                request,
                "Lấy thông tin yêu cầu mua hàng thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy thông tin yêu cầu mua hàng với ID: {RequestId}", id);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi lấy thông tin yêu cầu mua hàng",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Lấy danh sách yêu cầu mua hàng của tôi
    /// </summary>
    /// <returns>Danh sách yêu cầu mua hàng của người dùng hiện tại</returns>
    /// <response code="200">Trả về danh sách yêu cầu mua hàng thành công</response>
    /// <response code="401">Không xác thực được người dùng</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpGet("my-requests")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<PurchaseRequestDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetMyPurchaseRequests()
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse.ErrorResponse("Không thể xác thực người dùng"));
            }

            var requests = await _purchaseRequestService.GetMyPurchaseRequestsAsync(userId);
            return Ok(ApiResponse<IReadOnlyList<PurchaseRequestDTO>>.SuccessResponse(
                requests,
                $"Lấy danh sách {requests.Count} yêu cầu mua hàng của bạn thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách yêu cầu mua hàng của người dùng");
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi lấy danh sách yêu cầu mua hàng",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Lấy danh sách yêu cầu mua hàng theo trạng thái
    /// </summary>
    /// <param name="status">Trạng thái (Pending, Approved, Rejected)</param>
    /// <returns>Danh sách yêu cầu mua hàng theo trạng thái</returns>
    /// <response code="200">Trả về danh sách yêu cầu mua hàng thành công</response>
    /// <response code="400">Trạng thái không hợp lệ</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpGet("by-status/{status}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<PurchaseRequestDTO>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GetPurchaseRequestsByStatus(string status)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "Trạng thái không hợp lệ",
                    new List<string> { "Trạng thái không được để trống" }
                ));
            }

            var requests = await _purchaseRequestService.GetPurchaseRequestsByStatusAsync(status);
            return Ok(ApiResponse<IReadOnlyList<PurchaseRequestDTO>>.SuccessResponse(
                requests,
                $"Lấy danh sách {requests.Count} yêu cầu mua hàng với trạng thái '{status}' thành công"
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi lấy danh sách yêu cầu mua hàng theo trạng thái: {Status}", status);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi lấy danh sách yêu cầu mua hàng",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Tạo yêu cầu mua hàng mới (Chỉ dành cho Quản lý kỹ thuật)
    /// </summary>
    /// <param name="request">Thông tin yêu cầu mua hàng cần tạo</param>
    /// <returns>Yêu cầu mua hàng vừa được tạo</returns>
    /// <response code="201">Tạo yêu cầu mua hàng thành công</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ</response>
    /// <response code="401">Không xác thực được người dùng</response>
    /// <response code="403">Không có quyền (không phải Technician)</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpPost]
    [Authorize(Roles = "Quản lý kỹ thuật")]
    [ProducesResponseType(typeof(ApiResponse<PurchaseRequestDTO>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CreatePurchaseRequest([FromBody] CreatePurchaseRequestRequest request)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse.ErrorResponse("Không thể xác thực người dùng"));
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

            var purchaseRequest = await _purchaseRequestService.CreatePurchaseRequestAsync(request, userId);

            // Send real-time update to both groups
            await _hubContext.Clients.Group("TechnicalManagers").SendAsync("DataUpdated", new { type = "purchaseRequest", action = "created", requestId = purchaseRequest.RequestId });
            await _hubContext.Clients.Group("Managers").SendAsync("DataUpdated", new { type = "purchaseRequest", action = "created", requestId = purchaseRequest.RequestId });

            return CreatedAtAction(
                nameof(GetPurchaseRequest),
                new { id = purchaseRequest.RequestId },
                ApiResponse<PurchaseRequestDTO>.SuccessResponse(
                    purchaseRequest,
                    "Tạo yêu cầu mua hàng thành công"
                )
            );
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Lỗi business logic khi tạo yêu cầu mua hàng");
            return BadRequest(ApiResponse.ErrorResponse(
                ex.Message,
                new List<string> { ex.Message }
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi tạo yêu cầu mua hàng");
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi tạo yêu cầu mua hàng",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Cập nhật thông tin yêu cầu mua hàng
    /// </summary>
    /// <param name="id">ID của yêu cầu mua hàng cần cập nhật</param>
    /// <param name="request">Thông tin cập nhật</param>
    /// <returns>Yêu cầu mua hàng sau khi cập nhật</returns>
    /// <response code="200">Cập nhật yêu cầu mua hàng thành công</response>
    /// <response code="400">Dữ liệu đầu vào không hợp lệ</response>
    /// <response code="401">Không có quyền cập nhật</response>
    /// <response code="404">Không tìm thấy yêu cầu mua hàng</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(ApiResponse<PurchaseRequestDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdatePurchaseRequest(int id, [FromBody] UpdatePurchaseRequestRequest request)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse.ErrorResponse("Không thể xác thực người dùng"));
            }

            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID yêu cầu mua hàng không hợp lệ",
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

            var purchaseRequest = await _purchaseRequestService.UpdatePurchaseRequestAsync(id, request, userId);
            if (purchaseRequest == null)
            {
                return NotFound(ApiResponse.ErrorResponse($"Không tìm thấy yêu cầu mua hàng với ID: {id}"));
            }

            // Send real-time update to both groups
            await _hubContext.Clients.Group("TechnicalManagers").SendAsync("DataUpdated", new { type = "purchaseRequest", action = "updated", requestId = purchaseRequest.RequestId });
            await _hubContext.Clients.Group("Managers").SendAsync("DataUpdated", new { type = "purchaseRequest", action = "updated", requestId = purchaseRequest.RequestId });

            return Ok(ApiResponse<PurchaseRequestDTO>.SuccessResponse(
                purchaseRequest,
                "Cập nhật yêu cầu mua hàng thành công"
            ));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Người dùng không có quyền cập nhật yêu cầu mua hàng với ID: {RequestId}", id);
            return StatusCode(403, ApiResponse.ErrorResponse(
                ex.Message,
                new List<string> { ex.Message }
            ));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Lỗi business logic khi cập nhật yêu cầu mua hàng với ID: {RequestId}", id);
            return BadRequest(ApiResponse.ErrorResponse(
                ex.Message,
                new List<string> { ex.Message }
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi cập nhật yêu cầu mua hàng với ID: {RequestId}", id);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi cập nhật yêu cầu mua hàng",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Xóa yêu cầu mua hàng (Soft delete)
    /// </summary>
    /// <param name="id">ID của yêu cầu mua hàng cần xóa</param>
    /// <returns>Kết quả xóa</returns>
    /// <response code="200">Xóa yêu cầu mua hàng thành công</response>
    /// <response code="400">ID không hợp lệ</response>
    /// <response code="401">Không có quyền xóa</response>
    /// <response code="404">Không tìm thấy yêu cầu mua hàng</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpDelete("{id}")]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeletePurchaseRequest(int id)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse.ErrorResponse("Không thể xác thực người dùng"));
            }

            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID yêu cầu mua hàng không hợp lệ",
                    new List<string> { "ID phải lớn hơn 0" }
                ));
            }

            var result = await _purchaseRequestService.DeletePurchaseRequestAsync(id, userId);
            if (!result)
            {
                return NotFound(ApiResponse.ErrorResponse($"Không tìm thấy yêu cầu mua hàng với ID: {id}"));
            }

            // Send real-time update to both groups
            await _hubContext.Clients.Group("TechnicalManagers").SendAsync("DataUpdated", new { type = "purchaseRequest", action = "deleted", requestId = id });
            await _hubContext.Clients.Group("Managers").SendAsync("DataUpdated", new { type = "purchaseRequest", action = "deleted", requestId = id });

            return Ok(ApiResponse.SuccessResponse("Xóa yêu cầu mua hàng thành công"));
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Người dùng không có quyền xóa yêu cầu mua hàng với ID: {RequestId}", id);
            return StatusCode(403, ApiResponse.ErrorResponse(
                ex.Message,
                new List<string> { ex.Message }
            ));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Lỗi business logic khi xóa yêu cầu mua hàng với ID: {RequestId}", id);
            return BadRequest(ApiResponse.ErrorResponse(
                ex.Message,
                new List<string> { ex.Message }
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xóa yêu cầu mua hàng với ID: {RequestId}", id);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi xóa yêu cầu mua hàng",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Duyệt yêu cầu mua hàng (Chỉ dành cho Manager)
    /// </summary>
    /// <param name="id">ID của yêu cầu mua hàng</param>
    /// <param name="request">Thông tin duyệt (có thể có ghi chú)</param>
    /// <returns>Yêu cầu mua hàng sau khi duyệt</returns>
    /// <response code="200">Duyệt yêu cầu mua hàng thành công</response>
    /// <response code="400">Dữ liệu không hợp lệ hoặc trạng thái không cho phép duyệt</response>
    /// <response code="401">Không xác thực được người dùng</response>
    /// <response code="403">Không có quyền duyệt (không phải Manager)</response>
    /// <response code="404">Không tìm thấy yêu cầu mua hàng</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpPost("{id}/approve")]
    // Allow both Manager and Technician Manager roles to approve
    [Authorize(Roles = "Quản lý kỹ thuật,Quản lý")]
    [ProducesResponseType(typeof(ApiResponse<PurchaseRequestDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> ApprovePurchaseRequest(int id, [FromBody] ApprovePurchaseRequestRequest? request)
    {
        try
        {
            var managerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(managerId))
            {
                return Unauthorized(ApiResponse.ErrorResponse("Không thể xác thực người dùng"));
            }

            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID yêu cầu mua hàng không hợp lệ",
                    new List<string> { "ID phải lớn hơn 0" }
                ));
            }

            var purchaseRequest = await _purchaseRequestService.ApprovePurchaseRequestAsync(id, managerId);
            if (purchaseRequest == null)
            {
                return NotFound(ApiResponse.ErrorResponse($"Không tìm thấy yêu cầu mua hàng với ID: {id}"));
            }

            // Send real-time update to both groups
            await _hubContext.Clients.Group("TechnicalManagers").SendAsync("DataUpdated", new { type = "purchaseRequest", action = "approved", requestId = purchaseRequest.RequestId });
            await _hubContext.Clients.Group("Managers").SendAsync("DataUpdated", new { type = "purchaseRequest", action = "approved", requestId = purchaseRequest.RequestId });

            return Ok(ApiResponse<PurchaseRequestDTO>.SuccessResponse(
                purchaseRequest,
                "Duyệt yêu cầu mua hàng thành công"
            ));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Lỗi business logic khi duyệt yêu cầu mua hàng với ID: {RequestId}", id);
            return BadRequest(ApiResponse.ErrorResponse(
                ex.Message,
                new List<string> { ex.Message }
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi duyệt yêu cầu mua hàng với ID: {RequestId}", id);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi duyệt yêu cầu mua hàng",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Từ chối yêu cầu mua hàng (Chỉ dành cho Manager)
    /// </summary>
    /// <param name="id">ID của yêu cầu mua hàng</param>
    /// <param name="request">Lý do từ chối</param>
    /// <returns>Yêu cầu mua hàng sau khi từ chối</returns>
    /// <response code="200">Từ chối yêu cầu mua hàng thành công</response>
    /// <response code="400">Dữ liệu không hợp lệ hoặc trạng thái không cho phép từ chối</response>
    /// <response code="401">Không xác thực được người dùng</response>
    /// <response code="403">Không có quyền từ chối (không phải Manager)</response>
    /// <response code="404">Không tìm thấy yêu cầu mua hàng</response>
    /// <response code="500">Lỗi server nội bộ</response>
    [HttpPost("{id}/reject")]
    // Allow both Manager and Technician Manager roles to reject
    [Authorize(Roles = "Quản lý kỹ thuật,Quản lý")]
    [ProducesResponseType(typeof(ApiResponse<PurchaseRequestDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> RejectPurchaseRequest(int id, [FromBody] RejectPurchaseRequestRequest request)
    {
        try
        {
            var managerId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(managerId))
            {
                return Unauthorized(ApiResponse.ErrorResponse("Không thể xác thực người dùng"));
            }

            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID yêu cầu mua hàng không hợp lệ",
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

            var purchaseRequest = await _purchaseRequestService.RejectPurchaseRequestAsync(id, managerId, request.Reason);
            if (purchaseRequest == null)
            {
                return NotFound(ApiResponse.ErrorResponse($"Không tìm thấy yêu cầu mua hàng với ID: {id}"));
            }

            // Send real-time update to both groups
            await _hubContext.Clients.Group("TechnicalManagers").SendAsync("DataUpdated", new { type = "purchaseRequest", action = "rejected", requestId = purchaseRequest.RequestId });
            await _hubContext.Clients.Group("Managers").SendAsync("DataUpdated", new { type = "purchaseRequest", action = "rejected", requestId = purchaseRequest.RequestId });

            return Ok(ApiResponse<PurchaseRequestDTO>.SuccessResponse(
                purchaseRequest,
                "Từ chối yêu cầu mua hàng thành công"
            ));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Lỗi business logic khi từ chối yêu cầu mua hàng với ID: {RequestId}", id);
            return BadRequest(ApiResponse.ErrorResponse(
                ex.Message,
                new List<string> { ex.Message }
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi từ chối yêu cầu mua hàng với ID: {RequestId}", id);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi từ chối yêu cầu mua hàng",
                new List<string> { ex.Message }
            ));
        }
    }

    /// <summary>
    /// Mark purchase request as received (Đã nhập kho) - Only for Technical Managers
    /// </summary>
    [HttpPost("{id}/received")]
    [Authorize(Roles = "Quản lý kỹ thuật")]
    [ProducesResponseType(typeof(ApiResponse<PurchaseRequestDTO>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> MarkAsReceived(int id)
    {
        try
        {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse.ErrorResponse("Không thể xác thực người dùng"));
            }

            if (id <= 0)
            {
                return BadRequest(ApiResponse.ErrorResponse(
                    "ID yêu cầu mua hàng không hợp lệ",
                    new List<string> { "ID phải lớn hơn 0" }
                ));
            }

            var purchaseRequest = await _purchaseRequestService.MarkAsReceivedAsync(id, userId);
            if (purchaseRequest == null)
            {
                return NotFound(ApiResponse.ErrorResponse($"Không tìm thấy yêu cầu mua hàng với ID: {id}"));
            }

            // Send real-time update to both groups
            await _hubContext.Clients.Group("TechnicalManagers").SendAsync("DataUpdated", new { type = "purchaseRequest", action = "received", requestId = purchaseRequest.RequestId });
            await _hubContext.Clients.Group("Managers").SendAsync("DataUpdated", new { type = "purchaseRequest", action = "received", requestId = purchaseRequest.RequestId });

            return Ok(ApiResponse<PurchaseRequestDTO>.SuccessResponse(
                purchaseRequest,
                "Đánh dấu đã nhập kho thành công. Số lượng tồn kho đã được cập nhật."
            ));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Lỗi business logic khi đánh dấu đã nhập kho yêu cầu mua hàng với ID: {RequestId}", id);
            return BadRequest(ApiResponse.ErrorResponse(
                ex.Message,
                new List<string> { ex.Message }
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi đánh dấu đã nhập kho yêu cầu mua hàng với ID: {RequestId}", id);
            return StatusCode(500, ApiResponse.ErrorResponse(
                "Có lỗi xảy ra khi đánh dấu đã nhập kho",
                new List<string> { ex.Message }
            ));
        }
    }
}

