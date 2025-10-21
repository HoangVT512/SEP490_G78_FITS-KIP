using OfficeOpenXml;
using FITSKIP.Domain.DTO;
using FITSKIP.Application.Interfaces;

namespace FITSKIP.Application.Services
{

    public class ExcelImportService : IExcelImportService
    {
        public ExcelImportService()
        {
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        }

        public async Task<List<CreateUserRequest>> ImportUsersFromExcelAsync(Stream fileStream)
        {
            var users = new List<CreateUserRequest>();

            using (var package = new ExcelPackage(fileStream))
            {
                var worksheet = package.Workbook.Worksheets[0];
                var rowCount = worksheet.Dimension?.Rows ?? 0;

                for (int row = 2; row <= rowCount; row++)
                {
                    try
                    {
                        var email = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                        var password = "123456";
                        var fullName = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                        var employeeCode = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                        var role = worksheet.Cells[row, 4].Value?.ToString()?.Trim();
                        var phoneNumber = worksheet.Cells[row, 5].Value?.ToString()?.Trim();

                        // Xử lý số điện thoại: loại bỏ dấu nháy đơn nếu có (để tránh mất số 0 ở đầu)
                        if (!string.IsNullOrEmpty(phoneNumber) && phoneNumber.StartsWith("'"))
                        {
                            phoneNumber = phoneNumber.Substring(1);
                        }

                        if (string.IsNullOrEmpty(email))
                        {
                            continue;
                        }

                        users.Add(new CreateUserRequest
                        {
                            UserName = employeeCode,
                            Email = email,
                            Password = password,
                            FullName = fullName,
                            EmployeeCode = employeeCode,
                            PhoneNumber = phoneNumber,
                            RoleIds = role != null ? new[] { role } : null
                        });
                    }
                    catch (Exception)
                    {

                        continue;
                    }
                }
            }

            return await Task.FromResult(users);
        }
    }
}