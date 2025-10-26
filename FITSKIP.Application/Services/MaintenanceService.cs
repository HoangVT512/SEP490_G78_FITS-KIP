using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Services
{
    public class MaintenanceService : IMaintenanceService
    {
        private readonly IMaintenancePlanRepository _planRepository;
        private readonly IMaintenanceChecklistItemRepository _checklistRepository;
        private readonly IEquipmentRepository _equipmentRepository;
        private readonly IUserRepository _userRepository;
        private readonly INotificationService _notificationService;

        public MaintenanceService(
            IMaintenancePlanRepository planRepository,
            IMaintenanceChecklistItemRepository checklistRepository,
            IEquipmentRepository equipmentRepository,
            IUserRepository userRepository,
            INotificationService notificationService)
        {
            _planRepository = planRepository;
            _checklistRepository = checklistRepository;
            _equipmentRepository = equipmentRepository;
            _userRepository = userRepository;
            _notificationService = notificationService;
        }

        // ===== Maintenance Plan Management =====
        public async Task<IEnumerable<MaintenancePlanDTO>> GetAllPlansAsync()
        {
            var plans = await _planRepository.GetAllAsync();
            return plans.Select(MapToDTO);
        }

        public async Task<MaintenancePlanDTO?> GetPlanByIdAsync(int planId)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            return plan == null ? null : MapToDTO(plan);
        }

        public async Task<IEnumerable<MaintenancePlanDTO>> GetPlansByEquipmentIdAsync(int equipmentId)
        {
            var plans = await _planRepository.GetByEquipmentIdAsync(equipmentId);
            return plans.Select(MapToDTO);
        }

        public async Task<IEnumerable<MaintenancePlanDTO>> GetActivePlansAsync()
        {
            var plans = await _planRepository.GetActiveAsync();
            return plans.Select(MapToDTO);
        }

        public async Task<IEnumerable<MaintenancePlanDTO>> GetOverduePlansAsync()
        {
            var plans = await _planRepository.GetOverdueAsync();
            return plans.Select(MapToDTO);
        }

        public async Task<IEnumerable<MaintenancePlanDTO>> GetPlansDueWithinDaysAsync(int days)
        {
            var plans = await _planRepository.GetDueWithinDaysAsync(days);
            return plans.Select(MapToDTO);
        }

        public async Task<MaintenancePlanDTO> CreatePlanAsync(CreateMaintenancePlanRequest request)
        {
            // Validate equipment exists
            var equipment = await _equipmentRepository.GetByIdAsync(request.EquipmentId);
            if (equipment == null || !equipment.IsActive)
            {
                throw new InvalidOperationException($"Không tìm thấy thiết bị với ID: {request.EquipmentId}");
            }

            // Calculate NextDueDate based on IntervalType and IntervalValue
            var nextDueDate = CalculateNextDueDate(request.StartDate, request.IntervalType, request.IntervalValue);

            var plan = new MaintenancePlan
            {
                EquipmentId = request.EquipmentId,
                IntervalType = request.IntervalType,
                IntervalValue = request.IntervalValue,
                StartDate = request.StartDate,
                NextDueDate = nextDueDate,
                AssignedTo = request.AssignedTo,
                IsActive = true
            };

            var createdPlan = await _planRepository.CreateAsync(plan);

            // Create checklist items if provided
            if (request.ChecklistSteps != null && request.ChecklistSteps.Any())
            {
                foreach (var step in request.ChecklistSteps)
                {
                    var checklistItem = new MaintenanceChecklistItem
                    {
                        PlanId = createdPlan.PlanId,
                        StepName = step,
                        IsChecked = false
                    };
                    await _checklistRepository.CreateAsync(checklistItem);
                }

                // Reload plan with checklist items
                createdPlan = await _planRepository.GetByIdAsync(createdPlan.PlanId);
            }

            return MapToDTO(createdPlan!);
        }

        public async Task<MaintenancePlanDTO> UpdatePlanAsync(int planId, UpdateMaintenancePlanRequest request)
        {
            var existingPlan = await _planRepository.GetByIdAsync(planId);
            if (existingPlan == null)
            {
                throw new InvalidOperationException($"Không tìm thấy kế hoạch bảo trì với ID: {planId}");
            }

            // Validate equipment exists
            var equipment = await _equipmentRepository.GetByIdAsync(request.EquipmentId);
            if (equipment == null || !equipment.IsActive)
            {
                throw new InvalidOperationException($"Không tìm thấy thiết bị với ID: {request.EquipmentId}");
            }

            existingPlan.EquipmentId = request.EquipmentId;
            existingPlan.IntervalType = request.IntervalType;
            existingPlan.IntervalValue = request.IntervalValue;
            existingPlan.AssignedTo = request.AssignedTo;
            existingPlan.IsActive = request.IsActive;

            if (request.NextDueDate.HasValue)
            {
                existingPlan.NextDueDate = request.NextDueDate.Value;
            }

            await _planRepository.UpdateAsync(existingPlan);

            var updatedPlan = await _planRepository.GetByIdAsync(planId);
            return MapToDTO(updatedPlan!);
        }

        public async Task DeletePlanAsync(int planId)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            if (plan == null)
            {
                throw new InvalidOperationException($"Không tìm thấy kế hoạch bảo trì với ID: {planId}");
            }

            // Delete all checklist items first
            await _checklistRepository.DeleteByPlanIdAsync(planId);

            // Delete the plan
            await _planRepository.DeleteAsync(planId);
        }

        // ===== Work Order Management (for Technical Manager) =====
        public async Task<IEnumerable<MaintenanceRequestDTO>> GetPendingRequestsAsync()
        {
            var pendingPlans = await _planRepository.GetByStatusAsync("pending");
            return pendingPlans.Select(p => new MaintenanceRequestDTO
            {
                PlanId = p.PlanId,
                EquipmentName = p.Equipment?.EquipmentName,
                EquipmentCode = p.Equipment?.EquipmentCode,
                RequestDate = p.StartDate,
                DueDate = p.NextDueDate,
                Status = GetPlanStatus(p),
                RequestedBy = "System", // Auto-generated
                RequestedByName = "Hệ thống"
            });
        }

        public async Task<MaintenancePlanDTO> ApproveRequestAsync(int planId, ApproveMaintenanceRequest request)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            if (plan == null)
            {
                throw new InvalidOperationException($"Không tìm thấy kế hoạch bảo trì với ID: {planId}");
            }

            // Assign technician if provided
            if (!string.IsNullOrEmpty(request.AssignedTo))
            {
                plan.AssignedTo = request.AssignedTo;

                // Send notification to assigned technician
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = request.AssignedTo,
                    Title = "Công việc bảo trì mới",
                    Message = $"Bạn được giao nhiệm vụ bảo trì thiết bị {plan.Equipment?.EquipmentName} ({plan.Equipment?.EquipmentCode}). Hạn: {plan.NextDueDate:dd/MM/yyyy}"
                });

                await _notificationService.SendNotificationToUserAsync(
                    request.AssignedTo,
                    "Công việc bảo trì mới",
                    $"Bạn được giao nhiệm vụ bảo trì thiết bị {plan.Equipment?.EquipmentName} ({plan.Equipment?.EquipmentCode}). Hạn: {plan.NextDueDate:dd/MM/yyyy}",
                    "maintenance"
                );
            }

            // Update scheduled date if provided
            if (request.ScheduledDate.HasValue)
            {
                plan.NextDueDate = request.ScheduledDate.Value;
            }

            await _planRepository.UpdateAsync(plan);

            var updatedPlan = await _planRepository.GetByIdAsync(planId);
            return MapToDTO(updatedPlan!);
        }

        public async Task RejectRequestAsync(int planId, RejectMaintenanceRequest request)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            if (plan == null)
            {
                throw new InvalidOperationException($"Không tìm thấy kế hoạch bảo trì với ID: {planId}");
            }

            // Mark as inactive (rejected)
            plan.IsActive = false;
            await _planRepository.UpdateAsync(plan);
        }

        public async Task<MaintenancePlanDTO> AssignTechnicianAsync(int planId, AssignMaintenanceTechnicianRequest request)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            if (plan == null)
            {
                throw new InvalidOperationException($"Không tìm thấy kế hoạch bảo trì với ID: {planId}");
            }

            // Validate technician exists
            var technician = await _userRepository.GetUserByIdAsync(request.TechnicianId);
            if (technician == null)
            {
                throw new InvalidOperationException($"Không tìm thấy kỹ thuật viên với ID: {request.TechnicianId}");
            }

            plan.AssignedTo = request.TechnicianId;
            await _planRepository.UpdateAsync(plan);

            // Send notification to technician
            await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
            {
                UserId = request.TechnicianId,
                Title = "Công việc bảo trì mới",
                Message = $"Bạn được giao nhiệm vụ bảo trì thiết bị {plan.Equipment?.EquipmentName} ({plan.Equipment?.EquipmentCode}). Hạn: {plan.NextDueDate:dd/MM/yyyy}"
            });

            await _notificationService.SendNotificationToUserAsync(
                request.TechnicianId,
                "Công việc bảo trì mới",
                $"Bạn được giao nhiệm vụ bảo trì thiết bị {plan.Equipment?.EquipmentName} ({plan.Equipment?.EquipmentCode}). Hạn: {plan.NextDueDate:dd/MM/yyyy}",
                "maintenance"
            );

            var updatedPlan = await _planRepository.GetByIdAsync(planId);
            return MapToDTO(updatedPlan!);
        }

        // ===== Work Order for Technician =====
        public async Task<IEnumerable<WorkOrderDTO>> GetWorkOrdersByTechnicianAsync(string technicianId)
        {
            var plans = await _planRepository.GetByAssignedUserAsync(technicianId);
            var activePlans = plans.Where(p => p.IsActive);

            return activePlans.Select(p => new WorkOrderDTO
            {
                PlanId = p.PlanId,
                EquipmentName = p.Equipment?.EquipmentName,
                EquipmentCode = p.Equipment?.EquipmentCode,
                LineName = p.Equipment?.Stage?.Line?.LineName,
                StageName = p.Equipment?.Stage?.StageName,
                DueDate = p.NextDueDate,
                Status = GetPlanStatus(p),
                IsOverdue = p.NextDueDate < DateOnly.FromDateTime(DateTime.Today),
                DaysUntilDue = (p.NextDueDate.ToDateTime(TimeOnly.MinValue) - DateTime.Today).Days,
                ChecklistItems = p.ChecklistItems.Select(ci => new MaintenanceChecklistItemDTO
                {
                    ChecklistId = ci.ChecklistId,
                    PlanId = ci.PlanId,
                    StepName = ci.StepName,
                    IsChecked = ci.IsChecked,
                    CompletedDate = ci.CompletedDate,
                    Notes = ci.Notes
                }).ToList(),
                AssignedToName = p.AssignedToUser?.FullName
            });
        }

        public async Task<WorkOrderDTO?> GetWorkOrderByIdAsync(int planId)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            if (plan == null) return null;

            return new WorkOrderDTO
            {
                PlanId = plan.PlanId,
                EquipmentName = plan.Equipment?.EquipmentName,
                EquipmentCode = plan.Equipment?.EquipmentCode,
                LineName = plan.Equipment?.Stage?.Line?.LineName,
                StageName = plan.Equipment?.Stage?.StageName,
                DueDate = plan.NextDueDate,
                Status = GetPlanStatus(plan),
                IsOverdue = plan.NextDueDate < DateOnly.FromDateTime(DateTime.Today),
                DaysUntilDue = (plan.NextDueDate.ToDateTime(TimeOnly.MinValue) - DateTime.Today).Days,
                ChecklistItems = plan.ChecklistItems.Select(ci => new MaintenanceChecklistItemDTO
                {
                    ChecklistId = ci.ChecklistId,
                    PlanId = ci.PlanId,
                    StepName = ci.StepName,
                    IsChecked = ci.IsChecked,
                    CompletedDate = ci.CompletedDate,
                    Notes = ci.Notes
                }).ToList(),
                AssignedToName = plan.AssignedToUser?.FullName
            };
        }

        public async Task<MaintenancePlanDTO> CompleteMaintenanceAsync(int planId, CompleteMaintenanceRequest request, string userId)
        {
            var plan = await _planRepository.GetByIdAsync(planId);
            if (plan == null)
            {
                throw new InvalidOperationException($"Không tìm thấy kế hoạch bảo trì với ID: {planId}");
            }

            // Update checklist items
            foreach (var itemCompletion in request.ChecklistItems)
            {
                var checklistItem = await _checklistRepository.GetByIdAsync(itemCompletion.ChecklistId);
                if (checklistItem != null && checklistItem.PlanId == planId)
                {
                    checklistItem.IsChecked = itemCompletion.IsChecked;
                    checklistItem.Notes = itemCompletion.Notes;
                    checklistItem.CompletedDate = itemCompletion.IsChecked ? DateTime.Now : null;
                    await _checklistRepository.UpdateAsync(checklistItem);
                }
            }

            // Calculate next due date
            var nextDueDate = CalculateNextDueDate(plan.NextDueDate, plan.IntervalType, plan.IntervalValue);
            plan.NextDueDate = nextDueDate;

            // Mark current plan as completed (inactive) and create new plan for next maintenance
            plan.IsActive = false;
            await _planRepository.UpdateAsync(plan);

            // Create new plan for next cycle
            var newPlan = new MaintenancePlan
            {
                EquipmentId = plan.EquipmentId,
                IntervalType = plan.IntervalType,
                IntervalValue = plan.IntervalValue,
                StartDate = DateOnly.FromDateTime(DateTime.Today),
                NextDueDate = nextDueDate,
                AssignedTo = null, // Will be assigned by manager
                IsActive = true
            };

            var createdPlan = await _planRepository.CreateAsync(newPlan);

            // Copy checklist items to new plan
            foreach (var oldItem in plan.ChecklistItems)
            {
                var newItem = new MaintenanceChecklistItem
                {
                    PlanId = createdPlan.PlanId,
                    StepName = oldItem.StepName,
                    IsChecked = false
                };
                await _checklistRepository.CreateAsync(newItem);
            }

            // Reload with checklist items
            var finalPlan = await _planRepository.GetByIdAsync(createdPlan.PlanId);
            return MapToDTO(finalPlan!);
        }

        // ===== Checklist Management =====
        public async Task<IEnumerable<MaintenanceChecklistItemDTO>> GetChecklistItemsByPlanIdAsync(int planId)
        {
            var items = await _checklistRepository.GetByPlanIdAsync(planId);
            return items.Select(i => new MaintenanceChecklistItemDTO
            {
                ChecklistId = i.ChecklistId,
                PlanId = i.PlanId,
                StepName = i.StepName,
                IsChecked = i.IsChecked,
                CompletedDate = i.CompletedDate,
                Notes = i.Notes
            });
        }

        public async Task<MaintenanceChecklistItemDTO> UpdateChecklistItemAsync(int checklistId, UpdateChecklistItemRequest request)
        {
            var item = await _checklistRepository.GetByIdAsync(checklistId);
            if (item == null)
            {
                throw new InvalidOperationException($"Không tìm thấy checklist item với ID: {checklistId}");
            }

            item.IsChecked = request.IsChecked;
            item.Notes = request.Notes;
            item.CompletedDate = request.IsChecked ? DateTime.Now : null;

            await _checklistRepository.UpdateAsync(item);

            return new MaintenanceChecklistItemDTO
            {
                ChecklistId = item.ChecklistId,
                PlanId = item.PlanId,
                StepName = item.StepName,
                IsChecked = item.IsChecked,
                CompletedDate = item.CompletedDate,
                Notes = item.Notes
            };
        }

        // ===== Statistics & Reports =====
        public async Task<MaintenanceStatsDTO> GetMaintenanceStatsAsync()
        {
            var allPlans = await _planRepository.GetAllAsync();
            var today = DateOnly.FromDateTime(DateTime.Today);

            var stats = new MaintenanceStatsDTO
            {
                TotalPlans = allPlans.Count(),
                ActivePlans = allPlans.Count(p => p.IsActive),
                PendingPlans = allPlans.Count(p => p.IsActive && p.AssignedTo == null),
                InProgressPlans = allPlans.Count(p => p.IsActive && p.AssignedTo != null && p.NextDueDate >= today),
                CompletedPlans = allPlans.Count(p => !p.IsActive),
                OverduePlans = allPlans.Count(p => p.IsActive && p.NextDueDate < today),
                DueThisWeek = allPlans.Count(p => p.IsActive && p.NextDueDate >= today && p.NextDueDate <= today.AddDays(7)),
                DueThisMonth = allPlans.Count(p => p.IsActive && p.NextDueDate >= today && p.NextDueDate <= today.AddDays(30))
            };

            // Calculate completion rate
            if (stats.TotalPlans > 0)
            {
                stats.CompletionRate = (decimal)stats.CompletedPlans / stats.TotalPlans * 100;
            }

            return stats;
        }

        public async Task<IEnumerable<MaintenanceHistoryDTO>> GetMaintenanceHistoryAsync(int? equipmentId = null)
        {
            IEnumerable<MaintenancePlan> plans;

            if (equipmentId.HasValue)
            {
                plans = await _planRepository.GetByEquipmentIdAsync(equipmentId.Value);
            }
            else
            {
                plans = await _planRepository.GetAllAsync();
            }

            var completedPlans = plans.Where(p => !p.IsActive);

            return completedPlans.Select(p => new MaintenanceHistoryDTO
            {
                PlanId = p.PlanId,
                EquipmentName = p.Equipment?.EquipmentName,
                EquipmentCode = p.Equipment?.EquipmentCode,
                CompletedDate = p.NextDueDate,
                CompletedBy = p.AssignedTo,
                CompletedByName = p.AssignedToUser?.FullName,
                ChecklistItems = p.ChecklistItems.Select(ci => new MaintenanceChecklistItemDTO
                {
                    ChecklistId = ci.ChecklistId,
                    PlanId = ci.PlanId,
                    StepName = ci.StepName,
                    IsChecked = ci.IsChecked,
                    CompletedDate = ci.CompletedDate,
                    Notes = ci.Notes
                }).ToList()
            });
        }

        // ===== Auto-generation (System) =====
        public async Task GenerateMaintenancePlansAsync()
        {
            // This method would be called by a background service/scheduler
            // to automatically generate maintenance plans based on equipment settings
            // Implementation depends on business requirements
            await Task.CompletedTask;
        }

        public async Task UpdateOverduePlansAsync()
        {
            // This method would be called by a background service/scheduler
            // to update status of overdue plans and send notifications
            var overduePlans = await _planRepository.GetOverdueAsync();

            foreach (var plan in overduePlans)
            {
                if (!string.IsNullOrEmpty(plan.AssignedTo))
                {
                    await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                    {
                        UserId = plan.AssignedTo,
                        Title = "Công việc bảo trì quá hạn",
                        Message = $"Công việc bảo trì thiết bị {plan.Equipment?.EquipmentName} ({plan.Equipment?.EquipmentCode}) đã quá hạn. Hạn: {plan.NextDueDate:dd/MM/yyyy}"
                    });
                }
            }
        }

        // ===== Helper Methods =====
        private static MaintenancePlanDTO MapToDTO(MaintenancePlan plan)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var daysUntilDue = (plan.NextDueDate.ToDateTime(TimeOnly.MinValue) - DateTime.Today).Days;

            return new MaintenancePlanDTO
            {
                PlanId = plan.PlanId,
                EquipmentId = plan.EquipmentId,
                EquipmentName = plan.Equipment?.EquipmentName,
                EquipmentCode = plan.Equipment?.EquipmentCode,
                LineName = plan.Equipment?.Stage?.Line?.LineName,
                StageName = plan.Equipment?.Stage?.StageName,
                IntervalType = plan.IntervalType,
                IntervalValue = plan.IntervalValue,
                StartDate = plan.StartDate,
                NextDueDate = plan.NextDueDate,
                AssignedTo = plan.AssignedTo,
                AssignedToName = plan.AssignedToUser?.FullName,
                IsActive = plan.IsActive,
                Status = GetPlanStatus(plan),
                DaysUntilDue = daysUntilDue,
                IsOverdue = plan.NextDueDate < today,
                ChecklistItems = plan.ChecklistItems.Select(ci => new MaintenanceChecklistItemDTO
                {
                    ChecklistId = ci.ChecklistId,
                    PlanId = ci.PlanId,
                    StepName = ci.StepName,
                    IsChecked = ci.IsChecked,
                    CompletedDate = ci.CompletedDate,
                    Notes = ci.Notes
                }).ToList()
            };
        }

        private static string GetPlanStatus(MaintenancePlan plan)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);

            if (!plan.IsActive) return "Completed";
            if (plan.NextDueDate < today) return "Overdue";
            if (plan.AssignedTo == null) return "Pending";
            return "InProgress";
        }

        private static DateOnly CalculateNextDueDate(DateOnly currentDate, string intervalType, int intervalValue)
        {
            return intervalType.ToLower() switch
            {
                "days" => currentDate.AddDays(intervalValue),
                "hours" => currentDate.AddDays(Math.Max(1, intervalValue / 24)), // Convert hours to days (minimum 1 day)
                "usagecycles" => currentDate.AddDays(intervalValue), // Simplified - could be based on actual usage
                _ => currentDate.AddDays(intervalValue)
            };
        }
    }
}
