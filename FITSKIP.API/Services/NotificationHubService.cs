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

        // ===== MAINTENANCE REAL-TIME NOTIFICATIONS =====

        /// <summary>
        /// Gửi thông báo khi Work Order được phân công cho Technician
        /// </summary>
        public async Task SendWorkOrderAssignedAsync(string technicianId, object workOrderData)
        {
            _logger.LogInformation($"📋 Sending WorkOrderAssigned to technician: {technicianId}");
            
            await _hubContext.Clients.Group($"user_{technicianId}")
                .SendAsync("WorkOrderAssigned", workOrderData);
            
            _logger.LogInformation($"✅ Sent WorkOrderAssigned to technician {technicianId}");
        }

        /// <summary>
        /// Gửi thông báo khi Technician bắt đầu Work Order (cho TechManager)
        /// </summary>
        public async Task SendWorkOrderStartedAsync(object workOrderData)
        {
            _logger.LogInformation($"▶️ Broadcasting WorkOrderStarted to TechnicalManagers");
            
            // Gửi đến tất cả TechManager
            await _hubContext.Clients.Group("TechnicalManagers")
                .SendAsync("WorkOrderStarted", workOrderData);
            
            _logger.LogInformation($"✅ Broadcasted WorkOrderStarted");
        }

        /// <summary>
        /// Gửi thông báo khi Technician hoàn thành Work Order (cho TechManager)
        /// </summary>
        public async Task SendWorkOrderCompletedAsync(object workOrderData)
        {
            _logger.LogInformation($"✅ Broadcasting WorkOrderCompleted to TechnicalManagers");
            
            await _hubContext.Clients.Group("TechnicalManagers")
                .SendAsync("WorkOrderCompleted", workOrderData);
            
            _logger.LogInformation($"✅ Broadcasted WorkOrderCompleted");
        }

        /// <summary>
        /// Gửi thông báo khi 1 Technician hoàn thành phần việc của mình (cho Technician còn lại)
        /// </summary>
        public async Task SendWorkOrderProgressUpdatedAsync(object progressData)
        {
            _logger.LogInformation($"🔄 Sending WorkOrderProgressUpdated");
            
            // Sử dụng JSON để parse data an toàn
            try
            {
                var jsonData = System.Text.Json.JsonSerializer.Serialize(progressData);
                var dict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, System.Text.Json.JsonElement>>(jsonData);
                
                if (dict != null && dict.ContainsKey("otherTechnicianId"))
                {
                    var otherTechId = dict["otherTechnicianId"].GetString();
                    
                    if (!string.IsNullOrEmpty(otherTechId))
                    {
                        _logger.LogInformation($"   Sending to technician: {otherTechId}");
                        
                        await _hubContext.Clients.Group($"user_{otherTechId}")
                            .SendAsync("WorkOrderProgressUpdated", progressData);
                        
                        _logger.LogInformation($"✅ Sent WorkOrderProgressUpdated to technician {otherTechId}");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"⚠️ Failed to parse otherTechnicianId: {ex.Message}");
            }
            
            // Cũng gửi đến TechManager để họ thấy tiến độ
            await _hubContext.Clients.Group("TechnicalManagers")
                .SendAsync("WorkOrderProgressUpdated", progressData);
            
            _logger.LogInformation($"✅ Broadcasted WorkOrderProgressUpdated to TechnicalManagers");
        }

        /// <summary>
        /// Gửi thông báo khi TechManager hủy Work Order (cho Technician)
        /// </summary>
        public async Task SendWorkOrderCancelledAsync(string technicianId, object workOrderData)
        {
            _logger.LogInformation($"❌ Sending WorkOrderCancelled to technician: {technicianId}");
            
            await _hubContext.Clients.Group($"user_{technicianId}")
                .SendAsync("WorkOrderCancelled", workOrderData);
            
            _logger.LogInformation($"✅ Sent WorkOrderCancelled to technician {technicianId}");
        }

        /// <summary>
        /// Gửi thông báo khi Technician cập nhật checklist item (cho TechManager)
        /// </summary>
        public async Task SendChecklistItemUpdatedAsync(object checklistData)
        {
            _logger.LogInformation($"☑️ Broadcasting ChecklistItemUpdated to TechnicalManagers");
            
            await _hubContext.Clients.Group("TechnicalManagers")
                .SendAsync("ChecklistItemUpdated", checklistData);
            
            _logger.LogInformation($"✅ Broadcasted ChecklistItemUpdated");
        }

        /// <summary>
        /// Gửi thông báo khi TechManager tạo Work Order mới (cho Technician được giao)
        /// </summary>
        public async Task SendNewWorkOrderCreatedAsync(string technicianId, object workOrderData)
        {
            _logger.LogInformation($"🆕 Sending NewWorkOrderCreated to technician: {technicianId}");
            
            await _hubContext.Clients.Group($"user_{technicianId}")
                .SendAsync("NewWorkOrderCreated", workOrderData);
            
            _logger.LogInformation($"✅ Sent NewWorkOrderCreated to technician {technicianId}");
        }

        /// <summary>
        /// Gửi thông báo khi TechManager hoãn bảo trì
        /// </summary>
        public async Task SendMaintenancePostponedAsync(object planData)
        {
            _logger.LogInformation($"⏰ Broadcasting MaintenancePostponed to TechnicalManagers");
            
            await _hubContext.Clients.Group("TechnicalManagers")
                .SendAsync("MaintenancePostponed", planData);
            
            _logger.LogInformation($"✅ Broadcasted MaintenancePostponed");
        }

        /// <summary>
        /// Gửi thông báo khi Technician yêu cầu hỗ trợ (cho TechManager)
        /// </summary>
        public async Task SendTechnicianRequestHelpAsync(object requestData)
        {
            _logger.LogInformation($"🆘 Broadcasting TechnicianRequestHelp to TechnicalManagers");
            
            await _hubContext.Clients.Group("TechnicalManagers")
                .SendAsync("TechnicianRequestHelp", requestData);
            
            _logger.LogInformation($"✅ Broadcasted TechnicianRequestHelp");
        }

        /// <summary>
        /// Gửi thông báo cập nhật dữ liệu chung (trigger reload)
        /// </summary>
        public async Task SendDataUpdatedAsync(string dataType, object data)
        {
            _logger.LogInformation($"🔄 Broadcasting DataUpdated: {dataType}");
            
            // Gửi đến TechnicalManagers
            await _hubContext.Clients.Group("TechnicalManagers")
                .SendAsync("DataUpdated", new { type = dataType, data = data, timestamp = DateTime.UtcNow });
            
            _logger.LogInformation($"✅ Broadcasted DataUpdated: {dataType}");
        }

        /// <summary>
        /// Gửi thông báo phân công lại Work Order
        /// </summary>
        public async Task SendWorkOrderReassignedAsync(string oldTechnicianId, string newTechnicianId, object workOrderData)
        {
            _logger.LogInformation($"🔄 Sending WorkOrderReassigned - Old: {oldTechnicianId}, New: {newTechnicianId}");
            
            // Thông báo cho KTV cũ
            if (!string.IsNullOrEmpty(oldTechnicianId))
            {
                await _hubContext.Clients.Group($"user_{oldTechnicianId}")
                    .SendAsync("WorkOrderUnassigned", workOrderData);
            }
            
            // Thông báo cho KTV mới
            if (!string.IsNullOrEmpty(newTechnicianId))
            {
                await _hubContext.Clients.Group($"user_{newTechnicianId}")
                    .SendAsync("WorkOrderAssigned", workOrderData);
            }
            
            _logger.LogInformation($"✅ Sent WorkOrderReassigned notifications");
        }
    }
}