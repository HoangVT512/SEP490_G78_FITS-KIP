using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MovePostponeFieldsToWorkOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PostponedDate",
                table: "MaintenanceWorkOrders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PostponedDueDate",
                table: "MaintenanceWorkOrders",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PostponedReason",
                table: "MaintenanceWorkOrders",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PostponedDate",
                table: "MaintenanceWorkOrders");

            migrationBuilder.DropColumn(
                name: "PostponedDueDate",
                table: "MaintenanceWorkOrders");

            migrationBuilder.DropColumn(
                name: "PostponedReason",
                table: "MaintenanceWorkOrders");
        }
    }
}
