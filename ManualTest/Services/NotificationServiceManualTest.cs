using FITSKIP.Application.Services;
using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Domain.Interfaces;
using Moq;

namespace FITSKIP.Application.Tests.ManualTests;

public class NotificationServiceManualTest
{
    private readonly Mock<INotificationRepository> _mockRepository;
    private readonly Mock<INotificationHubService> _mockHubService;
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly NotificationService _service;
    private readonly List<Notification> _testNotifications;
    private readonly List<User> _testUsers;

    public NotificationServiceManualTest()
    {
        _mockRepository = new Mock<INotificationRepository>();
        _mockHubService = new Mock<INotificationHubService>();
        _mockUserRepository = new Mock<IUserRepository>();
        _service = new NotificationService(_mockRepository.Object, _mockHubService.Object, _mockUserRepository.Object);
        _testUsers = InitializeUserTestData();
        _testNotifications = InitializeNotificationTestData();
    }

    public async Task RunTests()
    {
        while (true)
        {
            ShowMenu();
            var choice = Console.ReadLine();

            switch (choice)
            {
                case "1":
                    await TestCreateNotificationAsync();
                    break;
                case "2":
                    await TestGetNotificationByIdAsync();
                    break;
                case "3":
                    await TestGetUserNotificationsAsync();
                    break;
                case "4":
                    await TestGetUserNotificationSummaryAsync();
                    break;
                case "5":
                    await TestMarkAsReadAsync();
                    break;
                case "6":
                    await TestMarkAllAsReadAsync();
                    break;
                case "7":
                    await TestDeleteNotificationAsync();
                    break;
                case "8":
                    await TestDeleteAllReadNotificationsAsync();
                    break;
                case "9":
                    await TestSendNotificationToUserAsync();
                    break;
                case "10":
                    await TestSendNotificationToGroupAsync();
                    break;
                case "11":
                    await TestSendNotificationToAllAsync();
                    break;
                case "12":
                    await TestSendNotificationToRoleAsync();
                    break;
                case "13":
                    await TestSendIncidentNotificationToDepartmentAsync();
                    break;
                case "14":
                    await TestRefreshIncidentsForDepartmentAsync();
                    break;
                case "0":
                    Console.WriteLine("Goodbye!");
                    return;
                default:
                    Console.WriteLine("Invalid choice. Please try again.");
                    break;
            }

            Console.WriteLine("\nPress any key to continue...");
            Console.ReadKey();
            Console.Clear();
        }
    }

    private void ShowMenu()
    {
        Console.WriteLine("NOTIFICATION SERVICE TEST MENU");
        Console.WriteLine("==============================");
        Console.WriteLine("DATABASE OPERATIONS");
        Console.WriteLine("1. Test CreateNotificationAsync");
        Console.WriteLine("2. Test GetNotificationByIdAsync");
        Console.WriteLine("3. Test GetUserNotificationsAsync");
        Console.WriteLine("4. Test GetUserNotificationSummaryAsync");
        Console.WriteLine("5. Test MarkAsReadAsync");
        Console.WriteLine("6. Test MarkAllAsReadAsync");
        Console.WriteLine("7. Test DeleteNotificationAsync");
        Console.WriteLine("8. Test DeleteAllReadNotificationsAsync");
        Console.WriteLine();
        Console.WriteLine("REAL-TIME NOTIFICATIONS");
        Console.WriteLine("9. Test SendNotificationToUserAsync");
        Console.WriteLine("10. Test SendNotificationToGroupAsync");
        Console.WriteLine("11. Test SendNotificationToAllAsync");
        Console.WriteLine("12. Test SendNotificationToRoleAsync");
        Console.WriteLine("13. Test SendIncidentNotificationToDepartmentAsync");
        Console.WriteLine("14. Test RefreshIncidentsForDepartmentAsync");
        Console.WriteLine();
        Console.WriteLine("0. Exit");
        Console.WriteLine();
        Console.Write("Enter your choice: ");
    }

    private async Task TestCreateNotificationAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: CreateNotificationAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        Console.Write("[INPUT] Enter Title: ");
        var title = Console.ReadLine();

        Console.Write("[INPUT] Enter Message: ");
        var message = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(message))
        {
            Console.WriteLine("[ERROR] User ID and Message are required.");
            return;
        }

        var request = new CreateNotificationRequest
        {
            UserId = userId,
            Title = title,
            Message = message
        };

        Console.WriteLine($"\n[INPUT DATA] UserId: {request.UserId}, Title: {request.Title}, Message: {request.Message}");

        // Setup mock
        var newNotification = new Notification
        {
            NotificationId = _testNotifications.Max(n => n.NotificationId) + 1,
            UserId = request.UserId,
            Title = request.Title,
            Message = request.Message,
            IsRead = false,
            CreatedDate = DateTime.UtcNow
        };

        _mockRepository.Setup(x => x.CreateAsync(It.IsAny<Notification>()))
            .ReturnsAsync(newNotification);

        try
        {
            Console.WriteLine("[STATUS] Executing CreateNotificationAsync...");
            var result = await _service.CreateNotificationAsync(request);

            Console.WriteLine("[SUCCESS] Notification created successfully:");
            Console.WriteLine(FormatNotificationDTO(result));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetNotificationByIdAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetNotificationByIdAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Notification ID: ");
        int.TryParse(Console.ReadLine(), out int id);

        var notification = _testNotifications.FirstOrDefault(n => n.NotificationId == id);

        if (notification == null)
        {
            Console.WriteLine($"[WARNING] Test data not found for ID: {id}");
        }

        _mockRepository.Setup(x => x.GetByIdAsync(id))
            .ReturnsAsync(notification);

        Console.WriteLine($"[STATUS] Executing GetNotificationByIdAsync with ID: {id}...");

        try
        {
            var result = await _service.GetNotificationByIdAsync(id);

            if (result != null)
            {
                Console.WriteLine("[SUCCESS] Notification found:");
                Console.WriteLine(FormatNotificationDTO(result));
            }
            else
            {
                Console.WriteLine($"[NOT FOUND] No notification found with ID: {id}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetUserNotificationsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetUserNotificationsAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(userId))
        {
            Console.WriteLine("[ERROR] User ID cannot be empty.");
            return;
        }

        Console.Write("[INPUT] Unread only? (y/n): ");
        var unreadInput = Console.ReadLine();
        bool unreadOnly = unreadInput?.ToLower() == "y";

        var userNotifications = _testNotifications
            .Where(n => n.UserId == userId && (!unreadOnly || !n.IsRead))
            .ToList();

        // Setup mock
        _mockRepository.Setup(x => x.GetByUserIdAsync(userId, unreadOnly))
            .ReturnsAsync(userNotifications);

        Console.WriteLine($"[STATUS] Executing GetUserNotificationsAsync for user: {userId} (unreadOnly: {unreadOnly})...");

        try
        {
            var result = await _service.GetUserNotificationsAsync(userId, unreadOnly);

            Console.WriteLine($"[SUCCESS] Result: Found {result.Count()} notifications");

            if (result.Any())
            {
                Console.WriteLine("\n[DATA] Notification List:");
                Console.WriteLine("----------------------------------------");
                foreach (var notification in result)
                {
                    Console.WriteLine(FormatNotificationDTO(notification));
                }
            }
            else
            {
                Console.WriteLine("[INFO] No notifications found for this user");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestGetUserNotificationSummaryAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: GetUserNotificationSummaryAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(userId))
        {
            Console.WriteLine("[ERROR] User ID cannot be empty.");
            return;
        }

        var userNotifications = _testNotifications.Where(n => n.UserId == userId).ToList();
        var unreadCount = userNotifications.Count(n => !n.IsRead);
        var recentNotifications = userNotifications.OrderByDescending(n => n.CreatedDate).Take(10).ToList();

        // Setup mock
        _mockRepository.Setup(x => x.GetByUserIdAsync(userId, false))
            .ReturnsAsync(userNotifications);
        _mockRepository.Setup(x => x.GetUnreadCountAsync(userId))
            .ReturnsAsync(unreadCount);
        _mockRepository.Setup(x => x.GetRecentByUserIdAsync(userId, 10))
            .ReturnsAsync(recentNotifications);

        Console.WriteLine($"[STATUS] Executing GetUserNotificationSummaryAsync for user: {userId}...");

        try
        {
            var result = await _service.GetUserNotificationSummaryAsync(userId);

            Console.WriteLine("[SUCCESS] Notification summary:");
            Console.WriteLine($"  Total Notifications: {result.TotalNotifications}");
            Console.WriteLine($"  Unread Count: {result.UnreadCount}");
            Console.WriteLine($"  Recent Notifications: {result.RecentNotifications.Count}");

            if (result.RecentNotifications.Any())
            {
                Console.WriteLine("\n[DATA] Recent Notifications:");
                Console.WriteLine("----------------------------------------");
                foreach (var notification in result.RecentNotifications)
                {
                    Console.WriteLine(FormatNotificationDTO(notification));
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestMarkAsReadAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: MarkAsReadAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Notification ID: ");
        int.TryParse(Console.ReadLine(), out int id);

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(userId))
        {
            Console.WriteLine("[ERROR] User ID cannot be empty.");
            return;
        }

        var notification = _testNotifications.FirstOrDefault(n => n.NotificationId == id && n.UserId == userId);

        if (notification != null)
        {
            Console.WriteLine($"[CURRENT] Notification status: IsRead = {notification.IsRead}");
        }

        // Setup mock
        _mockRepository.Setup(x => x.MarkAsReadAsync(id, userId))
            .ReturnsAsync(notification != null);

        Console.WriteLine($"[STATUS] Executing MarkAsReadAsync...");

        try
        {
            var result = await _service.MarkAsReadAsync(id, userId);

            Console.WriteLine($"[SUCCESS] Mark as read result: {result}");
            Console.WriteLine($"[RESULT] {(result ? "Notification marked as read successfully" : "Failed to mark notification as read")}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestMarkAllAsReadAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: MarkAllAsReadAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(userId))
        {
            Console.WriteLine("[ERROR] User ID cannot be empty.");
            return;
        }

        var unreadCount = _testNotifications.Count(n => n.UserId == userId && !n.IsRead);
        Console.WriteLine($"[INFO] User has {unreadCount} unread notifications");

        // Setup mock
        _mockRepository.Setup(x => x.MarkAllAsReadAsync(userId))
            .ReturnsAsync(true);

        Console.WriteLine($"[STATUS] Executing MarkAllAsReadAsync...");

        try
        {
            var result = await _service.MarkAllAsReadAsync(userId);

            Console.WriteLine($"[SUCCESS] Mark all as read result: {result}");
            Console.WriteLine($"[RESULT] {(result ? "All notifications marked as read successfully" : "Failed to mark all notifications as read")}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestDeleteNotificationAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: DeleteNotificationAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Notification ID to delete: ");
        int.TryParse(Console.ReadLine(), out int id);

        var notification = _testNotifications.FirstOrDefault(n => n.NotificationId == id);

        if (notification != null)
        {
            Console.WriteLine($"[WARNING] Will delete notification:");
            Console.WriteLine(FormatNotification(notification));
        }
        else
        {
            Console.WriteLine($"[NOT FOUND] Notification with ID {id} not found in test data");
        }

        Console.Write($"[CONFIRM] Are you sure you want to delete? (y/n): ");
        var confirm = Console.ReadLine();

        if (confirm?.ToLower() != "y")
        {
            Console.WriteLine("[CANCELLED] Delete operation cancelled");
            return;
        }

        // Setup mock
        _mockRepository.Setup(x => x.DeleteAsync(id))
            .ReturnsAsync(true);

        try
        {
            Console.WriteLine("[STATUS] Executing DeleteNotificationAsync...");
            var result = await _service.DeleteNotificationAsync(id);

            Console.WriteLine($"[SUCCESS] Delete result: {result}");
            Console.WriteLine($"[RESULT] {(result ? "Notification deleted successfully" : "Failed to delete notification")}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestDeleteAllReadNotificationsAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: DeleteAllReadNotificationsAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(userId))
        {
            Console.WriteLine("[ERROR] User ID cannot be empty.");
            return;
        }

        var readCount = _testNotifications.Count(n => n.UserId == userId && n.IsRead);
        Console.WriteLine($"[INFO] User has {readCount} read notifications");

        // Setup mock
        _mockRepository.Setup(x => x.DeleteAllReadByUserIdAsync(userId))
            .Returns(Task.CompletedTask);

        Console.WriteLine($"[STATUS] Executing DeleteAllReadNotificationsAsync...");

        try
        {
            await _service.DeleteAllReadNotificationsAsync(userId);

            Console.WriteLine($"[SUCCESS] All read notifications deleted successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestSendNotificationToUserAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: SendNotificationToUserAsync (Real-time)");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter User ID: ");
        var userId = Console.ReadLine();

        Console.Write("[INPUT] Enter Title: ");
        var title = Console.ReadLine();

        Console.Write("[INPUT] Enter Message: ");
        var message = Console.ReadLine();

        Console.Write("[INPUT] Enter Type (info/warning/error/success): ");
        var type = Console.ReadLine() ?? "info";

        if (string.IsNullOrWhiteSpace(userId) || string.IsNullOrWhiteSpace(message))
        {
            Console.WriteLine("[ERROR] User ID and Message are required.");
            return;
        }

        Console.WriteLine($"\n[INPUT DATA] UserId: {userId}, Title: {title}, Message: {message}, Type: {type}");

        // Setup mock
        _mockHubService.Setup(x => x.SendToUserAsync(userId, It.IsAny<object>()))
            .Returns(Task.CompletedTask);

        try
        {
            Console.WriteLine("[STATUS] Executing SendNotificationToUserAsync...");
            await _service.SendNotificationToUserAsync(userId, title!, message, type);

            Console.WriteLine($"[SUCCESS] Real-time notification sent to user {userId}");
            _mockHubService.Verify(x => x.SendToUserAsync(userId, It.IsAny<object>()), Times.Once);
            Console.WriteLine("[VERIFY] Hub service called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestSendNotificationToGroupAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: SendNotificationToGroupAsync (Real-time)");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Group Name (e.g., Managers, Technicians): ");
        var groupName = Console.ReadLine();

        Console.Write("[INPUT] Enter Title: ");
        var title = Console.ReadLine();

        Console.Write("[INPUT] Enter Message: ");
        var message = Console.ReadLine();

        Console.Write("[INPUT] Enter Type (info/warning/error/success): ");
        var type = Console.ReadLine() ?? "info";

        if (string.IsNullOrWhiteSpace(groupName) || string.IsNullOrWhiteSpace(message))
        {
            Console.WriteLine("[ERROR] Group Name and Message are required.");
            return;
        }

        Console.WriteLine($"\n[INPUT DATA] GroupName: {groupName}, Title: {title}, Message: {message}, Type: {type}");

        // Setup mock
        _mockHubService.Setup(x => x.SendToGroupAsync(groupName, It.IsAny<object>()))
            .Returns(Task.CompletedTask);

        try
        {
            Console.WriteLine("[STATUS] Executing SendNotificationToGroupAsync...");
            await _service.SendNotificationToGroupAsync(groupName, title!, message, type);

            Console.WriteLine($"[SUCCESS] Real-time notification sent to group {groupName}");
            _mockHubService.Verify(x => x.SendToGroupAsync(groupName, It.IsAny<object>()), Times.Once);
            Console.WriteLine("[VERIFY] Hub service called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestSendNotificationToAllAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: SendNotificationToAllAsync (Real-time)");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Title: ");
        var title = Console.ReadLine();

        Console.Write("[INPUT] Enter Message: ");
        var message = Console.ReadLine();

        Console.Write("[INPUT] Enter Type (info/warning/error/success): ");
        var type = Console.ReadLine() ?? "info";

        if (string.IsNullOrWhiteSpace(message))
        {
            Console.WriteLine("[ERROR] Message is required.");
            return;
        }

        Console.WriteLine($"\n[INPUT DATA] Title: {title}, Message: {message}, Type: {type}");

        // Setup mock
        _mockHubService.Setup(x => x.SendToAllAsync(It.IsAny<object>()))
            .Returns(Task.CompletedTask);

        try
        {
            Console.WriteLine("[STATUS] Executing SendNotificationToAllAsync...");
            await _service.SendNotificationToAllAsync(title!, message, type);

            Console.WriteLine($"[SUCCESS] Real-time notification sent to all users");
            _mockHubService.Verify(x => x.SendToAllAsync(It.IsAny<object>()), Times.Once);
            Console.WriteLine("[VERIFY] Hub service called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestSendNotificationToRoleAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: SendNotificationToRoleAsync (Real-time + DB)");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Role Name (e.g., Kỹ thuật viên, Quản lý kỹ thuật): ");
        var roleName = Console.ReadLine();

        Console.Write("[INPUT] Enter Message: ");
        var message = Console.ReadLine();

        Console.Write("[INPUT] Enter Type (info/warning/replacementApproved): ");
        var type = Console.ReadLine() ?? "info";

        if (string.IsNullOrWhiteSpace(roleName) || string.IsNullOrWhiteSpace(message))
        {
            Console.WriteLine("[ERROR] Role Name and Message are required.");
            return;
        }

        Console.WriteLine($"\n[INPUT DATA] RoleName: {roleName}, Message: {message}, Type: {type}");

        // Setup mock - Get users by role
        var usersInRole = _testUsers.Take(2).ToList();
        _mockUserRepository.Setup(x => x.GetUsersByRoleAsync(roleName, It.IsAny<CancellationToken>()))
            .ReturnsAsync(usersInRole);

        Console.WriteLine($"[INFO] Found {usersInRole.Count} users with role '{roleName}'");

        // Setup mock - Create notification for each user
        _mockRepository.Setup(x => x.CreateAsync(It.IsAny<Notification>()))
            .ReturnsAsync((Notification n, CancellationToken ct) => n);

        // Setup mock - Send real-time notification
        if (roleName == "Kỹ thuật viên" && type == "replacementApproved")
        {
            _mockHubService.Setup(x => x.SendReplacementApprovedAsync(It.IsAny<object>()))
                .Returns(Task.CompletedTask);
        }
        else
        {
            _mockHubService.Setup(x => x.SendToGroupAsync(It.IsAny<string>(), It.IsAny<object>()))
                .Returns(Task.CompletedTask);
        }

        try
        {
            Console.WriteLine("[STATUS] Executing SendNotificationToRoleAsync...");
            await _service.SendNotificationToRoleAsync(roleName, message, type);

            Console.WriteLine($"[SUCCESS] Notifications created for {usersInRole.Count} users and real-time notification sent to role {roleName}");
            _mockRepository.Verify(x => x.CreateAsync(It.IsAny<Notification>()), Times.Exactly(usersInRole.Count));
            Console.WriteLine($"[VERIFY] Created {usersInRole.Count} notifications in database");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestSendIncidentNotificationToDepartmentAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: SendIncidentNotificationToDepartmentAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Department ID: ");
        int.TryParse(Console.ReadLine(), out int deptId);

        Console.Write("[INPUT] Enter Title: ");
        var title = Console.ReadLine();

        Console.Write("[INPUT] Enter Message: ");
        var message = Console.ReadLine();

        if (string.IsNullOrWhiteSpace(message))
        {
            Console.WriteLine("[ERROR] Message is required.");
            return;
        }

        Console.WriteLine($"\n[INPUT DATA] DepartmentId: {deptId}, Title: {title}, Message: {message}");

        var groupName = $"TechnicalManagers_Department_{deptId}";
        Console.WriteLine($"[INFO] Target SignalR group: {groupName}");

        // Setup mock
        _mockHubService.Setup(x => x.SendToGroupAsync(groupName, It.IsAny<object>()))
            .Returns(Task.CompletedTask);

        try
        {
            Console.WriteLine("[STATUS] Executing SendIncidentNotificationToDepartmentAsync...");
            await _service.SendIncidentNotificationToDepartmentAsync(deptId, title!, message);

            Console.WriteLine($"[SUCCESS] Incident notification sent to department {deptId}");
            _mockHubService.Verify(x => x.SendToGroupAsync(groupName, It.IsAny<object>()), Times.Once);
            Console.WriteLine("[VERIFY] Hub service called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private async Task TestRefreshIncidentsForDepartmentAsync()
    {
        Console.WriteLine("\n=========================================");
        Console.WriteLine("TEST: RefreshIncidentsForDepartmentAsync");
        Console.WriteLine("=========================================");

        Console.Write("[INPUT] Enter Department ID: ");
        int.TryParse(Console.ReadLine(), out int deptId);

        Console.WriteLine($"\n[INPUT DATA] DepartmentId: {deptId}");

        var groupName = $"TechnicalManagers_Department_{deptId}";
        Console.WriteLine($"[INFO] Target SignalR group: {groupName}");
        Console.WriteLine($"[INFO] This will send a refresh signal to update the incident list");

        // Setup mock
        _mockHubService.Setup(x => x.SendToGroupAsync(groupName, It.IsAny<object>()))
            .Returns(Task.CompletedTask);

        try
        {
            Console.WriteLine("[STATUS] Executing RefreshIncidentsForDepartmentAsync...");
            await _service.RefreshIncidentsForDepartmentAsync(deptId);

            Console.WriteLine($"[SUCCESS] Refresh signal sent to department {deptId}");
            _mockHubService.Verify(x => x.SendToGroupAsync(groupName, It.IsAny<object>()), Times.Once);
            Console.WriteLine("[VERIFY] Hub service called exactly once");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
        }
    }

    private List<User> InitializeUserTestData()
    {
        return new List<User>
        {
            new User
            {
                Id = "user001",
                UserName = "john.doe",
                Email = "john.doe@company.com",
                FullName = "John Doe",
                IsActive = true
            },
            new User
            {
                Id = "user002",
                UserName = "jane.smith",
                Email = "jane.smith@company.com",
                FullName = "Jane Smith",
                IsActive = true
            },
            new User
            {
                Id = "user003",
                UserName = "bob.wilson",
                Email = "bob.wilson@company.com",
                FullName = "Bob Wilson",
                IsActive = true
            }
        };
    }

    private List<Notification> InitializeNotificationTestData()
    {
        return new List<Notification>
        {
            new Notification
            {
                NotificationId = 1,
                UserId = "user001",
                Title = "Sự cố mới",
                Message = "Có sự cố mới được báo cáo trên chuyền A1",
                IsRead = false,
                CreatedDate = DateTime.UtcNow.AddHours(-2),
                User = _testUsers[0]
            },
            new Notification
            {
                NotificationId = 2,
                UserId = "user001",
                Title = "Linh kiện được duyệt",
                Message = "Yêu cầu linh kiện #123 đã được duyệt",
                IsRead = true,
                CreatedDate = DateTime.UtcNow.AddDays(-1),
                User = _testUsers[0]
            },
            new Notification
            {
                NotificationId = 3,
                UserId = "user002",
                Title = "Bảo trì định kỳ",
                Message = "Thiết bị EQ-001 cần bảo trì định kỳ",
                IsRead = false,
                CreatedDate = DateTime.UtcNow.AddHours(-5),
                User = _testUsers[1]
            },
            new Notification
            {
                NotificationId = 4,
                UserId = "user002",
                Title = "Sản xuất hoàn thành",
                Message = "Ca sản xuất sáng đã hoàn thành",
                IsRead = false,
                CreatedDate = DateTime.UtcNow.AddHours(-1),
                User = _testUsers[1]
            },
            new Notification
            {
                NotificationId = 5,
                UserId = "user003",
                Title = "Cập nhật hệ thống",
                Message = "Hệ thống sẽ bảo trì vào 22:00 tối nay",
                IsRead = false,
                CreatedDate = DateTime.UtcNow.AddMinutes(-30),
                User = _testUsers[2]
            }
        };
    }

    private string FormatNotification(Notification notification)
    {
        if (notification == null) return "[NULL]";

        return $"{{ID:{notification.NotificationId}, UserId:\"{notification.UserId}\", Title:\"{notification.Title}\", Message:\"{notification.Message}\", IsRead:{notification.IsRead}, Created:{notification.CreatedDate:yyyy-MM-dd HH:mm}}}";
    }

    private string FormatNotificationDTO(NotificationDTO notification)
    {
        if (notification == null) return "[NULL]";

        return $"{{ID:{notification.NotificationId}, UserId:\"{notification.UserId}\", Title:\"{notification.Title}\", Message:\"{notification.Message}\", IsRead:{notification.IsRead}, Created:{notification.CreatedDate:yyyy-MM-dd HH:mm}}}";
    }
}

