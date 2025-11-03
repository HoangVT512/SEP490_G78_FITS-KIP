using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Domain.DTO;
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
        public Task<ReplacementHistory> CreateAsync(ReplacementHistory replacementHistory, CancellationToken cancellationToken = default) => _repository.CreateAsync(replacementHistory, cancellationToken);

        public Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default) => _repository.DeleteAsync(id, cancellationToken);

        public Task<IEnumerable<ReplacementHistory>> GetAllAsync(CancellationToken cancellationToken = default) => _repository.GetAllAsync(cancellationToken);

        public Task<IEnumerable<ReplacementHistory>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default) => _repository.GetByDateRangeAsync(startDate, endDate, cancellationToken);

        public Task<IEnumerable<ReplacementHistory>> GetByEquipmentIdAsync(int equipmentId, CancellationToken cancellationToken = default) => _repository.GetByEquipmentIdAsync(equipmentId, cancellationToken);

        public Task<IEnumerable<ReplacementHistory>> GetByIncidentIdAsync(int incidentId, CancellationToken cancellationToken = default) => _repository.GetByIncidentIdAsync(incidentId, cancellationToken);

        public Task<ReplacementHistory> GetByIdAsync(int id, CancellationToken cancellationToken = default) => _repository.GetByIdAsync(id, cancellationToken);

        public Task<IEnumerable<ReplacementHistory>> GetByPartIdAsync(int partId, CancellationToken cancellationToken = default) => _repository.GetByPartIdAsync(partId, cancellationToken);

        public Task<IEnumerable<ReplacementHistory>> GetByStatusAsync(string status1, CancellationToken cancellationToken = default) => _repository.GetByStatusAsync(status1, cancellationToken);

        public Task<IEnumerable<ReplacementHistory>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default) => _repository.GetByUserIdAsync(userId, cancellationToken);

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

        /// <summary>
        /// Xác nhận trả lại linh kiện thừa vào kho
        /// </summary>
        public async Task<ReplacementHistory> ConfirmReturnAsync(int replacementId, ReturnConfirmationDto confirmationDto, CancellationToken cancellationToken = default)
        {
            var existing = await _repository.GetByIdAsync(replacementId, cancellationToken);
            if (existing == null)
                throw new ArgumentException($"Lịch sử thay thế với id {replacementId} không tồn tại");

            // Tính số lượng thừa
            if (confirmationDto.ActualQuantityUsed.HasValue)
            {
                int quantityToReturn = existing.Quantity - confirmationDto.ActualQuantityUsed.Value;
                if (quantityToReturn > 0)
                {
                    existing.ActualQuantityUsed = confirmationDto.ActualQuantityUsed.Value;
                    existing.QuantityToReturn = quantityToReturn;
                }
                else if (quantityToReturn == 0)
                {
                    existing.ActualQuantityUsed = confirmationDto.ActualQuantityUsed.Value;
                    existing.QuantityToReturn = null;
                    existing.Status = "Hoàn thành"; // Đã hoàn thành, không có thừa
                }
            }

            // Cập nhật thông tin trả lại
            existing.ReturnedDate = confirmationDto.ReturnedDate ?? DateTime.Now;
            existing.ReturnConfirmedBy = confirmationDto.ReturnConfirmedBy;
            existing.ReturnRemarks = confirmationDto.ReturnRemarks;

            // Nếu đã xác nhận trả lại, cập nhật status thành "Hoàn thành" (tiếng Việt)
            if (!string.IsNullOrEmpty(confirmationDto.ReturnConfirmedBy))
            {
                existing.Status = "Hoàn thành"; // Hoàn thành - status cuối cùng (tiếng Việt)
            }

            return await _repository.UpdateAsync(existing, cancellationToken);
        }

        /// <summary>
        /// Lấy danh sách các lần thay thế cần trả lại linh kiện (có số lượng thừa)
        /// </summary>
        public async Task<IEnumerable<ReplacementHistory>> GetPendingReturnAsync(CancellationToken cancellationToken = default)
        {
            var allReplacements = await _repository.GetAllAsync(cancellationToken);
            // Lọc các replacement có thừa linh kiện nhưng chưa trả lại
            return allReplacements.Where(r =>
                r.ActualQuantityUsed.HasValue &&
                r.QuantityToReturn.HasValue &&
                r.QuantityToReturn > 0 &&
                string.IsNullOrEmpty(r.ReturnConfirmedBy)
            ).ToList();
        }
    }
}
