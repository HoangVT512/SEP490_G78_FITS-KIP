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
        Task<IEnumerable<SparePart>> GetAllSparePartsAsync();
        Task<SparePart?> GetSparePartByIdAsync(int partId);
        Task<SparePart> CreateSparePartAsync(SparePart sparePart);
        Task<bool> UpdateSparePartAsync(int partId, SparePart sparePart);
        Task<bool> DeleteSparePartAsync(int partId);
        Task<IEnumerable<SparePart>> GetTop5MostUsedSparePartsAsync();
        Task<Dictionary<int, int>> GetUsageByWeekAsync(int week, int year);
        Task<Dictionary<int, int>> GetUsageByMonthAsync(int month, int year);
        Task<Dictionary<int, int>> GetUsageByCurrentWeekAsync();
        Task<Dictionary<int, int>> GetUsageByCurrentMonthAsync();
    }
}