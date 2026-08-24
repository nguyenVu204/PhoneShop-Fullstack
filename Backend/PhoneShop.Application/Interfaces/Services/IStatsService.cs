namespace PhoneShop.Application.Interfaces.Services;

public interface IStatsService
{
    Task<object> GetDashboardStatsAsync(string timeframe, DateTime? startDate, DateTime? endDate, int? month, int? year, CancellationToken cancellationToken = default);
}