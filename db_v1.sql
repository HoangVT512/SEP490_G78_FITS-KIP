CREATE DATABASE SEP490_G78_FITSKIP;

use SEP490_G78_FITSKIP

-- ===========================
-- 1. ASP.NET Identity tables (Simplified)
-- ===========================

CREATE TABLE [dbo].[AspNetRoles](
    [Id] NVARCHAR(450) PRIMARY KEY,
    [Name] NVARCHAR(256) NULL,
    [NormalizedName] NVARCHAR(256) NULL,
    [ConcurrencyStamp] NVARCHAR(MAX) NULL
);

CREATE TABLE [dbo].[AspNetUsers](
    [Id] NVARCHAR(450) PRIMARY KEY,
    [UserName] NVARCHAR(256) NULL,
    [NormalizedUserName] NVARCHAR(256) NULL,
    [Email] NVARCHAR(256) NULL,
    [NormalizedEmail] NVARCHAR(256) NULL,
    [EmailConfirmed] BIT NOT NULL DEFAULT 0,
    [PasswordHash] NVARCHAR(MAX) NULL,
    [SecurityStamp] NVARCHAR(MAX) NULL,
    [ConcurrencyStamp] NVARCHAR(MAX) NULL,
    [PhoneNumber] NVARCHAR(20) NULL,
    [PhoneNumberConfirmed] BIT NOT NULL DEFAULT 0,
    [TwoFactorEnabled] BIT NOT NULL DEFAULT 0,
    [LockoutEnd] DATETIMEOFFSET NULL,
    [LockoutEnabled] BIT NOT NULL DEFAULT 1,
    [AccessFailedCount] INT NOT NULL DEFAULT 0,
    [FullName] NVARCHAR(100) NULL,
    [Gender] NVARCHAR(10) NULL,
    [EmployeeCode] NVARCHAR(50) NULL,
    [Position] NVARCHAR(100) NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [RoleId] NVARCHAR(450) NULL,
    FOREIGN KEY(RoleId) REFERENCES AspNetRoles(Id) ON DELETE SET NULL
);

CREATE TABLE [dbo].[AspNetRoleClaims](
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [RoleId] NVARCHAR(450) NOT NULL,
    [ClaimType] NVARCHAR(MAX) NULL,
    [ClaimValue] NVARCHAR(MAX) NULL,
    FOREIGN KEY(RoleId) REFERENCES AspNetRoles(Id)
);

-- ===========================
-- 2. Factory Structure (giữ nguyên)
-- ===========================
CREATE TABLE [dbo].[Departments](
    [DepartmentID] INT IDENTITY(1,1) PRIMARY KEY,
    [DepartmentName] NVARCHAR(100) NOT NULL,
    [ManagerId] NVARCHAR(450) NULL,  -- liên kết AspNetUsers
    [Description] NVARCHAR(500) NULL,
    FOREIGN KEY(ManagerId) REFERENCES AspNetUsers(Id)
);

CREATE TABLE [dbo].[Rooms](
    [RoomID] INT IDENTITY(1,1) PRIMARY KEY,
    [RoomName] NVARCHAR(100) NOT NULL,
    [DepartmentID] INT NULL,
    FOREIGN KEY(DepartmentID) REFERENCES Departments(DepartmentID)
);

CREATE TABLE [dbo].[GroupLines](
    [GroupLineID] INT IDENTITY(1,1) PRIMARY KEY,
    [GroupLineName] NVARCHAR(250) NOT NULL,
    [RoomID] INT NULL,
    FOREIGN KEY(RoomID) REFERENCES Rooms(RoomID)
);

CREATE TABLE [dbo].[Lines](
    [LineID] INT IDENTITY(1,1) PRIMARY KEY,
    [LineName] NVARCHAR(250) NOT NULL,
    [GroupLineID] INT NULL,
    FOREIGN KEY(GroupLineID) REFERENCES GroupLines(GroupLineID)
);

CREATE TABLE [dbo].[Stages](
    [StageID] INT IDENTITY(1,1) PRIMARY KEY,
    [StageName] NVARCHAR(100) NOT NULL,
    [LineID] INT NULL,
    FOREIGN KEY(LineID) REFERENCES Lines(LineID)
);

CREATE TABLE [dbo].[Equipment](
    [EquipmentID] INT IDENTITY(1,1) PRIMARY KEY,
    [EquipmentCode] NVARCHAR(50) NULL,
    [EquipmentName] NVARCHAR(255) NULL,
    [DateUse] DATE NULL,
    [Origin] NVARCHAR(150) NULL,
    [YOM] INT NULL,
    [QRCode] NVARCHAR(MAX) NULL,
    [StageID] INT NULL,
    [Issue] NVARCHAR(MAX) NULL,
    [IdCode] NVARCHAR(250) NULL,
    [LineID] INT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    FOREIGN KEY(StageID) REFERENCES Stages(StageID),
    FOREIGN KEY(LineID) REFERENCES Lines(LineID)
);

-- ===========================
-- 3. Shifts & Slots
-- ===========================
CREATE TABLE [dbo].[Shifts](
    [ShiftID] INT IDENTITY(1,1) PRIMARY KEY,
    [ShiftName] NVARCHAR(50) NOT NULL,
    [StartTime] TIME NOT NULL,
    [EndTime] TIME NOT NULL
);

CREATE TABLE [dbo].[ShiftSlots](
    [SlotID] INT IDENTITY(1,1) PRIMARY KEY,
    [ShiftID] INT NOT NULL,
    [SlotStartTime] TIME NOT NULL,
    [SlotEndTime] TIME NOT NULL,
    [Duration] INT NOT NULL,
    FOREIGN KEY(ShiftID) REFERENCES Shifts(ShiftID)
);

-- ===========================
-- 4. Error / StopType
-- ===========================
CREATE TABLE [dbo].[StopType](
    [TypeID] INT IDENTITY(1,1) PRIMARY KEY,
    [TypeName] NVARCHAR(250) NULL
);

CREATE TABLE [dbo].[ErrorHistory](
    [ErrorID] INT IDENTITY(1,1) PRIMARY KEY,
    [EquipmentID] INT NULL,
    [ErrorDescription] NVARCHAR(255) NULL,
    [StartTime] DATETIME NULL,
    [EndTime] DATETIME NULL,
    [StageID] INT NULL,
    [LineID] INT NULL,
    [SlotID] INT NULL,
    [TypeID] INT NULL,
    [Reason] NVARCHAR(MAX) NULL,
    [Solution] NVARCHAR(MAX) NULL,
    [Duration] DECIMAL(10,2) NULL,
    FOREIGN KEY(EquipmentID) REFERENCES Equipment(EquipmentID),
    FOREIGN KEY(StageID) REFERENCES Stages(StageID),
    FOREIGN KEY(LineID) REFERENCES Lines(LineID),
    FOREIGN KEY(SlotID) REFERENCES ShiftSlots(SlotID),
    FOREIGN KEY(TypeID) REFERENCES StopType(TypeID)
);

-- ===========================
-- 5. User ↔ Line assignment
-- ===========================
CREATE TABLE [dbo].[UserLines](
    [UserLineID] INT IDENTITY(1,1) PRIMARY KEY,
    [UserId] NVARCHAR(450) NOT NULL,       -- liên kết AspNetUsers
    [LineID] INT NOT NULL,
    [CreateDate] DATETIME NULL DEFAULT GETDATE(),
    FOREIGN KEY(UserId) REFERENCES AspNetUsers(Id),
    FOREIGN KEY(LineID) REFERENCES Lines(LineID)
);

-- ===========================
-- 6. Production Outputs
-- ===========================
CREATE TABLE [dbo].[ProductionOutputs](
    [OutputID] INT IDENTITY(1,1) PRIMARY KEY,
    [LineID] INT NOT NULL,
    [StageID] INT NOT NULL,
    [ShiftID] INT NOT NULL,
    [Date] DATE NOT NULL,
    [ActualQuantity] DECIMAL(10,2) NOT NULL DEFAULT 0,
    [DowntimeMinutes] INT NOT NULL DEFAULT 0,
    FOREIGN KEY(LineID) REFERENCES Lines(LineID),
    FOREIGN KEY(StageID) REFERENCES Stages(StageID),
    FOREIGN KEY(ShiftID) REFERENCES Shifts(ShiftID)
);

-- ===========================
-- 7. Spare Parts & Maintenance
-- ===========================
CREATE TABLE [dbo].[SpareParts](
    [PartID] INT IDENTITY(1,1) PRIMARY KEY,
    [PartNumber] NVARCHAR(50) NOT NULL,
    [PartName] NVARCHAR(100) NOT NULL,
    [Quantity] INT NOT NULL DEFAULT 0,
    [Location] NVARCHAR(100) NULL,
    [Status] NVARCHAR(50) DEFAULT 'Available'
);

CREATE TABLE [dbo].[PurchaseRequests](
    [RequestID] INT IDENTITY(1,1) PRIMARY KEY,
    [PartID] INT NOT NULL,
    [RequestedBy] NVARCHAR(450) NOT NULL,
    [Quantity] INT NOT NULL,
    [Urgency] NVARCHAR(50) DEFAULT 'Normal',
    [Reason] NVARCHAR(500) NULL,
    [Status] NVARCHAR(50) DEFAULT 'Pending',
    [ApprovedBy] NVARCHAR(450) NULL,
    [ApprovedAt] DATETIME NULL,
    FOREIGN KEY(PartID) REFERENCES SpareParts(PartID),
    FOREIGN KEY(RequestedBy) REFERENCES AspNetUsers(Id),
    FOREIGN KEY(ApprovedBy) REFERENCES AspNetUsers(Id)
);

CREATE TABLE [dbo].[MaintenanceAssignments](
    [AssignmentID] INT IDENTITY(1,1) PRIMARY KEY,
    [ErrorID] INT NOT NULL,
    [TechnicianID] NVARCHAR(450) NOT NULL,
    [AssignedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [CompletedAt] DATETIME NULL,
    [ResolutionDetail] NVARCHAR(MAX) NULL,
    FOREIGN KEY(ErrorID) REFERENCES ErrorHistory(ErrorID),
    FOREIGN KEY(TechnicianID) REFERENCES AspNetUsers(Id)
);



