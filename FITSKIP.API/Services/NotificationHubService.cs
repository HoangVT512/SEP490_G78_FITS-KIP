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
            _logger.LogInformation($"Sending notification to user: {userId}");
            await _hubContext.Clients.Group($"user_{userId}")
                .SendAsync("ReceiveNotification", data);
        }

        public async Task SendToGroupAsync(string groupName, object data)
        {
            _logger.LogInformation($"Sending notification to group: {groupName}");
            await _hubContext.Clients.Group(groupName)
                .SendAsync("ReceiveNotification", data);
        }

        public async Task SendToAllAsync(object data)
        {
            _logger.LogInformation("Sending notification to all clients");
            await _hubContext.Clients.All
                .SendAsync("ReceiveNotification", data);
        }
    }
}

