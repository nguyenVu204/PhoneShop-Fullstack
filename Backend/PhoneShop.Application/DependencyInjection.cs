using Microsoft.Extensions.DependencyInjection;
using PhoneShop.Application.Interfaces.Services;
using PhoneShop.Application.Services;

namespace PhoneShop.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IBrandService, BrandService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<INewsCategoryService, NewsCategoryService>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<IReviewService, ReviewService>();
        services.AddScoped<ISerialNumberService, SerialNumberService>();
        services.AddScoped<IUserQueryService, UserQueryService>();
        services.AddScoped<IOrderQueryService, OrderQueryService>();
        services.AddScoped<INewsQueryService, NewsQueryService>();
        services.AddScoped<INewsAdminService, NewsAdminService>();
        services.AddScoped<INewsCommentService, NewsCommentService>();
        return services;
    }
}