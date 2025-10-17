using FITSKIP.Domain.Entities;

namespace FITSKIP.Domain.Interfaces;

public interface IPurchaseRequestRepository
{
    Task<IReadOnlyList<PurchaseRequest>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<PurchaseRequest?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PurchaseRequest>> GetByStatusAsync(string status, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PurchaseRequest>> GetByRequestedByAsync(string userId, CancellationToken cancellationToken = default);
    Task<PurchaseRequest?> GetByPartIdAndStatusAsync(int partId, string status, CancellationToken cancellationToken = default);
    Task<PurchaseRequest> CreateAsync(PurchaseRequest purchaseRequest, CancellationToken cancellationToken = default);
    Task<PurchaseRequest?> UpdateAsync(PurchaseRequest purchaseRequest, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
}

