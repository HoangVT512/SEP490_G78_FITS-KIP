using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.EntityFrameworkCore;

namespace FITSKIP.Application.Services
{
    public class MaintenanceService : IMaintenanceService
    {
        private readonly IMaintenanceTemplateRepository _templateRepository;
        private readonly IMaintenanceTemplateItemRepository _templateItemRepository;
        private readonly IMaintenancePlanRepository _planRepository;
        private readonly IMaintenanceWorkOrderRepository _workOrderRepository;
        private readonly IMaintenanceChecklistItemRepository _checklistRepository;
        private readonly IEquipmentRepository _equipmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly IStageRepository _stageRepository;
        private readonly INotificationService _notificationService;
        private readonly INotificationHubService _notificationHubService;

        public MaintenanceService(
            IMaintenanceTemplateRepository templateRepository,
            IMaintenanceTemplateItemRepository templateItemRepository,
            IMaintenancePlanRepository planRepository,
            IMaintenanceWorkOrderRepository workOrderRepository,
            IMaintenanceChecklistItemRepository checklistRepository,
            IEquipmentRepository equipmentRepository,
            IUserRepository userRepository,
            IStageRepository stageRepository,
            INotificationService notificationService,
            INotificationHubService notificationHubService)
        {
            _templateRepository = templateRepository;
            _templateItemRepository = templateItemRepository;
            _planRepository = planRepository;
            _workOrderRepository = workOrderRepository;
            _checklistRepository = checklistRepository;
            _equipmentRepository = equipmentRepository;
            _userRepository = userRepository;
            _stageRepository = stageRepository;
            _notificationService = notificationService;
            _notificationHubService = notificationHubService;
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

            var template = new MaintenanceTemplate
            {
                StageId = request.StageId,
                TemplateName = request.TemplateName,
                Description = request.Description,
                InspectionCode = request.InspectionCode,
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

            template.TemplateName = request.TemplateName;
            template.Description = request.Description;
            template.InspectionCode = request.InspectionCode;
            template.IsActive = request.IsActive;
            template.UpdatedDate = DateTime.Now;
            template.UpdatedBy = userId;

            await _templateRepository.UpdateAsync(template);

            // Update template items - delete old and create new
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

            await _templateItemRepository.DeleteByTemplateIdAsync(templateId);
            await _templateRepository.DeleteAsync(templateId);
        }

        // ===== MAINTENANCE PLAN MANAGEMENT =====
        
        public async Task<IEnumerable<MaintenancePlanDTO>> GetAllPlansAsync()
        {
            var plans = await _planRepository.GetAllAsync();
            return plans.Select(MapPlanToDTO);
        }

        public async Task<MaintenancePlanDTO?> GetPlanByIdAsync(int planId)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            return plan == null ? null : MapPlanToDTO(plan);
        }

        public async Task<IEnumerable<MaintenancePlanDTO>> GetPlansByEquipmentIdAsync(int equipmentId)
        {
            var plans = await _planRepository.GetByEquipmentIdAsync(equipmentId);
            return plans.Select(MapPlanToDTO);
        }

        public async Task<IEnumerable<MaintenancePlanDTO>> GetActivePlansAsync()
        {
            var plans = await _planRepository.GetActiveAsync();
            return plans.Select(MapPlanToDTO);
        }

        public async Task<IEnumerable<MaintenancePlanDTO>> GetOverduePlansAsync()
        {
            var plans = await _planRepository.GetOverdueAsync();
            return plans.Select(MapPlanToDTO);
        }

        public async Task<IEnumerable<MaintenancePlanDTO>> GetPlansDueWithinDaysAsync(int days)
        {
            var plans = await _planRepository.GetDueWithinDaysAsync(days);
            return plans.Select(MapPlanToDTO);
        }

        public async Task<MaintenancePlanDTO> CreatePlanAsync(CreateMaintenancePlanRequest request, string userId)
        {
            var equipment = await _equipmentRepository.GetByIdAsync(request.EquipmentId);
            if (equipment == null)
                throw new InvalidOperationException($"Equipment not found: {request.EquipmentId}");

            // Validate template if provided
            if (request.TemplateId.HasValue)
            {
                var template = await _templateRepository.GetByIdAsync(request.TemplateId.Value);
                if (template == null)
                    throw new InvalidOperationException($"Template not found: {request.TemplateId}");
            }

            // Validate technicians if assigned - must have EmployeeCode
            if (!string.IsNullOrEmpty(request.AssignedToElectrical))
            {
                var tech = await _userRepository.GetUserByIdAsync(request.AssignedToElectrical);
                if (tech == null)
                    throw new InvalidOperationException($"Electrical technician not found: {request.AssignedToElectrical}");
                if (string.IsNullOrEmpty(tech.EmployeeCode))
                    throw new InvalidOperationException($"Electrical technician must have EmployeeCode");
            }

            if (!string.IsNullOrEmpty(request.AssignedToMechanical))
            {
                var tech = await _userRepository.GetUserByIdAsync(request.AssignedToMechanical);
                if (tech == null)
                    throw new InvalidOperationException($"Mechanical technician not found: {request.AssignedToMechanical}");
                if (string.IsNullOrEmpty(tech.EmployeeCode))
                    throw new InvalidOperationException($"Mechanical technician must have EmployeeCode");
            }

            var nextDueDate = CalculateNextDueDate(request.StartDate, request.IntervalType, request.IntervalValue);

            var plan = new MaintenancePlan
            {
                EquipmentId = request.EquipmentId,
                TemplateId = request.TemplateId,
                IntervalType = request.IntervalType,
                IntervalValue = request.IntervalValue,
                StartDate = request.StartDate,
                NextDueDate = nextDueDate,
                AssignedToElectrical = request.AssignedToElectrical,
                AssignedToMechanical = request.AssignedToMechanical,
                CreatedBy = userId,
                CreatedDate = DateTime.Now,
                IsActive = true,
                Status = "Pending"
            };

            var created = await _planRepository.CreateAsync(plan);
            
            // Send notifications to assigned technicians
            await SendPlanAssignmentNotifications(created);

            var result = await _planRepository.GetByIdAsync(created.PlanId);
            return MapPlanToDTO(result!);
        }

        public async Task<MaintenancePlanDTO> UpdatePlanAsync(int planId, UpdateMaintenancePlanRequest request)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            if (plan == null)
                throw new InvalidOperationException($"Plan not found: {planId}");

            if (request.TemplateId.HasValue)
            {
                var template = await _templateRepository.GetByIdAsync(request.TemplateId.Value);
                if (template == null)
                    throw new InvalidOperationException($"Template not found: {request.TemplateId}");
                plan.TemplateId = request.TemplateId;
            }

            plan.IntervalType = request.IntervalType;
            plan.IntervalValue = request.IntervalValue;
            
            if (request.NextDueDate.HasValue)
                plan.NextDueDate = request.NextDueDate.Value;

            // Validate new technicians if assigned
            if (!string.IsNullOrEmpty(request.AssignedToElectrical) && request.AssignedToElectrical != plan.AssignedToElectrical)
            {
                var tech = await _userRepository.GetUserByIdAsync(request.AssignedToElectrical);
                if (tech == null)
                    throw new InvalidOperationException($"Electrical technician not found: {request.AssignedToElectrical}");
                if (string.IsNullOrEmpty(tech.EmployeeCode))
                    throw new InvalidOperationException($"Electrical technician must have EmployeeCode");
            }

            if (!string.IsNullOrEmpty(request.AssignedToMechanical) && request.AssignedToMechanical != plan.AssignedToMechanical)
            {
                var tech = await _userRepository.GetUserByIdAsync(request.AssignedToMechanical);
                if (tech == null)
                    throw new InvalidOperationException($"Mechanical technician not found: {request.AssignedToMechanical}");
                if (string.IsNullOrEmpty(tech.EmployeeCode))
                    throw new InvalidOperationException($"Mechanical technician must have EmployeeCode");
            }

            var oldElectrical = plan.AssignedToElectrical;
            var oldMechanical = plan.AssignedToMechanical;

            plan.AssignedToElectrical = request.AssignedToElectrical;
            plan.AssignedToMechanical = request.AssignedToMechanical;
            plan.IsActive = request.IsActive;

            await _planRepository.UpdateAsync(plan);

            // Send notifications if technicians changed
            if (oldElectrical != request.AssignedToElectrical || oldMechanical != request.AssignedToMechanical)
            {
                await SendPlanAssignmentNotifications(plan);
            }

            var result = await _planRepository.GetByIdAsync(planId);
            return MapPlanToDTO(result!);
        }

        public async Task DeletePlanAsync(int planId)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            if (plan == null)
                throw new InvalidOperationException($"Plan not found: {planId}");

            // Delete all work orders
            var workOrders = await _workOrderRepository.GetByPlanIdAsync(planId);
            foreach (var wo in workOrders)
            {
                await _checklistRepository.DeleteByWorkOrderIdAsync(wo.WorkOrderId);
                await _workOrderRepository.DeleteAsync(wo.WorkOrderId);
            }

            await _planRepository.DeleteAsync(planId);
        }

        public async Task<MaintenancePlanDTO> PostponeMaintenancePlanAsync(int planId, PostponeMaintenancePlanRequest request, string userId)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            if (plan == null)
                throw new InvalidOperationException($"Plan not found: {planId}");

            // GIỮ NGUYÊN NextDueDate (ngày gốc)
            // Tính ngày đến hạn mới SAU KHI hoãn
            var currentDueDate = plan.PostponedDueDate ?? plan.NextDueDate;
            plan.PostponedDueDate = currentDueDate.AddDays(request.PostponeDays);
            
            // Lưu lý do hoãn và ngày hoãn
            plan.PostponedReason = request.Reason;
            plan.PostponedDate = DateTime.Now;
            plan.Status = "Postponed";
            
            await _planRepository.UpdateAsync(plan);

            // Gửi thông báo cho kỹ thuật viên về việc hoãn
            if (!string.IsNullOrEmpty(plan.AssignedToElectrical))
            {
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = plan.AssignedToElectrical,
                    Title = "Bảo trì bị hoãn",
                    Message = $"Bảo trì thiết bị {plan.Equipment?.EquipmentName} đã được hoãn {request.PostponeDays} ngày. Ngày gốc: {plan.NextDueDate:dd/MM/yyyy}, Hạn mới: {plan.PostponedDueDate:dd/MM/yyyy}. Lý do: {request.Reason}"
                });
            }

            if (!string.IsNullOrEmpty(plan.AssignedToMechanical))
            {
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = plan.AssignedToMechanical,
                    Title = "Bảo trì bị hoãn",
                    Message = $"Bảo trì thiết bị {plan.Equipment?.EquipmentName} đã được hoãn {request.PostponeDays} ngày. Ngày gốc: {plan.NextDueDate:dd/MM/yyyy}, Hạn mới: {plan.PostponedDueDate:dd/MM/yyyy}. Lý do: {request.Reason}"
                });
            }

            var result = await _planRepository.GetByIdAsync(planId);
            return MapPlanToDTO(result!);
        }

        public async Task<MaintenancePlanDTO> AssignMultipleTechniciansAsync(int planId, AssignMultipleTechniciansRequest request, string userId)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            if (plan == null)
                throw new InvalidOperationException($"Plan not found: {planId}");

            // Validate all technicians
            foreach (var techItem in request.Technicians)
            {
                var tech = await _userRepository.GetUserByIdAsync(techItem.TechnicianId);
                if (tech == null)
                    throw new InvalidOperationException($"Technician not found: {techItem.TechnicianId}");
                if (string.IsNullOrEmpty(tech.EmployeeCode))
                    throw new InvalidOperationException($"Technician {tech.FullName} must have EmployeeCode");
            }

            // Create assignments
            foreach (var techItem in request.Technicians)
            {
                var assignment = new MaintenancePlanAssignment
                {
                    PlanId = planId,
                    TechnicianId = techItem.TechnicianId,
                    TechnicianType = techItem.TechnicianType,
                    AssignedBy = userId,
                    AssignedDate = DateTime.Now,
                    IsActive = true
                };
                
                await _planRepository.CreateAssignmentAsync(assignment);

                // Send notification
                var tech = await _userRepository.GetUserByIdAsync(techItem.TechnicianId);
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = techItem.TechnicianId,
                    Title = "Nhiệm vụ bảo trì mới",
                    Message = $"Bạn được phân công bảo trì {techItem.TechnicianType} cho thiết bị {plan.Equipment?.EquipmentName}. Hạn: {plan.NextDueDate:dd/MM/yyyy}"
                });
            }

            var result = await _planRepository.GetByIdAsync(planId);
            return MapPlanToDTO(result!);
        }

        public async Task RemoveTechnicianAssignmentAsync(int assignmentId)
        {
            await _planRepository.DeleteAssignmentAsync(assignmentId);
        }

        public async Task<IEnumerable<MaintenancePlanDTO>> GetUnassignedPlansNeedingAttentionAsync(int daysBeforeDue = 3)
        {
            var upcomingPlans = await _planRepository.GetDueWithinDaysAsync(daysBeforeDue);
            
            // Filter plans that have no technicians assigned
            var unassignedPlans = upcomingPlans.Where(p => 
                p.IsActive && 
                (p.Assignments == null || !p.Assignments.Any(a => a.IsActive))
            );

            return unassignedPlans.Select(MapPlanToDTO);
        }

        // ===== WORK ORDER MANAGEMENT =====
        
        public async Task<IEnumerable<MaintenanceWorkOrderDTO>> GetAllWorkOrdersAsync()
        {
            var workOrders = await _workOrderRepository.GetAllAsync();
            return workOrders.Select(MapWorkOrderToDTO);
        }

        public async Task<MaintenanceWorkOrderDTO?> GetWorkOrderByIdAsync(int workOrderId)
        {
            var workOrder = await _workOrderRepository.GetByIdAsync(workOrderId);
            return workOrder == null ? null : MapWorkOrderToDTO(workOrder);
        }

        public async Task<IEnumerable<MaintenanceWorkOrderDTO>> GetWorkOrdersByPlanIdAsync(int planId)
        {
            var workOrders = await _workOrderRepository.GetByPlanIdAsync(planId);
            return workOrders.Select(MapWorkOrderToDTO);
        }

        public async Task<IEnumerable<MaintenanceWorkOrderDTO>> GetWorkOrdersByTechnicianAsync(string technicianId)
        {
            var workOrders = await _workOrderRepository.GetByTechnicianAsync(technicianId);
            return workOrders.Select(MapWorkOrderToDTO);
        }

        public async Task<IEnumerable<MaintenanceWorkOrderDTO>> GetPendingWorkOrdersAsync()
        {
            var workOrders = await _workOrderRepository.GetByStatusAsync("Pending");
            return workOrders.Select(MapWorkOrderToDTO);
        }

        public async Task<MaintenanceWorkOrderDTO> CreateWorkOrderAsync(CreateMaintenanceWorkOrderRequest request, string userId)
        {
            var plan = await _planRepository.GetByIdAsync(request.PlanId);
            if (plan == null)
                throw new InvalidOperationException($"Plan not found: {request.PlanId}");

            var equipment = await _equipmentRepository.GetByIdAsync(plan.EquipmentId!.Value);
            if (equipment == null)
                throw new InvalidOperationException($"Equipment not found: {plan.EquipmentId}");

            // Validate assigned technicians
            if (!string.IsNullOrEmpty(request.AssignedToElectrical))
            {
                var tech = await _userRepository.GetUserByIdAsync(request.AssignedToElectrical);
                if (tech == null)
                    throw new InvalidOperationException($"Electrical technician not found: {request.AssignedToElectrical}");
                if (string.IsNullOrEmpty(tech.EmployeeCode))
                    throw new InvalidOperationException($"Electrical technician must have EmployeeCode");
            }

            if (!string.IsNullOrEmpty(request.AssignedToMechanical))
            {
                var tech = await _userRepository.GetUserByIdAsync(request.AssignedToMechanical);
                if (tech == null)
                    throw new InvalidOperationException($"Mechanical technician not found: {request.AssignedToMechanical}");
                if (string.IsNullOrEmpty(tech.EmployeeCode))
                    throw new InvalidOperationException($"Mechanical technician must have EmployeeCode");
            }

            // Generate work order code
            var workOrderCode = await _workOrderRepository.GenerateWorkOrderCodeAsync();

            var workOrder = new MaintenanceWorkOrder
            {
                WorkOrderCode = workOrderCode,
                PlanId = request.PlanId,
                EquipmentId = plan.EquipmentId.Value,
                AssignedDate = DateTime.Now,
                DueDate = request.DueDate,
                AssignedToElectrical = request.AssignedToElectrical,
                AssignedToMechanical = request.AssignedToMechanical,
                Status = "Pending",
                // ❌ REMOVED: UsageUnit, InspectionCode, RepairTime - không sử dụng
                Notes = request.Notes,
                CreatedBy = userId,
                CreatedDate = DateTime.Now
            };

            var created = await _workOrderRepository.CreateAsync(workOrder);

            // Create checklist items from template or request
            if (plan.TemplateId.HasValue)
            {
                var template = await _templateRepository.GetByIdAsync(plan.TemplateId.Value);
                if (template?.TemplateItems != null)
                {
                    foreach (var templateItem in template.TemplateItems.Where(ti => ti.IsActive).OrderBy(ti => ti.OrderIndex))
                    {
                        var checklistItem = new MaintenanceChecklistItem
                        {
                            WorkOrderId = created.WorkOrderId,
                            Category = templateItem.Category,
                            OrderIndex = templateItem.OrderIndex,
                            StepName = templateItem.StepName,
                            StepDescription = templateItem.StepDescription,
                            RequiredRole = templateItem.RequiredRole,
                            IsChecked = false
                        };
                        await _checklistRepository.CreateAsync(checklistItem);
                    }
                }
            }
            else if (request.ChecklistItems != null && request.ChecklistItems.Any())
            {
                foreach (var item in request.ChecklistItems.OrderBy(i => i.OrderIndex))
                {
                    var checklistItem = new MaintenanceChecklistItem
                    {
                        WorkOrderId = created.WorkOrderId,
                        Category = item.Category,
                        OrderIndex = item.OrderIndex,
                        StepName = item.StepName,
                        StepDescription = item.StepDescription,
                        RequiredRole = item.RequiredRole,
                        IsChecked = false
                    };
                    await _checklistRepository.CreateAsync(checklistItem);
                }
            }

            // Send notifications
            await SendWorkOrderAssignmentNotifications(created);

            var result = await _workOrderRepository.GetByIdAsync(created.WorkOrderId);
            return MapWorkOrderToDTO(result!);
        }

        public async Task<MaintenanceWorkOrderDTO> UpdateWorkOrderAsync(int workOrderId, UpdateMaintenanceWorkOrderRequest request, string userId)
        {
            var workOrder = await _workOrderRepository.GetByIdAsync(workOrderId);
            if (workOrder == null)
                throw new InvalidOperationException($"Work order not found: {workOrderId}");

            if (request.DueDate.HasValue)
                workOrder.DueDate = request.DueDate.Value;

            // Validate new technicians if assigned
            if (!string.IsNullOrEmpty(request.AssignedToElectrical) && request.AssignedToElectrical != workOrder.AssignedToElectrical)
            {
                var tech = await _userRepository.GetUserByIdAsync(request.AssignedToElectrical);
                if (tech == null)
                    throw new InvalidOperationException($"Electrical technician not found: {request.AssignedToElectrical}");
                if (string.IsNullOrEmpty(tech.EmployeeCode))
                    throw new InvalidOperationException($"Electrical technician must have EmployeeCode");
            }

            if (!string.IsNullOrEmpty(request.AssignedToMechanical) && request.AssignedToMechanical != workOrder.AssignedToMechanical)
            {
                var tech = await _userRepository.GetUserByIdAsync(request.AssignedToMechanical);
                if (tech == null)
                    throw new InvalidOperationException($"Mechanical technician not found: {request.AssignedToMechanical}");
                if (string.IsNullOrEmpty(tech.EmployeeCode))
                    throw new InvalidOperationException($"Mechanical technician must have EmployeeCode");
            }

            var oldElectrical = workOrder.AssignedToElectrical;
            var oldMechanical = workOrder.AssignedToMechanical;

            workOrder.AssignedToElectrical = request.AssignedToElectrical;
            workOrder.AssignedToMechanical = request.AssignedToMechanical;
            
            if (!string.IsNullOrEmpty(request.Status))
                workOrder.Status = request.Status;

            // ❌ REMOVED: UsageUnit, InspectionCode, RepairTime - không sử dụng
            workOrder.Notes = request.Notes;
            workOrder.UpdatedBy = userId;
            workOrder.UpdatedDate = DateTime.Now;

            await _workOrderRepository.UpdateAsync(workOrder);

            // Update checklist if provided
            if (request.ChecklistItems != null && request.ChecklistItems.Any())
            {
                await _checklistRepository.DeleteByWorkOrderIdAsync(workOrderId);
                
                foreach (var item in request.ChecklistItems.OrderBy(i => i.OrderIndex))
                {
                    var checklistItem = new MaintenanceChecklistItem
                    {
                        WorkOrderId = workOrderId,
                        Category = item.Category,
                        OrderIndex = item.OrderIndex,
                        StepName = item.StepName,
                        StepDescription = item.StepDescription,
                        RequiredRole = item.RequiredRole,
                        IsChecked = false
                    };
                    await _checklistRepository.CreateAsync(checklistItem);
                }
            }

            // Send notifications if technicians changed
            if (oldElectrical != request.AssignedToElectrical || oldMechanical != request.AssignedToMechanical)
            {
                await SendWorkOrderAssignmentNotifications(workOrder);
            }

            var result = await _workOrderRepository.GetByIdAsync(workOrderId);
            return MapWorkOrderToDTO(result!);
        }

        public async Task<MaintenanceWorkOrderDTO> AssignTechniciansAsync(int workOrderId, string? electricalTechId, string? mechanicalTechId)
        {
            var workOrder = await _workOrderRepository.GetByIdAsync(workOrderId);
            if (workOrder == null)
                throw new InvalidOperationException($"Work order not found: {workOrderId}");

            // Validate technicians if assigned
            if (!string.IsNullOrEmpty(electricalTechId))
            {
                var tech = await _userRepository.GetUserByIdAsync(electricalTechId);
                if (tech == null)
                    throw new InvalidOperationException($"Electrical technician not found: {electricalTechId}");
                if (string.IsNullOrEmpty(tech.EmployeeCode))
                    throw new InvalidOperationException($"Electrical technician must have EmployeeCode");
            }

            if (!string.IsNullOrEmpty(mechanicalTechId))
            {
                var tech = await _userRepository.GetUserByIdAsync(mechanicalTechId);
                if (tech == null)
                    throw new InvalidOperationException($"Mechanical technician not found: {mechanicalTechId}");
                if (string.IsNullOrEmpty(tech.EmployeeCode))
                    throw new InvalidOperationException($"Mechanical technician must have EmployeeCode");
            }

            workOrder.AssignedToElectrical = electricalTechId;
            workOrder.AssignedToMechanical = mechanicalTechId;

            await _workOrderRepository.UpdateAsync(workOrder);
            await SendWorkOrderAssignmentNotifications(workOrder);

            var result = await _workOrderRepository.GetByIdAsync(workOrderId);
            return MapWorkOrderToDTO(result!);
        }

        public async Task<MaintenanceWorkOrderDTO> StartWorkOrderAsync(int workOrderId, string technicianId)
        {
            var workOrder = await _workOrderRepository.GetByIdAsync(workOrderId);
            if (workOrder == null)
                throw new InvalidOperationException($"Work order not found: {workOrderId}");

            if (workOrder.AssignedToElectrical != technicianId && workOrder.AssignedToMechanical != technicianId)
                throw new InvalidOperationException("You are not assigned to this work order");

            workOrder.Status = "InProgress";
            workOrder.StartedDate = DateTime.Now;

            await _workOrderRepository.UpdateAsync(workOrder);

            var result = await _workOrderRepository.GetByIdAsync(workOrderId);
            return MapWorkOrderToDTO(result!);
        }

        public async Task<MaintenanceWorkOrderDTO> CompleteWorkOrderAsync(int workOrderId, CompleteWorkOrderRequest request, string technicianId)
        {
            var workOrder = await _workOrderRepository.GetByIdAsync(workOrderId);
            if (workOrder == null)
                throw new InvalidOperationException($"Work order not found: {workOrderId}");

            if (workOrder.AssignedToElectrical != technicianId && workOrder.AssignedToMechanical != technicianId)
                throw new InvalidOperationException("You are not assigned to this work order");

            // Xác định loại công việc của technician hiện tại
            bool isElectrical = workOrder.AssignedToElectrical == technicianId;
            bool isMechanical = workOrder.AssignedToMechanical == technicianId;
            
            // Kiểm tra xem work order này có 2 KTV hay chỉ 1 KTV
            bool hasBothTechnicians = !string.IsNullOrEmpty(workOrder.AssignedToElectrical) && 
                                      !string.IsNullOrEmpty(workOrder.AssignedToMechanical);
            
            Console.WriteLine($"[DEBUG] CompleteWorkOrder - WorkOrderId: {workOrderId}");
            Console.WriteLine($"[DEBUG] TechnicianId: {technicianId}");
            Console.WriteLine($"[DEBUG] isElectrical: {isElectrical}, isMechanical: {isMechanical}");
            Console.WriteLine($"[DEBUG] hasBothTechnicians: {hasBothTechnicians}");
            
            // CHỈ update những checklist items thuộc loại công việc của KTV này
            foreach (var itemCompletion in request.ChecklistItems)
            {
                var checklistItem = await _checklistRepository.GetByIdAsync(itemCompletion.ChecklistId);
                if (checklistItem != null && checklistItem.WorkOrderId == workOrderId)
                {
                    // Chỉ update nếu item này thuộc category của KTV hiện tại
                    bool shouldUpdate = false;
                    if (isElectrical && checklistItem.Category == "Electrical")
                        shouldUpdate = true;
                    if (isMechanical && checklistItem.Category == "Mechanical")
                        shouldUpdate = true;
                    
                    if (shouldUpdate)
                    {
                        checklistItem.IsChecked = itemCompletion.IsChecked;
                        if (!string.IsNullOrEmpty(itemCompletion.Notes))
                        {
                            checklistItem.Notes = itemCompletion.Notes;
                        }
                        checklistItem.CompletedBy = technicianId;
                        checklistItem.CompletedDate = DateTime.Now;
                        await _checklistRepository.UpdateAsync(checklistItem);
                        
                        Console.WriteLine($"[DEBUG] Updated checklist item {checklistItem.ChecklistId} - Category: {checklistItem.Category}, IsChecked: {checklistItem.IsChecked}");
                    }
                }
            }

            // Lấy lại tất cả checklist items sau khi update
            var allChecklistItems = await _checklistRepository.GetByWorkOrderIdAsync(workOrderId);
            
            Console.WriteLine($"[DEBUG] Total checklist items: {allChecklistItems.Count()}");
            
            // Logic quyết định xem có set WorkOrder.Status = "Completed" không
            bool shouldCompleteWorkOrder = false;
            
            if (hasBothTechnicians)
            {
                // Có 2 KTV: Kiểm tra RIÊNG từng category
                var electricalItems = allChecklistItems.Where(i => i.Category == "Electrical").ToList();
                var mechanicalItems = allChecklistItems.Where(i => i.Category == "Mechanical").ToList();
                
                bool electricalCompleted = electricalItems.Any() && electricalItems.All(i => i.IsChecked);
                bool mechanicalCompleted = mechanicalItems.Any() && mechanicalItems.All(i => i.IsChecked);
                
                Console.WriteLine($"[DEBUG] Electrical items: {electricalItems.Count}, Completed: {electricalItems.Count(i => i.IsChecked)}/{electricalItems.Count}");
                Console.WriteLine($"[DEBUG] Mechanical items: {mechanicalItems.Count}, Completed: {mechanicalItems.Count(i => i.IsChecked)}/{mechanicalItems.Count}");
                Console.WriteLine($"[DEBUG] electricalCompleted: {electricalCompleted}, mechanicalCompleted: {mechanicalCompleted}");
                
                // CHỈ set Completed khi CẢ 2 category đều hoàn thành
                shouldCompleteWorkOrder = electricalCompleted && mechanicalCompleted;
                
                Console.WriteLine($"[DEBUG] Has both technicians - shouldCompleteWorkOrder: {shouldCompleteWorkOrder}");
            }
            else
            {
                // Chỉ có 1 KTV: Kiểm tra tất cả items đã done chưa
                bool allItemsCompleted = allChecklistItems.All(item => item.IsChecked);
                shouldCompleteWorkOrder = allItemsCompleted;
                
                Console.WriteLine($"[DEBUG] Single technician - allItemsCompleted: {allItemsCompleted}");
            }
            
            if (shouldCompleteWorkOrder)
            {
                Console.WriteLine($"[DEBUG] ✅ Setting WorkOrder.Status = Completed");
                workOrder.Status = "Completed";
                workOrder.CompletedDate = DateTime.Now;
                
                // Lưu ghi chú tổng thể
                if (!string.IsNullOrEmpty(request.OverallNotes))
                {
                    workOrder.Notes = (workOrder.Notes ?? "") + $"\n[{DateTime.Now:dd/MM/yyyy HH:mm}] Hoàn thành: {request.OverallNotes}";
                }
                
                // Update WorkOrder trước
                await _workOrderRepository.UpdateAsync(workOrder);
                
                // Update plan: CHỈ cập nhật NextDueDate cho chu kỳ tiếp theo, Plan vẫn Active
                var plan = await _planRepository.GetByIdAsync(workOrder.PlanId);
                if (plan != null)
                {
                    // Tính ngày đến hạn tiếp theo dựa trên chu kỳ
                    plan.NextDueDate = CalculateNextDueDate(DateTime.Now, plan.IntervalType, plan.IntervalValue);
                    
                    // Reset PostponedDueDate và lý do hoãn (nếu có)
                    plan.PostponedDueDate = null;
                    plan.PostponedReason = null;
                    plan.PostponedDate = null;
                    
                    // Plan vẫn Active, KHÔNG set Status = "Completed"
                    // Vì đây là chu kỳ định kỳ, Plan sẽ tiếp tục hoạt động cho lần bảo trì tiếp theo
                    
                    await _planRepository.UpdateAsync(plan);
                    
                    Console.WriteLine($"[DEBUG] Updated Plan {plan.PlanId} - NextDueDate: {plan.NextDueDate:dd/MM/yyyy}, Plan vẫn Active");
                }
                
                // 🔥 GỬI SIGNALR NOTIFICATION KHI HOÀN THÀNH
                try
                {
                    await _notificationHubService.SendWorkOrderCompletedAsync(new
                    {
                        workOrderId = workOrder.WorkOrderId,
                        workOrderCode = workOrder.WorkOrderCode,
                        equipmentName = workOrder.Equipment?.EquipmentName,
                        equipmentCode = workOrder.Equipment?.EquipmentCode,
                        completedDate = workOrder.CompletedDate,
                        completedBy = technicianId,
                        status = "Completed"
                    });
                    
                    Console.WriteLine($"✅ Sent SignalR: WorkOrderCompleted for WorkOrder {workOrder.WorkOrderId}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Failed to send SignalR notification: {ex.Message}");
                }
            }
            else
            {
                Console.WriteLine($"[DEBUG] ⏳ Chưa hoàn thành - keeping status as InProgress");
                
                // Đảm bảo status là InProgress (nếu chưa phải Completed)
                if (workOrder.Status != "Completed")
                {
                    workOrder.Status = "InProgress";
                }
                
                // Ghi log cho KTV vừa hoàn thành phần của mình
                if (!string.IsNullOrEmpty(request.OverallNotes))
                {
                    string techType = isElectrical ? "KTV Điện" : "KTV Cơ khí";
                    workOrder.Notes = (workOrder.Notes ?? "") + $"\n[{DateTime.Now:dd/MM/yyyy HH:mm}] {techType} đã hoàn thành phần của mình: {request.OverallNotes}";
                }
                
                // Update WorkOrder trước khi gửi notification
                await _workOrderRepository.UpdateAsync(workOrder);
                
                // Gửi thông báo cho KTV còn lại (nếu có 2 KTV)
                if (hasBothTechnicians)
                {
                    string? otherTechId = isElectrical ? workOrder.AssignedToMechanical : workOrder.AssignedToElectrical;
                    string techType = isElectrical ? "điện" : "cơ khí";
                    
                    if (!string.IsNullOrEmpty(otherTechId))
                    {
                        await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                        {
                            UserId = otherTechId,
                            Title = "Đồng nghiệp đã hoàn thành phần việc",
                            Message = $"KTV {techType} đã hoàn thành phần của họ cho phiếu #{workOrder.WorkOrderCode}. Vui lòng hoàn thành phần việc của bạn."
                        });
                        
                        Console.WriteLine($"[DEBUG] Sent notification to other technician: {otherTechId}");
                        
                        // 🔥 GỬI SIGNALR ĐỂ CẬP NHẬT REAL-TIME CHO KTV CÒN LẠI
                        try
                        {
                            await _notificationHubService.SendWorkOrderProgressUpdatedAsync(new
                            {
                                workOrderId = workOrder.WorkOrderId,
                                workOrderCode = workOrder.WorkOrderCode,
                                status = "InProgress",
                                completedCategory = isElectrical ? "Electrical" : "Mechanical",
                                message = $"KTV {techType} đã hoàn thành phần của họ",
                                otherTechnicianId = otherTechId
                            });
                            
                            Console.WriteLine($"✅ Sent SignalR: WorkOrderProgressUpdated to {otherTechId}");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"⚠️ Failed to send SignalR notification: {ex.Message}");
                        }
                    }
                }
            }
            
            Console.WriteLine($"[DEBUG] Final WorkOrder.Status: {workOrder.Status}");

            var result = await _workOrderRepository.GetByIdAsync(workOrderId);
            return MapWorkOrderToDTO(result!);
        }

        public async Task<MaintenanceWorkOrderDTO> CancelWorkOrderAsync(int workOrderId, string reason)
        {
            var workOrder = await _workOrderRepository.GetByIdAsync(workOrderId);
            if (workOrder == null)
                throw new InvalidOperationException($"Work order not found: {workOrderId}");

            workOrder.Status = "Cancelled";
            workOrder.Notes = (workOrder.Notes ?? "") + $"\nCancelled: {reason}";
            workOrder.UpdatedDate = DateTime.Now;

            await _workOrderRepository.UpdateAsync(workOrder);

            var result = await _workOrderRepository.GetByIdAsync(workOrderId);
            return MapWorkOrderToDTO(result!);
        }

        public async Task DeleteWorkOrderAsync(int workOrderId)
        {
            var workOrder = await _workOrderRepository.GetByIdAsync(workOrderId);
            if (workOrder == null)
                throw new InvalidOperationException($"Work order not found: {workOrderId}");

            await _checklistRepository.DeleteByWorkOrderIdAsync(workOrderId);
            await _workOrderRepository.DeleteAsync(workOrderId);
        }

        // ===== CHECKLIST ITEM MANAGEMENT =====
        
        public async Task<MaintenanceChecklistItemDTO> UpdateChecklistItemAsync(int checklistId, UpdateChecklistItemRequest request, string technicianId)
        {
            var item = await _checklistRepository.GetByIdAsync(checklistId);
            if (item == null)
                throw new InvalidOperationException($"Checklist item not found: {checklistId}");

            item.IsChecked = request.IsChecked;
            item.Notes = request.Notes;
            item.CompletedBy = technicianId;
            item.CompletedDate = request.IsChecked ? DateTime.Now : null;

            await _checklistRepository.UpdateAsync(item);

            // 🔥 GỬI THÔNG BÁO SIGNALR CHO TECHMANAGER KHI TECHNICIAN TICK CHECKBOX
            try
            {
                var workOrder = await _workOrderRepository.GetByIdAsync(item.WorkOrderId);
                if (workOrder != null)
                {
                    // Gửi thông báo real-time cho TechManager
                    await _notificationHubService.SendChecklistItemUpdatedAsync(new
                    {
                        workOrderId = workOrder.WorkOrderId,
                        checklistItemId = item.ChecklistId,
                        stepName = item.StepName,
                        isChecked = item.IsChecked,
                        category = item.Category,
                        completedBy = technicianId,
                        completedDate = item.CompletedDate,
                        notes = item.Notes,
                        equipmentName = workOrder.Equipment?.EquipmentName,
                        equipmentCode = workOrder.Equipment?.EquipmentCode
                    });
                    
                    Console.WriteLine($"✅ Sent SignalR notification: ChecklistItemUpdated for WorkOrder {workOrder.WorkOrderId}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠️ Failed to send SignalR notification: {ex.Message}");
                // Không throw exception để không ảnh hưởng đến việc update checklist
            }

            return MapChecklistItemToDTO(item);
        }

        public async Task<MaintenanceChecklistItemDTO> AddChecklistItemAsync(int workOrderId, CreateChecklistItemRequest request)
        {
            var workOrder = await _workOrderRepository.GetByIdAsync(workOrderId);
            if (workOrder == null)
                throw new InvalidOperationException($"Work order not found: {workOrderId}");

            var checklistItem = new MaintenanceChecklistItem
            {
                WorkOrderId = workOrderId,
                Category = request.Category,
                OrderIndex = request.OrderIndex,
                StepName = request.StepName,
                StepDescription = request.StepDescription,
                RequiredRole = request.RequiredRole,
                IsChecked = false
            };

            var created = await _checklistRepository.CreateAsync(checklistItem);
            return MapChecklistItemToDTO(created);
        }

        public async Task DeleteChecklistItemAsync(int checklistId)
        {
            var item = await _checklistRepository.GetByIdAsync(checklistId);
            if (item == null)
                throw new InvalidOperationException($"Checklist item not found: {checklistId}");

            await _checklistRepository.DeleteAsync(checklistId);
        }

        // ===== STATISTICS & REPORTS =====
        
        public async Task<MaintenanceStatisticsDTO> GetStatisticsAsync()
        {
            var allPlans = await _planRepository.GetAllAsync();
            var allWorkOrders = await _workOrderRepository.GetAllAsync();
            var today = DateTime.Today;

            var stats = new MaintenanceStatisticsDTO
            {
                TotalPlans = allPlans.Count(),
                ActivePlans = allPlans.Count(p => p.IsActive),
                TotalWorkOrders = allWorkOrders.Count(),
                PendingWorkOrders = allWorkOrders.Count(wo => wo.Status == "Pending"),
                InProgressWorkOrders = allWorkOrders.Count(wo => wo.Status == "InProgress"),
                CompletedWorkOrders = allWorkOrders.Count(wo => wo.Status == "Completed"),
                OverdueWorkOrders = allWorkOrders.Count(wo => wo.Status != "Completed" && wo.Status != "Cancelled" && wo.DueDate < today),
                DueThisWeek = allWorkOrders.Count(wo => wo.Status != "Completed" && wo.Status != "Cancelled" && wo.DueDate >= today && wo.DueDate <= today.AddDays(7)),
                DueThisMonth = allWorkOrders.Count(wo => wo.Status != "Completed" && wo.Status != "Cancelled" && wo.DueDate >= today && wo.DueDate <= today.AddMonths(1))
            };

            if (stats.TotalWorkOrders > 0)
            {
                stats.OverallCompletionRate = (decimal)stats.CompletedWorkOrders / stats.TotalWorkOrders * 100;
            }

            return stats;
        }

        public async Task<IEnumerable<MaintenancePlanDTO>> GetUpcomingMaintenanceAsync(int days = 7)
        {
            var plans = await _planRepository.GetDueWithinDaysAsync(days);
            var today = DateTime.Today;

            // Lọc các plans theo logic mới:
            // - Nếu chưa hoãn: kiểm tra NextDueDate trong vòng 7 ngày
            // - Nếu đã hoãn: kiểm tra PostponedDueDate trong vòng 7 ngày
            var filteredPlans = plans.Where(p => 
            {
                if (!p.IsActive) return false;
                
                // Kiểm tra đã có WorkOrder active chưa
                var hasActiveWorkOrder = p.WorkOrders?.Any(wo => wo.Status == "Pending" || wo.Status == "InProgress") ?? false;
                if (hasActiveWorkOrder) return false;
                
                // Xác định ngày đến hạn hiệu lực (PostponedDueDate nếu có, không thì NextDueDate)
                var effectiveDueDate = p.PostponedDueDate ?? p.NextDueDate;
                var daysUntil = (effectiveDueDate - today).Days;
                
                // Chỉ hiển thị nếu trong vòng 7 ngày tới
                return daysUntil >= 0 && daysUntil <= days;
            });

            // Sử dụng MapPlanToDTO để có đầy đủ thông tin chu kỳ, trạng thái, hoãn
            return filteredPlans.Select(MapPlanToDTO);
        }

        // ===== TECHNICIAN MANAGEMENT =====
        
        public async Task<IEnumerable<TechnicianDTO>> GetAllTechniciansAsync()
        {
            // Lấy TẤT CẢ users có RoleId = bc5072df-86be-4b90-b259-32dce53aba81 (Kỹ thuật viên)
            const string TECHNICIAN_ROLE_ID = "bc5072df-86be-4b90-b259-32dce53aba81";
            var users = await _userRepository.GetUsersByRoleIdAsync(TECHNICIAN_ROLE_ID);
            return users.Select(MapUserToTechnicianDTO);
        }
        
        public async Task<IEnumerable<TechnicianDTO>> GetMechanicalTechniciansAsync()
        {
            var users = await _userRepository.GetUsersByRoleAsync("Mechanical Technician");
            return users.Select(MapUserToTechnicianDTO);
        }

        public async Task<IEnumerable<TechnicianDTO>> GetElectricalTechniciansAsync()
        {
            var users = await _userRepository.GetUsersByRoleAsync("Electrical Technician");
            return users.Select(MapUserToTechnicianDTO);
        }

        // ===== BACKGROUND TASKS =====
        
        public async Task GenerateWorkOrdersForDuePlansAsync()
        {
            var duePlans = await _planRepository.GetDueWithinDaysAsync(0); // Plans due today or overdue
            
            foreach (var plan in duePlans.Where(p => p.IsActive))
            {
                // Check if there's already an active work order
                var existingWorkOrders = await _workOrderRepository.GetByPlanIdAsync(plan.PlanId);
                var hasActiveWorkOrder = existingWorkOrders.Any(wo => wo.Status != "Completed" && wo.Status != "Cancelled");
                
                if (!hasActiveWorkOrder)
                {
                    var request = new CreateMaintenanceWorkOrderRequest
                    {
                        PlanId = plan.PlanId,
                        DueDate = plan.NextDueDate,
                        AssignedToElectrical = plan.AssignedToElectrical,
                        AssignedToMechanical = plan.AssignedToMechanical
                    };

                    await CreateWorkOrderAsync(request, "SYSTEM");
                }
            }
        }

        public async Task UpdateOverdueStatusAsync()
        {
            var allWorkOrders = await _workOrderRepository.GetAllAsync();
            var today = DateTime.Today;

            foreach (var workOrder in allWorkOrders)
            {
                if (workOrder.Status != "Completed" && workOrder.Status != "Cancelled" && workOrder.DueDate < today)
                {
                    if (workOrder.Status != "Overdue")
                    {
                        workOrder.Status = "Overdue";
                        await _workOrderRepository.UpdateAsync(workOrder);
                    }
                }
            }

            var allPlans = await _planRepository.GetAllAsync();
            foreach (var plan in allPlans.Where(p => p.IsActive))
            {
                if (plan.NextDueDate < today && plan.Status != "Overdue")
                {
                    plan.Status = "Overdue";
                    await _planRepository.UpdateAsync(plan);
                }
            }
        }

        public async Task SendMaintenanceRemindersAsync()
        {
            var upcomingPlans = await _planRepository.GetDueWithinDaysAsync(3); // 3 days notice

            foreach (var plan in upcomingPlans)
            {
                // Notify TechManager
                var techManagers = await _userRepository.GetUsersByRoleAsync("TechManager");
                foreach (var manager in techManagers)
                {
                    await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                    {
                        UserId = manager.Id,
                        Title = "Bảo trì sắp đến hạn",
                        Message = $"Thiết bị {plan.Equipment?.EquipmentName} ({plan.Equipment?.EquipmentCode}) cần bảo trì vào {plan.NextDueDate:dd/MM/yyyy}"
                    });
                }

                // Notify assigned technicians
                if (!string.IsNullOrEmpty(plan.AssignedToElectrical))
                {
                    await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                    {
                        UserId = plan.AssignedToElectrical,
                        Title = "Nhiệm vụ bảo trì sắp đến hạn",
                        Message = $"Bạn có nhiệm vụ bảo trì điện cho {plan.Equipment?.EquipmentName} vào {plan.NextDueDate:dd/MM/yyyy}"
                    });
                }

                if (!string.IsNullOrEmpty(plan.AssignedToMechanical))
                {
                    await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                    {
                        UserId = plan.AssignedToMechanical,
                        Title = "Nhiệm vụ bảo trì sắp đến hạn",
                        Message = $"Bạn có nhiệm vụ bảo trì cơ cho {plan.Equipment?.EquipmentName} vào {plan.NextDueDate:dd/MM/yyyy}"
                    });
                }
            }
        }

        // ===== HELPER METHODS =====
        
        private static MaintenanceTemplateDTO MapTemplateToDTO(MaintenanceTemplate template)
        {
            return new MaintenanceTemplateDTO
            {
                TemplateId = template.TemplateId,
                StageId = template.StageId,
                StageName = template.Stage?.StageName ?? "",
                LineName = template.Stage?.Line?.LineName ?? "",
                TemplateName = template.TemplateName,
                Description = template.Description,
                InspectionCode = template.InspectionCode,
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
                }).OrderBy(ti => ti.OrderIndex).ToList() ?? new List<MaintenanceTemplateItemDTO>()
            };
        }

        private MaintenancePlanDTO MapPlanToDTO(MaintenancePlan plan)
        {
            var today = DateTime.Today;
            
            // Sử dụng PostponedDueDate nếu có, không thì dùng NextDueDate
            var effectiveDueDate = plan.PostponedDueDate ?? plan.NextDueDate;
            var daysUntilDue = (effectiveDueDate - today).Days;
            
            var workOrders = plan.WorkOrders?.ToList() ?? new List<MaintenanceWorkOrder>();
            
            // Kiểm tra xem có WorkOrder đang active không (Pending hoặc InProgress)
            var hasActiveWorkOrder = workOrders.Any(wo => wo.Status == "Pending" || wo.Status == "InProgress");
            
            // Tự động set Status
            string status = plan.Status;
            if (hasActiveWorkOrder)
            {
                status = "InProgress";
            }
            else if (plan.PostponedDueDate.HasValue)
            {
                status = "Postponed"; // Đã hoãn bảo trì
            }

            return new MaintenancePlanDTO
            {
                PlanId = plan.PlanId,
                EquipmentId = plan.EquipmentId,
                EquipmentName = plan.Equipment?.EquipmentName,
                EquipmentCode = plan.Equipment?.EquipmentCode,
                TemplateId = plan.TemplateId,
                TemplateName = plan.Template?.TemplateName,
                StageName = plan.Equipment?.Stage?.StageName,
                LineName = plan.Equipment?.Stage?.Line?.LineName,
                IntervalType = plan.IntervalType,
                IntervalValue = plan.IntervalValue,
                StartDate = plan.StartDate,
                NextDueDate = plan.NextDueDate, // Giữ nguyên ngày gốc
                AssignedToElectrical = plan.AssignedToElectrical,
                ElectricalTechnicianName = plan.ElectricalTechnician?.FullName,
                ElectricalEmployeeCode = plan.ElectricalTechnician?.EmployeeCode,
                AssignedToMechanical = plan.AssignedToMechanical,
                MechanicalTechnicianName = plan.MechanicalTechnician?.FullName,
                MechanicalEmployeeCode = plan.MechanicalTechnician?.EmployeeCode,
                IsActive = plan.IsActive,
                Status = status,
                CreatedDate = plan.CreatedDate,
                CreatedByName = plan.CreatedByUser?.FullName,
                DaysUntilDue = daysUntilDue, // Tính từ effectiveDueDate
                IsOverdue = effectiveDueDate < today,
                TotalWorkOrders = workOrders.Count,
                CompletedWorkOrders = workOrders.Count(wo => wo.Status == "Completed"),
                HasActiveWorkOrder = hasActiveWorkOrder,
                PostponedDueDate = plan.PostponedDueDate, // Ngày sau khi hoãn
                PostponedReason = plan.PostponedReason,
                PostponedDate = plan.PostponedDate
            };
        }

        private MaintenanceWorkOrderDTO MapWorkOrderToDTO(MaintenanceWorkOrder workOrder)
        {
            var today = DateTime.Today;
            var daysUntilDue = (workOrder.DueDate - today).Days;
            var checklistItems = workOrder.ChecklistItems?.ToList() ?? new List<MaintenanceChecklistItem>();
            var totalItems = checklistItems.Count;
            var completedItems = checklistItems.Count(ci => ci.IsChecked);

            return new MaintenanceWorkOrderDTO
            {
                WorkOrderId = workOrder.WorkOrderId,
                WorkOrderCode = workOrder.WorkOrderCode,
                PlanId = workOrder.PlanId,
                EquipmentId = workOrder.EquipmentId,
                EquipmentName = workOrder.Equipment?.EquipmentName ?? "",
                EquipmentCode = workOrder.Equipment?.EquipmentCode ?? "",
                StageName = workOrder.Equipment?.Stage?.StageName,
                LineName = workOrder.Equipment?.Stage?.Line?.LineName,
                AssignedDate = workOrder.AssignedDate,
                DueDate = workOrder.DueDate,
                StartedDate = workOrder.StartedDate,
                CompletedDate = workOrder.CompletedDate,
                AssignedToElectrical = workOrder.AssignedToElectrical,
                ElectricalTechnicianName = workOrder.ElectricalTechnician?.FullName,
                ElectricalEmployeeCode = workOrder.ElectricalTechnician?.EmployeeCode,
                AssignedToMechanical = workOrder.AssignedToMechanical,
                MechanicalTechnicianName = workOrder.MechanicalTechnician?.FullName,
                MechanicalEmployeeCode = workOrder.MechanicalTechnician?.EmployeeCode,
                Status = workOrder.Status,
                Notes = workOrder.Notes,
                ChecklistItems = checklistItems.Select(MapChecklistItemToDTO).OrderBy(ci => ci.OrderIndex).ToList(),
                TotalChecklistItems = totalItems,
                CompletedChecklistItems = completedItems,
                CompletionPercentage = totalItems > 0 ? (decimal)completedItems / totalItems * 100 : 0,
                DaysUntilDue = daysUntilDue,
                IsOverdue = workOrder.DueDate < today && workOrder.Status != "Completed"
            };
        }

        private static MaintenanceChecklistItemDTO MapChecklistItemToDTO(MaintenanceChecklistItem item)
        {
            return new MaintenanceChecklistItemDTO
            {
                ChecklistId = item.ChecklistId,
                WorkOrderId = item.WorkOrderId,
                Category = item.Category,
                OrderIndex = item.OrderIndex,
                StepName = item.StepName,
                StepDescription = item.StepDescription,
                RequiredRole = item.RequiredRole,
                IsChecked = item.IsChecked,
                CompletedBy = item.CompletedBy,
                CompletedByName = item.CompletedByUser?.FullName,
                CompletedDate = item.CompletedDate,
                Notes = item.Notes
            };
        }

        private static TechnicianDTO MapUserToTechnicianDTO(User user)
        {
            return new TechnicianDTO
            {
                UserId = user.Id,
                FullName = user.FullName ?? "",
                EmployeeCode = user.EmployeeCode ?? "",
                Email = user.Email ?? "",
                PhoneNumber = user.PhoneNumber ?? "",
                RoleName = user.Role?.Name ?? "",
                IsActive = user.IsActive
            };
        }

        private static DateTime CalculateNextDueDate(DateTime currentDate, string intervalType, int intervalValue)
        {
            return intervalType.ToLower() switch
            {
                "minutes" => currentDate.AddMinutes(intervalValue),
                "hours" => currentDate.AddHours(intervalValue),
                "days" => currentDate.AddDays(intervalValue),
                "months" => currentDate.AddMonths(intervalValue),
                _ => currentDate.AddDays(intervalValue)
            };
        }

        private async Task SendPlanAssignmentNotifications(MaintenancePlan plan)
        {
            if (!string.IsNullOrEmpty(plan.AssignedToElectrical))
            {
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = plan.AssignedToElectrical,
                    Title = "Nhiệm vụ bảo trì mới",
                    Message = $"Bạn được phân công bảo trì điện cho thiết bị {plan.Equipment?.EquipmentName}. Hạn: {plan.NextDueDate:dd/MM/yyyy}"
                });
            }

            if (!string.IsNullOrEmpty(plan.AssignedToMechanical))
            {
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = plan.AssignedToMechanical,
                    Title = "Nhiệm vụ bảo trì mới",
                    Message = $"Bạn được phân công bảo trì cơ cho thiết bị {plan.Equipment?.EquipmentName}. Hạn: {plan.NextDueDate:dd/MM/yyyy}"
                });
            }
        }

        private async Task SendWorkOrderAssignmentNotifications(MaintenanceWorkOrder workOrder)
        {
            if (!string.IsNullOrEmpty(workOrder.AssignedToElectrical))
            {
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = workOrder.AssignedToElectrical,
                    Title = "Phiếu bảo trì mới",
                    Message = $"Bạn có phiếu bảo trì điện mới #{workOrder.WorkOrderCode} cho {workOrder.Equipment?.EquipmentName}. Hạn: {workOrder.DueDate:dd/MM/yyyy}"
                });
            }

            if (!string.IsNullOrEmpty(workOrder.AssignedToMechanical))
            {
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = workOrder.AssignedToMechanical,
                    Title = "Phiếu bảo trì mới",
                    Message = $"Bạn có phiếu bảo trì cơ mới #{workOrder.WorkOrderCode} cho {workOrder.Equipment?.EquipmentName}. Hạn: {workOrder.DueDate:dd/MM/yyyy}"
                });
            }
        }
    }
}
