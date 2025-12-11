using FITSKIP.Domain.Entities;
using FITSKIP.Domain.DTO;
using System;
using System.Collections.Generic;

namespace FITSKIP.Application.Tests.TestData
{
    public static class IncidentTestData
    {
        public static List<Equipment> GetTestEquipments()
        {
            return new List<Equipment>
            {
                new Equipment
                {
                    EquipmentId = 1,
                    EquipmentCode = "EQ001",
                    EquipmentName = "Máy hàn tự động 1",
                    IsActive = true,
                    StageId = 1
                },
                new Equipment
                {
                    EquipmentId = 2,
                    EquipmentCode = "EQ002",
                    EquipmentName = "Robot cánh tay 2",
                    IsActive = true,
                    StageId = 2
                },
                new Equipment
                {
                    EquipmentId = 3,
                    EquipmentCode = "EQ003",
                    EquipmentName = "Máy kiểm tra chất lượng",
                    IsActive = false, // Inactive equipment for testing
                    StageId = 3
                },
                new Equipment
                {
                    EquipmentId = 999,
                    EquipmentCode = "EQ999",
                    EquipmentName = "Non-existent Equipment",
                    IsActive = true
                }
            };
        }

        public static List<Line> GetTestLines()
        {
            return new List<Line>
            {
                new Line
                {
                    LineId = 1,
                    LineName = "Dây chuyền lắp ráp 1",
                    LineCode = "LINE001",
                    IsActive = true,
                    DepartmentId = 1
                },
                new Line
                {
                    LineId = 2,
                    LineName = "Dây chuyền sơn 2",
                    LineCode = "LINE002",
                    IsActive = true,
                    DepartmentId = 1
                },
                new Line
                {
                    LineId = 3,
                    LineName = "Dây chuyền đóng gói",
                    LineCode = "LINE003",
                    IsActive = false, // Inactive line for testing
                    DepartmentId = 2
                }
            };
        }

        public static List<User> GetTestUsers()
        {
            return new List<User>
            {
                new User
                {
                    Id = "USER001",
                    UserName = "operator1",
                    Email = "operator1@test.com",
                    FullName = "Nguyễn Văn A",
                    EmployeeCode = "OP001",
                    IsActive = true,
                    DepartmentId = 1
                },
                new User
                {
                    Id = "TECH001",
                    UserName = "technician1",
                    Email = "tech1@test.com",
                    FullName = "Trần Văn B",
                    EmployeeCode = "TECH001",
                    IsActive = true,
                    DepartmentId = 1
                },
                new User
                {
                    Id = "TECH002",
                    UserName = "technician2",
                    Email = "tech2@test.com",
                    FullName = "Lê Văn C",
                    EmployeeCode = "TECH002",
                    IsActive = true,
                    DepartmentId = 1
                },
                new User
                {
                    Id = "ADMIN001",
                    UserName = "admin1",
                    Email = "admin@test.com",
                    FullName = "Phạm Văn Admin",
                    EmployeeCode = "ADM001",
                    IsActive = true,
                    DepartmentId = 1
                },
                new User
                {
                    Id = "ADMIN002",
                    UserName = "admin2",
                    Email = "admin2@test.com",
                    FullName = "Hoàng Văn Admin 2",
                    EmployeeCode = "ADM002",
                    IsActive = true,
                    DepartmentId = 1
                },
                new User
                {
                    Id = "WAREHOUSE001",
                    UserName = "warehouse1",
                    Email = "warehouse@test.com",
                    FullName = "Nguyễn Kho",
                    EmployeeCode = "WH001",
                    IsActive = true,
                    DepartmentId = 1
                }
            };
        }

        public static List<StopType> GetTestStopTypes()
        {
            return new List<StopType>
            {
                new StopType { TypeId = 1, TypeName = "Dừng ngắn"},
                new StopType { TypeId = 2, TypeName = "Dừng dài" },
                new StopType { TypeId = 3, TypeName = "Vệ sinh"},
                new StopType { TypeId = 4, TypeName = "Đổi mã"},
                new StopType { TypeId = 5, TypeName = "Phế phẩm"}
            };
        }

        public static List<Shift> GetTestShifts()
        {
            return new List<Shift>
            {
                new Shift 
                { 
                    ShiftId = 1, 
                    ShiftName = "Ca sáng", 
                    StartTime = new TimeOnly(6, 0),
                    EndTime = new TimeOnly(14, 0)
                },
                new Shift 
                { 
                    ShiftId = 2, 
                    ShiftName = "Ca chiều", 
                    StartTime = new TimeOnly(14, 0),
                    EndTime = new TimeOnly(22, 0)
                },
                new Shift 
                { 
                    ShiftId = 3, 
                    ShiftName = "Ca đêm", 
                    StartTime = new TimeOnly(22, 0),
                    EndTime = new TimeOnly(6, 0)
                }
            };
        }

        public static List<IncidentHistory> GetTestIncidents()
        {
            return new List<IncidentHistory>
            {
                new IncidentHistory
                {
                    IncidentId = 1,
                    EquipmentId = 1,
                    LineId = 1,
                    StartTime = DateTime.Now.AddHours(-3),
                    EndTime = DateTime.Now.AddHours(-2),
                    Duration = 60,
                    TypeId = 2,
                    Issue = "Máy hàn bị kẹt",
                    Status = "Hoàn thành",
                    ReportedByUserId = "USER001",
                    AssignedTo = "TECH001",
                    IsTechSupport = false,
                    CreatedDate = DateTime.Now.AddHours(-3)
                },
                new IncidentHistory
                {
                    IncidentId = 2,
                    EquipmentId = 2,
                    LineId = 1,
                    StartTime = DateTime.Now.AddHours(-1),
                    EndTime = null,
                    Duration = null,
                    TypeId = 2,
                    Issue = "Robot không hoạt động",
                    Status = "Đang xử lý",
                    ReportedByUserId = "USER001",
                    AssignedTo = "TECH002",
                    IsTechSupport = true,
                    CreatedDate = DateTime.Now.AddHours(-1)
                },
                new IncidentHistory
                {
                    IncidentId = 3,
                    EquipmentId = 1,
                    LineId = 1,
                    StartTime = DateTime.Now.AddMinutes(-30),
                    EndTime = null,
                    Duration = null,
                    TypeId = 1,
                    Issue = "Dừng ngắn để kiểm tra",
                    Status = "Chờ xử lý",
                    ReportedByUserId = "USER001",
                    AssignedTo = null,
                    IsTechSupport = false,
                    CreatedDate = DateTime.Now.AddMinutes(-30)
                }
            };
        }

        public static CreateIncidentRequest GetValidCreateRequest()
        {
            return new CreateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Test issue - Machine overheating",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-1),
                EndTime = null,
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static CreateIncidentRequest GetValidCreateRequestWithEndTime()
        {
            return new CreateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Test completed incident",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-2),
                EndTime = DateTime.Now.AddHours(-1),
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static CreateIncidentRequest GetInvalidCreateRequest_EquipmentNotFound()
        {
            return new CreateIncidentRequest
            {
                EquipmentId = 9999, // Non-existent
                LineId = 1,
                Issue = "Test issue",
                TypeId = 2,
                StartTime = DateTime.Now,
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static CreateIncidentRequest GetInvalidCreateRequest_EquipmentInactive()
        {
            return new CreateIncidentRequest
            {
                EquipmentId = 3, // Inactive
                LineId = 1,
                Issue = "Test issue",
                TypeId = 2,
                StartTime = DateTime.Now,
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static CreateIncidentRequest GetInvalidCreateRequest_LineInactive()
        {
            return new CreateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 3, // Inactive
                Issue = "Test issue",
                TypeId = 2,
                StartTime = DateTime.Now,
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static CreateIncidentRequest GetInvalidCreateRequest_EndTimeBeforeStart()
        {
            return new CreateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Test issue",
                TypeId = 2,
                StartTime = DateTime.Now,
                EndTime = DateTime.Now.AddHours(-1), // Before start time
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static CreateIncidentRequest GetInvalidCreateRequest_EndTimeInFuture()
        {
            return new CreateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Test issue",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-1),
                EndTime = DateTime.Now.AddHours(1), // In future
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static CreateIncidentRequest GetInvalidCreateRequest_LineNotFound()
        {
            return new CreateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 9999, // Non-existent
                Issue = "Test issue",
                TypeId = 2,
                StartTime = DateTime.Now,
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static CreateIncidentRequest GetValidCreateRequest_WithTechSupport()
        {
            return new CreateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Critical issue needs tech support",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-1),
                EndTime = null,
                ReportedByUserId = "USER001",
                IsTechSupport = true // Tech support request
            };
        }

        public static CreateIncidentRequest GetValidCreateRequest_WithMultipleImages()
        {
            return new CreateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Test issue with multiple images",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-1),
                ReportedByUserId = "USER001",
                IsTechSupport = false,
                ImageUrls = new List<string> 
                { 
                    "image1.jpg", 
                    "image2.jpg", 
                    "image3.jpg", 
                    "image4.jpg", 
                    "image5.jpg" 
                }
            };
        }

        public static CreateIncidentRequest GetValidCreateRequest_WithReasonAndSolution()
        {
            return new CreateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Test completed incident",
                Reason = "Equipment malfunction",
                Solution = "Replaced component",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-2),
                EndTime = DateTime.Now.AddHours(-1),
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static CreateIncidentRequest GetValidCreateRequest_WithoutEquipmentId()
        {
            return new CreateIncidentRequest
            {
                EquipmentId = null, // No equipment specified
                LineId = 1,
                Issue = "Line-level issue without specific equipment",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-1),
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static CreateIncidentRequest GetValidCreateRequest_WithoutLineId()
        {
            return new CreateIncidentRequest
            {
                EquipmentId = 1,
                LineId = null, // No line specified
                Issue = "Equipment issue without line",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-1),
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static UpdateIncidentRequest GetValidUpdateRequest()
        {
            return new UpdateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Updated issue description",
                Status = "Đang xử lý",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-2),
                EndTime = null,
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static UpdateIncidentRequest GetValidUpdateRequest_ToCompleted()
        {
            return new UpdateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Issue resolved",
                Status = "Hoàn thành",
                Solution = "Thay thế linh kiện",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-3),
                EndTime = DateTime.Now.AddHours(-2),
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static UpdateIncidentRequest GetInvalidUpdateRequest_EquipmentNotFound()
        {
            return new UpdateIncidentRequest
            {
                EquipmentId = 9999, // Non-existent
                LineId = 1,
                Issue = "Updated issue",
                Status = "Đang xử lý",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-1),
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static UpdateIncidentRequest GetInvalidUpdateRequest_EquipmentInactive()
        {
            return new UpdateIncidentRequest
            {
                EquipmentId = 3, // Inactive equipment
                LineId = 1,
                Issue = "Updated issue",
                Status = "Đang xử lý",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-1),
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static UpdateIncidentRequest GetInvalidUpdateRequest_LineNotFound()
        {
            return new UpdateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 9999, // Non-existent
                Issue = "Updated issue",
                Status = "Đang xử lý",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-1),
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static UpdateIncidentRequest GetInvalidUpdateRequest_LineInactive()
        {
            return new UpdateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 3, // Inactive line
                Issue = "Updated issue",
                Status = "Đang xử lý",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-1),
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static UpdateIncidentRequest GetInvalidUpdateRequest_EndTimeBeforeStartTime()
        {
            return new UpdateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Updated issue",
                Status = "Đang xử lý",
                TypeId = 2,
                StartTime = DateTime.Now,
                EndTime = DateTime.Now.AddHours(-1), // Before start time
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static UpdateIncidentRequest GetInvalidUpdateRequest_EndTimeInFuture()
        {
            return new UpdateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Updated issue",
                Status = "Đang xử lý",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-1),
                EndTime = DateTime.Now.AddHours(1), // In future
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static UpdateIncidentRequest GetInvalidUpdateRequest_StartTimeInFuture()
        {
            return new UpdateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Updated issue",
                Status = "Đang xử lý",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(1), // In future
                ReportedByUserId = "USER001",
                IsTechSupport = false
            };
        }

        public static UpdateIncidentRequest GetValidUpdateRequest_ChangeToTechSupport()
        {
            return new UpdateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Critical issue needs tech support",
                Status = "Chờ xử lý",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-2),
                ReportedByUserId = "USER001",
                IsTechSupport = true // Change to tech support
            };
        }

        public static UpdateIncidentRequest GetValidUpdateRequest_WithImageUrls()
        {
            return new UpdateIncidentRequest
            {
                EquipmentId = 1,
                LineId = 1,
                Issue = "Updated issue with images",
                Status = "Đang xử lý",
                TypeId = 2,
                StartTime = DateTime.Now.AddHours(-1),
                ReportedByUserId = "USER001",
                IsTechSupport = false,
                ImageUrls = new List<string> { "image1.jpg", "image2.jpg", "image3.jpg" }
            };
        }
    }
}
