using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

public partial class ReplacementHistory
{
    public int ReplacementId { get; set; }

    public int? EquipmentId { get; set; }

    public int? IncidentId { get; set; }

    public int? WorkOrderId { get; set; }

    public int PartId { get; set; }

    public int Quantity { get; set; }

    /// <summary>
    /// Ngày cấp phát linh kiện (NULL khi ở trạng thái "Chờ duyệt cấp phát", được ghi khi Quản lý kho duyệt)
    /// </summary>
    public DateTime? ReplacedDate { get; set; }

    public string ReplacedBy { get; set; } = null!;

    public string Status { get; set; } = "Đã cấp phát"; // Trạng thái mặc định (tiếng Việt)

    /// <summary>
    /// Số lượng thực tế sử dụng (có thể khác với Quantity nếu có thừa/thiếu)
    /// </summary>
    public int? ActualQuantityUsed { get; set; }

    /// <summary>
    /// Số lượng đang sử dụng = Đã xuất - Đã trả
    /// </summary>
    public int CurrentQuantityInUse => (ActualQuantityUsed ?? 0) - (QuantityToReturn ?? 0);

    /// <summary>
    /// Số lượng thừa cần trả lại kho (nếu ActualQuantityUsed < Quantity)
    /// </summary>
    public int? QuantityToReturn { get; set; }

    /// <summary>
    /// Ngày trả lại linh kiện thừa vào kho
    /// </summary>
    public DateTime? ReturnedDate { get; set; }

    /// <summary>
    /// Người xác nhận việc trả lại (thường là nhân viên kho)
    /// </summary>
    public string? ReturnConfirmedBy { get; set; }

    public virtual Equipment? Equipment { get; set; }

    public virtual IncidentHistory? Incident { get; set; }

    public virtual MaintenanceWorkOrder? WorkOrder { get; set; }
    
    public virtual SparePart? Part { get; set; } = null!;

    public virtual User? ReplacedByNavigation { get; set; } = null!;
}
