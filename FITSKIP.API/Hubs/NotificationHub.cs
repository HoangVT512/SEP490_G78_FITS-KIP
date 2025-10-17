using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace FITSKIP.API.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                // Add user to their personal group
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
                Console.WriteLine($"User {userId} connected to NotificationHub with ConnectionId: {Context.ConnectionId}");

                // Add user to role-based groups
                var roles = Context.User?.FindAll(ClaimTypes.Role)?.Select(c => c.Value) ?? Enumerable.Empty<string>();
                foreach (var role in roles)
                {
                    Console.WriteLine($"User {userId} has role: {role}");

                    // Fix: Check for exact role "Quản lý" (Manager) first, NOT "Quản lý kỹ thuật"
                    if (role == "Quản lý" || role == "Manager")
                    {
                        await Groups.AddToGroupAsync(Context.ConnectionId, "Managers");
                        Console.WriteLine($"User {userId} added to Managers group");
                    }
                    // Check for Technical Manager role (includes "Quản lý kỹ thuật")
                    if (role == "Quản lý kỹ thuật" || role == "Technical Manager" || role.Contains("Quản lý kỹ thuật"))
                    {
                        await Groups.AddToGroupAsync(Context.ConnectionId, "TechnicalManagers");
                        Console.WriteLine($"User {userId} added to TechnicalManagers group");
                    }
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
                Console.WriteLine($"User {userId} disconnected from NotificationHub");
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Client can call this to mark notification as read
        public Task MarkAsRead(int notificationId)
        {
            var userId = Context.UserIdentifier ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"User {userId} marked notification {notificationId} as read");
            // The actual marking will be done through the API endpoint
            return Task.CompletedTask;
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

