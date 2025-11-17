using System;
using System.Collections.Generic;

namespace FITSKIP.Domain.Entities;

/// <summary>
/// Mẫu checklist bảo trì theo công đoạn (Stage)
/// VD: Tất cả máy tiện trong công đoạn "Công đoạn tiện" dùng chung 1 template
/// </summary>
public partial class MaintenanceTemplate
{
    public int TemplateId { get; set; }

    /// <summary>
    /// FK: Công đoạn (Stage) - Các máy trong cùng công đoạn dùng chung template
    /// </summary>
    public int StageId { get; set; }

    /// <summary>
    /// Tên template: VD "Checklist bảo trì máy tiện"
    /// </summary>
    public string TemplateName { get; set; } = null!;

    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedDate { get; set; } = DateTime.Now;

    public string? CreatedBy { get; set; }

    public DateTime? UpdatedDate { get; set; }

    public string? UpdatedBy { get; set; }

    // Navigation properties
    public virtual Stage Stage { get; set; } = null!;
    public virtual User? CreatedByUser { get; set; }
    public virtual User? UpdatedByUser { get; set; }
    public virtual ICollection<MaintenanceTemplateItem> TemplateItems { get; set; } = new List<MaintenanceTemplateItem>();
    public virtual ICollection<MaintenancePlan> MaintenancePlans { get; set; } = new List<MaintenancePlan>();
}
