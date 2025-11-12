using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FITSKIP.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelAfterManualDbUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Database already manually updated via SQL script (RemoveObsoleteColumns.sql)
            // This migration is just to sync EF model with the database
            // No operations needed
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Cannot reverse manual database changes
            // This would require restoring the dropped columns and constraints
            throw new NotSupportedException("Cannot reverse manual database updates. Restore from backup if needed.");
        }
    }
}
