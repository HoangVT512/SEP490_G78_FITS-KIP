using FITSKIP.Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FITSKIP.Application.Services
{
    /// <summary>
    /// Background service to automatically delete read notifications older than 1 day
    /// Runs every hour to check and clean up old notifications
    /// </summary>
    public class NotificationCleanupService : BackgroundService
    {
        private readonly ILogger<NotificationCleanupService> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(1); // Run every 1 hour
        private readonly TimeSpan _notificationRetentionPeriod = TimeSpan.FromDays(1); // Delete after 1 day

        public NotificationCleanupService(
            ILogger<NotificationCleanupService> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🧹 Notification Cleanup Service started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CleanupOldReadNotificationsAsync(stoppingToken);

                    // Wait for the next cleanup interval
                    await Task.Delay(_cleanupInterval, stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    // Expected when the service is stopping
                    _logger.LogInformation("Notification Cleanup Service is stopping...");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Error occurred in Notification Cleanup Service");
                    
                    // Wait before retrying after an error
                    await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                }
            }

            _logger.LogInformation("🛑 Notification Cleanup Service stopped");
        }

        private async Task CleanupOldReadNotificationsAsync(CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("🔍 Starting cleanup of old read notifications...");

                // Create a scope to get scoped services
                using (var scope = _serviceProvider.CreateScope())
                {
                    var notificationRepository = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

                    // Calculate the cutoff date (1 day ago)
                    var cutoffDate = DateTime.UtcNow.Subtract(_notificationRetentionPeriod);

                    _logger.LogInformation($"📅 Cutoff date: {cutoffDate:yyyy-MM-dd HH:mm:ss} UTC");

                    // Delete read notifications older than the cutoff date
                    var deletedCount = await notificationRepository.DeleteOldReadNotificationsAsync(cutoffDate);

                    if (deletedCount > 0)
                    {
                        _logger.LogInformation($"✅ Successfully deleted {deletedCount} old read notification(s)");
                    }
                    else
                    {
                        _logger.LogInformation("ℹ️ No old read notifications to delete");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error cleaning up old read notifications");
                throw;
            }
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Notification Cleanup Service is stopping gracefully...");
            await base.StopAsync(cancellationToken);
        }
    }
}
