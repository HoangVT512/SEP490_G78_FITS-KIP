using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorEntitiesBasedOnNewSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__Equipment__LineI__71D1E811",
                table: "Equipment");

            migrationBuilder.DropForeignKey(
                name: "FK__Productio__Shift__0A9D95DB",
                table: "ProductionOutputs");

            migrationBuilder.DropForeignKey(
                name: "FK__Productio__Stage__09A971A2",
                table: "ProductionOutputs");

            migrationBuilder.DropTable(
                name: "MaintenanceAssignments");

            migrationBuilder.DropTable(
                name: "ErrorHistory");

            migrationBuilder.DropColumn(
                name: "CreateDate",
                table: "UserLines");

            migrationBuilder.DropColumn(
                name: "Urgency",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "IsWorking",
                table: "Equipment");

            migrationBuilder.RenameColumn(
                name: "ShiftID",
                table: "ProductionOutputs",
                newName: "ShiftId");

            migrationBuilder.RenameColumn(
                name: "StageID",
                table: "ProductionOutputs",
                newName: "SlotID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionOutputs_ShiftID",
                table: "ProductionOutputs",
                newName: "IX_ProductionOutputs_ShiftId");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionOutputs_StageID",
                table: "ProductionOutputs",
                newName: "IX_ProductionOutputs_SlotID");

            migrationBuilder.RenameColumn(
                name: "LineID",
                table: "Equipment",
                newName: "LineId");

            migrationBuilder.RenameIndex(
                name: "IX_Equipment_LineID",
                table: "Equipment",
                newName: "IX_Equipment_LineId");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "UserLines",
                type: "datetime",
                nullable: false,
                defaultValueSql: "(getdate())");

            migrationBuilder.AddColumn<DateTime>(
                name: "RejectedAt",
                table: "PurchaseRequests",
                type: "datetime",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectedBy",
                table: "PurchaseRequests",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ShiftId",
                table: "ProductionOutputs",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "ActualQuantity",
                table: "ProductionOutputs",
                type: "int",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)");

            migrationBuilder.AddColumn<int>(
                name: "GoodQuantity",
                table: "ProductionOutputs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "IdealCycleTime",
                table: "ProductionOutputs",
                type: "decimal(10,4)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "PlannedProductionTime",
                table: "ProductionOutputs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "TargetQuantity",
                table: "ProductionOutputs",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "IncidentHistory",
                columns: table => new
                {
                    IncidentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquipmentID = table.Column<int>(type: "int", nullable: true),
                    StartTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    EndTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    Duration = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    TypeID = table.Column<int>(type: "int", nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Solution = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LineId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Incident__5F46CAB00C9D9F0A", x => x.IncidentID);
                    table.ForeignKey(
                        name: "FK_IncidentHistory_Lines_LineId",
                        column: x => x.LineId,
                        principalTable: "Lines",
                        principalColumn: "LineID");
                    table.ForeignKey(
                        name: "FK__IncidentH__Equip__7B5B524B",
                        column: x => x.EquipmentID,
                        principalTable: "Equipment",
                        principalColumn: "EquipmentID");
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
                    IntervalType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IntervalValue = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    NextDueDate = table.Column<DateOnly>(type: "date", nullable: false),
                    AssignedToUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Maintena__755C22D75A5E8C31", x => x.PlanID);
                    table.ForeignKey(
                        name: "FK__MaintenanPlan__Equip__1234567",
                        column: x => x.EquipmentID,
                        principalTable: "Equipment",
                        principalColumn: "EquipmentID");
                    table.ForeignKey(
                        name: "FK__MaintenanPlan__User__2345678",
                        column: x => x.AssignedToUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ReplacementHistories",
                columns: table => new
                {
                    ReplacementID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquipmentID = table.Column<int>(type: "int", nullable: true),
                    PartID = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    ReplacedDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    ReplacedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Pending"),
                    Remarks = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Replacem__55AB07E93456789A", x => x.ReplacementID);
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

            migrationBuilder.CreateTable(
                name: "MaintenanceChecklistItems",
                columns: table => new
                {
                    ChecklistID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlanID = table.Column<int>(type: "int", nullable: false),
                    StepName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsChecked = table.Column<bool>(type: "bit", nullable: true),
                    CompletedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Maintena__26C4E2F5A1234567", x => x.ChecklistID);
                    table.ForeignKey(
                        name: "FK__Maintena__PlanID__3456789",
                        column: x => x.PlanID,
                        principalTable: "MaintenancePlans",
                        principalColumn: "PlanID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseRequests_RejectedBy",
                table: "PurchaseRequests",
                column: "RejectedBy");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentHistory_EquipmentID",
                table: "IncidentHistory",
                column: "EquipmentID");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentHistory_LineId",
                table: "IncidentHistory",
                column: "LineId");

            migrationBuilder.CreateIndex(
                name: "IX_IncidentHistory_TypeID",
                table: "IncidentHistory",
                column: "TypeID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceChecklistItems_PlanID",
                table: "MaintenanceChecklistItems",
                column: "PlanID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenancePlans_AssignedToUserId",
                table: "MaintenancePlans",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenancePlans_EquipmentID",
                table: "MaintenancePlans",
                column: "EquipmentID");

            migrationBuilder.CreateIndex(
                name: "IX_ReplacementHistories_EquipmentID",
                table: "ReplacementHistories",
                column: "EquipmentID");

            migrationBuilder.CreateIndex(
                name: "IX_ReplacementHistories_PartID",
                table: "ReplacementHistories",
                column: "PartID");

            migrationBuilder.CreateIndex(
                name: "IX_ReplacementHistories_ReplacedBy",
                table: "ReplacementHistories",
                column: "ReplacedBy");

            migrationBuilder.AddForeignKey(
                name: "FK_Equipment_Lines_LineId",
                table: "Equipment",
                column: "LineId",
                principalTable: "Lines",
                principalColumn: "LineID");

            migrationBuilder.AddForeignKey(
                name: "FK_ProductionOutputs_Shifts_ShiftId",
                table: "ProductionOutputs",
                column: "ShiftId",
                principalTable: "Shifts",
                principalColumn: "ShiftID");

            migrationBuilder.AddForeignKey(
                name: "FK__Productio__SlotI__0A9D95DB",
                table: "ProductionOutputs",
                column: "SlotID",
                principalTable: "ShiftSlots",
                principalColumn: "SlotID");

            migrationBuilder.AddForeignKey(
                name: "FK__PurchaseR__Rejec__151B245F",
                table: "PurchaseRequests",
                column: "RejectedBy",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Equipment_Lines_LineId",
                table: "Equipment");

            migrationBuilder.DropForeignKey(
                name: "FK_ProductionOutputs_Shifts_ShiftId",
                table: "ProductionOutputs");

            migrationBuilder.DropForeignKey(
                name: "FK__Productio__SlotI__0A9D95DB",
                table: "ProductionOutputs");

            migrationBuilder.DropForeignKey(
                name: "FK__PurchaseR__Rejec__151B245F",
                table: "PurchaseRequests");

            migrationBuilder.DropTable(
                name: "IncidentHistory");

            migrationBuilder.DropTable(
                name: "MaintenanceChecklistItems");

            migrationBuilder.DropTable(
                name: "ReplacementHistories");

            migrationBuilder.DropTable(
                name: "MaintenancePlans");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseRequests_RejectedBy",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "UserLines");

            migrationBuilder.DropColumn(
                name: "RejectedAt",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "RejectedBy",
                table: "PurchaseRequests");

            migrationBuilder.DropColumn(
                name: "GoodQuantity",
                table: "ProductionOutputs");

            migrationBuilder.DropColumn(
                name: "IdealCycleTime",
                table: "ProductionOutputs");

            migrationBuilder.DropColumn(
                name: "PlannedProductionTime",
                table: "ProductionOutputs");

            migrationBuilder.DropColumn(
                name: "TargetQuantity",
                table: "ProductionOutputs");

            migrationBuilder.RenameColumn(
                name: "ShiftId",
                table: "ProductionOutputs",
                newName: "ShiftID");

            migrationBuilder.RenameColumn(
                name: "SlotID",
                table: "ProductionOutputs",
                newName: "StageID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionOutputs_ShiftId",
                table: "ProductionOutputs",
                newName: "IX_ProductionOutputs_ShiftID");

            migrationBuilder.RenameIndex(
                name: "IX_ProductionOutputs_SlotID",
                table: "ProductionOutputs",
                newName: "IX_ProductionOutputs_StageID");

            migrationBuilder.RenameColumn(
                name: "LineId",
                table: "Equipment",
                newName: "LineID");

            migrationBuilder.RenameIndex(
                name: "IX_Equipment_LineId",
                table: "Equipment",
                newName: "IX_Equipment_LineID");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreateDate",
                table: "UserLines",
                type: "datetime",
                nullable: true,
                defaultValueSql: "(getdate())");

            migrationBuilder.AddColumn<string>(
                name: "Urgency",
                table: "PurchaseRequests",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                defaultValue: "Normal");

            migrationBuilder.AlterColumn<int>(
                name: "ShiftID",
                table: "ProductionOutputs",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "ActualQuantity",
                table: "ProductionOutputs",
                type: "decimal(10,2)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<bool>(
                name: "IsWorking",
                table: "Equipment",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "ErrorHistory",
                columns: table => new
                {
                    ErrorID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EquipmentID = table.Column<int>(type: "int", nullable: true),
                    LineID = table.Column<int>(type: "int", nullable: true),
                    SlotID = table.Column<int>(type: "int", nullable: true),
                    StageID = table.Column<int>(type: "int", nullable: true),
                    TypeID = table.Column<int>(type: "int", nullable: true),
                    Duration = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    EndTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    ErrorDescription = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    Reason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Solution = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StartTime = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__ErrorHis__358565CA8E27F35E", x => x.ErrorID);
                    table.ForeignKey(
                        name: "FK__ErrorHist__Equip__7B5B524B",
                        column: x => x.EquipmentID,
                        principalTable: "Equipment",
                        principalColumn: "EquipmentID");
                    table.ForeignKey(
                        name: "FK__ErrorHist__LineI__7D439ABD",
                        column: x => x.LineID,
                        principalTable: "Lines",
                        principalColumn: "LineID");
                    table.ForeignKey(
                        name: "FK__ErrorHist__SlotI__7E37BEF6",
                        column: x => x.SlotID,
                        principalTable: "ShiftSlots",
                        principalColumn: "SlotID");
                    table.ForeignKey(
                        name: "FK__ErrorHist__Stage__7C4F7684",
                        column: x => x.StageID,
                        principalTable: "Stages",
                        principalColumn: "StageID");
                    table.ForeignKey(
                        name: "FK__ErrorHist__TypeI__7F2BE32F",
                        column: x => x.TypeID,
                        principalTable: "StopType",
                        principalColumn: "TypeID");
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceAssignments",
                columns: table => new
                {
                    AssignmentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ErrorID = table.Column<int>(type: "int", nullable: false),
                    TechnicianID = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    CompletedAt = table.Column<DateTime>(type: "datetime", nullable: true),
                    ResolutionDetail = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Maintena__32499E57A8B16523", x => x.AssignmentID);
                    table.ForeignKey(
                        name: "FK__Maintenan__Error__18EBB532",
                        column: x => x.ErrorID,
                        principalTable: "ErrorHistory",
                        principalColumn: "ErrorID");
                    table.ForeignKey(
                        name: "FK__Maintenan__Techn__19DFD96B",
                        column: x => x.TechnicianID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ErrorHistory_EquipmentID",
                table: "ErrorHistory",
                column: "EquipmentID");

            migrationBuilder.CreateIndex(
                name: "IX_ErrorHistory_LineID",
                table: "ErrorHistory",
                column: "LineID");

            migrationBuilder.CreateIndex(
                name: "IX_ErrorHistory_SlotID",
                table: "ErrorHistory",
                column: "SlotID");

            migrationBuilder.CreateIndex(
                name: "IX_ErrorHistory_StageID",
                table: "ErrorHistory",
                column: "StageID");

            migrationBuilder.CreateIndex(
                name: "IX_ErrorHistory_TypeID",
                table: "ErrorHistory",
                column: "TypeID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceAssignments_ErrorID",
                table: "MaintenanceAssignments",
                column: "ErrorID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceAssignments_TechnicianID",
                table: "MaintenanceAssignments",
                column: "TechnicianID");

            migrationBuilder.AddForeignKey(
                name: "FK__Equipment__LineI__71D1E811",
                table: "Equipment",
                column: "LineID",
                principalTable: "Lines",
                principalColumn: "LineID");

            migrationBuilder.AddForeignKey(
                name: "FK__Productio__Shift__0A9D95DB",
                table: "ProductionOutputs",
                column: "ShiftID",
                principalTable: "Shifts",
                principalColumn: "ShiftID");

            migrationBuilder.AddForeignKey(
                name: "FK__Productio__Stage__09A971A2",
                table: "ProductionOutputs",
                column: "StageID",
                principalTable: "Stages",
                principalColumn: "StageID");
        }
    }
}
