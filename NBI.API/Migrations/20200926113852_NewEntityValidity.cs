using Microsoft.EntityFrameworkCore.Migrations;

namespace NBI.API.Migrations
{
    public partial class NewEntityValidity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Validity",
                table: "Drivers",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Validity",
                table: "Drivers");
        }
    }
}
