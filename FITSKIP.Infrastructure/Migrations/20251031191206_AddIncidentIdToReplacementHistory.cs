using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIncidentIdToReplacementHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IncidentId",
                table: "ReplacementHistories",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReplacementHistories_IncidentId",
                table: "ReplacementHistories",
                column: "IncidentId");

            migrationBuilder.AddForeignKey(
                name: "FK_ReplacementHistories_IncidentHistory_IncidentId",
                table: "ReplacementHistories",
                column: "IncidentId",
                principalTable: "IncidentHistory",
                principalColumn: "IncidentID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ReplacementHistories_IncidentHistory_IncidentId",
                table: "ReplacementHistories");

            migrationBuilder.DropIndex(
                name: "IX_ReplacementHistories_IncidentId",
                table: "ReplacementHistories");

            migrationBuilder.DropColumn(
                name: "IncidentId",
                table: "ReplacementHistories");
        }
    }
}
