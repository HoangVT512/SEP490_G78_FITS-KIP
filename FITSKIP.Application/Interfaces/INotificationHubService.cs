namespace FITSKIP.Application.Interfaces
{
    public interface INotificationHubService
    {
        Task SendToUserAsync(string userId, object data, string dataType = "incident");
        Task SendToGroupAsync(string groupName, object data, string dataType = "incident");
        Task SendToAllAsync(object data);

        // Maintenance Real-time Notifications
        Task SendWorkOrderAssignedAsync(string technicianId, object workOrderData);
        Task SendWorkOrderStartedAsync(object workOrderData);
        Task SendWorkOrderCompletedAsync(object workOrderData);
        Task SendWorkOrderProgressUpdatedAsync(object progressData);
        Task SendWorkOrderCancelledAsync(string technicianId, object workOrderData);
        Task SendChecklistItemUpdatedAsync(object checklistData);
        Task SendNewWorkOrderCreatedAsync(string technicianId, object workOrderData);
        Task SendMaintenancePostponedAsync(object planData);
        Task SendTechnicianRequestHelpAsync(object requestData);
        Task SendDataUpdatedAsync(string dataType, object data);
        Task SendWorkOrderReassignedAsync(string oldTechnicianId, string newTechnicianId, object workOrderData);
        Task SendReplacementApprovedAsync(object replacementData);
    }
}

