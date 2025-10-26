using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using System.Security.Claims;

namespace FITSKIP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MaintenanceController : ControllerBase
    {
        private readonly IMaintenanceService _maintenanceService;

        public MaintenanceController(IMaintenanceService maintenanceService)
        {
            _maintenanceService = maintenanceService;
        }

        // ===== Maintenance Plan Management (Admin/Manager) =====

        /// <summary>
        /// Get all maintenance plans
        /// </summary>
        [HttpGet("plans")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetAllPlans()
        {
            try
            {
                var plans = await _maintenanceService.GetAllPlansAsync();
                return Ok(ApiResponse<IEnumerable<MaintenancePlanDTO>>.SuccessResponse(plans, "Lấy danh sách kế hoạch bảo trì thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get maintenance plan by ID
        /// </summary>
        [HttpGet("plans/{planId}")]
        public async Task<IActionResult> GetPlanById(int planId)
        {
            try
            {
                var plan = await _maintenanceService.GetPlanByIdAsync(planId);
                if (plan == null)
                {
                    return NotFound(ApiResponse.ErrorResponse("Không tìm thấy kế hoạch bảo trì"));
                }

                return Ok(ApiResponse<MaintenancePlanDTO>.SuccessResponse(plan, "Lấy thông tin kế hoạch bảo trì thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get maintenance plans by equipment ID
        /// </summary>
        [HttpGet("plans/equipment/{equipmentId}")]
        public async Task<IActionResult> GetPlansByEquipmentId(int equipmentId)
        {
            try
            {
                var plans = await _maintenanceService.GetPlansByEquipmentIdAsync(equipmentId);
                return Ok(ApiResponse<IEnumerable<MaintenancePlanDTO>>.SuccessResponse(plans, "Lấy danh sách kế hoạch bảo trì theo thiết bị thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get active maintenance plans
        /// </summary>
        [HttpGet("plans/active")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetActivePlans()
        {
            try
            {
                var plans = await _maintenanceService.GetActivePlansAsync();
                return Ok(ApiResponse<IEnumerable<MaintenancePlanDTO>>.SuccessResponse(plans, "Lấy danh sách kế hoạch bảo trì đang hoạt động thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get overdue maintenance plans
        /// </summary>
        [HttpGet("plans/overdue")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetOverduePlans()
        {
            try
            {
                var plans = await _maintenanceService.GetOverduePlansAsync();
                return Ok(ApiResponse<IEnumerable<MaintenancePlanDTO>>.SuccessResponse(plans, "Lấy danh sách kế hoạch bảo trì quá hạn thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get maintenance plans due within specified days
        /// </summary>
        [HttpGet("plans/due-within/{days}")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetPlansDueWithinDays(int days)
        {
            try
            {
                var plans = await _maintenanceService.GetPlansDueWithinDaysAsync(days);
                return Ok(ApiResponse<IEnumerable<MaintenancePlanDTO>>.SuccessResponse(plans, $"Lấy danh sách kế hoạch bảo trì đến hạn trong {days} ngày thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Create new maintenance plan
        /// </summary>
        [HttpPost("plans")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> CreatePlan([FromBody] CreateMaintenancePlanRequest request)
        {
            try
            {
                var plan = await _maintenanceService.CreatePlanAsync(request);
                return CreatedAtAction(nameof(GetPlanById), new { planId = plan.PlanId }, 
                    ApiResponse<MaintenancePlanDTO>.SuccessResponse(plan, "Tạo kế hoạch bảo trì thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Update maintenance plan
        /// </summary>
        [HttpPut("plans/{planId}")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> UpdatePlan(int planId, [FromBody] UpdateMaintenancePlanRequest request)
        {
            try
            {
                var plan = await _maintenanceService.UpdatePlanAsync(planId, request);
                return Ok(ApiResponse<MaintenancePlanDTO>.SuccessResponse(plan, "Cập nhật kế hoạch bảo trì thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Delete maintenance plan
        /// </summary>
        [HttpDelete("plans/{planId}")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> DeletePlan(int planId)
        {
            try
            {
                await _maintenanceService.DeletePlanAsync(planId);
                return Ok(ApiResponse.SuccessResponse("Xóa kế hoạch bảo trì thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        // ===== Work Order Management (for Technical Manager) =====

        /// <summary>
        /// Get pending maintenance requests (for Technical Manager to review)
        /// </summary>
        [HttpGet("requests/pending")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetPendingRequests()
        {
            try
            {
                var requests = await _maintenanceService.GetPendingRequestsAsync();
                return Ok(ApiResponse<IEnumerable<MaintenanceRequestDTO>>.SuccessResponse(requests, "Lấy danh sách yêu cầu bảo trì chờ xử lý thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Approve maintenance request and assign technician
        /// </summary>
        [HttpPost("requests/{planId}/approve")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> ApproveRequest(int planId, [FromBody] ApproveMaintenanceRequest request)
        {
            try
            {
                var plan = await _maintenanceService.ApproveRequestAsync(planId, request);
                return Ok(ApiResponse<MaintenancePlanDTO>.SuccessResponse(plan, "Phê duyệt yêu cầu bảo trì thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Reject maintenance request
        /// </summary>
        [HttpPost("requests/{planId}/reject")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> RejectRequest(int planId, [FromBody] RejectMaintenanceRequest request)
        {
            try
            {
                await _maintenanceService.RejectRequestAsync(planId, request);
                return Ok(ApiResponse.SuccessResponse("Từ chối yêu cầu bảo trì thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Assign technician to maintenance plan
        /// </summary>
        [HttpPost("plans/{planId}/assign")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> AssignTechnician(int planId, [FromBody] AssignMaintenanceTechnicianRequest request)
        {
            try
            {
                var plan = await _maintenanceService.AssignTechnicianAsync(planId, request);
                return Ok(ApiResponse<MaintenancePlanDTO>.SuccessResponse(plan, "Giao việc cho kỹ thuật viên thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        // ===== Work Orders (for Technician) =====

        /// <summary>
        /// Get work orders assigned to current technician
        /// </summary>
        [HttpGet("work-orders/my")]
        [Authorize(Roles = "Kỹ thuật viên")]
        public async Task<IActionResult> GetMyWorkOrders()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var workOrders = await _maintenanceService.GetWorkOrdersByTechnicianAsync(userId);
                return Ok(ApiResponse<IEnumerable<WorkOrderDTO>>.SuccessResponse(workOrders, "Lấy danh sách công việc bảo trì thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get work orders assigned to specific technician (for managers)
        /// </summary>
        [HttpGet("work-orders/technician/{technicianId}")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetWorkOrdersByTechnician(string technicianId)
        {
            try
            {
                var workOrders = await _maintenanceService.GetWorkOrdersByTechnicianAsync(technicianId);
                return Ok(ApiResponse<IEnumerable<WorkOrderDTO>>.SuccessResponse(workOrders, "Lấy danh sách công việc bảo trì theo kỹ thuật viên thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get work order details by ID
        /// </summary>
        [HttpGet("work-orders/{planId}")]
        [Authorize(Roles = "Kỹ thuật viên,Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetWorkOrderById(int planId)
        {
            try
            {
                var workOrder = await _maintenanceService.GetWorkOrderByIdAsync(planId);
                if (workOrder == null)
                {
                    return NotFound(ApiResponse.ErrorResponse("Không tìm thấy công việc bảo trì"));
                }

                return Ok(ApiResponse<WorkOrderDTO>.SuccessResponse(workOrder, "Lấy thông tin công việc bảo trì thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Complete maintenance work order
        /// </summary>
        [HttpPost("work-orders/{planId}/complete")]
        [Authorize(Roles = "Kỹ thuật viên")]
        public async Task<IActionResult> CompleteMaintenance(int planId, [FromBody] CompleteMaintenanceRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var plan = await _maintenanceService.CompleteMaintenanceAsync(planId, request, userId);
                return Ok(ApiResponse<MaintenancePlanDTO>.SuccessResponse(plan, "Hoàn thành công việc bảo trì thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        // ===== Checklist Management =====

        /// <summary>
        /// Get checklist items for a maintenance plan
        /// </summary>
        [HttpGet("plans/{planId}/checklist")]
        public async Task<IActionResult> GetChecklistItems(int planId)
        {
            try
            {
                var items = await _maintenanceService.GetChecklistItemsByPlanIdAsync(planId);
                return Ok(ApiResponse<IEnumerable<MaintenanceChecklistItemDTO>>.SuccessResponse(items, "Lấy danh sách checklist thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Update checklist item
        /// </summary>
        [HttpPut("checklist/{checklistId}")]
        [Authorize(Roles = "Kỹ thuật viên,Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> UpdateChecklistItem(int checklistId, [FromBody] UpdateChecklistItemRequest request)
        {
            try
            {
                var item = await _maintenanceService.UpdateChecklistItemAsync(checklistId, request);
                return Ok(ApiResponse<MaintenanceChecklistItemDTO>.SuccessResponse(item, "Cập nhật checklist thành công"));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        // ===== Statistics & Reports =====

        /// <summary>
        /// Get maintenance statistics
        /// </summary>
        [HttpGet("statistics")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var stats = await _maintenanceService.GetMaintenanceStatsAsync();
                return Ok(ApiResponse<MaintenanceStatsDTO>.SuccessResponse(stats, "Lấy thống kê bảo trì thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get maintenance history
        /// </summary>
        [HttpGet("history")]
        [Authorize(Roles = "Admin,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetMaintenanceHistory([FromQuery] int? equipmentId = null)
        {
            try
            {
                var history = await _maintenanceService.GetMaintenanceHistoryAsync(equipmentId);
                return Ok(ApiResponse<IEnumerable<MaintenanceHistoryDTO>>.SuccessResponse(history, "Lấy lịch sử bảo trì thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }
    }
}
