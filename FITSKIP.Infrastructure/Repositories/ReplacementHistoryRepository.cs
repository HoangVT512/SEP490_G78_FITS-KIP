using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Infrastructure.DbContexts;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace FITSKIP.Infrastructure.Repositories
{
    public class ReplacementHistoryRepository : IReplacementHistoryRepository
    {
        private readonly FitskipDbContext _context;

        public ReplacementHistoryRepository(
            FitskipDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ReplacementHistory>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                return await _context.ReplacementHistories
                    .Include(r => r.Equipment)
                    .Include(r => r.Part)
                    .Include(r => r.ReplacedByNavigation)
                    .ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new Exception("Đã xảy ra lỗi khi truy xuất tất cả lịch sử thay thế.", ex);
            }
        }

        public async Task<ReplacementHistory> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                var history = await _context.ReplacementHistories
                    .Include(r => r.Equipment)
                    .Include(r => r.Part)
                    .Include(r => r.ReplacedByNavigation)
                    .FirstOrDefaultAsync(r => r.ReplacementId == id, cancellationToken);

                if (history == null)
                {
                    throw new KeyNotFoundException($"Lịch sử thay thế với ID {id} không tồn tại.");
                }

                return history;
            }
            catch (Exception ex)
            {
                throw new Exception($"Đã xảy ra lỗi khi truy xuất lịch sử thay thế bằng ID {id}.", ex);
            }
        }

        public async Task<ReplacementHistory> CreateAsync(ReplacementHistory replacementHistory, CancellationToken cancellationToken = default)
        {
            using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                // Validate Equipment exists (if provided)
                if (replacementHistory.EquipmentId.HasValue)
                {
                    var equipment = await _context.Equipment.FindAsync(new object[] { replacementHistory.EquipmentId.Value }, cancellationToken);
                    if (equipment == null)
                    {
                        throw new KeyNotFoundException($"Thiết bị với ID {replacementHistory.EquipmentId.Value} không tồn tại.");
                    }
                }

                // Validate Part exists
                var part = await _context.SpareParts.FindAsync(new object[] { replacementHistory.PartId }, cancellationToken);
                if (part == null)
                {
                    throw new KeyNotFoundException($"SparePart với ID {replacementHistory.PartId} không tồn tại.");
                }

                // Validate User exists
                var user = await _context.Users.FindAsync(new object[] { replacementHistory.ReplacedBy }, cancellationToken);
                if (user == null)
                {
                    throw new KeyNotFoundException($"Người dùng có ID {replacementHistory.ReplacedBy} không tồn tại.");
                }

                // Check if sufficient quantity is available
                if (part.Quantity < replacementHistory.Quantity)
                {
                    throw new InvalidOperationException($"Số lượng không đủ cho Sparepart ID {replacementHistory.PartId}. Đã yêu cầu: {replacementHistory.Quantity}, Có sẵn: {part.Quantity}.");
                }

                // Create replacement history
                _context.ReplacementHistories.Add(replacementHistory);

                // Update part quantity
                part.Quantity -= replacementHistory.Quantity;
                _context.SpareParts.Update(part);

                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);


                return replacementHistory;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new Exception("Đã xảy ra lỗi khi tạo lịch sử thay thế.", ex);
            }
        }

        public async Task<ReplacementHistory> UpdateAsync(ReplacementHistory replacementHistory, CancellationToken cancellationToken = default)
        {
            using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                var existingHistory = await _context.ReplacementHistories.FindAsync(new object[] { replacementHistory.ReplacementId }, cancellationToken);
                if (existingHistory == null)
                {
                    throw new KeyNotFoundException($"Lịch sử thay thế với ID {replacementHistory.ReplacementId} không tồn tại.");
                }

                // Validate Equipment exists (if provided)
                if (replacementHistory.EquipmentId.HasValue)
                {
                    var equipment = await _context.Equipment.FindAsync(new object[] { replacementHistory.EquipmentId.Value }, cancellationToken);
                    if (equipment == null)
                    {
                        throw new KeyNotFoundException($"Thiết bị với ID {replacementHistory.EquipmentId.Value} không tồn tại.");
                    }
                }

                // Validate Part exists
                var part = await _context.SpareParts.FindAsync(new object[] { replacementHistory.PartId }, cancellationToken);
                if (part == null)
                {
                    throw new KeyNotFoundException($"Sparepart với ID {replacementHistory.PartId} không tồn tại.");
                }

                // Validate User exists
                var user = await _context.Users.FindAsync(new object[] { replacementHistory.ReplacedBy }, cancellationToken);
                if (user == null)
                {
                    throw new KeyNotFoundException($"Người dùng với ID {replacementHistory.ReplacedBy} không tồn tại.");
                }

                // If quantity or part changed, adjust inventory
                if (existingHistory.PartId != replacementHistory.PartId || existingHistory.Quantity != replacementHistory.Quantity)
                {
                    // Restore old part quantity
                    var oldPart = await _context.SpareParts.FindAsync(new object[] { existingHistory.PartId }, cancellationToken);
                    if (oldPart != null)
                    {
                        oldPart.Quantity += existingHistory.Quantity;
                        _context.SpareParts.Update(oldPart);
                    }

                    // Check new part quantity
                    if (part.Quantity < replacementHistory.Quantity)
                    {
                        throw new InvalidOperationException($"Số lượng không đủ cho Sparepart ID {replacementHistory.PartId}. Đã yêu cầu: {replacementHistory.Quantity}, Có sẵn: {part.Quantity}.");
                    }

                    // Deduct new part quantity
                    part.Quantity -= replacementHistory.Quantity;
                    _context.SpareParts.Update(part);
                }

                // Update history
                existingHistory.EquipmentId = replacementHistory.EquipmentId;
                existingHistory.PartId = replacementHistory.PartId;
                existingHistory.Quantity = replacementHistory.Quantity;
                existingHistory.ReplacedDate = replacementHistory.ReplacedDate;
                existingHistory.ReplacedBy = replacementHistory.ReplacedBy;
                existingHistory.Status = replacementHistory.Status;
                existingHistory.Remarks = replacementHistory.Remarks;

                _context.ReplacementHistories.Update(existingHistory);
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);


                return existingHistory;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new Exception($"Đã xảy ra lỗi khi cập nhật lịch sử thay thế với ID {replacementHistory.ReplacementId}.", ex);
            }
        }

        public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

            try
            {
                var history = await _context.ReplacementHistories.FindAsync(new object[] { id }, cancellationToken);
                if (history == null)
                {
                    throw new KeyNotFoundException($"Lịch sử thay thế với ID {id} không tồn tại.");
                }

                // Restore part quantity
                var part = await _context.SpareParts.FindAsync(new object[] { history.PartId }, cancellationToken);
                if (part != null)
                {
                    part.Quantity += history.Quantity;
                    _context.SpareParts.Update(part);
                }

                _context.ReplacementHistories.Remove(history);
                await _context.SaveChangesAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);


                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new Exception($"Đã xảy ra lỗi khi xóa lịch sử thay thế với ID {id}.", ex);
            }
        }

        public async Task<IEnumerable<ReplacementHistory>> GetByEquipmentIdAsync(int equipmentId, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _context.ReplacementHistories
                    .Include(r => r.Equipment)
                    .Include(r => r.Part)
                    .Include(r => r.ReplacedByNavigation)
                    .Where(r => r.EquipmentId == equipmentId)
                    .ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new Exception($"Đã xảy ra lỗi khi truy xuất lịch sử thay thế với ID thiết bị {equipmentId}.", ex);
            }
        }

        public async Task<IEnumerable<ReplacementHistory>> GetByPartIdAsync(int partId, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _context.ReplacementHistories
                    .Include(r => r.Equipment)
                    .Include(r => r.Part)
                    .Include(r => r.ReplacedByNavigation)
                    .Where(r => r.PartId == partId)
                    .ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new Exception($"Đã xảy ra lỗi khi truy xuất lịch sử thay thế với Sparepart ID {partId}.", ex);
            }
        }

        public async Task<IEnumerable<ReplacementHistory>> GetByUserIdAsync(string userId, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _context.ReplacementHistories
                    .Include(r => r.Equipment)
                    .Include(r => r.Part)
                    .Include(r => r.ReplacedByNavigation)
                    .Where(r => r.ReplacedBy == userId)
                    .ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new Exception($"Đã xảy ra lỗi khi truy xuất lịch sử thay thế với ID người dùng {userId}.", ex);
            }
        }

        public async Task<IEnumerable<ReplacementHistory>> GetByDateRangeAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _context.ReplacementHistories
                    .Include(r => r.Equipment)
                    .Include(r => r.Part)
                    .Include(r => r.ReplacedByNavigation)
                    .Where(r => r.ReplacedDate >= startDate && r.ReplacedDate <= endDate)
                    .ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new Exception($"Đã xảy ra lỗi khi truy xuất lịch sử thay thế giữa {startDate} và {endDate}.", ex);
            }
        }

        public async Task<IEnumerable<ReplacementHistory>> GetByStatusAsync(string status, CancellationToken cancellationToken = default)
        {
            try
            {
                return await _context.ReplacementHistories
                    .Include(r => r.Equipment)
                    .Include(r => r.Part)
                    .Include(r => r.ReplacedByNavigation)
                    .Where(r => r.Status == status)
                    .ToListAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                throw new Exception($"Đã xảy ra lỗi khi truy xuất lịch sử thay thế với trạng thái '{status}'.", ex);
            }
        }
        public async Task<bool> ExistsAsync(int replacementId, CancellationToken cancellationToken = default)
        {
            return await _context.ReplacementHistories.AnyAsync(sp => sp.ReplacementId == replacementId);
        }
    }
}