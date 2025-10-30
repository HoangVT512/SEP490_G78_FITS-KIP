using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMaintenancePlanAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MaintenancePlanAssignments",
                columns: table => new
                {
                    AssignmentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlanID = table.Column<int>(type: "int", nullable: false),
                    TechnicianId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    TechnicianType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AssignedBy = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    AssignedDate = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "GETDATE()"),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__MaintenancePlanAssignment__AssignmentID", x => x.AssignmentID);
                    table.ForeignKey(
                        name: "FK_MaintenancePlanAssignments_AssignedBy",
                        column: x => x.AssignedBy,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_MaintenancePlanAssignments_Plans",
                        column: x => x.PlanID,
                        principalTable: "MaintenancePlans",
                        principalColumn: "PlanID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MaintenancePlanAssignments_Technician",
                        column: x => x.TechnicianId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_MaintenancePlanAssignments_AssignedBy",
                table: "MaintenancePlanAssignments",
                column: "AssignedBy");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenancePlanAssignments_PlanID",
                table: "MaintenancePlanAssignments",
                column: "PlanID");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenancePlanAssignments_TechnicianId",
                table: "MaintenancePlanAssignments",
                column: "TechnicianId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MaintenancePlanAssignments");
        }
    }
}
