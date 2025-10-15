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

        public async Task<IEnumerable<SparePart>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SpareParts
                .Include(sp => sp.PurchaseRequests)
                .Include(sp => sp.ReplacementHistories)
                .ToListAsync(cancellationToken);
        }

        public async Task<SparePart?> GetByIdAsync(int partId, CancellationToken cancellationToken = default)
        {
            return await _context.SpareParts
                .Include(sp => sp.PurchaseRequests)
                .Include(sp => sp.ReplacementHistories)
                .FirstOrDefaultAsync(sp => sp.PartId == partId, cancellationToken);
        }

        public async Task<SparePart> AddAsync(SparePart sparePart, CancellationToken cancellationToken = default)
        {
            var existingPartNumber = await _context.SpareParts
                .FirstOrDefaultAsync(sp => sp.PartNumber == sparePart.PartNumber, cancellationToken);
            var existingPartName = await _context.SpareParts
                .FirstOrDefaultAsync(sp => sp.PartName == sparePart.PartName, cancellationToken);

            if (existingPartName != null)
            {
                throw new InvalidOperationException("Part name already exists");
            }
            if (existingPartNumber != null)
            {
                throw new InvalidOperationException("Part number already exists");
            }
            _context.SpareParts.Add(sparePart);
            await _context.SaveChangesAsync();
            return sparePart;
        }

        public async Task<bool> UpdateAsync(SparePart sparePart, CancellationToken cancellationToken = default)
        {
            _context.Entry(sparePart).State = EntityState.Modified;

            try
            {
                var existingPartNumber = await _context.SpareParts
                    .FirstOrDefaultAsync(sp => sp.PartNumber == sparePart.PartNumber && sp.PartId != sparePart.PartId, cancellationToken);
                var existingPartName = await _context.SpareParts
                    .FirstOrDefaultAsync(sp => sp.PartName == sparePart.PartName && sp.PartId != sparePart.PartId, cancellationToken);

                if (existingPartName != null)
                {
                    throw new InvalidOperationException("Part name already exists");
                }
                if (existingPartNumber != null)
                {
                    throw new InvalidOperationException("Part number already exists");
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

        public async Task<bool> DeleteAsync(int partId, CancellationToken cancellationToken = default)
        {
            var sparePart = await _context.SpareParts.FindAsync(partId, cancellationToken);
            if (sparePart == null)
                return false;

            _context.SpareParts.Remove(sparePart);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int partId, CancellationToken cancellationToken = default)
        {
            return await _context.SpareParts.AnyAsync(sp => sp.PartId == partId);
        }

        public async Task<IEnumerable<SparePart>> GetTop5MostUsedAsync(CancellationToken cancellationToken = default)
        {
            var topPartIds = await _context.ReplacementHistories
                .GroupBy(rh => rh.PartId)
                .Select(g => new { PartId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .Select(x => x.PartId)
                .ToListAsync(cancellationToken);

            return await _context.SpareParts
                .Include(sp => sp.PurchaseRequests)
                .Include(sp => sp.ReplacementHistories)
                .Where(sp => topPartIds.Contains(sp.PartId))
                .ToListAsync(cancellationToken);
        }

        public async Task<Dictionary<int, int>> GetReplacementCountsAsync(IEnumerable<int> partIds, CancellationToken cancellationToken = default)
        {
            return await _context.ReplacementHistories
                .Where(rh => partIds.Contains(rh.PartId))
                .GroupBy(rh => rh.PartId)
                .Select(g => new { PartId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.PartId, x => x.Count, cancellationToken);
        }

        public async Task<Dictionary<int, int>> GetPurchaseRequestCountsAsync(IEnumerable<int> partIds, CancellationToken cancellationToken = default)
        {
            return await _context.PurchaseRequests
                .Where(pr => partIds.Contains(pr.PartId))
                .GroupBy(pr => pr.PartId)
                .Select(g => new { PartId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.PartId, x => x.Count, cancellationToken);
        }

        public async Task<Dictionary<int, int>> GetUsageByWeekAsync(int week, int year, CancellationToken cancellationToken = default)
        {
            var replacements = await _context.ReplacementHistories
                .Where(rh => rh.ReplacedDate.Year == year)
                .ToListAsync(cancellationToken);

            var result = replacements
                .Where(rh => GetWeekOfYear(rh.ReplacedDate) == week)
                .GroupBy(rh => rh.PartId)
                .ToDictionary(g => g.Key, g => g.Sum(x => x.Quantity));

            return result;
        }

        public async Task<Dictionary<int, int>> GetUsageByMonthAsync(int month, int year, CancellationToken cancellationToken = default)
        {
            var result = await _context.ReplacementHistories
                .Where(rh => rh.ReplacedDate.Month == month && rh.ReplacedDate.Year == year)
                .GroupBy(rh => rh.PartId)
                .Select(g => new { PartId = g.Key, Quantity = g.Sum(x => x.Quantity) })
                .ToDictionaryAsync(x => x.PartId, x => x.Quantity, cancellationToken);

            return result;
        }

        public async Task<Dictionary<int, int>> GetUsageByCurrentWeekAsync(CancellationToken cancellationToken = default)
        {
            var today = DateTime.Now;
            var currentWeek = GetWeekOfYear(today);
            var currentYear = today.Year;

            var replacements = await _context.ReplacementHistories
                .Where(rh => rh.ReplacedDate.Year == currentYear)
                .ToListAsync(cancellationToken);

            var result = replacements
                .Where(rh => GetWeekOfYear(rh.ReplacedDate) == currentWeek)
                .GroupBy(rh => rh.PartId)
                .ToDictionary(g => g.Key, g => g.Sum(x => x.Quantity));

            return result;
        }

        public async Task<Dictionary<int, int>> GetUsageByCurrentMonthAsync(CancellationToken cancellationToken = default)
        {
            var today = DateTime.Now;
            var currentMonth = today.Month;
            var currentYear = today.Year;

            var result = await _context.ReplacementHistories
                .Where(rh => rh.ReplacedDate.Month == currentMonth && rh.ReplacedDate.Year == currentYear)
                .GroupBy(rh => rh.PartId)
                .Select(g => new { PartId = g.Key, Quantity = g.Sum(x => x.Quantity) })
                .ToDictionaryAsync(x => x.PartId, x => x.Quantity, cancellationToken);

            return result;
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