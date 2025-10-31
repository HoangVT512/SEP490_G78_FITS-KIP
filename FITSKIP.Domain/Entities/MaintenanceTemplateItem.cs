using System;

namespace FITSKIP.Domain.Entities;

/// <summary>
/// Chi tiết các bước kiểm tra trong template (Phần điện + Phần cơ)
/// </summary>
public partial class MaintenanceTemplateItem
{
    public int ItemId { get; set; }

    public int TemplateId { get; set; }

    /// <summary>
    /// Phân loại: "Phần điện" hoặc "Phần cơ"
    /// </summary>
    public string Category { get; set; } = null!;

    /// <summary>
    /// Thứ tự bước: a, b, c, d...
    /// </summary>
    public int OrderIndex { get; set; }

    /// <summary>
    /// Tên bước: VD "Kiểm tra bảo đường ATM cấp nguồn cho máy"
    /// </summary>
    public string StepName { get; set; } = null!;

    public string? StepDescription { get; set; }

    /// <summary>
    /// Bắt buộc check hay không
    /// </summary>
    public bool IsRequired { get; set; } = true;

    /// <summary>
    /// Vai trò yêu cầu: "Bảo trì điện" hoặc "Bảo trì cơ"
    /// </summary>
    public string RequiredRole { get; set; } = null!;

    public bool IsActive { get; set; } = true;

    // Navigation
    public virtual MaintenanceTemplate Template { get; set; } = null!;
}
