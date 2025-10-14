using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces;

public interface IPurchaseRequestService
{
    Task<IReadOnlyList<PurchaseRequestDTO>> GetAllPurchaseRequestsAsync(CancellationToken cancellationToken = default);
    Task<PurchaseRequestDTO?> GetPurchaseRequestByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PurchaseRequestDTO>> GetPurchaseRequestsByStatusAsync(string status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PurchaseRequestDTO>> GetMyPurchaseRequestsAsync(string userId, CancellationToken cancellationToken = default);
    Task<PurchaseRequestDTO> CreatePurchaseRequestAsync(CreatePurchaseRequestRequest request, string userId, CancellationToken cancellationToken = default);
    Task<PurchaseRequestDTO?> UpdatePurchaseRequestAsync(int id, UpdatePurchaseRequestRequest request, string userId, CancellationToken cancellationToken = default);
    Task<bool> DeletePurchaseRequestAsync(int id, string userId, CancellationToken cancellationToken = default);
    Task<PurchaseRequestDTO?> ApprovePurchaseRequestAsync(int id, string managerId, CancellationToken cancellationToken = default);
    Task<PurchaseRequestDTO?> RejectPurchaseRequestAsync(int id, string managerId, string reason, CancellationToken cancellationToken = default);
}

