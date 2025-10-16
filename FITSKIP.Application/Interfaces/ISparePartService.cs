using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FITSKIP.Domain.Entities;

namespace FITSKIP.Application.Interfaces
{
    public interface ISparePartService
    {
        Task<IEnumerable<SparePart>> GetAllSparePartsAsync(CancellationToken cancellationToken = default);
        Task<SparePart?> GetSparePartByIdAsync(int partId, CancellationToken cancellationToken = default);
        Task<SparePart> CreateSparePartAsync(SparePart sparePart, CancellationToken cancellationToken = default);
        Task<bool> UpdateSparePartAsync(int partId, SparePart sparePart, CancellationToken cancellationToken = default);
        Task<bool> DeleteSparePartAsync(int partId, CancellationToken cancellationToken = default);
        Task<IEnumerable<SparePart>> GetTop5MostUsedSparePartsAsync(CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetUsageByWeekAsync(int week, int year, CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetUsageByMonthAsync(int month, int year, CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetUsageByCurrentWeekAsync(CancellationToken cancellationToken = default);
        Task<Dictionary<int, int>> GetUsageByCurrentMonthAsync(CancellationToken cancellationToken = default);
    }
}