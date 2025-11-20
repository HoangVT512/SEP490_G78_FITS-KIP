using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Domain.Exceptions;
using System.Text.RegularExpressions;

namespace FITSKIP.Application.Services;

public class PurchaseRequestService : IPurchaseRequestService
{
    private readonly IPurchaseRequestRepository _purchaseRequestRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationService _notificationService;
    private readonly ISparePartRepository _sparePartRepository;

    public PurchaseRequestService(
        IPurchaseRequestRepository purchaseRequestRepository,
        IUserRepository userRepository,
        INotificationService notificationService,
        ISparePartRepository sparePartRepository
        )
    {
        _purchaseRequestRepository = purchaseRequestRepository;
        _userRepository = userRepository;
        _notificationService = notificationService;
        _sparePartRepository = sparePartRepository;
    }

    public async Task<IReadOnlyList<PurchaseRequestDTO>> GetAllPurchaseRequestsAsync(CancellationToken cancellationToken = default)
    {
        var requests = await _purchaseRequestRepository.GetAllAsync(cancellationToken);
        return requests.Select(r => PurchaseRequestDTO.FromEntity(r)).ToList();
    }

    public async Task<PurchaseRequestDTO?> GetPurchaseRequestByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var request = await _purchaseRequestRepository.GetByIdAsync(id, cancellationToken);
        return request == null ? null : PurchaseRequestDTO.FromEntity(request);
    }

    public async Task<IReadOnlyList<PurchaseRequestDTO>> GetPurchaseRequestsByStatusAsync(string status, CancellationToken cancellationToken = default)
    {
        var requests = await _purchaseRequestRepository.GetByStatusAsync(status, cancellationToken);
        return requests.Select(r => PurchaseRequestDTO.FromEntity(r)).ToList();
    }

    public async Task<IReadOnlyList<PurchaseRequestDTO>> GetMyPurchaseRequestsAsync(string userId, CancellationToken cancellationToken = default)
    {
        var requests = await _purchaseRequestRepository.GetByRequestedByAsync(userId, cancellationToken);
        return requests.Select(r => PurchaseRequestDTO.FromEntity(r)).ToList();
    }

    // Validation-enabled method
    public async Task<PurchaseRequestDTO> CreatePurchaseRequestAsync(
        CreatePurchaseRequestRequest request,
        string userId,
        CancellationToken cancellationToken = default)
    {
        // Validate quantity
        ValidateQuantity(request.Quantity);

        // Validate part ID existence
        await ValidatePartIdAsync(request.PartId, cancellationToken);

        // Validate requested by user existence
        await ValidateRequestedByAsync(userId, cancellationToken);

        // Check if there's already a pending request for this part
        var existingPendingRequest = await _purchaseRequestRepository.GetByPartIdAndStatusAsync(
            request.PartId,
            "Chờ duyệt",
            cancellationToken
        );

        if (existingPendingRequest != null)
        {
            throw new PurchaseRequestValidationException(
                $"Phụ tùng này đã có yêu cầu đang chờ duyệt (REQ{existingPendingRequest.RequestId.ToString().PadLeft(3, '0')}). Vui lòng chờ hoàn thành yêu cầu này trước khi tạo yêu cầu mới!",
                "PURCHASE_REQUEST_DUPLICATE_PENDING",
                new {
                    PartId = request.PartId,
                    ExistingRequestId = existingPendingRequest.RequestId,
                    ExistingRequestCode = $"REQ{existingPendingRequest.RequestId.ToString().PadLeft(3, '0')}"
                });
        }

        // Validate reason if provided
        if (!string.IsNullOrWhiteSpace(request.Reason))
        {
            ValidateReason(request.Reason);
        }

        var purchaseRequest = new PurchaseRequest
        {
            PartId = request.PartId,
            RequestedBy = userId,
            Quantity = request.Quantity,
            Reason = request.Reason,
            Status = "Chờ duyệt" // Default status
        };

        var createdRequest = await _purchaseRequestRepository.CreateAsync(purchaseRequest, cancellationToken);

        // Get user details for notifications
        var user = await _userRepository.GetUserByIdAsync(userId, cancellationToken);

        // Get all managers to send notifications
        var managers = await _userRepository.GetUsersByRoleAsync("Quản lý", cancellationToken);

        // Create notification record in database for each manager
        foreach (var manager in managers)
        {
            if (!string.IsNullOrEmpty(manager.Id))
            {
                await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
                {
                    UserId = manager.Id,
                    Title = "Đơn yêu cầu mua hàng mới",
                    Message = $"Có một đơn yêu cầu mua hàng mới từ {user?.FullName ?? userId} (Mã: {createdRequest.RequestId})"
                });
            }
        }

        // Send ONE real-time notification to all managers group
        await _notificationService.SendNotificationToGroupAsync(
            "Managers",
            "Đơn yêu cầu mua hàng mới",
            $"Có một đơn yêu cầu mua hàng mới từ {user?.FullName ?? userId} (Mã: {createdRequest.RequestId})",
            "info"
        );

        return PurchaseRequestDTO.FromEntity(createdRequest);
    }

    public async Task<PurchaseRequestDTO?> UpdatePurchaseRequestAsync(
        int id,
        UpdatePurchaseRequestRequest request,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var existingRequest = await _purchaseRequestRepository.GetByIdAsync(id, cancellationToken);
        if (existingRequest == null)
        {
            throw new PurchaseRequestValidationException(
                $"Không tìm thấy yêu cầu mua hàng với ID {id}",
                "PURCHASE_REQUEST_NOT_FOUND",
                new { RequestId = id });
        }

        // Only allow the requester to update their own request
        if (existingRequest.RequestedBy != userId)
        {
            throw new PurchaseRequestValidationException(
                "Bạn không có quyền cập nhật yêu cầu này",
                "PURCHASE_REQUEST_UNAUTHORIZED_UPDATE",
                new { RequestId = id, RequestedBy = existingRequest.RequestedBy, CurrentUserId = userId });
        }

        // Only allow update if status is Pending
        if (existingRequest.Status != "Chờ duyệt")
        {
            throw new PurchaseRequestValidationException(
                $"Không thể cập nhật yêu cầu đã {existingRequest.Status}",
                "PURCHASE_REQUEST_CANNOT_UPDATE_STATUS",
                new { RequestId = id, CurrentStatus = existingRequest.Status, RequiredStatus = "Chờ duyệt" });
        }

        // Validate quantity
        ValidateQuantity(request.Quantity);

        // Validate part ID existence
        await ValidatePartIdAsync(request.PartId, cancellationToken);

        // Check for duplicate pending request if PartId is being changed
        if (existingRequest.PartId != request.PartId)
        {
            var existingPendingRequest = await _purchaseRequestRepository.GetByPartIdAndStatusAsync(
                request.PartId,
                "Chờ duyệt",
                cancellationToken
            );

            if (existingPendingRequest != null && existingPendingRequest.RequestId != id)
            {
                throw new PurchaseRequestValidationException(
                    $"Phụ tùng này đã có yêu cầu đang chờ duyệt (REQ{existingPendingRequest.RequestId.ToString().PadLeft(3, '0')}). Không thể thay đổi PartId!",
                    "PURCHASE_REQUEST_DUPLICATE_PENDING",
                    new {
                        PartId = request.PartId,
                        ExistingRequestId = existingPendingRequest.RequestId,
                        ExistingRequestCode = $"REQ{existingPendingRequest.RequestId.ToString().PadLeft(3, '0')}"
                    });
            }
        }

        // Validate reason if provided
        if (!string.IsNullOrWhiteSpace(request.Reason))
        {
            ValidateReason(request.Reason);
        }

        existingRequest.PartId = request.PartId;
        existingRequest.Quantity = request.Quantity;
        existingRequest.Reason = request.Reason;

        var updatedRequest = await _purchaseRequestRepository.UpdateAsync(existingRequest, cancellationToken);
        return updatedRequest == null ? null : PurchaseRequestDTO.FromEntity(updatedRequest);
    }

    public async Task<bool> DeletePurchaseRequestAsync(int id, string userId, CancellationToken cancellationToken = default)
    {
        var existingRequest = await _purchaseRequestRepository.GetByIdAsync(id, cancellationToken);
        if (existingRequest == null)
        {
            return false;
        }

        // Only allow the requester to delete their own request
        if (existingRequest.RequestedBy != userId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền xóa yêu cầu này");
        }

        // Only allow deletion if status is Pending
        if (existingRequest.Status != "Chờ duyệt")
        {
            throw new InvalidOperationException($"Không thể xóa yêu cầu đã {existingRequest.Status}");
        }

        return await _purchaseRequestRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task<PurchaseRequestDTO?> ApprovePurchaseRequestAsync(
        int id,
        string managerId,
        CancellationToken cancellationToken = default)
    {
        var existingRequest = await _purchaseRequestRepository.GetByIdAsync(id, cancellationToken);
        if (existingRequest == null)
        {
            return null;
        }

        // Validate manager exists
        var manager = await _userRepository.GetUserByIdAsync(managerId, cancellationToken);
        if (manager == null)
        {
            throw new InvalidOperationException("Không tìm thấy người duyệt");
        }

        // Only allow approval if status is Pending
        if (existingRequest.Status != "Chờ duyệt")
        {
            throw new InvalidOperationException($"Không thể duyệt yêu cầu đã {existingRequest.Status}");
        }

        existingRequest.Status = "Đã duyệt";
        existingRequest.ApprovedBy = managerId;
        existingRequest.ApprovedAt = DateTime.UtcNow;
        existingRequest.RejectedBy = null;
        existingRequest.RejectedAt = null;

        var updatedRequest = await _purchaseRequestRepository.UpdateAsync(existingRequest, cancellationToken);

        if (updatedRequest != null)
        {
            // Send notification to the requester (QLKT) about approval
            await _notificationService.SendNotificationToUserAsync(
                existingRequest.RequestedBy,
                "Đơn yêu cầu mua hàng được duyệt",
                $"Đơn yêu cầu mua hàng (Mã: {id}) của bạn đã được {manager.FullName} duyệt",
                "success"
            );

            // Create notification record in database
            await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
            {
                UserId = existingRequest.RequestedBy,
                Title = "Đơn yêu cầu mua hàng được duyệt ✓",
                Message = $"Đơn yêu cầu mua hàng (Mã: {id}) của bạn đã được {manager.FullName} duyệt"
            });
        }

        return updatedRequest == null ? null : PurchaseRequestDTO.FromEntity(updatedRequest);
    }

    public async Task<PurchaseRequestDTO?> RejectPurchaseRequestAsync(
        int id,
        string managerId,
        string reason,
        CancellationToken cancellationToken = default)
    {
        var existingRequest = await _purchaseRequestRepository.GetByIdAsync(id, cancellationToken);
        if (existingRequest == null)
        {
            return null;
        }

        // Validate manager exists
        var manager = await _userRepository.GetUserByIdAsync(managerId, cancellationToken);
        if (manager == null)
        {
            throw new InvalidOperationException("Không tìm thấy người từ chối");
        }

        // Only allow rejection if status is Pending
        if (existingRequest.Status != "Chờ duyệt")
        {
            throw new InvalidOperationException($"Không thể từ chối yêu cầu đã {existingRequest.Status}");
        }

        existingRequest.Status = "Từ chối";
        existingRequest.RejectedBy = managerId;
        existingRequest.RejectedAt = DateTime.UtcNow;
        existingRequest.ApprovedBy = null;
        existingRequest.ApprovedAt = null;
        existingRequest.Reason = reason; // Store rejection reason

        var updatedRequest = await _purchaseRequestRepository.UpdateAsync(existingRequest, cancellationToken);

        if (updatedRequest != null)
        {
            // Send notification to the requester (QLKT) about rejection
            await _notificationService.SendNotificationToUserAsync(
                existingRequest.RequestedBy,
                "Đơn yêu cầu mua hàng bị từ chối",
                $"Đơn yêu cầu mua hàng (Mã: {id}) của bạn đã bị {manager.FullName} từ chối. Lý do: {reason}",
                "warning"
            );

            // Create notification record in database
            await _notificationService.CreateNotificationAsync(new CreateNotificationRequest
            {
                UserId = existingRequest.RequestedBy,
                Title = "Đơn yêu cầu mua hàng bị từ chối ✗",
                Message = $"Đơn yêu cầu mua hàng (Mã: {id}) của bạn đã bị {manager.FullName} từ chối. Lý do: {reason}"
            });
        }

        return updatedRequest == null ? null : PurchaseRequestDTO.FromEntity(updatedRequest);
    }

    public async Task<PurchaseRequestDTO?> MarkAsReceivedAsync(
        int id,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var existingRequest = await _purchaseRequestRepository.GetByIdAsync(id, cancellationToken);
        if (existingRequest == null)
        {
            return null;
        }

        // Validate user exists
        var user = await _userRepository.GetUserByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new InvalidOperationException("Không tìm thấy người dùng");
        }

        // Only allow marking as received if status is Approved
        if (existingRequest.Status != "Đã duyệt")
        {
            throw new InvalidOperationException($"Chỉ có thể đánh dấu đã nhập kho cho yêu cầu đã được duyệt");
        }

        // Update spare part quantity in inventory
        var sparePart = await _sparePartRepository.GetByIdAsync(existingRequest.PartId, cancellationToken);
        if (sparePart == null)
        {
            throw new InvalidOperationException("Không tìm thấy phụ tùng trong kho");
        }

        // Increase quantity
        sparePart.Quantity += existingRequest.Quantity;

        // Update spare part status based on new quantity
        if (sparePart.Quantity == 0)
        {
            sparePart.Status = "Hết hàng";
        }
        else if (sparePart.Quantity < sparePart.MinQuantity)
        {
            sparePart.Status = "Sắp hết";
        }
        else
        {
            sparePart.Status = "Đủ hàng";
        }

        await _sparePartRepository.UpdateAsync(sparePart, cancellationToken);

        // Update purchase request status
        existingRequest.Status = "Đã nhập";
        existingRequest.ReceivedAt = DateTime.UtcNow;
        existingRequest.ReceivedBy = userId;

        var updatedRequest = await _purchaseRequestRepository.UpdateAsync(existingRequest, cancellationToken);

        return updatedRequest == null ? null : PurchaseRequestDTO.FromEntity(updatedRequest);
    }

    private void ValidateQuantity(int quantity)
    {
        if (quantity <= 0)
        {
            throw new PurchaseRequestValidationException(
                "Số lượng phải lớn hơn 0",
                "PURCHASE_REQUEST_QUANTITY_INVALID",
                new { Quantity = quantity });
        }

        if (quantity > 10000)
        {
            throw new PurchaseRequestValidationException(
                "Số lượng không được vượt quá 10.000",
                "PURCHASE_REQUEST_QUANTITY_TOO_LARGE",
                new { MaxQuantity = 10000, ActualQuantity = quantity });
        }
    }

    private async Task ValidatePartIdAsync(int partId, CancellationToken cancellationToken)
    {
        var exists = await _sparePartRepository.ExistsAsync(partId, cancellationToken);
        if (!exists)
        {
            throw new PurchaseRequestValidationException(
                $"Không tìm thấy phụ tùng với ID {partId}",
                "SPARE_PART_NOT_FOUND",
                new { PartId = partId });
        }
    }

    private async Task ValidateRequestedByAsync(string requestedBy, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(requestedBy))
        {
            throw new PurchaseRequestValidationException(
                "Người yêu cầu không được để trống",
                "PURCHASE_REQUEST_REQUESTED_BY_REQUIRED");
        }

        var user = await _userRepository.GetUserByIdAsync(requestedBy, cancellationToken);
        if (user == null)
        {
            throw new PurchaseRequestValidationException(
                $"Không tìm thấy người dùng với ID {requestedBy}",
                "USER_NOT_FOUND",
                new { UserId = requestedBy });
        }
    }

    private void ValidateReason(string reason)
    {
        if (reason.Length > 500)
        {
            throw new PurchaseRequestValidationException(
                "Lý do không được vượt quá 500 ký tự",
                "PURCHASE_REQUEST_REASON_TOO_LONG",
                new { MaxLength = 500, ActualLength = reason.Length });
        }
    }
}

