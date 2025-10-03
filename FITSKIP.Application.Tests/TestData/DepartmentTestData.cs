using FITSKIP.Domain.DTO;
using FITSKIP.Domain.Entities;

namespace FITSKIP.Application.Tests.TestData;

public static class DepartmentTestData
{
    public static class Requests
    {
        public static CreateDepartmentRequest ValidCreateRequest => new()
        {
            DepartmentName = "Production Department",
            ManagerId = "MGR001",
            Description = "Handles all production activities"
        };

        public static CreateDepartmentRequest CreateRequestWithoutManager => new()
        {
            DepartmentName = "Production Department",
            ManagerId = null,
            Description = "Department without manager"
        };

        public static CreateDepartmentRequest CreateRequestWithoutDescription => new()
        {
            DepartmentName = "Quality Assurance",
            ManagerId = "MGR002",
            Description = null
        };

        public static CreateDepartmentRequest WarehouseCreateRequest => new()
        {
            DepartmentName = "Warehouse",
            ManagerId = "MGR003",
            Description = "Storage and logistics"
        };

        public static CreateDepartmentRequest MaintenanceCreateRequest => new()
        {
            DepartmentName = "Maintenance",
            ManagerId = "MGR004",
            Description = "Equipment maintenance"
        };
    }

    public static class Entities
    {
        public static Department ProductionDepartment => new()
        {
            DepartmentId = 1,
            DepartmentName = "Production Department",
            ManagerId = "MGR001",
            Description = "Handles all production activities",
            IsActive = true,
            Manager = Users.Manager001
        };

        public static Department DepartmentWithoutManager => new()
        {
            DepartmentId = 2,
            DepartmentName = "Production Department",
            ManagerId = null,
            Description = "Department without manager",
            IsActive = true,
            Manager = null
        };

        public static Department QualityAssuranceDepartment => new()
        {
            DepartmentId = 3,
            DepartmentName = "Quality Assurance",
            ManagerId = "MGR002",
            Description = null,
            IsActive = true,
            Manager = Users.Manager002
        };

        public static Department WarehouseDepartment => new()
        {
            DepartmentId = 4,
            DepartmentName = "Warehouse",
            ManagerId = "MGR003",
            Description = "Storage and logistics",
            IsActive = true
        };

        public static Department MaintenanceDepartment => new()
        {
            DepartmentId = 5,
            DepartmentName = "Maintenance",
            ManagerId = "MGR004",
            Description = "Equipment maintenance",
            IsActive = true
        };
    }

    public static class Users
    {
        public static User Manager001 => new()
        {
            Id = "MGR001",
            FullName = "John Doe"
        };

        public static User Manager002 => new()
        {
            Id = "MGR002",
            FullName = "Jane Smith"
        };
    }
}

