using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;

namespace FITSKIP.Application.Interfaces
{
    public interface IIncidentService
    {
        Task<IReadOnlyList<IncidentHistory>> GetIncidentsAsync(CancellationToken cancellationToken = default);
        Task<IncidentHistory?> GetIncidentByIdAsync(int id, CancellationToken cancellationToken = default);
        Task<IncidentHistory> CreateIncidentAsync(CreateIncidentRequest request, CancellationToken cancellationToken = default);
        Task<BulkIncidentResponse> CreateBulkIncidentsAsync(CreateBulkIncidentRequest request, CancellationToken cancellationToken = default);
        Task<IncidentHistory?> UpdateIncidentAsync(int id, UpdateIncidentRequest request, CancellationToken cancellationToken = default);
        Task<bool> DeleteIncidentAsync(int id, CancellationToken cancellationToken = default);
        Task<DowntimeStatsDTO> GetDowntimeStatsAsync(string period, DateTime? startDate = null, DateTime? endDate = null, int? lineId = null, CancellationToken cancellationToken = default);
        Task<IReadOnlyList<dynamic>> GetStopTypesAsync(CancellationToken cancellationToken = default);
    }
}