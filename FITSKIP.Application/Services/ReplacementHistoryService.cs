using FITSKIP.Application.Interfaces;
using FITSKIP.Application.Helpers;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Exceptions;
using System.Text.RegularExpressions;
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
        private readonly IEquipmentRepository _equipmentRepository;
        private readonly IIncidentRepository _incidentRepository;
        private readonly IMaintenanceWorkOrderRepository _workOrderRepository;
        private readonly ISparePartRepository _sparePartRepository;
        private readonly IUserRepository _userRepository;

        public ReplacementHistoryService(
            IReplacementHistoryRepository repository,
            IEquipmentRepository equipmentRepository,
            IIncidentRepository incidentRepository,
            IMaintenanceWorkOrderRepository workOrderRepository,
            ISparePartRepository sparePartRepository,
            IUserRepository userRepository)
        {
            _repository = repository;
        }

        // ✅ FIX - LOGIC ĐÚNG
        private string CalculateStatus(ReplacementHistory rh)
        {
            int returned = rh.QuantityToReturn ?? 0;

            // Case 1: Chưa trả lại gì
            if (returned == 0)
                return "Đã xuất";

            // Case 2: Đã trả đủ (quantityToReturn == quantity) → Hoàn tất (không cần xác nhận)
            if (returned == rh.Quantity)
                return "Hoàn tất";

            // Case 3: Đã trả một phần (0 < quantityToReturn < quantity)
            if (returned > 0 && returned < rh.Quantity)
                return "Đã trả một phần";

            // Default: giữ nguyên status cũ
            return rh.Status;
        }
        public Task<ReplacementHistory> CreateAsync(ReplacementHistory replacementHistory, CancellationToken cancellationToken = default) => _repository.CreateAsync(replacementHistory, cancellationToken);

        public Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default) => _repository.DeleteAsync(id, cancellationToken);

        public async Task<IEnumerable<ReplacementHistory>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var all = await _repository.GetAllAsync(cancellationToken);
            // Recalculate status for each record before returning
            foreach (var rh in all)
            {
                rh.Status = CalculateStatus(rh);
            }
            return all;
        }

        public async Task<IEnumerable<ReplacementHistory>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        {
            var result = await _repository.GetByDateRangeAsync(startDate, endDate, cancellationToken);
            foreach (var rh in result)
            {
                rh.Status = CalculateStatus(rh);
            }
            return result;
        }

        public async Task<IEnumerable<ReplacementHistory>> GetByEquipmentIdAsync(int equipmentId, CancellationToken cancellationToken = default)
        {
            var result = await _repository.GetByEquipmentIdAsync(equipmentId, cancellationToken);
            foreach (var rh in result)
            {
                rh.Status = CalculateStatus(rh);
            }
            return result;
        }

        public async Task<IEnumerable<ReplacementHistory>> GetByIncidentIdAsync(int incidentId, CancellationToken cancellationToken = default)
        {
            var result = await _repository.GetByIncidentIdAsync(incidentId, cancellationToken);
            foreach (var rh in result)
            {
                rh.Status = CalculateStatus(rh);
            }
            return result;
        }

        public async Task<ReplacementHistory> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var result = await _repository.GetByIdAsync(id, cancellationToken);
            result.Status = CalculateStatus(result);
            return result;
        }

        public async Task<IEnumerable<ReplacementHistory>> GetByPartIdAsync(int partId, CancellationToken cancellationToken = default)
        {
            var result = await _repository.GetByPartIdAsync(partId, cancellationToken);
            foreach (var rh in result)
            {
                rh.Status = CalculateStatus(rh);
            }
            return result;
        }

        public async Task<IEnumerable<ReplacementHistory>> GetByStatusAsync(string status, CancellationToken cancellationToken = default)
        {
            var all = await _repository.GetAllAsync(cancellationToken);
            return all.Where(rh =>
            {
                int returned = rh.QuantityToReturn ?? 0;
                switch (status)
                {
                    case "Đã xuất":
                        return returned == 0;
                    case "Đã trả một phần":
                        return returned > 0 && returned < rh.Quantity;
                    case "Hoàn tất":
                        return returned == rh.Quantity;
                    default:
                        return rh.Status == status;
                }
            });
        }

        public async Task<IEnumerable<ReplacementHistory>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
        {
            var result = await _repository.GetByUserIdAsync(userId, cancellationToken);
            foreach (var rh in result)
            {
                rh.Status = CalculateStatus(rh);
            }
            return result;
        }

        public async Task<ReplacementHistory> UpdateAsync(int replacementId, ReplacementHistory replacementHistory, CancellationToken cancellationToken = default)
        {
            if (replacementHistory.Quantity < 0)
                throw new ReplacementHistoryValidationException(
                    "Số lượng phải lớn hơn 0",
                    "REPLACEMENT_HISTORY_QUANTITY_INVALID",
                    new { Quantity = replacementHistory.Quantity });

            var exists = await _repository.ExistsAsync(replacementId);
            if (!exists)
            {
                throw new ReplacementHistoryValidationException(
                    $"Lịch sử thay thế với id {replacementId} không tồn tại",
                    "REPLACEMENT_HISTORY_NOT_FOUND",
                    new { ReplacementId = replacementId });
            }
            replacementHistory.ReplacementId = replacementId;

            // Debug logging
            Console.WriteLine($"=== UpdateAsync Debug ===");
            Console.WriteLine($"ReplacementId: {replacementId}");
            Console.WriteLine($"Quantity: {replacementHistory.Quantity}");
            Console.WriteLine($"QuantityToReturn: {replacementHistory.QuantityToReturn}");
            Console.WriteLine($"ReturnConfirmedBy: {replacementHistory.ReturnConfirmedBy}");
            Console.WriteLine($"Old Status: {replacementHistory.Status}");

            replacementHistory.Status = CalculateStatus(replacementHistory);

            Console.WriteLine($"New Status: {replacementHistory.Status}");
            Console.WriteLine($"===================");

            return await _repository.UpdateAsync(replacementHistory, cancellationToken);
        }

        /// <summary>
        /// Xác nhận trả lại linh kiện thừa vào kho
        /// </summary>
        public async Task<ReplacementHistory> ConfirmReturnAsync(int replacementId, ReturnConfirmationDto confirmationDto, CancellationToken cancellationToken = default)
        {
            var existing = await _repository.GetByIdAsync(replacementId, cancellationToken);
            if (existing == null)
                throw new ReplacementHistoryValidationException(
                    $"Lịch sử thay thế với id {replacementId} không tồn tại",
                    "REPLACEMENT_HISTORY_NOT_FOUND",
                    new { ReplacementId = replacementId });

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
                    existing.Status = "Hoàn tất"; // Đã hoàn thành, không có thừa
                }
            }

            // Cập nhật thông tin trả lại
            existing.ReturnedDate = confirmationDto.ReturnedDate ?? DateTime.Now;
            existing.ReturnConfirmedBy = confirmationDto.ReturnConfirmedBy;

            // Nếu đã xác nhận trả lại, cập nhật status thành "Hoàn tất"
            if (!string.IsNullOrEmpty(confirmationDto.ReturnConfirmedBy))
            {
                existing.Status = "Hoàn tất"; // Hoàn tất - status cuối cùng

                // ✅ MỚI: Set ReplacedDate = giờ Việt Nam hiện tại khi hoàn thành trả lại
                if (existing.ReplacedDate == null)
                {
                    existing.ReplacedDate = DateTimeHelper.GetVietnamNow();
                }
            }

            existing.Status = CalculateStatus(existing);

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

        /// <summary>
        /// Cập nhật status cho tất cả bản ghi dựa trên logic mới
        /// </summary>
        public async Task UpdateAllStatusesAsync(CancellationToken cancellationToken = default)
        {
            var all = await _repository.GetAllAsync(cancellationToken);
            foreach (var rh in all)
            {
                rh.Status = CalculateStatus(rh);
                await _repository.UpdateAsync(rh, cancellationToken);
            }
        }
    }
}
