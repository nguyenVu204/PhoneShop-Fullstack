using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PhoneShop.API.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscountPrice : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DiscountPrice",
                table: "ProductVariants",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscountPrice",
                table: "ProductVariants");
        }
    }
}
