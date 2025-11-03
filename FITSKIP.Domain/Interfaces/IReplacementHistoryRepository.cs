using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Domain.Interfaces
{
    public interface IReplacementHistoryRepository
    {
        Task<IEnumerable<ReplacementHistory>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<ReplacementHistory> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<ReplacementHistory> CreateAsync(ReplacementHistory replacementHistory, CancellationToken cancellationToken = default);
        Task<ReplacementHistory> UpdateAsync(ReplacementHistory replacementHistory, CancellationToken cancellationToken = default);
        Task<bool> ExistsAsync(int replacementId, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReplacementHistory>> GetByEquipmentIdAsync(int equipmentId, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReplacementHistory>> GetByIncidentIdAsync(int incidentId, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReplacementHistory>> GetByPartIdAsync(int partId, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReplacementHistory>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReplacementHistory>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReplacementHistory>> GetByStatusAsync(string status1, CancellationToken cancellationToken = default);
    }

}
