using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Services
{
    public class MaintenancePlanService : IMaintenancePlanService
    {
        private readonly IMaintenancePlanRepository _planRepository;
        private readonly IMaintenanceTemplateRepository _templateRepository;
        private readonly IMaintenanceWorkOrderRepository _workOrderRepository;
        private readonly IEquipmentRepository _equipmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationService _notificationService;

        public MaintenancePlanService(
            IMaintenancePlanRepository planRepository,
            IMaintenanceTemplateRepository templateRepository,
            IMaintenanceWorkOrderRepository workOrderRepository,
            IEquipmentRepository equipmentRepository,
            IUserRepository userRepository,
            INotificationService notificationService)
        {
            _planRepository = planRepository;
            _templateRepository = templateRepository;
            _workOrderRepository = workOrderRepository;
            _equipmentRepository = equipmentRepository;
            _userRepository = userRepository;
            _notificationService = notificationService;
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

            var existingPlans = await _planRepository.GetByEquipmentIdAsync(request.EquipmentId);
            var hasActivePlan = existingPlans.Any(p => p.IsActive);
            
            if (hasActivePlan)
            {
                var activePlan = existingPlans.First(p => p.IsActive);
                throw new InvalidOperationException(
                    $"Thiết bị '{equipment.EquipmentName}' ({equipment.EquipmentCode}) đã có kế hoạch bảo trì định kỳ. " +
                    $"Chu kỳ hiện tại: {activePlan.IntervalValue} {activePlan.IntervalType}. " +
                    $"Vui lòng vô hiệu hóa kế hoạch cũ trước khi tạo kế hoạch mới."
                );
            }

            // Validate template if provided
            if (request.TemplateId.HasValue)
            {
                var template = await _templateRepository.GetByIdAsync(request.TemplateId.Value);
                if (template == null)
                    throw new InvalidOperationException($"Template not found: {request.TemplateId}");
                
                if (template.StageId != equipment.StageId)
                {
                    throw new InvalidOperationException(
                        $"Mẫu bảo trì '{template.TemplateName}' thuộc '{template.Stage?.StageName}' nhưng máy '{equipment.EquipmentName}' thuộc '{equipment.Stage?.StageName}'. " +
                        $"Mẫu bảo trì phải cùng công đoạn với máy."
                    );
                }
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
                ReminderDaysBefore = request.ReminderDaysBefore,
                CreatedBy = userId,
                CreatedDate = DateTime.Now,
                IsActive = true
                // Status không cần - Plan chỉ có Active/Inactive
            };

            var created = await _planRepository.CreateAsync(plan);

            var result = await _planRepository.GetByIdAsync(created.PlanId);
            return MapPlanToDTO(result!);
        }

        public async Task<MaintenancePlanDTO> UpdatePlanAsync(int planId, UpdateMaintenancePlanRequest request)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            if (plan == null)
                throw new InvalidOperationException($"Plan not found: {planId}");

            var isBeingDeactivated = (request.IsActive == false && plan.IsActive);
            
            if (isBeingDeactivated)
            {
                // ✅ Kiểm tra xem có WorkOrder đang active không
                var allWorkOrders = await _workOrderRepository.GetByPlanIdAsync(planId);
                var activeWorkOrders = allWorkOrders.Where(wo => 
                {
                    var normalizedStatus = wo.Status?.Trim().ToLower();
                    return normalizedStatus == "chờ xử lý" || 
                           normalizedStatus == "đang thực hiện" || 
                           normalizedStatus == "hoàn thành" ||
                           normalizedStatus == "quá hạn" ||
                           normalizedStatus == "hoãn";
                }).ToList();
                
                if (activeWorkOrders.Any())
                {
                    var workOrderList = string.Join(", ", activeWorkOrders.Select(wo => 
                        $"{wo.WorkOrderCode} ({wo.Status})"
                    ));
                    throw new InvalidOperationException(
                        $"Cannot deactivate maintenance plan because there are {activeWorkOrders.Count} active work orders: {workOrderList}. " +
                        $"Please complete or cancel these work orders first."
                    );
                }

                // Nếu không có WorkOrder active → Cho phép vô hiệu hóa
                plan.IsActive = false;
                
                Console.WriteLine($"[INFO] Plan {planId} deactivated. No active work orders.");
            }

            // ✅ VALIDATION: Không cho phép kích hoạt lại nếu đã quá hạn mà chưa cập nhật NextDueDate
            var isBeingActivated = (request.IsActive == true && !plan.IsActive);
            if (isBeingActivated)
            {
                if (plan.NextDueDate < DateTime.Today && !request.NextDueDate.HasValue)
                {
                    throw new InvalidOperationException(
                        $"❌ Cannot reactivate maintenance plan because it's overdue (Due: {plan.NextDueDate:dd/MM/yyyy}). " +
                        $"Please update the next due date before reactivating."
                    );
                }
                
                plan.IsActive = true;
            }

            if (request.IntervalType != plan.IntervalType && request.IntervalType != null)
            {
                throw new InvalidOperationException("Không thể thay đổi loại chu kỳ của kế hoạch bảo trì đã tồn tại. Vui lòng tạo kế hoạch mới.");
            }

            if (request.IntervalValue != plan.IntervalValue && request.IntervalValue != 0)
            {
                throw new InvalidOperationException("Không thể thay đổi giá trị chu kỳ của kế hoạch bảo trì đã tồn tại. Vui lòng tạo kế hoạch mới.");
            }

            if (request.NextDueDate.HasValue && request.NextDueDate != plan.NextDueDate)
            {
                throw new InvalidOperationException("Không thể thay đổi ngày bảo trì tiếp theo trực tiếp. Hệ thống sẽ tự động tính toán.");
            }

            // ✅ CHỈ CHO PHÉP UPDATE: TemplateId, IsActive, ReminderDaysBefore
            if (request.TemplateId.HasValue)
            {
                var template = await _templateRepository.GetByIdAsync(request.TemplateId.Value);
                if (template == null)
                    throw new InvalidOperationException($"Template not found: {request.TemplateId}");
                
                // ✅ VALIDATION: Template phải thuộc đúng stage của equipment
                if (template.StageId != plan.Equipment?.StageId)
                {
                    throw new InvalidOperationException(
                        $"Mẫu bảo trì '{template.TemplateName}' thuộc công đoạn '{template.Stage?.StageName}' nhưng thiết bị '{plan.Equipment?.EquipmentName}' thuộc công đoạn '{plan.Equipment?.Stage?.StageName}'. " +
                        $"Mẫu bảo trì và thiết bị phải cùng công đoạn."
                    );
                }
                
                plan.TemplateId = request.TemplateId;
            }

            if (request.ReminderDaysBefore.HasValue)
                plan.ReminderDaysBefore = request.ReminderDaysBefore.Value;

            
            if (!isBeingDeactivated && !isBeingActivated)
            {
                plan.IsActive = request.IsActive;
            }

            await _planRepository.UpdateAsync(plan);

            var result = await _planRepository.GetByIdAsync(planId);
            return MapPlanToDTO(result!);
        }

        public async Task DeletePlanAsync(int planId)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            if (plan == null)
                throw new InvalidOperationException($"Plan not found: {planId}");

            //  VALIDATION 3A: Không được xóa kế hoạch đang hoạt động
            if (plan.IsActive)
            {
                throw new InvalidOperationException(
                    $"❌ Không thể xóa kế hoạch bảo trì đang hoạt động cho thiết bị '{plan.Equipment?.EquipmentName ?? "N/A"}'. " 
                    
                );
            }

            //  VALIDATION 3B: Kiểm tra có work order đang chờ xử lý hoặc đang thực hiện , quá hạn hoặc hoãn
            var workOrders = await _workOrderRepository.GetByPlanIdAsync(planId);
            var activeWorkOrders = workOrders.Where(wo => 
            {
                var normalizedStatus = wo.Status?.Trim().ToLower();
                return normalizedStatus == "chờ xử lý" || normalizedStatus == "đang thực hiện" || normalizedStatus == "quá hạn" || normalizedStatus == "hoãn";
            }).ToList();
            
            if (activeWorkOrders.Any())
            {
                var woList = string.Join(", ", activeWorkOrders.Select(wo => $"#{wo.WorkOrderCode} ({wo.Status})"));
                throw new InvalidOperationException(
                    $"❌ Không thể xóa kế hoạch bảo trì vì có {activeWorkOrders.Count} phiếu bảo trì đang hoạt động: {woList}. " +
                    $"Vui lòng hoàn thành hoặc hủy các phiếu này trước khi xóa kế hoạch."
                );
            }

            // Only Completed or Cancelled work orders remain - can delete safely
            await _planRepository.DeleteAsync(planId);
        }

        // PostponeMaintenancePlanAsync removed - postpone logic moved to WorkOrder level

        public async Task<IEnumerable<MaintenancePlanDTO>> GetUpcomingMaintenanceAsync(int days = 7)
        {
            var plans = await _planRepository.GetDueWithinDaysAsync(days);
            var today = DateTime.Today;

            
            var filteredPlans = plans.Where(p => 
            {
                if (!p.IsActive) return false;
                
                var hasActiveWorkOrder = p.WorkOrders?.Any(wo => 
                {
                    var normalizedStatus = wo.Status?.Trim().ToLower();
                    return normalizedStatus == "chờ xử lý" || normalizedStatus == "đang thực hiện";
                }) ?? false;
                if (hasActiveWorkOrder) return false;
                
                var daysUntil = (p.NextDueDate - today).Days;
                
                return daysUntil >= 0 && daysUntil <= days;
            });

            return filteredPlans.Select(MapPlanToDTO);
        }

        // ===== HELPER METHODS =====
        
        private MaintenancePlanDTO MapPlanToDTO(MaintenancePlan plan)
        {
            var today = DateTime.Today;
            
            var daysUntilDue = (plan.NextDueDate - today).Days;
            
            var workOrders = plan.WorkOrders?.ToList() ?? new List<MaintenanceWorkOrder>();
            
            // ✅ Plan KHÔNG có status phức tạp - chỉ Active/Inactive
            // Status của WO (Pending, InProgress, etc.) thuộc về WO, không thuộc Plan
            var hasActiveWorkOrder = workOrders.Any(wo => 
                wo.Status != "Closed" && 
                wo.Status != "Cancelled" &&
                wo.Status != "Verified"
            );

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
                NextDueDate = plan.NextDueDate,
                ReminderDaysBefore = plan.ReminderDaysBefore,
                IsActive = plan.IsActive,
                Status = plan.IsActive ? "Đang hoạt động" : "Không hoạt động", 
                CreatedDate = plan.CreatedDate,
                CreatedByName = plan.CreatedByUser?.FullName,
                DaysUntilDue = daysUntilDue,
                IsOverdue = plan.NextDueDate < today,
                TotalWorkOrders = workOrders.Count,
                CompletedWorkOrders = workOrders.Count(wo => wo.Status == "Hoàn thành"),
                HasActiveWorkOrder = hasActiveWorkOrder
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

        // TODO: Remove SendPlanAssignmentNotifications - technician assignment moved to WorkOrder
    }
}
