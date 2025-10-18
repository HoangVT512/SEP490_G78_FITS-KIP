using Microsoft.EntityFrameworkCore;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;

namespace FITSKIP.Infrastructure.Repositories;

public class PurchaseRequestRepository : IPurchaseRequestRepository
{
    private readonly FitskipDbContext _context;

    public PurchaseRequestRepository(FitskipDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<PurchaseRequest>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.PurchaseRequests
            .Include(pr => pr.Part)
            .Include(pr => pr.RequestedByNavigation)
            .Include(pr => pr.ApprovedByNavigation)
            .Include(pr => pr.RejectedByNavigation)
            .Where(pr => pr.Status != "Deleted") // Soft delete filter
            .OrderByDescending(pr => pr.RequestId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<PurchaseRequest?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.PurchaseRequests
            .Include(pr => pr.Part)
            .Include(pr => pr.RequestedByNavigation)
            .Include(pr => pr.ApprovedByNavigation)
            .Include(pr => pr.RejectedByNavigation)
            .Where(pr => pr.Status != "Deleted") // Soft delete filter
            .FirstOrDefaultAsync(pr => pr.RequestId == id, cancellationToken);
    }

    public async Task<IReadOnlyList<PurchaseRequest>> GetByStatusAsync(string status, CancellationToken cancellationToken = default)
    {
        return await _context.PurchaseRequests
            .Include(pr => pr.Part)
            .Include(pr => pr.RequestedByNavigation)
            .Include(pr => pr.ApprovedByNavigation)
            .Include(pr => pr.RejectedByNavigation)
            .Where(pr => pr.Status == status && pr.Status != "Deleted")
            .OrderByDescending(pr => pr.RequestId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PurchaseRequest>> GetByRequestedByAsync(string userId, CancellationToken cancellationToken = default)
    {
        return await _context.PurchaseRequests
            .Include(pr => pr.Part)
            .Include(pr => pr.RequestedByNavigation)
            .Include(pr => pr.ApprovedByNavigation)
            .Include(pr => pr.RejectedByNavigation)
            .Where(pr => pr.RequestedBy == userId && pr.Status != "Deleted")
            .OrderByDescending(pr => pr.RequestId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<PurchaseRequest?> GetByPartIdAndStatusAsync(int partId, string status, CancellationToken cancellationToken = default)
    {
        return await _context.PurchaseRequests
            .Include(pr => pr.Part)
            .Include(pr => pr.RequestedByNavigation)
            .Where(pr => pr.PartId == partId && pr.Status == status && pr.Status != "Deleted")
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PurchaseRequest> CreateAsync(PurchaseRequest purchaseRequest, CancellationToken cancellationToken = default)
    {
        await _context.PurchaseRequests.AddAsync(purchaseRequest, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // Load navigation properties
        await _context.Entry(purchaseRequest)
            .Reference(pr => pr.Part)
            .LoadAsync(cancellationToken);

        await _context.Entry(purchaseRequest)
            .Reference(pr => pr.RequestedByNavigation)
            .LoadAsync(cancellationToken);

        return purchaseRequest;
    }

    public async Task<PurchaseRequest?> UpdateAsync(PurchaseRequest purchaseRequest, CancellationToken cancellationToken = default)
    {
        _context.PurchaseRequests.Update(purchaseRequest);
        await _context.SaveChangesAsync(cancellationToken);

        // Reload navigation properties
        await _context.Entry(purchaseRequest)
            .Reference(pr => pr.Part)
            .LoadAsync(cancellationToken);

        await _context.Entry(purchaseRequest)
            .Reference(pr => pr.RequestedByNavigation)
            .LoadAsync(cancellationToken);

        if (!string.IsNullOrEmpty(purchaseRequest.ApprovedBy))
        {
            await _context.Entry(purchaseRequest)
                .Reference(pr => pr.ApprovedByNavigation)
                .LoadAsync(cancellationToken);
        }

        if (!string.IsNullOrEmpty(purchaseRequest.RejectedBy))
        {
            await _context.Entry(purchaseRequest)
                .Reference(pr => pr.RejectedByNavigation)
                .LoadAsync(cancellationToken);
        }

        return purchaseRequest;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var purchaseRequest = await _context.PurchaseRequests
            .FirstOrDefaultAsync(pr => pr.RequestId == id, cancellationToken);

        if (purchaseRequest == null)
            return false;

        // Soft delete - set status to "Deleted"
        purchaseRequest.Status = "Deleted";
        _context.PurchaseRequests.Update(purchaseRequest);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}

