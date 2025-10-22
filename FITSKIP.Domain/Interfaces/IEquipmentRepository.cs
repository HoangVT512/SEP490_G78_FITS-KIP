using FITSKIP.Domain.Entities;

namespace FITSKIP.Domain.Interfaces;

public interface IEquipmentRepository
{
    Task<IReadOnlyList<Equipment>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Equipment?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Equipment> CreateAsync(Equipment equipment, CancellationToken cancellationToken = default);
    Task<Equipment?> UpdateAsync(Equipment equipment, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Equipment>> GetByStageIdAsync(int stageId, CancellationToken cancellationToken = default);
    Task<Equipment?> GetByCodeAsync(string equipmentCode, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Equipment>> GetEquipmentsByTeamLeaderAsync(string userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Equipment>> GetByLineIdAsync(int lineId, CancellationToken cancellationToken = default);
}
