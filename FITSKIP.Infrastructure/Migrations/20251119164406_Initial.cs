using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Shifts",
                columns: table => new
                {
                    ShiftID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShiftName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Shifts__C0A838E1E127179C", x => x.ShiftID);
                });

            migrationBuilder.CreateTable(
                name: "SpareParts",
                columns: table => new
                {
                    PartID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PartName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PartType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    MinQuantity = table.Column<int>(type: "int", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    DateAdded = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "GETDATE()"),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Đủ hàng"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__SparePar__7C3F0D30890EDD23", x => x.PartID);
                });

            migrationBuilder.CreateTable(
                name: "StopType",
                columns: table => new
                {
                    TypeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TypeName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__StopType__516F0395AE2FC0CE", x => x.TypeID);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    EmployeeCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RoleId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    DepartmentId = table.Column<int>(type: "int", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    DepartmentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DepartmentName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ManagerId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Departme__B2079BCDAEAF02C2", x => x.DepartmentID);
                    table.ForeignKey(
                        name: "FK__Departmen__Manag__619B8048",
                        column: x => x.ManagerId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Message = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IsRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Notification__NotificationID", x => x.NotificationID);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PurchaseRequests",
                columns: table => new
                {
                    RequestID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PartID = table.Column<int>(type: "int", nullable: false),
                    RequestedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true, defaultValue: "Pending"),
                    ApprovedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    RejectedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    ReceivedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    RejectedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    ReceivedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReceivedByNavigationId = table.Column<string>(type: "nvarchar(450)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Purchase__33A8519A9AC26C34", x => x.RequestID);
                    table.ForeignKey(
                        name: "FK_PurchaseRequests_AspNetUsers_ReceivedByNavigationId",
                        column: x => x.ReceivedByNavigationId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__PurchaseR__Appro__151B244E",
                        column: x => x.ApprovedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__PurchaseR__PartI__1332DBDC",
                        column: x => x.PartID,
                        principalTable: "SpareParts",
                        principalColumn: "PartID");
                    table.ForeignKey(
                        name: "FK__PurchaseR__Rejec__151B245F",
                        column: x => x.RejectedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__PurchaseR__Reque__14270015",
                        column: x => x.RequestedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Lines",
                columns: table => new
                {
                    LineID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LineName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    LineCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DepartmentID = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Lines__2EAE64C9765DBF83", x => x.LineID);
                    table.ForeignKey(
                        name: "FK__Lines__Departmen__6A30C650",
                        column: x => x.DepartmentID,
                        principalTable: "Departments",
                        principalColumn: "DepartmentID");
                });

            migrationBuilder.CreateTable(
                name: "ProductionOutputs",
                columns: table => new
                {
                    OutputID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LineID = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime", nullable: false),
                    ShiftID = table.Column<int>(type: "int", nullable: false),
                    SlotTime = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LoadingTime = table.Column<int>(type: "int", nullable: true),
                    TargetAmount = table.Column<int>(type: "int", nullable: true),
                    ResultAmount = table.Column<int>(type: "int", nullable: true),
                    OEE = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Producti__CE7609460B69FF1F", x => x.OutputID);
                    table.ForeignKey(
                        name: "FK__Productio__LineI__08B54D69",
                        column: x => x.LineID,
                        principalTable: "Lines",
                        principalColumn: "LineID");
                    table.ForeignKey(
                        name: "FK__Productio__ShiftID__0A9D95DB",
                        column: x => x.ShiftID,
                        principalTable: "Shifts",
                        principalColumn: "ShiftID");
                });

            migrationBuilder.CreateTable(
                name: "Stages",
                columns: table => new
                {
                    StageID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StageName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LineID = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Stages__03EB7AF84C50ECAB", x => x.StageID);
                    table.ForeignKey(
                        name: "FK__Stages__LineID__6D0D32F4",
                        column: x => x.LineID,
                        principalTable: "Lines",
                        principalColumn: "LineID");
                });

            migrationBuilder.CreateTable(
                name: "UserLines",
                columns: table => new
                {
                    UserLineID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    LineID = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__UserLine__3B1F2081CE44FE03", x => x.UserLineID);
                    table.ForeignKey(
                        name: "FK__UserLines__LineI__03F0984C",
                        column: x => x.LineID,
                        principalTable: "Lines",
                        principalColumn: "LineID");
                    table.ForeignKey(
                        name: "FK__UserLines__UserI__02FC7413",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Equipment",
                columns: table => new
                {
                    EquipmentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquipmentCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EquipmentName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    DateUse = table.Column<DateOnly>(type: "date", nullable: true),
                    Origin = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    YOM = table.Column<int>(type: "int", nullable: true),
                    QRCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Issue = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StageID = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Equipmen__34474599BD4FBDFE", x => x.EquipmentID);
                    table.ForeignKey(
                        name: "FK__Equipment__Stage__70DDC3D8",
                        column: x => x.StageID,
                        principalTable: "Stages",
                        principalColumn: "StageID");
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceTemplates",
                columns: table => new
                {
                    TemplateID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StageID = table.Column<int>(type: "int", nullable: false),
                    TemplateName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "GETDATE()"),
                    CreatedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdatedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Maintenance__TemplateID", x => x.TemplateID);
                    table.ForeignKey(
                        name: "FK_MaintenanceTemplates_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MaintenanceTemplates_Stages",
                        column: x => x.StageID,
                        principalTable: "Stages",
                        principalColumn: "StageID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MaintenanceTemplates_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "IncidentHistory",
                columns: table => new
                {
                    IncidentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquipmentID = table.Column<int>(type: "int", nullable: true),
                    LineID = table.Column<int>(type: "int", nullable: true),
                    StartTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    EndTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    Duration = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    TypeID = table.Column<int>(type: "int", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Solution = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Issue = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "GETDATE()"),
                    ReportedByUserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    AssignedTo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsTechSupport = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Incident__5F46CAB00C9D9F0A", x => x.IncidentID);
                    table.ForeignKey(
                        name: "FK_IncidentHistory_AspNetUsers_ReportedByUserId",
                        column: x => x.ReportedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK__IncidentH__Equip__7B5B524B",
                        column: x => x.EquipmentID,
                        principalTable: "Equipment",
                        principalColumn: "EquipmentID");
                    table.ForeignKey(
                        name: "FK__IncidentH__LineI__8C5B6A4C",
                        column: x => x.LineID,
                        principalTable: "Lines",
                        principalColumn: "LineID");
                    table.ForeignKey(
                        name: "FK__IncidentH__TypeI__7F2BE32F",
                        column: x => x.TypeID,
                        principalTable: "StopType",
                        principalColumn: "TypeID");
                });

            migrationBuilder.CreateTable(
                name: "MaintenancePlans",
                columns: table => new
                {
                    PlanID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquipmentID = table.Column<int>(type: "int", nullable: true),
                    TemplateID = table.Column<int>(type: "int", nullable: true),
                    IntervalType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IntervalValue = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    NextDueDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    ReminderDaysBefore = table.Column<int>(type: "int", nullable: false, defaultValue: 3),
                    CreatedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "GETDATE()"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Maintena__755C22D75A5E8C31", x => x.PlanID);
                    table.ForeignKey(
                        name: "FK_MaintenancePlans_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MaintenancePlans_Equipment",
                        column: x => x.EquipmentID,
                        principalTable: "Equipment",
                        principalColumn: "EquipmentID",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MaintenancePlans_Templates",
                        column: x => x.TemplateID,
                        principalTable: "MaintenanceTemplates",
                        principalColumn: "TemplateID",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceTemplateItems",
                columns: table => new
                {
                    ItemID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TemplateID = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    StepName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    StepDescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsRequired = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    RequiredRole = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MaintenanceTemplateItem__ItemID", x => x.ItemID);
                    table.ForeignKey(
                        name: "FK_MaintenanceTemplateItems_Templates",
                        column: x => x.TemplateID,
                        principalTable: "MaintenanceTemplates",
                        principalColumn: "TemplateID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IncidentImages",
                columns: table => new
                {
                    ImageID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IncidentID = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    UploadedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Incident__7516F4EC", x => x.ImageID);
                    table.ForeignKey(
                        name: "FK_IncidentImages_IncidentHistory_IncidentID",
                        column: x => x.IncidentID,
                        principalTable: "IncidentHistory",
                        principalColumn: "IncidentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "IncidentShifts",
                columns: table => new
                {
                    IncidentShiftID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IncidentID = table.Column<int>(type: "int", nullable: false),
                    ShiftID = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__IncidentShift__IncidentShiftID", x => x.IncidentShiftID);
                    table.ForeignKey(
                        name: "FK_IncidentShift_IncidentHistory_IncidentID",
                        column: x => x.IncidentID,
                        principalTable: "IncidentHistory",
                        principalColumn: "IncidentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_IncidentShift_Shifts_ShiftID",
                        column: x => x.ShiftID,
                        principalTable: "Shifts",
                        principalColumn: "ShiftID");
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceWorkOrders",
                columns: table => new
                {
                    WorkOrderID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkOrderCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PlanID = table.Column<int>(type: "int", nullable: false),
                    EquipmentID = table.Column<int>(type: "int", nullable: false),
                    AssignedDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    ScheduledDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    DueDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    AssignedToElectrical = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    AssignedToMechanical = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    PostponedDueDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    PostponedReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PostponedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    StartedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "GETDATE()"),
                    UpdatedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MaintenanceWorkOrder__WorkOrderID", x => x.WorkOrderID);
                    table.ForeignKey(
                        name: "FK_MaintenanceWorkOrders_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MaintenanceWorkOrders_ElectricalTech",
                        column: x => x.AssignedToElectrical,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MaintenanceWorkOrders_Equipment",
                        column: x => x.EquipmentID,
                        principalTable: "Equipment",
                        principalColumn: "EquipmentID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MaintenanceWorkOrders_MechanicalTech",
                        column: x => x.AssignedToMechanical,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MaintenanceWorkOrders_Plans",
                        column: x => x.PlanID,
                        principalTable: "MaintenancePlans",
                        principalColumn: "PlanID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MaintenanceWorkOrders_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceChecklistItems",
                columns: table => new
                {
                    ChecklistID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkOrderID = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OrderIndex = table.Column<int>(type: "int", nullable: false),
                    StepName = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    StepDescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RequiredRole = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsChecked = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CompletedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PlanID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Maintena__26C4E2F5A1234567", x => x.ChecklistID);
                    table.ForeignKey(
                        name: "FK_MaintenanceChecklistItems_CompletedBy",
                        column: x => x.CompletedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_MaintenanceChecklistItems_WorkOrders",
                        column: x => x.WorkOrderID,
                        principalTable: "MaintenanceWorkOrders",
                        principalColumn: "WorkOrderID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReplacementHistories",
                columns: table => new
                {
                    ReplacementID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquipmentID = table.Column<int>(type: "int", nullable: true),
                    IncidentId = table.Column<int>(type: "int", nullable: true),
                    WorkOrderId = table.Column<int>(type: "int", nullable: true),
                    PartID = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    ReplacedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    ReplacedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    Remarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ActualQuantityUsed = table.Column<int>(type: "int", nullable: true),
                    QuantityToReturn = table.Column<int>(type: "int", nullable: true),
                    ReturnedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReturnConfirmedBy = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Replacem__55AB07E93456789A", x => x.ReplacementID);
                    table.ForeignKey(
                        name: "FK_ReplacementHistories_IncidentHistory_IncidentId",
                        column: x => x.IncidentId,
                        principalTable: "IncidentHistory",
                        principalColumn: "IncidentID");
                    table.ForeignKey(
                        name: "FK_ReplacementHistories_MaintenanceWorkOrders_WorkOrderId",
                        column: x => x.WorkOrderId,
                        principalTable: "MaintenanceWorkOrders",
                        principalColumn: "WorkOrderID");
                    table.ForeignKey(
                        name: "FK__Replaceme__Equip__4567890A",
                        column: x => x.EquipmentID,
                        principalTable: "Equipment",
                        principalColumn: "EquipmentID");
                    table.ForeignKey(
                        name: "FK__Replaceme__PartI__5678901B",
                        column: x => x.PartID,
                        principalTable: "SpareParts",
                        principalColumn: "PartID");
                    table.ForeignKey(
                        name: "FK__Replaceme__Repla__6789012C",
                        column: x => x.ReplacedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_DepartmentId",
                table: "AspNetUsers",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_RoleId",
                table: "AspNetUsers",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_ManagerId",
                table: "Departments",
                column: "ManagerId");

            migrationBuilder.CreateIndex(
                name: "IX_Equipment_StageID",
                table: "Equipment",
                column: "StageID");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentHistory_EquipmentID",
                table: "IncidentHistory",
                column: "EquipmentID");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentHistory_LineID",
                table: "IncidentHistory",
                column: "LineID");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentHistory_ReportedByUserId",
                table: "IncidentHistory",
                column: "ReportedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentHistory_TypeID",
                table: "IncidentHistory",
                column: "TypeID");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentImages_IncidentID",
                table: "IncidentImages",
                column: "IncidentID");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentShifts_IncidentID",
                table: "IncidentShifts",
                column: "IncidentID");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentShifts_ShiftID",
                table: "IncidentShifts",
                column: "ShiftID");

            migrationBuilder.CreateIndex(
                name: "IX_Lines_DepartmentID",
                table: "Lines",
                column: "DepartmentID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceChecklistItems_CompletedBy",
                table: "MaintenanceChecklistItems",
                column: "CompletedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceChecklistItems_WorkOrderID",
                table: "MaintenanceChecklistItems",
                column: "WorkOrderID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenancePlans_CreatedBy",
                table: "MaintenancePlans",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenancePlans_EquipmentID",
                table: "MaintenancePlans",
                column: "EquipmentID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenancePlans_TemplateID",
                table: "MaintenancePlans",
                column: "TemplateID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceTemplateItems_TemplateID",
                table: "MaintenanceTemplateItems",
                column: "TemplateID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceTemplates_CreatedBy",
                table: "MaintenanceTemplates",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceTemplates_StageID",
                table: "MaintenanceTemplates",
                column: "StageID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceTemplates_UpdatedBy",
                table: "MaintenanceTemplates",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceWorkOrders_AssignedToElectrical",
                table: "MaintenanceWorkOrders",
                column: "AssignedToElectrical");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceWorkOrders_AssignedToMechanical",
                table: "MaintenanceWorkOrders",
                column: "AssignedToMechanical");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceWorkOrders_CreatedBy",
                table: "MaintenanceWorkOrders",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceWorkOrders_EquipmentID",
                table: "MaintenanceWorkOrders",
                column: "EquipmentID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceWorkOrders_PlanID",
                table: "MaintenanceWorkOrders",
                column: "PlanID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceWorkOrders_UpdatedBy",
                table: "MaintenanceWorkOrders",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionOutputs_LineID",
                table: "ProductionOutputs",
                column: "LineID");

            migrationBuilder.CreateIndex(
                name: "IX_ProductionOutputs_ShiftID",
                table: "ProductionOutputs",
                column: "ShiftID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_ApprovedBy",
                table: "PurchaseRequests",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_PartID",
                table: "PurchaseRequests",
                column: "PartID");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_ReceivedByNavigationId",
                table: "PurchaseRequests",
                column: "ReceivedByNavigationId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_RejectedBy",
                table: "PurchaseRequests",
                column: "RejectedBy");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_RequestedBy",
                table: "PurchaseRequests",
                column: "RequestedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ReplacementHistories_EquipmentID",
                table: "ReplacementHistories",
                column: "EquipmentID");

            migrationBuilder.CreateIndex(
                name: "IX_ReplacementHistories_IncidentId",
                table: "ReplacementHistories",
                column: "IncidentId");

            migrationBuilder.CreateIndex(
                name: "IX_ReplacementHistories_PartID",
                table: "ReplacementHistories",
                column: "PartID");

            migrationBuilder.CreateIndex(
                name: "IX_ReplacementHistories_ReplacedBy",
                table: "ReplacementHistories",
                column: "ReplacedBy");

            migrationBuilder.CreateIndex(
                name: "IX_ReplacementHistories_WorkOrderId",
                table: "ReplacementHistories",
                column: "WorkOrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Stages_LineID",
                table: "Stages",
                column: "LineID");

            migrationBuilder.CreateIndex(
                name: "IX_UserLines_LineID",
                table: "UserLines",
                column: "LineID");

            migrationBuilder.CreateIndex(
                name: "IX_UserLines_UserId",
                table: "UserLines",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Departments_DepartmentId",
                table: "AspNetUsers",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "DepartmentID",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_AspNetRoles_RoleId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Departments_DepartmentId",
                table: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "IncidentImages");

            migrationBuilder.DropTable(
                name: "IncidentShifts");

            migrationBuilder.DropTable(
                name: "MaintenanceChecklistItems");

            migrationBuilder.DropTable(
                name: "MaintenanceTemplateItems");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "ProductionOutputs");

            migrationBuilder.DropTable(
                name: "PurchaseRequests");

            migrationBuilder.DropTable(
                name: "ReplacementHistories");

            migrationBuilder.DropTable(
                name: "UserLines");

            migrationBuilder.DropTable(
                name: "Shifts");

            migrationBuilder.DropTable(
                name: "IncidentHistory");

            migrationBuilder.DropTable(
                name: "MaintenanceWorkOrders");

            migrationBuilder.DropTable(
                name: "SpareParts");

            migrationBuilder.DropTable(
                name: "StopType");

            migrationBuilder.DropTable(
                name: "MaintenancePlans");

            migrationBuilder.DropTable(
                name: "Equipment");

            migrationBuilder.DropTable(
                name: "MaintenanceTemplates");

            migrationBuilder.DropTable(
                name: "Stages");

            migrationBuilder.DropTable(
                name: "Lines");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "AspNetUsers");
        }
    }
}
