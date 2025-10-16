using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReportedByToIncidentHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ReportedBy",
                table: "IncidentHistory",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReportedByUserId",
                table: "IncidentHistory",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_IncidentHistory_ReportedByUserId",
                table: "IncidentHistory",
                column: "ReportedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_IncidentHistory_AspNetUsers_ReportedByUserId",
                table: "IncidentHistory",
                column: "ReportedByUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IncidentHistory_AspNetUsers_ReportedByUserId",
                table: "IncidentHistory");

            migrationBuilder.DropIndex(
                name: "IX_IncidentHistory_ReportedByUserId",
                table: "IncidentHistory");

            migrationBuilder.DropColumn(
                name: "ReportedBy",
                table: "IncidentHistory");

            migrationBuilder.DropColumn(
                name: "ReportedByUserId",
                table: "IncidentHistory");
        }
    }
}
