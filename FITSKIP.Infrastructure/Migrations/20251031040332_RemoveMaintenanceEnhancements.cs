using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMaintenanceEnhancements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DowntimeCost",
                table: "MaintenanceWorkOrders");

            migrationBuilder.DropColumn(
                name: "DowntimeHours",
                table: "MaintenanceWorkOrders");

            migrationBuilder.DropColumn(
                name: "IsSLAViolated",
                table: "MaintenanceWorkOrders");

            migrationBuilder.DropColumn(
                name: "IsUrgent",
                table: "MaintenanceWorkOrders");

            migrationBuilder.DropColumn(
                name: "LaborCost",
                table: "MaintenanceWorkOrders");

            migrationBuilder.DropColumn(
                name: "Priority",
                table: "MaintenanceWorkOrders");

            migrationBuilder.DropColumn(
                name: "SLADueDate",
                table: "MaintenanceWorkOrders");

            migrationBuilder.DropColumn(
                name: "SLAHoursRemaining",
                table: "MaintenanceWorkOrders");

            migrationBuilder.DropColumn(
                name: "SparePartsCost",
                table: "MaintenanceWorkOrders");

            migrationBuilder.DropColumn(
                name: "TotalCost",
                table: "MaintenanceWorkOrders");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DowntimeCost",
                table: "MaintenanceWorkOrders",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "DowntimeHours",
                table: "MaintenanceWorkOrders",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSLAViolated",
                table: "MaintenanceWorkOrders",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsUrgent",
                table: "MaintenanceWorkOrders",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "LaborCost",
                table: "MaintenanceWorkOrders",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "MaintenanceWorkOrders",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "SLADueDate",
                table: "MaintenanceWorkOrders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SLAHoursRemaining",
                table: "MaintenanceWorkOrders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SparePartsCost",
                table: "MaintenanceWorkOrders",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalCost",
                table: "MaintenanceWorkOrders",
                type: "decimal(18,2)",
                nullable: true);
        }
    }
}
