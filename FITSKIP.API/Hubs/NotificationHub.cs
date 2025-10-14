using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FITSKIP.API.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier ?? Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                // Add user to their personal group
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
                Console.WriteLine($"User {userId} connected to NotificationHub with ConnectionId: {Context.ConnectionId}");
            }
            
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier ?? Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
                Console.WriteLine($"User {userId} disconnected from NotificationHub");
            }
            
            await base.OnDisconnectedAsync(exception);
        }

        // Client can call this to mark notification as read
        public async Task MarkAsRead(int notificationId)
        {
            var userId = Context.UserIdentifier ?? Context.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"User {userId} marked notification {notificationId} as read");
            // The actual marking will be done through the API endpoint
        }

        // Join a specific group (for role-based or department-based notifications)
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            Console.WriteLine($"Connection {Context.ConnectionId} joined group {groupName}");
        }

        // Leave a specific group
        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            Console.WriteLine($"Connection {Context.ConnectionId} left group {groupName}");
        }
    }
}

