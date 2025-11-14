using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveReturnRemarksColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReturnRemarks",
                table: "ReplacementHistories");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ReturnRemarks",
                table: "ReplacementHistories",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
