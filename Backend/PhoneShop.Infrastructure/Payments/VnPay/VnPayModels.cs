namespace PhoneShop.API.Services.VnPay
{
    public class VnPayPaymentRequestModel
    {
        public int OrderId { get; set; }
        public double Amount { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class VnPayPaymentResponseModel
    {
        public bool Success { get; set; }
        public string PaymentMethod { get; set; }
        public string OrderDescription { get; set; }
        public string OrderId { get; set; }
        public string PaymentId { get; set; }
        public string TransactionId { get; set; }
        public string Token { get; set; }
        public string VnPayResponseCode { get; set; }
    }
}