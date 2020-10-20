using Microsoft.EntityFrameworkCore.Migrations;

namespace NBI.API.Migrations
{
    public partial class PaymentModel2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Drivers_Payments_PaymentDriverPaymentId",
                table: "Drivers");

            migrationBuilder.DropIndex(
                name: "IX_Drivers_PaymentDriverPaymentId",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "PaymentDriverPaymentId",
                table: "Drivers");

            migrationBuilder.AddColumn<int>(
                name: "DriverId",
                table: "Payments",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DriverId",
                table: "Payments");

            migrationBuilder.AddColumn<int>(
                name: "PaymentDriverPaymentId",
                table: "Drivers",
                type: "int",
                nullable: true);

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
    }
}
