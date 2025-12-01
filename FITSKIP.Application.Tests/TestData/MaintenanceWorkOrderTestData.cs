using FITSKIP.Domain.Entities;
using FITSKIP.Domain.DTO;
using System;
using System.Collections.Generic;

namespace FITSKIP.Application.Tests.TestData
{
    public static class MaintenanceWorkOrderTestData
    {
        public static List<MaintenanceWorkOrder> GetTestWorkOrders()
        {
            return new List<MaintenanceWorkOrder>
            {
                new MaintenanceWorkOrder
                {
                    WorkOrderId = 1,
                    PlanId = 1,
                    EquipmentId = 1,
                    WorkOrderCode = "WO001",
                    Status = "Chờ xử lý",
                    ScheduledDate = DateTime.Now.AddDays(5),
                    DueDate = DateTime.Now.AddDays(5),
                    AssignedToElectrical = "TECH001",
                    AssignedToMechanical = null,
                    CreatedDate = DateTime.Now.AddDays(-2)
                },
                new MaintenanceWorkOrder
                {
                    WorkOrderId = 2,
                    PlanId = 1,
                    EquipmentId = 1,
                    WorkOrderCode = "WO002",
                    Status = "Đang thực hiện",
                    ScheduledDate = DateTime.Now,
                    DueDate = DateTime.Now,
                    AssignedToElectrical = "TECH001",
                    AssignedToMechanical = "TECH002",
                    CreatedDate = DateTime.Now.AddDays(-1)
                },
                new MaintenanceWorkOrder
                {
                    WorkOrderId = 3,
                    PlanId = 2,
                    EquipmentId = 2,
                    WorkOrderCode = "WO003",
                    Status = "Quá hạn",
                    ScheduledDate = DateTime.Now.AddDays(-5),
                    DueDate = DateTime.Now.AddDays(-5),
                    AssignedToElectrical = null,
                    AssignedToMechanical = null,
                    CreatedDate = DateTime.Now.AddDays(-10)
                },
                new MaintenanceWorkOrder
                {
                    WorkOrderId = 4,
                    PlanId = 1,
                    EquipmentId = 1,
                    WorkOrderCode = "WO004",
                    Status = "Hoàn thành",
                    ScheduledDate = DateTime.Now.AddDays(-30),
                    DueDate = DateTime.Now.AddDays(-30),
                    CompletedDate = DateTime.Now.AddDays(-29),
                    AssignedToElectrical = "TECH002",
                    AssignedToMechanical = null,
                    CreatedDate = DateTime.Now.AddDays(-32)
                }
            };
        }

        public static CreateMaintenanceWorkOrderRequest GetValidCreateWorkOrderRequest()
        {
            return new CreateMaintenanceWorkOrderRequest
            {
                PlanId = 1,
                ScheduledDate = DateTime.Now.AddDays(5),
                AssignedToElectrical = "TECH001",
                AssignedToMechanical = null,
                Notes = "Scheduled maintenance"
            };
        }

        public static CreateMaintenanceWorkOrderRequest GetInvalidCreateWorkOrderRequest_PastDate()
        {
            return new CreateMaintenanceWorkOrderRequest
            {
                PlanId = 1,
                ScheduledDate = DateTime.Now.AddDays(-1), // Past date
                AssignedToElectrical = "TECH001",
                AssignedToMechanical = null,
                Notes = "Past date test"
            };
        }

        public static CreateMaintenanceWorkOrderRequest GetInvalidCreateWorkOrderRequest_NoTechnician()
        {
            return new CreateMaintenanceWorkOrderRequest
            {
                PlanId = 1,
                ScheduledDate = DateTime.Now.AddDays(5),
                AssignedToElectrical = null,
                AssignedToMechanical = null,
                Notes = "No technician assigned"
            };
        }

        public static CompleteWorkOrderRequest GetValidCompleteWorkOrderRequest()
        {
            return new CompleteWorkOrderRequest
            {
                OverallNotes = "Maintenance completed successfully",
                ChecklistItems = new List<CompleteChecklistItemRequest>
                {
                    new CompleteChecklistItemRequest
                    {
                        ChecklistId = 1,
                        IsChecked = true,
                        Notes = "Checked and verified"
                    }
                }
            };
        }

        public static PostponeWorkOrderRequest GetValidPostponeWorkOrderRequest()
        {
            return new PostponeWorkOrderRequest
            {
                NewScheduledDate = DateTime.Now.AddDays(10),
                Reason = "Equipment not available"
            };
        }

        public static PostponeWorkOrderRequest GetInvalidPostponeWorkOrderRequest_PastDate()
        {
            return new PostponeWorkOrderRequest
            {
                NewScheduledDate = DateTime.Now.AddDays(-1),
                Reason = "Past date test"
            };
        }

        public static PostponeWorkOrderRequest GetInvalidPostponeWorkOrderRequest_NoReason()
        {
            return new PostponeWorkOrderRequest
            {
                NewScheduledDate = DateTime.Now.AddDays(10),
                Reason = ""
            };
        }

        public static List<MaintenanceChecklistItem> GetTestChecklistItems()
        {
            return new List<MaintenanceChecklistItem>
            {
                new MaintenanceChecklistItem
                {
                    ChecklistId = 1,
                    WorkOrderId = 2,
                    Category = "Electrical",
                    StepName = "Check voltage",
                    IsChecked = false
                },
                new MaintenanceChecklistItem
                {
                    ChecklistId = 2,
                    WorkOrderId = 2,
                    Category = "Mechanical",
                    StepName = "Lubricate parts",
                    IsChecked = false
                }
            };
        }
    }
}
