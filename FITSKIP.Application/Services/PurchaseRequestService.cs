using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;

namespace FITSKIP.Application.Services;

public class PurchaseRequestService : IPurchaseRequestService
{
    private readonly IPurchaseRequestRepository _purchaseRequestRepository;
    private readonly IUserRepository _userRepository;
    //private readonly ISparePartRepository _sparePartRepository;

    public PurchaseRequestService(
        IPurchaseRequestRepository purchaseRequestRepository,
        IUserRepository userRepository
        //ISparePartRepository sparePartRepository
        )
    {
        _purchaseRequestRepository = purchaseRequestRepository;
        _userRepository = userRepository;
        //_sparePartRepository = sparePartRepository;
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

    public async Task<PurchaseRequestDTO> CreatePurchaseRequestAsync(
        CreatePurchaseRequestRequest request, 
        string userId, 
        CancellationToken cancellationToken = default)
    {
        // Validate user exists
        var user = await _userRepository.GetUserByIdAsync(userId, cancellationToken);
        if (user == null)
        {
            throw new InvalidOperationException("Không tìm thấy người dùng");
        }

        // Validate spare part exists
        //var sparePartExists = await _sparePartRepository.ExistsAsync(request.PartId, cancellationToken);
        //if (!sparePartExists)
        //{
        //    throw new InvalidOperationException($"Không tìm thấy linh kiện với ID: {request.PartId}");
        //}

        var purchaseRequest = new PurchaseRequest
        {
            PartId = request.PartId,
            RequestedBy = userId,
            Quantity = request.Quantity,
            Reason = request.Reason,
            Status = "Pending" // Default status
        };

        var createdRequest = await _purchaseRequestRepository.CreateAsync(purchaseRequest, cancellationToken);
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
            return null;
        }

        // Only allow the requester to update their own request
        if (existingRequest.RequestedBy != userId)
        {
            throw new UnauthorizedAccessException("Bạn không có quyền cập nhật yêu cầu này");
        }

        // Only allow update if status is Pending
        if (existingRequest.Status != "Pending")
        {
            throw new InvalidOperationException($"Không thể cập nhật yêu cầu đã {existingRequest.Status}");
        }

/*        // Validate spare part exists if PartId is being changed
        if (existingRequest.PartId != request.PartId)
        {
            var sparePartExists = await _sparePartRepository.ExistsAsync(request.PartId, cancellationToken);
            if (!sparePartExists)
            {
                throw new InvalidOperationException($"Không tìm thấy linh kiện với ID: {request.PartId}");
            }
        }*/

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
        if (existingRequest.Status != "Pending")
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
        if (existingRequest.Status != "Pending")
        {
            throw new InvalidOperationException($"Không thể duyệt yêu cầu đã {existingRequest.Status}");
        }

        existingRequest.Status = "Approved";
        existingRequest.ApprovedBy = managerId;
        existingRequest.ApprovedAt = DateTime.UtcNow;
        existingRequest.RejectedBy = null;
        existingRequest.RejectedAt = null;

        var updatedRequest = await _purchaseRequestRepository.UpdateAsync(existingRequest, cancellationToken);
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
        if (existingRequest.Status != "Pending")
        {
            throw new InvalidOperationException($"Không thể từ chối yêu cầu đã {existingRequest.Status}");
        }

        existingRequest.Status = "Rejected";
        existingRequest.RejectedBy = managerId;
        existingRequest.RejectedAt = DateTime.UtcNow;
        existingRequest.ApprovedBy = null;
        existingRequest.ApprovedAt = null;
        existingRequest.Reason = reason; // Store rejection reason

        var updatedRequest = await _purchaseRequestRepository.UpdateAsync(existingRequest, cancellationToken);
        return updatedRequest == null ? null : PurchaseRequestDTO.FromEntity(updatedRequest);
    }
}

