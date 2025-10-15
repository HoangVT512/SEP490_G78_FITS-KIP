using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FITSKIP.Domain.Entities;

namespace FITSKIP.Domain.Interfaces
{
    public interface ISparePartRepository
    {
        Task<IEnumerable<SparePart>> GetAllAsync();
        Task<SparePart?> GetByIdAsync(int partId);
        Task<SparePart> AddAsync(SparePart sparePart);
        Task<bool> UpdateAsync(SparePart sparePart);
        Task<bool> DeleteAsync(int partId);
        Task<bool> ExistsAsync(int partId);
        Task<IEnumerable<SparePart>> GetTop5MostUsedAsync();
        Task<Dictionary<int, int>> GetReplacementCountsAsync(IEnumerable<int> partIds);
        Task<Dictionary<int, int>> GetPurchaseRequestCountsAsync(IEnumerable<int> partIds);
        Task<Dictionary<int, int>> GetUsageByWeekAsync(int week, int year);
        Task<Dictionary<int, int>> GetUsageByMonthAsync(int month, int year);
        Task<Dictionary<int, int>> GetUsageByCurrentWeekAsync();
        Task<Dictionary<int, int>> GetUsageByCurrentMonthAsync();
    }
}