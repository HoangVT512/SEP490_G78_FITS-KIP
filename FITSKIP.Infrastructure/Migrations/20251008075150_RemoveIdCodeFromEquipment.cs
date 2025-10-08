using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveIdCodeFromEquipment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdCode",
                table: "Equipment");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IdCode",
                table: "Equipment",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);
        }
    }
}
