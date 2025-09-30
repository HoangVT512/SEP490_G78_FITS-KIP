using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveGroupLines : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__Lines__GroupLine__6A30C649",
                table: "Lines");

            migrationBuilder.DropTable(
                name: "GroupLines");

            migrationBuilder.DropIndex(
                name: "IX_Lines_GroupLineID",
                table: "Lines");

            migrationBuilder.DropColumn(
                name: "GroupLineID",
                table: "Lines");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GroupLineID",
                table: "Lines",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "GroupLines",
                columns: table => new
                {
                    GroupLineID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    GroupLineName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__GroupLin__23A523FB9505A5CE", x => x.GroupLineID);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Lines_GroupLineID",
                table: "Lines",
                column: "GroupLineID");

            migrationBuilder.AddForeignKey(
                name: "FK__Lines__GroupLine__6A30C649",
                table: "Lines",
                column: "GroupLineID",
                principalTable: "GroupLines",
                principalColumn: "GroupLineID");
        }
    }
}
