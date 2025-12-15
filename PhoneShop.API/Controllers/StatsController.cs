using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PhoneShop.API.Data;

namespace PhoneShop.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StatsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StatsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetDashboardStats([FromQuery] string timeframe = "week")
        {
            // 1. Số liệu tổng quan (Giữ nguyên)
            var totalRevenue = await _context.Orders.Where(o => o.Status != "Cancelled").SumAsync(o => o.TotalAmount);
            var totalOrders = await _context.Orders.CountAsync();
            var totalProducts = await _context.Products.CountAsync();

            // 2. Xử lý biểu đồ theo thời gian
            var today = DateTime.Today;
            object chartData = null;

            if (timeframe == "year")
            {
                // --- BÁO CÁO NĂM (Group theo 12 tháng) ---
                var thisYear = today.Year;

                // Lấy data từ DB, group theo Tháng
                var rawData = await _context.Orders
                    .Where(o => o.OrderDate.Year == thisYear && o.Status != "Cancelled")
                    .GroupBy(o => o.OrderDate.Month)
                    .Select(g => new { Month = g.Key, Revenue = g.Sum(o => o.TotalAmount) })
                    .ToListAsync();

                // Fill đầy đủ 12 tháng (Tháng nào không bán được thì Revenue = 0)
                chartData = Enumerable.Range(1, 12)
                    .Select(month => new
                    {
                        Date = $"T{month}", // Nhãn trục X: T1, T2...
                        Revenue = rawData.FirstOrDefault(r => r.Month == month)?.Revenue ?? 0
                    })
                    .ToList();
            }
            else
            {
                // --- BÁO CÁO TUẦN / THÁNG (Group theo Ngày) ---
                DateTime fromDate;
                int daysCount;

                if (timeframe == "month")
                {
                    // Lấy từ ngày 1 của tháng đến hôm nay
                    fromDate = new DateTime(today.Year, today.Month, 1);
                    daysCount = DateTime.DaysInMonth(today.Year, today.Month);
                }
                else // default: "week"
                {
                    fromDate = today.AddDays(-6);
                    daysCount = 7;
                }

                var rawData = await _context.Orders
                    .Where(o => o.OrderDate >= fromDate && o.OrderDate <= today.AddDays(1) && o.Status != "Cancelled")
                    .GroupBy(o => o.OrderDate.Date)
                    .Select(g => new { Date = g.Key, Revenue = g.Sum(o => o.TotalAmount) })
                    .ToListAsync();

                // Fill đầy đủ các ngày trong khoảng thời gian
                // Nếu là Tháng: Loop từ ngày 1 đến hết tháng (hoặc đến hôm nay)
                // Ở đây mình làm đơn giản là loop daysCount ngày

                var list = new List<object>();
                // Nếu là tháng thì loop hết số ngày trong tháng, nếu là tuần thì 7 ngày
                int loopLimit = (timeframe == "month") ? daysCount : 7;

                // Logic loop ngày hơi khác nhau xíu để hiển thị đẹp
                for (int i = 0; i < loopLimit; i++)
                {
                    DateTime date;
                    if (timeframe == "month") date = new DateTime(today.Year, today.Month, 1).AddDays(i);
                    else date = fromDate.AddDays(i);

                    // Chỉ hiện đến ngày hôm nay thôi, tương lai chưa đến thì thôi (tùy chọn)
                    if (date > today && timeframe == "month") break;

                    list.Add(new
                    {
                        Date = date.ToString("dd/MM"),
                        Revenue = rawData.FirstOrDefault(r => r.Date == date)?.Revenue ?? 0
                    });
                }
                chartData = list;
            }

            return Ok(new
            {
                TotalRevenue = totalRevenue,
                TotalOrders = totalOrders,
                TotalProducts = totalProducts,
                ChartData = chartData
            });
        }
    }
}