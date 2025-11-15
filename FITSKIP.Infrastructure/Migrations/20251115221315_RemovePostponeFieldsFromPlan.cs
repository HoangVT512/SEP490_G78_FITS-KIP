using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemovePostponeFieldsFromPlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PostponedDate",
                table: "MaintenancePlans");

            migrationBuilder.DropColumn(
                name: "PostponedDueDate",
                table: "MaintenancePlans");

            migrationBuilder.DropColumn(
                name: "PostponedReason",
                table: "MaintenancePlans");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "PostponedDate",
                table: "MaintenancePlans",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PostponedDueDate",
                table: "MaintenancePlans",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PostponedReason",
                table: "MaintenancePlans",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
