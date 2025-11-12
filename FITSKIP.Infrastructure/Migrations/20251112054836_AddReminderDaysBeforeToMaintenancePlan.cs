using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReminderDaysBeforeToMaintenancePlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ReminderDaysBefore",
                table: "MaintenancePlans",
                type: "int",
                nullable: false,
                defaultValue: 3);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReminderDaysBefore",
                table: "MaintenancePlans");
        }
    }
}
