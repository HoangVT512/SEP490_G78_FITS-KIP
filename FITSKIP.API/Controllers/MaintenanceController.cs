using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using System.Security.Claims;

namespace FITSKIP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaintenanceController : ControllerBase
    {
        private readonly IMaintenanceTemplateService _templateService;
        private readonly IMaintenancePlanService _planService;
        private readonly IMaintenanceWorkOrderService _workOrderService;

        public MaintenanceController(
            IMaintenanceTemplateService templateService,
            IMaintenancePlanService planService,
            IMaintenanceWorkOrderService workOrderService)
        {
            _templateService = templateService;
            _planService = planService;
            _workOrderService = workOrderService;
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
                var templates = await _templateService.GetAllTemplatesAsync();
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
                var template = await _templateService.GetTemplateByIdAsync(templateId);
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
                var templates = await _templateService.GetTemplatesByStageIdAsync(stageId);
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

                var template = await _templateService.CreateTemplateAsync(request, userId);
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

                var template = await _templateService.UpdateTemplateAsync(templateId, request, userId);
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
                await _templateService.DeleteTemplateAsync(templateId);
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

        /// <summary>
        /// Tải file Excel mẫu cho Maintenance Template
        /// </summary>
        [HttpGet("templates/download-template")]
        [AllowAnonymous]
        public IActionResult DownloadTemplateExcel([FromServices] IExcelImportService excelService)
        {
            try
            {
                var fileBytes = excelService.GenerateTemplateExcelTemplate();
                var fileName = $"MauBaoTri_Template_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Tải file Excel mẫu cho Template Items (Các bước kiểm tra)
        /// </summary>
        [HttpGet("templates/download-items-template")]
        [AllowAnonymous]
        public IActionResult DownloadTemplateItemsExcel([FromServices] IExcelImportService excelService)
        {
            try
            {
                var fileBytes = excelService.GenerateTemplateItemsExcelTemplate();
                var fileName = $"MauBaoTri_CacBuocKiemTra_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Import Template Items (Các bước kiểm tra) vào mẫu bảo trì có sẵn
        /// </summary>
        [HttpPost("templates/{templateId}/import-items")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> ImportTemplateItemsFromExcel(
            int templateId,
            IFormFile file,
            [FromServices] IExcelImportService excelService)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(ApiResponse.ErrorResponse("Vui lòng chọn file Excel để import"));
                }

                if (!file.FileName.EndsWith(".xlsx") && !file.FileName.EndsWith(".xls"))
                {
                    return BadRequest(ApiResponse.ErrorResponse("File phải có định dạng Excel (.xlsx hoặc .xls)"));
                }

                var template = await _templateService.GetTemplateByIdAsync(templateId);
                if (template == null)
                {
                    return NotFound(ApiResponse.ErrorResponse($"Không tìm thấy mẫu bảo trì với ID {templateId}"));
                }

                using var stream = file.OpenReadStream();
                var itemRequests = await excelService.ImportTemplateItemsFromExcelAsync(stream);

                if (itemRequests == null || !itemRequests.Any())
                {
                    return BadRequest(ApiResponse.ErrorResponse("Không có dữ liệu hợp lệ trong file Excel"));
                }

                var validationErrors = new List<string>();
                var rowNumber = 2;

                foreach (var itemRequest in itemRequests)
                {
                    var duplicateItem = template.TemplateItems.FirstOrDefault(item =>
                        item.StepName.Trim().Equals(itemRequest.StepName.Trim(), StringComparison.OrdinalIgnoreCase) &&
                        item.Category == itemRequest.Category &&
                        item.IsActive
                    );

                    if (duplicateItem != null)
                    {
                        validationErrors.Add(
                            $"[Dòng {rowNumber}] ❌ Bước kiểm tra TRÙNG: '{itemRequest.StepName}' đã tồn tại trong mẫu này. Vui lòng đổi tên hoặc xóa bước cũ."
                        );
                    }

                    rowNumber++;
                }

                // Nếu có lỗi validation → Dừng lại
                if (validationErrors.Any())
                {
                    var errorMessage = $"⛔ Phát hiện {validationErrors.Count} lỗi trong file Excel. Vui lòng sửa các lỗi sau và import lại:\n\n" +
                                      string.Join("\n", validationErrors);

                    return BadRequest(ApiResponse<object>.ErrorResponse(errorMessage, validationErrors));
                }

                var createdItems = new List<MaintenanceTemplateItemDTO>();
                var importErrors = new List<string>();
                rowNumber = 2;

                foreach (var itemRequest in itemRequests)
                {
                    try
                    {
                        var created = await _templateService.AddChecklistItemToTemplateAsync(templateId, itemRequest);
                        createdItems.Add(created);
                    }
                    catch (Exception ex)
                    {
                        var errorMessage = ex.InnerException?.Message ?? ex.Message;
                        importErrors.Add($"[Dòng {rowNumber}] Lỗi khi thêm bước: {errorMessage}");
                    }
                    rowNumber++;
                }

                var result = new
                {
                    SuccessCount = createdItems.Count,
                    ErrorCount = importErrors.Count,
                    CreatedItems = createdItems,
                    Errors = importErrors
                };

                if (createdItems.Any())
                {
                    return Ok(ApiResponse<object>.SuccessResponse(
                        result,
                        $"✅ Import thành công {createdItems.Count}/{itemRequests.Count} bước kiểm tra vào mẫu '{template.TemplateName}'"
                    ));
                }
                else
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Không thể import bước kiểm tra nào. Vui lòng kiểm tra lại dữ liệu.",
                        importErrors
                    ));
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Import Maintenance Templates từ Excel
        /// </summary>
        [HttpPost("templates/import")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> ImportTemplatesFromExcel(
            IFormFile file, 
            [FromServices] IExcelImportService excelService,
            [FromServices] IStageService stageService)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(ApiResponse.ErrorResponse("Vui lòng chọn file Excel để import"));
                }

                if (!file.FileName.EndsWith(".xlsx") && !file.FileName.EndsWith(".xls"))
                {
                    return BadRequest(ApiResponse.ErrorResponse("File phải có định dạng Excel (.xlsx hoặc .xls)"));
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                // Đọc file Excel
                using var stream = file.OpenReadStream();
                var templateRequests = await excelService.ImportTemplatesFromExcelAsync(stream);

                if (templateRequests == null || !templateRequests.Any())
                {
                    return BadRequest(ApiResponse.ErrorResponse("Không có dữ liệu hợp lệ trong file Excel"));
                }

                var allStages = await stageService.GetStagesAsync();
                var stageDict = allStages.ToDictionary(s => s.StageName.ToLower(), s => s);
                
                var allExistingTemplates = await _templateService.GetAllTemplatesAsync();

                var validationErrors = new List<string>();
                var rowNumber = 2; 

                foreach (var templateRequest in templateRequests)
                {
                    var currentTemplateName = templateRequest.TemplateName;
                    
                    if (!string.IsNullOrEmpty(templateRequest.StageName))
                    {
                        var stageNameLower = templateRequest.StageName.ToLower();
                        if (!stageDict.ContainsKey(stageNameLower))
                        {
                            validationErrors.Add($"[Dòng {rowNumber}] Không tìm thấy công đoạn '{templateRequest.StageName}' cho template '{currentTemplateName}'");
                            rowNumber++;
                            continue;
                        }
                        
                        var stage = stageDict[stageNameLower];
                        templateRequest.StageId = stage.StageId;
                        
                        var existingTemplate = allExistingTemplates.FirstOrDefault(t => 
                            t.StageId == stage.StageId &&
                            t.TemplateName.Trim().Equals(currentTemplateName.Trim(), StringComparison.OrdinalIgnoreCase) &&
                            t.IsActive
                        );
                        
                        if (existingTemplate != null)
                        {
                            validationErrors.Add(
                                $"[Dòng {rowNumber}] ❌ Template TRÙNG: '{currentTemplateName}' đã tồn tại trong công đoạn '{stage.StageName}' " +
                                $"(TemplateId: {existingTemplate.TemplateId}, được tạo lúc {existingTemplate.CreatedDate:dd/MM/yyyy}). " +
                                $"Vui lòng đổi tên hoặc xóa template cũ."
                            );
                        }
                    }
                    else
                    {
                        validationErrors.Add($"[Dòng {rowNumber}] Template '{currentTemplateName}' thiếu thông tin công đoạn (Stage)");
                    }
                    
                    if (templateRequest.TemplateItems != null && templateRequest.TemplateItems.Any())
                    {
                        var duplicateItems = templateRequest.TemplateItems
                            .GroupBy(item => new { 
                                StepName = item.StepName.Trim().ToLower(), 
                                Category = item.Category 
                            })
                            .Where(g => g.Count() > 1)
                            .Select(g => new { 
                                StepName = g.First().StepName, 
                                Category = g.First().Category, 
                                Count = g.Count() 
                            })
                            .ToList();

                        if (duplicateItems.Any())
                        {
                            var duplicateList = string.Join(", ", duplicateItems.Select(d => 
                                $"'{d.StepName}' ({d.Category}) xuất hiện {d.Count} lần"
                            ));
                            validationErrors.Add(
                                $"[Dòng {rowNumber}] ❌ Phát hiện các bước kiểm tra BỊ TRÙNG trong template '{currentTemplateName}': {duplicateList}. " +
                                $"Mỗi bước kiểm tra phải có tên duy nhất trong cùng loại công việc."
                            );
                        }
                    }
                    
                    rowNumber++;
                }

                if (validationErrors.Any())
                {
                    var errorMessage = $"⛔ Phát hiện {validationErrors.Count} lỗi trong file Excel. Vui lòng sửa các lỗi sau và import lại:\n\n" +
                                      string.Join("\n", validationErrors);
                    
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        errorMessage,
                        validationErrors
                    ));
                }

                var createdTemplates = new List<MaintenanceTemplateDTO>();
                var importErrors = new List<string>();
                rowNumber = 2; 

                foreach (var templateRequest in templateRequests)
                {
                    try
                    {
                        var created = await _templateService.CreateTemplateAsync(templateRequest, userId);
                        createdTemplates.Add(created);
                    }
                    catch (Exception ex)
                    {
                        var errorMessage = ex.InnerException?.Message ?? ex.Message;
                        importErrors.Add($"[Dòng {rowNumber}] Lỗi khi tạo template '{templateRequest.TemplateName}': {errorMessage}");
                    }
                    rowNumber++;
                }

                var result = new
                {
                    SuccessCount = createdTemplates.Count,
                    ErrorCount = importErrors.Count,
                    CreatedTemplates = createdTemplates,
                    Errors = importErrors
                };

                if (createdTemplates.Any())
                {
                    return Ok(ApiResponse<object>.SuccessResponse(
                        result, 
                        $"✅ Import thành công {createdTemplates.Count}/{templateRequests.Count} mẫu bảo trì"
                    ));
                }
                else
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Không thể import template nào. Vui lòng kiểm tra lại dữ liệu.",
                        importErrors  // ✅ Truyền List<string> thay vì object
                    ));
                }
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
                var plans = await _planService.GetAllPlansAsync();
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
                var plan = await _planService.GetPlanByIdAsync(planId);
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
                var plans = await _planService.GetPlansByEquipmentIdAsync(equipmentId);
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
                var plans = await _planService.GetActivePlansAsync();
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
                var plans = await _planService.GetOverduePlansAsync();
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
                var plans = await _planService.GetPlansDueWithinDaysAsync(days);
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

                var plan = await _planService.CreatePlanAsync(request, userId);
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
                var plan = await _planService.UpdatePlanAsync(planId, request);
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
                await _planService.DeletePlanAsync(planId);
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
                var workOrders = await _workOrderService.GetAllWorkOrdersAsync();
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
                var workOrder = await _workOrderService.GetWorkOrderByIdAsync(workOrderId);
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
                var workOrders = await _workOrderService.GetWorkOrdersByPlanIdAsync(planId);
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

                var workOrders = await _workOrderService.GetWorkOrdersByTechnicianAsync(userId);
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
                var workOrders = await _workOrderService.GetWorkOrdersByTechnicianAsync(technicianId);
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
                var workOrders = await _workOrderService.GetPendingWorkOrdersAsync();
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

                var workOrder = await _workOrderService.CreateWorkOrderAsync(request, userId);
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

                var workOrder = await _workOrderService.UpdateWorkOrderAsync(workOrderId, request, userId);
                
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
                var workOrder = await _workOrderService.AssignTechniciansAsync(
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

                var workOrder = await _workOrderService.StartWorkOrderAsync(workOrderId, userId);
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

                var workOrder = await _workOrderService.CompleteWorkOrderAsync(workOrderId, request, userId);
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
        /// Đóng phiếu bảo trì sau khi kiểm tra và quyết toán (TechManager)
        /// Chỉ khi Close thì mới reset chu kỳ bảo trì tiếp theo
        /// Completed → Closed
        /// </summary>
        [HttpPost("work-orders/{workOrderId}/close")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> CloseWorkOrder(int workOrderId, [FromBody] CloseWorkOrderRequest? request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var workOrder = await _workOrderService.CloseWorkOrderAsync(workOrderId, userId, request?.Notes);
                return Ok(ApiResponse<MaintenanceWorkOrderDTO>.SuccessResponse(
                    workOrder, 
                    "Đóng phiếu bảo trì thành công - Chu kỳ tiếp theo đã được cập nhật"
                ));
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
                var workOrder = await _workOrderService.CancelWorkOrderAsync(workOrderId, request.Reason);
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
        /// Hoãn phiếu bảo trì (TechManager) - Chỉ cho phép khi Pending hoặc đã giao việc nhưng chưa ai làm
        /// </summary>
        [HttpPost("work-orders/{workOrderId}/postpone")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> PostponeWorkOrder(int workOrderId, [FromBody] PostponeWorkOrderRequest request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(ApiResponse.ErrorResponse("Không xác định được người dùng"));
                }

                var workOrder = await _workOrderService.PostponeWorkOrderAsync(workOrderId, request, userId);
                return Ok(ApiResponse<MaintenanceWorkOrderDTO>.SuccessResponse(workOrder, "Hoãn phiếu bảo trì thành công"));
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
                await _workOrderService.DeleteWorkOrderAsync(workOrderId);
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

                var item = await _workOrderService.UpdateChecklistItemAsync(checklistId, request, userId);
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
                var item = await _workOrderService.AddChecklistItemAsync(workOrderId, request);
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
                await _workOrderService.DeleteChecklistItemAsync(checklistId);
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
                var technicians = await _workOrderService.GetAllTechniciansAsync();
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
                var technicians = await _workOrderService.GetMechanicalTechniciansAsync();
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
                var technicians = await _workOrderService.GetElectricalTechniciansAsync();
                return Ok(ApiResponse<IEnumerable<TechnicianDTO>>.SuccessResponse(technicians, "Lấy danh sách kỹ thuật viên điện thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Đếm số công việc đã giao cho các KTV trong một ngày cụ thể
        /// </summary>
        [HttpGet("technicians/workload")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> GetTechniciansWorkloadByDate([FromQuery] DateTime date)
        {
            try
            {
                var workload = await _workOrderService.GetTechniciansWorkloadByDateAsync(date);
                return Ok(ApiResponse<IEnumerable<TechnicianWorkloadDTO>>.SuccessResponse(workload, "Lấy thống kê công việc theo KTV thành công"));
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
                var stats = await _workOrderService.GetStatisticsAsync();
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
                var upcoming = await _planService.GetUpcomingMaintenanceAsync(days);
                return Ok(ApiResponse<IEnumerable<MaintenancePlanDTO>>.SuccessResponse(upcoming, $"Lấy danh sách bảo trì sắp đến hạn trong {days} ngày thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        // ===== BACKGROUND TASKS / SCHEDULED JOBS =====

        /// <summary>
        /// [BACKGROUND JOB] Gửi thông báo nhắc QLKT đóng phiếu bảo trì đã hoàn thành quá 24h
        /// Chạy định kỳ mỗi 6 giờ
        /// </summary>
        [HttpPost("background/send-completed-reminders")]
        [Authorize(Roles = "Quản trị viên")]
        public async Task<IActionResult> SendCompletedWorkOrderReminders()
        {
            try
            {
                await _workOrderService.SendCompletedWorkOrderRemindersAsync();
                return Ok(ApiResponse<object>.SuccessResponse(new { }, "Đã gửi thông báo nhắc đóng phiếu bảo trì thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// [BACKGROUND JOB] Cập nhật trạng thái quá hạn cho các công việc
        /// Chạy định kỳ mỗi ngày
        /// </summary>
        [HttpPost("background/update-overdue-status")]
        [Authorize(Roles = "Quản trị viên")]
        public async Task<IActionResult> UpdateOverdueStatus()
        {
            try
            {
                await _workOrderService.UpdateOverdueStatusAsync();
                return Ok(ApiResponse<object>.SuccessResponse(new { }, "Đã cập nhật trạng thái quá hạn thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// [BACKGROUND JOB] Gửi thông báo nhắc bảo trì sắp đến hạn
        /// Chạy định kỳ mỗi ngày
        /// </summary>
        [HttpPost("background/send-maintenance-reminders")]
        [Authorize(Roles = "Quản trị viên")]
        public async Task<IActionResult> SendMaintenanceReminders()
        {
            try
            {
                await _workOrderService.SendMaintenanceRemindersAsync();
                return Ok(ApiResponse<object>.SuccessResponse(new { }, "Đã gửi thông báo nhắc bảo trì thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }
    }
}
