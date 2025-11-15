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

        /// <summary>
        /// Import Maintenance Templates từ Excel
        /// Format: StageName | TemplateName | Description | StepName | StepDescription | Category | OrderIndex
        /// </summary>
        public async Task<List<CreateMaintenanceTemplateRequest>> ImportTemplatesFromExcelAsync(Stream fileStream)
        {
            var templates = new Dictionary<string, CreateMaintenanceTemplateRequest>();

            using (var package = new ExcelPackage(fileStream))
            {
                var worksheet = package.Workbook.Worksheets[0];
                var rowCount = worksheet.Dimension?.Rows ?? 0;

                for (int row = 2; row <= rowCount; row++)
                {
                    try
                    {
                        var stageName = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                        var templateName = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                        var description = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                        var stepName = worksheet.Cells[row, 4].Value?.ToString()?.Trim();
                        var stepDescription = worksheet.Cells[row, 5].Value?.ToString()?.Trim();
                        var category = worksheet.Cells[row, 6].Value?.ToString()?.Trim();
                        var orderIndexStr = worksheet.Cells[row, 7].Value?.ToString()?.Trim();

                        if (string.IsNullOrEmpty(stageName) || string.IsNullOrEmpty(templateName))
                        {
                            continue; // Bỏ qua dòng không hợp lệ
                        }

                        // Parse OrderIndex
                        if (!int.TryParse(orderIndexStr, out int orderIndex))
                        {
                            orderIndex = 1;
                        }

                        // Validate Category
                        if (string.IsNullOrEmpty(category))
                        {
                            category = "General";
                        }
                        else
                        {
                            category = category.Trim();
                            // Normalize category
                            if (category.Equals("Electrical", StringComparison.OrdinalIgnoreCase))
                                category = "Electrical";
                            else if (category.Equals("Mechanical", StringComparison.OrdinalIgnoreCase))
                                category = "Mechanical";
                            else
                                category = "General";
                        }

                        // Tạo unique key cho template (StageName + TemplateName)
                        var templateKey = $"{stageName}_{templateName}";

                        // Nếu template chưa tồn tại, tạo mới
                        if (!templates.ContainsKey(templateKey))
                        {
                            templates[templateKey] = new CreateMaintenanceTemplateRequest
                            {
                                StageName = stageName, // Lưu tạm StageName để resolve sau
                                TemplateName = templateName,
                                Description = description,
                                TemplateItems = new List<CreateTemplateItemRequest>()
                            };
                        }

                        // Thêm checklist item vào template
                        if (!string.IsNullOrEmpty(stepName))
                        {
                            // ✅ SỬA logic RequiredRole
                            string? requiredRole = category switch
                            {
                                "Electrical" => "Electrical",
                                "Mechanical" => "Mechanical",
                                _ => null // General không yêu cầu role cụ thể
                            };

                            templates[templateKey].TemplateItems.Add(new CreateTemplateItemRequest
                            {
                                StepName = stepName,
                                StepDescription = stepDescription, // ✅ THÊM
                                Category = category,
                                OrderIndex = orderIndex,
                                RequiredRole = requiredRole, // ✅ SỬA logic
                                IsRequired = true
                            });
                        }
                    }
                    catch (Exception)
                    {
                        continue; // Bỏ qua dòng lỗi
                    }
                }
            }

            return await Task.FromResult(templates.Values.ToList());
        }

        /// <summary>
        /// Tạo file Excel mẫu cho Maintenance Template
        /// </summary>
        public byte[] GenerateTemplateExcelTemplate()
        {
            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Templates");

                // Header row - ✅ THÊM cột StepDescription
                worksheet.Cells[1, 1].Value = "Tên công đoạn (Stage)";
                worksheet.Cells[1, 2].Value = "Tên mẫu bảo trì";
                worksheet.Cells[1, 3].Value = "Mô tả";
                worksheet.Cells[1, 4].Value = "Tên bước kiểm tra";
                worksheet.Cells[1, 5].Value = "Mô tả chi tiết bước";
                worksheet.Cells[1, 6].Value = "Loại (Electrical/Mechanical)";
                worksheet.Cells[1, 7].Value = "Thứ tự";

                // Style header
                using (var range = worksheet.Cells[1, 1, 1, 7])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(173, 216, 230)); // LightBlue
                    range.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                }

                // Sample data (2 templates với checklist items) - ✅ THÊM StepDescription
                worksheet.Cells[2, 1].Value = "Hàn linh kiện";
                worksheet.Cells[2, 2].Value = "Bảo trì hàn linh kiện tháng";
                worksheet.Cells[2, 3].Value = "Bảo trì định kỳ cho máy hàn linh kiện";
                worksheet.Cells[2, 4].Value = "Kiểm tra nhiệt độ mỏ hàn";
                worksheet.Cells[2, 5].Value = "Đo nhiệt độ mỏ hàn, nhiệt độ chuẩn từ 300-350°C";
                worksheet.Cells[2, 6].Value = "Electrical";
                worksheet.Cells[2, 7].Value = 1;

                worksheet.Cells[3, 1].Value = "Hàn linh kiện";
                worksheet.Cells[3, 2].Value = "Bảo trì hàn linh kiện tháng";
                worksheet.Cells[3, 3].Value = "Bảo trì định kỳ cho máy hàn linh kiện";
                worksheet.Cells[3, 4].Value = "Kiểm tra hệ thống làm mát";
                worksheet.Cells[3, 5].Value = "Kiểm tra quạt làm mát, đảm bảo hoạt động bình thường";
                worksheet.Cells[3, 6].Value = "Mechanical";
                worksheet.Cells[3, 7].Value = 2;

                worksheet.Cells[4, 1].Value = "Hàn linh kiện";
                worksheet.Cells[4, 2].Value = "Bảo trì hàn linh kiện tháng";
                worksheet.Cells[4, 3].Value = "Bảo trì định kỳ cho máy hàn linh kiện";
                worksheet.Cells[4, 4].Value = "Kiểm tra vệ sinh bề mặt";
                worksheet.Cells[4, 5].Value = "Lau sạch bề mặt máy, kiểm tra không có bụi bẩn";
                worksheet.Cells[4, 6].Value = "Electrical";
                worksheet.Cells[4, 7].Value = 3;

                // Auto-fit columns
                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                // Add instructions - ✅ SỬA hướng dẫn
                var instructionRow = worksheet.Dimension.Rows + 2;
                worksheet.Cells[instructionRow, 1].Value = "HƯỚNG DẪN:";
                worksheet.Cells[instructionRow, 1].Style.Font.Bold = true;
                worksheet.Cells[instructionRow + 1, 1].Value = "- Mỗi dòng là 1 bước kiểm tra (checklist item)";
                worksheet.Cells[instructionRow + 2, 1].Value = "- Các dòng có cùng 'Tên công đoạn' và 'Tên mẫu bảo trì' sẽ được gom thành 1 template";
                worksheet.Cells[instructionRow + 3, 1].Value = "- Loại: nhập 'Electrical' (điện), 'Mechanical' (cơ), hoặc 'General' (chung)"; // ✅ SỬA
                worksheet.Cells[instructionRow + 4, 1].Value = "- Thứ tự: số nguyên dương (1, 2, 3,...)";
                worksheet.Cells[instructionRow + 5, 1].Value = "- Mô tả chi tiết bước: Hướng dẫn cụ thể cách thực hiện bước kiểm tra"; // ✅ THÊM

                return package.GetAsByteArray();
            }
        }

        /// <summary>
        /// Import Template Items (Các bước kiểm tra) từ Excel
        /// Format: StepName | StepDescription | Category | OrderIndex
        /// </summary>
        public async Task<List<CreateTemplateItemRequest>> ImportTemplateItemsFromExcelAsync(Stream fileStream)
        {
            var items = new List<CreateTemplateItemRequest>();

            using (var package = new ExcelPackage(fileStream))
            {
                var worksheet = package.Workbook.Worksheets[0];
                var rowCount = worksheet.Dimension?.Rows ?? 0;

                for (int row = 2; row <= rowCount; row++)
                {
                    try
                    {
                        var stepName = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                        var stepDescription = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                        var category = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                        var orderIndexStr = worksheet.Cells[row, 4].Value?.ToString()?.Trim();

                        // Validate required fields
                        if (string.IsNullOrEmpty(stepName))
                        {
                            continue; // Bỏ qua dòng không hợp lệ
                        }

                        // Parse OrderIndex
                        if (!int.TryParse(orderIndexStr, out int orderIndex))
                        {
                            orderIndex = items.Count + 1; // Auto increment
                        }

                        // Validate & normalize Category
                        if (string.IsNullOrEmpty(category))
                        {
                            category = "General";
                        }
                        else
                        {
                            category = category.Trim();
                            if (category.Equals("Electrical", StringComparison.OrdinalIgnoreCase) || 
                                category.Equals("Điện", StringComparison.OrdinalIgnoreCase))
                                category = "Electrical";
                            else if (category.Equals("Mechanical", StringComparison.OrdinalIgnoreCase) || 
                                     category.Equals("Cơ", StringComparison.OrdinalIgnoreCase) ||
                                     category.Equals("Co", StringComparison.OrdinalIgnoreCase))
                                category = "Mechanical";
                            else
                                category = "General";
                        }

                        // Determine RequiredRole based on Category
                        string? requiredRole = category switch
                        {
                            "Electrical" => "Electrical",
                            "Mechanical" => "Mechanical",
                            _ => null
                        };

                        items.Add(new CreateTemplateItemRequest
                        {
                            StepName = stepName,
                            StepDescription = stepDescription,
                            Category = category,
                            OrderIndex = orderIndex,
                            RequiredRole = requiredRole,
                            IsRequired = true
                        });
                    }
                    catch (Exception)
                    {
                        continue; // Bỏ qua dòng lỗi
                    }
                }
            }

            return await Task.FromResult(items);
        }

        /// <summary>
        /// Tạo file Excel mẫu cho Template Items (Các bước kiểm tra)
        /// </summary>
        public byte[] GenerateTemplateItemsExcelTemplate()
        {
            using (var package = new ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Checklist Items");

                // Header row
                worksheet.Cells[1, 1].Value = "Tên bước kiểm tra";
                worksheet.Cells[1, 2].Value = "Mô tả chi tiết";
                worksheet.Cells[1, 3].Value = "Loại công việc";
                worksheet.Cells[1, 4].Value = "Thứ tự";

                // Style header
                using (var range = worksheet.Cells[1, 1, 1, 4])
                {
                    range.Style.Font.Bold = true;
                    range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.FromArgb(144, 238, 144)); // LightGreen
                    range.Style.HorizontalAlignment = OfficeOpenXml.Style.ExcelHorizontalAlignment.Center;
                }

                // Sample data - Ví dụ checklist cho máy hàn
                worksheet.Cells[2, 1].Value = "Kiểm tra nguồn điện";
                worksheet.Cells[2, 2].Value = "Đo điện áp đầu vào, đảm bảo ổn định 220V ±10%";
                worksheet.Cells[2, 3].Value = "Electrical";
                worksheet.Cells[2, 4].Value = 1;

                worksheet.Cells[3, 1].Value = "Kiểm tra nhiệt độ mỏ hàn";
                worksheet.Cells[3, 2].Value = "Đo nhiệt độ mỏ hàn, nhiệt độ chuẩn từ 300-350°C";
                worksheet.Cells[3, 3].Value = "Electrical";
                worksheet.Cells[3, 4].Value = 2;

                worksheet.Cells[4, 1].Value = "Kiểm tra hệ thống làm mát";
                worksheet.Cells[4, 2].Value = "Kiểm tra quạt làm mát, đảm bảo hoạt động bình thường, không có tiếng ồn bất thường";
                worksheet.Cells[4, 3].Value = "Mechanical";
                worksheet.Cells[4, 4].Value = 3;

                worksheet.Cells[5, 1].Value = "Kiểm tra vít kẹp";
                worksheet.Cells[5, 2].Value = "Kiểm tra và siết chặt các vít kẹp, đảm bảo không bị lỏng";
                worksheet.Cells[5, 3].Value = "Mechanical";
                worksheet.Cells[5, 4].Value = 4;

                // Auto-fit columns
                worksheet.Cells[worksheet.Dimension.Address].AutoFitColumns();

                // Add instructions
                var instructionRow = worksheet.Dimension.Rows + 2;
                worksheet.Cells[instructionRow, 1].Value = "HƯỚNG DẪN:";
                worksheet.Cells[instructionRow, 1].Style.Font.Bold = true;
                worksheet.Cells[instructionRow + 1, 1].Value = "- Mỗi dòng là 1 bước kiểm tra (checklist item)";
                worksheet.Cells[instructionRow + 2, 1].Value = "- Loại công việc: nhập 'Electrical' (điện) hoặc 'Mechanical' (cơ)";
                worksheet.Cells[instructionRow + 3, 1].Value = "- Thứ tự: số nguyên dương (1, 2, 3,...), quyết định thứ tự hiển thị";
                worksheet.Cells[instructionRow + 4, 1].Value = "- Mô tả chi tiết: Hướng dẫn cụ thể cách thực hiện, tiêu chuẩn đạt/không đạt";
                worksheet.Cells[instructionRow + 5, 1].Value = "- File này dùng để thêm các bước kiểm tra vào mẫu bảo trì đã tồn tại";

                return package.GetAsByteArray();
            }
        }

    }
}