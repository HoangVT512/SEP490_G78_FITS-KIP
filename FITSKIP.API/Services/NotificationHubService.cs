using FITSKIP.API.Hubs;
using FITSKIP.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace FITSKIP.API.Services
{
    public class NotificationHubService : INotificationHubService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<NotificationHubService> _logger;

        public NotificationHubService(IHubContext<NotificationHub> hubContext, ILogger<NotificationHubService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task SendToUserAsync(string userId, object data)
        {
            _logger.LogInformation($"📤 Sending notification to user: {userId}");
            _logger.LogInformation($"   Data: {System.Text.Json.JsonSerializer.Serialize(data)}");

            // Send both ReceiveNotification (for toast) and DataUpdated (for refresh)
            await _hubContext.Clients.Group($"user_{userId}")
                .SendAsync("ReceiveNotification", data);
            _logger.LogInformation($"   ✅ Sent ReceiveNotification event to user {userId}");

            // Also send DataUpdated for auto-refresh
            await _hubContext.Clients.Group($"user_{userId}")
                .SendAsync("DataUpdated", new { type = "incident", action = "created", data = data });
            _logger.LogInformation($"   ✅ Sent DataUpdated event to user {userId}");
        }

        public async Task SendToGroupAsync(string groupName, object data)
        {
            _logger.LogInformation($"📢 Sending notification to group: {groupName}");
            _logger.LogInformation($"   Data: {System.Text.Json.JsonSerializer.Serialize(data)}");

            // Send both ReceiveNotification (for toast) and DataUpdated (for refresh)
            await _hubContext.Clients.Group(groupName)
                .SendAsync("ReceiveNotification", data);
            _logger.LogInformation($"   ✅ Sent ReceiveNotification event to group {groupName}");

            // Also send DataUpdated for auto-refresh
            await _hubContext.Clients.Group(groupName)
                .SendAsync("DataUpdated", new { type = "incident", action = "created", data = data });
            _logger.LogInformation($"   ✅ Sent DataUpdated event to group {groupName}");
        }

        public async Task SendToAllAsync(object data)
        {
            _logger.LogInformation("Sending notification to all clients");
            await _hubContext.Clients.All
                .SendAsync("ReceiveNotification", data);
        }

        // Send incident notification to technical managers in a specific department
        public async Task SendIncidentNotificationToDepartmentAsync(int departmentId, string title, string message)
        {
            var groupName = $"TechnicalManagers_Department_{departmentId}";
            _logger.LogInformation($"Sending incident notification to group: {groupName}");

            await _hubContext.Clients.Group(groupName)
                .SendAsync("IncidentNotification", new
                {
                    title = title,
                    message = message,
                    timestamp = DateTime.UtcNow,
                    type = "incident"
                });
        }

        // Trigger data refresh for all technical managers in a department
        public async Task RefreshIncidentsForDepartmentAsync(int departmentId)
        {
            var groupName = $"TechnicalManagers_Department_{departmentId}";
            _logger.LogInformation($"Triggering incident refresh for group: {groupName}");

            await _hubContext.Clients.Group(groupName)
                .SendAsync("RefreshIncidents", new
                {
                    departmentId = departmentId,
                    timestamp = DateTime.UtcNow
                });
        }
    }
}

