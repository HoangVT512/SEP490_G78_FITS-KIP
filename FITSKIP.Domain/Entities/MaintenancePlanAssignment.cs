using System;

namespace FITSKIP.Domain.Entities;

/// <summary>
/// Bảng phân công nhiều kỹ thuật viên cho một kế hoạch bảo trì
/// Hỗ trợ assign nhiều người cho cùng một plan
/// </summary>
public class MaintenancePlanAssignment
{
    public int AssignmentId { get; set; }
    
    /// <summary>
    /// FK: Kế hoạch bảo trì
    /// </summary>
    public int PlanId { get; set; }
    
    /// <summary>
    /// FK: User (Technician)
    /// </summary>
    public string TechnicianId { get; set; } = null!;
    
    /// <summary>
    /// Loại công việc: 'Electrical' hoặc 'Mechanical'
    /// </summary>
    public string TechnicianType { get; set; } = null!;
    
    /// <summary>
    /// Người phân công (TechManager)
    /// </summary>
    public string? AssignedBy { get; set; }
    
    public DateTime AssignedDate { get; set; } = DateTime.Now;
    
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public virtual MaintenancePlan Plan { get; set; } = null!;
    public virtual User Technician { get; set; } = null!;
    public virtual User? AssignedByUser { get; set; }
}
