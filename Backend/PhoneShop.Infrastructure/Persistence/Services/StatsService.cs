using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;
using PhoneShop.Application.Interfaces.Services;

namespace PhoneShop.Infrastructure.Persistence.Services;

public class StatsService : IStatsService
{
    private readonly AppDbContext _context;

    public StatsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<object> GetDashboardStatsAsync(string timeframe, DateTime? startDate, DateTime? endDate, int? month, int? year, CancellationToken cancellationToken = default)
    {
        var today = DateTime.Today;
        var fromDate = today.AddDays(-6);
        var toDate = today;
        var groupByMonth = false;

        if (timeframe == "month")
        {
            fromDate = new DateTime(year ?? today.Year, month ?? today.Month, 1);
            toDate = fromDate.AddMonths(1).AddDays(-1);
        }
        else if (timeframe == "year")
        {
            var selectedYear = year ?? today.Year;
            fromDate = new DateTime(selectedYear, 1, 1);
            toDate = new DateTime(selectedYear, 12, 31);
            groupByMonth = true;
        }
        else if (timeframe == "custom")
        {
            fromDate = startDate?.Date ?? today.AddDays(-6);
            toDate = endDate?.Date ?? today;
            groupByMonth = (toDate - fromDate).TotalDays > 60;
        }

        var orderQuery = _context.Orders.Where(order => order.OrderDate >= fromDate && order.OrderDate <= toDate.AddDays(1).AddTicks(-1));
        var successfulOrders = orderQuery.Where(order => order.Status != "Cancelled");
        var totalRevenue = await successfulOrders.SumAsync(order => (decimal?)order.TotalAmount, cancellationToken) ?? 0;
        var totalOrders = await orderQuery.CountAsync(cancellationToken);
        var totalProducts = await _context.ProductVariants.SumAsync(variant => (int?)variant.StockQuantity, cancellationToken) ?? 0;
        var revenueData = new List<object>();

        if (groupByMonth)
        {
            var rawData = await successfulOrders.GroupBy(order => new { order.OrderDate.Year, order.OrderDate.Month })
                .Select(group => new { group.Key.Year, group.Key.Month, Revenue = group.Sum(order => order.TotalAmount), Orders = group.Count() }).ToListAsync(cancellationToken);
            for (var date = new DateTime(fromDate.Year, fromDate.Month, 1); date <= toDate; date = date.AddMonths(1))
            {
                var data = rawData.FirstOrDefault(item => item.Year == date.Year && item.Month == date.Month);
                revenueData.Add(new { Date = $"T{date.Month}/{date.Year}", Revenue = data?.Revenue ?? 0, Orders = data?.Orders ?? 0 });
            }
        }
        else
        {
            var rawData = await successfulOrders.GroupBy(order => order.OrderDate.Date)
                .Select(group => new { Date = group.Key, Revenue = group.Sum(order => order.TotalAmount), Orders = group.Count() }).ToListAsync(cancellationToken);
            for (var date = fromDate.Date; date <= toDate.Date; date = date.AddDays(1))
            {
                var data = rawData.FirstOrDefault(item => item.Date == date);
                revenueData.Add(new { Date = date.ToString("dd/MM"), Revenue = data?.Revenue ?? 0, Orders = data?.Orders ?? 0 });
            }
        }

        var topProducts = await _context.OrderDetails.Include(detail => detail.ProductVariant).ThenInclude(variant => variant.Product)
            .Where(detail => detail.Order!.Status != "Cancelled" && detail.Order.OrderDate >= fromDate && detail.Order.OrderDate <= toDate.AddDays(1).AddTicks(-1))
            .GroupBy(detail => detail.ProductVariant!.Product!.Name).Select(group => new { Name = group.Key, Value = group.Sum(item => item.Quantity) }).OrderByDescending(item => item.Value).Take(5).ToListAsync(cancellationToken);
        var brandStats = await _context.OrderDetails.Include(detail => detail.ProductVariant).ThenInclude(variant => variant.Product).ThenInclude(product => product.Brand)
            .Where(detail => detail.Order!.Status != "Cancelled" && detail.Order.OrderDate >= fromDate && detail.Order.OrderDate <= toDate.AddDays(1).AddTicks(-1))
            .GroupBy(detail => detail.ProductVariant!.Product!.Brand!.Name).Select(group => new { Name = group.Key, Value = group.Sum(item => item.Quantity * item.UnitPrice) }).OrderByDescending(item => item.Value).ToListAsync(cancellationToken);
        var orderStatus = await orderQuery.GroupBy(order => order.Status).Select(group => new { Name = group.Key, Value = group.Count() }).ToListAsync(cancellationToken);
        var recentOrders = await orderQuery.OrderByDescending(order => order.OrderDate).Take(5).Select(order => new { order.Id, order.CustomerName, order.TotalAmount, order.Status, Date = order.OrderDate.ToString("dd/MM/yyyy HH:mm") }).ToListAsync(cancellationToken);

        return new
        {
            TotalRevenue = totalRevenue,
            TotalOrders = totalOrders,
            TotalProducts = totalProducts,
            AOV = totalOrders > 0 ? totalRevenue / totalOrders : 0,
            RevenueData = revenueData,
            TopProducts = topProducts,
            BrandStats = brandStats,
            OrderStatus = orderStatus,
            RecentOrders = recentOrders,
            TimeRange = new { From = fromDate.ToString("dd/MM/yyyy"), To = toDate.ToString("dd/MM/yyyy") }
        };
    }
}