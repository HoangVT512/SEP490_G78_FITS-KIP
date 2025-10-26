using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FITSKIP.Application.Services
{
    public class ReplacementHistoryService : IReplacementHistoryService
    {
        private readonly IReplacementHistoryRepository _repository;
        public ReplacementHistoryService(IReplacementHistoryRepository repository)
        {
             _repository = repository;
        }
        public Task<ReplacementHistory> CreateAsync(ReplacementHistory replacementHistory, CancellationToken cancellationToken = default)=> _repository.CreateAsync(replacementHistory, cancellationToken);

        public Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)=> _repository.DeleteAsync(id, cancellationToken);

        public Task<IEnumerable<ReplacementHistory>> GetAllAsync(CancellationToken cancellationToken = default)=> _repository.GetAllAsync(cancellationToken);

        public Task<IEnumerable<ReplacementHistory>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)=> _repository.GetByDateRangeAsync(startDate, endDate, cancellationToken);

        public Task<IEnumerable<ReplacementHistory>> GetByEquipmentIdAsync(int equipmentId, CancellationToken cancellationToken = default)=> _repository.GetByEquipmentIdAsync(equipmentId, cancellationToken);

        public Task<ReplacementHistory> GetByIdAsync(int id, CancellationToken cancellationToken = default)=> _repository.GetByIdAsync(id, cancellationToken);

        public Task<IEnumerable<ReplacementHistory>> GetByPartIdAsync(int partId, CancellationToken cancellationToken = default)=> _repository.GetByPartIdAsync(partId, cancellationToken);

        public Task<IEnumerable<ReplacementHistory>> GetByStatusAsync(string status1, CancellationToken cancellationToken = default)=> _repository.GetByStatusAsync(status1, cancellationToken);

        public Task<IEnumerable<ReplacementHistory>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)=> _repository.GetByUserIdAsync(userId, cancellationToken);

        public async Task<ReplacementHistory> UpdateAsync(int replacementId, ReplacementHistory replacementHistory, CancellationToken cancellationToken = default)
        {

            if (replacementHistory.Quantity < 0)
                throw new ArgumentException("Số lượng phải lớn hơn 0");


            var exists = await _repository.ExistsAsync(replacementId);
            if (!exists)
            {
                throw new ArgumentException($"Lịch sử thay thế với id {replacementId} không tồn tại");
            }
            replacementHistory.ReplacementId = replacementId;
            return await _repository.UpdateAsync(replacementHistory, cancellationToken);
        }
    }
}
