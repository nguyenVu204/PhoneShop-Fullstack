using Microsoft.AspNetCore.Identity;
using PhoneShop.API.Models;

namespace PhoneShop.API.Data
{
    public static class DbSeeder
    {
        // Thêm tham số UserManager và RoleManager để tạo User/Role
        public static async Task Seed(AppDbContext context, UserManager<AppUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            // 1. Tạo Roles (Admin & Customer) nếu chưa có
            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                await roleManager.CreateAsync(new IdentityRole("Admin"));
                await roleManager.CreateAsync(new IdentityRole("Customer"));
            }

            // 2. Tạo Tài khoản Admin mặc định (nếu chưa có)
            if (await userManager.FindByEmailAsync("admin@gmail.com") == null)
            {
                var adminUser = new AppUser
                {
                    UserName = "admin@gmail.com",
                    Email = "admin@gmail.com",
                    FullName = "Quản Trị Viên",
                    EmailConfirmed = true
                };

                // Tạo user với pass 123456
                var result = await userManager.CreateAsync(adminUser, "123456");

                if (result.Succeeded)
                {
                    // Gán quyền Admin cho user này
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }

            // 3. Seed dữ liệu sản phẩm (Giữ nguyên logic cũ)
            if (context.Products.Any()) return;

            var apple = new Brand { Name = "Apple", LogoUrl = "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" };
            var samsung = new Brand { Name = "Samsung", LogoUrl = "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" };

            var ip15 = new Product
            {
                Name = "iPhone 15 Pro Max",
                Description = "Khung viền Titan, chip A17 Pro mạnh mẽ.",
                Brand = apple,
                Thumbnail = "https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg",
                Variants = new List<ProductVariant>()
                {
                    new ProductVariant { Color = "Titan Tự Nhiên", Ram = "8GB", Rom = "256GB", Price = 29990000, StockQuantity = 50, ImageUrl = "https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-gold-thumbnew-600x600.jpg" },
                    new ProductVariant { Color = "Titan Xanh", Ram = "8GB", Rom = "512GB", Price = 35990000, StockQuantity = 20, ImageUrl = "https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg" }
                }
            };

            var s24 = new Product
            {
                Name = "Samsung Galaxy S24 Ultra",
                Description = "Quyền năng Galaxy AI, Camera 200MP.",
                Brand = samsung,
                Thumbnail = "https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg",
                Variants = new List<ProductVariant>()
                {
                    new ProductVariant { Color = "Xám Titan", Ram = "12GB", Rom = "256GB", Price = 28990000, StockQuantity = 100, ImageUrl = "https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-grey-thumbnew-600x600.jpg" },
                    new ProductVariant { Color = "Tím Titan", Ram = "12GB", Rom = "512GB", Price = 32990000, StockQuantity = 40, ImageUrl = "https://cdn.tgdd.vn/Products/Images/42/307174/samsung-galaxy-s24-ultra-purple-thumbnew-600x600.jpg" }
                }
            };

            context.Brands.AddRange(apple, samsung);
            context.Products.AddRange(ip15, s24);
            await context.SaveChangesAsync();
        }
    }
}