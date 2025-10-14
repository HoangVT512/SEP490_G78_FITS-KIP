using FITSKIP.API.Hubs;
using FITSKIP.Application.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace FITSKIP.API.Services
{
    public class NotificationHubService : INotificationHubService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationHubService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendToUserAsync(string userId, object data)
        {
            await _hubContext.Clients.Group($"user_{userId}")
                .SendAsync("ReceiveNotification", data);
        }

        public async Task SendToGroupAsync(string groupName, object data)
        {
            await _hubContext.Clients.Group(groupName)
                .SendAsync("ReceiveNotification", data);
        }

        public async Task SendToAllAsync(object data)
        {
            await _hubContext.Clients.All
                .SendAsync("ReceiveNotification", data);
        }
    }
}

