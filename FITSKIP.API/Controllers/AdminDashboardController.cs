using FITSKIP.Application.Interfaces;
using FITSKIP.Domain.DTO;
using Microsoft.AspNetCore.Mvc;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
public class AdminDashboardController : ControllerBase
{
    private readonly IUserService userService;
    private readonly IDepartmentService departmentService;
    private readonly ILineService lineService;
    private readonly IStageService stageService;
    private readonly IRoleService roleService;

    public AdminDashboardController(
        IUserService userService,
        IDepartmentService departmentService,
        ILineService lineService,
        IStageService stageService,
        IRoleService roleService)
    {
        this.userService = userService;
        this.departmentService = departmentService;
        this.lineService = lineService;
        this.stageService = stageService;
        this.roleService = roleService;
    }

    [HttpGet("statistics")]
    public async Task<IActionResult> GetDashboardStatistics(CancellationToken cancellationToken)
    {
        try
        {
            // Lấy dữ liệu từ các services
            var users = await userService.GetUsersWithRolesAsync(cancellationToken);
            var departments = await departmentService.GetAllAsync(cancellationToken);
            var lines = await lineService.GetLinesAsync(cancellationToken);
            var stages = await stageService.GetStagesAsync(cancellationToken);
            var roles = await roleService.GetRolesWithUserCountAsync();

            // Tính toán thống kê
            var totalUsers = users.Count;
            var activeUsers = users.Count(u => u.LockoutEnd == null || u.LockoutEnd < DateTimeOffset.Now);
            var lockedUsers = users.Count(u => u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.Now);
            var totalDepartments = departments.Count;
            var totalLines = lines.Count;
            var totalStages = stages.Count;
            var totalRoles = roles.Count;

            // Thống kê người dùng theo vai trò
            var usersByRole = roles.Select(role => new
            {
                RoleName = role.Name,
                UserCount = role.UserCount,
                Percentage = totalUsers > 0 ? Math.Round((double)role.UserCount / totalUsers * 100, 1) : 0
            }).OrderByDescending(x => x.UserCount).ToList();

            // Thống kê phòng ban theo số lượng chuyền
            var departmentStats = departments.Select(dept => new
            {
                DepartmentName = dept.DepartmentName,
                LineCount = lines.Count(l => l.DepartmentId == dept.DepartmentId),
                ManagerName = dept.ManagerName ?? "Chưa có",
                Status = dept.IsActive ? "active" : "inactive"
            }).OrderByDescending(x => x.LineCount).ToList();

            // Thống kê chuyền theo số lượng công đoạn
            var lineStats = lines.Select(line => new
            {
                LineName = line.LineName,
                DepartmentName = departments.FirstOrDefault(d => d.DepartmentId == line.DepartmentId)?.DepartmentName ?? "N/A",
                StageCount = stages.Count(s => s.LineId == line.LineId),
                Status = line.IsActive ? "active" : "inactive"
            }).OrderByDescending(x => x.StageCount).ToList();

            var response = new
            {
                // Tổng quan chung
                Summary = new
                {
                    TotalUsers = totalUsers,
                    ActiveUsers = activeUsers,
                    LockedUsers = lockedUsers,
                    TotalDepartments = totalDepartments,
                    TotalLines = totalLines,
                    TotalStages = totalStages,
                    TotalRoles = totalRoles
                },
                // Phân bố người dùng theo vai trò
                UsersByRole = usersByRole,
                // Thống kê phòng ban
                DepartmentStats = departmentStats,
                // Thống kê chuyền
                LineStats = lineStats.Take(10), // Top 10 chuyền
                // Thống kê trạng thái
                StatusStats = new
                {
                    ActiveDepartments = departments.Count(d => d.IsActive),
                    InactiveDepartments = departments.Count(d => !d.IsActive),
                    ActiveLines = lines.Count(l => l.IsActive),
                    InactiveLines = lines.Count(l => !l.IsActive)
                }
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy thống kê dashboard", error = ex.Message });
        }
    }

    [HttpGet("recent-users")]
    public async Task<IActionResult> GetRecentUsers([FromQuery] int limit = 10, CancellationToken cancellationToken = default)
    {
        try
        {
            var users = await userService.GetUsersWithRolesAsync(cancellationToken);
            var recentUsers = users
                .OrderByDescending(u => u.Id) // Assuming newer IDs are more recent
                .Take(limit)
                .Select(u => new
                {
                    u.Id,
                    u.UserName,
                    u.Email,
                    u.FullName,
                    u.EmployeeCode,
                    Roles = u.Roles,
                    IsLocked = u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.Now,
                    LockoutEnd = u.LockoutEnd
                })
                .ToList();

            return Ok(recentUsers);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lấy danh sách người dùng mới", error = ex.Message });
        }
    }
}
