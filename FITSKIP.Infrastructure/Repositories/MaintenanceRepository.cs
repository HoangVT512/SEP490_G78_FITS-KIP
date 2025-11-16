using Microsoft.EntityFrameworkCore;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;

namespace FITSKIP.Infrastructure.Repositories
{
    // ===== MAINTENANCE TEMPLATE REPOSITORY =====
    
    public class MaintenanceTemplateRepository : IMaintenanceTemplateRepository
    {
        private readonly FitskipDbContext _context;

        public MaintenanceTemplateRepository(FitskipDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MaintenanceTemplate>> GetAllAsync()
        {
            return await _context.MaintenanceTemplates
                .Include(t => t.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(t => t.TemplateItems.OrderBy(i => i.OrderIndex))
                .Include(t => t.CreatedByUser)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MaintenanceTemplate?> GetByIdAsync(int templateId)
        {
            return await _context.MaintenanceTemplates
                .Include(t => t.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(t => t.TemplateItems.OrderBy(i => i.OrderIndex))
                .Include(t => t.CreatedByUser)
                .FirstOrDefaultAsync(t => t.TemplateId == templateId);
        }

        public async Task<IEnumerable<MaintenanceTemplate>> GetByStageIdAsync(int stageId)
        {
            return await _context.MaintenanceTemplates
                .Include(t => t.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(t => t.TemplateItems.OrderBy(i => i.OrderIndex))
                .Include(t => t.CreatedByUser)
                .Where(t => t.StageId == stageId && t.IsActive)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MaintenanceTemplate> CreateAsync(MaintenanceTemplate template)
        {
            await _context.MaintenanceTemplates.AddAsync(template);
            await _context.SaveChangesAsync();
            return (await GetByIdAsync(template.TemplateId))!;
        }

        public async Task UpdateAsync(MaintenanceTemplate template)
        {
            _context.MaintenanceTemplates.Update(template);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int templateId)
        {
            var template = await _context.MaintenanceTemplates.FindAsync(templateId);
            if (template != null)
            {
                _context.MaintenanceTemplates.Remove(template);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int templateId)
        {
            return await _context.MaintenanceTemplates.AnyAsync(t => t.TemplateId == templateId);
        }
    }

    public class MaintenanceTemplateItemRepository : IMaintenanceTemplateItemRepository
    {
        private readonly FitskipDbContext _context;

        public MaintenanceTemplateItemRepository(FitskipDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MaintenanceTemplateItem>> GetByTemplateIdAsync(int templateId)
        {
            return await _context.MaintenanceTemplateItems
                .Where(i => i.TemplateId == templateId && i.IsActive)
                .OrderBy(i => i.OrderIndex)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MaintenanceTemplateItem> CreateAsync(MaintenanceTemplateItem item)
        {
            await _context.MaintenanceTemplateItems.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task UpdateAsync(MaintenanceTemplateItem item)
        {
            _context.MaintenanceTemplateItems.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int itemId)
        {
            var item = await _context.MaintenanceTemplateItems.FindAsync(itemId);
            if (item != null)
            {
                _context.MaintenanceTemplateItems.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteByTemplateIdAsync(int templateId)
        {
            var items = await _context.MaintenanceTemplateItems
                .Where(i => i.TemplateId == templateId)
                .ToListAsync();
            
            _context.MaintenanceTemplateItems.RemoveRange(items);
            await _context.SaveChangesAsync();
        }
    }

    // ===== MAINTENANCE PLAN REPOSITORY =====
    
    public class MaintenancePlanRepository : IMaintenancePlanRepository
    {
        private readonly FitskipDbContext _context;

        public MaintenancePlanRepository(FitskipDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MaintenancePlan>> GetAllAsync()
        {
            return await _context.MaintenancePlans
                .Include(p => p.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(p => p.Template)
                .Include(p => p.CreatedByUser)
                .Include(p => p.WorkOrders)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MaintenancePlan?> GetByIdAsync(int planId)
        {
            return await _context.MaintenancePlans
                .Include(p => p.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(p => p.Template)
                    .ThenInclude(t => t!.TemplateItems)
                .Include(p => p.CreatedByUser)
                .Include(p => p.WorkOrders)
                .FirstOrDefaultAsync(p => p.PlanId == planId);
        }

        public async Task<IEnumerable<MaintenancePlan>> GetByEquipmentIdAsync(int equipmentId)
        {
            return await _context.MaintenancePlans
                .Include(p => p.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(p => p.Template)
                .Include(p => p.WorkOrders)
                .Where(p => p.EquipmentId == equipmentId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MaintenancePlan>> GetActiveAsync()
        {
            return await _context.MaintenancePlans
                .Include(p => p.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(p => p.Template)
                .Include(p => p.WorkOrders)
                .Where(p => p.IsActive)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MaintenancePlan>> GetOverdueAsync()
        {
            var today = DateTime.Today;
            return await _context.MaintenancePlans
                .Include(p => p.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(p => p.Template)
                .Include(p => p.WorkOrders)
                .Where(p => p.IsActive && p.NextDueDate < today)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MaintenancePlan>> GetDueWithinDaysAsync(int days)
        {
            var today = DateTime.Today;
            var targetDate = today.AddDays(days);
            return await _context.MaintenancePlans
                .Include(p => p.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(p => p.Template)
                .Include(p => p.WorkOrders)
                .Where(p => p.IsActive && p.NextDueDate >= today && p.NextDueDate <= targetDate)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MaintenancePlan>> GetByStatusAsync(string status)
        {
            return await _context.MaintenancePlans
                .Include(p => p.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(p => p.Template)
                .Include(p => p.WorkOrders)
                .Where(p => p.Status == status)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MaintenancePlan> CreateAsync(MaintenancePlan plan)
        {
            await _context.MaintenancePlans.AddAsync(plan);
            await _context.SaveChangesAsync();
            return (await GetByIdAsync(plan.PlanId))!;
        }

        public async Task UpdateAsync(MaintenancePlan plan)
        {
            _context.MaintenancePlans.Update(plan);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int planId)
        {
            var plan = await _context.MaintenancePlans.FindAsync(planId);
            if (plan != null)
            {
                _context.MaintenancePlans.Remove(plan);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int planId)
        {
            return await _context.MaintenancePlans.AnyAsync(p => p.PlanId == planId);
        }
    }

    // ===== MAINTENANCE WORK ORDER REPOSITORY =====
    
    public class MaintenanceWorkOrderRepository : IMaintenanceWorkOrderRepository
    {
        private readonly FitskipDbContext _context;

        public MaintenanceWorkOrderRepository(FitskipDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MaintenanceWorkOrder>> GetAllAsync()
        {
            return await _context.MaintenanceWorkOrders
                .Include(wo => wo.Plan)
                .Include(wo => wo.Equipment)
                    .ThenInclude(e => e.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(wo => wo.ElectricalTechnician)
                .Include(wo => wo.MechanicalTechnician)
                .Include(wo => wo.ChecklistItems.OrderBy(c => c.OrderIndex))
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MaintenanceWorkOrder?> GetByIdAsync(int workOrderId)
        {
            return await _context.MaintenanceWorkOrders
                .Include(wo => wo.Plan)
                .Include(wo => wo.Equipment)
                    .ThenInclude(e => e.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(wo => wo.ElectricalTechnician)
                .Include(wo => wo.MechanicalTechnician)
                .Include(wo => wo.ChecklistItems.OrderBy(c => c.OrderIndex))
                    .ThenInclude(c => c.CompletedByUser)
                .FirstOrDefaultAsync(wo => wo.WorkOrderId == workOrderId);
        }

        public async Task<IEnumerable<MaintenanceWorkOrder>> GetByPlanIdAsync(int planId)
        {
            return await _context.MaintenanceWorkOrders
                .Include(wo => wo.Plan)
                .Include(wo => wo.Equipment)
                    .ThenInclude(e => e.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(wo => wo.ElectricalTechnician)
                .Include(wo => wo.MechanicalTechnician)
                .Include(wo => wo.ChecklistItems.OrderBy(c => c.OrderIndex))
                .Where(wo => wo.PlanId == planId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MaintenanceWorkOrder>> GetByTechnicianAsync(string technicianId)
        {
            return await _context.MaintenanceWorkOrders
                .Include(wo => wo.Plan)
                .Include(wo => wo.Equipment)
                    .ThenInclude(e => e.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(wo => wo.ElectricalTechnician)
                .Include(wo => wo.MechanicalTechnician)
                .Include(wo => wo.ChecklistItems.OrderBy(c => c.OrderIndex))
                .Where(wo => wo.AssignedToElectrical == technicianId || wo.AssignedToMechanical == technicianId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MaintenanceWorkOrder>> GetByStatusAsync(string status)
        {
            return await _context.MaintenanceWorkOrders
                .Include(wo => wo.Plan)
                .Include(wo => wo.Equipment)
                    .ThenInclude(e => e.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(wo => wo.ElectricalTechnician)
                .Include(wo => wo.MechanicalTechnician)
                .Include(wo => wo.ChecklistItems.OrderBy(c => c.OrderIndex))
                .Where(wo => wo.Status == status)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MaintenanceWorkOrder>> GetPendingAsync()
        {
            return await GetByStatusAsync("Pending");
        }

        public async Task<IEnumerable<MaintenanceWorkOrder>> GetOverdueAsync()
        {
            var today = DateTime.Today;
            return await _context.MaintenanceWorkOrders
                .Include(wo => wo.Plan)
                .Include(wo => wo.Equipment)
                    .ThenInclude(e => e.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(wo => wo.ElectricalTechnician)
                .Include(wo => wo.MechanicalTechnician)
                .Include(wo => wo.ChecklistItems.OrderBy(c => c.OrderIndex))
                .Where(wo => wo.Status != "Completed" && wo.Status != "Cancelled" && wo.DueDate < today)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MaintenanceWorkOrder> CreateAsync(MaintenanceWorkOrder workOrder)
        {
            await _context.MaintenanceWorkOrders.AddAsync(workOrder);
            await _context.SaveChangesAsync();
            return (await GetByIdAsync(workOrder.WorkOrderId))!;
        }

        public async Task UpdateAsync(MaintenanceWorkOrder workOrder)
        {
            // Explicitly mark all properties as modified to force update
            var entry = _context.Entry(workOrder);
            entry.State = EntityState.Modified;
            
            // Force update ScheduledDate even if value is same
            entry.Property(w => w.ScheduledDate).IsModified = true;
            entry.Property(w => w.DueDate).IsModified = true;
            entry.Property(w => w.AssignedToElectrical).IsModified = true;
            entry.Property(w => w.AssignedToMechanical).IsModified = true;
            entry.Property(w => w.Status).IsModified = true;
            entry.Property(w => w.Notes).IsModified = true;
            entry.Property(w => w.UpdatedBy).IsModified = true;
            entry.Property(w => w.UpdatedDate).IsModified = true;
            
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int workOrderId)
        {
            var workOrder = await _context.MaintenanceWorkOrders.FindAsync(workOrderId);
            if (workOrder != null)
            {
                _context.MaintenanceWorkOrders.Remove(workOrder);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsAsync(int workOrderId)
        {
            return await _context.MaintenanceWorkOrders.AnyAsync(wo => wo.WorkOrderId == workOrderId);
        }

        public async Task<string> GenerateWorkOrderCodeAsync()
        {
            var year = DateTime.Now.Year;
            var month = DateTime.Now.Month;
            
            var prefix = $"WO-{year}{month:D2}-";
            
            var lastWorkOrder = await _context.MaintenanceWorkOrders
                .Where(wo => wo.WorkOrderCode.StartsWith(prefix))
                .OrderByDescending(wo => wo.WorkOrderCode)
                .FirstOrDefaultAsync();

            if (lastWorkOrder == null)
            {
                return $"{prefix}001";
            }

            var lastNumber = int.Parse(lastWorkOrder.WorkOrderCode.Substring(prefix.Length));
            return $"{prefix}{(lastNumber + 1):D3}";
        }
    }

    // ===== MAINTENANCE CHECKLIST ITEM REPOSITORY =====
    
    public class MaintenanceChecklistItemRepository : IMaintenanceChecklistItemRepository
    {
        private readonly FitskipDbContext _context;

        public MaintenanceChecklistItemRepository(FitskipDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MaintenanceChecklistItem>> GetAllAsync()
        {
            return await _context.MaintenanceChecklistItems
                .Include(c => c.WorkOrder)
                .Include(c => c.CompletedByUser)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MaintenanceChecklistItem?> GetByIdAsync(int checklistId)
        {
            return await _context.MaintenanceChecklistItems
                .Include(c => c.WorkOrder)
                .Include(c => c.CompletedByUser)
                .FirstOrDefaultAsync(c => c.ChecklistId == checklistId);
        }

        public async Task<IEnumerable<MaintenanceChecklistItem>> GetByWorkOrderIdAsync(int workOrderId)
        {
            return await _context.MaintenanceChecklistItems
                .Include(c => c.CompletedByUser)
                .Where(c => c.WorkOrderId == workOrderId)
                .OrderBy(c => c.OrderIndex)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MaintenanceChecklistItem> CreateAsync(MaintenanceChecklistItem item)
        {
            await _context.MaintenanceChecklistItems.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task UpdateAsync(MaintenanceChecklistItem item)
        {
            _context.MaintenanceChecklistItems.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int checklistId)
        {
            var item = await _context.MaintenanceChecklistItems.FindAsync(checklistId);
            if (item != null)
            {
                _context.MaintenanceChecklistItems.Remove(item);
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteByWorkOrderIdAsync(int workOrderId)
        {
            var items = await _context.MaintenanceChecklistItems
                .Where(c => c.WorkOrderId == workOrderId)
                .ToListAsync();
            
            _context.MaintenanceChecklistItems.RemoveRange(items);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int checklistId)
        {
            return await _context.MaintenanceChecklistItems
                .AnyAsync(c => c.ChecklistId == checklistId);
        }

        public async Task<int> GetCompletedCountByWorkOrderIdAsync(int workOrderId)
        {
            return await _context.MaintenanceChecklistItems
                .Where(c => c.WorkOrderId == workOrderId && c.IsChecked == true)
                .CountAsync();
        }

        public async Task<int> GetTotalCountByWorkOrderIdAsync(int workOrderId)
        {
            return await _context.MaintenanceChecklistItems
                .Where(c => c.WorkOrderId == workOrderId)
                .CountAsync();
        }
    }
}
