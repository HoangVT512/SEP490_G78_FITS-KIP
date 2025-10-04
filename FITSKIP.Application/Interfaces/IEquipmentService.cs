using FITSKIP.Domain.Entities;
using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces;

public interface IEquipmentService
{
    Task<IReadOnlyList<Equipment>> GetEquipmentsAsync(CancellationToken cancellationToken = default);
    Task<Equipment> CreateEquipmentAsync(CreateEquipmentRequest request, CancellationToken cancellationToken = default);
    Task<Equipment?> GetEquipmentByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Equipment?> UpdateEquipmentAsync(int id, UpdateEquipmentRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteEquipmentAsync(int id, CancellationToken cancellationToken = default);
    Task<Equipment?> ToggleEquipmentStatusAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Equipment>> GetEquipmentsByStageAsync(int stageId, CancellationToken cancellationToken = default);
    Task<Equipment?> GenerateQRCodeAsync(int id, CancellationToken cancellationToken = default);
}
