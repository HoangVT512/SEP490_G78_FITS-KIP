namespace FITSKIP.Application.Interfaces
{
    public interface INotificationHubService
    {
        Task SendToUserAsync(string userId, object data);
        Task SendToGroupAsync(string groupName, object data);
        Task SendToAllAsync(object data);
    }
}

