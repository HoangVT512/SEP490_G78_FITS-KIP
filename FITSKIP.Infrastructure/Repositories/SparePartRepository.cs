using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;

namespace FITSKIP.Infrastructure.Repositories
{
    public class SparePartRepository : ISparePartRepository
    {
        private readonly FitskipDbContext _context;

        public SparePartRepository(FitskipDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SparePart>> GetAllAsync()
        {
            return await _context.SpareParts
                .Include(sp => sp.PurchaseRequests)
                .Include(sp => sp.ReplacementHistories)
                .ToListAsync();
        }

        public async Task<SparePart?> GetByIdAsync(int partId)
        {
            return await _context.SpareParts
                .Include(sp => sp.PurchaseRequests)
                .Include(sp => sp.ReplacementHistories)
                .FirstOrDefaultAsync(sp => sp.PartId == partId);
        }

        public async Task<SparePart> AddAsync(SparePart sparePart)
        {
            var existingPartNumber = await _context.SpareParts
                .FirstOrDefaultAsync(sp => sp.PartNumber == sparePart.PartNumber);
            var existingPartName = await _context.SpareParts
                .FirstOrDefaultAsync(sp => sp.PartName == sparePart.PartName);

            if (existingPartName != null)
            {
                throw new ArgumentException("Tên phụ tùng đã tồn tại");
            }
            if (existingPartNumber != null)
            {
                throw new ArgumentException("Mã phụ tùng đã tồn tại");
            }
            _context.SpareParts.Add(sparePart);
            await _context.SaveChangesAsync();
            return sparePart;
        }

        public async Task<bool> UpdateAsync(SparePart sparePart)
        {
            _context.Entry(sparePart).State = EntityState.Modified;

            try
            {
                var existingPartNumber = await _context.SpareParts
                    .FirstOrDefaultAsync(sp => sp.PartNumber == sparePart.PartNumber && sp.PartId != sparePart.PartId);
                var existingPartName = await _context.SpareParts
                    .FirstOrDefaultAsync(sp => sp.PartName == sparePart.PartName && sp.PartId != sparePart.PartId);

                if (existingPartName != null)
                {
                    throw new ArgumentException("Tên phụ tùng đã tồn tại");
                }
                if (existingPartNumber != null)
                {
                    throw new ArgumentException("Mã phụ tùng đã tồn tại");
                }
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await ExistsAsync(sparePart.PartId))
                    return false;
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int partId)
        {
            var sparePart = await _context.SpareParts
                .Include(sp => sp.PurchaseRequests)
                .Include(sp => sp.ReplacementHistories)
                .FirstOrDefaultAsync(sp => sp.PartId == partId);

            if (sparePart == null)
                return false;

            // Check if spare part is referenced in any purchase requests
            if (sparePart.PurchaseRequests.Any())
            {
                throw new InvalidOperationException("Không thể xóa phụ tùng đang nằm trong yêu cầu mua hàng");
            }

            // Check if spare part is referenced in any replacement histories
            if (sparePart.ReplacementHistories.Any())
            {
                throw new InvalidOperationException("Không thể xóa phụ tùng đã được sử dụng trong lịch sử thay thế");
            }

            _context.SpareParts.Remove(sparePart);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int partId)
        {
            return await _context.SpareParts.AnyAsync(sp => sp.PartId == partId);
        }

        public async Task<IEnumerable<SparePart>> GetTop5MostUsedAsync()
        {
            var topPartIds = await _context.ReplacementHistories
                .GroupBy(rh => rh.PartId)
                .Select(g => new { PartId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .Select(x => x.PartId)
                .ToListAsync();

            return await _context.SpareParts
                .Include(sp => sp.PurchaseRequests)
                .Include(sp => sp.ReplacementHistories)
                .Where(sp => topPartIds.Contains(sp.PartId))
                .ToListAsync();
        }

        public async Task<Dictionary<int, int>> GetReplacementCountsAsync(IEnumerable<int> partIds)
        {
            return await _context.ReplacementHistories
                .Where(rh => partIds.Contains(rh.PartId))
                .GroupBy(rh => rh.PartId)
                .Select(g => new { PartId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.PartId, x => x.Count);
        }

        public async Task<Dictionary<int, int>> GetPurchaseRequestCountsAsync(IEnumerable<int> partIds)
        {
            return await _context.PurchaseRequests
                .Where(pr => partIds.Contains(pr.PartId))
                .GroupBy(pr => pr.PartId)
                .Select(g => new { PartId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.PartId, x => x.Count);
        }

        public async Task<Dictionary<int, int>> GetUsageByWeekAsync(int week, int year)
        {
            var replacements = await _context.ReplacementHistories
                .Where(rh => rh.ReplacedDate.Year == year)
                .ToListAsync();

            var result = replacements
                .Where(rh => GetWeekOfYear(rh.ReplacedDate) == week)
                .GroupBy(rh => rh.PartId)
                .ToDictionary(g => g.Key, g => g.Sum(x => x.Quantity));

            return result;
        }

        public async Task<Dictionary<int, int>> GetUsageByMonthAsync(int month, int year)
        {
            var result = await _context.ReplacementHistories
                .Where(rh => rh.ReplacedDate.Month == month && rh.ReplacedDate.Year == year)
                .GroupBy(rh => rh.PartId)
                .Select(g => new { PartId = g.Key, Quantity = g.Sum(x => x.Quantity) })
                .ToDictionaryAsync(x => x.PartId, x => x.Quantity);

            return result;
        }

        public async Task<Dictionary<int, int>> GetUsageByCurrentWeekAsync()
        {
            var today = DateTime.Now;
            var currentWeek = GetWeekOfYear(today);
            var currentYear = today.Year;

            return await GetUsageByWeekAsync(currentWeek, currentYear);
        }

        public async Task<Dictionary<int, int>> GetUsageByCurrentMonthAsync()
        {
            var today = DateTime.Now;
            var currentMonth = today.Month;
            var currentYear = today.Year;

            return await GetUsageByMonthAsync(currentMonth, currentYear);
        }

        private int GetWeekOfYear(DateTime date)
        {
            var culture = System.Globalization.CultureInfo.CurrentCulture;
            var calendar = culture.Calendar;
            var dateTimeFormat = culture.DateTimeFormat;

            return calendar.GetWeekOfYear(date, dateTimeFormat.CalendarWeekRule, dateTimeFormat.FirstDayOfWeek);
        }
    }
}