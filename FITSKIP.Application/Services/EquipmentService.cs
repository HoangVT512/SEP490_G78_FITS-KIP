using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using System.Text.Json;

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
        // Validate stage if provided
        if (request.StageId.HasValue)
        {
            var stage = await _stageRepository.GetByIdAsync(request.StageId.Value, cancellationToken);
            if (stage == null)
            {
                throw new InvalidOperationException($"Không tìm thấy công đoạn với ID: {request.StageId}");
            }
        }

        // Validate year of manufacture
        if (request.Yom.HasValue)
        {
            var currentYear = DateTime.Now.Year;
            if (request.Yom.Value < 1900 || request.Yom.Value > currentYear + 1)
            {
                throw new InvalidOperationException($"Năm sản xuất phải nằm trong khoảng 1900 đến {currentYear + 1}");
            }
        }

        // Normalize equipment code
        var normalizedCode = request.EquipmentCode.Trim().ToUpper();

        // Check duplicate equipment code
        var existingEquipment = await _equipmentRepository.GetByCodeAsync(normalizedCode, cancellationToken);
        if (existingEquipment != null)
        {
            throw new InvalidOperationException($"Mã thiết bị '{normalizedCode}' đã tồn tại");
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
            return null;
        }

        // Validate stage if provided
        if (request.StageId.HasValue)
        {
            var stage = await _stageRepository.GetByIdAsync(request.StageId.Value, cancellationToken);
            if (stage == null)
            {
                throw new InvalidOperationException($"Không tìm thấy công đoạn với ID: {request.StageId}");
            }
        }

        // Validate year of manufacture
        if (request.Yom.HasValue)
        {
            var currentYear = DateTime.Now.Year;
            if (request.Yom.Value < 1900 || request.Yom.Value > currentYear + 1)
            {
                throw new InvalidOperationException($"Năm sản xuất phải nằm trong khoảng 1900 đến {currentYear + 1}");
            }
        }

        // Normalize equipment code
        var normalizedCode = request.EquipmentCode.Trim().ToUpper();

        // Check duplicate equipment code (exclude current equipment)
        var duplicateEquipment = await _equipmentRepository.GetByCodeAsync(normalizedCode, cancellationToken);
        if (duplicateEquipment != null && duplicateEquipment.EquipmentId != id)
        {
            throw new InvalidOperationException($"Mã thiết bị '{normalizedCode}' đã tồn tại");
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
}
