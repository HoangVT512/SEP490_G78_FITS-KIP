USE [SEP490_G78_FITSKIP]
GO
/****** Object:  Table [dbo].[__EFMigrationsHistory]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[__EFMigrationsHistory](
	[MigrationId] [nvarchar](150) NOT NULL,
	[ProductVersion] [nvarchar](32) NOT NULL,
 CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY CLUSTERED 
(
	[MigrationId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetRoleClaims]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetRoleClaims](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[RoleId] [nvarchar](450) NOT NULL,
	[ClaimType] [nvarchar](max) NULL,
	[ClaimValue] [nvarchar](max) NULL,
 CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetRoles]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetRoles](
	[Id] [nvarchar](450) NOT NULL,
	[Name] [nvarchar](256) NULL,
	[NormalizedName] [nvarchar](256) NULL,
	[ConcurrencyStamp] [nvarchar](max) NULL,
 CONSTRAINT [PK_AspNetRoles] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[AspNetUsers]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[AspNetUsers](
	[Id] [nvarchar](450) NOT NULL,
	[FullName] [nvarchar](250) NULL,
	[EmployeeCode] [nvarchar](50) NULL,
	[IsActive] [bit] NOT NULL,
	[RoleId] [nvarchar](450) NULL,
	[UserName] [nvarchar](256) NULL,
	[NormalizedUserName] [nvarchar](256) NULL,
	[Email] [nvarchar](256) NULL,
	[NormalizedEmail] [nvarchar](256) NULL,
	[EmailConfirmed] [bit] NOT NULL,
	[PasswordHash] [nvarchar](max) NULL,
	[SecurityStamp] [nvarchar](max) NULL,
	[ConcurrencyStamp] [nvarchar](max) NULL,
	[PhoneNumber] [nvarchar](max) NULL,
	[PhoneNumberConfirmed] [bit] NOT NULL,
	[TwoFactorEnabled] [bit] NOT NULL,
	[LockoutEnd] [datetimeoffset](7) NULL,
	[LockoutEnabled] [bit] NOT NULL,
	[AccessFailedCount] [int] NOT NULL,
 CONSTRAINT [PK_AspNetUsers] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Departments]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Departments](
	[DepartmentID] [int] IDENTITY(1,1) NOT NULL,
	[DepartmentName] [nvarchar](100) NOT NULL,
	[ManagerId] [nvarchar](450) NULL,
	[Description] [nvarchar](500) NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK__Departme__B2079BCDAEAF02C2] PRIMARY KEY CLUSTERED 
(
	[DepartmentID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Equipment]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Equipment](
	[EquipmentID] [int] IDENTITY(1,1) NOT NULL,
	[EquipmentCode] [nvarchar](50) NULL,
	[EquipmentName] [nvarchar](255) NULL,
	[DateUse] [date] NULL,
	[Origin] [nvarchar](150) NULL,
	[YOM] [int] NULL,
	[QRCode] [nvarchar](max) NULL,
	[StageID] [int] NULL,
	[Issue] [nvarchar](max) NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK__Equipmen__34474599BD4FBDFE] PRIMARY KEY CLUSTERED 
(
	[EquipmentID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[IncidentHistory]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[IncidentHistory](
	[IncidentID] [int] IDENTITY(1,1) NOT NULL,
	[EquipmentID] [int] NULL,
	[StartTime] [datetime] NULL,
	[EndTime] [datetime] NULL,
	[Duration] [decimal](10, 2) NULL,
	[TypeID] [int] NULL,
	[Reason] [nvarchar](max) NULL,
	[Solution] [nvarchar](max) NULL,
 CONSTRAINT [PK__Incident__5F46CAB00C9D9F0A] PRIMARY KEY CLUSTERED 
(
	[IncidentID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Lines]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Lines](
	[LineID] [int] IDENTITY(1,1) NOT NULL,
	[LineName] [nvarchar](250) NOT NULL,
	[DepartmentID] [int] NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK__Lines__2EAE64C9765DBF83] PRIMARY KEY CLUSTERED 
(
	[LineID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MaintenanceChecklistItems]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MaintenanceChecklistItems](
	[ChecklistID] [int] IDENTITY(1,1) NOT NULL,
	[PlanID] [int] NOT NULL,
	[StepName] [nvarchar](200) NOT NULL,
	[IsChecked] [bit] NULL,
	[CompletedDate] [datetime] NULL,
	[Notes] [nvarchar](500) NULL,
 CONSTRAINT [PK__Maintena__26C4E2F5A1234567] PRIMARY KEY CLUSTERED 
(
	[ChecklistID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MaintenancePlans]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MaintenancePlans](
	[PlanID] [int] IDENTITY(1,1) NOT NULL,
	[EquipmentID] [int] NULL,
	[IntervalType] [nvarchar](20) NOT NULL,
	[IntervalValue] [int] NOT NULL,
	[StartDate] [date] NOT NULL,
	[NextDueDate] [date] NOT NULL,
	[AssignedTo] [nvarchar](450) NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK__Maintena__755C22D75A5E8C31] PRIMARY KEY CLUSTERED 
(
	[PlanID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ProductionOutputs]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ProductionOutputs](
	[OutputID] [int] IDENTITY(1,1) NOT NULL,
	[LineID] [int] NOT NULL,
	[ShiftSlotID] [int] NOT NULL,
	[Date] [date] NOT NULL,
	[TargetQuantity] [decimal](10, 2) NOT NULL,
	[PlannedProductionTime] [int] NOT NULL,
	[ActualQuantity] [int] NOT NULL,
	[GoodQuantity] [int] NOT NULL,
	[DowntimeMinutes] [int] NOT NULL,
	[IdealCycleTime] [decimal](10, 4) NOT NULL,
 CONSTRAINT [PK__Producti__CE7609460B69FF1F] PRIMARY KEY CLUSTERED 
(
	[OutputID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PurchaseRequests]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PurchaseRequests](
	[RequestID] [int] IDENTITY(1,1) NOT NULL,
	[PartID] [int] NOT NULL,
	[RequestedBy] [nvarchar](450) NOT NULL,
	[Quantity] [int] NOT NULL,
	[Reason] [nvarchar](500) NULL,
	[Status] [nvarchar](50) NULL,
	[ApprovedBy] [nvarchar](450) NULL,
	[RejectedBy] [nvarchar](450) NULL,
	[ApprovedAt] [datetime] NULL,
	[RejectedAt] [datetime] NULL,
 CONSTRAINT [PK__Purchase__33A8519A9AC26C34] PRIMARY KEY CLUSTERED 
(
	[RequestID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ReplacementHistories]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ReplacementHistories](
	[ReplacementID] [int] IDENTITY(1,1) NOT NULL,
	[EquipmentID] [int] NULL,
	[PartID] [int] NOT NULL,
	[Quantity] [int] NOT NULL,
	[ReplacedDate] [datetime] NOT NULL,
	[ReplacedBy] [nvarchar](450) NOT NULL,
	[Status] [nvarchar](20) NOT NULL,
	[Remarks] [nvarchar](500) NULL,
 CONSTRAINT [PK__Replacem__55AB07E93456789A] PRIMARY KEY CLUSTERED 
(
	[ReplacementID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Shifts]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Shifts](
	[ShiftID] [int] IDENTITY(1,1) NOT NULL,
	[ShiftName] [nvarchar](50) NOT NULL,
	[StartTime] [time](7) NOT NULL,
	[EndTime] [time](7) NOT NULL,
 CONSTRAINT [PK__Shifts__C0A838E1E127179C] PRIMARY KEY CLUSTERED 
(
	[ShiftID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ShiftSlots]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ShiftSlots](
	[SlotID] [int] IDENTITY(1,1) NOT NULL,
	[ShiftID] [int] NOT NULL,
	[SlotStartTime] [time](7) NOT NULL,
	[SlotEndTime] [time](7) NOT NULL,
	[Duration] [int] NOT NULL,
 CONSTRAINT [PK__ShiftSlo__0A124A4FF4CC8D65] PRIMARY KEY CLUSTERED 
(
	[SlotID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SpareParts]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SpareParts](
	[PartID] [int] IDENTITY(1,1) NOT NULL,
	[PartNumber] [nvarchar](50) NOT NULL,
	[PartName] [nvarchar](100) NOT NULL,
	[Quantity] [int] NOT NULL,
	[Location] [nvarchar](100) NULL,
	[Status] [nvarchar](50) NULL,
 CONSTRAINT [PK__SparePar__7C3F0D30890EDD23] PRIMARY KEY CLUSTERED 
(
	[PartID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Stages]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Stages](
	[StageID] [int] IDENTITY(1,1) NOT NULL,
	[StageName] [nvarchar](100) NOT NULL,
	[LineID] [int] NULL,
	[IsActive] [bit] NOT NULL,
 CONSTRAINT [PK__Stages__03EB7AF84C50ECAB] PRIMARY KEY CLUSTERED 
(
	[StageID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StopType]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StopType](
	[TypeID] [int] IDENTITY(1,1) NOT NULL,
	[TypeName] [nvarchar](250) NULL,
 CONSTRAINT [PK__StopType__516F0395AE2FC0CE] PRIMARY KEY CLUSTERED 
(
	[TypeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[UserLines]    Script Date: 10/10/2025 12:35:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserLines](
	[UserLineID] [int] IDENTITY(1,1) NOT NULL,
	[UserId] [nvarchar](450) NOT NULL,
	[LineID] [int] NOT NULL,
	[CreatedAt] [datetime] NOT NULL,
 CONSTRAINT [PK__UserLine__3B1F2081CE44FE03] PRIMARY KEY CLUSTERED 
(
	[UserLineID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[AspNetUsers] ADD  DEFAULT (CONVERT([bit],(1))) FOR [IsActive]
GO
ALTER TABLE [dbo].[Departments] ADD  DEFAULT (CONVERT([bit],(1))) FOR [IsActive]
GO
ALTER TABLE [dbo].[Equipment] ADD  DEFAULT (CONVERT([bit],(1))) FOR [IsActive]
GO
ALTER TABLE [dbo].[Lines] ADD  DEFAULT (CONVERT([bit],(1))) FOR [IsActive]
GO
ALTER TABLE [dbo].[MaintenancePlans] ADD  DEFAULT (CONVERT([bit],(1))) FOR [IsActive]
GO
ALTER TABLE [dbo].[PurchaseRequests] ADD  DEFAULT (N'Pending') FOR [Status]
GO
ALTER TABLE [dbo].[ReplacementHistories] ADD  DEFAULT (N'Pending') FOR [Status]
GO
ALTER TABLE [dbo].[SpareParts] ADD  DEFAULT (N'Available') FOR [Status]
GO
ALTER TABLE [dbo].[UserLines] ADD  DEFAULT (getdate()) FOR [CreatedAt]
GO
ALTER TABLE [dbo].[AspNetRoleClaims]  WITH CHECK ADD  CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY([RoleId])
REFERENCES [dbo].[AspNetRoles] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[AspNetRoleClaims] CHECK CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId]
GO
ALTER TABLE [dbo].[AspNetUsers]  WITH CHECK ADD  CONSTRAINT [FK_AspNetUsers_AspNetRoles_RoleId] FOREIGN KEY([RoleId])
REFERENCES [dbo].[AspNetRoles] ([Id])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[AspNetUsers] CHECK CONSTRAINT [FK_AspNetUsers_AspNetRoles_RoleId]
GO
ALTER TABLE [dbo].[Departments]  WITH CHECK ADD  CONSTRAINT [FK__Departmen__Manag__619B8048] FOREIGN KEY([ManagerId])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[Departments] CHECK CONSTRAINT [FK__Departmen__Manag__619B8048]
GO
ALTER TABLE [dbo].[Equipment]  WITH CHECK ADD  CONSTRAINT [FK__Equipment__Stage__70DDC3D8] FOREIGN KEY([StageID])
REFERENCES [dbo].[Stages] ([StageID])
GO
ALTER TABLE [dbo].[Equipment] CHECK CONSTRAINT [FK__Equipment__Stage__70DDC3D8]
GO
ALTER TABLE [dbo].[IncidentHistory]  WITH CHECK ADD  CONSTRAINT [FK__IncidentH__Equip__7B5B524B] FOREIGN KEY([EquipmentID])
REFERENCES [dbo].[Equipment] ([EquipmentID])
GO
ALTER TABLE [dbo].[IncidentHistory] CHECK CONSTRAINT [FK__IncidentH__Equip__7B5B524B]
GO
ALTER TABLE [dbo].[IncidentHistory]  WITH CHECK ADD  CONSTRAINT [FK__IncidentH__TypeI__7F2BE32F] FOREIGN KEY([TypeID])
REFERENCES [dbo].[StopType] ([TypeID])
GO
ALTER TABLE [dbo].[IncidentHistory] CHECK CONSTRAINT [FK__IncidentH__TypeI__7F2BE32F]
GO
ALTER TABLE [dbo].[Lines]  WITH CHECK ADD  CONSTRAINT [FK__Lines__Departmen__6A30C650] FOREIGN KEY([DepartmentID])
REFERENCES [dbo].[Departments] ([DepartmentID])
GO
ALTER TABLE [dbo].[Lines] CHECK CONSTRAINT [FK__Lines__Departmen__6A30C650]
GO
ALTER TABLE [dbo].[MaintenanceChecklistItems]  WITH CHECK ADD  CONSTRAINT [FK__Maintena__PlanID__3456789] FOREIGN KEY([PlanID])
REFERENCES [dbo].[MaintenancePlans] ([PlanID])
GO
ALTER TABLE [dbo].[MaintenanceChecklistItems] CHECK CONSTRAINT [FK__Maintena__PlanID__3456789]
GO
ALTER TABLE [dbo].[MaintenancePlans]  WITH CHECK ADD  CONSTRAINT [FK__MaintenanPlan__Equip__1234567] FOREIGN KEY([EquipmentID])
REFERENCES [dbo].[Equipment] ([EquipmentID])
GO
ALTER TABLE [dbo].[MaintenancePlans] CHECK CONSTRAINT [FK__MaintenanPlan__Equip__1234567]
GO
ALTER TABLE [dbo].[MaintenancePlans]  WITH CHECK ADD  CONSTRAINT [FK__MaintenanPlan__User__2345678] FOREIGN KEY([AssignedTo])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[MaintenancePlans] CHECK CONSTRAINT [FK__MaintenanPlan__User__2345678]
GO
ALTER TABLE [dbo].[ProductionOutputs]  WITH CHECK ADD  CONSTRAINT [FK__Productio__LineI__08B54D69] FOREIGN KEY([LineID])
REFERENCES [dbo].[Lines] ([LineID])
GO
ALTER TABLE [dbo].[ProductionOutputs] CHECK CONSTRAINT [FK__Productio__LineI__08B54D69]
GO
ALTER TABLE [dbo].[ProductionOutputs]  WITH CHECK ADD  CONSTRAINT [FK__Productio__ShiftSlot__0A9D95DB] FOREIGN KEY([ShiftSlotID])
REFERENCES [dbo].[ShiftSlots] ([SlotID])
GO
ALTER TABLE [dbo].[ProductionOutputs] CHECK CONSTRAINT [FK__Productio__ShiftSlot__0A9D95DB]
GO
ALTER TABLE [dbo].[PurchaseRequests]  WITH CHECK ADD  CONSTRAINT [FK__PurchaseR__Appro__151B244E] FOREIGN KEY([ApprovedBy])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[PurchaseRequests] CHECK CONSTRAINT [FK__PurchaseR__Appro__151B244E]
GO
ALTER TABLE [dbo].[PurchaseRequests]  WITH CHECK ADD  CONSTRAINT [FK__PurchaseR__PartI__1332DBDC] FOREIGN KEY([PartID])
REFERENCES [dbo].[SpareParts] ([PartID])
GO
ALTER TABLE [dbo].[PurchaseRequests] CHECK CONSTRAINT [FK__PurchaseR__PartI__1332DBDC]
GO
ALTER TABLE [dbo].[PurchaseRequests]  WITH CHECK ADD  CONSTRAINT [FK__PurchaseR__Rejec__151B245F] FOREIGN KEY([RejectedBy])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[PurchaseRequests] CHECK CONSTRAINT [FK__PurchaseR__Rejec__151B245F]
GO
ALTER TABLE [dbo].[PurchaseRequests]  WITH CHECK ADD  CONSTRAINT [FK__PurchaseR__Reque__14270015] FOREIGN KEY([RequestedBy])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[PurchaseRequests] CHECK CONSTRAINT [FK__PurchaseR__Reque__14270015]
GO
ALTER TABLE [dbo].[ReplacementHistories]  WITH CHECK ADD  CONSTRAINT [FK__Replaceme__Equip__4567890A] FOREIGN KEY([EquipmentID])
REFERENCES [dbo].[Equipment] ([EquipmentID])
GO
ALTER TABLE [dbo].[ReplacementHistories] CHECK CONSTRAINT [FK__Replaceme__Equip__4567890A]
GO
ALTER TABLE [dbo].[ReplacementHistories]  WITH CHECK ADD  CONSTRAINT [FK__Replaceme__PartI__5678901B] FOREIGN KEY([PartID])
REFERENCES [dbo].[SpareParts] ([PartID])
GO
ALTER TABLE [dbo].[ReplacementHistories] CHECK CONSTRAINT [FK__Replaceme__PartI__5678901B]
GO
ALTER TABLE [dbo].[ReplacementHistories]  WITH CHECK ADD  CONSTRAINT [FK__Replaceme__Repla__6789012C] FOREIGN KEY([ReplacedBy])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[ReplacementHistories] CHECK CONSTRAINT [FK__Replaceme__Repla__6789012C]
GO
ALTER TABLE [dbo].[ShiftSlots]  WITH CHECK ADD  CONSTRAINT [FK__ShiftSlot__Shift__76969D2E] FOREIGN KEY([ShiftID])
REFERENCES [dbo].[Shifts] ([ShiftID])
GO
ALTER TABLE [dbo].[ShiftSlots] CHECK CONSTRAINT [FK__ShiftSlot__Shift__76969D2E]
GO
ALTER TABLE [dbo].[Stages]  WITH CHECK ADD  CONSTRAINT [FK__Stages__LineID__6D0D32F4] FOREIGN KEY([LineID])
REFERENCES [dbo].[Lines] ([LineID])
GO
ALTER TABLE [dbo].[Stages] CHECK CONSTRAINT [FK__Stages__LineID__6D0D32F4]
GO
ALTER TABLE [dbo].[UserLines]  WITH CHECK ADD  CONSTRAINT [FK__UserLines__LineI__03F0984C] FOREIGN KEY([LineID])
REFERENCES [dbo].[Lines] ([LineID])
GO
ALTER TABLE [dbo].[UserLines] CHECK CONSTRAINT [FK__UserLines__LineI__03F0984C]
GO
ALTER TABLE [dbo].[UserLines]  WITH CHECK ADD  CONSTRAINT [FK__UserLines__UserI__02FC7413] FOREIGN KEY([UserId])
REFERENCES [dbo].[AspNetUsers] ([Id])
GO
ALTER TABLE [dbo].[UserLines] CHECK CONSTRAINT [FK__UserLines__UserI__02FC7413]
GO
