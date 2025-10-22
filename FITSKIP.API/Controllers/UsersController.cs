using FITSKIP.Application.Interfaces;
using FITSKIP.Application.Services;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using FITSKIP.Infrastructure.DbContexts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Text.RegularExpressions;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService userService;
    private readonly IRoleService roleService;
    private readonly FitskipDbContext db;

    public UsersController(IUserService userService, IRoleService roleService, FitskipDbContext db)
    {
        this.userService = userService;
        this.roleService = roleService;
        this.db = db;
    }

    // GET: https://localhost:7003/api/Users
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<UserDTO>>> Get(CancellationToken cancellationToken)
    {
        var users = await userService.GetUsersWithRolesAsync(cancellationToken);
        return Ok(users);
    }

    // GET: https://localhost:7003/api/Users/{fullName}
    [HttpGet]
    [Route("{fullName}")]
    public async Task<IActionResult> GetUserByFullName(string fullName, CancellationToken cancellationToken)
    {
        var user = await userService.GetByUsernameAsync(fullName, cancellationToken);
        if (user == null)
        {
            return NotFound();
        }
        var response = new UserDTO
        {
            Id = user.Id,
            UserName = user.UserName,
            NormalizedUserName = user.NormalizedUserName,
            NormalizedEmail = user.NormalizedEmail,
            Email = user.Email,
            EmailConfirmed = user.EmailConfirmed,
            PasswordHash = user.PasswordHash,
            SecurityStamp = user.SecurityStamp,
            ConcurrencyStamp = user.ConcurrencyStamp,
            PhoneNumber = user.PhoneNumber,
            PhoneNumberConfirmed = user.PhoneNumberConfirmed,
            TwoFactorEnabled = user.TwoFactorEnabled,
            LockoutEnd = user.LockoutEnd,
            LockoutEnabled = user.LockoutEnabled,
            AccessFailedCount = user.AccessFailedCount,
            FullName = user.FullName,
            EmployeeCode = user.EmployeeCode,
        };
        return Ok(response);
    }

    // GET: https://localhost:7003/api/Users/id/{id}
    [HttpGet]
    [Route("id/{id}")]
    public async Task<IActionResult> GetUserById(string id, CancellationToken cancellationToken)
    {
        var user = await userService.GetUserByIdAsync(id, cancellationToken);
        if (user == null)
        {
            return NotFound();
        }
        var response = new UserDTO
        {
            Id = user.Id,
            UserName = user.UserName,
            NormalizedUserName = user.NormalizedUserName,
            NormalizedEmail = user.NormalizedEmail,
            Email = user.Email,
            EmailConfirmed = user.EmailConfirmed,
            PasswordHash = user.PasswordHash,
            SecurityStamp = user.SecurityStamp,
            ConcurrencyStamp = user.ConcurrencyStamp,
            PhoneNumber = user.PhoneNumber,
            PhoneNumberConfirmed = user.PhoneNumberConfirmed,
            TwoFactorEnabled = user.TwoFactorEnabled,
            LockoutEnd = user.LockoutEnd,
            LockoutEnabled = user.LockoutEnabled,
            AccessFailedCount = user.AccessFailedCount,
            FullName = user.FullName,
            EmployeeCode = user.EmployeeCode,
        };
        return Ok(response);
    }

    // DELETE: https://localhost:7003/api/Users/{id}
    [HttpDelete]
    [Route("{id}")]
    public async Task<IActionResult> DeleteUser(string id, CancellationToken cancellationToken)
    {
        try
        {


            var user = await userService.DeleteUserAsync(id, cancellationToken);
            if (user == null)
            {
                return NotFound();
            }
            var response = new UserDTO
            {
                UserName = user.UserName,
                NormalizedUserName = user.NormalizedUserName,
                NormalizedEmail = user.NormalizedEmail,
                Email = user.Email,
                EmailConfirmed = user.EmailConfirmed,
                PasswordHash = user.PasswordHash,
                SecurityStamp = user.SecurityStamp,
                ConcurrencyStamp = user.ConcurrencyStamp,
                PhoneNumber = user.PhoneNumber,
                PhoneNumberConfirmed = user.PhoneNumberConfirmed,
                TwoFactorEnabled = user.TwoFactorEnabled,
                LockoutEnd = user.LockoutEnd,
                LockoutEnabled = user.LockoutEnabled,
                AccessFailedCount = user.AccessFailedCount,
                FullName = user.FullName,
                EmployeeCode = user.EmployeeCode,
            };
            return Ok(response);
        }
        catch(Exception ex)
        {
            return BadRequest(new { success = false, message = $"Error: {ex.Message}" });
        }
    }

    // PUT: https://localhost:7003/api/Users/{id}
    [HttpPut]
    [Route("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var updatedUser = await userService.UpdateUserAsync(id, request, cancellationToken);
            if (updatedUser == null)
            {
                return NotFound();
            }
            return Ok(updatedUser);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = $"Error: {ex.Message}" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = $"Error: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error: Có lỗi xảy ra khi cập nhật người dùng", details = ex.Message });
        }
    }

    // POST: https://localhost:7003/api/Users
    [HttpPost]
    public async Task<ActionResult<UserDTO>> CreateUser([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            // Validate model state first
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                return BadRequest(new { success = false, message = $"Error: Validation failed - {string.Join(", ", errors)}" });
            }

            var createdUser = await userService.CreateUserWithAssignmentsAsync(request, cancellationToken);

            var response = new UserDTO
            {
                Id = createdUser.Id,
                UserName = createdUser.UserName,
                Email = createdUser.Email,
                FullName = createdUser.FullName,
                EmployeeCode = createdUser.EmployeeCode,
                PhoneNumber = createdUser.PhoneNumber,
                EmailConfirmed = createdUser.EmailConfirmed,
                LockoutEnabled = createdUser.LockoutEnabled,
                IsActive = true
            };

            return Ok(new { success = true, data = response, message = "Tạo người dùng thành công" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = $"Error: {ex.Message}" });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = $"Error: {ex.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error: Có lỗi xảy ra khi tạo người dùng", details = ex.Message });
        }
    }

    [HttpPost("import-excel")]
    public async Task<ActionResult> ImportUsersFromExcel(IFormFile file, CancellationToken cancellationToken)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded." });
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (extension != ".xlsx" && extension != ".xls")
            {
                return BadRequest(new { message = "Invalid file format. Please upload an Excel file (.xlsx or .xls)" });
            }

            if (file.Length > 10 * 1024 * 1024)
            {
                return BadRequest(new { message = "File size exceeds 10MB limit." });
            }

            var excelImportService = HttpContext.RequestServices.GetRequiredService<IExcelImportService>();

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream, cancellationToken);
                stream.Position = 0;

                var userRequests = await excelImportService.ImportUsersFromExcelAsync(stream);

                if (!userRequests.Any())
                {
                    return BadRequest(new { message = "No valid users found in the Excel file." });
                }

                var successCount = 0;
                var failedUsers = new List<object>();

                const string defaultPassword = "123456";

                foreach (var request in userRequests)
                {
                    try
                    {
                        var user = new User
                        {
                            Id = Guid.NewGuid().ToString(),
                            UserName = request.UserName,
                            NormalizedUserName = request.UserName.ToUpperInvariant(),
                            Email = request.Email,
                            NormalizedEmail = request.Email.ToUpperInvariant(),
                            FullName = request.FullName,
                            EmployeeCode = request.EmployeeCode,
                            PhoneNumber = request.PhoneNumber,
                            EmailConfirmed = true,
                            LockoutEnabled = true,
                            SecurityStamp = Guid.NewGuid().ToString(),
                            ConcurrencyStamp = Guid.NewGuid().ToString()
                        };

                        var password = !string.IsNullOrWhiteSpace(request.Password)
                            ? request.Password
                            : defaultPassword;

                        await userService.CreateUserAsync(user, password, request.RoleIds, cancellationToken);
                        successCount++;
                    }
                    catch (ArgumentException ex)
                    {
                        failedUsers.Add(new
                        {
                            UserName = request.UserName,
                            Email = request.Email,
                            Error = ex.Message
                        });
                    }
                    catch (Exception ex)
                    {
                        failedUsers.Add(new
                        {
                            UserName = request.UserName,
                            Email = request.Email,
                            Error = ex.Message
                        });
                    }
                }

                return Ok(new
                {
                    Message = "Import completed",
                    TotalUsers = userRequests.Count,
                    SuccessCount = successCount,
                    FailedCount = failedUsers.Count,
                    FailedUsers = failedUsers,
                });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error importing users: {ex.Message}" });
        }
    }

    [HttpGet("download-template")]
    public async Task<IActionResult> DownloadExcelTemplate()
    {
        try
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            var roles = await roleService.GetRolesWithUserCountAsync();

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Users");
                var rolesSheet = package.Workbook.Worksheets.Add("RolesList");
                rolesSheet.Hidden = eWorkSheetHidden.Hidden;

                for (int i = 0; i < roles.Count; i++)
                {
                    rolesSheet.Cells[i + 1, 1].Value = roles[i].Name;
                }

                worksheet.Cells[1, 1].Value = "Email";
                worksheet.Cells[1, 2].Value = "FullName";
                worksheet.Cells[1, 3].Value = "EmployeeCode";
                worksheet.Cells[1, 4].Value = "Role";
                worksheet.Cells[1, 5].Value = "PhoneNumber";

                using (var range = worksheet.Cells[1, 1, 1, 5])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                }

                worksheet.Column(5).Style.Numberformat.Format = "@";

                var roleValidation = worksheet.DataValidations.AddListValidation("E2:E1000");
                roleValidation.Formula.ExcelFormula = $"=RolesList!$A$1:$A${roles.Count}";
                roleValidation.ShowErrorMessage = true;
                roleValidation.ErrorTitle = "Giá trị không hợp lệ";
                roleValidation.Error = "Vui lòng chọn role từ danh sách có sẵn.";

                worksheet.Cells[2, 1].Value = "Trungnd98@fpt.com";
                worksheet.Cells[2, 2].Value = "Duc Trung";
                worksheet.Cells[2, 3].Value = "EMP001";
                worksheet.Cells[2, 4].Value = roles.FirstOrDefault()?.Name ?? "User";
                worksheet.Cells[2, 5].Value = "0973771789";

                worksheet.Cells.AutoFitColumns();

                var stream = new MemoryStream();
                package.SaveAs(stream);
                stream.Position = 0;

                return File(stream,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "UserImportTemplate.xlsx");
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error generating template: {ex.Message}");
        }
    }

    [HttpGet("export-excel")]
    public async Task<IActionResult> ExportUsersToExcel(CancellationToken cancellationToken)
    {
        try
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            var users = await userService.GetUsersWithRolesAsync(cancellationToken);
            var allLines = await db.Lines.AsNoTracking().ToDictionaryAsync(l => l.LineId, l => l.LineName, cancellationToken);

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Users");

                worksheet.Cells[1, 1].Value = "Người dùng";
                worksheet.Cells[1, 2].Value = "Email";
                worksheet.Cells[1, 3].Value = "Họ và tên";
                worksheet.Cells[1, 4].Value = "Mã nhân viên";
                worksheet.Cells[1, 5].Value = "Số điện thoại";
                worksheet.Cells[1, 6].Value = "Trạng thái";
                worksheet.Cells[1, 7].Value = "Vai trò";
                worksheet.Cells[1, 8].Value = "Phòng ban";
                worksheet.Cells[1, 9].Value = "Dây chuyền";

                using (var range = worksheet.Cells[1, 1, 1, 9])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
                    range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                }

                for (int i = 0; i < users.Count; i++)
                {
                    var user = users[i];
                    var row = i + 2;

                    var lineNames = user.LineIds != null && user.LineIds.Any()
                        ? string.Join(", ", user.LineIds.Select(id => allLines.ContainsKey(id) ? allLines[id] : $"Line {id}"))
                        : "Không có dây chuyền";

                    worksheet.Cells[row, 1].Value = user.UserName;
                    worksheet.Cells[row, 2].Value = user.Email;
                    worksheet.Cells[row, 3].Value = user.FullName;
                    worksheet.Cells[row, 4].Value = user.EmployeeCode;
                    worksheet.Cells[row, 5].Value = user.PhoneNumber;
                    worksheet.Cells[row, 6].Value = user.IsActive ? "Hoạt động" : "Ngừng hoạt động";
                    worksheet.Cells[row, 7].Value = user.Roles != null && user.Roles.Any()
                        ? string.Join(", ", user.Roles)
                        : "Không có vai trò";
                    worksheet.Cells[row, 8].Value = user.DepartmentName ?? "Chưa có PB";
                    worksheet.Cells[row, 9].Value = lineNames;

                    using (var range = worksheet.Cells[row, 1, row, 9])
                    {
                        range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                        range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    }
                }

                worksheet.Cells.AutoFitColumns();

                var stream = new MemoryStream();
                package.SaveAs(stream);
                stream.Position = 0;

                var fileName = $"Users_Export_{DateTime.Now:yyyy_MM_dd_HH_mm_ss}.xlsx";

                return File(stream,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName);
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error exporting users: {ex.Message}");
        }
    }

    [HttpGet("managers")]
    public async Task<ActionResult<IReadOnlyList<UserDTO>>> GetManagers()
    {
        try
        {
            var managers = await userService.GetUsersByRoleAsync("Quản lý");
            var managerDTOs = managers.Select(manager => new UserDTO
            {
                Id = manager.Id,
                UserName = manager.UserName,
                Email = manager.Email,
                PhoneNumber = manager.PhoneNumber,
                FullName = manager.FullName,
                EmployeeCode = manager.EmployeeCode
            }).ToList();

            return Ok(managerDTOs);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet]
    [Route("active-team-leads/{lineId}")]
    public async Task<IActionResult> GetActiveTeamLeadsByLine(int lineId, CancellationToken cancellationToken)
    {
        try
        {
            var teamLeads = await userService.GetActiveTeamLeadsByLineAsync(lineId, cancellationToken);

            var teamLeadDTOs = teamLeads.Select(teamLead => new
            {
                Id = teamLead.Id,
                UserId = teamLead.Id,
                UserName = teamLead.UserName,
                Email = teamLead.Email,
                PhoneNumber = teamLead.PhoneNumber,
                FullName = teamLead.FullName,
                EmployeeCode = teamLead.EmployeeCode,
                DepartmentId = teamLead.DepartmentId,
                DepartmentName = teamLead.Department?.DepartmentName,
                IsActive = teamLead.IsActive,
                RoleId = teamLead.RoleId,
                RoleName = teamLead.Role?.Name
            }).ToList();

            return Ok(teamLeadDTOs);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Lỗi: {ex.Message}");
        }
    }

    [HttpPost]
    [Route("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(string id, CancellationToken cancellationToken)
    {
        try
        {
            var user = await userService.GetUserByIdAsync(id, cancellationToken);
            if (user == null)
            {
                return NotFound(new { success = false, message = "Người dùng không tồn tại" });
            }

            const string defaultPassword = "123456";
            var result = await userService.ResetPasswordAsync(id, defaultPassword, cancellationToken);

            if (!result)
            {
                return BadRequest(new { success = false, message = "Không thể đặt lại mật khẩu" });
            }

            return Ok(new { success = true, message = "Đặt lại mật khẩu thành công. Mật khẩu mới là: 123456" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = $"Lỗi: {ex.Message}" });
        }
    }

    // GET: https://localhost:7003/api/Users/{userId}/lines
    [HttpGet]
    [Route("{userId}/lines")]
    public async Task<IActionResult> GetUserLines(string userId, CancellationToken cancellationToken)
    {
        try
        {
            var userLines = await userService.GetUserLinesAsync(userId, cancellationToken);
            return Ok(userLines);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = $"Lỗi: {ex.Message}" });
        }
    }
}