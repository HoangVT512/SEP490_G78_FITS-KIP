using FITSKIP.Application.Interfaces;
using FITSKIP.Application.Services;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;
using System.Text.RegularExpressions;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService userService;
    private readonly IRoleService roleService;

    public UsersController(IUserService userService, IRoleService roleService)
    {
        this.userService = userService;
        this.roleService = roleService;
    }

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
    // PUT: https://localhost:7003/api/Users/{id}
    [HttpPut]
    [Route("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var updatedUser = await userService.UpdateUserAsync(id, request, cancellationToken);
        if (updatedUser == null)
        {
            return NotFound();
        }
        return Ok(updatedUser);
    }

    [HttpPost]
    public async Task<ActionResult<UserDTO>> CreateUser([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            // Basic validation - UserName is now auto-generated from EmployeeCode
            // No need to check UserName requirement here

            // Validation 1: Check if username already exists (will be EmployeeCode)
            var userName = string.IsNullOrEmpty(request.UserName) ? request.EmployeeCode : request.UserName;
            if (!string.IsNullOrEmpty(userName))
            {
                var existingUserByUsername = await userService.GetByUsernameAsync(userName, cancellationToken);
                if (existingUserByUsername != null)
                {
                    return BadRequest($"Tên đăng nhập '{userName}' đã tồn tại trong hệ thống");
                }
            }

            // Validation 2: Check if email already exists (only if email is provided)
            if (!string.IsNullOrEmpty(request.Email))
            {
                var existingUserByEmail = await userService.GetByEmailAsync(request.Email, cancellationToken);
                if (existingUserByEmail != null)
                {
                    return BadRequest($"Email '{request.Email}' đã tồn tại trong hệ thống");
                }
            }

            // Validation 3: Check if employee code already exists
            if (!string.IsNullOrEmpty(request.EmployeeCode))
            {
                var existingUserByEmployeeCode = await userService.GetByEmployeeCodeAsync(request.EmployeeCode, cancellationToken);
                if (existingUserByEmployeeCode != null)
                {
                    return BadRequest($"Mã nhân viên '{request.EmployeeCode}' đã tồn tại trong hệ thống");
                }
            }

            // Validation 4: Check email format (only if email is provided)
            if (!string.IsNullOrEmpty(request.Email) && !IsValidEmail(request.Email))
            {
                return BadRequest("Email không hợp lệ");
            }

            // Password will be handled by Identity in the service layer

            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                UserName = userName,
                NormalizedUserName = userName?.ToUpperInvariant(),
                Email = request.Email,
                NormalizedEmail = !string.IsNullOrEmpty(request.Email) ? request.Email.ToUpperInvariant() : null,
                FullName = request.FullName,
                EmployeeCode = request.EmployeeCode,
                PhoneNumber = request.PhoneNumber,
                EmailConfirmed = !string.IsNullOrEmpty(request.Email), // Only confirm if email is provided
                LockoutEnabled = true,
                SecurityStamp = Guid.NewGuid().ToString(),
                ConcurrencyStamp = Guid.NewGuid().ToString()
            };

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
                LockoutEnabled = createdUser.LockoutEnabled
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    private bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
    }
    public static bool IsValidVietnamPhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;

        string pattern = @"^(?:\+84|0)(?:3|5|7|8|9)[0-9]{8}$";
        return Regex.IsMatch(phoneNumber, pattern);
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
                        // Validation 1: Check if username already exists
                        var existingUserByUsername = await userService.GetByUsernameAsync(request.UserName, cancellationToken);
                        if (existingUserByUsername != null)
                        {
                            failedUsers.Add(new
                            {
                                UserName = request.UserName,
                                Email = request.Email,
                                Error = $"Tên đăng nhập '{request.UserName}' đã tồn tại trong hệ thống"
                            });
                            continue;
                        }

                        // Validation 2: Check if email already exists
                        var existingUserByEmail = await userService.GetByEmailAsync(request.Email, cancellationToken);
                        if (existingUserByEmail != null)
                        {
                            failedUsers.Add(new
                            {
                                UserName = request.UserName,
                                Email = request.Email,
                                Error = $"Email '{request.Email}' đã tồn tại trong hệ thống"
                            });
                            continue;
                        }

                        // Validation 3: Check if employee code already exists
                        if (!string.IsNullOrEmpty(request.EmployeeCode))
                        {
                            var existingUserByEmployeeCode = await userService.GetByEmployeeCodeAsync(request.EmployeeCode, cancellationToken);
                            if (existingUserByEmployeeCode != null)
                            {
                                failedUsers.Add(new
                                {
                                    UserName = request.UserName,
                                    Email = request.Email,
                                    Error = $"Mã nhân viên '{request.EmployeeCode}' đã tồn tại trong hệ thống"
                                });
                                continue;
                            }
                        }

                        // Validation 4: Check email format (only if email is provided)
                        if (!string.IsNullOrEmpty(request.Email) && !IsValidEmail(request.Email))
                        {
                            failedUsers.Add(new
                            {
                                UserName = request.UserName,
                                Email = request.Email,
                                Error = "Email không hợp lệ"
                            });
                            continue;
                        }
                        // Validation 5: Check phone number format (only if phone number is provided)
                        if (!string.IsNullOrEmpty(request.PhoneNumber) && !IsValidVietnamPhoneNumber(request.PhoneNumber))
                        {
                            failedUsers.Add(new
                            {
                                UserName = request.UserName,
                                Email = request.Email,
                                Error = "Số điện thoại không hợp lệ"
                            });
                            continue;
                        }

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

                        // Sử dụng password từ Excel hoặc default password
                        var password = !string.IsNullOrWhiteSpace(request.Password)
                            ? request.Password
                            : defaultPassword;

                        // Truyền RoleIds vào CreateUserAsync
                        await userService.CreateUserAsync(user, password, request.RoleIds, cancellationToken);
                        successCount++;
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

            // Lấy danh sách roles từ hệ thống
            var roles = await roleService.GetRolesWithUserCountAsync();

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Users");

                // Tạo sheet ẩn chứa danh sách roles
                var rolesSheet = package.Workbook.Worksheets.Add("RolesList");
                rolesSheet.Hidden = eWorkSheetHidden.Hidden;

                // Thêm danh sách roles vào sheet ẩn
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

                // Định dạng cột PhoneNumber là Text để tránh mất số 0 ở đầu
                worksheet.Column(5).Style.Numberformat.Format = "@";

                // Tạo dropdown validation cho cột Role (cột 4)
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

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Users");

                // Headers
                worksheet.Cells[1, 1].Value = "Người dùng";
                worksheet.Cells[1, 2].Value = "Email";
                worksheet.Cells[1, 3].Value = "Họ và tên";
                worksheet.Cells[1, 4].Value = "Mã nhân viên";
                worksheet.Cells[1, 5].Value = "Số điện thoại";
                worksheet.Cells[1, 6].Value = "Trạng thái";
                worksheet.Cells[1, 7].Value = "Vai trò";

                // Style headers
                using (var range = worksheet.Cells[1, 1, 1, 7])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightBlue);
                    range.Style.Border.Top.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    range.Style.Border.Bottom.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    range.Style.Border.Left.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                    range.Style.Border.Right.Style = OfficeOpenXml.Style.ExcelBorderStyle.Thin;
                }

                // Data rows
                for (int i = 0; i < users.Count; i++)
                {
                    var user = users[i];
                    var row = i + 2;

                    worksheet.Cells[row, 1].Value = user.UserName;
                    worksheet.Cells[row, 2].Value = user.Email;
                    worksheet.Cells[row, 3].Value = user.FullName;
                    worksheet.Cells[row, 4].Value = user.EmployeeCode;
                    worksheet.Cells[row, 5].Value = user.PhoneNumber;
                    worksheet.Cells[row, 6].Value = user.IsActive ? "Hoạt động" : "Ngừng hoạt động";
                    worksheet.Cells[row, 7].Value = user.Roles != null && user.Roles.Any()
                        ? string.Join(", ", user.Roles)
                        : "Không có vai trò";

                    // Add borders to data rows
                    using (var range = worksheet.Cells[row, 1, row, 7])
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

    // GET: https://localhost:7003/api/Users/managers
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
}



