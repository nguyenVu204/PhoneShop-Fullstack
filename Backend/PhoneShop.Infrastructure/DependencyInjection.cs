using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PhoneShop.API.Data;
using PhoneShop.API.Models;
using PhoneShop.API.Services;
using PhoneShop.API.Services.VnPay;
using PhoneShop.Application.Interfaces.Repositories;
using PhoneShop.Application.Interfaces.Services;
using PhoneShop.Infrastructure.Persistence.Repositories;
using PhoneShop.Infrastructure.Persistence.Services;

namespace PhoneShop.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddIdentity<AppUser, IdentityRole>(options =>
        {
            options.Password.RequireDigit = false;
            options.Password.RequireLowercase = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 6;
        })
        .AddEntityFrameworkStores<AppDbContext>()
        .AddDefaultTokenProviders();

        services.AddScoped<IVnPayService, VnPayService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<IInventoryRepository, InventoryRepository>();
        services.AddScoped<INewsCategoryRepository, NewsCategoryRepository>();
        services.AddScoped<IFavoriteRepository, FavoriteRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<ISerialNumberRepository, SerialNumberRepository>();
        services.AddScoped<IPaymentOrderService, PaymentOrderService>();
        services.AddScoped<IUserQueryRepository, UserQueryRepository>();
        services.AddScoped<IOrderQueryRepository, OrderQueryRepository>();
        services.AddScoped<IOrderStatusService, OrderStatusService>();
        services.AddScoped<IOrderExportService, OrderExportService>();
        services.AddScoped<IProductExportService, ProductExportService>();
        services.AddScoped<IProductImportService, ProductImportService>();
        services.AddScoped<IOrderCommandService, OrderCommandService>();
        services.AddScoped<INewsQueryRepository, NewsQueryRepository>();
        services.AddScoped<INewsAdminRepository, NewsAdminRepository>();
        services.AddScoped<INewsCommentRepository, NewsCommentRepository>();
        services.AddScoped<IStatsService, StatsService>();
        services.AddScoped<IChatProductService, ChatProductService>();

        return services;
    }
}