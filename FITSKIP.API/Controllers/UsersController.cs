using FITSKIP.Application.Interfaces;
using FITSKIP.Application.Services;
using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using OfficeOpenXml;

namespace FITSKIP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService userService;

    public UsersController(IUserService userService)
    {
        this.userService = userService;
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
            Gender = user.Gender,
            EmployeeCode = user.EmployeeCode,
            Position = user.Position,
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
            Gender = user.Gender,
            EmployeeCode = user.EmployeeCode,
            Position = user.Position,
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
            Gender = user.Gender,
            EmployeeCode = user.EmployeeCode,
            Position = user.Position,
        };
        return Ok(response);
    }
    // PUT: https://localhost:7003/api/Users/{id}
    [HttpPut]
    [Route("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UserDTO user, CancellationToken cancellationToken)
    {
        var updatedUser = new User
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
            Gender = user.Gender,
            EmployeeCode = user.EmployeeCode,
            Position = user.Position,
        };
        // Ensure the Id from the route is applied so the repository can find the existing entity
        updatedUser.Id = id;
        updatedUser = await userService.UpdateUserAsync(updatedUser, cancellationToken);
        if (updatedUser == null)
        {
            return NotFound();
        }
        var response = new UserDTO
        {
            Id = updatedUser.Id,
            UserName = updatedUser.UserName,
            NormalizedUserName = updatedUser.NormalizedUserName,
            NormalizedEmail = updatedUser.NormalizedEmail,
            Email = updatedUser.Email,
            EmailConfirmed = updatedUser.EmailConfirmed,
            PasswordHash = updatedUser.PasswordHash,
            SecurityStamp = updatedUser.SecurityStamp,
            ConcurrencyStamp = updatedUser.ConcurrencyStamp,
            PhoneNumber = updatedUser.PhoneNumber,
            PhoneNumberConfirmed = updatedUser.PhoneNumberConfirmed,
            TwoFactorEnabled = updatedUser.TwoFactorEnabled,
            LockoutEnd = updatedUser.LockoutEnd,
            LockoutEnabled = updatedUser.LockoutEnabled,
            AccessFailedCount = updatedUser.AccessFailedCount,
            FullName = updatedUser.FullName,
            Gender = updatedUser.Gender,
            EmployeeCode = updatedUser.EmployeeCode,
            Position = updatedUser.Position,
        };
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<UserDTO>> CreateUser([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        try
        {
            // Basic validation
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.UserName))
            {
                return BadRequest("Email and UserName are required fields.");
            }

            // Hash password for demo purposes
            var passwordHash = !string.IsNullOrEmpty(request.Password) ?
                Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(request.Password)) :
                null;

            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                UserName = request.UserName,
                NormalizedUserName = request.UserName.ToUpperInvariant(),
                Email = request.Email,
                NormalizedEmail = request.Email.ToUpperInvariant(),
                FullName = request.FullName,
                Gender = request.Gender,
                EmployeeCode = request.EmployeeCode,
                Position = request.Position,
                PhoneNumber = request.PhoneNumber,
                EmailConfirmed = true,
                LockoutEnabled = true,
                PasswordHash = passwordHash,
                SecurityStamp = Guid.NewGuid().ToString(),
                ConcurrencyStamp = Guid.NewGuid().ToString()
            };

            var createdUser = await userService.CreateUserAsync(user, cancellationToken);

            var response = new UserDTO
            {
                Id = createdUser.Id,
                UserName = createdUser.UserName,
                Email = createdUser.Email,
                FullName = createdUser.FullName,
                Gender = createdUser.Gender,
                EmployeeCode = createdUser.EmployeeCode,
                Position = createdUser.Position,
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

                        // Validation 4: Check email format
                        if (!IsValidEmail(request.Email))
                        {
                            failedUsers.Add(new
                            {
                                UserName = request.UserName,
                                Email = request.Email,
                                Error = "Email không hợp lệ"
                            });
                            continue;
                        }

                        var passwordHash = !string.IsNullOrEmpty(request.Password) ?
                            Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(request.Password)) :
                            null;

                        var user = new User
                        {
                            Id = Guid.NewGuid().ToString(),
                            UserName = request.UserName,
                            NormalizedUserName = request.UserName.ToUpperInvariant(),
                            Email = request.Email,
                            NormalizedEmail = request.Email.ToUpperInvariant(),
                            FullName = request.FullName,
                            Gender = request.Gender,
                            EmployeeCode = request.EmployeeCode,
                            Position = request.Position,
                            PhoneNumber = request.PhoneNumber,
                            EmailConfirmed = true,
                            LockoutEnabled = true,
                            PasswordHash = passwordHash,
                            SecurityStamp = Guid.NewGuid().ToString(),
                            ConcurrencyStamp = Guid.NewGuid().ToString()
                        };

                        await userService.CreateUserAsync(user, cancellationToken);
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
                    FailedUsers = failedUsers
                });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error importing users: {ex.Message}" });
        }
    }


    [HttpGet("download-template")]
    public IActionResult DownloadExcelTemplate()
    {
        try
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Users");


                worksheet.Cells[1, 1].Value = "UserName";
                worksheet.Cells[1, 2].Value = "Email";
                worksheet.Cells[1, 3].Value = "Password";
                worksheet.Cells[1, 4].Value = "FullName";
                worksheet.Cells[1, 5].Value = "Gender";
                worksheet.Cells[1, 6].Value = "EmployeeCode";
                worksheet.Cells[1, 7].Value = "Position";
                worksheet.Cells[1, 8].Value = "PhoneNumber";

                using (var range = worksheet.Cells[1, 1, 1, 8])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGray);
                }


                worksheet.Cells[2, 1].Value = "Trung";
                worksheet.Cells[2, 2].Value = "Trungnd98@fpt.com";
                worksheet.Cells[2, 3].Value = "123";
                worksheet.Cells[2, 4].Value = "Duc Trung";
                worksheet.Cells[2, 5].Value = "Male";
                worksheet.Cells[2, 6].Value = "EMP001";
                worksheet.Cells[2, 7].Value = "Engineer";
                worksheet.Cells[2, 8].Value = "0973771789";

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

    // GET: https://localhost:7003/api/Users/managers
    [HttpGet("managers")]
    public async Task<ActionResult<IReadOnlyList<UserDTO>>> GetManagers()
    {
        try
        {
            var managers = await userService.GetUsersByRoleAsync("Quan ly");
            var managerDTOs = managers.Select(manager => new UserDTO
            {
                Id = manager.Id,
                UserName = manager.UserName,
                Email = manager.Email,
                PhoneNumber = manager.PhoneNumber,
                FullName = manager.FullName
            }).ToList();

            return Ok(managerDTOs);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}



