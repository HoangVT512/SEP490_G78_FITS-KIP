namespace FITSKIP.Application.Interfaces;

public interface IDashboardService
{
    Task<object> GetDowntimeStatsAsync(int month, int year, int? lineId = null);
    Task<object> GetDailyDowntimeStatsAsync(int month, int year, int? lineId = null, string? date = null);  // Thêm parameter date
    Task<object> GetDetailedOEEDailyStatsAsync(int lineId, DateTime date);
    Task<object> GetDetailedOEESlotStatsAsync(int lineId, DateTime date, int shiftId, string slotTime);
}
