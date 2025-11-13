namespace FITSKIP.Domain.DTO
{
    /// <summary>
    /// DTO để xác nhận trả lại linh kiện thừa vào kho
    /// </summary>
    public class ReturnConfirmationDto
    {
        /// <summary>
        /// Số lượng thực tế đã sử dụng
        /// </summary>
        public int? ActualQuantityUsed { get; set; }

        /// <summary>
        /// Ngày trả lại linh kiện
        /// </summary>
        public DateTime? ReturnedDate { get; set; }

        /// <summary>
        /// Tên người xác nhận trả lại (thường là nhân viên kho)
        /// </summary>
        public string? ReturnConfirmedBy { get; set; }
    }
}
