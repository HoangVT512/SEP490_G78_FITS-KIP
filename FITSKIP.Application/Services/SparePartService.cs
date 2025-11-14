using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.Exceptions;
using System.Text.RegularExpressions;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Services
{
    public class SparePartService : ISparePartService
    {
        private readonly ISparePartRepository _repository;

        public SparePartService(ISparePartRepository repository)
        {
            _repository = repository;
        }

        // Helper method to validate spare part creation
        public async Task<SparePart> CreateSparePartAsync(CreateSparePartRequest request, CancellationToken cancellationToken = default)
        {
            // Validate part number
            ValidatePartNumber(request.PartNumber);

            // Validate part name
            ValidatePartName(request.PartName);

            // Validate quantity
            ValidateQuantity(request.Quantity);

            // Validate min quantity
            ValidateMinQuantity(request.MinQuantity);

            // Validate purchase price if provided
            if (request.PurchasePrice.HasValue)
            {
                ValidatePurchasePrice(request.PurchasePrice.Value);
            }

            // Validate part type if provided
            if (!string.IsNullOrWhiteSpace(request.PartType))
            {
                ValidatePartType(request.PartType);
            }

            // Validate material if provided
            if (!string.IsNullOrWhiteSpace(request.Material))
            {
                ValidateMaterial(request.Material);
            }

            // Validate specifications if provided
            if (!string.IsNullOrWhiteSpace(request.Specifications))
            {
                ValidateSpecifications(request.Specifications);
            }

            // Validate supplier if provided
            if (!string.IsNullOrWhiteSpace(request.Supplier))
            {
                ValidateSupplier(request.Supplier);
            }

            // Validate location if provided
            if (!string.IsNullOrWhiteSpace(request.Location))
            {
                ValidateLocation(request.Location);
            }

            // Validate warehouse if provided
            if (!string.IsNullOrWhiteSpace(request.Warehouse))
            {
                ValidateWarehouse(request.Warehouse);
            }

            // Validate UoM if provided
            if (!string.IsNullOrWhiteSpace(request.UoM))
            {
                ValidateUoM(request.UoM);
            }

            // Check duplicate part number
            var allSpareParts = await _repository.GetAllAsync(cancellationToken);
            var existingSparePart = allSpareParts.FirstOrDefault(sp => sp.PartNumber.Trim().ToUpper() == request.PartNumber.Trim().ToUpper());
            if (existingSparePart != null)
            {
                throw new SparePartValidationException(
                    $"Mã phụ tùng '{request.PartNumber.Trim()}' đã tồn tại trong hệ thống",
                    "SPAREPART_NUMBER_EXISTS",
                    new { PartNumber = request.PartNumber.Trim(), ExistingPartId = existingSparePart.PartId });
            }

            var sparePart = new SparePart
            {
                PartNumber = request.PartNumber.Trim().ToUpper(),
                PartName = request.PartName.Trim(),
                PartType = request.PartType?.Trim(),
                Material = request.Material?.Trim(),
                Specifications = request.Specifications?.Trim(),
                Supplier = request.Supplier?.Trim(),
                PurchasePrice = request.PurchasePrice,
                Quantity = request.Quantity,
                MinQuantity = request.MinQuantity > 0 ? request.MinQuantity : 5,
                Location = request.Location?.Trim(),
                Warehouse = request.Warehouse?.Trim(),
                UoM = request.UoM?.Trim(),
                ReplacementCycle = request.ReplacementCycle?.Trim(),
                DateAdded = request.DateAdded ?? DateTime.Now,
                DocumentUrl = request.DocumentUrl?.Trim(),
                Status = CalculateStatus(request.Quantity, request.MinQuantity > 0 ? request.MinQuantity : 5)
            };

            return await _repository.AddAsync(sparePart, cancellationToken);
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
            // Convert SparePart entity to CreateSparePartRequest for validation
            var request = new CreateSparePartRequest
            {
                PartNumber = sparePart.PartNumber,
                PartName = sparePart.PartName,
                PartType = sparePart.PartType,
                Material = sparePart.Material,
                Specifications = sparePart.Specifications,
                Supplier = sparePart.Supplier,
                PurchasePrice = sparePart.PurchasePrice,
                Quantity = sparePart.Quantity,
                MinQuantity = sparePart.MinQuantity,
                Location = sparePart.Location,
                Warehouse = sparePart.Warehouse,
                UoM = sparePart.UoM,
                ReplacementCycle = sparePart.ReplacementCycle,
                DateAdded = sparePart.DateAdded,
                DocumentUrl = sparePart.DocumentUrl
            };

            return await CreateSparePartAsync(request, cancellationToken);
        }

        public async Task<bool> UpdateSparePartAsync(int partId, SparePart sparePart, CancellationToken cancellationToken = default)
        {
            // Check if spare part exists
            var existingSparePart = await _repository.GetByIdAsync(partId, cancellationToken);
            if (existingSparePart == null)
            {
                throw new SparePartValidationException(
                    $"Không tìm thấy phụ tùng với ID {partId}",
                    "SPAREPART_NOT_FOUND",
                    new { PartId = partId });
            }

            // Validate part number
            ValidatePartNumber(sparePart.PartNumber);

            // Validate part name
            ValidatePartName(sparePart.PartName);

            // Validate quantity
            ValidateQuantity(sparePart.Quantity);

            // Validate min quantity
            ValidateMinQuantity(sparePart.MinQuantity);

            // Validate purchase price if provided
            if (sparePart.PurchasePrice.HasValue)
            {
                ValidatePurchasePrice(sparePart.PurchasePrice.Value);
            }

            // Validate part type if provided
            if (!string.IsNullOrWhiteSpace(sparePart.PartType))
            {
                ValidatePartType(sparePart.PartType);
            }

            // Validate material if provided
            if (!string.IsNullOrWhiteSpace(sparePart.Material))
            {
                ValidateMaterial(sparePart.Material);
            }

            // Validate specifications if provided
            if (!string.IsNullOrWhiteSpace(sparePart.Specifications))
            {
                ValidateSpecifications(sparePart.Specifications);
            }

            // Validate supplier if provided
            if (!string.IsNullOrWhiteSpace(sparePart.Supplier))
            {
                ValidateSupplier(sparePart.Supplier);
            }

            // Validate location if provided
            if (!string.IsNullOrWhiteSpace(sparePart.Location))
            {
                ValidateLocation(sparePart.Location);
            }

            // Validate warehouse if provided
            if (!string.IsNullOrWhiteSpace(sparePart.Warehouse))
            {
                ValidateWarehouse(sparePart.Warehouse);
            }

            // Validate UoM if provided
            if (!string.IsNullOrWhiteSpace(sparePart.UoM))
            {
                ValidateUoM(sparePart.UoM);
            }

            // Check duplicate part number (exclude current spare part)
            var allSpareParts = await _repository.GetAllAsync(cancellationToken);
            var duplicateSparePart = allSpareParts.FirstOrDefault(sp => sp.PartNumber.Trim().ToUpper() == sparePart.PartNumber.Trim().ToUpper() && sp.PartId != partId);
            if (duplicateSparePart != null)
            {
                throw new SparePartValidationException(
                    $"Mã phụ tùng '{sparePart.PartNumber.Trim()}' đã tồn tại trong hệ thống",
                    "SPAREPART_NUMBER_EXISTS",
                    new { PartNumber = sparePart.PartNumber.Trim(), ExistingPartId = duplicateSparePart.PartId });
            }

            // Set default MinQuantity if not provided
            var minQuantity = sparePart.MinQuantity > 0 ? sparePart.MinQuantity : 5;

            // Calculate status based on quantity vs minQuantity
            sparePart.Status = CalculateStatus(sparePart.Quantity, minQuantity);
            sparePart.MinQuantity = minQuantity;

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

        private void ValidatePartNumber(string partNumber)
        {
            // Check if null or empty
            if (string.IsNullOrWhiteSpace(partNumber))
            {
                throw new SparePartValidationException(
                    "Mã phụ tùng không được để trống",
                    "SPAREPART_NUMBER_REQUIRED");
            }

            // Trim and check again
            partNumber = partNumber.Trim();

            // Check minimum length
            if (partNumber.Length < 2)
            {
                throw new SparePartValidationException(
                    "Mã phụ tùng phải có ít nhất 2 ký tự",
                    "SPAREPART_NUMBER_TOO_SHORT",
                    new { MinLength = 2, ActualLength = partNumber.Length });
            }

            // Check maximum length
            if (partNumber.Length > 50)
            {
                throw new SparePartValidationException(
                    "Mã phụ tùng không được vượt quá 50 ký tự",
                    "SPAREPART_NUMBER_TOO_LONG",
                    new { MaxLength = 50, ActualLength = partNumber.Length });
            }

            // Check for allowed characters (alphanumeric, hyphens, underscores only - no spaces)
            var allowedPattern = @"^[a-zA-Z0-9\-_]+$";
            if (!Regex.IsMatch(partNumber, allowedPattern))
            {
                throw new SparePartValidationException(
                    "Mã phụ tùng chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không có khoảng trắng",
                    "SPAREPART_NUMBER_INVALID_CHARACTERS");
            }
        }

        private void ValidatePartName(string partName)
        {
            // Check if null or empty
            if (string.IsNullOrWhiteSpace(partName))
            {
                throw new SparePartValidationException(
                    "Tên phụ tùng không được để trống",
                    "SPAREPART_NAME_REQUIRED");
            }

            // Trim and check again
            partName = partName.Trim();

            // Check minimum length
            if (partName.Length < 2)
            {
                throw new SparePartValidationException(
                    "Tên phụ tùng phải có ít nhất 2 ký tự",
                    "SPAREPART_NAME_TOO_SHORT",
                    new { MinLength = 2, ActualLength = partName.Length });
            }

            // Check maximum length
            if (partName.Length > 200)
            {
                throw new SparePartValidationException(
                    "Tên phụ tùng không được vượt quá 200 ký tự",
                    "SPAREPART_NAME_TOO_LONG",
                    new { MaxLength = 200, ActualLength = partName.Length });
            }

            // Check for allowed characters (alphanumeric, spaces, hyphens, underscores, Vietnamese characters)
            var allowedPattern = @"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+$";
            if (!Regex.IsMatch(partName, allowedPattern))
            {
                throw new SparePartValidationException(
                    "Tên phụ tùng chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới",
                    "SPAREPART_NAME_INVALID_CHARACTERS");
            }
        }

        private void ValidateQuantity(int quantity)
        {
            if (quantity < 0)
            {
                throw new SparePartValidationException(
                    "Số lượng phụ tùng không được âm",
                    "SPAREPART_QUANTITY_NEGATIVE",
                    new { Quantity = quantity });
            }

            if (quantity > 1000000) // Reasonable upper limit
            {
                throw new SparePartValidationException(
                    "Số lượng phụ tùng không được vượt quá 1.000.000",
                    "SPAREPART_QUANTITY_TOO_LARGE",
                    new { MaxQuantity = 1000000, ActualQuantity = quantity });
            }
        }

        private void ValidateMinQuantity(int minQuantity)
        {
            if (minQuantity < 0)
            {
                throw new SparePartValidationException(
                    "Số lượng tối thiểu không được âm",
                    "SPAREPART_MIN_QUANTITY_NEGATIVE",
                    new { MinQuantity = minQuantity });
            }

            if (minQuantity > 100000) // Reasonable upper limit
            {
                throw new SparePartValidationException(
                    "Số lượng tối thiểu không được vượt quá 100.000",
                    "SPAREPART_MIN_QUANTITY_TOO_LARGE",
                    new { MaxMinQuantity = 100000, ActualMinQuantity = minQuantity });
            }
        }

        private void ValidatePurchasePrice(decimal purchasePrice)
        {
            if (purchasePrice < 0)
            {
                throw new SparePartValidationException(
                    "Giá mua không được âm",
                    "SPAREPART_PURCHASE_PRICE_NEGATIVE",
                    new { PurchasePrice = purchasePrice });
            }

            if (purchasePrice > 1000000000) // 1 billion VND upper limit
            {
                throw new SparePartValidationException(
                    "Giá mua không được vượt quá 1.000.000.000 VND",
                    "SPAREPART_PURCHASE_PRICE_TOO_LARGE",
                    new { MaxPrice = 1000000000, ActualPrice = purchasePrice });
            }
        }

        private void ValidatePartType(string partType)
        {
            // Check maximum length
            if (partType.Length > 100)
            {
                throw new SparePartValidationException(
                    "Loại phụ tùng không được vượt quá 100 ký tự",
                    "SPAREPART_TYPE_TOO_LONG",
                    new { MaxLength = 100, ActualLength = partType.Length });
            }

            // Check for allowed characters
            var allowedPattern = @"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$";
            if (!Regex.IsMatch(partType, allowedPattern))
            {
                throw new SparePartValidationException(
                    "Loại phụ tùng chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới",
                    "SPAREPART_TYPE_INVALID_CHARACTERS");
            }
        }

        private void ValidateMaterial(string material)
        {
            // Check maximum length
            if (material.Length > 100)
            {
                throw new SparePartValidationException(
                    "Vật liệu không được vượt quá 100 ký tự",
                    "SPAREPART_MATERIAL_TOO_LONG",
                    new { MaxLength = 100, ActualLength = material.Length });
            }

            // Check for allowed characters
            var allowedPattern = @"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$";
            if (!Regex.IsMatch(material, allowedPattern))
            {
                throw new SparePartValidationException(
                    "Vật liệu chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới",
                    "SPAREPART_MATERIAL_INVALID_CHARACTERS");
            }
        }

        private void ValidateSpecifications(string specifications)
        {
            // Check maximum length
            if (specifications.Length > 500)
            {
                throw new SparePartValidationException(
                    "Thông số kỹ thuật không được vượt quá 500 ký tự",
                    "SPAREPART_SPECIFICATIONS_TOO_LONG",
                    new { MaxLength = 500, ActualLength = specifications.Length });
            }
        }

        private void ValidateSupplier(string supplier)
        {
            // Check maximum length
            if (supplier.Length > 100)
            {
                throw new SparePartValidationException(
                    "Nhà cung cấp không được vượt quá 100 ký tự",
                    "SPAREPART_SUPPLIER_TOO_LONG",
                    new { MaxLength = 100, ActualLength = supplier.Length });
            }

            // Check for allowed characters
            var allowedPattern = @"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$";
            if (!Regex.IsMatch(supplier, allowedPattern))
            {
                throw new SparePartValidationException(
                    "Nhà cung cấp chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới",
                    "SPAREPART_SUPPLIER_INVALID_CHARACTERS");
            }
        }

        private void ValidateLocation(string location)
        {
            // Check maximum length
            if (location.Length > 100)
            {
                throw new SparePartValidationException(
                    "Vị trí không được vượt quá 100 ký tự",
                    "SPAREPART_LOCATION_TOO_LONG",
                    new { MaxLength = 100, ActualLength = location.Length });
            }

            // Check for allowed characters
            var allowedPattern = @"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$";
            if (!Regex.IsMatch(location, allowedPattern))
            {
                throw new SparePartValidationException(
                    "Vị trí chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới",
                    "SPAREPART_LOCATION_INVALID_CHARACTERS");
            }
        }

        private void ValidateWarehouse(string warehouse)
        {
            // Check maximum length
            if (warehouse.Length > 100)
            {
                throw new SparePartValidationException(
                    "Kho không được vượt quá 100 ký tự",
                    "SPAREPART_WAREHOUSE_TOO_LONG",
                    new { MaxLength = 100, ActualLength = warehouse.Length });
            }

            // Check for allowed characters
            var allowedPattern = @"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$";
            if (!Regex.IsMatch(warehouse, allowedPattern))
            {
                throw new SparePartValidationException(
                    "Kho chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới",
                    "SPAREPART_WAREHOUSE_INVALID_CHARACTERS");
            }
        }

        private void ValidateUoM(string uom)
        {
            // Check maximum length
            if (uom.Length > 20)
            {
                throw new SparePartValidationException(
                    "Đơn vị tính không được vượt quá 20 ký tự",
                    "SPAREPART_UOM_TOO_LONG",
                    new { MaxLength = 20, ActualLength = uom.Length });
            }

            // Check for allowed characters
            var allowedPattern = @"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]*$";
            if (!Regex.IsMatch(uom, allowedPattern))
            {
                throw new SparePartValidationException(
                    "Đơn vị tính chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới",
                    "SPAREPART_UOM_INVALID_CHARACTERS");
            }
        }
    }
}