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
                        var userName = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                        var email = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                        var password = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                        var fullName = worksheet.Cells[row, 4].Value?.ToString()?.Trim();
                        var gender = worksheet.Cells[row, 5].Value?.ToString()?.Trim();
                        var employeeCode = worksheet.Cells[row, 6].Value?.ToString()?.Trim();
                        var position = worksheet.Cells[row, 7].Value?.ToString()?.Trim();
                        var phoneNumber = worksheet.Cells[row, 8].Value?.ToString()?.Trim();

                        if (string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(email))
                        {
                            continue; 
                        }

                        users.Add(new CreateUserRequest
                        {
                            UserName = userName,
                            Email = email,
                            Password = password ?? "DefaultPassword123!",
                            FullName = fullName,
                            Gender = gender,
                            EmployeeCode = employeeCode,
                            Position = position,
                            PhoneNumber = phoneNumber
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