using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using PhoneShop.API.Data;
using PhoneShop.API.Models;

namespace PhoneShop.Infrastructure;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var services = scope.ServiceProvider;
        var context = services.GetRequiredService<AppDbContext>();
        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        await DbSeeder.Seed(context, userManager, roleManager);
    }
}