using FITSKIP.Domain.Entities;
using FITSKIP.Domain.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Application.Interfaces
{
    public interface IReplacementHistoryService
    {
        Task<IEnumerable<ReplacementHistory>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<ReplacementHistory> GetByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<ReplacementHistory> CreateAsync(ReplacementHistory replacementHistory, CancellationToken cancellationToken = default);
        Task<ReplacementHistory> UpdateAsync(int ReplacementId, ReplacementHistory replacementHistory, CancellationToken cancellationToken = default);
        Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReplacementHistory>> GetByEquipmentIdAsync(int equipmentId, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReplacementHistory>> GetByPartIdAsync(int partId, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReplacementHistory>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReplacementHistory>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default);
        Task<IEnumerable<ReplacementHistory>> GetByStatusAsync(string status1, CancellationToken cancellationToken = default);

        /// <summary>
        /// Xác nhận trả lại linh kiện thừa vào kho
        /// </summary>
        Task<ReplacementHistory> ConfirmReturnAsync(int replacementId, ReturnConfirmationDto confirmationDto, CancellationToken cancellationToken = default);

        /// <summary>
        /// Lấy danh sách các lần thay thế cần trả lại linh kiện (có số lượng thừa)
        /// </summary>
        Task<IEnumerable<ReplacementHistory>> GetPendingReturnAsync(CancellationToken cancellationToken = default);
    }
}
