using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FITSKIP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        /// <summary>
        /// Get all notifications for the current user
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<NotificationDTO>>>> GetMyNotifications([FromQuery] bool unreadOnly = false)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponse<IEnumerable<NotificationDTO>>
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                var notifications = await _notificationService.GetUserNotificationsAsync(userId, unreadOnly);

                return Ok(new ApiResponse<IEnumerable<NotificationDTO>>
                {
                    Success = true,
                    Message = "Notifications retrieved successfully",
                    Data = notifications
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<IEnumerable<NotificationDTO>>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Get notification summary for the current user
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<ApiResponse<NotificationSummaryDTO>>> GetNotificationSummary()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponse<NotificationSummaryDTO>
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                var summary = await _notificationService.GetUserNotificationSummaryAsync(userId);

                return Ok(new ApiResponse<NotificationSummaryDTO>
                {
                    Success = true,
                    Message = "Notification summary retrieved successfully",
                    Data = summary
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<NotificationSummaryDTO>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Get unread notification count for the current user
        /// </summary>
        [HttpGet("unread-count")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponse<int>
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                var notifications = await _notificationService.GetUserNotificationsAsync(userId, unreadOnly: true);
                var count = notifications.Count();

                return Ok(new ApiResponse<int>
                {
                    Success = true,
                    Message = "Unread notification count retrieved successfully",
                    Data = count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<int>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Get a specific notification by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<NotificationDTO>>> GetNotification(int id)
        {
            try
            {
                var notification = await _notificationService.GetNotificationByIdAsync(id);

                if (notification == null)
                {
                    return NotFound(new ApiResponse<NotificationDTO>
                    {
                        Success = false,
                        Message = "Notification not found"
                    });
                }

                // Check if the notification belongs to the current user
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (notification.UserId != userId && !User.IsInRole("Admin"))
                {
                    return Forbid();
                }

                return Ok(new ApiResponse<NotificationDTO>
                {
                    Success = true,
                    Message = "Notification retrieved successfully",
                    Data = notification
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<NotificationDTO>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Create a new notification (Admin or Manager only)
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin,Quản lý,Manager")]
        public async Task<ActionResult<ApiResponse<NotificationDTO>>> CreateNotification([FromBody] CreateNotificationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<NotificationDTO>
                    {
                        Success = false,
                        Message = "Invalid request data"
                    });
                }

                var notification = await _notificationService.CreateNotificationAsync(request);

                return CreatedAtAction(nameof(GetNotification), new { id = notification.NotificationId },
                    new ApiResponse<NotificationDTO>
                    {
                        Success = true,
                        Message = "Notification created successfully",
                        Data = notification
                    });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<NotificationDTO>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Mark a notification as read
        /// </summary>
        [HttpPut("{id}/read")]
        public async Task<ActionResult<ApiResponse<bool>>> MarkAsRead(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                var result = await _notificationService.MarkAsReadAsync(id, userId);

                if (!result)
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Notification not found or you don't have permission"
                    });
                }

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Notification marked as read",
                    Data = true
                });
            }
            catch (NotificationValidationException ex)
            {
                return BadRequest(new {
                    success = false,
                    message = ex.Message,
                    errorCode = ex.ErrorCode,
                    errorData = ex.ErrorData
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Mark all notifications as read for the current user
        /// </summary>
        [HttpPut("read-all")]
        public async Task<ActionResult<ApiResponse<bool>>> MarkAllAsRead()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                var result = await _notificationService.MarkAllAsReadAsync(userId);

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Message = "All notifications marked as read",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Delete a notification
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteNotification(int id)
        {
            try
            {
                var result = await _notificationService.DeleteNotificationAsync(id);

                if (!result)
                {
                    return NotFound(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Notification not found"
                    });
                }

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Notification deleted successfully",
                    Data = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Send a real-time notification to a specific user (Admin or Manager only)
        /// </summary>
        [HttpPost("send")]
        [Authorize(Roles = "Admin,Quản lý,Manager")]
        public async Task<ActionResult<ApiResponse<bool>>> SendNotification([FromBody] CreateNotificationRequest request)
        {
            try
            {
                if (!ModelState.IsValid || string.IsNullOrEmpty(request.UserId))
                {
                    return BadRequest(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Invalid request data"
                    });
                }

                await _notificationService.SendNotificationToUserAsync(
                    request.UserId,
                    request.Title ?? "",
                    request.Message,
                    "info"
                );

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Real-time notification sent successfully",
                    Data = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Send a real-time notification to all users (Admin or Manager only)
        /// </summary>
        [HttpPost("broadcast")]
        [Authorize(Roles = "Admin,Quản lý,Manager")]
        public async Task<ActionResult<ApiResponse<bool>>> BroadcastNotification([FromBody] CreateNotificationRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Invalid request data"
                    });
                }

                await _notificationService.SendNotificationToAllAsync(
                    request.Title ?? "",
                    request.Message,
                    "info"
                );

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Broadcast notification sent successfully",
                    Data = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Delete all read notifications for the current user
        /// </summary>
        [HttpDelete("delete-all-read")]
        [Authorize]
        public async Task<ActionResult<ApiResponse<bool>>> DeleteAllReadNotifications()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                await _notificationService.DeleteAllReadNotificationsAsync(userId);

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Message = "All read notifications deleted successfully",
                    Data = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Send notification to all Technical Managers (Technician only)
        /// </summary>
        [HttpPost("send-to-technical-managers")]
        [Authorize(Roles = "Kỹ thuật viên,Technician")]
        public async Task<ActionResult<ApiResponse<bool>>> SendToTechnicalManagers([FromBody] SendSparePartRequestNotification request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Invalid request data"
                    });
                }

                // Send notification to all Technical Managers
                await _notificationService.SendNotificationToRoleAsync(
                    "Quản lý kỹ thuật",
                    request.Message,
                    request.Type ?? "partRequest"
                );

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Notification sent to Technical Managers successfully",
                    Data = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Send notification to all Technicians (Manager only)
        /// </summary>
        [HttpPost("send-to-technicians")]
        [Authorize(Roles = "Admin,Quản lý,Manager,Quản lý kỹ thuật")]
        public async Task<ActionResult<ApiResponse<bool>>> SendToTechnicians([FromBody] SendSparePartRequestNotification request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "User not authenticated"
                    });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<bool>
                    {
                        Success = false,
                        Message = "Invalid request data"
                    });
                }

                // Send notification to all Technicians
                await _notificationService.SendNotificationToRoleAsync(
                    "Kỹ thuật viên",
                    request.Message,
                    request.Type ?? "replacementApproved"
                );

                return Ok(new ApiResponse<bool>
                {
                    Success = true,
                    Message = "Notification sent to Technicians successfully",
                    Data = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse<bool>
                {
                    Success = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }
    }

    /// <summary>
    /// Request model for sending spare part request notification
    /// </summary>
    public class SendSparePartRequestNotification
    {
        public string Message { get; set; } = string.Empty;
        public string? Type { get; set; }
        public object? Data { get; set; }
    }
}

