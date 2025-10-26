using Microsoft.EntityFrameworkCore;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;

namespace FITSKIP.Infrastructure.Repositories
{
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
                .Include(mp => mp.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(mp => mp.AssignedToUser)
                .Include(mp => mp.ChecklistItems)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MaintenancePlan?> GetByIdAsync(int planId)
        {
            return await _context.MaintenancePlans
                .Include(mp => mp.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(mp => mp.AssignedToUser)
                .Include(mp => mp.ChecklistItems)
                .FirstOrDefaultAsync(mp => mp.PlanId == planId);
        }

        public async Task<IEnumerable<MaintenancePlan>> GetByEquipmentIdAsync(int equipmentId)
        {
            return await _context.MaintenancePlans
                .Include(mp => mp.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(mp => mp.AssignedToUser)
                .Include(mp => mp.ChecklistItems)
                .Where(mp => mp.EquipmentId == equipmentId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MaintenancePlan>> GetByAssignedUserAsync(string userId)
        {
            return await _context.MaintenancePlans
                .Include(mp => mp.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(mp => mp.AssignedToUser)
                .Include(mp => mp.ChecklistItems)
                .Where(mp => mp.AssignedTo == userId)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MaintenancePlan>> GetActiveAsync()
        {
            return await _context.MaintenancePlans
                .Include(mp => mp.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(mp => mp.AssignedToUser)
                .Include(mp => mp.ChecklistItems)
                .Where(mp => mp.IsActive)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MaintenancePlan>> GetOverdueAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            return await _context.MaintenancePlans
                .Include(mp => mp.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(mp => mp.AssignedToUser)
                .Include(mp => mp.ChecklistItems)
                .Where(mp => mp.IsActive && mp.NextDueDate < today)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MaintenancePlan>> GetDueWithinDaysAsync(int days)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            var targetDate = today.AddDays(days);
            return await _context.MaintenancePlans
                .Include(mp => mp.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(mp => mp.AssignedToUser)
                .Include(mp => mp.ChecklistItems)
                .Where(mp => mp.IsActive && mp.NextDueDate >= today && mp.NextDueDate <= targetDate)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<IEnumerable<MaintenancePlan>> GetByStatusAsync(string status)
        {
            var today = DateOnly.FromDateTime(DateTime.Today);
            
            IQueryable<MaintenancePlan> query = _context.MaintenancePlans
                .Include(mp => mp.Equipment)
                    .ThenInclude(e => e!.Stage)
                    .ThenInclude(s => s!.Line)
                .Include(mp => mp.AssignedToUser)
                .Include(mp => mp.ChecklistItems);

            query = status.ToLower() switch
            {
                "pending" => query.Where(mp => mp.IsActive && mp.AssignedTo == null),
                "inprogress" => query.Where(mp => mp.IsActive && mp.AssignedTo != null && mp.NextDueDate >= today),
                "overdue" => query.Where(mp => mp.IsActive && mp.NextDueDate < today),
                "completed" => query.Where(mp => !mp.IsActive),
                _ => query
            };

            return await query.AsNoTracking().ToListAsync();
        }

        public async Task<MaintenancePlan> CreateAsync(MaintenancePlan plan)
        {
            await _context.MaintenancePlans.AddAsync(plan);
            await _context.SaveChangesAsync();

            // Reload with includes
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
            return await _context.MaintenancePlans.AnyAsync(mp => mp.PlanId == planId);
        }
    }

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
                .Include(mci => mci.Plan)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<MaintenanceChecklistItem?> GetByIdAsync(int checklistId)
        {
            return await _context.MaintenanceChecklistItems
                .Include(mci => mci.Plan)
                .FirstOrDefaultAsync(mci => mci.ChecklistId == checklistId);
        }

        public async Task<IEnumerable<MaintenanceChecklistItem>> GetByPlanIdAsync(int planId)
        {
            return await _context.MaintenanceChecklistItems
                .Where(mci => mci.PlanId == planId)
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

        public async Task DeleteByPlanIdAsync(int planId)
        {
            var items = await _context.MaintenanceChecklistItems
                .Where(mci => mci.PlanId == planId)
                .ToListAsync();
            
            _context.MaintenanceChecklistItems.RemoveRange(items);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> ExistsAsync(int checklistId)
        {
            return await _context.MaintenanceChecklistItems
                .AnyAsync(mci => mci.ChecklistId == checklistId);
        }

        public async Task<int> GetCompletedCountByPlanIdAsync(int planId)
        {
            return await _context.MaintenanceChecklistItems
                .Where(mci => mci.PlanId == planId && mci.IsChecked == true)
                .CountAsync();
        }

        public async Task<int> GetTotalCountByPlanIdAsync(int planId)
        {
            return await _context.MaintenanceChecklistItems
                .Where(mci => mci.PlanId == planId)
                .CountAsync();
        }
    }
}
