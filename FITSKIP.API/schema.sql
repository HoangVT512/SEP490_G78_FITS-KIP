CREATE TABLE [AspNetRoles] (
    [Id] nvarchar(450) NOT NULL,
    [Name] nvarchar(256) NULL,
    [NormalizedName] nvarchar(256) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Shifts] (
    [ShiftID] int NOT NULL IDENTITY,
    [ShiftName] nvarchar(50) NOT NULL,
    [StartTime] time NOT NULL,
    [EndTime] time NOT NULL,
    CONSTRAINT [PK__Shifts__C0A838E1E127179C] PRIMARY KEY ([ShiftID])
);
GO


CREATE TABLE [SpareParts] (
    [PartID] int NOT NULL IDENTITY,
    [PartNumber] nvarchar(50) NOT NULL,
    [PartName] nvarchar(100) NOT NULL,
    [PartType] nvarchar(100) NULL,
    [Material] nvarchar(100) NULL,
    [Specifications] nvarchar(255) NULL,
    [Supplier] nvarchar(150) NULL,
    [PurchasePrice] decimal(12,2) NULL,
    [Quantity] int NOT NULL,
    [MinQuantity] int NOT NULL,
    [Location] nvarchar(100) NULL,
    [Warehouse] nvarchar(100) NULL,
    [UoM] nvarchar(20) NULL,
    [ReplacementCycle] nvarchar(50) NULL,
    [DateAdded] datetime NULL DEFAULT (GETDATE()),
    [Status] nvarchar(50) NULL DEFAULT N'Available',
    [DocumentUrl] nvarchar(max) NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK__SparePar__7C3F0D30890EDD23] PRIMARY KEY ([PartID])
);
GO


CREATE TABLE [StopType] (
    [TypeID] int NOT NULL IDENTITY,
    [TypeName] nvarchar(250) NULL,
    CONSTRAINT [PK__StopType__516F0395AE2FC0CE] PRIMARY KEY ([TypeID])
);
GO


CREATE TABLE [AspNetRoleClaims] (
    [Id] int NOT NULL IDENTITY,
    [RoleId] nvarchar(450) NOT NULL,
    [ClaimType] nvarchar(max) NULL,
    [ClaimValue] nvarchar(max) NULL,
    CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [AspNetUsers] (
    [Id] nvarchar(450) NOT NULL,
    [FullName] nvarchar(250) NULL,
    [EmployeeCode] nvarchar(50) NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    [RoleId] nvarchar(450) NULL,
    [DepartmentId] int NULL,
    [UserName] nvarchar(256) NULL,
    [NormalizedUserName] nvarchar(256) NULL,
    [Email] nvarchar(256) NULL,
    [NormalizedEmail] nvarchar(256) NULL,
    [EmailConfirmed] bit NOT NULL,
    [PasswordHash] nvarchar(max) NULL,
    [SecurityStamp] nvarchar(max) NULL,
    [ConcurrencyStamp] nvarchar(max) NULL,
    [PhoneNumber] nvarchar(max) NULL,
    [PhoneNumberConfirmed] bit NOT NULL,
    [TwoFactorEnabled] bit NOT NULL,
    [LockoutEnd] datetimeoffset NULL,
    [LockoutEnabled] bit NOT NULL,
    [AccessFailedCount] int NOT NULL,
    CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_AspNetUsers_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE SET NULL
);
GO


CREATE TABLE [Departments] (
    [DepartmentID] int NOT NULL IDENTITY,
    [DepartmentName] nvarchar(100) NOT NULL,
    [ManagerId] nvarchar(450) NULL,
    [Description] nvarchar(500) NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    CONSTRAINT [PK__Departme__B2079BCDAEAF02C2] PRIMARY KEY ([DepartmentID]),
    CONSTRAINT [FK__Departmen__Manag__619B8048] FOREIGN KEY ([ManagerId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE SET NULL
);
GO


CREATE TABLE [Notifications] (
    [NotificationID] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NULL,
    [Message] nvarchar(1000) NOT NULL,
    [Title] nvarchar(200) NULL,
    [IsRead] bit NOT NULL DEFAULT CAST(0 AS bit),
    [CreatedDate] datetime NOT NULL DEFAULT (GETDATE()),
    CONSTRAINT [PK__Notification__NotificationID] PRIMARY KEY ([NotificationID]),
    CONSTRAINT [FK_Notifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
);
GO


CREATE TABLE [PurchaseRequests] (
    [RequestID] int NOT NULL IDENTITY,
    [PartID] int NOT NULL,
    [RequestedBy] nvarchar(450) NOT NULL,
    [Quantity] int NOT NULL,
    [Reason] nvarchar(500) NULL,
    [Status] nvarchar(50) NULL DEFAULT N'Pending',
    [ApprovedBy] nvarchar(450) NULL,
    [RejectedBy] nvarchar(450) NULL,
    [ApprovedAt] datetime NULL,
    [RejectedAt] datetime NULL,
    CONSTRAINT [PK__Purchase__33A8519A9AC26C34] PRIMARY KEY ([RequestID]),
    CONSTRAINT [FK__PurchaseR__Appro__151B244E] FOREIGN KEY ([ApprovedBy]) REFERENCES [AspNetUsers] ([Id]),
    CONSTRAINT [FK__PurchaseR__PartI__1332DBDC] FOREIGN KEY ([PartID]) REFERENCES [SpareParts] ([PartID]),
    CONSTRAINT [FK__PurchaseR__Rejec__151B245F] FOREIGN KEY ([RejectedBy]) REFERENCES [AspNetUsers] ([Id]),
    CONSTRAINT [FK__PurchaseR__Reque__14270015] FOREIGN KEY ([RequestedBy]) REFERENCES [AspNetUsers] ([Id])
);
GO


CREATE TABLE [Lines] (
    [LineID] int NOT NULL IDENTITY,
    [LineName] nvarchar(250) NOT NULL,
    [DepartmentID] int NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    CONSTRAINT [PK__Lines__2EAE64C9765DBF83] PRIMARY KEY ([LineID]),
    CONSTRAINT [FK__Lines__Departmen__6A30C650] FOREIGN KEY ([DepartmentID]) REFERENCES [Departments] ([DepartmentID])
);
GO


CREATE TABLE [ProductionOutputs] (
    [OutputID] int NOT NULL IDENTITY,
    [LineID] int NOT NULL,
    [Date] datetime NOT NULL,
    [ShiftID] int NOT NULL,
    [SlotTime] nvarchar(50) NOT NULL,
    [LoadingTime] decimal(10,2) NULL,
    [TargetAmount] nvarchar(50) NULL,
    [ResultAmount] nvarchar(50) NULL,
    [OEE] decimal(5,2) NULL,
    [CreatedAt] datetime NOT NULL DEFAULT (GETDATE()),
    [UpdatedAt] datetime NULL,
    CONSTRAINT [PK__Producti__CE7609460B69FF1F] PRIMARY KEY ([OutputID]),
    CONSTRAINT [FK__Productio__LineI__08B54D69] FOREIGN KEY ([LineID]) REFERENCES [Lines] ([LineID]),
    CONSTRAINT [FK__Productio__ShiftID__0A9D95DB] FOREIGN KEY ([ShiftID]) REFERENCES [Shifts] ([ShiftID])
);
GO


CREATE TABLE [Stages] (
    [StageID] int NOT NULL IDENTITY,
    [StageName] nvarchar(100) NOT NULL,
    [LineID] int NULL,
    [IsActive] bit NOT NULL,
    CONSTRAINT [PK__Stages__03EB7AF84C50ECAB] PRIMARY KEY ([StageID]),
    CONSTRAINT [FK__Stages__LineID__6D0D32F4] FOREIGN KEY ([LineID]) REFERENCES [Lines] ([LineID])
);
GO


CREATE TABLE [UserLines] (
    [UserLineID] int NOT NULL IDENTITY,
    [UserId] nvarchar(450) NOT NULL,
    [LineID] int NOT NULL,
    [CreatedAt] datetime NOT NULL DEFAULT ((getdate())),
    CONSTRAINT [PK__UserLine__3B1F2081CE44FE03] PRIMARY KEY ([UserLineID]),
    CONSTRAINT [FK__UserLines__LineI__03F0984C] FOREIGN KEY ([LineID]) REFERENCES [Lines] ([LineID]),
    CONSTRAINT [FK__UserLines__UserI__02FC7413] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id])
);
GO


CREATE TABLE [Equipment] (
    [EquipmentID] int NOT NULL IDENTITY,
    [EquipmentCode] nvarchar(50) NULL,
    [EquipmentName] nvarchar(255) NULL,
    [DateUse] date NULL,
    [Origin] nvarchar(150) NULL,
    [YOM] int NULL,
    [QRCode] nvarchar(max) NULL,
    [Issue] nvarchar(max) NULL,
    [StageID] int NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    CONSTRAINT [PK__Equipmen__34474599BD4FBDFE] PRIMARY KEY ([EquipmentID]),
    CONSTRAINT [FK__Equipment__Stage__70DDC3D8] FOREIGN KEY ([StageID]) REFERENCES [Stages] ([StageID])
);
GO


CREATE TABLE [IncidentHistory] (
    [IncidentID] int NOT NULL IDENTITY,
    [EquipmentID] int NULL,
    [LineID] int NULL,
    [StartTime] datetime NULL,
    [EndTime] datetime NULL,
    [Duration] decimal(10,2) NULL,
    [TypeID] int NULL,
    [Reason] nvarchar(max) NULL,
    [Solution] nvarchar(max) NULL,
    [Issue] nvarchar(500) NULL,
    [Status] nvarchar(max) NULL,
    [CreatedDate] datetime NOT NULL DEFAULT (GETDATE()),
    [ReportedByUserId] nvarchar(450) NULL,
    [AssignedTo] nvarchar(max) NULL,
    [IsTechSupport] bit NOT NULL,
    CONSTRAINT [PK__Incident__5F46CAB00C9D9F0A] PRIMARY KEY ([IncidentID]),
    CONSTRAINT [FK_IncidentHistory_AspNetUsers_ReportedByUserId] FOREIGN KEY ([ReportedByUserId]) REFERENCES [AspNetUsers] ([Id]),
    CONSTRAINT [FK__IncidentH__Equip__7B5B524B] FOREIGN KEY ([EquipmentID]) REFERENCES [Equipment] ([EquipmentID]),
    CONSTRAINT [FK__IncidentH__LineI__8C5B6A4C] FOREIGN KEY ([LineID]) REFERENCES [Lines] ([LineID]),
    CONSTRAINT [FK__IncidentH__TypeI__7F2BE32F] FOREIGN KEY ([TypeID]) REFERENCES [StopType] ([TypeID])
);
GO


CREATE TABLE [MaintenancePlans] (
    [PlanID] int NOT NULL IDENTITY,
    [EquipmentID] int NULL,
    [IntervalType] nvarchar(20) NOT NULL,
    [IntervalValue] int NOT NULL,
    [StartDate] date NOT NULL,
    [NextDueDate] date NOT NULL,
    [AssignedTo] nvarchar(450) NULL,
    [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
    CONSTRAINT [PK__Maintena__755C22D75A5E8C31] PRIMARY KEY ([PlanID]),
    CONSTRAINT [FK__MaintenanPlan__Equip__1234567] FOREIGN KEY ([EquipmentID]) REFERENCES [Equipment] ([EquipmentID]),
    CONSTRAINT [FK__MaintenanPlan__User__2345678] FOREIGN KEY ([AssignedTo]) REFERENCES [AspNetUsers] ([Id])
);
GO


CREATE TABLE [ReplacementHistories] (
    [ReplacementID] int NOT NULL IDENTITY,
    [EquipmentID] int NULL,
    [PartID] int NOT NULL,
    [Quantity] int NOT NULL,
    [ReplacedDate] datetime NOT NULL,
    [ReplacedBy] nvarchar(450) NOT NULL,
    [Status] nvarchar(20) NOT NULL DEFAULT N'Pending',
    [Remarks] nvarchar(500) NULL,
    CONSTRAINT [PK__Replacem__55AB07E93456789A] PRIMARY KEY ([ReplacementID]),
    CONSTRAINT [FK__Replaceme__Equip__4567890A] FOREIGN KEY ([EquipmentID]) REFERENCES [Equipment] ([EquipmentID]),
    CONSTRAINT [FK__Replaceme__PartI__5678901B] FOREIGN KEY ([PartID]) REFERENCES [SpareParts] ([PartID]),
    CONSTRAINT [FK__Replaceme__Repla__6789012C] FOREIGN KEY ([ReplacedBy]) REFERENCES [AspNetUsers] ([Id])
);
GO


CREATE TABLE [IncidentShifts] (
    [IncidentShiftID] int NOT NULL IDENTITY,
    [IncidentID] int NOT NULL,
    [ShiftID] int NOT NULL,
    [StartTime] datetime NOT NULL,
    [EndTime] datetime NULL,
    CONSTRAINT [PK__IncidentShift__IncidentShiftID] PRIMARY KEY ([IncidentShiftID]),
    CONSTRAINT [FK_IncidentShift_IncidentHistory_IncidentID] FOREIGN KEY ([IncidentID]) REFERENCES [IncidentHistory] ([IncidentID]) ON DELETE CASCADE,
    CONSTRAINT [FK_IncidentShift_Shifts_ShiftID] FOREIGN KEY ([ShiftID]) REFERENCES [Shifts] ([ShiftID])
);
GO


CREATE TABLE [MaintenanceChecklistItems] (
    [ChecklistID] int NOT NULL IDENTITY,
    [PlanID] int NOT NULL,
    [StepName] nvarchar(200) NOT NULL,
    [IsChecked] bit NULL,
    [CompletedDate] datetime NULL,
    [Notes] nvarchar(500) NULL,
    CONSTRAINT [PK__Maintena__26C4E2F5A1234567] PRIMARY KEY ([ChecklistID]),
    CONSTRAINT [FK__Maintena__PlanID__3456789] FOREIGN KEY ([PlanID]) REFERENCES [MaintenancePlans] ([PlanID])
);
GO


CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
GO


CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL;
GO


CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
GO


CREATE INDEX [IX_AspNetUsers_DepartmentId] ON [AspNetUsers] ([DepartmentId]);
GO


CREATE INDEX [IX_AspNetUsers_RoleId] ON [AspNetUsers] ([RoleId]);
GO


CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL;
GO


CREATE INDEX [IX_Departments_ManagerId] ON [Departments] ([ManagerId]);
GO


CREATE INDEX [IX_Equipment_StageID] ON [Equipment] ([StageID]);
GO


CREATE INDEX [IX_IncidentHistory_EquipmentID] ON [IncidentHistory] ([EquipmentID]);
GO


CREATE INDEX [IX_IncidentHistory_LineID] ON [IncidentHistory] ([LineID]);
GO


CREATE INDEX [IX_IncidentHistory_ReportedByUserId] ON [IncidentHistory] ([ReportedByUserId]);
GO


CREATE INDEX [IX_IncidentHistory_TypeID] ON [IncidentHistory] ([TypeID]);
GO


CREATE INDEX [IX_IncidentShifts_IncidentID] ON [IncidentShifts] ([IncidentID]);
GO


CREATE INDEX [IX_IncidentShifts_ShiftID] ON [IncidentShifts] ([ShiftID]);
GO


CREATE INDEX [IX_Lines_DepartmentID] ON [Lines] ([DepartmentID]);
GO


CREATE INDEX [IX_MaintenanceChecklistItems_PlanID] ON [MaintenanceChecklistItems] ([PlanID]);
GO


CREATE INDEX [IX_MaintenancePlans_AssignedTo] ON [MaintenancePlans] ([AssignedTo]);
GO


CREATE INDEX [IX_MaintenancePlans_EquipmentID] ON [MaintenancePlans] ([EquipmentID]);
GO


CREATE INDEX [IX_Notifications_UserId] ON [Notifications] ([UserId]);
GO


CREATE INDEX [IX_ProductionOutputs_LineID] ON [ProductionOutputs] ([LineID]);
GO


CREATE INDEX [IX_ProductionOutputs_ShiftID] ON [ProductionOutputs] ([ShiftID]);
GO


CREATE INDEX [IX_PurchaseRequests_ApprovedBy] ON [PurchaseRequests] ([ApprovedBy]);
GO


CREATE INDEX [IX_PurchaseRequests_PartID] ON [PurchaseRequests] ([PartID]);
GO


CREATE INDEX [IX_PurchaseRequests_RejectedBy] ON [PurchaseRequests] ([RejectedBy]);
GO


CREATE INDEX [IX_PurchaseRequests_RequestedBy] ON [PurchaseRequests] ([RequestedBy]);
GO


CREATE INDEX [IX_ReplacementHistories_EquipmentID] ON [ReplacementHistories] ([EquipmentID]);
GO


CREATE INDEX [IX_ReplacementHistories_PartID] ON [ReplacementHistories] ([PartID]);
GO


CREATE INDEX [IX_ReplacementHistories_ReplacedBy] ON [ReplacementHistories] ([ReplacedBy]);
GO


CREATE INDEX [IX_Stages_LineID] ON [Stages] ([LineID]);
GO


CREATE INDEX [IX_UserLines_LineID] ON [UserLines] ([LineID]);
GO


CREATE INDEX [IX_UserLines_UserId] ON [UserLines] ([UserId]);
GO


ALTER TABLE [AspNetUsers] ADD CONSTRAINT [FK_AspNetUsers_Departments_DepartmentId] FOREIGN KEY ([DepartmentId]) REFERENCES [Departments] ([DepartmentID]) ON DELETE SET NULL;
GO


