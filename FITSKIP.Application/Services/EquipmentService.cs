using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Exceptions;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace FITSKIP.Application.Services;

public class EquipmentService : IEquipmentService
{
    private readonly IEquipmentRepository _equipmentRepository;
    private readonly IStageRepository _stageRepository;

    public EquipmentService(IEquipmentRepository equipmentRepository, IStageRepository stageRepository)
    {
        _equipmentRepository = equipmentRepository;
        _stageRepository = stageRepository;
    }

    public async Task<IReadOnlyList<EquipmentDTO>> GetEquipmentsAsync(CancellationToken cancellationToken = default)
    {
        var equipments = await _equipmentRepository.GetAllAsync(cancellationToken);
        return equipments.Select(e => EquipmentDTO.FromEntity(e)).ToList();
    }

    public async Task<EquipmentDTO> CreateEquipmentAsync(CreateEquipmentRequest request, CancellationToken cancellationToken = default)
    {
        // Validate equipment code
        ValidateEquipmentCode(request.EquipmentCode);

        // Validate equipment name
        ValidateEquipmentName(request.EquipmentName);

        // Validate stage if provided
        if (request.StageId.HasValue)
        {
            var stage = await _stageRepository.GetByIdAsync(request.StageId.Value, cancellationToken);
            if (stage == null)
            {
                throw new EquipmentValidationException(
                    $"Không tìm thấy công đoạn với ID {request.StageId.Value}",
                    "STAGE_NOT_FOUND",
                    new { StageId = request.StageId.Value });
            }
        }

        // Validate year of manufacture
        if (request.Yom.HasValue)
        {
            ValidateYearOfManufacture(request.Yom.Value);
        }

        // Validate origin if provided
        if (!string.IsNullOrWhiteSpace(request.Origin))
        {
            ValidateOrigin(request.Origin);
        }

        // Normalize equipment code
        var normalizedCode = request.EquipmentCode.Trim().ToUpper();

        // Check duplicate equipment code
        var existingEquipment = await _equipmentRepository.GetByCodeAsync(normalizedCode, cancellationToken);
        if (existingEquipment != null)
        {
            throw new EquipmentValidationException(
                $"Mã thiết bị '{normalizedCode}' đã tồn tại trong hệ thống",
                "EQUIPMENT_CODE_EXISTS",
                new { EquipmentCode = normalizedCode, ExistingEquipmentId = existingEquipment.EquipmentId });
        }

        var equipment = new Equipment
        {
            EquipmentCode = normalizedCode,
            EquipmentName = request.EquipmentName.Trim(),
            DateUse = request.DateUse,
            Origin = request.Origin?.Trim(),
            Yom = request.Yom,
            StageId = request.StageId,
            Qrcode = await GenerateQRCodeAsync(normalizedCode, cancellationToken),
            IsActive = request.IsActive
        };

        var createdEquipment = await _equipmentRepository.CreateAsync(equipment, cancellationToken);
        return EquipmentDTO.FromEntity(createdEquipment);
    }

    public async Task<EquipmentDTO?> GetEquipmentByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var equipment = await _equipmentRepository.GetByIdAsync(id, cancellationToken);
        return equipment == null ? null : EquipmentDTO.FromEntity(equipment);
    }

    public async Task<EquipmentDTO?> UpdateEquipmentAsync(int id, UpdateEquipmentRequest request, CancellationToken cancellationToken = default)
    {
        var existingEquipment = await _equipmentRepository.GetByIdAsync(id, cancellationToken);
        if (existingEquipment == null)
        {
            throw new EquipmentValidationException(
                $"Không tìm thấy thiết bị với ID {id}",
                "EQUIPMENT_NOT_FOUND",
                new { EquipmentId = id });
        }

        // Validate equipment code
        ValidateEquipmentCode(request.EquipmentCode);

        // Validate equipment name
        ValidateEquipmentName(request.EquipmentName);

        // Validate stage if provided
        if (request.StageId.HasValue)
        {
            var stage = await _stageRepository.GetByIdAsync(request.StageId.Value, cancellationToken);
            if (stage == null)
            {
                throw new EquipmentValidationException(
                    $"Không tìm thấy công đoạn với ID {request.StageId.Value}",
                    "STAGE_NOT_FOUND",
                    new { StageId = request.StageId.Value });
            }
        }

        // Validate year of manufacture
        if (request.Yom.HasValue)
        {
            ValidateYearOfManufacture(request.Yom.Value);
        }

        // Validate origin if provided
        if (!string.IsNullOrWhiteSpace(request.Origin))
        {
            ValidateOrigin(request.Origin);
        }

        // Normalize equipment code
        var normalizedCode = request.EquipmentCode.Trim().ToUpper();

        // Check duplicate equipment code (exclude current equipment)
        var duplicateEquipment = await _equipmentRepository.GetByCodeAsync(normalizedCode, cancellationToken);
        if (duplicateEquipment != null && duplicateEquipment.EquipmentId != id)
        {
            throw new EquipmentValidationException(
                $"Mã thiết bị '{normalizedCode}' đã tồn tại trong hệ thống",
                "EQUIPMENT_CODE_EXISTS",
                new { EquipmentCode = normalizedCode, ExistingEquipmentId = duplicateEquipment.EquipmentId });
        }

        existingEquipment.EquipmentCode = normalizedCode;
        existingEquipment.EquipmentName = request.EquipmentName.Trim();
        existingEquipment.DateUse = request.DateUse;
        existingEquipment.Origin = request.Origin?.Trim();
        existingEquipment.Yom = request.Yom;
        existingEquipment.Qrcode = await GenerateQRCodeAsync(normalizedCode, cancellationToken);
        existingEquipment.StageId = request.StageId;
        existingEquipment.IsActive = request.IsActive;

        var updatedEquipment = await _equipmentRepository.UpdateAsync(existingEquipment, cancellationToken);
        return updatedEquipment == null ? null : EquipmentDTO.FromEntity(updatedEquipment);
    }

    public async Task<bool> DeleteEquipmentAsync(int id, CancellationToken cancellationToken = default)
    {
        var equipment = await _equipmentRepository.GetByIdAsync(id, cancellationToken);
        if (equipment == null)
        {
            return false;
        }

        return await _equipmentRepository.DeleteAsync(id, cancellationToken);
    }

    public async Task<EquipmentDTO?> ToggleEquipmentStatusAsync(int id, CancellationToken cancellationToken = default)
    {
        var equipment = await _equipmentRepository.GetByIdAsync(id, cancellationToken);
        if (equipment == null)
        {
            return null;
        }

        equipment.IsActive = !equipment.IsActive;
        var updatedEquipment = await _equipmentRepository.UpdateAsync(equipment, cancellationToken);
        return updatedEquipment == null ? null : EquipmentDTO.FromEntity(updatedEquipment);
    }

    public async Task<IReadOnlyList<EquipmentDTO>> GetEquipmentsByStageAsync(int stageId, CancellationToken cancellationToken = default)
    {
        var equipments = await _equipmentRepository.GetByStageIdAsync(stageId, cancellationToken);
        return equipments.Select(e => EquipmentDTO.FromEntity(e)).ToList();
    }

    public async Task<string?> GenerateQRCodeAsync(string equipmentCode, CancellationToken cancellationToken = default)
    {
        // Generate QR code data in JSON format for easy parsing on frontend
        var qrData = new
        {
            equipmentCode = equipmentCode,
        };

        return JsonSerializer.Serialize(qrData);

    }

    public async Task<string?> GenerateQRCodeAsync(int id, CancellationToken cancellationToken = default)
    {
        var equipment = await _equipmentRepository.GetByIdAsync(id, cancellationToken);
        if (equipment == null || string.IsNullOrEmpty(equipment.EquipmentCode))
        {
            return null;
        }

        // If QR code already exists, return it
        if (!string.IsNullOrEmpty(equipment.Qrcode))
        {
            return equipment.Qrcode;
        }

        // Otherwise, generate new QR code
        var qrCode = await GenerateQRCodeAsync(equipment.EquipmentCode, cancellationToken);
        equipment.Qrcode = qrCode;
        await _equipmentRepository.UpdateAsync(equipment, cancellationToken);
        return qrCode;
    }

    public async Task<IReadOnlyList<EquipmentDTO>> GetEquipmentsByUserLinesAsync(string userId, CancellationToken cancellationToken = default)
    {
        var equipments = await _equipmentRepository.GetEquipmentsByTeamLeaderAsync(userId, cancellationToken);
        return equipments.Select(e => EquipmentDTO.FromEntity(e)).ToList();
    }

    public async Task<IReadOnlyList<EquipmentDTO>> GetEquipmentsByLineAsync(int lineId, CancellationToken cancellationToken = default)
    {
        var equipments = await _equipmentRepository.GetByLineIdAsync(lineId, cancellationToken);
        return equipments.Select(e => EquipmentDTO.FromEntity(e)).ToList();
    }

    private void ValidateEquipmentCode(string equipmentCode)
    {
        // Check if null or empty
        if (string.IsNullOrWhiteSpace(equipmentCode))
        {
            throw new EquipmentValidationException(
                "Mã thiết bị không được để trống",
                "EQUIPMENT_CODE_REQUIRED");
        }

        // Trim and check again
        equipmentCode = equipmentCode.Trim();

        // Check minimum length
        if (equipmentCode.Length < 2)
        {
            throw new EquipmentValidationException(
                "Mã thiết bị phải có ít nhất 2 ký tự",
                "EQUIPMENT_CODE_TOO_SHORT",
                new { MinLength = 2, ActualLength = equipmentCode.Length });
        }

        // Check maximum length
        if (equipmentCode.Length > 50)
        {
            throw new EquipmentValidationException(
                "Mã thiết bị không được vượt quá 50 ký tự",
                "EQUIPMENT_CODE_TOO_LONG",
                new { MaxLength = 50, ActualLength = equipmentCode.Length });
        }

        // Check for allowed characters (alphanumeric, hyphens, underscores only - no spaces)
        var allowedPattern = @"^[a-zA-Z0-9\-_]+$";
        if (!Regex.IsMatch(equipmentCode, allowedPattern))
        {
            throw new EquipmentValidationException(
                "Mã thiết bị chỉ được chứa chữ cái, số, dấu gạch ngang (-) và gạch dưới (_), không có khoảng trắng",
                "EQUIPMENT_CODE_INVALID_CHARACTERS");
        }
    }

    private void ValidateEquipmentName(string equipmentName)
    {
        // Check if null or empty
        if (string.IsNullOrWhiteSpace(equipmentName))
        {
            throw new EquipmentValidationException(
                "Tên thiết bị không được để trống",
                "EQUIPMENT_NAME_REQUIRED");
        }

        // Trim and check again
        equipmentName = equipmentName.Trim();

        // Check minimum length
        if (equipmentName.Length < 2)
        {
            throw new EquipmentValidationException(
                "Tên thiết bị phải có ít nhất 2 ký tự",
                "EQUIPMENT_NAME_TOO_SHORT",
                new { MinLength = 2, ActualLength = equipmentName.Length });
        }

        // Check maximum length
        if (equipmentName.Length > 200)
        {
            throw new EquipmentValidationException(
                "Tên thiết bị không được vượt quá 200 ký tự",
                "EQUIPMENT_NAME_TOO_LONG",
                new { MaxLength = 200, ActualLength = equipmentName.Length });
        }

        // Check for allowed characters (alphanumeric, spaces, hyphens, underscores, Vietnamese characters)
        var allowedPattern = @"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+$";
        if (!Regex.IsMatch(equipmentName, allowedPattern))
        {
            throw new EquipmentValidationException(
                "Tên thiết bị chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới",
                "EQUIPMENT_NAME_INVALID_CHARACTERS");
        }
    }

    private void ValidateYearOfManufacture(int year)
    {
        var currentYear = DateTime.Now.Year;

        // Check minimum year
        if (year < 1900)
        {
            throw new EquipmentValidationException(
                "Năm sản xuất không được nhỏ hơn 1900",
                "EQUIPMENT_YOM_TOO_OLD",
                new { MinYear = 1900, ActualYear = year });
        }

        // Check maximum year (current year + 1 for future planning)
        if (year > currentYear + 1)
        {
            throw new EquipmentValidationException(
                $"Năm sản xuất không được lớn hơn {currentYear + 1}",
                "EQUIPMENT_YOM_TOO_FUTURE",
                new { MaxYear = currentYear + 1, ActualYear = year });
        }
    }

    private void ValidateOrigin(string origin)
    {
        // Check maximum length
        if (origin.Length > 100)
        {
            throw new EquipmentValidationException(
                "Xuất xứ không được vượt quá 100 ký tự",
                "EQUIPMENT_ORIGIN_TOO_LONG",
                new { MaxLength = 100, ActualLength = origin.Length });
        }

        // Check for allowed characters (alphanumeric, spaces, hyphens, underscores, Vietnamese characters)
        var allowedPattern = @"^[a-zA-Z0-9\s\-_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ]+$";
        if (!Regex.IsMatch(origin, allowedPattern))
        {
            throw new EquipmentValidationException(
                "Xuất xứ chỉ được chứa chữ cái, số, khoảng trắng, dấu gạch ngang và dấu gạch dưới",
                "EQUIPMENT_ORIGIN_INVALID_CHARACTERS");
        }
    }
}
