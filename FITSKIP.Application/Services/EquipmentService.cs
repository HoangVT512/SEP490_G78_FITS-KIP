using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;

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

    public Task<IReadOnlyList<Equipment>> GetEquipmentsAsync(CancellationToken cancellationToken = default)
    {
        return _equipmentRepository.GetAllAsync(cancellationToken);
    }

    public async Task<Equipment> CreateEquipmentAsync(CreateEquipmentRequest request, CancellationToken cancellationToken = default)
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
            IdCode = request.IdCode?.Trim(),
            StageId = request.StageId,
            Issue = request.Issue?.Trim(),
            IsActive = request.IsActive
        };

        return await _equipmentRepository.CreateAsync(equipment, cancellationToken);
    }

    public Task<Equipment?> GetEquipmentByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return _equipmentRepository.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Equipment?> UpdateEquipmentAsync(int id, UpdateEquipmentRequest request, CancellationToken cancellationToken = default)
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
        existingEquipment.IdCode = request.IdCode?.Trim();
        existingEquipment.StageId = request.StageId;
        existingEquipment.Issue = request.Issue?.Trim();
        existingEquipment.IsActive = request.IsActive;

        return await _equipmentRepository.UpdateAsync(existingEquipment, cancellationToken);
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

    public async Task<Equipment?> ToggleEquipmentStatusAsync(int id, CancellationToken cancellationToken = default)
    {
        var equipment = await _equipmentRepository.GetByIdAsync(id, cancellationToken);
        if (equipment == null)
        {
            return null;
        }

        equipment.IsActive = !equipment.IsActive;
        return await _equipmentRepository.UpdateAsync(equipment, cancellationToken);
    }

    public Task<IReadOnlyList<Equipment>> GetEquipmentsByStageAsync(int stageId, CancellationToken cancellationToken = default)
    {
        return _equipmentRepository.GetByStageIdAsync(stageId, cancellationToken);
    }

    public async Task<Equipment?> GenerateQRCodeAsync(int id, CancellationToken cancellationToken = default)
    {
        var equipment = await _equipmentRepository.GetByIdAsync(id, cancellationToken);
        if (equipment == null)
        {
            return null;
        }

        // Generate QR code (simple format: EQUIPMENT-{CODE}-{ID})
        equipment.Qrcode = $"EQUIPMENT-{equipment.EquipmentCode}-{equipment.EquipmentId}";

        return await _equipmentRepository.UpdateAsync(equipment, cancellationToken);
    }
}
