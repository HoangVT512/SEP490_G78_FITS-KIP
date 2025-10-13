using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartmentIdToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add DepartmentId column to AspNetUsers if it doesn't exist
            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "AspNetUsers",
                type: "int",
                nullable: true);

            // Create index for DepartmentId
            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_DepartmentId",
                table: "AspNetUsers",
                column: "DepartmentId");

            migrationBuilder.DropForeignKey(
                name: "FK__Departmen__Manag__619B8048",
                table: "Departments");

            // Add foreign key from User to Department
            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Departments_DepartmentId",
                table: "AspNetUsers",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "DepartmentID",
                onDelete: ReferentialAction.SetNull);

            // Recreate Department.ManagerId foreign key with SetNull
            migrationBuilder.AddForeignKey(
                name: "FK__Departmen__Manag__619B8048",
                table: "Departments",
                column: "ManagerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Departments_DepartmentId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK__Departmen__Manag__619B8048",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_DepartmentId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "AspNetUsers");

            migrationBuilder.AddForeignKey(
                name: "FK__Departmen__Manag__619B8048",
                table: "Departments",
                column: "ManagerId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
