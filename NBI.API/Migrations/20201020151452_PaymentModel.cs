using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace NBI.API.Migrations
{
    public partial class PaymentModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PaymentDriverPaymentId",
                table: "Drivers",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Payments",
                columns: table => new
                {
                    PaymentId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PaymentAmount = table.Column<int>(nullable: false),
                    PaymentTime = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.PaymentId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_PaymentDriverPaymentId",
                table: "Drivers",
                column: "PaymentDriverPaymentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Drivers_Payments_PaymentDriverPaymentId",
                table: "Drivers",
                column: "PaymentDriverPaymentId",
                principalTable: "Payments",
                principalColumn: "PaymentId",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Drivers_Payments_PaymentDriverPaymentId",
                table: "Drivers");

            migrationBuilder.DropTable(
                name: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Drivers_PaymentDriverPaymentId",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "PaymentDriverPaymentId",
                table: "Drivers");
        }
    }
}
