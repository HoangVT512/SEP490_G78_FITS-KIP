using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveRoomsAndUpdateStructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__GroupLine__RoomI__6754599E",
                table: "GroupLines");

            migrationBuilder.DropTable(
                name: "Rooms");

            migrationBuilder.DropIndex(
                name: "IX_GroupLines_RoomID",
                table: "GroupLines");

            migrationBuilder.DropColumn(
                name: "RoomID",
                table: "GroupLines");

            migrationBuilder.AddColumn<int>(
                name: "DepartmentID",
                table: "Lines",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Lines",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Departments",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateIndex(
                name: "IX_Lines_DepartmentID",
                table: "Lines",
                column: "DepartmentID");

            migrationBuilder.AddForeignKey(
                name: "FK__Lines__Departmen__6A30C650",
                table: "Lines",
                column: "DepartmentID",
                principalTable: "Departments",
                principalColumn: "DepartmentID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__Lines__Departmen__6A30C650",
                table: "Lines");

            migrationBuilder.DropIndex(
                name: "IX_Lines_DepartmentID",
                table: "Lines");

            migrationBuilder.DropColumn(
                name: "DepartmentID",
                table: "Lines");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Lines");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Departments");

            migrationBuilder.AddColumn<int>(
                name: "RoomID",
                table: "GroupLines",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Rooms",
                columns: table => new
                {
                    RoomID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DepartmentID = table.Column<int>(type: "int", nullable: true),
                    RoomName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Rooms__3286391944F5E5E2", x => x.RoomID);
                    table.ForeignKey(
                        name: "FK__Rooms__Departmen__6477ECF3",
                        column: x => x.DepartmentID,
                        principalTable: "Departments",
                        principalColumn: "DepartmentID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_GroupLines_RoomID",
                table: "GroupLines",
                column: "RoomID");

            migrationBuilder.CreateIndex(
                name: "IX_Rooms_DepartmentID",
                table: "Rooms",
                column: "DepartmentID");

            migrationBuilder.AddForeignKey(
                name: "FK__GroupLine__RoomI__6754599E",
                table: "GroupLines",
                column: "RoomID",
                principalTable: "Rooms",
                principalColumn: "RoomID");
        }
    }
}
