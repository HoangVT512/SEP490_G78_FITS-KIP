using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUnusedWorkOrderColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InspectionCode",
                table: "MaintenanceWorkOrders");

            migrationBuilder.DropColumn(
                name: "RepairTime",
                table: "MaintenanceWorkOrders");

            migrationBuilder.DropColumn(
                name: "UsageUnit",
                table: "MaintenanceWorkOrders");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InspectionCode",
                table: "MaintenanceWorkOrders",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RepairTime",
                table: "MaintenanceWorkOrders",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UsageUnit",
                table: "MaintenanceWorkOrders",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }
    }
}
