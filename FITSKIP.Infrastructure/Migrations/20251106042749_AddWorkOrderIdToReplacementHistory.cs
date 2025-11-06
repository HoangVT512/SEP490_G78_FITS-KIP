using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkOrderIdToReplacementHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WorkOrderId",
                table: "ReplacementHistories",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReplacementHistories_WorkOrderId",
                table: "ReplacementHistories",
                column: "WorkOrderId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReplacementHistories_MaintenanceWorkOrders_WorkOrderId",
                table: "ReplacementHistories",
                column: "WorkOrderId",
                principalTable: "MaintenanceWorkOrders",
                principalColumn: "WorkOrderID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReplacementHistories_MaintenanceWorkOrders_WorkOrderId",
                table: "ReplacementHistories");

            migrationBuilder.DropIndex(
                name: "IX_ReplacementHistories_WorkOrderId",
                table: "ReplacementHistories");

            migrationBuilder.DropColumn(
                name: "WorkOrderId",
                table: "ReplacementHistories");
        }
    }
}
