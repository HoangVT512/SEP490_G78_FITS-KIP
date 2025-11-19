using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;

namespace FITSKIP.Application.Services
{
    public class SparePartService : ISparePartService
    {
        private readonly ISparePartRepository _repository;

        public SparePartService(ISparePartRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<SparePart>> GetAllSparePartsAsync(CancellationToken cancellationToken = default)
        {
            return await _repository.GetAllAsync(cancellationToken);
        }

        public async Task<SparePart?> GetSparePartByIdAsync(int partId, CancellationToken cancellationToken = default)
        {
            return await _repository.GetByIdAsync(partId, cancellationToken);
        }

        public async Task<SparePart> CreateSparePartAsync(SparePart sparePart, CancellationToken cancellationToken = default)
        {
            // Business logic validation
            if (string.IsNullOrWhiteSpace(sparePart.PartNumber))
                throw new ArgumentException("Part number is required");

            if (string.IsNullOrWhiteSpace(sparePart.PartName))
                throw new ArgumentException("Part name is required");

            if (sparePart.Quantity < 0)
                throw new ArgumentException("Quantity cannot be negative");

            // Set default MinQuantity if not provided
            if (sparePart.MinQuantity <= 0)
                sparePart.MinQuantity = 5;

            // Calculate status based on quantity vs minQuantity
            sparePart.Status = CalculateStatus(sparePart.Quantity, sparePart.MinQuantity);

            return await _repository.AddAsync(sparePart, cancellationToken);
        }

        public async Task<bool> UpdateSparePartAsync(int partId, SparePart sparePart, CancellationToken cancellationToken = default)
        {
            // Business logic validation
            if (string.IsNullOrWhiteSpace(sparePart.PartNumber))
                throw new ArgumentException("Part number is required");

            if (string.IsNullOrWhiteSpace(sparePart.PartName))
                throw new ArgumentException("Part name is required");

            if (sparePart.Quantity < 0)
                throw new ArgumentException("Quantity cannot be negative");

            // Set default MinQuantity if not provided
            if (sparePart.MinQuantity <= 0)
                sparePart.MinQuantity = 5;

            // Calculate status based on quantity vs minQuantity
            sparePart.Status = CalculateStatus(sparePart.Quantity, sparePart.MinQuantity);

            var exists = await _repository.ExistsAsync(partId);
            if (!exists)
                return false;

            sparePart.PartId = partId;
            return await _repository.UpdateAsync(sparePart, cancellationToken);
        }

        public async Task<bool> DeleteSparePartAsync(int partId, CancellationToken cancellationToken = default)
        {
            var exists = await _repository.ExistsAsync(partId, cancellationToken);
            if (!exists)
                return false;

            return await _repository.DeleteAsync(partId, cancellationToken);
        }

        public async Task<IEnumerable<SparePart>> GetTop5MostUsedSparePartsAsync(CancellationToken cancellationToken = default)
        {
            return await _repository.GetTop5MostUsedAsync(cancellationToken);
        }

        public async Task<Dictionary<int, int>> GetUsageByWeekAsync(int week, int year, CancellationToken cancellationToken = default)
        {
            if (week < 1 || week > 53)
                throw new ArgumentException("Week must be between 1 and 53", nameof(week));

            if (year < 1900 || year > 2100)
                throw new ArgumentException("Invalid year", nameof(year));

            return await _repository.GetUsageByWeekAsync(week, year, cancellationToken);
        }

        public async Task<Dictionary<int, int>> GetUsageByMonthAsync(int month, int year, CancellationToken cancellationToken = default)
        {
            if (month < 1 || month > 12)
                throw new ArgumentException("Month must be between 1 and 12", nameof(month));

            if (year < 1900 || year > 2100)
                throw new ArgumentException("Invalid year", nameof(year));

            return await _repository.GetUsageByMonthAsync(month, year, cancellationToken);
        }
        public async Task<Dictionary<int, int>> GetUsageByCurrentWeekAsync(CancellationToken cancellationToken = default)
        {
            return await _repository.GetUsageByCurrentWeekAsync(cancellationToken);
        }

        public async Task<Dictionary<int, int>> GetUsageByCurrentMonthAsync(CancellationToken cancellationToken = default)
        {
            return await _repository.GetUsageByCurrentMonthAsync(cancellationToken);
        }

        /// <summary>
        /// Tính trạng thái của phụ tùng dựa vào số lượng hiện có so với số lượng tối thiểu
        /// </summary>
        private string CalculateStatus(int quantity, int minQuantity)
        {
            if (quantity == 0)
                return "Hết hàng";
            else if (quantity <= minQuantity)
                return "Sắp hết";
            else
                return "Đủ hàng";
        }
    }
}