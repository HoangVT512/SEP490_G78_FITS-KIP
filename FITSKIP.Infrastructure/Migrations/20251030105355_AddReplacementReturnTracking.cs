using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReplacementReturnTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ActualQuantityUsed",
                table: "ReplacementHistories",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QuantityToReturn",
                table: "ReplacementHistories",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReturnConfirmedBy",
                table: "ReplacementHistories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReturnRemarks",
                table: "ReplacementHistories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReturnedDate",
                table: "ReplacementHistories",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActualQuantityUsed",
                table: "ReplacementHistories");

            migrationBuilder.DropColumn(
                name: "QuantityToReturn",
                table: "ReplacementHistories");

            migrationBuilder.DropColumn(
                name: "ReturnConfirmedBy",
                table: "ReplacementHistories");

            migrationBuilder.DropColumn(
                name: "ReturnRemarks",
                table: "ReplacementHistories");

            migrationBuilder.DropColumn(
                name: "ReturnedDate",
                table: "ReplacementHistories");
        }
    }
}
