namespace PhoneShop.API.Dtos
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalItems { get; set; } // Tổng số bản ghi tìm thấy
        public int PageIndex { get; set; }  // Trang hiện tại
        public int PageSize { get; set; }   // Số lượng mỗi trang
        public int TotalPages => (int)Math.Ceiling((double)TotalItems / PageSize); // Tổng số trang
    }
}