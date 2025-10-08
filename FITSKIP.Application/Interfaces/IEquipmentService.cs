using FITSKIP.Domain.DTO;

namespace FITSKIP.Application.Interfaces;

public interface IEquipmentService
{
    Task<IReadOnlyList<EquipmentDTO>> GetEquipmentsAsync(CancellationToken cancellationToken = default);
    Task<EquipmentDTO> CreateEquipmentAsync(CreateEquipmentRequest request, CancellationToken cancellationToken = default);
    Task<EquipmentDTO?> GetEquipmentByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<EquipmentDTO?> UpdateEquipmentAsync(int id, UpdateEquipmentRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteEquipmentAsync(int id, CancellationToken cancellationToken = default);
    Task<EquipmentDTO?> ToggleEquipmentStatusAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<EquipmentDTO>> GetEquipmentsByStageAsync(int stageId, CancellationToken cancellationToken = default);
}
