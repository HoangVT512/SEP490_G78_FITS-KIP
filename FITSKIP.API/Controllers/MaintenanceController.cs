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

        /// <summary>
        /// Tải file Excel mẫu cho Maintenance Template
        /// </summary>
        [HttpGet("templates/download-template")]
        [AllowAnonymous] // ✅ CHO PHÉP DOWNLOAD MÀ KHÔNG CẦN ĐĂNG NHẬP
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

                // Lấy danh sách stages để resolve StageName -> StageId
                var allStages = await stageService.GetStagesAsync();
                var stageDict = allStages.ToDictionary(s => s.StageName.ToLower(), s => s);
                
                // Lấy tất cả templates hiện có trong database
                var allExistingTemplates = await _maintenanceService.GetAllTemplatesAsync();

                var validationErrors = new List<string>();
                var rowNumber = 2; // Bắt đầu từ dòng 2 (dòng 1 là header)

                // ✅ BƯỚC 1: VALIDATE TOÀN BỘ FILE EXCEL TRƯỚC KHI IMPORT
                foreach (var templateRequest in templateRequests)
                {
                    var currentTemplateName = templateRequest.TemplateName;
                    
                    // Validate: StageName phải tồn tại
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
                        
                        // ✅ CHECK TRÙNG TEMPLATE: So sánh với templates hiện có trong DB
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
                    
                    // ✅ CHECK TRÙNG ITEM TRONG CÙNG TEMPLATE
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
                    
                    // ✅ Sửa: Tạo object riêng để trả về với ApiResponse<object>
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        errorMessage,
                        validationErrors  // ✅ Truyền List<string> vào parameter thứ 2
                    ));
                }

                // ✅ BƯỚC 2: NẾU KHÔNG CÓ LỖI → TIẾN HÀNH IMPORT
                var createdTemplates = new List<MaintenanceTemplateDTO>();
                var importErrors = new List<string>();
                rowNumber = 2; // Reset row number

                foreach (var templateRequest in templateRequests)
                {
                    try
                    {
                        var created = await _maintenanceService.CreateTemplateAsync(templateRequest, userId);
                        createdTemplates.Add(created);
                    }
                    catch (Exception ex)
                    {
                        importErrors.Add($"[Dòng {rowNumber}] Lỗi khi tạo template '{templateRequest.TemplateName}': {ex.Message}");
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
        /// Tải file Excel mẫu cho Maintenance Plan (Chu kỳ bảo trì)
        /// </summary>
        [HttpGet("plans/download-template")]
        [AllowAnonymous]
        public IActionResult DownloadMaintenancePlanExcel([FromServices] IExcelImportService excelService)
        {
            try
            {
                var fileBytes = excelService.GenerateMaintenancePlanExcelTemplate();
                var fileName = $"ChuKyBaoTri_Template_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                
                return File(fileBytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }

        /// <summary>
        /// Import Maintenance Plans (Chu kỳ bảo trì) từ Excel
        /// </summary>
        [HttpPost("plans/import")]
        [Authorize(Roles = "Quản trị viên,Quản lý kỹ thuật")]
        public async Task<IActionResult> ImportMaintenancePlansFromExcel(
            IFormFile file,
            [FromServices] IExcelImportService excelService,
            [FromServices] IEquipmentService equipmentService)
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
                var planRequests = await excelService.ImportMaintenancePlansFromExcelAsync(stream);

                if (planRequests == null || !planRequests.Any())
                {
                    return BadRequest(ApiResponse.ErrorResponse("Không có dữ liệu hợp lệ trong file Excel"));
                }

                // Lấy danh sách Equipment, Template, User để resolve code -> ID
                var allEquipments = await equipmentService.GetEquipmentsAsync();
                var equipmentDict = allEquipments.ToDictionary(e => e.EquipmentCode.ToLower(), e => e);

                var allTemplates = await _maintenanceService.GetAllTemplatesAsync();
                var templateDict = allTemplates
                    .Where(t => !string.IsNullOrEmpty(t.InspectionCode))
                    .ToDictionary(t => t.InspectionCode!.ToLower(), t => t);

                var allTechnicians = await _maintenanceService.GetAllTechniciansAsync();
                var technicianDict = allTechnicians.ToDictionary(t => t.EmployeeCode.ToLower(), t => t);

                // Lấy tất cả plans hiện có để check trùng
                var allExistingPlans = await _maintenanceService.GetAllPlansAsync();

                var validationErrors = new List<string>();
                var rowNumber = 2; // Bắt đầu từ dòng 2

                // ✅ BƯỚC 1: VALIDATE TOÀN BỘ FILE EXCEL TRƯỚC KHI IMPORT
                foreach (var planRequest in planRequests)
                {
                    // Validate: EquipmentCode phải tồn tại
                    if (!string.IsNullOrEmpty(planRequest.EquipmentCode))
                    {
                        var equipmentCodeLower = planRequest.EquipmentCode.ToLower();
                        if (!equipmentDict.ContainsKey(equipmentCodeLower))
                        {
                            validationErrors.Add($"[Dòng {rowNumber}] Không tìm thấy thiết bị '{planRequest.EquipmentCode}'");
                            rowNumber++;
                            continue;
                        }

                        var equipment = equipmentDict[equipmentCodeLower];
                        planRequest.EquipmentId = equipment.EquipmentId;

                        // Validate: TemplateCode phải tồn tại
                        if (!string.IsNullOrEmpty(planRequest.TemplateCode))
                        {
                            var templateCodeLower = planRequest.TemplateCode.ToLower();
                            if (!templateDict.ContainsKey(templateCodeLower))
                            {
                                validationErrors.Add($"[Dòng {rowNumber}] Không tìm thấy mẫu bảo trì '{planRequest.TemplateCode}'");
                                rowNumber++;
                                continue;
                            }

                            var template = templateDict[templateCodeLower];
                            planRequest.TemplateId = template.TemplateId;

                            // ✅ CHECK TRÙNG CHU KỲ BẢO TRÌ
                            var duplicatePlan = allExistingPlans.FirstOrDefault(p =>
                                p.EquipmentId == equipment.EquipmentId &&
                                p.TemplateId == template.TemplateId &&
                                p.IntervalType == planRequest.IntervalType &&
                                p.IntervalValue == planRequest.IntervalValue &&
                                p.IsActive
                            );

                            if (duplicatePlan != null)
                            {
                                validationErrors.Add(
                                    $"[Dòng {rowNumber}] ❌ Chu kỳ TRÙNG: Thiết bị '{equipment.EquipmentCode}' đã có chu kỳ bảo trì " +
                                    $"{planRequest.IntervalValue} {planRequest.IntervalType} với mẫu '{template.TemplateName}' " +
                                    $"(PlanId: {duplicatePlan.PlanId}, được tạo lúc {duplicatePlan.CreatedDate:dd/MM/yyyy}). " +
                                    $"Vui lòng kiểm tra lại hoặc xóa chu kỳ cũ."
                                );
                            }
                        }
                        else
                        {
                            validationErrors.Add($"[Dòng {rowNumber}] Thiết bị '{planRequest.EquipmentCode}' thiếu mã mẫu bảo trì");
                        }

                        // Resolve Technician Codes
                        if (!string.IsNullOrEmpty(planRequest.ElectricalTechCode))
                        {
                            var techCodeLower = planRequest.ElectricalTechCode.ToLower();
                            if (technicianDict.ContainsKey(techCodeLower))
                            {
                                planRequest.AssignedToElectrical = technicianDict[techCodeLower].UserId;
                            }
                            else
                            {
                                validationErrors.Add($"[Dòng {rowNumber}] Không tìm thấy KTV Điện '{planRequest.ElectricalTechCode}'");
                            }
                        }

                        if (!string.IsNullOrEmpty(planRequest.MechanicalTechCode))
                        {
                            var techCodeLower = planRequest.MechanicalTechCode.ToLower();
                            if (technicianDict.ContainsKey(techCodeLower))
                            {
                                planRequest.AssignedToMechanical = technicianDict[techCodeLower].UserId;
                            }
                            else
                            {
                                validationErrors.Add($"[Dòng {rowNumber}] Không tìm thấy KTV Cơ '{planRequest.MechanicalTechCode}'");
                            }
                        }
                    }
                    else
                    {
                        validationErrors.Add($"[Dòng {rowNumber}] Thiếu mã thiết bị");
                    }

                    rowNumber++;
                }

                // ✅ NẾU CÓ LỖI VALIDATION → DỪNG LẠI
                if (validationErrors.Any())
                {
                    var errorMessage = $"⛔ Phát hiện {validationErrors.Count} lỗi trong file Excel. Vui lòng sửa các lỗi sau và import lại:\n\n" +
                                      string.Join("\n", validationErrors);

                    return BadRequest(ApiResponse<object>.ErrorResponse(errorMessage, validationErrors));
                }

                // ✅ BƯỚC 2: NẾU KHÔNG CÓ LỖI → TIẾN HÀNH IMPORT
                var createdPlans = new List<MaintenancePlanDTO>();
                var importErrors = new List<string>();
                rowNumber = 2;

                foreach (var planRequest in planRequests)
                {
                    try
                    {
                        var created = await _maintenanceService.CreatePlanAsync(planRequest, userId);
                        createdPlans.Add(created);
                    }
                    catch (Exception ex)
                    {
                        importErrors.Add($"[Dòng {rowNumber}] Lỗi khi tạo chu kỳ: {ex.Message}");
                    }
                    rowNumber++;
                }

                var result = new
                {
                    SuccessCount = createdPlans.Count,
                    ErrorCount = importErrors.Count,
                    CreatedPlans = createdPlans,
                    Errors = importErrors
                };

                if (createdPlans.Any())
                {
                    return Ok(ApiResponse<object>.SuccessResponse(
                        result,
                        $"✅ Import thành công {createdPlans.Count}/{planRequests.Count} chu kỳ bảo trì"
                    ));
                }
                else
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Không thể import chu kỳ nào. Vui lòng kiểm tra lại dữ liệu.",
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
                return Ok(ApiResponse<IEnumerable<MaintenancePlanDTO>>.SuccessResponse(upcoming, $"Lấy danh sách bảo trì sắp đến hạn trong {days} ngày thành công"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"Lỗi: {ex.Message}"));
            }
        }
    }
}
