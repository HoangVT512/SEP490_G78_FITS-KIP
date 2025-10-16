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
        Task<IEnumerable<SparePart>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<SparePart?> GetByIdAsync(int partId, CancellationToken cancellationToken = default);
        Task<SparePart> AddAsync(SparePart sparePart, CancellationToken cancellationToken = default);
        Task<bool> UpdateAsync(SparePart sparePart, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int partId, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(int partId, CancellationToken cancellationToken = default);
        Task<IEnumerable<SparePart>> GetTop5MostUsedAsync(CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetReplacementCountsAsync(IEnumerable<int> partIds, CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetPurchaseRequestCountsAsync(IEnumerable<int> partIds, CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetUsageByWeekAsync(int week, int year, CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetUsageByMonthAsync(int month, int year, CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetUsageByCurrentWeekAsync(CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetUsageByCurrentMonthAsync(CancellationToken cancellationToken = default);
    }
}