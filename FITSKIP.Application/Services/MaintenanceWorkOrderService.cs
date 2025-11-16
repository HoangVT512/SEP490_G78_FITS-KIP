using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.EntityFrameworkCore;

namespace FITSKIP.Application.Services
{
    public class MaintenanceWorkOrderService : IMaintenanceWorkOrderService
    {
        private readonly IMaintenancePlanRepository _planRepository;
        private readonly IMaintenanceTemplateRepository _templateRepository;
        private readonly IMaintenanceWorkOrderRepository _workOrderRepository;
        private readonly IMaintenanceChecklistItemRepository _checklistRepository;
        private readonly IEquipmentRepository _equipmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationService _notificationService;

        public MaintenanceWorkOrderService(
            IMaintenancePlanRepository planRepository,
            IMaintenanceTemplateRepository templateRepository,
            IMaintenanceWorkOrderRepository workOrderRepository,
            IMaintenanceChecklistItemRepository checklistRepository,
            IEquipmentRepository equipmentRepository,
            IUserRepository userRepository,
            INotificationService notificationService)
        {
            _planRepository = planRepository;
            _templateRepository = templateRepository;
            _workOrderRepository = workOrderRepository;
            _checklistRepository = checklistRepository;
            _equipmentRepository = equipmentRepository;
            _userRepository = userRepository;
            _notificationService = notificationService;
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
            // ===== VALIDATION =====
            
            var plan = await _planRepository.GetByIdAsync(request.PlanId);
            if (plan == null)
                throw new InvalidOperationException($"Không tìm thấy kế hoạch bảo trì với ID: {request.PlanId}");

            var equipment = await _equipmentRepository.GetByIdAsync(plan.EquipmentId!.Value);
            if (equipment == null)
                throw new InvalidOperationException($"Không tìm thấy thiết bị với ID: {plan.EquipmentId}");

            // 1. Validate ScheduledDate không được là quá khứ
            if (request.ScheduledDate.Date < DateTime.Today)
                throw new InvalidOperationException("Ngày bảo trì không được là ngày trong quá khứ!");

            // 2. Validate ScheduledDate không được sau DueDate của Plan
            if (request.ScheduledDate.Date > plan.NextDueDate.Date)
                throw new InvalidOperationException($"Ngày bảo trì không được sau ngày đến hạn ({plan.NextDueDate:dd/MM/yyyy}). Vui lòng hoãn kế hoạch bảo trì trước!");

            // 3. Validate phải có ít nhất 1 KTV
            if (string.IsNullOrEmpty(request.AssignedToElectrical) && string.IsNullOrEmpty(request.AssignedToMechanical))
                throw new InvalidOperationException("Phải chọn ít nhất 1 kỹ thuật viên (điện hoặc cơ khí)!");

            var dueDate = request.DueDate ?? request.ScheduledDate;

            // 4. Validate KTV điện nếu được chọn
            if (!string.IsNullOrEmpty(request.AssignedToElectrical))
            {
                var tech = await _userRepository.GetUserByIdAsync(request.AssignedToElectrical);
                if (tech == null)
                    throw new InvalidOperationException($"Không tìm thấy kỹ thuật viên điện với ID: {request.AssignedToElectrical}");
                if (string.IsNullOrEmpty(tech.EmployeeCode))
                    throw new InvalidOperationException("Kỹ thuật viên điện phải có mã nhân viên (EmployeeCode)!");
            }

            // 5. Validate KTV cơ khí nếu được chọn
            if (!string.IsNullOrEmpty(request.AssignedToMechanical))
            {
                var tech = await _userRepository.GetUserByIdAsync(request.AssignedToMechanical);
                if (tech == null)
                    throw new InvalidOperationException($"Không tìm thấy kỹ thuật viên cơ khí với ID: {request.AssignedToMechanical}");
                if (string.IsNullOrEmpty(tech.EmployeeCode))
                    throw new InvalidOperationException("Kỹ thuật viên cơ khí phải có mã nhân viên (EmployeeCode)!");
            }

            // ===== CREATE WORKORDER =====
            
            var workOrderCode = await _workOrderRepository.GenerateWorkOrderCodeAsync();

            var workOrder = new MaintenanceWorkOrder
            {
                WorkOrderCode = workOrderCode,
                PlanId = request.PlanId,
                EquipmentId = plan.EquipmentId.Value,
                AssignedDate = DateTime.Now,
                ScheduledDate = request.ScheduledDate, 
                DueDate = dueDate,
                AssignedToElectrical = request.AssignedToElectrical,
                AssignedToMechanical = request.AssignedToMechanical,
                Status = "Pending",
                Notes = request.Notes,
                CreatedBy = userId,
                CreatedDate = DateTime.Now
            };

            var created = await _workOrderRepository.CreateAsync(workOrder);

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

            await SendWorkOrderAssignmentNotifications(created);

            var result = await _workOrderRepository.GetByIdAsync(created.WorkOrderId);
            return MapWorkOrderToDTO(result!);
        }

        public async Task<MaintenanceWorkOrderDTO> UpdateWorkOrderAsync(int workOrderId, UpdateMaintenanceWorkOrderRequest request, string userId)
        {
            var workOrder = await _workOrderRepository.GetByIdAsync(workOrderId);
            if (workOrder == null)
                throw new InvalidOperationException($"Không tìm thấy phiếu bảo trì với ID: {workOrderId}");

            // ===== VALIDATION =====
            
            // 1. Validate ScheduledDate nếu có
            if (request.ScheduledDate.HasValue)
            {
                var scheduledDate = request.ScheduledDate.Value.Date;
                var today = DateTime.Now.Date;
                
                // Không được là ngày quá khứ
                if (scheduledDate < today)
                {
                    throw new InvalidOperationException("Ngày bảo trì không được là ngày trong quá khứ!");
                }
                
                // ✅ CHỈ validate DueDate nếu WorkOrder CHƯA quá hạn
                // WorkOrder quá hạn được phép dời sang ngày bất kỳ
                if (workOrder.Status != "Overdue" && scheduledDate > workOrder.DueDate.Date)
                {
                    throw new InvalidOperationException($"Ngày bảo trì không được sau ngày đến hạn ({workOrder.DueDate:dd/MM/yyyy})!");
                }
            }
            
            // 2. Validate phải có ít nhất 1 KTV
            if (string.IsNullOrEmpty(request.AssignedToElectrical) && string.IsNullOrEmpty(request.AssignedToMechanical))
            {
                throw new InvalidOperationException("Phải chọn ít nhất 1 kỹ thuật viên (điện hoặc cơ khí)!");
            }

            // 3. Validate KTV điện nếu được chọn
            if (!string.IsNullOrEmpty(request.AssignedToElectrical))
            {
                var electricalTech = await _userRepository.GetUserByIdAsync(request.AssignedToElectrical);
                if (electricalTech == null)
                    throw new InvalidOperationException($"Không tìm thấy kỹ thuật viên điện với ID: {request.AssignedToElectrical}");
            }
            
            // 4. Validate KTV cơ khí nếu được chọn
            if (!string.IsNullOrEmpty(request.AssignedToMechanical))
            {
                var mechanicalTech = await _userRepository.GetUserByIdAsync(request.AssignedToMechanical);
                if (mechanicalTech == null)
                    throw new InvalidOperationException($"Không tìm thấy kỹ thuật viên cơ khí với ID: {request.AssignedToMechanical}");
            }

            // ===== UPDATE WORKORDER =====
            
            var oldElectrical = workOrder.AssignedToElectrical;
            var oldMechanical = workOrder.AssignedToMechanical;

            // Update các field
            if (request.ScheduledDate.HasValue)
            {
                workOrder.ScheduledDate = request.ScheduledDate.Value.Date;
                
                // ✅ Nếu WorkOrder đang Overdue và được cập nhật lại ngày → chuyển về Pending
                if (workOrder.Status == "Overdue")
                {
                    workOrder.Status = "Pending";
                    workOrder.Notes = (workOrder.Notes ?? "") + $"\n[{DateTime.Now:dd/MM/yyyy HH:mm}] Dời lịch bảo trì quá hạn sang {request.ScheduledDate.Value.Date:dd/MM/yyyy}";
                }
            }
            
            
            workOrder.AssignedToElectrical = request.AssignedToElectrical;
            workOrder.AssignedToMechanical = request.AssignedToMechanical;
            
            if (!string.IsNullOrEmpty(request.Status))
                workOrder.Status = request.Status;

            workOrder.Notes = request.Notes;
            workOrder.UpdatedBy = userId;
            workOrder.UpdatedDate = DateTime.Now;

            // Save changes
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

            // Reload entity từ database để lấy fresh data
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

            // ✅ Validate nếu WorkOrder bị hoãn → phải đợi đến ngày hoãn (PostponedDueDate)
            if (workOrder.PostponedDate.HasValue && workOrder.PostponedDueDate.HasValue)
            {
                if (DateTime.Today < workOrder.PostponedDueDate.Value.Date)
                {
                    throw new InvalidOperationException(
                        $"WorkOrder này đã bị hoãn. Không thể bắt đầu trước ngày {workOrder.PostponedDueDate.Value:dd/MM/yyyy}. " +
                        $"Lý do hoãn: {workOrder.PostponedReason}"
                    );
                }
            }

            // ✅ Validate chỉ được start từ ngày ScheduledDate trở đi
            if (DateTime.Today < workOrder.ScheduledDate.Date)
            {
                throw new InvalidOperationException(
                    $"Chưa thể bắt đầu bảo trì. Ngày dự định bảo trì là {workOrder.ScheduledDate:dd/MM/yyyy}. " +
                    $"Vui lòng chờ đến đúng ngày để máy được dừng hoạt động."
                );
            }

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
            
            // ✅ VALIDATION 3: Kiểm tra required items TRƯỚC KHI update
            // Lấy tất cả checklist items hiện tại
            var allChecklistItems = await _checklistRepository.GetByWorkOrderIdAsync(workOrderId);
            
            // Lọc required items thuộc category của technician hiện tại
            var myRequiredItems = allChecklistItems.Where(item => {
                if (isElectrical && item.Category == "Electrical" && item.RequiredRole == "Electrical")
                    return true;
                if (isMechanical && item.Category == "Mechanical" && item.RequiredRole == "Mechanical")
                    return true;
                return false;
            }).ToList();
            
            // Kiểm tra xem tất cả required items có được check trong request không
            var uncheckedRequiredItems = new List<string>();
            foreach (var requiredItem in myRequiredItems)
            {
                var requestItem = request.ChecklistItems.FirstOrDefault(r => r.ChecklistId == requiredItem.ChecklistId);
                if (requestItem == null || !requestItem.IsChecked)
                {
                    uncheckedRequiredItems.Add(requiredItem.StepName);
                }
            }
            
            if (uncheckedRequiredItems.Any())
            {
                var categoryName = isElectrical ? "điện" : "cơ khí";
                throw new InvalidOperationException(
                    $"Không thể hoàn thành phiếu bảo trì. Các bước kiểm tra bắt buộc ({categoryName}) chưa được thực hiện:\n" +
                    $"- {string.Join("\n- ", uncheckedRequiredItems)}\n\n" +
                    $"Vui lòng hoàn thành tất cả các bước bắt buộc trước khi hoàn tất công việc."
                );
            }
            
            foreach (var itemCompletion in request.ChecklistItems)
            {
                var checklistItem = await _checklistRepository.GetByIdAsync(itemCompletion.ChecklistId);
                if (checklistItem != null && checklistItem.WorkOrderId == workOrderId)
                {
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

             allChecklistItems = await _checklistRepository.GetByWorkOrderIdAsync(workOrderId);
            
            Console.WriteLine($"[DEBUG] Total checklist items: {allChecklistItems.Count()}");
            
            bool shouldCompleteWorkOrder = false;
            
            if (hasBothTechnicians)
            {
                var electricalItems = allChecklistItems.Where(i => i.Category == "Electrical").ToList();
                var mechanicalItems = allChecklistItems.Where(i => i.Category == "Mechanical").ToList();
                
                bool electricalCompleted = electricalItems.Any() && electricalItems.All(i => i.IsChecked);
                bool mechanicalCompleted = mechanicalItems.Any() && mechanicalItems.All(i => i.IsChecked);
                
                Console.WriteLine($"[DEBUG] Electrical items: {electricalItems.Count}, Completed: {electricalItems.Count(i => i.IsChecked)}/{electricalItems.Count}");
                Console.WriteLine($"[DEBUG] Mechanical items: {mechanicalItems.Count}, Completed: {mechanicalItems.Count(i => i.IsChecked)}/{mechanicalItems.Count}");
                Console.WriteLine($"[DEBUG] electricalCompleted: {electricalCompleted}, mechanicalCompleted: {mechanicalCompleted}");
                
                shouldCompleteWorkOrder = electricalCompleted && mechanicalCompleted;
                
                Console.WriteLine($"[DEBUG] Has both technicians - shouldCompleteWorkOrder: {shouldCompleteWorkOrder}");
            }
            else
            {
                bool allItemsCompleted = allChecklistItems.All(item => item.IsChecked);
                shouldCompleteWorkOrder = allItemsCompleted;
                
                Console.WriteLine($"[DEBUG] Single technician - allItemsCompleted: {allItemsCompleted}");
            }
            
            if (shouldCompleteWorkOrder)
            {
                workOrder.Status = "Completed";
                workOrder.CompletedDate = DateTime.Now;
                
                // ✅ Reset trạng thái hoãn sau khi hoàn thành
                workOrder.PostponedDate = null;
                workOrder.PostponedDueDate = null;
                workOrder.PostponedReason = null;
                
                if (!string.IsNullOrEmpty(request.OverallNotes))
                {
                    workOrder.Notes = (workOrder.Notes ?? "") + $"\n[{DateTime.Now:dd/MM/yyyy HH:mm}] Hoàn thành: {request.OverallNotes}";
                }
                
                await _workOrderRepository.UpdateAsync(workOrder);
                
                // ✅ Cập nhật chu kỳ tiếp theo: StartDate + IntervalValue * số chu kỳ
                var plan = await _planRepository.GetByIdAsync(workOrder.PlanId);
                if (plan != null)
                {
                    plan.NextDueDate = CalculateNextDueDate(DateTime.Now, plan.IntervalType, plan.IntervalValue);
                    
                    await _planRepository.UpdateAsync(plan);
                    
                    Console.WriteLine($"[DEBUG] Updated Plan {plan.PlanId} - NextDueDate: {plan.NextDueDate:dd/MM/yyyy}, Plan vẫn Active");
                }
                
                
            }
            else
            {
                Console.WriteLine($"[DEBUG] ⏳ Chưa hoàn thành - keeping status as InProgress");
                
                if (workOrder.Status != "Completed")
                {
                    workOrder.Status = "InProgress";
                }
                
                if (!string.IsNullOrEmpty(request.OverallNotes))
                {
                    string techType = isElectrical ? "KTV Điện" : "KTV Cơ khí";
                    workOrder.Notes = (workOrder.Notes ?? "") + $"\n[{DateTime.Now:dd/MM/yyyy HH:mm}] {techType} đã hoàn thành phần của mình: {request.OverallNotes}";
                }
                
                await _workOrderRepository.UpdateAsync(workOrder);
                
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

            // ✅ Check nếu WorkOrder chưa hoàn thành (Pending, Assigned, InProgress, Overdue)
            var shouldUpdateCycle = workOrder.Status != "Completed" && workOrder.Status != "Cancelled";
            
            workOrder.Status = "Cancelled";
            workOrder.Notes = (workOrder.Notes ?? "") + $"\n[{DateTime.Now:dd/MM/yyyy HH:mm}] Cancelled: {reason}";
            workOrder.UpdatedDate = DateTime.Now;
            
            // ✅ Reset trạng thái hoãn khi hủy
            workOrder.PostponedDate = null;
            workOrder.PostponedDueDate = null;
            workOrder.PostponedReason = null;

            await _workOrderRepository.UpdateAsync(workOrder);

            // ✅ Khi hủy WorkOrder chưa hoàn thành → Tự động cập nhật chu kỳ tiếp theo
            if (shouldUpdateCycle)
            {
                var plan = await _planRepository.GetByIdAsync(workOrder.PlanId);
                if (plan != null && plan.IsActive)
                {
                    // Tính chu kỳ tiếp theo từ DueDate (giữ đúng lịch)
                    var nextDueDate = CalculateNextDueDate(workOrder.DueDate, plan.IntervalType, plan.IntervalValue);
                    plan.NextDueDate = nextDueDate;
                    
                    // Reset Plan status về Active
                    plan.Status = "Active";
                    
                    await _planRepository.UpdateAsync(plan);
                    
                    Console.WriteLine($"✅ [CANCEL] WorkOrder #{workOrder.WorkOrderCode} cancelled - Next due date: {nextDueDate:dd/MM/yyyy}");
                }
            }

            var result = await _workOrderRepository.GetByIdAsync(workOrderId);
            return MapWorkOrderToDTO(result!);
        }

        /// <summary>
        /// ✅ HOÃN WORK ORDER - Chỉ cho phép khi:
        /// 1. Chưa giao việc (Pending)
        /// 2. Đã giao việc nhưng chưa ai làm (cả 2 technician đều chưa check item nào)
        /// </summary>
        public async Task<MaintenanceWorkOrderDTO> PostponeWorkOrderAsync(int workOrderId, PostponeWorkOrderRequest request, string userId)
        {
            var workOrder = await _workOrderRepository.GetByIdAsync(workOrderId);
            if (workOrder == null)
                throw new InvalidOperationException($"❌ Không tìm thấy phiếu bảo trì #{workOrderId}");

            // ✅ Lấy Plan để validate NewScheduledDate
            var plan = await _planRepository.GetByIdAsync(workOrder.PlanId);
            if (plan == null)
                throw new InvalidOperationException($"❌ Không tìm thấy kế hoạch bảo trì");

            // ✅ Validate: Không cho hoãn đến sau ngày chu kỳ tiếp theo
            if (request.NewScheduledDate.Date >= plan.NextDueDate.Date)
            {
                throw new InvalidOperationException($"❌ Không thể hoãn đến sau ngày chu kỳ tiếp theo ({plan.NextDueDate:dd/MM/yyyy}). Vui lòng chọn ngày trước đó.");
            }

            // ✅ Validate: Ngày hoãn phải trong tương lai
            if (request.NewScheduledDate.Date <= DateTime.Today)
            {
                throw new InvalidOperationException("❌ Ngày hoãn phải là ngày trong tương lai");
            }

            bool hasAssignedElectrical = !string.IsNullOrEmpty(workOrder.AssignedToElectrical);
            bool hasAssignedMechanical = !string.IsNullOrEmpty(workOrder.AssignedToMechanical);
            bool hasAssignedTechnician = hasAssignedElectrical || hasAssignedMechanical;

            if (hasAssignedTechnician)
            {
                var checklistItems = await _checklistRepository.GetByWorkOrderIdAsync(workOrderId);
                bool hasAnyCheckedItem = checklistItems.Any(item => item.IsChecked);

                if (hasAnyCheckedItem || workOrder.Status == "InProgress")
                {
                    throw new InvalidOperationException(
                        $"❌ Không thể hoãn phiếu bảo trì #{workOrder.WorkOrderCode} vì đã có kỹ thuật viên bắt đầu thực hiện. " +
                        $"Chỉ có thể hoãn khi chưa giao việc hoặc đã giao việc nhưng chưa ai làm."
                    );
                }
            }

            // ✅ CẬP NHẬT: ScheduledDate = NewScheduledDate, giữ nguyên DueDate
            workOrder.ScheduledDate = request.NewScheduledDate;
            
            // ✅ Cập nhật thông tin hoãn (PostponedDueDate để StartWorkOrderAsync validate)
            workOrder.PostponedDueDate = request.NewScheduledDate;
            workOrder.PostponedReason = request.Reason;
            workOrder.PostponedDate = DateTime.Now;
            workOrder.Notes = (workOrder.Notes ?? "") + $"\n[{DateTime.Now:dd/MM/yyyy HH:mm}] Hoãn đến ngày {request.NewScheduledDate:dd/MM/yyyy}. Lý do: {request.Reason}";
            workOrder.UpdatedDate = DateTime.Now;

            await _workOrderRepository.UpdateAsync(workOrder);

            if (hasAssignedElectrical)
            {
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = workOrder.AssignedToElectrical!,
                    Title = "Phiếu bảo trì bị hoãn",
                    Message = $"Phiếu bảo trì #{workOrder.WorkOrderCode} cho thiết bị {workOrder.Equipment?.EquipmentName} đã được hoãn đến ngày {request.NewScheduledDate:dd/MM/yyyy}. Lý do: {request.Reason}"
                });
            }

            if (hasAssignedMechanical)
            {
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = workOrder.AssignedToMechanical!,
                    Title = "Phiếu bảo trì bị hoãn",
                    Message = $"Phiếu bảo trì #{workOrder.WorkOrderCode} cho thiết bị {workOrder.Equipment?.EquipmentName} đã được hoãn đến ngày {request.NewScheduledDate:dd/MM/yyyy}. Lý do: {request.Reason}"
                });
            }

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

        // ===== TECHNICIAN MANAGEMENT =====
        
        public async Task<IEnumerable<TechnicianDTO>> GetAllTechniciansAsync()
        {
            var users = await _userRepository.GetUsersByRoleAsync("Kỹ thuật viên");
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

        public async Task<IEnumerable<TechnicianWorkloadDTO>> GetTechniciansWorkloadByDateAsync(DateTime date)
        {
            var allTechs = await _userRepository.GetUsersByRoleAsync("Kỹ thuật viên");

            var allWorkOrders = await _workOrderRepository.GetAllAsync();
            var workOrdersOnDate = allWorkOrders.Where(wo =>
                wo.ScheduledDate.Date == date.Date
            ).ToList();

            var workloadList = new List<TechnicianWorkloadDTO>();

            foreach (var tech in allTechs)
            {
                var workOrderCount = workOrdersOnDate.Count(wo =>
                    wo.AssignedToElectrical == tech.Id ||
                    wo.AssignedToMechanical == tech.Id
                );

                workloadList.Add(new TechnicianWorkloadDTO
                {
                    UserId = tech.Id,
                    FullName = tech.FullName ?? "",
                    EmployeeCode = tech.EmployeeCode ?? "",
                    RoleName = tech.Role?.Name ?? "",
                    WorkOrderCount = workOrderCount
                });
            }

            return workloadList;
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
                        ScheduledDate = plan.NextDueDate,
                        DueDate = plan.NextDueDate.AddDays(1), // Hạn chót hoàn thành = ScheduledDate + 1 ngày
                        // TODO: Technician assignment - có thể lấy từ Assignments của Plan
                        AssignedToElectrical = null,
                        AssignedToMechanical = null
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
                // ✅ Chỉ mark Overdue, KHÔNG tự động cập nhật chu kỳ
                // TechManager có thể dời ngày hoặc hủy WorkOrder quá hạn
                if (workOrder.Status != "Completed" && workOrder.Status != "Cancelled" && workOrder.DueDate.Date < today)
                {
                    if (workOrder.Status != "Overdue")
                    {
                        workOrder.Status = "Overdue";
                        workOrder.Notes = (workOrder.Notes ?? "") + $"\n[{DateTime.Now:dd/MM/yyyy HH:mm}] Tự động đánh dấu quá hạn";
                        await _workOrderRepository.UpdateAsync(workOrder);
                        
                        Console.WriteLine($"[INFO] WorkOrder #{workOrder.WorkOrderCode} đã quá hạn - TechManager có thể dời lịch hoặc hủy");
                    }
                }
                
                // ✅ TỰ ĐỘNG HỦY WorkOrder quá hạn nếu đã đến chu kỳ tiếp theo
                if (workOrder.Status == "Overdue")
                {
                    var plan = await _planRepository.GetByIdAsync(workOrder.PlanId);
                    if (plan != null && plan.IsActive)
                    {
                        // Nếu đã đến ngày của chu kỳ tiếp theo → Hủy WorkOrder quá hạn
                        if (today >= plan.NextDueDate.Date)
                        {
                            workOrder.Status = "Cancelled";
                            workOrder.Notes = (workOrder.Notes ?? "") + $"\n[{DateTime.Now:dd/MM/yyyy HH:mm}] Tự động hủy - Đã đến chu kỳ tiếp theo ({plan.NextDueDate:dd/MM/yyyy})";
                            await _workOrderRepository.UpdateAsync(workOrder);
                            
                            Console.WriteLine($"[INFO] Tự động hủy WorkOrder #{workOrder.WorkOrderCode} - Đã đến chu kỳ tiếp theo");
                        }
                    }
                }
            }

            var allPlans = await _planRepository.GetAllAsync();
            foreach (var plan in allPlans.Where(p => p.IsActive))
            {
                if (plan.NextDueDate.Date < today && plan.Status != "Overdue")
                {
                    plan.Status = "Overdue";
                    await _planRepository.UpdateAsync(plan);
                }
            }
        }

        public async Task SendMaintenanceRemindersAsync()
        {
            // Lấy tất cả plans đang active
            var allActivePlans = await _planRepository.GetAllAsync();
            var today = DateTime.Today;

            foreach (var plan in allActivePlans.Where(p => p.IsActive))
            {
                var daysUntilDue = (plan.NextDueDate - today).Days;

                // Chỉ gửi thông báo nếu đang trong khoảng ReminderDaysBefore
                // VD: ReminderDaysBefore = 4, NextDueDate = 20/11
                // → Gửi thông báo khi daysUntilDue <= 4 và > 0 (từ 16/11 đến 19/11)
                if (daysUntilDue <= plan.ReminderDaysBefore && daysUntilDue > 0)
                {
                    var techManagers = await _userRepository.GetUsersByRoleAsync("TechManager");
                    foreach (var manager in techManagers)
                    {
                        await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                        {
                            UserId = manager.Id,
                            Title = "⏰ Bảo trì sắp đến hạn",
                            Message = $"Thiết bị {plan.Equipment?.EquipmentName} ({plan.Equipment?.EquipmentCode}) cần bảo trì vào {plan.NextDueDate:dd/MM/yyyy} (còn {daysUntilDue} ngày)"
                        });
                    }

                    // TODO: Gửi notification cho technicians được assign trong WorkOrder hoặc Assignments
                    // Không còn AssignedToElectrical/Mechanical ở Plan level
                }
            }
        }

        // ===== HELPER METHODS =====
        
        private MaintenanceWorkOrderDTO MapWorkOrderToDTO(MaintenanceWorkOrder workOrder)
        {
            var today = DateTime.Today;
            var daysUntilDue = (workOrder.DueDate - today).Days;
            var checklistItems = workOrder.ChecklistItems?.ToList() ?? new List<MaintenanceChecklistItem>();
            var totalItems = checklistItems.Count;
            var completedItems = checklistItems.Count(ci => ci.IsChecked);

            var electricalItems = checklistItems.Where(i => i.Category == "Electrical").ToList();
            var mechanicalItems = checklistItems.Where(i => i.Category == "Mechanical").ToList();
            
            int electricalTotal = electricalItems.Count;
            int electricalCompleted = electricalItems.Count(i => i.IsChecked);
            decimal electricalPercentage = electricalTotal > 0 ? (decimal)electricalCompleted / electricalTotal * 100 : 0;
            
            int mechanicalTotal = mechanicalItems.Count;
            int mechanicalCompleted = mechanicalItems.Count(i => i.IsChecked);
            decimal mechanicalPercentage = mechanicalTotal > 0 ? (decimal)mechanicalCompleted / mechanicalTotal * 100 : 0;

            string electricalStatus = CalculateTechnicianStatus(electricalTotal, electricalCompleted);
            string mechanicalStatus = CalculateTechnicianStatus(mechanicalTotal, mechanicalCompleted);

            string displayStatus = workOrder.Status;
            
            // ✅ CHECK OVERDUE: Nếu DueDate < today và status không phải Completed/Cancelled → set Overdue
            // NHƯNG nếu đã hoãn (có PostponedDate) thì KHÔNG đánh dấu Overdue
            if (workOrder.DueDate < today && 
                workOrder.Status != "Completed" && 
                workOrder.Status != "Cancelled" &&
                workOrder.PostponedDate == null)  // ✅ Không mark Overdue nếu đã hoãn
            {
                displayStatus = "Overdue";
            }
            else if (workOrder.Status == "Completed" || workOrder.Status == "Cancelled")
            {
                displayStatus = workOrder.Status;
            }
            else if (workOrder.Status == "Pending" || workOrder.Status == "InProgress")
            {
                bool hasBothTechnicians = !string.IsNullOrEmpty(workOrder.AssignedToElectrical) && 
                                         !string.IsNullOrEmpty(workOrder.AssignedToMechanical);
                
                if (hasBothTechnicians)
                {
                    bool electricalDone = electricalTotal > 0 && electricalCompleted == electricalTotal;
                    bool mechanicalDone = mechanicalTotal > 0 && mechanicalCompleted == mechanicalTotal;
                    
                    if (electricalDone && mechanicalDone)
                    {
                        displayStatus = "Completed";
                    }
                    else if (completedItems > 0)
                    {
                        displayStatus = "InProgress";
                    }
                    else
                    {
                        displayStatus = "Pending";
                    }
                }
                else
                {
                    // Chỉ có 1 KTV
                    if (totalItems > 0 && completedItems == totalItems)
                    {
                        displayStatus = "Completed";
                    }
                    else if (completedItems > 0)
                    {
                        displayStatus = "InProgress";
                    }
                    else
                    {
                        displayStatus = "Pending";
                    }
                }
            }

            return new MaintenanceWorkOrderDTO
            {
                WorkOrderId = workOrder.WorkOrderId,
                WorkOrderCode = workOrder.WorkOrderCode,
                PlanId = workOrder.PlanId,
                TemplateId = workOrder.Plan?.TemplateId,
                TemplateName = workOrder.Plan?.Template?.TemplateName,
                EquipmentId = workOrder.EquipmentId,
                EquipmentName = workOrder.Equipment?.EquipmentName ?? "",
                EquipmentCode = workOrder.Equipment?.EquipmentCode ?? "",
                StageName = workOrder.Equipment?.Stage?.StageName,
                LineName = workOrder.Equipment?.Stage?.Line?.LineName,
                AssignedDate = workOrder.AssignedDate,
                DueDate = workOrder.DueDate,
                ScheduledDate = workOrder.ScheduledDate,
                StartedDate = workOrder.StartedDate,
                CompletedDate = workOrder.CompletedDate,
                AssignedToElectrical = workOrder.AssignedToElectrical,
                ElectricalTechnicianName = workOrder.ElectricalTechnician?.FullName,
                ElectricalEmployeeCode = workOrder.ElectricalTechnician?.EmployeeCode,
                AssignedToMechanical = workOrder.AssignedToMechanical,
                MechanicalTechnicianName = workOrder.MechanicalTechnician?.FullName,
                MechanicalEmployeeCode = workOrder.MechanicalTechnician?.EmployeeCode,
                Status = displayStatus,
                Notes = workOrder.Notes,
                PostponedDueDate = workOrder.PostponedDueDate,
                PostponedReason = workOrder.PostponedReason,
                PostponedDate = workOrder.PostponedDate,
                ChecklistItems = checklistItems.Select(MapChecklistItemToDTO).OrderBy(ci => ci.OrderIndex).ToList(),
                
                TotalChecklistItems = totalItems,
                CompletedChecklistItems = completedItems,
                CompletionPercentage = totalItems > 0 ? (decimal)completedItems / totalItems * 100 : 0,
                
                ElectricalTotalItems = electricalTotal,
                ElectricalCompletedItems = electricalCompleted,
                ElectricalCompletionPercentage = electricalPercentage,
                ElectricalStatus = electricalStatus, 
                
                MechanicalTotalItems = mechanicalTotal,
                MechanicalCompletedItems = mechanicalCompleted,
                MechanicalCompletionPercentage = mechanicalPercentage,
                MechanicalStatus = mechanicalStatus, 
                
                DaysUntilDue = daysUntilDue,
                IsOverdue = workOrder.DueDate < today && displayStatus != "Completed"
            };
        }

        /// <summary>
        /// Tính trạng thái riêng cho từng KTV dựa vào checklist items của họ
        /// </summary>
        private static string CalculateTechnicianStatus(int totalItems, int completedItems)
        {
            if (totalItems == 0)
            {
                return "N/A";
            }
            
            if (completedItems == 0)
            {
                return "Pending";
            }
            
            if (completedItems == totalItems)
            {
                return "Completed";
            }
            
            return "InProgress";
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
