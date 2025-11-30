using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Services
{
    public class MaintenanceTemplateService : IMaintenanceTemplateService
    {
        private readonly IMaintenanceTemplateRepository _templateRepository;
        private readonly IMaintenanceTemplateItemRepository _templateItemRepository;
        private readonly IMaintenancePlanRepository _planRepository;
        private readonly IStageRepository _stageRepository;

        public MaintenanceTemplateService(
            IMaintenanceTemplateRepository templateRepository,
            IMaintenanceTemplateItemRepository templateItemRepository,
            IMaintenancePlanRepository planRepository,
            IStageRepository stageRepository)
        {
            _templateRepository = templateRepository;
            _templateItemRepository = templateItemRepository;
            _planRepository = planRepository;
            _stageRepository = stageRepository;
        }

        // ===== MAINTENANCE TEMPLATE MANAGEMENT =====
        
        public async Task<IEnumerable<MaintenanceTemplateDTO>> GetAllTemplatesAsync()
        {
            var templates = await _templateRepository.GetAllAsync();
            return templates.Select(MapTemplateToDTO);
        }

        public async Task<MaintenanceTemplateDTO?> GetTemplateByIdAsync(int templateId)
        {
            var template = await _templateRepository.GetByIdAsync(templateId);
            return template == null ? null : MapTemplateToDTO(template);
        }

        public async Task<IEnumerable<MaintenanceTemplateDTO>> GetTemplatesByStageIdAsync(int stageId)
        {
            var templates = await _templateRepository.GetByStageIdAsync(stageId);
            return templates.Select(MapTemplateToDTO);
        }

        public async Task<MaintenanceTemplateDTO> CreateTemplateAsync(CreateMaintenanceTemplateRequest request, string userId)
        {
            // Validate Stage exists
            var stage = await _stageRepository.GetByIdAsync(request.StageId);
            if (stage == null)
                throw new InvalidOperationException($"Stage not found: {request.StageId}");

            var existingTemplates = await _templateRepository.GetByStageIdAsync(request.StageId);
            var isDuplicateTemplate = existingTemplates.Any(t => 
                t.TemplateName.Trim().Equals(request.TemplateName.Trim(), StringComparison.OrdinalIgnoreCase) &&
                t.IsActive
            );
            
            if (isDuplicateTemplate)
            {
                throw new InvalidOperationException(
                    $"Template với tên '{request.TemplateName}' đã tồn tại trong công đoạn '{stage.StageName}'. " +
                    $"Vui lòng sử dụng tên khác hoặc cập nhật template hiện có."
                );
            }

            if (request.TemplateItems != null && request.TemplateItems.Any())
            {
                var duplicateItems = request.TemplateItems
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
                        $"'{d.StepName}' ({d.Category}) x{d.Count}"
                    ));
                    throw new InvalidOperationException(
                        $"Phát hiện các bước kiểm tra bị trùng lặp: {duplicateList}. " +
                        $"Mỗi bước kiểm tra phải có tên duy nhất trong cùng loại công việc (Electrical/Mechanical)."
                    );
                }
            }

            var template = new MaintenanceTemplate
            {
                StageId = request.StageId,
                TemplateName = request.TemplateName,
                Description = request.Description,
                IsActive = true,
                CreatedDate = DateTime.Now,
                CreatedBy = userId
            };

            var created = await _templateRepository.CreateAsync(template);

            // Create template items
            if (request.TemplateItems != null && request.TemplateItems.Any())
            {
                foreach (var item in request.TemplateItems)
                {
                    var templateItem = new MaintenanceTemplateItem
                    {
                        TemplateId = created.TemplateId,
                        Category = item.Category,
                        OrderIndex = item.OrderIndex,
                        StepName = item.StepName,
                        StepDescription = item.StepDescription,
                        IsRequired = item.IsRequired,
                        RequiredRole = item.RequiredRole,
                        IsActive = true
                    };
                    await _templateItemRepository.CreateAsync(templateItem);
                }
            }

            var result = await _templateRepository.GetByIdAsync(created.TemplateId);
            return MapTemplateToDTO(result!);
        }

        public async Task<MaintenanceTemplateDTO> UpdateTemplateAsync(int templateId, UpdateMaintenanceTemplateRequest request, string userId)
        {
            var template = await _templateRepository.GetByIdAsync(templateId);
            if (template == null)
                throw new InvalidOperationException($"Template not found: {templateId}");

            // ✅ STAGE KHÔNG THỂ THAY ĐỔI - Template Stage là bất biến sau khi tạo
            // Không cần validate vì UpdateRequest không có StageId

            if (!template.TemplateName.Equals(request.TemplateName, StringComparison.OrdinalIgnoreCase))
            {
                var existingTemplates = await _templateRepository.GetByStageIdAsync(template.StageId);
                var isDuplicateTemplate = existingTemplates.Any(t => 
                    t.TemplateId != templateId && 
                    t.TemplateName.Trim().Equals(request.TemplateName.Trim(), StringComparison.OrdinalIgnoreCase) &&
                    t.IsActive
                );
                
                if (isDuplicateTemplate)
                {
                    var stage = await _stageRepository.GetByIdAsync(template.StageId);
                    throw new InvalidOperationException(
                        $"Template với tên '{request.TemplateName}' đã tồn tại trong công đoạn '{stage?.StageName}'. " +
                        $"Vui lòng sử dụng tên khác hoặc cập nhật template hiện có."
                    );
                }
            }
            
            // ✅ KHÔNG CẬP NHẬT StageId - Stage là bất biến
            template.TemplateName = request.TemplateName;
            template.Description = request.Description;
            template.IsActive = request.IsActive;
            template.UpdatedDate = DateTime.Now;
            template.UpdatedBy = userId;

            await _templateRepository.UpdateAsync(template);

            await _templateItemRepository.DeleteByTemplateIdAsync(templateId);
            
            if (request.TemplateItems != null && request.TemplateItems.Any())
            {
                foreach (var item in request.TemplateItems)
                {
                    var templateItem = new MaintenanceTemplateItem
                    {
                        TemplateId = templateId,
                        Category = item.Category,
                        OrderIndex = item.OrderIndex,
                        StepName = item.StepName,
                        StepDescription = item.StepDescription,
                        IsRequired = item.IsRequired,
                        RequiredRole = item.RequiredRole,
                        IsActive = true
                    };
                    await _templateItemRepository.CreateAsync(templateItem);
                }
            }

            var result = await _templateRepository.GetByIdAsync(templateId);
            return MapTemplateToDTO(result!);
        }

        public async Task DeleteTemplateAsync(int templateId)
        {
            var template = await _templateRepository.GetByIdAsync(templateId);
            if (template == null)
                throw new InvalidOperationException($"Template not found: {templateId}");

            // ✅ VALIDATION: Kiểm tra template có đang được sử dụng bởi maintenance plan không
            var plansUsingTemplate = await _planRepository.GetAllAsync();
            var activePlansWithTemplate = plansUsingTemplate.Where(p => 
                p.TemplateId == templateId && p.IsActive
            ).ToList();
            
            if (activePlansWithTemplate.Any())
            {
                var planList = string.Join(", ", activePlansWithTemplate.Select(p => 
                    $"PLAN{p.PlanId:D3} - {p.Equipment?.EquipmentName ?? "N/A"}"
                ));
                
                throw new InvalidOperationException(
                    $"❌ Không thể xóa mẫu bảo trì '{template.TemplateName}' vì đang được sử dụng bởi {activePlansWithTemplate.Count} chu kỳ bảo trì: {planList}. " +
                    $"Vui lòng ngưng hoạt động các chu kỳ này trước."
                );
            }

            await _templateItemRepository.DeleteByTemplateIdAsync(templateId);
            await _templateRepository.DeleteAsync(templateId);
        }

        public async Task<MaintenanceTemplateItemDTO> AddChecklistItemToTemplateAsync(int templateId, CreateTemplateItemRequest request)
        {
            var template = await _templateRepository.GetByIdAsync(templateId);
            if (template == null)
                throw new InvalidOperationException($"Không tìm thấy mẫu bảo trì với ID {templateId}");

            var templateItem = new MaintenanceTemplateItem
            {
                TemplateId = templateId,
                Category = request.Category,
                OrderIndex = request.OrderIndex,
                StepName = request.StepName,
                StepDescription = request.StepDescription,
                IsRequired = request.IsRequired,
                RequiredRole = request.RequiredRole,
                IsActive = true
            };

            var created = await _templateItemRepository.CreateAsync(templateItem);
            return MapTemplateItemToDTO(created);
        }

        // ===== HELPER METHODS =====
        
        private MaintenanceTemplateDTO MapTemplateToDTO(MaintenanceTemplate template)
        {
            // ✅ Kiểm tra template có đang được sử dụng bởi maintenance plan đang hoạt động không
            var activePlansCount = template.MaintenancePlans?.Count(p => p.IsActive) ?? 0;
            // ✅ Stage luôn readonly sau khi template được tạo
            var isInUse = true; // Luôn readonly để không cho đổi stage
            
            return new MaintenanceTemplateDTO
            {
                TemplateId = template.TemplateId,
                StageId = template.StageId,
                StageName = template.Stage?.StageName ?? "",
                LineName = template.Stage?.Line?.LineName ?? "",
                TemplateName = template.TemplateName,
                Description = template.Description,
                IsActive = template.IsActive,
                CreatedDate = template.CreatedDate,
                CreatedByName = template.CreatedByUser?.FullName,
                TemplateItems = template.TemplateItems?.Select(ti => new MaintenanceTemplateItemDTO
                {
                    ItemId = ti.ItemId,
                    TemplateId = ti.TemplateId,
                    Category = ti.Category,
                    OrderIndex = ti.OrderIndex,
                    StepName = ti.StepName,
                    StepDescription = ti.StepDescription,
                    IsRequired = ti.IsRequired,
                    RequiredRole = ti.RequiredRole,
                    IsActive = ti.IsActive
                }).OrderBy(ti => ti.OrderIndex).ToList() ?? new List<MaintenanceTemplateItemDTO>(),
                IsInUse = isInUse,
                ActivePlansCount = activePlansCount
            };
        }

        private static MaintenanceTemplateItemDTO MapTemplateItemToDTO(MaintenanceTemplateItem item)
        {
            return new MaintenanceTemplateItemDTO
            {
                ItemId = item.ItemId,
                TemplateId = item.TemplateId,
                Category = item.Category,
                OrderIndex = item.OrderIndex,
                StepName = item.StepName,
                StepDescription = item.StepDescription,
                IsRequired = item.IsRequired,
                RequiredRole = item.RequiredRole,
                IsActive = item.IsActive
            };
        }
    }
}
