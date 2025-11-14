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
            _equipmentRepository = equipmentRepository;
            _incidentRepository = incidentRepository;
            _workOrderRepository = workOrderRepository;
            _sparePartRepository = sparePartRepository;
            _userRepository = userRepository;
        }
        // Validation-enabled methods
        public async Task<ReplacementHistory> CreateAsync(CreateReplacementHistoryRequest request, CancellationToken cancellationToken = default)
        {
            // Validate quantity
            ValidateQuantity(request.Quantity);

            // Validate part ID existence
            await ValidatePartIdAsync(request.PartId, cancellationToken);

            // Validate replaced by user existence
            await ValidateReplacedByAsync(request.ReplacedBy, cancellationToken);

            // Validate equipment ID if provided
            if (request.EquipmentId.HasValue)
            {
                await ValidateEquipmentIdAsync(request.EquipmentId.Value, cancellationToken);
            }

            // Validate incident ID if provided
            if (request.IncidentId.HasValue)
            {
                await ValidateIncidentIdAsync(request.IncidentId.Value, cancellationToken);
            }

            // Validate work order ID if provided
            if (request.WorkOrderId.HasValue)
            {
                await ValidateWorkOrderIdAsync(request.WorkOrderId.Value, cancellationToken);
            }

            // Validate status
            ValidateStatus(request.Status);

            // Validate remarks if provided
            if (!string.IsNullOrWhiteSpace(request.Remarks))
            {
                ValidateRemarks(request.Remarks);
            }

            // Validate replaced date if provided (should be nullable in DTO based on entity)
            if (request.ReplacedDate.HasValue && request.ReplacedDate != DateTime.MinValue)
            {
                ValidateReplacedDate(request.ReplacedDate.Value);
            }

            var replacementHistory = new ReplacementHistory
            {
                EquipmentId = request.EquipmentId,
                IncidentId = request.IncidentId,
                WorkOrderId = request.WorkOrderId,
                PartId = request.PartId,
                Quantity = request.Quantity,
                ReplacedDate = request.ReplacedDate == default(DateTime) ? null : request.ReplacedDate,
                ReplacedBy = request.ReplacedBy,
                Status = request.Status,
                Remarks = request.Remarks
            };

            return await _repository.CreateAsync(replacementHistory, cancellationToken);
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

        public async Task<ReplacementHistory> UpdateAsync(int replacementId, UpdateReplacementHistoryRequest request, CancellationToken cancellationToken = default)
        {
            // Check if replacement history exists
            var existing = await _repository.GetByIdAsync(replacementId, cancellationToken);
            if (existing == null)
            {
                throw new ReplacementHistoryValidationException(
                    $"Lịch sử thay thế với ID {replacementId} không tồn tại",
                    "REPLACEMENT_HISTORY_NOT_FOUND",
                    new { ReplacementId = replacementId });
            }

            // Validate quantity
            ValidateQuantity(request.Quantity);

            // Validate part ID existence
            await ValidatePartIdAsync(request.PartId, cancellationToken);

            // Validate replaced by user existence
            await ValidateReplacedByAsync(request.ReplacedBy, cancellationToken);

            // Validate equipment ID if provided
            if (request.EquipmentId.HasValue)
            {
                await ValidateEquipmentIdAsync(request.EquipmentId.Value, cancellationToken);
            }

            // Validate incident ID if provided
            if (request.IncidentId.HasValue)
            {
                await ValidateIncidentIdAsync(request.IncidentId.Value, cancellationToken);
            }

            // Validate work order ID if provided
            if (request.WorkOrderId.HasValue)
            {
                await ValidateWorkOrderIdAsync(request.WorkOrderId.Value, cancellationToken);
            }

            // Validate status
            ValidateStatus(request.Status);

            // Validate remarks if provided
            if (!string.IsNullOrWhiteSpace(request.Remarks))
            {
                ValidateRemarks(request.Remarks);
            }

            // Validate replaced date
            ValidateReplacedDate(request.ReplacedDate);

            // Validate actual quantity used if provided
            if (request.ActualQuantityUsed.HasValue)
            {
                ValidateActualQuantityUsed(request.ActualQuantityUsed.Value, request.Quantity);
            }

            // Validate quantity to return if provided
            if (request.QuantityToReturn.HasValue)
            {
                ValidateQuantityToReturn(request.QuantityToReturn.Value);
            }

            // Business rule: If actual quantity used is provided, quantity to return should be calculated
            if (request.ActualQuantityUsed.HasValue && !request.QuantityToReturn.HasValue)
            {
                var calculatedQuantityToReturn = request.Quantity - request.ActualQuantityUsed.Value;
                request.QuantityToReturn = calculatedQuantityToReturn > 0 ? calculatedQuantityToReturn : (int?)null;
            }

            var updatedHistory = new ReplacementHistory
            {
                ReplacementId = replacementId,
                EquipmentId = request.EquipmentId,
                IncidentId = request.IncidentId,
                WorkOrderId = request.WorkOrderId,
                PartId = request.PartId,
                Quantity = request.Quantity,
                ReplacedDate = request.ReplacedDate,
                ReplacedBy = request.ReplacedBy,
                Status = request.Status,
                Remarks = request.Remarks,
                ActualQuantityUsed = request.ActualQuantityUsed,
                QuantityToReturn = request.QuantityToReturn
            };

            return await _repository.UpdateAsync(updatedHistory, cancellationToken);
        }

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

            // Nếu đã xác nhận trả lại, cập nhật status thành "Hoàn thành" (tiếng Việt)
            if (!string.IsNullOrEmpty(confirmationDto.ReturnConfirmedBy))
            {
                existing.Status = "Hoàn thành"; // Hoàn thành - status cuối cùng (tiếng Việt)

                // ✅ MỚI: Set ReplacedDate = giờ Việt Nam hiện tại khi hoàn thành trả lại
                if (existing.ReplacedDate == null)
                {
                    existing.ReplacedDate = DateTimeHelper.GetVietnamNow();
                }
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

        private void ValidateQuantity(int quantity)
        {
            if (quantity <= 0)
            {
                throw new ReplacementHistoryValidationException(
                    "Số lượng phải lớn hơn 0",
                    "REPLACEMENT_HISTORY_QUANTITY_INVALID",
                    new { Quantity = quantity });
            }

            if (quantity > 10000)
            {
                throw new ReplacementHistoryValidationException(
                    "Số lượng không được vượt quá 10.000",
                    "REPLACEMENT_HISTORY_QUANTITY_TOO_LARGE",
                    new { MaxQuantity = 10000, ActualQuantity = quantity });
            }
        }

        private async Task ValidatePartIdAsync(int partId, CancellationToken cancellationToken)
        {
            var exists = await _sparePartRepository.ExistsAsync(partId, cancellationToken);
            if (!exists)
            {
                throw new ReplacementHistoryValidationException(
                    $"Không tìm thấy phụ tùng với ID {partId}",
                    "SPARE_PART_NOT_FOUND",
                    new { PartId = partId });
            }
        }

        private async Task ValidateReplacedByAsync(string replacedBy, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(replacedBy))
            {
                throw new ReplacementHistoryValidationException(
                    "Người thay thế không được để trống",
                    "REPLACEMENT_HISTORY_REPLACED_BY_REQUIRED");
            }

            var user = await _userRepository.GetUserByIdAsync(replacedBy, cancellationToken);
            if (user == null)
            {
                throw new ReplacementHistoryValidationException(
                    $"Không tìm thấy người dùng với ID {replacedBy}",
                    "USER_NOT_FOUND",
                    new { UserId = replacedBy });
            }
        }

        private async Task ValidateEquipmentIdAsync(int equipmentId, CancellationToken cancellationToken)
        {
            var equipment = await _equipmentRepository.GetByIdAsync(equipmentId, cancellationToken);
            if (equipment == null)
            {
                throw new ReplacementHistoryValidationException(
                    $"Không tìm thấy thiết bị với ID {equipmentId}",
                    "EQUIPMENT_NOT_FOUND",
                    new { EquipmentId = equipmentId });
            }
        }

        private async Task ValidateIncidentIdAsync(int incidentId, CancellationToken cancellationToken)
        {
            var incident = await _incidentRepository.GetByIdAsync(incidentId, cancellationToken);
            if (incident == null)
            {
                throw new ReplacementHistoryValidationException(
                    $"Không tìm thấy sự cố với ID {incidentId}",
                    "INCIDENT_NOT_FOUND",
                    new { IncidentId = incidentId });
            }
        }

        private async Task ValidateWorkOrderIdAsync(int workOrderId, CancellationToken cancellationToken)
        {
            var workOrder = await _workOrderRepository.GetByIdAsync(workOrderId);
            if (workOrder == null)
            {
                throw new ReplacementHistoryValidationException(
                    $"Không tìm thấy lệnh bảo trì với ID {workOrderId}",
                    "WORK_ORDER_NOT_FOUND",
                    new { WorkOrderId = workOrderId });
            }
        }

        private void ValidateStatus(string status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                throw new ReplacementHistoryValidationException(
                    "Trạng thái không được để trống",
                    "REPLACEMENT_HISTORY_STATUS_REQUIRED");
            }

            // Allow common status values
            var allowedStatuses = new[] { "Chờ duyệt cấp phát", "Đã cấp phát", "Hoàn thành", "Đã hủy", "Chờ trả lại" };
            if (!allowedStatuses.Contains(status.Trim()))
            {
                throw new ReplacementHistoryValidationException(
                    $"Trạng thái '{status}' không hợp lệ. Các trạng thái hợp lệ: {string.Join(", ", allowedStatuses)}",
                    "REPLACEMENT_HISTORY_STATUS_INVALID",
                    new { Status = status, AllowedStatuses = allowedStatuses });
            }
        }

        private void ValidateRemarks(string remarks)
        {
            if (remarks.Length > 500)
            {
                throw new ReplacementHistoryValidationException(
                    "Ghi chú không được vượt quá 500 ký tự",
                    "REPLACEMENT_HISTORY_REMARKS_TOO_LONG",
                    new { MaxLength = 500, ActualLength = remarks.Length });
            }
        }

        private void ValidateReplacedDate(DateTime replacedDate)
        {
            if (replacedDate > DateTime.Now.AddHours(1)) // Allow 1 hour in future for timezone differences
            {
                throw new ReplacementHistoryValidationException(
                    "Ngày thay thế không được ở tương lai",
                    "REPLACEMENT_HISTORY_DATE_IN_FUTURE",
                    new { ReplacedDate = replacedDate });
            }

            if (replacedDate < new DateTime(2000, 1, 1))
            {
                throw new ReplacementHistoryValidationException(
                    "Ngày thay thế không được nhỏ hơn năm 2000",
                    "REPLACEMENT_HISTORY_DATE_TOO_OLD",
                    new { ReplacedDate = replacedDate, MinDate = new DateTime(2000, 1, 1) });
            }
        }

        private void ValidateActualQuantityUsed(int actualQuantityUsed, int requestedQuantity)
        {
            if (actualQuantityUsed < 0)
            {
                throw new ReplacementHistoryValidationException(
                    "Số lượng thực tế sử dụng không được âm",
                    "REPLACEMENT_HISTORY_ACTUAL_QUANTITY_NEGATIVE",
                    new { ActualQuantityUsed = actualQuantityUsed });
            }

            if (actualQuantityUsed > requestedQuantity * 2) // Allow reasonable overage
            {
                throw new ReplacementHistoryValidationException(
                    "Số lượng thực tế sử dụng không được vượt quá 2 lần số lượng yêu cầu",
                    "REPLACEMENT_HISTORY_ACTUAL_QUANTITY_TOO_LARGE",
                    new { ActualQuantityUsed = actualQuantityUsed, RequestedQuantity = requestedQuantity, MaxAllowed = requestedQuantity * 2 });
            }
        }

        private void ValidateQuantityToReturn(int quantityToReturn)
        {
            if (quantityToReturn < 0)
            {
                throw new ReplacementHistoryValidationException(
                    "Số lượng cần trả lại không được âm",
                    "REPLACEMENT_HISTORY_RETURN_QUANTITY_NEGATIVE",
                    new { QuantityToReturn = quantityToReturn });
            }

            if (quantityToReturn > 10000)
            {
                throw new ReplacementHistoryValidationException(
                    "Số lượng cần trả lại không được vượt quá 10.000",
                    "REPLACEMENT_HISTORY_RETURN_QUANTITY_TOO_LARGE",
                    new { MaxQuantity = 10000, ActualQuantity = quantityToReturn });
            }
        }
    }
}
