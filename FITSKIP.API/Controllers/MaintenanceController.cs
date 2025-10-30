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

        // ===== MAINTENANCE TEMPLATE MANAGEMENT (TechManager) =====

        /// <summary>
        /// Lấy tất cả templates checklist
        /// </summary>
        [HttpGet("templates")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetAllTemplates()
        {
            try
            {
                var templates = await _maintenanceService.GetAllTemplatesAsync();
                return Ok(ApiResponse<IEnumerable<MaintenanceTemplateDTO>>.SuccessResponse(templates, "Lấy danh sách template thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Lấy template theo ID
        /// </summary>
        [HttpGet("templates/{templateId}")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetTemplateById(int templateId)
        {
            try
            {
                var template = await _maintenanceService.GetTemplateByIdAsync(templateId);
                if (template == null)
                {
                    return NotFound(ApiResponse.ErrorResponse("Không tìm thấy template"));
                }

                return Ok(ApiResponse<MaintenanceTemplateDTO>.SuccessResponse(template, "Lấy thông tin template thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Lấy templates theo công đoạn (Stage)
        /// </summary>
        [HttpGet("templates/stage/{stageId}")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetTemplatesByStageId(int stageId)
        {
            try
            {
                var templates = await _maintenanceService.GetTemplatesByStageIdAsync(stageId);
                return Ok(ApiResponse<IEnumerable<MaintenanceTemplateDTO>>.SuccessResponse(templates, "Lấy danh sách template theo công đoạn thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Tạo template checklist mới cho công đoạn
        /// </summary>
        [HttpPost("templates")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> CreateTemplate([FromBody] CreateMaintenanceTemplateRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var template = await _maintenanceService.CreateTemplateAsync(request, userId);
                return CreatedAtAction(nameof(GetTemplateById), new { templateId = template.TemplateId },
                    ApiResponse<MaintenanceTemplateDTO>.SuccessResponse(template, "Tạo template thành công"));
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
        /// Cập nhật template checklist
        /// </summary>
        [HttpPut("templates/{templateId}")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> UpdateTemplate(int templateId, [FromBody] UpdateMaintenanceTemplateRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var template = await _maintenanceService.UpdateTemplateAsync(templateId, request, userId);
                return Ok(ApiResponse<MaintenanceTemplateDTO>.SuccessResponse(template, "Cập nhật template thành công"));
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
        /// Xóa template
        /// </summary>
        [HttpDelete("templates/{templateId}")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> DeleteTemplate(int templateId)
        {
            try
            {
                await _maintenanceService.DeleteTemplateAsync(templateId);
                return Ok(ApiResponse.SuccessResponse("Xóa template thành công"));
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

        // ===== MAINTENANCE PLAN MANAGEMENT (TechManager) =====

        /// <summary>
        /// Lấy tất cả kế hoạch bảo trì
        /// </summary>
        [HttpGet("plans")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
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
        /// Lấy kế hoạch bảo trì theo ID
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
        /// Lấy kế hoạch bảo trì theo thiết bị
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
        /// Lấy kế hoạch bảo trì đang hoạt động
        /// </summary>
        [HttpGet("plans/active")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
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
        /// Lấy kế hoạch bảo trì quá hạn
        /// </summary>
        [HttpGet("plans/overdue")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
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
        /// Lấy kế hoạch bảo trì sắp đến hạn (trong X ngày)
        /// </summary>
        [HttpGet("plans/due-within/{days}")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
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
        /// Tạo chu kỳ bảo trì cho máy (TechManager)
        /// </summary>
        [HttpPost("plans")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> CreatePlan([FromBody] CreateMaintenancePlanRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var plan = await _maintenanceService.CreatePlanAsync(request, userId);
                return CreatedAtAction(nameof(GetPlanById), new { planId = plan.PlanId },
                    ApiResponse<MaintenancePlanDTO>.SuccessResponse(plan, "Tạo chu kỳ bảo trì thành công"));
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
        /// Cập nhật chu kỳ bảo trì (TechManager)
        /// </summary>
        [HttpPut("plans/{planId}")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> UpdatePlan(int planId, [FromBody] UpdateMaintenancePlanRequest request)
        {
            try
            {
                var plan = await _maintenanceService.UpdatePlanAsync(planId, request);
                return Ok(ApiResponse<MaintenancePlanDTO>.SuccessResponse(plan, "Cập nhật chu kỳ bảo trì thành công"));
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
        /// Xóa chu kỳ bảo trì
        /// </summary>
        [HttpDelete("plans/{planId}")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> DeletePlan(int planId)
        {
            try
            {
                await _maintenanceService.DeletePlanAsync(planId);
                return Ok(ApiResponse.SuccessResponse("Xóa chu kỳ bảo trì thành công"));
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
        /// Hoãn bảo trì - cập nhật NextDueDate (TechManager)
        /// </summary>
        [HttpPost("plans/{planId}/postpone")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> PostponeMaintenancePlan(int planId, [FromBody] PostponeMaintenancePlanRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var plan = await _maintenanceService.PostponeMaintenancePlanAsync(planId, request, userId);
                return Ok(ApiResponse<MaintenancePlanDTO>.SuccessResponse(plan, "Hoãn bảo trì thành công"));
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
        /// Assign nhiều kỹ thuật viên vào kế hoạch bảo trì (TechManager)
        /// Hỗ trợ assign nhiều technicians cùng loại (nhiều điện hoặc nhiều cơ)
        /// </summary>
        [HttpPost("plans/{planId}/assign-multiple")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> AssignMultipleTechnicians(int planId, [FromBody] AssignMultipleTechniciansRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var plan = await _maintenanceService.AssignMultipleTechniciansAsync(planId, request, userId);
                return Ok(ApiResponse<MaintenancePlanDTO>.SuccessResponse(plan, "Phân công nhiều kỹ thuật viên thành công"));
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
        /// Xóa assignment của một technician khỏi kế hoạch bảo trì (TechManager)
        /// </summary>
        [HttpDelete("plans/assignments/{assignmentId}")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> RemoveTechnicianAssignment(int assignmentId)
        {
            try
            {
                await _maintenanceService.RemoveTechnicianAssignmentAsync(assignmentId);
                return Ok(ApiResponse.SuccessResponse("Xóa phân công kỹ thuật viên thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Lấy danh sách kế hoạch chưa có kỹ thuật viên và sắp đến hạn (TechManager)
        /// </summary>
        [HttpGet("plans/unassigned")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetUnassignedPlansNeedingAttention([FromQuery] int daysBeforeDue = 3)
        {
            try
            {
                var plans = await _maintenanceService.GetUnassignedPlansNeedingAttentionAsync(daysBeforeDue);
                return Ok(ApiResponse<IEnumerable<MaintenancePlanDTO>>.SuccessResponse(plans, "Lấy danh sách kế hoạch chưa phân công thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        // ===== WORK ORDER MANAGEMENT (TechManager & Technician) =====

        /// <summary>
        /// Lấy tất cả phiếu bảo trì
        /// </summary>
        [HttpGet("work-orders")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetAllWorkOrders()
        {
            try
            {
                var workOrders = await _maintenanceService.GetAllWorkOrdersAsync();
                return Ok(ApiResponse<IEnumerable<MaintenanceWorkOrderDTO>>.SuccessResponse(workOrders, "Lấy danh sách phiếu bảo trì thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Lấy phiếu bảo trì theo ID
        /// </summary>
        [HttpGet("work-orders/{workOrderId}")]
        public async Task<IActionResult> GetWorkOrderById(int workOrderId)
        {
            try
            {
                var workOrder = await _maintenanceService.GetWorkOrderByIdAsync(workOrderId);
                if (workOrder == null)
                {
                    return NotFound(ApiResponse.ErrorResponse("Không tìm thấy phiếu bảo trì"));
                }

                return Ok(ApiResponse<MaintenanceWorkOrderDTO>.SuccessResponse(workOrder, "Lấy thông tin phiếu bảo trì thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Lấy phiếu bảo trì theo kế hoạch
        /// </summary>
        [HttpGet("work-orders/plan/{planId}")]
        public async Task<IActionResult> GetWorkOrdersByPlanId(int planId)
        {
            try
            {
                var workOrders = await _maintenanceService.GetWorkOrdersByPlanIdAsync(planId);
                return Ok(ApiResponse<IEnumerable<MaintenanceWorkOrderDTO>>.SuccessResponse(workOrders, "Lấy danh sách phiếu bảo trì theo kế hoạch thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Lấy phiếu bảo trì của tôi (Technician)
        /// </summary>
        [HttpGet("work-orders/my")]
        [Authorize(Roles = "Kỹ thuật viên,Mechanical Technician,Electrical Technician")]
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
                return Ok(ApiResponse<IEnumerable<MaintenanceWorkOrderDTO>>.SuccessResponse(workOrders, "Lấy danh sách phiếu bảo trì của bạn thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Lấy phiếu bảo trì theo kỹ thuật viên (TechManager)
        /// </summary>
        [HttpGet("work-orders/technician/{technicianId}")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetWorkOrdersByTechnician(string technicianId)
        {
            try
            {
                var workOrders = await _maintenanceService.GetWorkOrdersByTechnicianAsync(technicianId);
                return Ok(ApiResponse<IEnumerable<MaintenanceWorkOrderDTO>>.SuccessResponse(workOrders, "Lấy danh sách phiếu bảo trì theo kỹ thuật viên thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Lấy phiếu bảo trì đang chờ xử lý
        /// </summary>
        [HttpGet("work-orders/pending")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetPendingWorkOrders()
        {
            try
            {
                var workOrders = await _maintenanceService.GetPendingWorkOrdersAsync();
                return Ok(ApiResponse<IEnumerable<MaintenanceWorkOrderDTO>>.SuccessResponse(workOrders, "Lấy danh sách phiếu bảo trì chờ xử lý thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Tạo phiếu bảo trì từ kế hoạch (TechManager)
        /// TechManager có thể điều chỉnh checklist và assign technicians
        /// </summary>
        [HttpPost("work-orders")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> CreateWorkOrder([FromBody] CreateMaintenanceWorkOrderRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var workOrder = await _maintenanceService.CreateWorkOrderAsync(request, userId);
                return CreatedAtAction(nameof(GetWorkOrderById), new { workOrderId = workOrder.WorkOrderId },
                    ApiResponse<MaintenanceWorkOrderDTO>.SuccessResponse(workOrder, "Tạo phiếu bảo trì thành công"));
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
        /// Cập nhật phiếu bảo trì (TechManager)
        /// TechManager có thể điều chỉnh checklist, technicians, due date
        /// </summary>
        [HttpPut("work-orders/{workOrderId}")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> UpdateWorkOrder(int workOrderId, [FromBody] UpdateMaintenanceWorkOrderRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var workOrder = await _maintenanceService.UpdateWorkOrderAsync(workOrderId, request, userId);
                return Ok(ApiResponse<MaintenanceWorkOrderDTO>.SuccessResponse(workOrder, "Cập nhật phiếu bảo trì thành công"));
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
        /// Assign kỹ thuật viên vào phiếu bảo trì (TechManager)
        /// </summary>
        [HttpPost("work-orders/{workOrderId}/assign")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> AssignTechnicians(int workOrderId, [FromBody] AssignTechniciansRequest request)
        {
            try
            {
                var workOrder = await _maintenanceService.AssignTechniciansAsync(
                    workOrderId, 
                    request.ElectricalTechnicianId, 
                    request.MechanicalTechnicianId
                );
                return Ok(ApiResponse<MaintenanceWorkOrderDTO>.SuccessResponse(workOrder, "Phân công kỹ thuật viên thành công"));
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
        /// Bắt đầu thực hiện phiếu bảo trì (Technician)
        /// </summary>
        [HttpPost("work-orders/{workOrderId}/start")]
        [Authorize(Roles = "Kỹ thuật viên,Mechanical Technician,Electrical Technician")]
        public async Task<IActionResult> StartWorkOrder(int workOrderId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var workOrder = await _maintenanceService.StartWorkOrderAsync(workOrderId, userId);
                return Ok(ApiResponse<MaintenanceWorkOrderDTO>.SuccessResponse(workOrder, "Bắt đầu thực hiện bảo trì thành công"));
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
        /// Hoàn thành phiếu bảo trì (Technician)
        /// </summary>
        [HttpPost("work-orders/{workOrderId}/complete")]
        [Authorize(Roles = "Kỹ thuật viên,Mechanical Technician,Electrical Technician")]
        public async Task<IActionResult> CompleteWorkOrder(int workOrderId, [FromBody] CompleteWorkOrderRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var workOrder = await _maintenanceService.CompleteWorkOrderAsync(workOrderId, request, userId);
                return Ok(ApiResponse<MaintenanceWorkOrderDTO>.SuccessResponse(workOrder, "Hoàn thành bảo trì thành công"));
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
        /// Hủy phiếu bảo trì (TechManager)
        /// </summary>
        [HttpPost("work-orders/{workOrderId}/cancel")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> CancelWorkOrder(int workOrderId, [FromBody] CancelWorkOrderRequest request)
        {
            try
            {
                var workOrder = await _maintenanceService.CancelWorkOrderAsync(workOrderId, request.Reason);
                return Ok(ApiResponse<MaintenanceWorkOrderDTO>.SuccessResponse(workOrder, "Hủy phiếu bảo trì thành công"));
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
        /// Xóa phiếu bảo trì (TechManager)
        /// </summary>
        [HttpDelete("work-orders/{workOrderId}")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> DeleteWorkOrder(int workOrderId)
        {
            try
            {
                await _maintenanceService.DeleteWorkOrderAsync(workOrderId);
                return Ok(ApiResponse.SuccessResponse("Xóa phiếu bảo trì thành công"));
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

        // ===== CHECKLIST ITEM MANAGEMENT =====

        /// <summary>
        /// Cập nhật checklist item (Technician check/uncheck)
        /// </summary>
        [HttpPut("checklist/{checklistId}")]
        [Authorize(Roles = "Kỹ thuật viên,Mechanical Technician,Electrical Technician,Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> UpdateChecklistItem(int checklistId, [FromBody] UpdateChecklistItemRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var item = await _maintenanceService.UpdateChecklistItemAsync(checklistId, request, userId);
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

        /// <summary>
        /// Thêm checklist item vào work order (TechManager)
        /// </summary>
        [HttpPost("work-orders/{workOrderId}/checklist")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> AddChecklistItem(int workOrderId, [FromBody] CreateChecklistItemRequest request)
        {
            try
            {
                var item = await _maintenanceService.AddChecklistItemAsync(workOrderId, request);
                return Ok(ApiResponse<MaintenanceChecklistItemDTO>.SuccessResponse(item, "Thêm checklist item thành công"));
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
        /// Xóa checklist item (TechManager)
        /// </summary>
        [HttpDelete("checklist/{checklistId}")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> DeleteChecklistItem(int checklistId)
        {
            try
            {
                await _maintenanceService.DeleteChecklistItemAsync(checklistId);
                return Ok(ApiResponse.SuccessResponse("Xóa checklist item thành công"));
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

        // ===== TECHNICIAN MANAGEMENT =====

        /// <summary>
        /// Lấy danh sách TẤT CẢ kỹ thuật viên (có EmployeeCode)
        /// </summary>
        [HttpGet("technicians")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetAllTechnicians()
        {
            try
            {
                var technicians = await _maintenanceService.GetAllTechniciansAsync();
                return Ok(ApiResponse<IEnumerable<TechnicianDTO>>.SuccessResponse(technicians, "Lấy danh sách kỹ thuật viên thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Lấy danh sách kỹ thuật viên cơ (có EmployeeCode)
        /// </summary>
        [HttpGet("technicians/mechanical")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetMechanicalTechnicians()
        {
            try
            {
                var technicians = await _maintenanceService.GetMechanicalTechniciansAsync();
                return Ok(ApiResponse<IEnumerable<TechnicianDTO>>.SuccessResponse(technicians, "Lấy danh sách kỹ thuật viên cơ thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Lấy danh sách kỹ thuật viên điện (có EmployeeCode)
        /// </summary>
        [HttpGet("technicians/electrical")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetElectricalTechnicians()
        {
            try
            {
                var technicians = await _maintenanceService.GetElectricalTechniciansAsync();
                return Ok(ApiResponse<IEnumerable<TechnicianDTO>>.SuccessResponse(technicians, "Lấy danh sách kỹ thuật viên điện thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        // ===== STATISTICS & REPORTS =====

        /// <summary>
        /// Lấy thống kê bảo trì
        /// </summary>
        [HttpGet("statistics")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var stats = await _maintenanceService.GetStatisticsAsync();
                return Ok(ApiResponse<MaintenanceStatisticsDTO>.SuccessResponse(stats, "Lấy thống kê bảo trì thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Lấy danh sách bảo trì sắp đến hạn
        /// </summary>
        [HttpGet("upcoming")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetUpcomingMaintenance([FromQuery] int days = 7)
        {
            try
            {
                var upcoming = await _maintenanceService.GetUpcomingMaintenanceAsync(days);
                return Ok(ApiResponse<IEnumerable<UpcomingMaintenanceDTO>>.SuccessResponse(upcoming, $"Lấy danh sách bảo trì sắp đến hạn trong {days} ngày thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }
    }
}
